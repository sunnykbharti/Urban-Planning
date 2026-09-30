"""
Detection Service for Computer Vision / YOLO inference pipeline.
Supports the 6 standard urban solid waste and drainage classes:
- bin_empty
- bin_partial
- bin_full
- overflow
- litter_pile
- blocked_drain
Handles Drone, CCTV, Mobile, and Vehicle sensors.
"""

import random
from typing import Dict, Any, List

DETECTION_CLASSES = [
    {
        "id": "overflow",
        "label": "Bin Overflow",
        "description": "Garbage spilling over receptacle brim onto ground",
        "defaultSeverity": "HIGH"
    },
    {
        "id": "blocked_drain",
        "label": "Blocked Storm Drain",
        "description": "Drain grate clogged with silt/polythene causing water retention",
        "defaultSeverity": "CRITICAL"
    },
    {
        "id": "litter_pile",
        "label": "Litter Pile",
        "description": "Uncontained municipal solid waste or plastic litter scattering",
        "defaultSeverity": "MEDIUM"
    },
    {
        "id": "bin_full",
        "label": "Bin at 100% Capacity",
        "description": "Receptacle full, requires immediate emptying to prevent spillage",
        "defaultSeverity": "MEDIUM"
    },
    {
        "id": "bin_partial",
        "label": "Bin Partially Filled (50%)",
        "description": "Normal accumulation, scheduled for routine beat",
        "defaultSeverity": "LOW"
    },
    {
        "id": "bin_empty",
        "label": "Bin Clear & Empty",
        "description": "Receptacle sanitary and serviceable",
        "defaultSeverity": "NORMAL"
    }
]

SAMPLE_SOURCES = [
    {"type": "DRONE_SWEEP", "sensorId": "DRONE_PATROL_QUAD_B", "name": "Campus Drone Sweep (UAV Alpha)"},
    {"type": "CCTV_FIXED", "sensorId": "CAM_UIET_GATE_02", "name": "Fixed CCTV Axis PTZ #14"},
    {"type": "CITIZEN_MOBILE", "sensorId": "APP_STUDENT_REPORT", "name": "Student Civic Mobile App"},
    {"type": "SWEEPER_VEHICLE", "sensorId": "VEHICLE_PATROL_04", "name": "Sanitation Truck Dashcam"}
]

def simulate_detection(
    source_type: str = "DRONE_SWEEP",
    target_class: str = "overflow",
    image_url: str = None
) -> Dict[str, Any]:
    """
    Simulates a high-accuracy YOLOv11 detection object with bounding boxes and spatial telemetry.
    """
    matched_class = next((c for c in DETECTION_CLASSES if c["id"] == target_class), DETECTION_CLASSES[0])
    
    confidence = round(random.uniform(0.87, 0.98), 2)
    
    # Generate mock bounding box [ymin, xmin, ymax, xmax] normalized
    ymin = round(random.uniform(0.2, 0.4), 2)
    xmin = round(random.uniform(0.2, 0.5), 2)
    ymax = round(ymin + random.uniform(0.25, 0.4), 2)
    xmax = round(xmin + random.uniform(0.25, 0.4), 2)

    return {
        "detectionClass": matched_class["id"],
        "classLabel": matched_class["label"],
        "confidence": confidence,
        "defaultSeverity": matched_class["defaultSeverity"],
        "boundingBox": {"ymin": ymin, "xmin": xmin, "ymax": ymax, "xmax": xmax},
        "estimatedVolumeM3": round(random.uniform(0.2, 1.2), 2) if target_class in ["overflow", "litter_pile"] else None,
        "source": {
            "type": source_type,
            "sensorId": f"SENSOR_{random.randint(100, 999)}",
            "modelInference": "YOLOv11-UrbanWaste-v2.1"
        },
        "aiSummary": f"Automated CV detection flagged {matched_class['label']} with {int(confidence*100)}% model certainty."
    }
