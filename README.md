# CSJMU Urban Planning & Civic Operations System
## 5-Module Closed-Loop Waste & Drainage Management Platform with Authority Resolution Engine (ARE)

An enterprise-grade Urban Operations and Civic Governance platform designed for smart campuses and municipal corporations (e.g., CSJMU & Kanpur Nagar Nigam).

---

### Core Architectural Principle: *"Don't Start with the Drone"*

In urban planning and civic engineering, **sensing is only 10% of the problem—governance, spatial routing, and closed-loop accountability are the other 90%**.

The platform treats **Drone sweeps, fixed CCTV cameras, citizen mobile apps, and sanitation vehicle dashcams as interchangeable data sources**, placing the **Authority Resolution Engine (ARE)** and **Dispatch-to-Resolution Workflow** at the central core:

```
                    IMAGE / VIDEO INGESTION TIER
    [ Drone Sweep ]   [ Fixed CCTV ]   [ Citizen App ]   [ Patrol Dashcam ]
           │                 │                │                  │
           └─────────────────┼────────────────┴──────────────────┘
                             ▼
          ┌───────────────────────────────────────┐
          │   1. DETECT (Computer Vision / YOLO)  │
          │  Classes: bin_empty, bin_partial,     │
          │  bin_full, overflow, litter_pile,     │
          │  blocked_drain                        │
          └──────────────────┬────────────────────┘
                             ▼
          ┌───────────────────────────────────────┐
          │   2. GEOTAG (Spatial Containment)     │
          │  GPS Coordinates / CCTV Homography    │
          │  GIS Point-in-Polygon Ward Mapping    │
          └──────────────────┬────────────────────┘
                             ▼
          ┌───────────────────────────────────────┐
          │   3. AUTHORITY RESOLUTION ENGINE      │
          │  GPS/Coordinates → Ward/Zone          │
          │  → Municipal Authority → Department   │
          │  → Zonal Supervisor → Nearest Team    │
          │  → Strict SLA Matrix                  │
          └──────────────────┬────────────────────┘
                             ▼
          ┌───────────────────────────────────────┐
          │   4. DISPATCH (Omnichannel Routing)   │
          │  Official Work Order Generation       │
          │  WhatsApp Bot / SMS / Web Dashboard   │
          └──────────────────┬────────────────────┘
                             ▼
                         CLEANING
                             ▼
          ┌───────────────────────────────────────┐
          │   5. VERIFY & CLOSE (Audit Trail)     │
          │  Before → After Image Verification    │
          │  Turnaround Response Time & SLA Audit │
          └───────────────────────────────────────┘
```

---

### Authority Resolution Engine (ARE) Specification

For every detected garbage location, the engine determines:

```
GPS Coordinates (e.g. 26.4952° N, 80.2921° E)
      ↓
Ward / Zone (e.g. Ward 4 - Academic Division, UIET Campus)
      ↓
Municipal Authority (e.g. CSJMU Directorate of Estate & Works)
      ↓
Functional Department (e.g. Campus Solid Waste & Academic Sanitation)
      ↓
Responsible Sanitation Supervisor (e.g. Er. R. K. Sharma | +91 98765 43210)
      ↓
Nearest Cleaning Team (e.g. Sanitation Beat Alpha)
      ↓
SLA Contract & Status (e.g. 60 Minutes Target Deadline)
```

#### Output Structured Civic Ticket:
```json
{
  "ticketId": "CSJMU-SWM-1042",
  "detectionClass": "overflow",
  "confidence": 0.94,
  "location": "UIET Block 1 Canteen Concourse",
  "zone": "Academic Precinct (UIET Campus)",
  "ward": "Ward 4 - Academic Division",
  "severity": "HIGH",
  "authority": "CSJMU Directorate of Estate & Works",
  "department": "Campus Solid Waste & Academic Sanitation",
  "supervisor": {
    "name": "Er. R. K. Sharma",
    "phone": "+91 98765 43210",
    "channel": "WHATSAPP_DISPATCH"
  },
  "assignedTeam": {
    "teamId": "BEAT-01",
    "name": "Sanitation Beat Alpha (UIET)"
  },
  "slaMinutes": 60,
  "status": "DISPATCHED"
}
```

---

### Project Structure (Separated Frontend & Backend)

```
Urban Planning/
├── backend/                       # Python Flask REST API Service
│   ├── app.py                     # API Routes & Lifecycle Endpoints
│   ├── authority_engine.py        # Authority Resolution Engine (ARE)
│   ├── detection_service.py       # CV / YOLO Classes & Sensor Ingestion
│   ├── data.py                    # Wards, Authorities, Supervisors, Seed Incidents
│   └── requirements.txt           # Flask, Flask-CORS, Python-Dotenv
│
├── frontend/                      # Modern React + Vite Dashboard
│   ├── src/
│   │   ├── api/                   # REST Client to Flask Backend (with offline fallback)
│   │   ├── components/            # UI Components + ARE Visualizer
│   │   │   ├── PipelineVisualizer.tsx   # 5-Stage Interactive Pipeline & ARE Inspector
│   │   │   ├── CampusMap.tsx            # Interactive GIS Map & Spatial Zones
│   │   │   ├── MaintenanceManagementPanel.tsx
│   │   │   ├── ReportDetailsModal.tsx   # ARE Incident Work Order Modal
│   │   │   └── ...
│   │   ├── types.ts               # Clean TypeScript Schemas
│   │   └── App.tsx                # Main Application Shell
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

### Getting Started

#### 1. Start the Flask Backend (Port 5000)
```bash
cd backend
python3 -m pip install -r requirements.txt
python3 app.py
```
*Backend runs on `http://localhost:5000` with CORS enabled.*

#### 2. Start the React Frontend (Port 3000)
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`.*

---

### REST API Endpoints (Flask)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend status & version check |
| `GET` | `/api/zones` | Retrieve all Wards, Authorities, Supervisors, & SLA rules |
| `POST` | `/api/resolve-authority` | **Runs the Authority Resolution Engine (ARE)** |
| `GET` | `/api/incidents` | List all incidents with complete ARE metadata |
| `POST` | `/api/incidents` | Create an incident through the 5-Stage Pipeline |
| `PATCH` | `/api/incidents/<id>/status` | Update incident status (`DISPATCHED` $\to$ `IN_PROGRESS` $\to$ `RESOLVED`) |
| `POST` | `/api/incidents/<id>/verify` | Stage 5: Upload "After" photo, calculate response time, verify SLA |
| `POST` | `/api/detect/simulate` | Simulate YOLOv11 inference on Drone/CCTV/Mobile |
| `GET` | `/api/stats` | Aggregated SLA compliance rates, average response duration |
| `GET` | `/api/microclimate/sectors` | Retrieve all 8 campus microclimate polygons & multi-layer indicators |
| `GET` | `/api/microclimate/interventions` | Retrieve 4 Actionable Urban Planning recommendations |
| `GET` | `/api/microclimate/summary` | UHI summary: peak Hot Zone LST, cool sink delta, intervention totals |
| `POST` | `/api/microclimate/simulate` | Interactive "What-If" scenario simulator (tree count, cool pave %, shade m²) |

---

### Campus Heat Island (UHI) & Hot Zones Map Module ⭐⭐⭐⭐⭐

This module elevates the system into true urban planning by mapping multi-layer environmental factors:
- 🌡️ **Surface Temperature (LST °C)**: Thermal gradient spectrum (28°C to 44°C)
- 🌳 **Tree Canopy Cover (%)**: NDVI green cover index and biological shading
- 🏢 **Building Density (%)**: Concrete volume, aspect ratio, and thermal mass
- 🛣️ **Paved Surfaces (%)**: Impervious asphalt/concrete with low albedo ($< 0.15$)
- 💧 **Water Bodies (m)**: Evaporative cooling sink buffer zones
- 🚶 **Pedestrian Movement**: High-density human transit corridors intersecting with extreme thermal exposure

#### The 4 Actionable Urban Planning Decisions:
1. **🌳 Where should we plant trees?**
   - Identifies high-solar insolation pathways with low canopy and high soil permeability. Recommends native species (*Azadirachta indica* / Neem, *Cassia fistula* / Amaltas, *Dalbergia sissoo* / Shisham) with projected $\Delta T$ drops up to $-4.2^\circ\text{C}$.
2. **⛱️ Where should we create shade?**
   - Pinpoints critical student transit corridors where underground utilities (e.g. 11kV cables, culverts) prevent deep-root trees. Recommends architectural tensile PTFE fabric membranes and bifacial solar pergolas ($98\%$ UV cut).
3. **🛣️ Where should we use cool pavement?**
   - Targets expansive, unshaded asphalt parking lots and workshop loading yards. Recommends high-reflectance titanium-dioxide coatings (SRI $\ge 82$) and permeable pavers (expected surface drop from $44.2^\circ\text{C}$ to $34.5^\circ\text{C}$).
4. **🪑 Where should seating be located?**
   - Locates microclimate "Cool Refuges" with $> 70\%$ canopy shade, natural wind channeling, and lake breeze buffers within convenient walking distance from academic lecture halls.

