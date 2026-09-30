/**
 * API client to communicate with the Flask Urban Operations backend.
 * Provides fallback mock responses when running frontend standalone.
 */

import { MaintenanceReport, AuthorityResolution, DetectionClass, SensorSourceType } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function checkBackendHealth(): Promise<{ online: boolean; version?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const data = await res.json();
      return { online: true, version: data.version };
    }
  } catch (err) {
    // Backend offline
  }
  return { online: false };
}

export async function fetchIncidentsFromBackend(): Promise<MaintenanceReport[] | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/incidents`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      return data.incidents;
    }
  } catch (err) {
    console.warn('Backend unavailable, using local mock data');
  }
  return null;
}

export async function resolveAuthorityAPI(
  coords: { x: number; y: number },
  detectionClass: DetectionClass = 'overflow',
  severity?: string
): Promise<AuthorityResolution> {
  try {
    const res = await fetch(`${API_BASE_URL}/resolve-authority`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coords, detectionClass, severity }),
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Authority Resolution Engine API call failed, using client fallback');
  }

  // Client-side fallback if backend is offline
  return {
    zoneId: 'zone-academic',
    zoneName: 'Academic Precinct (UIET Campus)',
    ward: 'Ward 4 - Academic Division',
    authority: 'CSJMU Directorate of Estate & Works',
    department: 'Campus Solid Waste & Academic Sanitation',
    supervisor: {
      id: 'SUP-101',
      name: 'Er. R. K. Sharma',
      phone: '+91 98765 43210',
      whatsapp: '+919876543210',
      role: 'Executive Sanitation Engineer'
    },
    assignedTeam: {
      teamId: 'BEAT-01',
      name: 'Sanitation Beat Alpha (UIET)',
      lead: 'Ramesh Kumar'
    },
    severity: severity || 'high',
    slaMinutes: detectionClass === 'blocked_drain' ? 30 : 60,
    deadlineAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    resolutionPath: [
      `Coordinates (${coords.x}%, ${coords.y}%)`,
      'Ward 4 - Academic Division',
      'CSJMU Directorate of Estate & Works',
      'Campus Solid Waste & Academic Sanitation',
      'Er. R. K. Sharma (+91 98765 43210)',
      'Sanitation Beat Alpha (UIET)',
      '60 min SLA'
    ]
  };
}

export async function createIncidentAPI(payload: {
  title: string;
  coordinates: { x: number; y: number };
  detectionClass: DetectionClass;
  sourceType?: SensorSourceType;
  beforeImageUrl?: string;
  severity?: string;
  aiNotes?: string;
}): Promise<MaintenanceReport | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Create incident API failed, using client handling');
  }
  return null;
}

export async function verifyAndCloseAPI(
  incidentId: string,
  afterImageUrl: string
): Promise<{ incident: MaintenanceReport; verification: any } | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/incidents/${incidentId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ afterImageUrl }),
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Verify API failed');
  }
  return null;
}

export async function simulateCVDetectionAPI(
  sourceType: SensorSourceType,
  targetClass: DetectionClass
): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/detect/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceType, targetClass }),
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('CV simulate API failed, using fallback');
  }

  return {
    detectionClass: targetClass,
    confidence: 0.94,
    source: { type: sourceType, sensorId: `SENSOR_${sourceType.slice(0, 3)}` },
    boundingBox: { ymin: 0.25, xmin: 0.3, ymax: 0.65, xmax: 0.7 },
    estimatedVolumeM3: 0.5
  };
}
