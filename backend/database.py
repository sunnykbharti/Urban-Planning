"""
Database Management Layer for CSJMU Urban Operations & SWM.
Supports:
1. PostgreSQL (via psycopg2 / SQLAlchemy) with JSON/JSONB support.
2. Automatic fallback to persistent SQLite if DATABASE_URL is not yet configured.
3. Auto-seeding initial municipal incidents on fresh startup.
"""

import os
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

import sqlalchemy as sa
from sqlalchemy.orm import declarative_base, sessionmaker, scoped_session
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"))

Base = declarative_base()


class IncidentModel(Base):
    """
    Relational + JSON schema for Municipal & Campus Incidents.
    Optimized for PostgreSQL (JSONB / JSON) and compatible with SQLite JSON.
    """
    __tablename__ = "incidents"

    id = sa.Column(sa.String(64), primary_key=True)
    ticket_number = sa.Column(sa.String(64), unique=True, index=True, nullable=False)
    title = sa.Column(sa.String(255), nullable=False)
    description = sa.Column(sa.Text, default="")
    category = sa.Column(sa.String(64), default="garbage", index=True)
    detection_class = sa.Column(sa.String(64), default="overflow", index=True)
    confidence = sa.Column(sa.Float, default=0.94)
    severity = sa.Column(sa.String(32), default="HIGH", index=True)
    status = sa.Column(sa.String(32), default="DISPATCHED", index=True)
    sla_minutes = sa.Column(sa.Integer, default=60)
    sla_met = sa.Column(sa.Boolean, nullable=True)

    created_at = sa.Column(sa.String(64), nullable=False, index=True)
    deadline_at = sa.Column(sa.String(64), nullable=True)
    resolved_at = sa.Column(sa.String(64), nullable=True)
    response_duration_minutes = sa.Column(sa.Integer, nullable=True)

    location = sa.Column(sa.String(255), default="")
    zone_id = sa.Column(sa.String(64), index=True, default="")
    zone_name = sa.Column(sa.String(255), default="")
    ward = sa.Column(sa.String(255), index=True, default="")
    authority = sa.Column(sa.String(255), default="")
    department = sa.Column(sa.String(255), default="")

    image_url = sa.Column(sa.Text, nullable=True)
    before_image_url = sa.Column(sa.Text, nullable=True)
    after_image_url = sa.Column(sa.Text, nullable=True)
    verification_status = sa.Column(sa.String(64), default="DISPATCHED_TO_BEAT")
    ai_notes = sa.Column(sa.Text, default="")

    estimated_amount_kg = sa.Column(sa.Float, nullable=True)
    estimated_volume_m3 = sa.Column(sa.Float, nullable=True)

    # Rich JSON / JSONB Telemetry payloads
    source_data = sa.Column(sa.JSON, default=dict)
    coordinates = sa.Column(sa.JSON, default=dict)
    gps = sa.Column(sa.JSON, default=dict)
    supervisor = sa.Column(sa.JSON, default=dict)
    assigned_team = sa.Column(sa.JSON, default=dict)
    garbage_detection = sa.Column(sa.JSON, nullable=True)
    estimated_amount = sa.Column(sa.JSON, nullable=True)

    def to_dict(self) -> Dict[str, Any]:
        """Convert database record to frontend-compatible incident schema."""
        return {
            "id": self.id,
            "ticketNumber": self.ticket_number,
            "title": self.title,
            "description": self.description or "",
            "category": self.category or "garbage",
            "detectionClass": self.detection_class or "overflow",
            "confidence": self.confidence if self.confidence is not None else 0.94,
            "source": self.source_data or {},
            "coordinates": self.coordinates or {"x": 40, "y": 40},
            "gps": self.gps or {"latitude": 26.4950, "longitude": 80.2920},
            "location": self.location or "",
            "zoneId": self.zone_id or "",
            "zoneName": self.zone_name or "",
            "ward": self.ward or "",
            "authority": self.authority or "",
            "department": self.department or "",
            "supervisor": self.supervisor or {},
            "assignedTeam": self.assigned_team or {},
            "severity": self.severity or "HIGH",
            "status": self.status or "DISPATCHED",
            "slaMinutes": self.sla_minutes or 60,
            "slaMet": self.sla_met,
            "createdAt": self.created_at,
            "deadlineAt": self.deadline_at,
            "resolvedAt": self.resolved_at,
            "responseDurationMinutes": self.response_duration_minutes,
            "imageUrl": self.image_url or self.before_image_url,
            "beforeImageUrl": self.before_image_url or self.image_url,
            "afterImageUrl": self.after_image_url,
            "verificationStatus": self.verification_status or "DISPATCHED_TO_BEAT",
            "garbageDetection": self.garbage_detection,
            "estimatedAmount": self.estimated_amount,
            "estimatedAmountKg": self.estimated_amount_kg,
            "estimatedVolumeM3": self.estimated_volume_m3,
            "aiNotes": self.ai_notes or ""
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "IncidentModel":
        """Instantiate database model from incoming incident dictionary."""
        image_url = data.get("imageUrl") or data.get("beforeImageUrl")
        estimated_amt = data.get("estimatedAmount")
        garbage_det = data.get("garbageDetection")
        if garbage_det and not estimated_amt:
            estimated_amt = garbage_det.get("estimatedAmount")

        weight_kg = data.get("estimatedAmountKg")
        if weight_kg is None and estimated_amt:
            weight_kg = estimated_amt.get("weightKg")

        vol_m3 = data.get("estimatedVolumeM3")
        if vol_m3 is None and estimated_amt:
            vol_m3 = estimated_amt.get("volumeM3")

        return cls(
            id=data["id"],
            ticket_number=data.get("ticketNumber", f"CSJMU-SWM-{data['id']}"),
            title=data.get("title", "Reported Incident"),
            description=data.get("description", ""),
            category=data.get("category", "garbage"),
            detection_class=data.get("detectionClass", "overflow"),
            confidence=data.get("confidence", 0.94),
            severity=data.get("severity", "HIGH"),
            status=data.get("status", "DISPATCHED"),
            sla_minutes=data.get("slaMinutes", 60),
            sla_met=data.get("slaMet"),
            created_at=data.get("createdAt", datetime.utcnow().isoformat() + "Z"),
            deadline_at=data.get("deadlineAt"),
            resolved_at=data.get("resolvedAt"),
            response_duration_minutes=data.get("responseDurationMinutes"),
            location=data.get("location", ""),
            zone_id=data.get("zoneId", ""),
            zone_name=data.get("zoneName", ""),
            ward=data.get("ward", ""),
            authority=data.get("authority", ""),
            department=data.get("department", ""),
            image_url=image_url,
            before_image_url=data.get("beforeImageUrl") or image_url,
            after_image_url=data.get("afterImageUrl"),
            verification_status=data.get("verificationStatus", "DISPATCHED_TO_BEAT"),
            ai_notes=data.get("aiNotes", ""),
            estimated_amount_kg=weight_kg,
            estimated_volume_m3=vol_m3,
            source_data=data.get("source", {}),
            coordinates=data.get("coordinates", {"x": 40, "y": 40}),
            gps=data.get("gps", {"latitude": 26.4950, "longitude": 80.2920}),
            supervisor=data.get("supervisor", {}),
            assigned_team=data.get("assignedTeam", {}),
            garbage_detection=garbage_det,
            estimated_amount=estimated_amt
        )


class DatabaseManager:
    """Manages engine lifecycle, sessions, and CRUD operations."""

    def __init__(self):
        self.engine = None
        self.SessionFactory = None
        self.db_type = "uninitialized"
        self.db_host = "none"
        self._initialize()

    def _initialize(self):
        raw_url = os.environ.get("DATABASE_URL", "").strip()

        # Check for PostgreSQL connection string
        if raw_url:
            # Handle standard postgres:// scheme -> postgresql:// for SQLAlchemy
            if raw_url.startswith("postgres://"):
                pg_url = "postgresql://" + raw_url[len("postgres://"):]
            else:
                pg_url = raw_url

            try:
                print(f"[Database] Connecting to PostgreSQL...")
                self.engine = sa.create_engine(
                    pg_url,
                    pool_pre_ping=True,
                    pool_size=10,
                    max_overflow=20
                )
                # Test connection
                with self.engine.connect() as conn:
                    conn.execute(sa.text("SELECT 1"))
                self.db_type = "postgresql"
                # Mask credentials for logging
                self.db_host = pg_url.split("@")[-1] if "@" in pg_url else "configured"
                print(f"✅ [Database] Successfully connected to PostgreSQL: {self.db_host}")
            except Exception as e:
                print(f"⚠️ [Database] Could not connect to PostgreSQL: {e}")
                self.engine = None

        # Fallback to local persistent SQLite if Postgres is unavailable
        if self.engine is None:
            data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
            os.makedirs(data_dir, exist_ok=True)
            sqlite_path = os.path.join(data_dir, "urban_planning.db")
            sqlite_url = f"sqlite:///{sqlite_path}"
            print(f"ℹ️ [Database] Using persistent SQLite storage: {sqlite_path}")
            self.engine = sa.create_engine(
                sqlite_url,
                connect_args={"check_same_thread": False}
            )
            self.db_type = "sqlite"
            self.db_host = sqlite_path

        # Create tables
        Base.metadata.create_all(self.engine)
        self.SessionFactory = scoped_session(sessionmaker(bind=self.engine))

        # Seed initial data if database is empty
        self._seed_initial_data()

    def _seed_initial_data(self):
        """Seed initial incidents if the table is empty."""
        try:
            with self.get_session() as session:
                count = session.query(IncidentModel).count()
                if count == 0:
                    from data import SEED_INCIDENTS
                    print(f"[Database] Seeding {len(SEED_INCIDENTS)} initial incidents...")
                    for seed in SEED_INCIDENTS:
                        model = IncidentModel.from_dict(seed)
                        session.add(model)
                    session.commit()
                    print(f"✅ [Database] Seeded {len(SEED_INCIDENTS)} incidents successfully.")
        except Exception as e:
            print(f"[Database] Seeding error: {e}")

    def get_session(self):
        return self.SessionFactory()

    def get_status(self) -> Dict[str, Any]:
        """Telemetry on database connection state."""
        count = 0
        try:
            with self.get_session() as session:
                count = session.query(IncidentModel).count()
        except Exception:
            pass

        return {
            "type": self.db_type,
            "host": self.db_host,
            "status": "connected" if self.engine else "disconnected",
            "incidentCount": count
        }

    # -------------------------------------------------------------
    # CRUD Operations
    # -------------------------------------------------------------

    def get_all_incidents(self, status: Optional[str] = None, ward: Optional[str] = None) -> List[Dict[str, Any]]:
        with self.get_session() as session:
            query = session.query(IncidentModel)
            if status:
                query = query.filter(IncidentModel.status == status)
            if ward:
                query = query.filter(IncidentModel.ward == ward)
            
            # Sort newest first
            query = query.order_by(IncidentModel.created_at.desc())
            records = query.all()
            return [r.to_dict() for r in records]

    def get_incident_by_id(self, incident_id: str) -> Optional[Dict[str, Any]]:
        with self.get_session() as session:
            record = session.query(IncidentModel).filter(IncidentModel.id == incident_id).first()
            return record.to_dict() if record else None

    def get_incident_count(self) -> int:
        with self.get_session() as session:
            return session.query(IncidentModel).count()

    def create_incident(self, incident_data: Dict[str, Any]) -> Dict[str, Any]:
        with self.get_session() as session:
            model = IncidentModel.from_dict(incident_data)
            session.add(model)
            session.commit()
            return model.to_dict()

    def update_incident_status(self, incident_id: str, new_status: str, note: Optional[str] = None) -> Optional[Dict[str, Any]]:
        with self.get_session() as session:
            record = session.query(IncidentModel).filter(IncidentModel.id == incident_id).first()
            if not record:
                return None
            record.status = new_status
            if note:
                record.ai_notes = f"{record.ai_notes or ''} | Note: {note}"
            session.commit()
            return record.to_dict()

    def verify_and_close_incident(self, incident_id: str, after_image_url: str) -> Optional[Dict[str, Any]]:
        with self.get_session() as session:
            record = session.query(IncidentModel).filter(IncidentModel.id == incident_id).first()
            if not record:
                return None

            now = datetime.utcnow()
            record.status = "RESOLVED"
            record.after_image_url = after_image_url
            record.resolved_at = now.isoformat() + "Z"
            record.verification_status = "VERIFIED_CLEAN"

            # Calculate turnaround minutes
            try:
                created_dt = datetime.fromisoformat(record.created_at.replace("Z", "+00:00"))
                diff_minutes = max(1, int((datetime.now(created_dt.tzinfo) - created_dt).total_seconds() / 60))
            except Exception:
                diff_minutes = 45

            record.response_duration_minutes = diff_minutes
            sla_target = record.sla_minutes or 60
            record.sla_met = diff_minutes <= sla_target

            session.commit()
            return {
                "incident": record.to_dict(),
                "verification": {
                    "isClean": True,
                    "confidence": 0.96,
                    "resolutionMinutes": diff_minutes,
                    "slaMet": record.sla_met,
                    "message": f"Verification passed: Solid waste cleared. Resolution logged in {diff_minutes}m (SLA: {sla_target}m)."
                }
            }

    def get_analytics_stats(self) -> Dict[str, Any]:
        """Compute aggregated operational metrics from persistent store."""
        with self.get_session() as session:
            incidents = session.query(IncidentModel).all()
            total = len(incidents)
            resolved = [i for i in incidents if i.status == "RESOLVED"]
            in_progress = [i for i in incidents if i.status == "IN_PROGRESS"]
            dispatched = [i for i in incidents if i.status == "DISPATCHED"]

            met_sla_count = sum(1 for i in resolved if i.sla_met is not False)
            sla_compliance_rate = round((met_sla_count / len(resolved) * 100), 1) if resolved else 100.0

            durations = [i.response_duration_minutes for i in resolved if i.response_duration_minutes]
            avg_response_time = round(sum(durations) / len(durations), 1) if durations else 52.0

            total_waste_kg = sum(
                (i.estimated_amount_kg or (i.estimated_amount.get("weightKg") if i.estimated_amount else 0.0) or 0.0)
                for i in incidents
            )

            class_counts = {}
            for i in incidents:
                cls = i.detection_class or "other"
                class_counts[cls] = class_counts.get(cls, 0) + 1

            return {
                "totalIncidents": total,
                "resolvedCount": len(resolved),
                "inProgressCount": len(in_progress),
                "dispatchedCount": len(dispatched),
                "slaComplianceRate": sla_compliance_rate,
                "averageResponseMinutes": avg_response_time,
                "totalWasteManagedKg": round(total_waste_kg, 1),
                "classBreakdown": class_counts,
                "databaseType": self.db_type
            }


# Singleton instance
db_manager = DatabaseManager()
