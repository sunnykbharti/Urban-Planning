import { MaintenanceReport } from '../types';

// Accurate geographical coordinates for CSJMU Kanpur (Chhatrapati Shahu Ji Maharaj University)
// Kalyanpur, Kanpur Nagar, Uttar Pradesh 208012
export const CSJMU_CENTER: [number, number] = [26.5030, 80.2678];

// Bounding box enclosing the university campus grounds
export const CSJMU_BOUNDS = {
  minLat: 26.4985,
  maxLat: 26.5075,
  minLng: 26.2635, // fallback if needed, but primary is:
  westLng: 80.2630,
  eastLng: 80.2735
};

// Major landmark buildings and zones within CSJMU Kanpur
export interface CampusLandmark {
  id: string;
  name: string;
  shortName: string;
  category: 'academic' | 'library' | 'admin' | 'workshop' | 'hostel' | 'sports' | 'amenity' | 'gate';
  coords: [number, number];
  description: string;
}

export const CSJMU_LANDMARKS: CampusLandmark[] = [
  {
    id: 'block-1',
    name: 'UIET Block 1 (Computer Science & Information Tech)',
    shortName: 'UIET Block 1',
    category: 'academic',
    coords: [26.5028, 80.2658],
    description: 'CSE, IT departments, AI Labs, and High Performance Computing center.'
  },
  {
    id: 'block-2',
    name: 'UIET Block 2 (Mechanical & Civil Engineering)',
    shortName: 'UIET Block 2',
    category: 'academic',
    coords: [26.5022, 80.2672],
    description: 'Mechanical Engineering, Civil Engineering, Materials Testing Lab.'
  },
  {
    id: 'block-3',
    name: 'UIET Block 3 (Electronics, Chemical & Biotechnology)',
    shortName: 'UIET Block 3',
    category: 'academic',
    coords: [26.5035, 80.2668],
    description: 'ECE, Chemical Engineering, Biotech & Nanotechnology labs.'
  },
  {
    id: 'library',
    name: 'Central University Library (Dr. B.R. Ambedkar Library)',
    shortName: 'Central Library',
    category: 'library',
    coords: [26.5045, 80.2688],
    description: 'Central academic repository, AC digital commons, e-journal terminals.'
  },
  {
    id: 'workshop',
    name: 'Central Mechanical Workshop & Fabrication Bay',
    shortName: 'Central Workshop',
    category: 'workshop',
    coords: [26.5012, 80.2652],
    description: 'Heavy machinery, CNC milling, welding bays, and student fabrication lab.'
  },
  {
    id: 'science-block-b',
    name: 'Science Block B (Physics, Chemistry & Applied Sciences)',
    shortName: 'Science Block B',
    category: 'academic',
    coords: [26.5052, 80.2665],
    description: 'Applied science laboratories, analytical instrumentation facility.'
  },
  {
    id: 'admin-block',
    name: 'UIET Administrative Block & Directorate of Works',
    shortName: 'Admin HQ',
    category: 'admin',
    coords: [26.5034, 80.2695],
    description: 'Estate Directorate, Public Health Engineering office, Vice Chancellor Secretariat.'
  },
  {
    id: 'sports-complex',
    name: 'University Sports Stadium & Athletic Pavilion',
    shortName: 'Sports Complex',
    category: 'sports',
    coords: [26.5058, 80.2718],
    description: 'Athletic track, cricket ground, indoor badminton & gymnasium courts.'
  },
  {
    id: 'hostels',
    name: 'Shivaji Boys Hostel & Gargi Girls Hostel Complex',
    shortName: 'Hostel Complex',
    category: 'hostel',
    coords: [26.4998, 80.2708],
    description: 'Undergraduate & postgraduate student residential dormitories.'
  },
  {
    id: 'canteen-quad',
    name: 'Central Student Cafeteria & Recreation Concourse',
    shortName: 'Student Cafeteria',
    category: 'amenity',
    coords: [26.5025, 80.2680],
    description: 'Central dining hall, student cooperative store, xerox center.'
  },
  {
    id: 'health-centre',
    name: 'University Health Centre & Emergency Clinic',
    shortName: 'Health Centre',
    category: 'amenity',
    coords: [26.5018, 80.2686],
    description: '24/7 First aid medical station, campus doctor, pharmacy.'
  },
  {
    id: 'main-gate',
    name: 'CSJMU Main Entrance Gate (Kalyanpur GT Road)',
    shortName: 'North Gate (GT Rd)',
    category: 'gate',
    coords: [26.5068, 80.2645],
    description: 'Primary security checkpoint, visitor verification, bus terminal.'
  }
];

// Approximate CSJMU Campus Boundary polygon (lat/lng coordinates)
export const CSJMU_CAMPUS_BOUNDARY: [number, number][] = [
  [26.5072, 80.2638], // NW near GT Road Entrance
  [26.5076, 80.2675], // North boundary along perimeter road
  [26.5068, 80.2730], // NE near Sports stadium corner
  [26.5035, 80.2735], // East boundary
  [26.4995, 80.2725], // SE near Hostel perimeter
  [26.4988, 80.2685], // South boundary
  [26.4992, 80.2645], // SW near Workshop rear
  [26.5015, 80.2635], // West boundary
  [26.5050, 80.2638], // West boundary mid
  [26.5072, 80.2638]  // Closing the loop
];

export type SeverityColor = 'red' | 'yellow' | 'green';

export interface SeverityConfig {
  color: SeverityColor;
  label: string;
  sublabel: string;
  hex: string;
  glowHex: string;
  borderHex: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export const SEVERITY_CONFIGS: Record<SeverityColor, SeverityConfig> = {
  red: {
    color: 'red',
    label: 'Critical / Urgent',
    sublabel: 'Requires Immediate Action (Within 2-4 hrs)',
    hex: '#ef4444',
    glowHex: 'rgba(239, 68, 68, 0.45)',
    borderHex: '#b91c1c',
    badgeBg: 'bg-red-500/15',
    badgeText: 'text-red-700',
    badgeBorder: 'border-red-400/40'
  },
  yellow: {
    color: 'yellow',
    label: 'Medium / Normal',
    sublabel: 'Active Maintenance (Within 24-48 hrs)',
    hex: '#f59e0b',
    glowHex: 'rgba(245, 158, 11, 0.45)',
    borderHex: '#d97706',
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-400/40'
  },
  green: {
    color: 'green',
    label: 'Low / Resolved',
    sublabel: 'Scheduled or Cleared / Safe',
    hex: '#10b981',
    glowHex: 'rgba(16, 185, 129, 0.45)',
    borderHex: '#047857',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-400/40'
  }
};

/**
 * Determine severity color classification (red / yellow / green)
 * based on report severity and status.
 */
export function getReportSeverityColor(report: MaintenanceReport): SeverityColor {
  // If report has been resolved, it's green (resolved / safe)
  if (report.status === 'resolved') {
    return 'green';
  }

  const sev = (report.severity || '').toLowerCase();

  // Urgent, critical, high -> RED
  if (sev === 'urgent' || sev === 'critical' || sev === 'high') {
    return 'red';
  }

  // Medium, normal -> YELLOW
  if (sev === 'medium' || sev === 'normal') {
    return 'yellow';
  }

  // Low severity -> GREEN
  if (sev === 'low') {
    return 'green';
  }

  // Default to yellow for unclassified active reports
  return 'yellow';
}

/**
 * Map any report to its geographic lat/lng coordinate on CSJMU Kanpur campus.
 */
export function getReportLatLng(report: MaintenanceReport): [number, number] {
  // 1. Explicit GPS coordinates
  if (report.gps && report.gps.latitude && report.gps.longitude) {
    return [report.gps.latitude, report.gps.longitude];
  }

  // 2. Match with known campus landmark by blockId or location text
  const landmark = CSJMU_LANDMARKS.find(l => 
    (report.blockId && l.id === report.blockId) ||
    (report.location && report.location.toLowerCase().includes(l.shortName.toLowerCase()))
  );

  // Deterministic jitter based on report id so multiple reports at the same building don't overlap completely
  const hash = (report.id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const jitterLat = ((hash % 7) - 3) * 0.00025;
  const jitterLng = (((hash * 3) % 7) - 3) * 0.00025;

  if (landmark) {
    return [
      Number((landmark.coords[0] + jitterLat).toFixed(6)),
      Number((landmark.coords[1] + jitterLng).toFixed(6))
    ];
  }

  // 3. Fallback: Map percentage coordinates {x, y} to CSJMU bounding box
  if (report.coordinates && typeof report.coordinates.x === 'number' && typeof report.coordinates.y === 'number') {
    const latSpan = CSJMU_BOUNDS.maxLat - CSJMU_BOUNDS.minLat;
    const lngSpan = CSJMU_BOUNDS.eastLng - CSJMU_BOUNDS.westLng;

    // x: 0% is West, 100% is East
    // y: 0% is North, 100% is South
    const lat = CSJMU_BOUNDS.maxLat - (report.coordinates.y / 100) * latSpan;
    const lng = CSJMU_BOUNDS.westLng + (report.coordinates.x / 100) * lngSpan;

    return [
      Number(lat.toFixed(6)),
      Number(lng.toFixed(6))
    ];
  }

  // 4. Default to CSJMU Center with small hash jitter
  return [
    Number((CSJMU_CENTER[0] + jitterLat).toFixed(6)),
    Number((CSJMU_CENTER[1] + jitterLng).toFixed(6))
  ];
}
