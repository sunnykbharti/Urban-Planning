"""
Seed data and domain configuration for the Urban Operations & Authority Resolution Engine.
Configured for CSJMU Campus & Municipal Planning Zones.
"""

from typing import Dict, List, Any

# Campus Zones / Municipal Wards definition with spatial bounding areas (0-100 grid & approximate GPS)
ZONES_CONFIG: List[Dict[str, Any]] = [
    {
        "id": "zone-academic",
        "name": "Academic Precinct (UIET Campus)",
        "ward": "Ward 4 - Academic Division",
        "shortCode": "UIET-ACAD",
        "bounds": {"minX": 30, "maxX": 50, "minY": 30, "maxY": 50},
        "gpsCenter": {"latitude": 26.4952, "longitude": 80.2921},
        "authority": "CSJMU Directorate of Estate & Works",
        "department": "Campus Solid Waste & Academic Sanitation",
        "supervisor": {
            "id": "SUP-101",
            "name": "Er. R. K. Sharma",
            "role": "Executive Sanitation Engineer",
            "phone": "+91 98765 43210",
            "whatsapp": "+919876543210",
            "email": "rksharma.estate@csjmu.ac.in",
            "shift": "Morning (07:00 - 15:00)"
        },
        "teams": [
            {"id": "BEAT-01", "name": "Sanitation Beat Alpha (UIET)", "members": 5, "lead": "Ramesh Kumar", "status": "AVAILABLE"},
            {"id": "BEAT-02", "name": "Rapid Response Team #1", "members": 4, "lead": "Sunil Yadav", "status": "ON_PATROL"}
        ]
    },
    {
        "id": "zone-library",
        "name": "Central Library & Administrative Block",
        "ward": "Ward 2 - Central Secretariat",
        "shortCode": "LIB-ADMIN",
        "bounds": {"minX": 50, "maxX": 70, "minY": 25, "maxY": 50},
        "gpsCenter": {"latitude": 26.4965, "longitude": 80.2940},
        "authority": "CSJMU Estate Directorate",
        "department": "Executive Facilities & Public Sanitation",
        "supervisor": {
            "id": "SUP-102",
            "name": "Sri Manoj Pandey",
            "role": "Chief Facilities Supervisor",
            "phone": "+91 98765 43212",
            "whatsapp": "+919876543212",
            "email": "mpandey.admin@csjmu.ac.in",
            "shift": "General (08:00 - 17:00)"
        },
        "teams": [
            {"id": "BEAT-03", "name": "Library Plaza Sanitation Unit", "members": 4, "lead": "Pradeep Tiwari", "status": "AVAILABLE"},
            {"id": "BEAT-04", "name": "VIP & Admin Area Crew", "members": 3, "lead": "Amit Pal", "status": "AVAILABLE"}
        ]
    },
    {
        "id": "zone-workshop",
        "name": "Engineering Workshop & Utility Precinct",
        "ward": "Ward 5 - Industrial & Utilities",
        "shortCode": "MECH-WS",
        "bounds": {"minX": 15, "maxX": 35, "minY": 50, "maxY": 75},
        "gpsCenter": {"latitude": 26.4938, "longitude": 80.2895},
        "authority": "CSJMU Public Works & Drainage Division",
        "department": "Heavy Sanitation & Drainage Works",
        "supervisor": {
            "id": "SUP-103",
            "name": "Er. Amit Saxena",
            "role": "Superintendent Engineer (Civil & Drainage)",
            "phone": "+91 98765 43213",
            "whatsapp": "+919876543213",
            "email": "asaxena.drainage@csjmu.ac.in",
            "shift": "Round the Clock / Emergency"
        },
        "teams": [
            {"id": "DRAIN-01", "name": "Drain Desilting & Sewer Squad", "members": 6, "lead": "Mahesh Chand", "status": "AVAILABLE"},
            {"id": "BEAT-05", "name": "Workshop Debris Cleaning Team", "members": 4, "lead": "Santosh Rao", "status": "ON_CALL"}
        ]
    },
    {
        "id": "zone-hostels",
        "name": "Residential & Student Hostels Sector",
        "ward": "Ward 7 - Student Residences",
        "shortCode": "HOSTEL-ZONE",
        "bounds": {"minX": 65, "maxX": 90, "minY": 45, "maxY": 85},
        "gpsCenter": {"latitude": 26.4980, "longitude": 80.2985},
        "authority": "CSJMU Chief Warden & Hostel Welfare Committee",
        "department": "Residential Health & Sanitation Cell",
        "supervisor": {
            "id": "SUP-104",
            "name": "Smt. Sunita Verma",
            "role": "Hostel Operations Overseer",
            "phone": "+91 98765 43211",
            "whatsapp": "+919876543211",
            "email": "sverma.hostel@csjmu.ac.in",
            "shift": "Morning & Evening Beats"
        },
        "teams": [
            {"id": "BEAT-06", "name": "Hostel Mess & Waste Cleansing Beat", "members": 8, "lead": "Dharmendra Singh", "status": "AVAILABLE"}
        ]
    },
    {
        "id": "zone-grounds",
        "name": "Sports Complex & Outer Perimeter Grounds",
        "ward": "Ward 9 - Grounds & Green Belt",
        "shortCode": "SPORTS-OUTER",
        "bounds": {"minX": 35, "maxX": 65, "minY": 65, "maxY": 95},
        "gpsCenter": {"latitude": 26.4920, "longitude": 80.2950},
        "authority": "Kanpur Nagar Nigam (Coordinated with CSJMU)",
        "department": "Horticulture & Open Public Sanitation",
        "supervisor": {
            "id": "SUP-105",
            "name": "Sri Vikram Singh",
            "role": "Zonal Sanitation Officer",
            "phone": "+91 98765 43214",
            "whatsapp": "+919876543214",
            "email": "vsingh.knn@kanpur.gov.in",
            "shift": "Day Shift"
        },
        "teams": [
            {"id": "BEAT-07", "name": "Grounds Litter Sweepers Beat", "members": 5, "lead": "Kailash Giri", "status": "AVAILABLE"}
        ]
    }
]

# SLA Rules Matrix based on Detection Class & Severity
SLA_RULES: Dict[str, Dict[str, Any]] = {
    "overflow": {
        "severity": "HIGH",
        "slaMinutes": 60,
        "priorityLevel": 1,
        "description": "Critical bin overflow posing hygiene and environmental hazard. Immediate clearance required."
    },
    "blocked_drain": {
        "severity": "CRITICAL",
        "slaMinutes": 30,
        "priorityLevel": 1,
        "description": "Blocked storm drain posing imminent waterlogging and vector-borne disease risk. Rapid desilting needed."
    },
    "litter_pile": {
        "severity": "MEDIUM",
        "slaMinutes": 120,
        "priorityLevel": 2,
        "description": "Accumulation of open municipal solid waste and plastics requiring sweep crew dispatch."
    },
    "bin_full": {
        "severity": "MEDIUM",
        "slaMinutes": 90,
        "priorityLevel": 2,
        "description": "Solid waste receptacle at 100% capacity; proactive emptying scheduled before overflow occurs."
    },
    "bin_partial": {
        "severity": "LOW",
        "slaMinutes": 360,
        "priorityLevel": 3,
        "description": "Bin is 40-75% filled. Added to scheduled afternoon patrol beat."
    },
    "bin_empty": {
        "severity": "NORMAL",
        "slaMinutes": 720,
        "priorityLevel": 4,
        "description": "Receptacle clear. Routine audit only."
    }
}

# Seed incidents with complete Authority Resolution Engine payloads
SEED_INCIDENTS: List[Dict[str, Any]] = [
    {
        "id": "INC-1041",
        "ticketNumber": "CSJMU-SWM-1041",
        "title": "Severe Overflowing Bin at UIET Canteen Corner",
        "detectionClass": "overflow",
        "confidence": 0.94,
        "source": {
            "type": "DRONE_SWEEP",
            "sensorId": "DRONE_PATROL_QUAD_B",
            "timestamp": "2026-09-30T09:12:00Z"
        },
        "coordinates": {"x": 38, "y": 38},
        "gps": {"latitude": 26.49518, "longitude": 80.29205},
        "location": "UIET Block 1 Canteen Concourse",
        "zoneId": "zone-academic",
        "zoneName": "Academic Precinct (UIET Campus)",
        "ward": "Ward 4 - Academic Division",
        "authority": "CSJMU Directorate of Estate & Works",
        "department": "Campus Solid Waste & Academic Sanitation",
        "supervisor": {
            "id": "SUP-101",
            "name": "Er. R. K. Sharma",
            "phone": "+91 98765 43210",
            "whatsapp": "+919876543210"
        },
        "assignedTeam": {
            "teamId": "BEAT-01",
            "name": "Sanitation Beat Alpha (UIET)",
            "lead": "Ramesh Kumar"
        },
        "severity": "HIGH",
        "status": "DISPATCHED",
        "slaMinutes": 60,
        "createdAt": "2026-09-30T09:15:00Z",
        "deadlineAt": "2026-09-30T10:15:00Z",
        "resolvedAt": None,
        "responseDurationMinutes": None,
        "beforeImageUrl": "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80",
        "afterImageUrl": None,
        "verificationStatus": "AWAITING_CLEANUP",
        "aiNotes": "YOLOv11 detected 0.45m³ solid waste overflow spilling onto pedestrian pathway."
    },
    {
        "id": "INC-1042",
        "ticketNumber": "CSJMU-SWM-1042",
        "title": "Blocked Storm Drain and Silt Build-up near Workshop Gate",
        "detectionClass": "blocked_drain",
        "confidence": 0.91,
        "source": {
            "type": "CCTV_FIXED",
            "sensorId": "CAM_WS_MAIN_GATE_03",
            "timestamp": "2026-09-30T09:30:00Z"
        },
        "coordinates": {"x": 26, "y": 58},
        "gps": {"latitude": 26.49382, "longitude": 80.28951},
        "location": "Central Mechanical Workshop North Drain",
        "zoneId": "zone-workshop",
        "zoneName": "Engineering Workshop & Utility Precinct",
        "ward": "Ward 5 - Industrial & Utilities",
        "authority": "CSJMU Public Works & Drainage Division",
        "department": "Heavy Sanitation & Drainage Works",
        "supervisor": {
            "id": "SUP-103",
            "name": "Er. Amit Saxena",
            "phone": "+91 98765 43213",
            "whatsapp": "+919876543213"
        },
        "assignedTeam": {
            "teamId": "DRAIN-01",
            "name": "Drain Desilting & Sewer Squad",
            "lead": "Mahesh Chand"
        },
        "severity": "CRITICAL",
        "status": "IN_PROGRESS",
        "slaMinutes": 30,
        "createdAt": "2026-09-30T09:32:00Z",
        "deadlineAt": "2026-09-30T10:02:00Z",
        "resolvedAt": None,
        "responseDurationMinutes": None,
        "beforeImageUrl": "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80",
        "afterImageUrl": None,
        "verificationStatus": "TEAM_ON_SITE",
        "aiNotes": "Polymer waste and mud blockage causing water retention of 15cm."
    },
    {
        "id": "INC-1040",
        "ticketNumber": "CSJMU-SWM-1040",
        "title": "Large Litter Pile Behind Central Library Quadrangle",
        "detectionClass": "litter_pile",
        "confidence": 0.88,
        "source": {
            "type": "CITIZEN_MOBILE",
            "sensorId": "APP_USER_STU_8492",
            "timestamp": "2026-09-30T08:00:00Z"
        },
        "coordinates": {"x": 58, "y": 38},
        "gps": {"latitude": 26.49652, "longitude": 80.29402},
        "location": "Central Library Rear Lawn",
        "zoneId": "zone-library",
        "zoneName": "Central Library & Administrative Block",
        "ward": "Ward 2 - Central Secretariat",
        "authority": "CSJMU Estate Directorate",
        "department": "Executive Facilities & Public Sanitation",
        "supervisor": {
            "id": "SUP-102",
            "name": "Sri Manoj Pandey",
            "phone": "+91 98765 43212",
            "whatsapp": "+919876543212"
        },
        "assignedTeam": {
            "teamId": "BEAT-03",
            "name": "Library Plaza Sanitation Unit",
            "lead": "Pradeep Tiwari"
        },
        "severity": "MEDIUM",
        "status": "RESOLVED",
        "slaMinutes": 120,
        "createdAt": "2026-09-30T08:05:00Z",
        "deadlineAt": "2026-09-30T10:05:00Z",
        "resolvedAt": "2026-09-30T09:10:00Z",
        "responseDurationMinutes": 65,
        "beforeImageUrl": "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
        "afterImageUrl": "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=800&q=80",
        "verificationStatus": "VERIFIED_CLEAN",
        "aiNotes": "Resolved in 65 mins. SLA met with 55 mins margin. Dual-angle verification passed."
    }
]
