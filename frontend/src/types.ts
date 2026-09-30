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

export type ActiveTab = 'map' | 'pipeline' | 'feed' | 'planning' | 'maintenance' | 'analytics';

export type UserRole = 'admin' | 'staff' | 'student';
