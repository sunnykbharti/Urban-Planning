# CSJMU Urban Planning & Civic Operations System
## Closed-Loop Waste, Infrastructure & Microclimate Governance Platform

An enterprise-grade Urban Operations and Civic Governance platform designed for smart campuses and municipal corporations (e.g., Chhatrapati Shahu Ji Maharaj University & Kanpur Nagar Nigam).

---

### Core Architectural Principle: *"Don't Start with the Drone"*

In urban planning and civic engineering, **sensing is only 10% of the problem—governance, spatial routing, and closed-loop accountability are the other 90%**.

The platform treats **Drone sweeps, fixed CCTV cameras, citizen mobile apps, and sanitation vehicle dashcams as interchangeable data sources**, placing the **Authority Resolution Engine (ARE)**, **Role-Based Access Control (RBAC)**, and **Dispatch-to-Resolution Workflow** at the central core:

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

### Role-Based Access Control (RBAC) & Enterprise Security

In line with zero-trust architectural best practices, **arbitrary in-app role changing is disabled**. Users cannot simply toggle their role while using the application.

Instead, the portal employs an authenticated **Account Switcher & Security Gateway**:
- Each session is strictly bound to an authentic campus persona and directory credential.
- Public audience (Students) have immediate civic access.
- Privileged accounts (Contractor Workers, Executive Management, Super Administrators) require credential verification via security PINs.
- Active credentials, permission sets, and badge identities are enforced across all dashboard components and API endpoints via `X-User-Role` headers.

#### Seeded Personas & Demo Accounts:

| Role | Persona / Official Identity | Badge ID | Credentials | Role Scope & Seeded Workflows |
|:---|:---|:---|:---|:---|
| **Student** | **Sunny Bharti**<br>B.Tech CSE, 3rd Year | `CSJMU/UIET/2023/104` | Public<br>*(No PIN required)* | • Civic hazard reporting & photo upload<br>• Real-time ticket tracking & upvotes<br>• Green Campus Leaderboard (340 Eco-Points, Rank #3)<br>• Cool Havens thermal refuge navigator |
| **BVG Worker** | **Ramesh Kumar**<br>Sanitation Beat 01 Lead | `BVG-IND-KNP-204` | PIN: `1234` | • Assigned Beat 01 Work Order Queue<br>• AI-assisted Before vs. After cleanup photo verification<br>• Beat reassignment requests (safety hazards, special equipment)<br>• Workforce leave applications |
| **Management** | **Er. R. K. Sharma**<br>Executive Sanitation Engineer | `CSJMU-EST-019` | PIN: `5678` | • Reassignment request review & contractor rerouting<br>• Workforce leave application approvals & remarks<br>• Contractor SLA compliance auditing (BVG India Ltd: 94.8% on-time)<br>• Multi-zone operational health monitoring |
| **Super Admin** | **Prof. A. K. Shukla**<br>Registrar & Chief Administrator | `CSJMU-ROOT-001` | PIN: `9999` | • Central directory RBAC credential administration<br>• CCTV automated AI sweeps & YOLOv8 model analytics<br>• Master audit logs & security access trails<br>• Campus microclimate heat-island capital expenditure planning |

---

### Dedicated Role Dashboards

#### 1. Student / Citizen Hub (`StudentDashboard`)
- **Lodge Issue Drawer**: Geo-located incident submission with photo upload, block selector, and AI category detection.
- **My Reports vs. Campus Feed**: Real-time status progress tracking (`Pending` $\to$ `Dispatched` $\to$ `In Progress` $\to$ `Resolved`).
- **Eco-Points & Civic Leaderboard**: Gamified student participation rewarding validated civic reports.
- **Cool Havens**: Interactive finder for shaded green zones, water bodies, and high-comfort thermal microclimates.

#### 2. BVG Contractor Operations (`BvgWorkerDashboard`)
- **Assigned Work Orders**: Filterable task queue (`Urgent`, `In Progress`, `Resolved`) with SLA countdown timers.
- **AI Cleanup Verification Engine**: Computer vision comparison of post-cleanup photos with automated residual debris detection and cleanliness percentage scores.
- **Reassignment Requests**: Structured escalations for situations requiring specialized equipment (e.g. suction tanker, boom crane) or high-voltage / chemical safety hazards.
- **Leave Applications**: Formal workforce leave requests with medical/casual types, dates, and replacement beat lead coverage.

#### 3. Directorate of Estate & Works (`ManagementDashboard`)
- **Executive Statistics**: Zone-by-zone incident resolution rates, SLA breaches, and active field beats.
- **Workforce Request Management**: Triage interface to approve, reject, or reassign contractor escalated tickets with remarks.
- **Leave Authorization**: Review workforce leave submissions and assign standby beat leads to maintain continuous coverage.
- **Contractor SLA Audits**: Empirical compliance tracking for BVG India Ltd. facility management contracts.

#### 4. Super Administrator Console (`AdminDashboard`)
- **RBAC Credential Directory**: Manage user roles, departments, badge IDs, and update authorization PINs.
- **CCTV Automated Pipeline**: Automated sweeps across campus cameras, YOLOv8 inference review, duplicate filtering, and ticket dispatch history.
- **Audit Logging**: Traceability of administrative actions, role elevations, and critical system events.

---

### Authority Resolution Engine (ARE) Specification

For every detected garbage or infrastructure anomaly, the engine executes spatial containment and organizational resolution:

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
Nearest Cleaning Team (e.g. Sanitation Beat Alpha / BVG Beat 01)
      ↓
SLA Contract & Status (e.g. 60 Minutes Target Deadline)
```

#### Structured Civic Ticket Output:
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

### Campus Heat Island (UHI) & Microclimate Module

Elevates civic operations into scientific urban planning by mapping multi-layer environmental factors across campus sectors:
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
   - Pinpoints critical student transit corridors where underground utilities (e.g. 11kV cables, culverts) prevent deep-root trees. Recommends tensile PTFE fabric membranes and bifacial solar pergolas ($98\%$ UV cut).
3. **🛣️ Where should we use cool pavement?**
   - Targets expansive, unshaded asphalt parking lots and workshop loading yards. Recommends high-reflectance titanium-dioxide coatings (SRI $\ge 82$) and permeable pavers (expected surface drop from $44.2^\circ\text{C}$ to $34.5^\circ\text{C}$).
4. **🪑 Where should seating be located?**
   - Locates microclimate "Cool Refuges" with $> 70\%$ canopy shade, natural wind channeling, and lake breeze buffers within convenient walking distance from academic lecture halls.

---

### Project Structure

```
Urban Planning/
├── backend/                       # Python Flask REST API Service
│   ├── app.py                     # API Routes, RBAC Verification & Lifecycle
│   ├── authority_engine.py        # Authority Resolution Engine (ARE)
│   ├── detection_service.py       # CV / YOLO Classes & Sensor Ingestion
│   ├── heat_island_service.py     # Microclimate & UHI Decision Engine
│   ├── cctv_service.py            # Automated 8-Stage CCTV Pipeline
│   ├── database.py                # Dual SQLite / PostgreSQL Database Layer
│   ├── data.py                    # Wards, Authorities, Supervisors, Seed Data
│   └── requirements.txt           # Python dependencies
│
├── frontend/                      # Modern React 19 + Vite 6 Application
│   ├── src/
│   │   ├── api/client.ts          # REST Client to Flask Backend (with fallback)
│   │   ├── components/            # Role Dashboards & System Visualizers
│   │   │   ├── TopNavBar.tsx            # Navigation header with session profile
│   │   │   ├── SideNavBar.tsx           # Contextual role-segregated navigation rail
│   │   │   ├── RoleAuthModal.tsx        # Account Switcher & PIN security gateway
│   │   │   ├── StudentDashboard.tsx     # Student & civic hub
│   │   │   ├── BvgWorkerDashboard.tsx   # Contractor task queue & AI cleanup
│   │   │   ├── ManagementDashboard.tsx  # SLA audits, leaves & reassignments
│   │   │   ├── AdminDashboard.tsx       # Master console & credential management
│   │   │   ├── HeatIslandMapView.tsx    # Multi-layer UHI thermal map & planner
│   │   │   ├── CctvPipelineDashboard.tsx# Automated 8-stage CCTV sweeps
│   │   │   ├── PipelineVisualizer.tsx   # Interactive ARE pipeline inspector
│   │   │   ├── LeafletCampusMap.tsx     # Interactive GIS Map
│   │   │   └── SettingsModal.tsx        # Portal settings & RBAC clearance
│   │   ├── data/mockData.ts       # 4-Role dummy seeded datasets & credentials
│   │   ├── types.ts               # TypeScript schemas
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
source env/bin/activate    # or python3 -m venv env && source env/bin/activate
pip install -r requirements.txt
python3 app.py
```
*Backend runs on `http://localhost:5000` with CORS enabled and database auto-initialization.*

#### 2. Start the React Frontend (Port 3000)
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000` with automated proxy to backend API.*

---

### REST API Endpoints (Flask)

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/health` | Backend status, DB engine & version check |
| `POST` | `/api/auth/verify-role` | Validate role PIN credentials for privileged elevation |
| `GET` | `/api/zones` | Retrieve all Wards, Authorities, Supervisors & SLA matrices |
| `POST` | `/api/resolve-authority` | **Runs the Authority Resolution Engine (ARE)** |
| `GET` | `/api/incidents` | List all incidents with complete ARE metadata |
| `POST` | `/api/incidents` | Create an incident through the 5-Stage Pipeline |
| `PATCH` | `/api/incidents/<id>/status` | Update incident status (`DISPATCHED` $\to$ `IN_PROGRESS` $\to$ `RESOLVED`) |
| `POST` | `/api/incidents/<id>/verify` | Stage 5: Upload "After" photo, calculate response time, verify SLA |
| `POST` | `/api/detect/simulate` | Simulate YOLO inference on Drone/CCTV/Mobile |
| `GET` | `/api/cctv/sweeps` | Retrieve automated CCTV pipeline sweeps & camera metadata |
| `POST` | `/api/cctv/sweep/run` | Trigger on-demand 8-stage CCTV garbage detection sweep |
| `GET` | `/api/stats` | Aggregated SLA compliance rates, average response duration |
| `GET` | `/api/microclimate/sectors` | Retrieve all 8 campus microclimate polygons & multi-layer indicators |
| `GET` | `/api/microclimate/interventions` | Retrieve 4 Actionable Urban Planning recommendations |
| `GET` | `/api/microclimate/summary` | UHI summary: peak Hot Zone LST, cool sink delta, intervention totals |
| `POST` | `/api/microclimate/simulate` | Interactive "What-If" scenario simulator (trees, cool pavement, shade) |
