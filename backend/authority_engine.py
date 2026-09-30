"""
Authority Resolution Engine (ARE)
Performs hierarchical municipal & institutional mapping:
GPS Coordinates / Spatial Bounds -> Ward / Zone -> Municipal Authority -> Department -> Sanitation Supervisor -> Cleaning Team -> Ticket with SLA
"""

import math
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from data import ZONES_CONFIG, SLA_RULES

class AuthorityResolutionEngine:
    def __init__(self):
        self.zones = ZONES_CONFIG
        self.sla_rules = SLA_RULES

    def resolve_zone_by_coords(self, x: float, y: float) -> Dict[str, Any]:
        """
        Determines the zone by campus map coordinate bounds (0-100%).
        Falls back to nearest zone center if outside exact bounding box.
        """
        for zone in self.zones:
            b = zone["bounds"]
            if b["minX"] <= x <= b["maxX"] and b["minY"] <= y <= b["maxY"]:
                return zone

        # Fallback: find nearest zone center
        def distance_to_zone(zone):
            center_x = (zone["bounds"]["minX"] + zone["bounds"]["maxX"]) / 2
            center_y = (zone["bounds"]["minY"] + zone["bounds"]["maxY"]) / 2
            return math.hypot(x - center_x, y - center_y)

        return min(self.zones, key=distance_to_zone)

    def resolve_zone_by_gps(self, latitude: float, longitude: float) -> Dict[str, Any]:
        """
        Determines the zone by GPS latitude and longitude (Euclidean approximation for campus scale).
        """
        def gps_distance(zone):
            g = zone["gpsCenter"]
            return math.hypot(latitude - g["latitude"], longitude - g["longitude"])

        return min(self.zones, key=gps_distance)

    def resolve_authority(
        self,
        coords: Optional[Dict[str, float]] = None,
        gps: Optional[Dict[str, float]] = None,
        detection_class: str = "overflow",
        custom_severity: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Execute the Complete Authority Resolution Pipeline:
        GPS / Coordinates
              ↓
        Ward / Zone
              ↓
        Municipal Authority
              ↓
        Department
              ↓
        Responsible Sanitation Supervisor
              ↓
        Nearest Cleaning Team
              ↓
        Enforced SLA Contract
        """
        # Step 1: Spatial Zone Resolution
        if coords and "x" in coords and "y" in coords:
            zone = self.resolve_zone_by_coords(coords["x"], coords["y"])
        elif gps and "latitude" in gps and "longitude" in gps:
            zone = self.resolve_zone_by_gps(gps["latitude"], gps["longitude"])
        else:
            # Default to first zone
            zone = self.zones[0]

        # Step 2: SLA & Severity Determination
        sla_info = self.sla_rules.get(detection_class, self.sla_rules["overflow"])
        severity = custom_severity or sla_info["severity"]
        sla_minutes = sla_info["slaMinutes"]

        # Step 3: Available Team Selection (Nearest / Active Beat)
        teams = zone.get("teams", [])
        assigned_team = None
        for team in teams:
            if team.get("status") in ["AVAILABLE", "ON_PATROL"]:
                assigned_team = team
                break
        if not assigned_team and teams:
            assigned_team = teams[0]

        now = datetime.utcnow()
        deadline = now + timedelta(minutes=sla_minutes)

        return {
            "zoneId": zone["id"],
            "zoneName": zone["name"],
            "ward": zone["ward"],
            "authority": zone["authority"],
            "department": zone["department"],
            "supervisor": zone["supervisor"],
            "assignedTeam": {
                "teamId": assigned_team["id"] if assigned_team else "BEAT-DEFAULT",
                "name": assigned_team["name"] if assigned_team else "General Sanitation Squad",
                "lead": assigned_team.get("lead", "Duty Supervisor") if assigned_team else "On-Call Officer"
            },
            "severity": severity,
            "slaMinutes": sla_minutes,
            "deadlineAt": deadline.isoformat() + "Z",
            "slaDescription": sla_info["description"],
            "dispatchChannel": "WHATSAPP_&_DASHBOARD",
            "resolutionPath": [
                f"Coordinates ({coords.get('x', 0) if coords else 0}, {coords.get('y', 0) if coords else 0})",
                f"Ward: {zone['ward']}",
                f"Authority: {zone['authority']}",
                f"Dept: {zone['department']}",
                f"Supervisor: {zone['supervisor']['name']} ({zone['supervisor']['phone']})",
                f"Assigned: {assigned_team['name'] if assigned_team else 'Beat Squad'}",
                f"Target SLA: {sla_minutes} min deadline"
            ]
        }

authority_engine = AuthorityResolutionEngine()
