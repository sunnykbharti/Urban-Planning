export type ReportSeverity = 'normal' | 'urgent' | 'low' | 'medium' | 'high' | 'critical';

export type ReportStatus = 'pending' | 'in_progress' | 'resolved' | 'dispatched';

export type ReportCategory = 
  | 'garbage'
  | 'infrastructure'
  | 'waterlogging'
  | 'safety'
  | 'plumbing'
  | 'electrical'
  | 'hvac'
  | 'other';

export type DetectionClass =
  | 'bin_empty'
  | 'bin_partial'
  | 'bin_full'
  | 'overflow'
  | 'litter_pile'
  | 'blocked_drain';

export type SensorSourceType =
  | 'DRONE_SWEEP'
  | 'CCTV_FIXED'
  | 'CITIZEN_MOBILE'
  | 'SWEEPER_VEHICLE';

export interface SupervisorContact {
  id: string;
  name: string;
  role?: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  shift?: string;
}

export interface SanitationTeam {
  teamId: string;
  name: string;
  lead?: string;
  members?: number;
  status?: string;
}

export interface BoundingBox {
  id: string;
  label: string;
  confidence: number;
  box: { ymin: number; xmin: number; ymax: number; xmax: number };
  color?: string;
  weightShareKg?: number;
}

export interface WasteCompositionItem {
  item: string;
  percentage: number;
}

export interface EstimatedAmount {
  weightKg: number;
  volumeM3: number;
  volumeLiters: number;
  spreadAreaSqM: number;
  pileDepthCm?: number;
  pileSeverity: string;
  binFillLevelPct?: number | null;
  compositionBreakdown?: WasteCompositionItem[];
  recommendedCrew?: string;
  recommendedSlaMinutes?: number;
}

export interface GarbageDetectionResult {
  isGarbageDetected: boolean;
  confidence: number;
  primaryClass: DetectionClass;
  classLabel: string;
  defaultSeverity: string;
  estimatedAmount: EstimatedAmount;
  boundingBoxes: BoundingBox[];
  source?: {
    type: SensorSourceType;
    sensorId: string;
    modelInference?: string;
  };
  imageTelemetry?: {
    width: number;
    height: number;
    edgeDensity: number;
    clutterRatio: number;
  };
  aiSummary: string;
}

export interface UploadDetectionResponse {
  success: boolean;
  message?: string;
  file: {
    filename: string;
    url: string;
    fullUrl?: string;
    sizeBytes: number;
    uploadedAt: string;
  };
  detection: GarbageDetectionResult;
}

export interface AuthorityResolution {
  zoneId: string;
  zoneName: string;
  ward: string;
  authority: string;
  department: string;
  supervisor: SupervisorContact;
  assignedTeam: SanitationTeam;
  severity: string;
  slaMinutes: number;
  deadlineAt: string;
  slaDescription?: string;
  dispatchChannel?: string;
  resolutionPath?: string[];
}

export interface MaintenanceReport {
  id: string;
  ticketNumber?: string;
  title: string;
  description?: string;
  category?: ReportCategory;
  detectionClass?: DetectionClass;
  confidence?: number;
  source?: {
    type: SensorSourceType;
    sensorId: string;
    timestamp?: string;
  };
  severity: ReportSeverity;
  status: ReportStatus;
  location: string;
  blockId?: string;
  coordinates: { x: number; y: number }; // percentage coords on map (0-100)
  gps?: { latitude: number; longitude: number };
  zoneId?: string;
  zoneName?: string;
  ward?: string;
  authority?: string;
  department?: string;
  supervisor?: SupervisorContact;
  assignedTeam?: string | SanitationTeam;
  slaMinutes?: number;
  createdAt: string;
  deadlineAt?: string;
  resolvedAt?: string | null;
  responseDurationMinutes?: number | null;
  slaMet?: boolean;
  timeAgo?: string;
  imageUrl?: string;
  imageUrls?: string[];
  beforeImageUrl?: string;
  afterImageUrl?: string | null;
  aiComparisonResult?: AiCleanupComparison;
  verificationStatus?: 'AWAITING_CLEANUP' | 'TEAM_ON_SITE' | 'DISPATCHED_TO_BEAT' | 'VERIFIED_CLEAN';
  aiNotes?: string;
  garbageDetection?: GarbageDetectionResult;
  estimatedAmount?: EstimatedAmount;
  estimatedAmountKg?: number;
  estimatedVolumeM3?: number;
  reportedBy?: {
    name: string;
    role: string;
    avatar?: string;
  };
  updates?: {
    id: string;
    timestamp: string;
    author: string;
    message: string;
    statusChange?: ReportStatus;
  }[];
}

export interface AiCleanupComparison {
  isClean: boolean;
  cleanlinessScore: number;
  debrisRemovedPct: number;
  debrisDetectedAfter: boolean;
  confidence: number;
  verificationDetails: string;
  verifiedAt: string;
}

export interface LeaveRequest {
  id: string;
  workerId: string;
  workerName: string;
  workerBadge: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  type: 'sick' | 'casual' | 'emergency' | 'earned';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  reviewedBy?: string;
  reviewRemarks?: string;
  reviewedAt?: string;
}

export interface ReassignmentRequest {
  id: string;
  reportId: string;
  reportTitle: string;
  location: string;
  workerId: string;
  workerName: string;
  workerBadge: string;
  currentBeat: string;
  reason: 'equipment_needed' | 'safety_hazard' | 'out_of_zone' | 'shift_over' | 'medical_issue';
  notes: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewRemarks?: string;
  newAssignee?: string;
}

export interface UserCredential {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  pin: string;
  agency: string;
  department: string;
  badgeNumber: string;
  lastLogin?: string;
  status: 'active' | 'suspended';
}

export interface CampusBlock {
  id: string;
  name: string;
  shortCode: string;
  department: string;
  type: 'academic' | 'library' | 'admin' | 'facility' | 'hostel' | 'sports';
  bounds: { x: number; y: number; width: number; height: number };
  activeReportsCount: number;
  urgentCount: number;
  condition: 'Good' | 'Fair' | 'Requires Attention' | 'Critical';
}

export interface ActivityEvent {
  id: string;
  type: 'dispatch' | 'resolved' | 'new_report' | 'status_change';
  title: string;
  description: string;
  location: string;
  timestamp: string;
  actor?: string;
  iconType: 'engineering' | 'check_circle' | 'report' | 'clock';
}

export interface PlanningProject {
  id: string;
  title: string;
  block: string;
  stage: 'Backlog' | 'Assessment' | 'Procurement' | 'In Progress' | 'Completed';
  budget: string;
  targetDate: string;
  priority: 'High' | 'Medium' | 'Low';
  leadEngineer: string;
}

export type ActiveTab = 
  | 'student_dashboard'
  | 'bvg_dashboard'
  | 'management_dashboard'
  | 'operator_dashboard' 
  | 'admin_dashboard' 
  | 'cctv_pipeline'
  | 'map' 
  | 'heatisland' 
  | 'pipeline' 
  | 'feed' 
  | 'planning' 
  | 'maintenance' 
  | 'analytics';

export type UserRole = 'student' | 'bvg_worker' | 'management' | 'super_admin' | 'admin' | 'operator';

export type RolePermission = 
  | 'lodge_report'
  | 'view_public_map'
  | 'view_cool_havens'
  | 'view_bvg_tasks'
  | 'start_bvg_task'
  | 'verify_closure'
  | 'dispatch_crews'
  | 'manage_sla'
  | 'audit_contractors'
  | 'manage_users'
  | 'system_settings'
  | 'database_config';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  agency: string;
  department: string;
  badgeNumber: string;
  email: string;
  avatar: string;
  pin: string;
  permissions: RolePermission[];
}

export const DEFAULT_PROFILES: Record<'student' | 'bvg_worker' | 'management' | 'super_admin', UserProfile> = {
  student: {
    id: 'USR-STU-01',
    name: 'Sunny Bharti',
    role: 'student',
    roleTitle: 'UIET B.Tech Student / Campus Citizen',
    agency: 'CSJMU Student Body',
    department: 'Computer Science & Engineering (UIET)',
    badgeNumber: 'CSJMU/UIET/2023/104',
    email: 'sunny.student@csjmu.ac.in',
    avatar: '👨‍🎓',
    pin: '', // No PIN required for students/public audience
    permissions: ['lodge_report', 'view_public_map', 'view_cool_havens']
  },
  bvg_worker: {
    id: 'USR-BVG-204',
    name: 'Ramesh Kumar',
    role: 'bvg_worker',
    roleTitle: 'Sanitation Beat Lead (BVG India)',
    agency: 'BVG India Ltd. (Campus Facility Management)',
    department: 'CSJMU Solid Waste Cleansing Beat 01',
    badgeNumber: 'BVG-IND-KNP-204',
    email: 'ramesh.bvg@csjmu.facility.in',
    avatar: '👷‍♂️',
    pin: '1234',
    permissions: ['lodge_report', 'view_bvg_tasks', 'start_bvg_task', 'verify_closure']
  },
  management: {
    id: 'USR-MGT-101',
    name: 'Er. R. K. Sharma',
    role: 'management',
    roleTitle: 'Executive Sanitation Engineer',
    agency: 'CSJMU Directorate of Estate & Works',
    department: 'Campus Works & Public Health Engineering',
    badgeNumber: 'CSJMU-EST-019',
    email: 'rksharma.estate@csjmu.ac.in',
    avatar: '👨‍💼',
    pin: '5678',
    permissions: [
      'lodge_report', 'view_public_map', 'view_cool_havens',
      'view_bvg_tasks', 'start_bvg_task', 'verify_closure',
      'dispatch_crews', 'manage_sla', 'audit_contractors'
    ]
  },
  super_admin: {
    id: 'USR-ADM-001',
    name: 'Vice Chancellor / Registrar Office',
    role: 'super_admin',
    roleTitle: 'Chief System Administrator & Master Key',
    agency: 'CSJMU Central Secretariat',
    department: 'Directorate of Campus Administration & IT',
    badgeNumber: 'CSJMU-ROOT-001',
    email: 'admin.root@csjmu.ac.in',
    avatar: '🏛️',
    pin: '9999',
    permissions: [
      'lodge_report', 'view_public_map', 'view_cool_havens',
      'view_bvg_tasks', 'start_bvg_task', 'verify_closure',
      'dispatch_crews', 'manage_sla', 'audit_contractors',
      'manage_users', 'system_settings', 'database_config'
    ]
  }
};

export type HeatIslandLayer = 
  | 'temperature'
  | 'canopy'
  | 'density'
  | 'pavement'
  | 'water'
  | 'pedestrian'
  | 'composite';

export type InterventionCategory = 
  | 'treePlanting'
  | 'shadeStructures'
  | 'coolPavement'
  | 'optimalSeating';

export interface MicroclimateSector {
  id: string;
  name: string;
  zone: string;
  bounds: { x: number; y: number; width: number; height: number };
  gps: { latitude: number; longitude: number };
  metrics: {
    surfaceTempC: number;
    treeCanopyPct: number;
    buildingDensityPct: number;
    pavedSurfacePct: number;
    waterBodyBufferM: number;
    pedestrianFootfall: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
    albedo: number;
  };
  heatRiskScore: number;
  classification: 'CRITICAL_HOT_ZONE' | 'HIGH_STRESS' | 'MODERATE' | 'COOL_REFUGE';
  statusColor: string;
  exposureSummary: string;
}

export interface TreePlantingIntervention {
  id: string;
  title: string;
  sectorId: string;
  location: string;
  coordinates: { x: number; y: number };
  gps: { latitude: number; longitude: number };
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedSpecies: {
    name: string;
    reason: string;
    coolingEffect: string;
  }[];
  treeCountTarget: number;
  estimatedTempDropC: number;
  soilPermeability: string;
  undergroundUtilitiesCheck: string;
  whyHere: string;
}

export interface ShadeStructureIntervention {
  id: string;
  title: string;
  sectorId: string;
  location: string;
  coordinates: { x: number; y: number };
  gps: { latitude: number; longitude: number };
  structureType: string;
  spanLengthMeters: number;
  uvProtectionPct: number;
  solarInsolationCut: string;
  whyNoTrees: string;
  immediateImpact: string;
}

export interface CoolPavementIntervention {
  id: string;
  title: string;
  sectorId: string;
  location: string;
  coordinates: { x: number; y: number };
  gps: { latitude: number; longitude: number };
  currentMaterial: string;
  recommendedTreatment: string;
  retrofitAreaSqM: number;
  expectedSurfaceTempDrop: string;
  permeabilityGain: string;
}

export interface OptimalSeatingIntervention {
  id: string;
  title: string;
  sectorId: string;
  location: string;
  coordinates: { x: number; y: number };
  gps: { latitude: number; longitude: number };
  thermalComfortIndex: string;
  canopyShadeFactor: string;
  windChanneling: string;
  furnitureType: string;
  capacity: number;
  walkDistanceMinutes: string;
}

export interface MicroclimateSummary {
  avgSurfaceTempC: number;
  peakHotZoneTempC: number;
  coolOasisTempC: number;
  uhiDeltaRangeC: number;
  criticalHotZonesCount: number;
  avgTreeCanopyPct: number;
  avgPavedSurfacePct: number;
  totalInterventions: {
    treePlantingTarget: number;
    shadeCanopyMeters: number;
    coolPavementSqM: number;
    seatingCapacity: number;
  };
}

// -------------------------------------------------------------
// CCTV Garbage Detection 8-Stage Pipeline Types
// -------------------------------------------------------------

export interface CctvCamera {
  id: string;
  name: string;
  location: string;
  zoneId: string;
  zoneName: string;
  ward: string;
  coordinates: { x: number; y: number };
  gps: { latitude: number; longitude: number };
  resolution: string;
  fps: number;
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE';
  ipAddress: string;
  streamType?: string;
  channelId?: string;
  inferenceInputSize?: number;
  snapshotUri?: string;
  rtspSubstreamUri?: string;
  installedHeightMeters: number;
  sampleImages?: Record<string, string>;
}

export interface CctvSweep {
  slot: string;
  name: string;
  description: string;
  targetTime: string;
  window?: string;
  stratified?: boolean;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED' | 'PENDING';
  lastRun: string;
  detectionsCount: number;
  ticketsGenerated: number;
}

export interface CctvPipelineRun {
  runId: string;
  timestamp: string;
  sweepSlot: string;
  camera: {
    id: string;
    name: string;
    location: string;
    zone: string;
  };
  frameUrl: string;
  detection: {
    detectionClass: string;
    confidence: number;
    boundingBox?: { ymin: number; xmin: number; ymax: number; xmax: number } | null;
    estimatedAmount?: any;
  };
  decision: {
    passesConfidence: boolean;
    isSignificant: boolean;
    isDuplicate: boolean;
    shouldCreateTicket: boolean;
  };
  ticket?: {
    title: string;
    summary: string;
    priority: string;
    suggestedAction: string;
    aiModel: string;
    confidenceScore: number;
  } | null;
  createdIncidentId?: string | null;
  ticketNumber?: string | null;
  status: 'TICKET_DISPATCHED' | 'DUPLICATE_IGNORED' | 'CLEAN_RECORDED';
}

