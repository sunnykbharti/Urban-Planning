"""
CCTV Garbage Detection Pipeline Service - Production Refactor
CSJMU Kanpur (UIET) Civic Operations.
8-Stage Architecture:
1. CCTV Data Collection: Stratified random sweeps across 4 shift strata (Asia/Kolkata).
2. Data Ingestion: ISAPI HTTP snapshots + RTSP sub-stream fallback via CctvFrameSource.
3. AI Detection: Real CPU ONNX Runtime model (YOLO) with tiling and ROI polygon filter.
4. Temporal Confirmation: Multi-frame burst with IoU matching to eliminate false tickets.
5. Geotagging & Location Mapping: Camera ID -> GIS Zone / Ward / Coordinates.
6. Structured Ticket Generation & Estimation: Honest weight estimation & SLA assignment.
7. Authority Mapping & Notification: AuthorityResolutionEngine dispatch.
8. Cleaning Verification: Before vs After verification on subsequent sweep.
"""

import os
import json
import uuid
import time
import logging
from pathlib import Path
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from typing import Dict, Any, List, Optional, Tuple
import yaml
import numpy as np
import cv2

from authority_engine import authority_engine
from database import db_manager, IncidentModel
from cctv_frame_source import CctvFrameSource, evaluate_frame_quality
from cctv_detector import CctvOnnxDetector, DetectionBox, calculate_iou
from cctv_scheduler import CctvSweepScheduler, KOLKATA_TZ

logger = logging.getLogger("cctv_service")
if not logger.handlers:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

BASE_DIR = Path(__file__).resolve().parent

# Load YAML configuration
CONFIG_PATH = BASE_DIR / "config.yaml"
if not CONFIG_PATH.exists():
    CONFIG_PATH = BASE_DIR / "config.yaml.example"

with open(CONFIG_PATH, "r", encoding="utf-8") as _f:
    CCTV_CONFIG = yaml.safe_load(_f)

BULK_DENSITY_MAP: Dict[str, float] = {
    "overflow": 125.0,
    "litter_pile": 110.0,
    "blocked_drain": 260.0,
    "bin_full": 140.0,
    "bin_partial": 110.0,
    "bin_empty": 0.0
}

DETECTION_CLASSES = [
    {"id": "overflow", "label": "Bin Overflow", "defaultSeverity": "HIGH"},
    {"id": "blocked_drain", "label": "Blocked Storm Drain / Canal Waste", "defaultSeverity": "CRITICAL"},
    {"id": "litter_pile", "label": "Municipal Litter Pile", "defaultSeverity": "HIGH"},
    {"id": "bin_full", "label": "Bin at 100% Capacity", "defaultSeverity": "MEDIUM"},
    {"id": "bin_partial", "label": "Bin Partially Filled (50%)", "defaultSeverity": "LOW"},
    {"id": "bin_empty", "label": "Bin Clear & Empty", "defaultSeverity": "NORMAL"}
]

# Run log persistence file
RUN_LOGS_PATH = BASE_DIR / "data" / "cctv_pipeline_runs.json"
RUN_LOGS_PATH.parent.mkdir(parents=True, exist_ok=True)


class CctvPipelineService:
    """
    Core CCTV Operations Engine for CSJMU Kanpur.
    Implements 100% of the public interface expected by Flask and Frontend.
    """

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or CCTV_CONFIG
        self.base_dir = BASE_DIR
        
        # Initialize camera registry from config
        self.cameras: List[Dict[str, Any]] = list(self.config.get("cameras", []))
        
        # Subsystems
        self.frame_source = CctvFrameSource(self.config)
        self.detector = CctvOnnxDetector(self.config, base_dir=self.base_dir)
        self.scheduler = CctvSweepScheduler(
            self.config,
            base_dir=self.base_dir,
            sweep_callback=self.run_scheduled_sweep
        )
        
        # Configuration parameters
        self.demo_mode = self.config.get("system", {}).get("demo_mode", False)
        acq_cfg = self.config.get("frame_acquisition", {})
        self.burst_size = acq_cfg.get("burst_size", 3)
        self.burst_interval = acq_cfg.get("burst_interval_seconds", 6.0)
        self.temporal_iou_thresh = acq_cfg.get("temporal_iou_threshold", 0.30)
        self.min_confirmed_frames = acq_cfg.get("min_confirmed_frames", 2)
        
        priv_cfg = self.config.get("privacy", {})
        self.ticket_expiry_hours = priv_cfg.get("ticket_expiry_hours", 48)

        # In-memory + persistent run history
        self.runs: List[Dict[str, Any]] = self._load_run_logs()

        # Start the background scheduler thread
        self.scheduler.start_scheduler_thread()
        logger.info(
            f"CctvPipelineService initialized with {len(self.cameras)} cameras. "
            f"Detector: {self.detector.model_name} (Operational={self.detector.is_operational()})"
        )

    def _load_run_logs(self) -> List[Dict[str, Any]]:
        """Loads persistent pipeline runs from disk."""
        if RUN_LOGS_PATH.exists():
            try:
                with open(RUN_LOGS_PATH, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        return data[:50]
            except Exception as e:
                logger.warning(f"Failed to load run logs from {RUN_LOGS_PATH}: {e}")
        return []

    def _save_run_logs(self):
        """Persists pipeline runs to disk."""
        try:
            with open(RUN_LOGS_PATH, "w", encoding="utf-8") as f:
                json.dump(self.runs[:50], f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save run logs: {e}")

    # -------------------------------------------------------------------------
    # Public Camera & Sweep Inspection (Preserved API)
    # -------------------------------------------------------------------------

    def get_cameras(self) -> List[Dict[str, Any]]:
        """Returns the active campus CCTV camera registry."""
        return self.cameras

    def get_camera_by_id(self, cam_id: str) -> Optional[Dict[str, Any]]:
        """Finds a single camera by identifier."""
        for cam in self.cameras:
            if cam["id"] == cam_id:
                return cam
        return None

    def get_sweeps(self) -> List[Dict[str, Any]]:
        """Returns today's 4 stratified random sweep schedules with real status."""
        return self.scheduler.get_sweeps()

    def randomize_sweeps(self) -> List[Dict[str, Any]]:
        """Dynamically recalculates today's 4 stratified random sweep times."""
        return self.scheduler.randomize_sweeps()

    def get_pipeline_runs(self) -> List[Dict[str, Any]]:
        """Returns history of recent pipeline runs."""
        return self.runs

    # -------------------------------------------------------------------------
    # Estimation & Ticket Generation
    # -------------------------------------------------------------------------

    def compute_honest_estimation(
        self,
        camera: Dict[str, Any],
        primary_class: str,
        boxes: List[DetectionBox]
    ) -> Dict[str, Any]:
        """
        Derives an honest coarse estimate from bounding box area fraction relative
        to camera ground coverage. Never emits fake precision.
        """
        if primary_class in ("bin_empty", "bin_partial") or not boxes:
            return {
                "weightKg": 0.0,
                "volumeM3": 0.0,
                "volumeLiters": 0,
                "spreadAreaSqM": 0.0,
                "pileSeverity": "LOW",
                "rough_estimate": True,
                "estimationMethod": "visual_bounding_box_ground_coverage"
            }

        # Sum of normalized bounding box areas
        total_bbox_area_ratio = sum(
            max(0.0, (b.xmax - b.xmin) * (b.ymax - b.ymin))
            for b in boxes
        )
        total_bbox_area_ratio = min(1.0, total_bbox_area_ratio)

        # Ground area estimated via installed height and metersPerPixel
        height_m = camera.get("installedHeightMeters", 5.0)
        m_per_px = camera.get("metersPerPixel", 0.008)
        
        # Effective field of view footprint on ground (approximate trapezoid/rectangle)
        ground_fov_area = (1920 * m_per_px) * (1080 * m_per_px) * (height_m / 4.5)
        ground_fov_area = max(10.0, min(120.0, ground_fov_area))

        spread_area_sqm = round(total_bbox_area_ratio * ground_fov_area, 2)
        spread_area_sqm = max(0.5, spread_area_sqm)

        # Estimated pile depth (m) based on class
        depth_map = {
            "overflow": 0.25,
            "blocked_drain": 0.35,
            "litter_pile": 0.15,
            "bin_full": 0.40
        }
        depth_m = depth_map.get(primary_class, 0.20)
        volume_m3 = round(spread_area_sqm * depth_m * 0.65, 3)
        volume_m3 = max(0.05, min(2.5, volume_m3))
        volume_liters = int(volume_m3 * 1000)

        density = BULK_DENSITY_MAP.get(primary_class, 110.0)
        weight_kg = round(volume_m3 * density, 1)

        pile_severity = "CRITICAL" if primary_class == "blocked_drain" else (
            "HIGH" if primary_class == "overflow" or weight_kg > 20 else "MEDIUM"
        )

        return {
            "weightKg": weight_kg,
            "volumeM3": volume_m3,
            "volumeLiters": volume_liters,
            "spreadAreaSqM": spread_area_sqm,
            "pileSeverity": pile_severity,
            "rough_estimate": True,
            "estimationMethod": "visual_bounding_box_ground_coverage"
        }

    def generate_llm_ticket_payload(
        self,
        camera: Dict[str, Any],
        detection_class: str,
        confidence: float,
        detection_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Converts raw vision detections into a structured civic municipal incident."""
        location = camera["location"]
        cam_id = camera["id"]

        class_titles = {
            "overflow": f"Overflowing Waste Receptacle at {location}",
            "litter_pile": f"Uncontained Plastic & Food Litter Heap at {location}",
            "blocked_drain": f"Blocked Drainage Grate & Silt Stagnation at {location}",
            "bin_full": f"Full Municipal Bin (100% Capacity) at {location}",
            "bin_partial": f"Normal Bin Accumulation at {location}",
            "bin_empty": f"Clean & Sanitary Zone at {location}"
        }

        priorities = {
            "blocked_drain": "CRITICAL",
            "overflow": "HIGH",
            "litter_pile": "HIGH",
            "bin_full": "MEDIUM",
            "bin_partial": "LOW",
            "bin_empty": "NORMAL"
        }

        suggested_actions = {
            "overflow": "Dispatch 2-person BVG team with 240L wheelbarrow cart within 45 minutes. Bag and wash surrounding perimeter.",
            "litter_pile": "Dispatch 2-person manual sweeping squad with litter pickers and heavy-duty polythene bags.",
            "blocked_drain": "Urgent: Deploy desilting team with rods and suction pump to clear storm grate before backflow occurs.",
            "bin_full": "Schedule routine compactor truck pickup during next beat round (within 90 minutes)."
        }

        title = class_titles.get(detection_class, f"CCTV Detected {detection_class} at {location}")
        priority = priorities.get(detection_class, "MEDIUM")
        action = suggested_actions.get(
            detection_class,
            "Dispatch local beat crew to inspect and clear identified solid waste."
        )

        amount = detection_result.get("estimatedAmount") or {}
        weight_kg = amount.get("weightKg", 10.0)

        model_label = (
            f"{self.detector.model_name} ({self.detector.model_version})"
            if not detection_result.get("simulated")
            else "SIMULATED_DEMO_ENGINE"
        )

        summary = (
            f"Automated CCTV Analysis on {cam_id}: {detection_class.replace('_', ' ').title()} "
            f"identified with {round(confidence * 100, 1)}% AI confidence. "
            f"Estimated waste burden: ~{weight_kg} kg (visual estimate). {action}"
        )

        return {
            "title": title,
            "summary": summary,
            "priority": priority,
            "suggestedAction": action,
            "aiModel": model_label,
            "confidenceScore": confidence,
            "cameraMetadata": {
                "cameraId": cam_id,
                "cameraName": camera["name"],
                "resolution": camera["resolution"],
                "ipAddress": camera["ipAddress"]
            }
        }

    # -------------------------------------------------------------------------
    # Decision Engine: Expiry & Deduplication Gate
    # -------------------------------------------------------------------------

    def is_duplicate_incident(self, zone_id: str, detection_class: str, camera_id: str) -> bool:
        """
        Deduplication gate:
        - Duplicate = same camera sensor AND same detection class (or same zone + same class)
        - Incident must be ACTIVE (DISPATCHED or IN_PROGRESS)
        - Old incidents older than ticket_expiry_hours are ignored to prevent blocking cameras indefinitely.
        """
        now = datetime.now(KOLKATA_TZ)
        cutoff = now - timedelta(hours=self.ticket_expiry_hours)

        try:
            with db_manager.get_session() as session:
                query = session.query(IncidentModel).filter(
                    IncidentModel.status.in_(["DISPATCHED", "IN_PROGRESS"])
                )
                active_records = query.all()

                for inc in active_records:
                    # Check incident age / expiry
                    try:
                        inc_dt = datetime.fromisoformat(inc.created_at.replace("Z", "+00:00")).astimezone(KOLKATA_TZ)
                        if inc_dt < cutoff:
                            # Expired open ticket - do not let it block new audits
                            continue
                    except Exception:
                        pass

                    source = inc.source_data or {}
                    # Match camera AND class
                    if source.get("sensorId") == camera_id and inc.detection_class == detection_class:
                        return True
                    # Match zone AND class
                    if inc.zone_id == zone_id and inc.detection_class == detection_class:
                        return True
        except Exception as e:
            logger.error(f"Error querying active incidents in deduplication: {e}")

        return False

    def check_and_update_stage8_verification(
        self,
        camera_id: str,
        frame_url: str,
        current_detected_class: str
    ) -> Optional[str]:
        """
        Stage 8 (Before vs After Verification):
        Checks if an incident for this camera was recently marked RESOLVED.
        Stores the new frame as afterImageUrl.
        If the same waste class is STILL detected, reopens the ticket as IN_PROGRESS.
        Returns status message if verified or reopened.
        """
        try:
            with db_manager.get_session() as session:
                recent_resolved = session.query(IncidentModel).filter(
                    IncidentModel.status == "RESOLVED"
                ).order_by(IncidentModel.resolved_at.desc()).first()

                if not recent_resolved:
                    return None

                source = recent_resolved.source_data or {}
                if source.get("sensorId") != camera_id:
                    return None

                # Attach after-cleaning verification frame
                recent_resolved.after_image_url = frame_url

                if current_detected_class == recent_resolved.detection_class and current_detected_class != "bin_empty":
                    # Reopen ticket: cleaning was incomplete or failed
                    recent_resolved.status = "IN_PROGRESS"
                    recent_resolved.verification_status = "REOPENED_CLEANUP_FAILED"
                    recent_resolved.ai_notes = (
                        f"{recent_resolved.ai_notes or ''} | [Stage 8 Sweep Verification]: "
                        f"Reopened! Hazard '{current_detected_class}' still detected in verification sweep."
                    )
                    session.commit()
                    logger.warning(
                        f"Ticket {recent_resolved.ticket_number} REOPENED: Waste still present at {camera_id}"
                    )
                    return f"REOPENED_UNCLEAN:{recent_resolved.ticket_number}"
                else:
                    recent_resolved.verification_status = "VERIFIED_CLEAN"
                    session.commit()
                    return f"VERIFIED_CLEAN:{recent_resolved.ticket_number}"
        except Exception as e:
            logger.error(f"Stage 8 verification error: {e}")
            return None

    # -------------------------------------------------------------------------
    # Core Pipeline Execution on Single Camera
    # -------------------------------------------------------------------------

    def execute_camera_pipeline(
        self,
        camera_id: str,
        forced_class: Optional[str] = None,
        sweep_slot: str = "SCHEDULED_SWEEP"
    ) -> Dict[str, Any]:
        """
        Runs the full 8-step pipeline for a specific camera:
        1. Frame extraction via FrameSource (with burst & quality filter)
        2. Real AI Detection (ONNX Runtime CPU with tiling and ROI)
        3. Temporal Confirmation across burst frames
        4. Deduplication & Significance Gate
        5. Geotagging & Honest Estimation
        6. Authority Engine Mapping & Dispatch
        7. Stage 8 Verification Update
        8. Audit Record Creation
        """
        camera = self.get_camera_by_id(camera_id)
        if not camera:
            raise ValueError(f"Camera '{camera_id}' not found.")

        now_kolkata = datetime.now(KOLKATA_TZ)
        timestamp_iso = now_kolkata.isoformat()
        run_id = f"CCTV-RUN-{uuid.uuid4().hex[:8]}"

        # Step 1: Real Frame Acquisition with Temporal Burst
        is_simulated = False
        captured_frame = None
        frame_url = None
        quality_eval = None
        burst_records: List[Dict[str, Any]] = []

        # Check if forced_class was supplied or in demo_mode
        if forced_class or self.demo_mode or not self.detector.is_operational():
            is_simulated = True
            target_class = forced_class or "overflow"
            samples = camera.get("sampleImages", {})
            frame_url = samples.get(target_class) or samples.get("clean") or "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=800&q=80"
            
            # Dummy quality result
            quality_eval = evaluate_frame_quality(np.full((480, 640, 3), 120, dtype=np.uint8))
            quality_eval.is_valid = True
            
            # Simulated detection box
            det_boxes = [DetectionBox(0.28, 0.32, 0.68, 0.72, 0.94, target_class, target_class.replace("_", " ").title())] if target_class != "bin_empty" else []
            primary_class = target_class
            primary_conf = 0.94 if target_class != "bin_empty" else 0.98
            inf_time_ms = 12.0
            confirmed_in_burst = True
            burst_count = 3
        else:
            # REAL HARDWARE ACQUISITION
            burst = self.frame_source.acquire_burst(
                camera,
                burst_size=self.burst_size,
                interval_seconds=self.burst_interval
            )

            if not burst:
                camera["status"] = "OFFLINE"
                logger.error(f"Camera [{camera_id}] failed acquisition on all burst frames.")
                pipeline_log = {
                    "runId": run_id,
                    "timestamp": timestamp_iso,
                    "sweepSlot": sweep_slot,
                    "camera": {"id": camera["id"], "name": camera["name"], "location": camera["location"], "zone": camera["zoneName"]},
                    "frameUrl": None,
                    "detection": {"detectionClass": "unknown", "confidence": 0.0, "boundingBox": None, "estimatedAmount": {}, "simulated": False},
                    "decision": {"passesConfidence": False, "isSignificant": False, "isDuplicate": False, "shouldCreateTicket": False, "qualityPassed": False},
                    "ticket": None,
                    "createdIncidentId": None,
                    "ticketNumber": None,
                    "status": "OFFLINE_UNREACHABLE"
                }
                self.runs.insert(0, pipeline_log)
                self._save_run_logs()
                return pipeline_log

            camera["status"] = "ONLINE"
            captured_frame, quality_eval, method, _ = burst[0]

            # Step 2 & 3: Run real ONNX detection on each burst frame for Temporal Confirmation
            burst_detections: List[Tuple[List[DetectionBox], str, float]] = []
            for (b_frame, b_qual, b_method, _) in burst:
                b_boxes, b_class, b_conf, b_inf_ms = self.detector.detect_in_frame(b_frame, camera)
                burst_detections.append((b_boxes, b_class, b_conf))

            # Primary frame detection
            det_boxes, primary_class, primary_conf, inf_time_ms = burst_detections[0]

            # Step 4: Temporal Confirmation matching
            # Confirmed if primary_class appears in >= min_confirmed_frames with similar location
            matching_frames_count = 0
            for (b_boxes, b_class, b_conf) in burst_detections:
                if b_class == primary_class:
                    if primary_class == "bin_empty":
                        matching_frames_count += 1
                    else:
                        # Check IoU match with primary frame box
                        if det_boxes and b_boxes:
                            if any(calculate_iou(det_boxes[0], b_box) >= self.temporal_iou_thresh for b_box in b_boxes):
                                matching_frames_count += 1
                        else:
                            matching_frames_count += 1

            confirmed_in_burst = (matching_frames_count >= self.min_confirmed_frames)
            burst_count = matching_frames_count

            # Privacy Face Anonymization & Annotation
            annotated_frame = self.detector.anonymize_and_annotate(captured_frame, det_boxes)
            frame_url = self.detector.save_capture_evidence(
                annotated_frame,
                camera["id"],
                primary_class,
                timestamp_iso
            )

        # Step 5: Honest Amount Estimation
        est_amount = self.compute_honest_estimation(camera, primary_class, det_boxes)
        top_box_dict = det_boxes[0].to_dict() if det_boxes else None

        detection_result = {
            "detectionClass": primary_class,
            "confidence": primary_conf,
            "boundingBox": top_box_dict,
            "allBoxes": [b.to_dict() for b in det_boxes],
            "estimatedAmount": est_amount,
            "simulated": is_simulated,
            "modelName": self.detector.model_name if not is_simulated else "SIMULATED_DEMO_ENGINE",
            "modelVersion": self.detector.model_version if not is_simulated else "v0.0",
            "inferenceTimeMs": inf_time_ms,
            "temporalConfirmation": {
                "burstSize": self.burst_size,
                "matchingFrames": burst_count,
                "isConfirmed": confirmed_in_burst
            }
        }

        # Step 6: Decision Gate
        min_thresh = self.detector.confidence_thresholds.get(primary_class, 0.50)
        passes_confidence = primary_conf >= min_thresh
        is_significant = primary_class not in ("bin_empty", "bin_partial")
        is_duplicate = self.is_duplicate_incident(camera["zoneId"], primary_class, camera["id"])
        quality_passed = quality_eval.is_valid if quality_eval else True

        # Only create ticket if real/simulated, quality passed, confirmed in burst, significant, and not duplicate
        should_create = (
            quality_passed and passes_confidence and is_significant and 
            confirmed_in_burst and not is_duplicate
        )

        decision = {
            "passesConfidence": passes_confidence,
            "isSignificant": is_significant,
            "isDuplicate": is_duplicate,
            "temporalConfirmed": confirmed_in_burst,
            "qualityPassed": quality_passed,
            "qualityReason": quality_eval.reason if quality_eval else None,
            "shouldCreateTicket": should_create
        }

        ticket_data = None
        created_incident = None

        if should_create:
            # Step 7: Authority Resolution & Incident Creation
            ticket_data = self.generate_llm_ticket_payload(
                camera=camera,
                detection_class=primary_class,
                confidence=primary_conf,
                detection_result=detection_result
            )

            resolution = authority_engine.resolve_authority(
                coords=camera["coordinates"],
                gps=camera.get("gps"),
                detection_class=primary_class,
                custom_severity=ticket_data["priority"]
            )

            incident_count = db_manager.get_incident_count()
            ticket_number = f"CSJMU-CCTV-{incident_count + 1050}"
            now_iso = now_kolkata.isoformat()

            new_incident_payload = {
                "id": f"INC-CCTV-{incident_count + 1050}",
                "ticketNumber": ticket_number,
                "title": ticket_data["title"],
                "description": ticket_data["summary"],
                "category": "garbage" if primary_class != "blocked_drain" else "waterlogging",
                "detectionClass": primary_class,
                "confidence": primary_conf,
                "source": {
                    "type": "CCTV_FIXED",
                    "sensorId": camera["id"],
                    "timestamp": now_iso,
                    "simulated": is_simulated
                },
                "coordinates": camera["coordinates"],
                "gps": camera["gps"],
                "location": camera["location"],
                "zoneId": resolution["zoneId"],
                "zoneName": resolution["zoneName"],
                "ward": resolution["ward"],
                "authority": resolution["authority"],
                "department": resolution["department"],
                "supervisor": resolution["supervisor"],
                "assignedTeam": resolution["assignedTeam"],
                "severity": ticket_data["priority"],
                "status": "DISPATCHED",
                "slaMinutes": resolution["slaMinutes"],
                "createdAt": now_iso,
                "deadlineAt": resolution["deadlineAt"],
                "resolvedAt": None,
                "responseDurationMinutes": None,
                "imageUrl": frame_url,
                "beforeImageUrl": frame_url,
                "afterImageUrl": None,
                "verificationStatus": "DISPATCHED_TO_BEAT",
                "garbageDetection": detection_result,
                "estimatedAmount": est_amount,
                "estimatedAmountKg": est_amount["weightKg"],
                "estimatedVolumeM3": est_amount["volumeM3"],
                "aiNotes": (
                    f"Generated via CCTV 4-Sweep Engine ({sweep_slot}). "
                    f"Camera: {camera['name']}. Confirmed in {burst_count}/{self.burst_size} frames. "
                    f"Suggested Action: {ticket_data['suggestedAction']}"
                )
            }

            created_incident = db_manager.create_incident(new_incident_payload)

        # Step 8: Check for Before/After verification on recently resolved tickets
        stage8_status = self.check_and_update_stage8_verification(camera["id"], frame_url, primary_class)

        # Status determination for run log
        if not quality_passed:
            run_status = "QUALITY_REJECTED"
        elif stage8_status and "REOPENED_UNCLEAN" in stage8_status:
            run_status = "REOPENED_UNCLEAN"
        elif created_incident:
            run_status = "TICKET_DISPATCHED"
        elif is_duplicate:
            run_status = "DUPLICATE_IGNORED"
        else:
            run_status = "CLEAN_RECORDED"

        pipeline_log = {
            "runId": run_id,
            "timestamp": timestamp_iso,
            "sweepSlot": sweep_slot,
            "camera": {
                "id": camera["id"],
                "name": camera["name"],
                "location": camera["location"],
                "zone": camera["zoneName"]
            },
            "frameUrl": frame_url,
            "detection": detection_result,
            "decision": decision,
            "ticket": ticket_data,
            "createdIncidentId": created_incident.get("id") if created_incident else None,
            "ticketNumber": created_incident.get("ticketNumber") if created_incident else None,
            "status": run_status
        }

        self.runs.insert(0, pipeline_log)
        if len(self.runs) > 50:
            self.runs = self.runs[:50]
        self._save_run_logs()

        return pipeline_log

    # -------------------------------------------------------------------------
    # Batch Scheduled Sweep across all Campus Cameras
    # -------------------------------------------------------------------------

    def run_scheduled_sweep(self, sweep_slot: str = "12:00") -> Dict[str, Any]:
        """Runs the automated CCTV sweep across all campus cameras."""
        sweep_time = datetime.now(KOLKATA_TZ).strftime("%Y-%m-%d %H:%M:%S IST")
        results = []
        tickets_created = 0

        # Optional preset classes if running in demo_mode
        preset_classes = {
            "CAM-UIET-01": "overflow",
            "CAM-LIB-02": "bin_full",
            "CAM-WS-03": "blocked_drain",
            "CAM-HST-04": "litter_pile",
            "CAM-STAD-05": "bin_empty",
            "CAM-ADMIN-06": "bin_empty"
        }

        for cam in self.cameras:
            forced_class = preset_classes.get(cam["id"]) if self.demo_mode else None
            try:
                res = self.execute_camera_pipeline(
                    camera_id=cam["id"],
                    forced_class=forced_class,
                    sweep_slot=sweep_slot
                )
                results.append(res)
                if res.get("createdIncidentId"):
                    tickets_created += 1
            except Exception as e:
                logger.error(f"Error processing camera {cam.get('id')}: {e}")

        # Update scheduler state with real telemetry
        self.scheduler.mark_sweep_completed(sweep_slot, len(results), tickets_created)

        return {
            "sweepSlot": sweep_slot,
            "timestamp": sweep_time,
            "totalCamerasProcessed": len(self.cameras),
            "ticketsCreated": tickets_created,
            "results": results
        }


# Singleton service instance
cctv_service = CctvPipelineService()
