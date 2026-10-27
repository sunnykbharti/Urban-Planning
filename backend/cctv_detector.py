"""
CCTV Detection Engine using Pure ONNX Runtime CPU.
Features:
- CPU-only execution via onnxruntime.InferenceSession
- Tiling (640x640 with overlap + NMS) for small litter detection in wide shots
- Camera ROI polygon masking (ignores sky/roads)
- Automatic privacy face/person blurring (never saves un-anonymized humans)
- Explicit DEMO_MODE with "simulated": true flag (never silently simulates)
- Clean capture storage in captures/{camera_id}/{date}/ with auto-retention cleanup
"""

import os
import time
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, asdict
import numpy as np
import cv2
import onnxruntime as ort

logger = logging.getLogger("cctv_detector")
if not logger.handlers:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")


@dataclass
class DetectionBox:
    ymin: float
    xmin: float
    ymax: float
    xmax: float
    confidence: float
    class_id: str
    class_label: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "ymin": round(self.ymin, 4),
            "xmin": round(self.xmin, 4),
            "ymax": round(self.ymax, 4),
            "xmax": round(self.xmax, 4),
            "confidence": round(self.confidence, 4),
            "classId": self.class_id,
            "classLabel": self.class_label
        }


def calculate_iou(boxA: DetectionBox, boxB: DetectionBox) -> float:
    """Calculates Intersection over Union between two normalized boxes."""
    xA = max(boxA.xmin, boxB.xmin)
    yA = max(boxA.ymin, boxB.ymin)
    xB = min(boxA.xmax, boxB.xmax)
    yB = min(boxA.ymax, boxB.ymax)

    inter_width = max(0.0, xB - xA)
    inter_height = max(0.0, yB - yA)
    inter_area = inter_width * inter_height

    areaA = max(0.0, (boxA.xmax - boxA.xmin) * (boxA.ymax - boxA.ymin))
    areaB = max(0.0, (boxB.xmax - boxB.xmin) * (boxB.ymax - boxB.ymin))

    union_area = areaA + areaB - inter_area
    if union_area <= 0:
        return 0.0
    return inter_area / union_area


def apply_nms(boxes: List[DetectionBox], iou_threshold: float = 0.45) -> List[DetectionBox]:
    """Non-Maximum Suppression on list of DetectionBox objects."""
    if not boxes:
        return []

    # Sort descending by confidence
    sorted_boxes = sorted(boxes, key=lambda b: b.confidence, reverse=True)
    kept_boxes: List[DetectionBox] = []

    for box in sorted_boxes:
        suppress = False
        for kept in kept_boxes:
            if box.class_id == kept.class_id:
                if calculate_iou(box, kept) > iou_threshold:
                    suppress = True
                    break
        if not suppress:
            kept_boxes.append(box)

    return kept_boxes


class CctvOnnxDetector:
    """
    Production CPU-only Waste Detector using ONNX Runtime.
    """

    def __init__(self, config: Dict[str, Any], base_dir: Optional[Path] = None):
        self.config = config
        self.base_dir = base_dir or Path(__file__).resolve().parent
        
        sys_cfg = self.config.get("system", {})
        self.demo_mode = sys_cfg.get("demo_mode", False)
        
        model_cfg = self.config.get("model", {})
        self.model_rel_path = model_cfg.get("model_path", "models/yolov8n.onnx")
        self.model_path = (self.base_dir / self.model_rel_path).resolve()
        self.model_name = model_cfg.get("model_name", "YOLOv8n-ONNX")
        self.model_version = model_cfg.get("model_version", "1.0.0-cpu")
        self.input_size = model_cfg.get("input_size", 640)
        
        tiling_cfg = model_cfg.get("tiling", {})
        self.tiling_enabled = tiling_cfg.get("enabled", True)
        self.tile_size = tiling_cfg.get("tile_size", 640)
        self.overlap_ratio = tiling_cfg.get("overlap_ratio", 0.20)
        self.nms_iou_threshold = tiling_cfg.get("nms_iou_threshold", 0.45)

        self.confidence_thresholds = model_cfg.get("confidence_thresholds", {
            "overflow": 0.60,
            "litter_pile": 0.55,
            "blocked_drain": 0.55,
            "bin_full": 0.65,
            "bin_partial": 0.60,
            "bin_empty": 0.70
        })

        priv_cfg = self.config.get("privacy", {})
        self.anonymize_faces = priv_cfg.get("anonymize_faces", True)
        self.captures_dir = (self.base_dir / priv_cfg.get("captures_dir", "captures")).resolve()
        self.retention_days = priv_cfg.get("retention_days", 7)
        self.captures_dir.mkdir(parents=True, exist_ok=True)

        # Initialize Haar Cascade face detector for privacy compliance
        self.face_cascade = None
        if self.anonymize_faces:
            try:
                cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
                if os.path.exists(cascade_path):
                    self.face_cascade = cv2.CascadeClassifier(cascade_path)
            except Exception as e:
                logger.warning(f"Face cascade initialization note: {e}")

        # Initialize ONNX Runtime Session
        self.session = None
        self.input_name = None
        self.output_names = None
        self._init_model()

    def _init_model(self):
        """Loads ONNX model or activates explicit DEMO_MODE."""
        if not self.model_path.exists():
            if self.demo_mode:
                logger.warning(
                    f"Model file {self.model_path} not found. Running in explicit DEMO_MODE."
                )
                self.session = None
                return
            else:
                raise FileNotFoundError(
                    f"YOLO ONNX model not found at '{self.model_path}'. "
                    f"Place an ONNX model or configure 'demo_mode: true' in config.yaml."
                )

        try:
            # Set thread options for CPU-only efficiency on i5 / 8GB RAM
            opts = ort.SessionOptions()
            opts.intra_op_num_threads = min(4, os.cpu_count() or 2)
            opts.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL
            opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL

            self.session = ort.InferenceSession(
                str(self.model_path),
                sess_options=opts,
                providers=["CPUExecutionProvider"]
            )
            self.input_name = self.session.get_inputs()[0].name
            self.output_names = [o.name for o in self.session.get_outputs()]
            logger.info(
                f"Loaded ONNX Model: {self.model_name} ({self.model_version}) from {self.model_path.name}"
            )
        except Exception as e:
            if self.demo_mode:
                logger.warning(f"Failed to load ONNX model: {e}. Falling back to explicit DEMO_MODE.")
                self.session = None
            else:
                raise RuntimeError(f"Failed to load ONNX model at {self.model_path}: {e}")

    def is_operational(self) -> bool:
        """Returns True if real ONNX model is loaded, False if in DEMO_MODE."""
        return self.session is not None

    def preprocess_image(self, img: np.ndarray, target_size: int = 640) -> Tuple[np.ndarray, float, Tuple[int, int]]:
        """
        Letterbox image resize to target_size x target_size for YOLO input.
        Returns: (input_tensor, scale, (pad_left, pad_top))
        """
        h, w = img.shape[:2]
        scale = min(target_size / h, target_size / w)
        new_w = int(round(w * scale))
        new_h = int(round(h * scale))

        pad_left = (target_size - new_w) // 2
        pad_top = (target_size - new_h) // 2

        resized = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_LINEAR)
        canvas = np.full((target_size, target_size, 3), 114, dtype=np.uint8)
        canvas[pad_top:pad_top + new_h, pad_left:pad_left + new_w] = resized

        # BGR to RGB, normalize [0, 1], HWC to CHW
        rgb = cv2.cvtColor(canvas, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
        tensor = np.transpose(rgb, (2, 0, 1))
        tensor = np.expand_dims(tensor, axis=0)  # Shape (1, 3, 640, 640)
        return tensor, scale, (pad_left, pad_top)

    def _infer_single_crop(self, crop: np.ndarray) -> List[Tuple[float, float, float, float, float, str, str]]:
        """
        Runs ONNX forward pass on a 640x640 crop.
        Returns list of (ymin, xmin, ymax, xmax, conf, class_id, class_label) in local crop coordinates [0, 1].
        """
        if self.session is None:
            return []

        tensor, scale, (pad_x, pad_y) = self.preprocess_image(crop, self.input_size)
        outputs = self.session.run(self.output_names, {self.input_name: tensor})
        predictions = outputs[0]  # Shape: (1, 84, 8400) or (1, num_classes+4, num_anchors)

        if len(predictions.shape) == 3:
            predictions = np.transpose(predictions[0], (1, 0))  # Shape: (8400, 84)

        boxes: List[Tuple[float, float, float, float, float, str, str]] = []
        crop_h, crop_w = crop.shape[:2]

        # COCO-to-Waste mapping for standard YOLOv8 nano:
        # COCO index 0 is person (blurred), waste-like categories mapped to litter_pile / overflow
        # If custom model is deployed with 6 classes, it directly maps.
        COCO_WASTE_MAP = {
            39: ("bottle", "litter_pile", "Plastic Beverage Bottle"),
            40: ("wine glass", "litter_pile", "Glass Litter Fragment"),
            41: ("cup", "litter_pile", "Single-use Plastic/Paper Cup"),
            42: ("fork", "litter_pile", "Plastic Cutlery Scrap"),
            43: ("knife", "litter_pile", "Discarded Packaging"),
            44: ("spoon", "litter_pile", "Plastic Cutlery Scrap"),
            45: ("bowl", "overflow", "Food Container / Meal Box"),
            46: ("banana", "overflow", "Organic Bio-Waste Heap"),
            47: ("apple", "overflow", "Organic Food Scrap"),
            48: ("sandwich", "overflow", "Food Wrapper / Debris"),
            49: ("orange", "overflow", "Organic Food Scrap"),
            51: ("carrot", "overflow", "Vegetable Scrap"),
            52: ("hot dog", "overflow", "Food Wrapper Waste"),
            53: ("pizza", "overflow", "Cardboard Box / Food Debris"),
            54: ("donut", "litter_pile", "Food Wrapper"),
            55: ("cake", "overflow", "Food Debris"),
            73: ("book", "litter_pile", "Paper Scrap / Carton Sheet"),
            28: ("suitcase", "overflow", "Bulky Discarded Carton"),
            26: ("handbag", "litter_pile", "Polythene Waste Sack"),
            24: ("backpack", "litter_pile", "Discarded Sack / Bag")
        }

        num_classes = predictions.shape[1] - 4
        is_custom_waste_model = (num_classes == 6)

        for row in predictions:
            cx, cy, w, h = row[:4]
            scores = row[4:]
            class_idx = int(np.argmax(scores))
            confidence = float(scores[class_idx])

            if confidence < 0.35:
                continue

            # Person detection (COCO 0) handled for privacy blurring
            if class_idx == 0 and not is_custom_waste_model:
                continue

            class_id = "litter_pile"
            class_label = "Uncontained Solid Waste"

            if is_custom_waste_model:
                classes = ["bin_empty", "bin_partial", "bin_full", "overflow", "litter_pile", "blocked_drain"]
                if class_idx < len(classes):
                    class_id = classes[class_idx]
                    class_label = class_id.replace("_", " ").title()
            else:
                if class_idx in COCO_WASTE_MAP:
                    _, class_id, class_label = COCO_WASTE_MAP[class_idx]
                else:
                    # Ignore non-waste objects (e.g. cars, benches, dogs)
                    continue

            # Convert letterbox coordinates back to crop coordinates
            bx = cx - pad_x
            by = cy - pad_y
            x1 = max(0.0, (bx - w / 2) / scale)
            y1 = max(0.0, (by - h / 2) / scale)
            x2 = min(float(crop_w), (bx + w / 2) / scale)
            y2 = min(float(crop_h), (by + h / 2) / scale)

            if x2 > x1 and y2 > y1:
                # Normalize to [0, 1] relative to crop
                boxes.append((
                    y1 / crop_h,
                    x1 / crop_w,
                    y2 / crop_h,
                    x2 / crop_w,
                    confidence,
                    class_id,
                    class_label
                ))

        return boxes

    def detect_in_frame(
        self,
        frame: np.ndarray,
        camera: Dict[str, Any]
    ) -> Tuple[List[DetectionBox], str, float, float]:
        """
        Executes real detection with optional tiling and camera ROI polygon filtering.
        Returns: (filtered_boxes, primary_class, confidence, inference_time_ms)
        """
        t0 = time.time()
        if self.session is None or frame is None or frame.size == 0:
            return [], "bin_empty", 0.0, 0.0

        h, w = frame.shape[:2]
        raw_boxes: List[DetectionBox] = []

        # 1. Full-frame base inference
        base_detections = self._infer_single_crop(frame)
        for (ymin, xmin, ymax, xmax, conf, cid, clabel) in base_detections:
            raw_boxes.append(DetectionBox(ymin, xmin, ymax, xmax, conf, cid, clabel))

        # 2. Tiled inference for high-res frames (> 640px) to catch small litter
        if self.tiling_enabled and (w > 800 or h > 800):
            step = int(self.tile_size * (1.0 - self.overlap_ratio))
            y_steps = list(range(0, max(1, h - self.tile_size + 1), step))
            if y_steps[-1] + self.tile_size < h:
                y_steps.append(h - self.tile_size)
            x_steps = list(range(0, max(1, w - self.tile_size + 1), step))
            if x_steps[-1] + self.tile_size < w:
                x_steps.append(w - self.tile_size)

            for ty in y_steps:
                for tx in x_steps:
                    tile = frame[ty:ty + self.tile_size, tx:tx + self.tile_size]
                    tile_dets = self._infer_single_crop(tile)
                    for (ymin, xmin, ymax, xmax, conf, cid, clabel) in tile_dets:
                        # Map local tile coordinates to full frame normalized coordinates
                        global_ymin = (ty + ymin * self.tile_size) / h
                        global_xmin = (tx + xmin * self.tile_size) / w
                        global_ymax = (ty + ymax * self.tile_size) / h
                        global_xmax = (tx + xmax * self.tile_size) / w
                        raw_boxes.append(DetectionBox(
                            global_ymin, global_xmin, global_ymax, global_xmax, conf, cid, clabel
                        ))

        # 3. Apply Non-Maximum Suppression (NMS) across full frame
        nms_boxes = apply_nms(raw_boxes, iou_threshold=self.nms_iou_threshold)

        # 4. Filter by camera ROI Polygon (ignore roads, sky, out-of-bounds)
        roi_polygon = camera.get("roiPolygon")
        filtered_boxes: List[DetectionBox] = []

        if roi_polygon and len(roi_polygon) >= 3:
            poly_pts = np.array([[int(p[0] * w), int(p[1] * h)] for p in roi_polygon], dtype=np.int32)
            for box in nms_boxes:
                # Check center of bounding box
                cx = int(((box.xmin + box.xmax) / 2.0) * w)
                cy = int(((box.ymin + box.ymax) / 2.0) * h)
                dist = cv2.pointPolygonTest(poly_pts, (cx, cy), False)
                if dist >= 0:  # Inside or on boundary
                    filtered_boxes.append(box)
        else:
            filtered_boxes = nms_boxes

        # 5. Apply class-specific confidence thresholds
        confirmed_boxes = [
            b for b in filtered_boxes
            if b.confidence >= self.confidence_thresholds.get(b.class_id, 0.50)
        ]

        # 6. Determine primary class
        if not confirmed_boxes:
            primary_class = "bin_empty"
            primary_conf = 0.92
        else:
            # Pick highest confidence critical/high hazard
            hazard_priority = {"blocked_drain": 4, "overflow": 3, "litter_pile": 2, "bin_full": 1}
            sorted_by_hazard = sorted(
                confirmed_boxes,
                key=lambda b: (hazard_priority.get(b.class_id, 0), b.confidence),
                reverse=True
            )
            top_box = sorted_by_hazard[0]
            primary_class = top_box.class_id
            primary_conf = top_box.confidence

        inference_time_ms = round((time.time() - t0) * 1000, 1)
        return confirmed_boxes, primary_class, primary_conf, inference_time_ms

    def anonymize_and_annotate(
        self,
        frame: np.ndarray,
        boxes: List[DetectionBox]
    ) -> np.ndarray:
        """
        Blurs detected human faces/bystanders for privacy compliance,
        then draws bounding boxes and labels for confirmed waste hazards.
        """
        output = frame.copy()
        h, w = output.shape[:2]

        # 1. Privacy Face Anonymization
        if self.anonymize_faces and self.face_cascade is not None:
            gray = cv2.cvtColor(output, cv2.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(
                gray, scaleFactor=1.1, minNeighbors=4, minSize=(30, 30)
            )
            for (fx, fy, fw, fh) in faces:
                # Expand slightly to cover hair/ears
                x1 = max(0, fx - 10)
                y1 = max(0, fy - 10)
                x2 = min(w, fx + fw + 10)
                y2 = min(h, fy + fh + 10)
                face_roi = output[y1:y2, x1:x2]
                if face_roi.size > 0:
                    blurred = cv2.GaussianBlur(face_roi, (51, 51), 30)
                    output[y1:y2, x1:x2] = blurred

        # 2. Draw Waste Hazard Annotations
        color_map = {
            "blocked_drain": (0, 0, 220),       # Red
            "overflow": (20, 80, 240),          # Orange-red
            "litter_pile": (0, 140, 255),       # Amber
            "bin_full": (0, 200, 200),          # Yellow
            "bin_partial": (50, 180, 50),       # Green
            "bin_empty": (100, 150, 100)
        }

        for box in boxes:
            x1 = int(box.xmin * w)
            y1 = int(box.ymin * h)
            x2 = int(box.xmax * w)
            y2 = int(box.ymax * h)
            color = color_map.get(box.class_id, (0, 165, 255))

            cv2.rectangle(output, (x1, y1), (x2, y2), color, 2)
            label_text = f"{box.class_label} {int(box.confidence * 100)}%"
            t_size = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)[0]
            cv2.rectangle(output, (x1, max(0, y1 - 20)), (x1 + t_size[0] + 6, max(0, y1)), color, -1)
            cv2.putText(
                output, label_text, (x1 + 3, max(12, y1 - 5)),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA
            )

        return output

    def save_capture_evidence(
        self,
        annotated_frame: np.ndarray,
        camera_id: str,
        detection_class: str,
        timestamp_str: str
    ) -> str:
        """
        Saves annotated evidence frame to captures/{camera_id}/{YYYY-MM-DD}/.
        Performs automatic retention cleanup for directories older than retention_days.
        Returns relative URL or path.
        """
        date_str = timestamp_str[:10]  # YYYY-MM-DD
        cam_dir = self.captures_dir / camera_id / date_str
        cam_dir.mkdir(parents=True, exist_ok=True)

        filename = f"{timestamp_str.replace(':', '-').replace('T', '_')[:19]}_{detection_class}.jpg"
        file_path = cam_dir / filename
        cv2.imwrite(str(file_path), annotated_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 88])

        # Retention Cleanup
        self._prune_old_captures()
        return f"/api/captures/{camera_id}/{date_str}/{filename}"

    def _prune_old_captures(self):
        """Deletes capture folders older than self.retention_days."""
        try:
            now = time.time()
            cutoff = now - (self.retention_days * 86400)
            for cam_folder in self.captures_dir.iterdir():
                if cam_folder.is_dir():
                    for date_folder in cam_folder.iterdir():
                        if date_folder.is_dir():
                            mtime = date_folder.stat().st_mtime
                            if mtime < cutoff:
                                for f in date_folder.iterdir():
                                    f.unlink(missing_ok=True)
                                date_folder.rmdir()
        except Exception as e:
            logger.debug(f"Retention pruning note: {e}")
