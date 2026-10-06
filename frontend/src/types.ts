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
  beforeImageUrl?: string;
  afterImageUrl?: string | null;
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
  | 'operator_dashboard' 
  | 'admin_dashboard' 
  | 'map' 
  | 'heatisland' 
  | 'pipeline' 
  | 'feed' 
  | 'planning' 
  | 'maintenance' 
  | 'analytics';

export type UserRole = 'admin' | 'operator' | 'student';

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

