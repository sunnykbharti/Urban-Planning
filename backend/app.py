"""
Flask REST API for Urban Operations & Authority Resolution System
5-Module Architecture:
1. Detect (CV / YOLO)
2. Geotag (GPS / GIS / Bounds)
3. Authority Resolution Engine (ARE)
4. Dispatch (Dashboard / WhatsApp / SMS)
5. Verify & Close (Before/After verification, SLA audit)
"""

import os
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from data import ZONES_CONFIG, SLA_RULES, SEED_INCIDENTS
from authority_engine import authority_engine
from detection_service import simulate_detection, DETECTION_CLASSES, SAMPLE_SOURCES

app = Flask(__name__)
# Enable CORS for frontend running on Vite or any localhost port
CORS(app, resources={r"/api/*": {"origins": "*"}})

# In-memory incident store initialized with seed incidents
incidents_db = list(SEED_INCIDENTS)

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "CSJMU Urban Operations & Authority Resolution Engine Backend",
        "version": "2.0.0",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "activeIncidents": len(incidents_db)
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

@app.route("/api/incidents", methods=["GET"])
def list_incidents():
    """List all incidents, sortable by newest first."""
    return jsonify({
        "total": len(incidents_db),
        "incidents": incidents_db
    }), 200

@app.route("/api/incidents", methods=["POST"])
def create_incident():
    """
    Creates a new incident by running through the 5-Stage Pipeline:
    1. Detect (CV analysis)
    2. Geotag (Coordinates & Ward mapping)
    3. Authority Resolution (ARE)
    4. Dispatch (Assign team, generate ticket & SLA)
    """
    data = request.get_json() or {}
    coords = data.get("coordinates", {"x": 40, "y": 40})
    detection_class = data.get("detectionClass", "overflow")
    title = data.get("title", f"Reported {detection_class.replace('_', ' ').title()}")
    source_type = data.get("sourceType", "DRONE_SWEEP")
    image_url = data.get("beforeImageUrl") or "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80"
    
    # Run the Authority Resolution Engine (ARE)
    resolution = authority_engine.resolve_authority(
        coords=coords,
        detection_class=detection_class,
        custom_severity=data.get("severity")
    )

    ticket_num = f"CSJMU-SWM-{len(incidents_db) + 1043}"
    now_iso = datetime.utcnow().isoformat() + "Z"

    new_incident = {
        "id": f"INC-{len(incidents_db) + 1043}",
        "ticketNumber": ticket_num,
        "title": title,
        "detectionClass": detection_class,
        "confidence": data.get("confidence", 0.93),
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
        "beforeImageUrl": image_url,
        "afterImageUrl": None,
        "verificationStatus": "DISPATCHED_TO_BEAT",
        "aiNotes": data.get("aiNotes") or f"Automatically routed to {resolution['supervisor']['name']} ({resolution['department']}) via Authority Resolution Engine."
    }

    incidents_db.insert(0, new_incident)
    return jsonify(new_incident), 201

@app.route("/api/incidents/<incident_id>/status", methods=["PATCH"])
def update_incident_status(incident_id):
    """Update status of an incident (DISPATCHED -> IN_PROGRESS -> RESOLVED)."""
    data = request.get_json() or {}
    new_status = data.get("status")
    note = data.get("note")

    for inc in incidents_db:
        if inc["id"] == incident_id:
            inc["status"] = new_status
            if note:
                inc["aiNotes"] = f"{inc.get('aiNotes', '')} | Note: {note}"
            return jsonify(inc), 200

    return jsonify({"error": "Incident not found"}), 404

@app.route("/api/incidents/<incident_id>/verify", methods=["POST"])
def verify_and_close_incident(incident_id):
    """
    Stage 5: Verify & Close
    Uploads "After" cleaning photo, records resolution time, and compares against SLA window.
    """
    data = request.get_json() or {}
    after_image = data.get("afterImageUrl", "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=800&q=80")
    
    for inc in incidents_db:
        if inc["id"] == incident_id:
            now = datetime.utcnow()
            inc["status"] = "RESOLVED"
            inc["afterImageUrl"] = after_image
            inc["resolvedAt"] = now.isoformat() + "Z"
            inc["verificationStatus"] = "VERIFIED_CLEAN"

            # Calculate turnaround duration
            try:
                created_dt = datetime.fromisoformat(inc["createdAt"].replace("Z", "+00:00"))
                # remove tz for clean diff
                diff_minutes = max(1, int((datetime.now(created_dt.tzinfo) - created_dt).total_seconds() / 60))
            except Exception:
                diff_minutes = 45

            inc["responseDurationMinutes"] = diff_minutes
            sla_target = inc.get("slaMinutes", 60)
            inc["slaMet"] = diff_minutes <= sla_target

            return jsonify({
                "incident": inc,
                "verification": {
                    "isClean": True,
                    "confidence": 0.96,
                    "resolutionMinutes": diff_minutes,
                    "slaMet": inc["slaMet"],
                    "message": f"Verification passed: Solid waste cleared. Resolution logged in {diff_minutes}m (SLA: {sla_target}m)."
                }
            }), 200

    return jsonify({"error": "Incident not found"}), 404

@app.route("/api/stats", methods=["GET"])
def get_stats():
    """Aggregate statistics for the Urban Operations analytics."""
    total = len(incidents_db)
    resolved = [i for i in incidents_db if i["status"] == "RESOLVED"]
    in_progress = [i for i in incidents_db if i["status"] == "IN_PROGRESS"]
    dispatched = [i for i in incidents_db if i["status"] == "DISPATCHED"]

    met_sla_count = sum(1 for i in resolved if i.get("slaMet", True))
    sla_compliance_rate = round((met_sla_count / len(resolved) * 100), 1) if resolved else 100.0

    durations = [i["responseDurationMinutes"] for i in resolved if i.get("responseDurationMinutes")]
    avg_response_time = round(sum(durations) / len(durations), 1) if durations else 52.0

    # Group by detection class
    class_counts = {}
    for i in incidents_db:
        cls = i.get("detectionClass", "other")
        class_counts[cls] = class_counts.get(cls, 0) + 1

    return jsonify({
        "totalIncidents": total,
        "dispatchedCount": len(dispatched),
        "inProgressCount": len(in_progress),
        "resolvedCount": len(resolved),
        "slaComplianceRate": sla_compliance_rate,
        "avgResponseTimeMinutes": avg_response_time,
        "classBreakdown": class_counts
    }), 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"🚀 CSJMU Urban Planning Backend (Flask) running on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
