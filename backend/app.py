"""
Flask REST API for Urban Operations & Authority Resolution System
5-Module Architecture:
1. Detect (CV / YOLO & Image Upload / Storage & Amount Estimation)
2. Geotag (GPS / GIS / Bounds)
3. Authority Resolution Engine (ARE)
4. Dispatch (Dashboard / WhatsApp / SMS)
5. Verify & Close (Before/After verification, SLA audit)
"""

import os
import uuid
import base64
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from data import ZONES_CONFIG, SLA_RULES, SEED_INCIDENTS
from authority_engine import authority_engine
from detection_service import simulate_detection, analyze_garbage_image, DETECTION_CLASSES, SAMPLE_SOURCES
from heat_island_service import heat_island_service
from database import db_manager

app = Flask(__name__)
# Enable CORS for frontend running on Vite or any localhost port
CORS(app, resources={r"/*": {"origins": "*"}})

# Persistent Storage for uploaded garbage and verification photos
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "gif"}

def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# In-memory incident store initialized with seed incidents
incidents_db = list(SEED_INCIDENTS)

# -------------------------------------------------------------
# Static File Serving for Uploaded Images
# -------------------------------------------------------------

@app.route("/uploads/<path:filename>", methods=["GET"])
def serve_upload(filename):
    """Serve uploaded garbage and incident images."""
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route("/api/uploads/<path:filename>", methods=["GET"])
def serve_api_upload(filename):
    """Serve uploaded garbage and incident images under /api prefix."""
    return send_from_directory(UPLOAD_FOLDER, filename)

# -------------------------------------------------------------
# Core Health & Configuration Endpoints
# -------------------------------------------------------------

@app.route("/api/health", methods=["GET"])
def health_check():
    db_status = db_manager.get_status()
    return jsonify({
        "status": "healthy",
        "service": "CSJMU Urban Operations & Authority Resolution Engine Backend",
        "version": "2.2.0",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "database": db_status,
        "activeIncidents": db_status.get("incidentCount", 0),
        "uploadsCount": len(os.listdir(UPLOAD_FOLDER)) if os.path.exists(UPLOAD_FOLDER) else 0
    }), 200

@app.route("/api/zones", methods=["GET"])
def get_zones():
    """Retrieve all campus zones, municipal wards, departments, and supervisors."""
    return jsonify({
        "zones": ZONES_CONFIG,
        "slaRules": SLA_RULES,
        "detectionClasses": DETECTION_CLASSES,
        "sampleSources": SAMPLE_SOURCES
    }), 200

@app.route("/api/resolve-authority", methods=["POST"])
def resolve_authority_endpoint():
    """
    Direct endpoint for the Authority Resolution Engine (ARE).
    Input: { coords: {x, y}, gps: {latitude, longitude}, detectionClass, severity }
    Output: Ward, Authority, Department, Supervisor, Assigned Team, SLA target
    """
    data = request.get_json() or {}
    coords = data.get("coords")
    gps = data.get("gps")
    detection_class = data.get("detectionClass", "overflow")
    severity = data.get("severity")

    resolution = authority_engine.resolve_authority(
        coords=coords,
        gps=gps,
        detection_class=detection_class,
        custom_severity=severity
    )
    return jsonify(resolution), 200

# -------------------------------------------------------------
# Image Upload, Storage & Computer Vision Garbage Detection API
# -------------------------------------------------------------

@app.route("/api/upload-and-detect", methods=["POST"])
def upload_and_detect_endpoint():
    """
    Primary endpoint for:
    1. Storing uploaded picture of garbage to persistent storage (backend/uploads/).
    2. Computer Vision analysis to detect garbage type (overflow, litter pile, drain clog).
    3. Quantitative estimation of garbage amount (Weight in kg, Volume in m³ & L, Spread Area).
    4. Bounding boxes & clean-up recommendations.
    Accepts:
      - Multipart/form-data with 'file' or 'image'
      - OR JSON payload with 'imageData' (base64 string)
    """
    try:
        source_type = request.form.get("sourceType") or "CITIZEN_MOBILE"
        user_notes = request.form.get("notes") or ""
        saved_path = None
        saved_filename = None
        
        # Check multipart upload
        uploaded_file = request.files.get("file") or request.files.get("image")
        
        if uploaded_file and uploaded_file.filename != "":
            orig_name = secure_filename(uploaded_file.filename) or "garbage_upload.jpg"
            ext = orig_name.rsplit(".", 1)[1].lower() if "." in orig_name else "jpg"
            if ext not in ALLOWED_EXTENSIONS:
                ext = "jpg"
            unique_id = uuid.uuid4().hex[:8]
            timestamp_str = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            saved_filename = f"garbage_{timestamp_str}_{unique_id}.{ext}"
            saved_path = os.path.join(UPLOAD_FOLDER, saved_filename)
            uploaded_file.save(saved_path)
            
        else:
            # Check JSON base64
            json_data = request.get_json(silent=True) or {}
            source_type = json_data.get("sourceType") or source_type
            user_notes = json_data.get("notes") or user_notes
            image_data = json_data.get("imageData") or json_data.get("image") or json_data.get("base64")
            
            if image_data:
                # Remove header if data url
                if "," in image_data:
                    header, base64_str = image_data.split(",", 1)
                    if "png" in header:
                        ext = "png"
                    elif "webp" in header:
                        ext = "webp"
                    else:
                        ext = "jpg"
                else:
                    base64_str = image_data
                    ext = "jpg"
                    
                image_bytes = base64.b64decode(base64_str)
                unique_id = uuid.uuid4().hex[:8]
                timestamp_str = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
                saved_filename = f"garbage_{timestamp_str}_{unique_id}.{ext}"
                saved_path = os.path.join(UPLOAD_FOLDER, saved_filename)
                with open(saved_path, "wb") as f:
                    f.write(image_bytes)
            else:
                return jsonify({"error": "No image file or image data provided"}), 400

        # Execute Computer Vision & Amount Estimation pipeline
        detection_result = analyze_garbage_image(
            image_path=saved_path,
            source_type=source_type,
            user_notes=user_notes
        )

        file_size = os.path.getsize(saved_path)
        port = int(os.environ.get("PORT", 5000))
        relative_url = f"/uploads/{saved_filename}"
        full_url = f"http://127.0.0.1:{port}{relative_url}"

        response_payload = {
            "success": True,
            "message": "Image successfully stored and analyzed by Computer Vision engine.",
            "file": {
                "filename": saved_filename,
                "url": relative_url,
                "fullUrl": full_url,
                "sizeBytes": file_size,
                "uploadedAt": datetime.utcnow().isoformat() + "Z"
            },
            "detection": detection_result
        }
        return jsonify(response_payload), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to store and process image: {str(e)}"}), 500

@app.route("/api/detect/simulate", methods=["POST"])
def simulate_detection_endpoint():
    """
    Simulate Computer Vision detection on Drone, CCTV, Mobile, or Vehicle footage.
    """
    data = request.get_json() or {}
    source_type = data.get("sourceType", "DRONE_SWEEP")
    target_class = data.get("targetClass", "overflow")
    image_url = data.get("imageUrl")

    detection_result = simulate_detection(
        source_type=source_type,
        target_class=target_class,
        image_url=image_url
    )
    return jsonify(detection_result), 200

# -------------------------------------------------------------
# Incidents Lifecycle Management
# -------------------------------------------------------------

@app.route("/api/incidents", methods=["GET"])
def list_incidents():
    """List all incidents from persistent database, sortable by newest first."""
    status_filter = request.args.get("status")
    ward_filter = request.args.get("ward")
    incidents = db_manager.get_all_incidents(status=status_filter, ward=ward_filter)
    return jsonify({
        "total": len(incidents),
        "incidents": incidents
    }), 200

@app.route("/api/incidents", methods=["POST"])
def create_incident():
    """
    Creates a new incident by running through the 5-Stage Pipeline:
    1. Detect (CV analysis & amount calculation)
    2. Geotag (Coordinates & Ward mapping)
    3. Authority Resolution (ARE)
    4. Dispatch (Assign team, generate ticket & SLA)
    5. Persist into PostgreSQL / SQLite database
    """
    data = request.get_json() or {}
    coords = data.get("coordinates", {"x": 40, "y": 40})
    detection_class = data.get("detectionClass", "overflow")
    title = data.get("title", f"Reported {detection_class.replace('_', ' ').title()}")
    source_type = data.get("sourceType", "CITIZEN_MOBILE")
    image_url = data.get("imageUrl") or data.get("beforeImageUrl") or "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80"
    
    # Run the Authority Resolution Engine (ARE)
    resolution = authority_engine.resolve_authority(
        coords=coords,
        detection_class=detection_class,
        custom_severity=data.get("severity")
    )

    incident_count = db_manager.get_incident_count()
    ticket_num = f"CSJMU-SWM-{incident_count + 1043}"
    now_iso = datetime.utcnow().isoformat() + "Z"

    # Garbage detection & estimated amount payload if present
    garbage_detection = data.get("garbageDetection")
    estimated_amount = data.get("estimatedAmount")
    if garbage_detection and not estimated_amount:
        estimated_amount = garbage_detection.get("estimatedAmount")

    new_incident_payload = {
        "id": f"INC-{incident_count + 1043}",
        "ticketNumber": ticket_num,
        "title": title,
        "description": data.get("description", ""),
        "category": data.get("category", "garbage"),
        "detectionClass": detection_class,
        "confidence": data.get("confidence", 0.94),
        "source": {
            "type": source_type,
            "sensorId": data.get("sensorId", f"SENSOR_{source_type[:3]}_AUTO"),
            "timestamp": now_iso
        },
        "coordinates": coords,
        "gps": data.get("gps", {"latitude": 26.4950, "longitude": 80.2920}),
        "location": data.get("location") or resolution["zoneName"],
        "zoneId": resolution["zoneId"],
        "zoneName": resolution["zoneName"],
        "ward": resolution["ward"],
        "authority": resolution["authority"],
        "department": resolution["department"],
        "supervisor": resolution["supervisor"],
        "assignedTeam": resolution["assignedTeam"],
        "severity": resolution["severity"],
        "status": "DISPATCHED",
        "slaMinutes": resolution["slaMinutes"],
        "createdAt": now_iso,
        "deadlineAt": resolution["deadlineAt"],
        "resolvedAt": None,
        "responseDurationMinutes": None,
        "imageUrl": image_url,
        "beforeImageUrl": image_url,
        "afterImageUrl": None,
        "verificationStatus": "DISPATCHED_TO_BEAT",
        "garbageDetection": garbage_detection,
        "estimatedAmount": estimated_amount,
        "estimatedAmountKg": estimated_amount.get("weightKg") if estimated_amount else None,
        "estimatedVolumeM3": estimated_amount.get("volumeM3") if estimated_amount else None,
        "aiNotes": data.get("aiNotes") or f"Automatically routed to {resolution['supervisor']['name']} ({resolution['department']}) via Authority Resolution Engine."
    }

    created = db_manager.create_incident(new_incident_payload)
    return jsonify(created), 201

@app.route("/api/incidents/<incident_id>/status", methods=["PATCH"])
def update_incident_status(incident_id):
    """Update status of an incident (DISPATCHED -> IN_PROGRESS -> RESOLVED)."""
    data = request.get_json() or {}
    new_status = data.get("status")
    note = data.get("note")

    updated = db_manager.update_incident_status(incident_id, new_status, note=note)
    if updated:
        return jsonify(updated), 200

    return jsonify({"error": "Incident not found"}), 404

@app.route("/api/incidents/<incident_id>/verify", methods=["POST"])
def verify_and_close_incident(incident_id):
    """
    Stage 5: Verify & Close
    Uploads "After" cleaning photo, records resolution time, and compares against SLA window.
    """
    data = request.get_json() or {}
    after_image = data.get("afterImageUrl", "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=800&q=80")
    
    result = db_manager.verify_and_close_incident(incident_id, after_image)
    if result:
        return jsonify(result), 200

    return jsonify({"error": "Incident not found"}), 404

@app.route("/api/stats", methods=["GET"])
def get_stats():
    """Aggregate statistics for the Urban Operations analytics from persistent database."""
    stats = db_manager.get_analytics_stats()
    return jsonify({
        "totalIncidents": stats["totalIncidents"],
        "dispatchedCount": stats["dispatchedCount"],
        "inProgressCount": stats["inProgressCount"],
        "resolvedCount": stats["resolvedCount"],
        "slaComplianceRate": stats["slaComplianceRate"],
        "avgResponseTimeMinutes": stats["averageResponseMinutes"],
        "totalEstimatedWasteKg": stats["totalWasteManagedKg"],
        "classBreakdown": stats["classBreakdown"],
        "databaseType": stats["databaseType"]
    }), 200

# -------------------------------------------------------------
# Campus Urban Heat Island (UHI) & Microclimate Analytics API
# -------------------------------------------------------------

@app.route("/api/microclimate/sectors", methods=["GET"])
def get_microclimate_sectors():
    """Retrieve spatial sectors mapped by LST, Tree Canopy, Density, Pavement, Water, and Pedestrians."""
    return jsonify({
        "sectors": heat_island_service.get_sectors()
    }), 200

@app.route("/api/microclimate/interventions", methods=["GET"])
def get_microclimate_interventions():
    """Retrieve 4 Actionable Urban Planning Recommendations."""
    return jsonify(heat_island_service.get_interventions()), 200

@app.route("/api/microclimate/summary", methods=["GET"])
def get_microclimate_summary():
    """Aggregated UHI metrics, temperature ranges, and intervention targets."""
    return jsonify(heat_island_service.get_summary_metrics()), 200

@app.route("/api/microclimate/simulate", methods=["POST"])
def simulate_microclimate_mitigation():
    data = request.get_json() or {}
    sector_id = data.get("sectorId", "sec-uiet-courtyard")
    added_trees = int(data.get("addedTrees", 20))
    cool_pave_pct = float(data.get("coolPavePct", 50.0))
    shade_sqm = float(data.get("shadeSqm", 150.0))

    simulation_result = heat_island_service.simulate_mitigation(
        sector_id=sector_id,
        added_trees=added_trees,
        cool_pave_pct=cool_pave_pct,
        shade_sqm=shade_sqm
    )
    return jsonify(simulation_result), 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"🚀 CSJMU Urban Planning Backend (Flask) running on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
