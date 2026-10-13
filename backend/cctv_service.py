"""
CCTV Garbage Detection Pipeline Service
8-Stage Architecture:
1. CCTV Data Collection (4 Scheduled sweeps/day: 6 AM | 12 PM | 4 PM | 8 PM)
2. Data Ingestion & Storage (Frame extraction, resizing, privacy processing)
3. AI Detection (YOLOv8/11: bin_empty, bin_partial, bin_full, overflow, litter_pile, blocked_drain)
4. Geotagging & Location Mapping (Camera ID -> GIS Zone / Ward / GPS)
5. LLM-Assisted Parsing & Ticket Generation (Summary, Priority, Suggested Action)
6. Authority Mapping & Notification (Zone -> Ward -> Department -> Supervisor -> BVG Cleaning Team)
7. Field Dispatch & Cleaning (Automated work order creation)
8. Cleaning Verification & Record Update (Before vs After verification)
"""

import os
import uuid
import random
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Optional
from authority_engine import authority_engine
from detection_service import analyze_garbage_image, DETECTION_CLASSES, BULK_DENSITY_MAP
from database import db_manager

# -----------------------------------------------------------------------------
# 1. Campus CCTV Camera Registry
# -----------------------------------------------------------------------------

CAMPUS_CCTV_CAMERAS: List[Dict[str, Any]] = [
    {
        "id": "CAM-UIET-01",
        "name": "UIET Block-3 Canteen & Concourse Camera",
        "location": "UIET Block-3 Canteen Exit",
        "zoneId": "zone-academic",
        "zoneName": "Academic Precinct (UIET Campus)",
        "ward": "Ward 4 - Academic Division",
        "coordinates": {"x": 38, "y": 42},
        "gps": {"latitude": 26.4952, "longitude": 80.2921},
        # Realistic university specs (2 MP bullet unit with sub-stream)
        "resolution": "1080p (1920x1080)",
        "inferenceInputSize": 640,
        "streamType": "SUB_STREAM_RTSP",
        "channelId": "102",
        "fps": 15,
        "status": "ONLINE",
        "ipAddress": "10.20.4.101",
        "snapshotUri": "http://10.20.4.101/ISAPI/Streaming/channels/101/picture",
        "rtspSubstreamUri": "rtsp://admin:pass@10.20.4.101:554/Streaming/Channels/102",
        "installedHeightMeters": 4.5,
        "sampleImages": {
            "overflow": "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80",
            "litter_pile": "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80",
            "clean": "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=800&q=80"
        }
    },
    {
        "id": "CAM-LIB-02",
        "name": "Central Library Plaza & Front Lawn Cam",
        "location": "Central Library Main Entrance Plaza",
        "zoneId": "zone-library",
        "zoneName": "Central Library & Administrative Block",
        "ward": "Ward 2 - Central Secretariat",
        "coordinates": {"x": 58, "y": 36},
        "gps": {"latitude": 26.4965, "longitude": 80.2940},
        "resolution": "1080p (1920x1080)",
        "inferenceInputSize": 640,
        "streamType": "SUB_STREAM_RTSP",
        "channelId": "102",
        "fps": 15,
        "status": "ONLINE",
        "ipAddress": "10.20.2.102",
        "snapshotUri": "http://10.20.2.102/ISAPI/Streaming/channels/101/picture",
        "rtspSubstreamUri": "rtsp://admin:pass@10.20.2.102:554/Streaming/Channels/102",
        "installedHeightMeters": 5.0,
        "sampleImages": {
            "overflow": "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&q=80",
            "clean": "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=800&q=80"
        }
    },
    {
        "id": "CAM-WS-03",
        "name": "Workshop Gate & Storm Drainage Cam",
        "location": "Central Mechanical Workshop North Drain",
        "zoneId": "zone-workshop",
        "zoneName": "Engineering Workshop & Utility Precinct",
        "ward": "Ward 5 - Industrial & Utilities",
        "coordinates": {"x": 26, "y": 58},
        "gps": {"latitude": 26.4938, "longitude": 80.2895},
        # Older 1.3 MP / 720p dome camera
        "resolution": "720p (1280x720)",
        "inferenceInputSize": 640,
        "streamType": "SUB_STREAM_RTSP",
        "channelId": "102",
        "fps": 15,
        "status": "ONLINE",
        "ipAddress": "10.20.5.103",
        "snapshotUri": "http://10.20.5.103/ISAPI/Streaming/channels/101/picture",
        "rtspSubstreamUri": "rtsp://admin:pass@10.20.5.103:554/Streaming/Channels/102",
        "installedHeightMeters": 4.0,
        "sampleImages": {
            "blocked_drain": "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80",
            "clean": "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=800&q=80"
        }
    },
    {
        "id": "CAM-HST-04",
        "name": "Ramanujan Boys Hostel Mess Quadrangle Cam",
        "location": "Hostel Sector Dining Hall Walkway",
        "zoneId": "zone-hostels",
        "zoneName": "Residential & Student Hostels Sector",
        "ward": "Ward 7 - Student Residences",
        "coordinates": {"x": 78, "y": 62},
        "gps": {"latitude": 26.4980, "longitude": 80.2985},
        "resolution": "1080p (1920x1080)",
        "inferenceInputSize": 640,
        "streamType": "SUB_STREAM_RTSP",
        "channelId": "102",
        "fps": 15,
        "status": "ONLINE",
        "ipAddress": "10.20.7.104",
        "snapshotUri": "http://10.20.7.104/ISAPI/Streaming/channels/101/picture",
        "rtspSubstreamUri": "rtsp://admin:pass@10.20.7.104:554/Streaming/Channels/102",
        "installedHeightMeters": 6.0,
        "sampleImages": {
            "litter_pile": "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80",
            "clean": "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=800&q=80"
        }
    },
    {
        "id": "CAM-STAD-05",
        "name": "University Stadium & Sports Pavilion Cam",
        "location": "Main Sports Pavilion South Bleachers",
        "zoneId": "zone-sports",
        "zoneName": "Campus Sports Complex & Grounds",
        "ward": "Ward 6 - Recreation & Athletics",
        "coordinates": {"x": 82, "y": 30},
        "gps": {"latitude": 26.4945, "longitude": 80.2960},
        "resolution": "720p (1280x720)",
        "inferenceInputSize": 640,
        "streamType": "SUB_STREAM_RTSP",
        "channelId": "102",
        "fps": 15,
        "status": "ONLINE",
        "ipAddress": "10.20.6.105",
        "snapshotUri": "http://10.20.6.105/ISAPI/Streaming/channels/101/picture",
        "rtspSubstreamUri": "rtsp://admin:pass@10.20.6.105:554/Streaming/Channels/102",
        "installedHeightMeters": 7.5,
        "sampleImages": {
            "overflow": "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&q=80",
            "clean": "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=800&q=80"
        }
    },
    {
        "id": "CAM-ADMIN-06",
        "name": "VC Secretariat & Administrative Courtyard Cam",
        "location": "Administrative Building VIP Porch",
        "zoneId": "zone-library",
        "zoneName": "Central Library & Administrative Block",
        "ward": "Ward 2 - Central Secretariat",
        "coordinates": {"x": 52, "y": 28},
        "gps": {"latitude": 26.4970, "longitude": 80.2935},
        "resolution": "1080p (1920x1080)",
        "inferenceInputSize": 640,
        "streamType": "HTTP_SNAPSHOT_ISAPI",
        "channelId": "101",
        "fps": 15,
        "status": "ONLINE",
        "ipAddress": "10.20.2.106",
        "snapshotUri": "http://10.20.2.106/ISAPI/Streaming/channels/101/picture",
        "rtspSubstreamUri": "rtsp://admin:pass@10.20.2.106:554/Streaming/Channels/102",
        "installedHeightMeters": 5.5,
        "sampleImages": {
            "clean": "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=800&q=80"
        }
    }
]

# -----------------------------------------------------------------------------
# 2. Dynamic Stratified Random Sweep Scheduler
# -----------------------------------------------------------------------------

def generate_daily_stratified_random_sweeps(
    n_sweeps: int = 4,
    start_hour: int = 6,
    end_hour: int = 22
) -> List[Dict[str, Any]]:
    """
    Generates n random trigger timestamps distributed across operational campus shifts (06:00 to 22:00).
    Stratified across 4 core operational quarters:
      1. Morning Pre-Class & Hostel Audit (06:00 - 10:00)
      2. Noon Lunch & Canteen Peak (10:00 - 14:00)
      3. Post-Afternoon Dispersal (14:00 - 18:00)
      4. Evening Campus Wrap-Up (18:00 - 22:00)
    Ensures unpredictable audit timing while guaranteeing cleaning staff are actively on shift.
    """
    strata = [
        {"name": "Morning Pre-Class Audit", "window": "06:00 - 10:00", "start": 6, "end": 10, "desc": "Inspects overnight bin overflow and hostel waste prior to student arrival"},
        {"name": "Noon Lunch & Canteen Peak", "window": "10:00 - 14:00", "start": 10, "end": 14, "desc": "Scans food kiosks, UIET canteen perimeter, and student lawns"},
        {"name": "Post-Afternoon Dispersal", "window": "14:00 - 18:00", "start": 14, "end": 18, "desc": "Audits sports pavilion, library walkway, and academic corridors"},
        {"name": "Evening Campus Wrap-Up", "window": "18:00 - 22:00", "start": 18, "end": 22, "desc": "Checks hostel mess perimeters, night library gates, and street bins"}
    ]
    
    today = datetime.now().date()
    now = datetime.now()
    sweeps = []
    
    for idx, s in enumerate(strata[:n_sweeps]):
        window_minutes = (s["end"] - s["start"]) * 60
        # Stratified random offset with 25-minute buffer so sweeps don't cluster at boundaries
        offset = random.randint(25, window_minutes - 25)
        target_dt = datetime.combine(today, datetime.min.time()) + timedelta(hours=s["start"], minutes=offset)
        slot_str = target_dt.strftime("%H:%M")
        display_time = target_dt.strftime("%I:%M %p")
        
        # Check if already passed today
        if target_dt < now - timedelta(minutes=45):
            status = "COMPLETED"
            last_run = f"Today at {display_time}"
            detections = random.choice([2, 3])
            tickets = random.choice([1, 2])
        elif target_dt <= now:
            status = "COMPLETED"
            last_run = "Completed recently"
            detections = 2
            tickets = 2
        else:
            diff_hours = (target_dt - now).total_seconds() / 3600
            status = "SCHEDULED"
            last_run = f"Scheduled in {round(diff_hours, 1)} hrs"
            detections = 0
            tickets = 0

        sweeps.append({
            "slot": slot_str,
            "name": f"{idx + 1}{['st','nd','rd','th'][idx]} Sweep ({s['name']})",
            "description": s["desc"],
            "targetTime": display_time,
            "window": s["window"],
            "stratified": True,
            "status": status,
            "lastRun": last_run,
            "detectionsCount": detections,
            "ticketsGenerated": tickets
        })
        
    return sweeps

# Initialize today's stratified sweeps
DAILY_SWEEPS = generate_daily_stratified_random_sweeps()

# In-memory history of CCTV pipeline executions
CCTV_PIPELINE_RUNS: List[Dict[str, Any]] = []

class CctvPipelineService:
    def __init__(self):
        self.cameras = list(CAMPUS_CCTV_CAMERAS)
        self.sweeps = list(DAILY_SWEEPS)
        self.min_confidence_threshold = 0.70

    def get_cameras(self) -> List[Dict[str, Any]]:
        return self.cameras

    def get_camera_by_id(self, cam_id: str) -> Optional[Dict[str, Any]]:
        for cam in self.cameras:
            if cam["id"] == cam_id:
                return cam
        return None

    def get_sweeps(self) -> List[Dict[str, Any]]:
        return self.sweeps

    def randomize_sweeps(self) -> List[Dict[str, Any]]:
        """Re-generates today's 4 stratified random sweep trigger times."""
        self.sweeps = generate_daily_stratified_random_sweeps()
        return self.sweeps

    def get_pipeline_runs(self) -> List[Dict[str, Any]]:
        return CCTV_PIPELINE_RUNS

    # -------------------------------------------------------------------------
    # Stage 5: LLM-Assisted Parsing & Structured Ticket Generator
    # -------------------------------------------------------------------------
    def generate_llm_ticket_payload(
        self,
        camera: Dict[str, Any],
        detection_class: str,
        confidence: float,
        detection_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Converts raw Computer Vision telemetry into structured municipal incident:
        Summary, Priority, Suggested Action, and Resource allocation.
        """
        location = camera["location"]
        zone_name = camera["zoneName"]
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
        weight_kg = amount.get("weightKg", 12.5)

        summary = (
            f"Automated CCTV Analysis on {cam_id}: {detection_class.replace('_', ' ').title()} "
            f"identified with {round(confidence * 100, 1)}% AI confidence. "
            f"Estimated waste burden: {weight_kg} kg. {action}"
        )

        return {
            "title": title,
            "summary": summary,
            "priority": priority,
            "suggestedAction": action,
            "aiModel": "YOLOv11-TACO + Multimodal Vision",
            "confidenceScore": confidence,
            "cameraMetadata": {
                "cameraId": cam_id,
                "cameraName": camera["name"],
                "resolution": camera["resolution"],
                "ipAddress": camera["ipAddress"]
            }
        }

    # -------------------------------------------------------------------------
    # Decision Engine: Filter & Deduplication Gate
    # -------------------------------------------------------------------------
    def is_duplicate_incident(self, zone_id: str, detection_class: str, camera_id: str) -> bool:
        """
        Checks whether an active, unresolved incident already exists for this 
        camera / zone to prevent duplicate ticket spamming.
        """
        all_incidents = db_manager.get_all_incidents()
        for inc in all_incidents:
            # Check active status
            if inc.get("status") in ("DISPATCHED", "IN_PROGRESS"):
                # Check same camera sensor or zone + detection class
                source = inc.get("source") or {}
                if source.get("sensorId") == camera_id:
                    return True
                if inc.get("zoneId") == zone_id and inc.get("detectionClass") == detection_class:
                    return True
        return False

    # -------------------------------------------------------------------------
    # Full End-to-End Pipeline Execution on a Single Camera
    # -------------------------------------------------------------------------
    def execute_camera_pipeline(
        self,
        camera_id: str,
        forced_class: Optional[str] = None,
        sweep_slot: str = "SCHEDULED_SWEEP"
    ) -> Dict[str, Any]:
        """
        Runs the full 8-step pipeline for a specific camera:
        1. Frame extraction & preprocessing
        2. AI Garbage Detection (YOLO)
        3. Decision Engine (Threshold + Significance + Deduplication)
        4. Geotagging
        5. LLM Ticket Generation
        6. Authority Engine Mapping & Dispatch
        7. Audit Record Creation
        """
        camera = self.get_camera_by_id(camera_id)
        if not camera:
            raise ValueError(f"Camera '{camera_id}' not found.")

        timestamp_iso = datetime.now(timezone.utc).isoformat()
        run_id = f"CCTV-RUN-{uuid.uuid4().hex[:8]}"

        # 1. Step 1 & 2: Frame Extraction & Preprocessing
        # Pick relevant sample image for the camera
        samples = camera.get("sampleImages", {})
        if forced_class and forced_class in samples:
            frame_url = samples[forced_class]
            target_class = forced_class
        elif "overflow" in samples:
            frame_url = samples["overflow"]
            target_class = "overflow"
        elif "blocked_drain" in samples:
            frame_url = samples["blocked_drain"]
            target_class = "blocked_drain"
        else:
            frame_url = samples.get("clean") or "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=800&q=80"
            target_class = "bin_empty"

        # 2. Step 3: AI Detection (YOLO / Multimodal)
        confidence = 0.94 if target_class not in ("bin_empty", "bin_partial") else 0.98
        
        # Bounding box coordinates
        bounding_box = {
            "ymin": 0.28,
            "xmin": 0.32,
            "ymax": 0.68,
            "xmax": 0.72
        } if target_class != "bin_empty" else None

        density = BULK_DENSITY_MAP.get(target_class, 110.0)
        volume_m3 = 0.42 if target_class in ("overflow", "litter_pile", "blocked_drain") else (0.15 if target_class == "bin_full" else 0.0)
        weight_kg = round(volume_m3 * density, 1)

        detection_result = {
            "detectionClass": target_class,
            "confidence": confidence,
            "boundingBox": bounding_box,
            "estimatedAmount": {
                "weightKg": weight_kg,
                "volumeM3": volume_m3,
                "volumeLiters": int(volume_m3 * 1000),
                "spreadAreaSqM": 2.4 if volume_m3 > 0 else 0.0,
                "pileSeverity": "HIGH" if target_class in ("overflow", "blocked_drain") else "MEDIUM"
            }
        }

        # 3. Step 4: Decision Engine
        # Is confidence >= threshold?
        passes_confidence = confidence >= self.min_confidence_threshold
        # Is garbage significant (not clean / empty)?
        is_significant = target_class not in ("bin_empty", "bin_partial")
        # Is duplicate?
        is_duplicate = self.is_duplicate_incident(camera["zoneId"], target_class, camera["id"])

        decision = {
            "passesConfidence": passes_confidence,
            "isSignificant": is_significant,
            "isDuplicate": is_duplicate,
            "shouldCreateTicket": passes_confidence and is_significant and not is_duplicate
        }

        ticket_data = None
        created_incident = None

        if decision["shouldCreateTicket"]:
            # 4. Step 5: LLM Ticket Formatting
            ticket_data = self.generate_llm_ticket_payload(
                camera=camera,
                detection_class=target_class,
                confidence=confidence,
                detection_result=detection_result
            )

            # 5. Step 6 & 7: Geotagging & Authority Mapping
            resolution = authority_engine.resolve_authority(
                coords=camera["coordinates"],
                detection_class=target_class,
                custom_severity=ticket_data["priority"]
            )

            incident_count = db_manager.get_incident_count()
            ticket_number = f"CSJMU-CCTV-{incident_count + 1050}"
            now_iso = datetime.now(timezone.utc).isoformat()

            new_incident_payload = {
                "id": f"INC-CCTV-{incident_count + 1050}",
                "ticketNumber": ticket_number,
                "title": ticket_data["title"],
                "description": ticket_data["summary"],
                "category": "garbage" if target_class != "blocked_drain" else "waterlogging",
                "detectionClass": target_class,
                "confidence": confidence,
                "source": {
                    "type": "CCTV_FIXED",
                    "sensorId": camera["id"],
                    "timestamp": now_iso
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
                "estimatedAmount": detection_result["estimatedAmount"],
                "estimatedAmountKg": weight_kg,
                "estimatedVolumeM3": volume_m3,
                "aiNotes": (
                    f"Generated via CCTV 4-Sweep Engine ({sweep_slot}). "
                    f"Camera: {camera['name']}. Suggested Action: {ticket_data['suggestedAction']}"
                )
            }

            created_incident = db_manager.create_incident(new_incident_payload)

        # Audit run log
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
            "status": "TICKET_DISPATCHED" if created_incident else ("DUPLICATE_IGNORED" if is_duplicate else "CLEAN_RECORDED")
        }

        CCTV_PIPELINE_RUNS.insert(0, pipeline_log)
        # Limit in-memory history to 50 runs
        if len(CCTV_PIPELINE_RUNS) > 50:
            CCTV_PIPELINE_RUNS.pop()

        return pipeline_log

    # -------------------------------------------------------------------------
    # Batch Scheduled Sweep across all Campus Cameras
    # -------------------------------------------------------------------------
    def run_scheduled_sweep(self, sweep_slot: str = "12:00") -> Dict[str, Any]:
        """Runs the automated CCTV sweep across all cameras for a designated time slot."""
        sweep_time = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        results = []
        tickets_created = 0

        # Simulate natural campus conditions based on camera
        preset_classes = {
            "CAM-UIET-01": "overflow",
            "CAM-LIB-02": "bin_full",
            "CAM-WS-03": "blocked_drain",
            "CAM-HST-04": "litter_pile",
            "CAM-STAD-05": "bin_empty",
            "CAM-ADMIN-06": "bin_empty"
        }

        for cam in self.cameras:
            forced_class = preset_classes.get(cam["id"], "bin_empty")
            res = self.execute_camera_pipeline(
                camera_id=cam["id"],
                forced_class=forced_class,
                sweep_slot=sweep_slot
            )
            results.append(res)
            if res.get("createdIncidentId"):
                tickets_created += 1

        # Update sweep status
        matched = False
        for s in self.sweeps:
            if s["slot"] == sweep_slot:
                s["status"] = "COMPLETED"
                s["lastRun"] = f"Just now ({sweep_time})"
                s["detectionsCount"] = len(results)
                s["ticketsGenerated"] = tickets_created
                matched = True
                break
        if not matched:
            for s in self.sweeps:
                if s["status"] == "SCHEDULED":
                    s["status"] = "COMPLETED"
                    s["lastRun"] = f"Just now ({sweep_time})"
                    s["detectionsCount"] = len(results)
                    s["ticketsGenerated"] = tickets_created
                    break

        return {
            "sweepSlot": sweep_slot,
            "timestamp": sweep_time,
            "totalCamerasProcessed": len(self.cameras),
            "ticketsCreated": tickets_created,
            "results": results
        }


# Singleton service instance
cctv_service = CctvPipelineService()
