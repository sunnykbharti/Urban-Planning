export type ReportSeverity = 'normal' | 'urgent';

export type ReportStatus = 'pending' | 'in_progress' | 'resolved';

export type ReportCategory = 
  | 'garbage'
  | 'infrastructure'
  | 'waterlogging'
  | 'safety'
  | 'plumbing'
  | 'electrical'
  | 'hvac'
  | 'other';

export interface MaintenanceReport {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  severity: ReportSeverity;
  status: ReportStatus;
  location: string;
  blockId?: string;
  coordinates: { x: number; y: number }; // percentage coords on map (0-100)
  createdAt: string;
  timeAgo: string;
  imageUrl?: string;
  assignedTeam?: string;
  reportedBy: {
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

export type ActiveTab = 'map' | 'feed' | 'planning' | 'maintenance' | 'analytics';

export type UserRole = 'admin' | 'staff' | 'student';
