import React, { useState, useEffect } from 'react';
import { 
  MaintenanceReport, 
  CampusBlock, 
  ActivityEvent, 
  ActiveTab, 
  UserRole, 
  ReportStatus,
  LeaveRequest,
  ReassignmentRequest,
  UserCredential,
  AiCleanupComparison
} from './types';
import { 
  initialBlocks, 
  initialReports, 
  initialActivities,
  initialLeaveRequests,
  initialReassignmentRequests,
  initialCredentials
} from './data/mockData';
import { TopNavBar } from './components/TopNavBar';
import { SideNavBar } from './components/SideNavBar';
import { CampusMap } from './components/CampusMap';
import { ReportIssueDrawer } from './components/ReportIssueDrawer';
import { MaintenanceManagementPanel } from './components/MaintenanceManagementPanel';
import { ReportDetailsModal } from './components/ReportDetailsModal';
import { LiveFeedView } from './components/LiveFeedView';
import { PlanningBoardView } from './components/PlanningBoardView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsModal } from './components/SettingsModal';
import { PipelineVisualizer } from './components/PipelineVisualizer';
import { CctvPipelineDashboard } from './components/CctvPipelineDashboard';
import { HeatIslandMapView } from './components/HeatIslandMapView';
import { StudentDashboard } from './components/StudentDashboard';
import { OperatorDashboard } from './components/OperatorDashboard';
import { BvgWorkerDashboard } from './components/BvgWorkerDashboard';
import { ManagementDashboard } from './components/ManagementDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { RoleAuthModal } from './components/RoleAuthModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TermsAndConditionsView } from './components/TermsAndConditionsView';
import { PrivacyPolicyView } from './components/PrivacyPolicyView';
import { StaffOperationsView } from './components/StaffOperationsView';
import { DEFAULT_PROFILES, UserProfile } from './types';
import { 
  checkBackendHealth, 
  fetchIncidentsFromBackend, 
  createIncidentAPI,
  updateIncidentStatusAPI,
  verifyAndCloseAPI 
} from './api/client';
import { CheckCircle2, AlertTriangle, Info, Server, Flame } from 'lucide-react';

const SEED_DATA_VERSION = 'v3.0';

// Check if seed version is up to date, otherwise initialize fresh seeded data
if (typeof window !== 'undefined') {
  const currentVer = localStorage.getItem('csjmu_seed_version');
  if (currentVer !== SEED_DATA_VERSION) {
    localStorage.setItem('csjmu_reports', JSON.stringify(initialReports));
    localStorage.setItem('csjmu_activities', JSON.stringify(initialActivities));
    localStorage.setItem('csjmu_leave_requests', JSON.stringify(initialLeaveRequests));
    localStorage.setItem('csjmu_reassign_requests', JSON.stringify(initialReassignmentRequests));
    localStorage.setItem('csjmu_credentials', JSON.stringify(initialCredentials));
    localStorage.setItem('csjmu_seed_version', SEED_DATA_VERSION);
  }
}

export default function App() {
  // Application State
  const [reports, setReports] = useState<MaintenanceReport[]>(() => {
    const saved = localStorage.getItem('csjmu_reports');
    return saved ? JSON.parse(saved) : initialReports;
  });

  const [blocks] = useState<CampusBlock[]>(initialBlocks);

  const [activities, setActivities] = useState<ActivityEvent[]>(() => {
    const saved = localStorage.getItem('csjmu_activities');
    return saved ? JSON.parse(saved) : initialActivities;
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('csjmu_leave_requests');
    return saved ? JSON.parse(saved) : initialLeaveRequests;
  });

  const [reassignmentRequests, setReassignmentRequests] = useState<ReassignmentRequest[]>(() => {
    const saved = localStorage.getItem('csjmu_reassign_requests');
    return saved ? JSON.parse(saved) : initialReassignmentRequests;
  });

  const [credentials, setCredentials] = useState<UserCredential[]>(() => {
    const saved = localStorage.getItem('csjmu_credentials');
    return saved ? JSON.parse(saved) : initialCredentials;
  });

  const [userRole, setUserRole] = useState<UserRole>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const r = params.get('role') as UserRole;
      if (r && ['student', 'bvg_worker', 'management', 'super_admin', 'operator', 'admin'].includes(r)) return r;
    }
    const saved = localStorage.getItem('csjmu_user_role') as UserRole;
    return (saved && ['student', 'bvg_worker', 'management', 'super_admin', 'operator', 'admin'].includes(saved)) ? saved : 'student';
  });

  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile>(() => {
    const norm = (userRole === 'admin' ? 'super_admin' : userRole === 'operator' ? 'bvg_worker' : userRole) as any;
    return DEFAULT_PROFILES[norm] || DEFAULT_PROFILES.student;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as ActiveTab;
      if (tabParam) return tabParam;
    }
    return userRole === 'student' ? 'student_dashboard' : userRole === 'bvg_worker' || userRole === 'operator' ? 'bvg_dashboard' : userRole === 'management' ? 'management_dashboard' : 'admin_dashboard';
  });

  const [targetAuthRole, setTargetAuthRole] = useState<UserRole | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const handleRoleChange = (newRole: UserRole, newProfile?: UserProfile) => {
    setUserRole(newRole);
    localStorage.setItem('csjmu_user_role', newRole);
    if (newProfile) {
      setCurrentUserProfile(newProfile);
    } else {
      const norm = (newRole === 'admin' ? 'super_admin' : newRole === 'operator' ? 'bvg_worker' : newRole) as any;
      if (DEFAULT_PROFILES[norm]) setCurrentUserProfile(DEFAULT_PROFILES[norm]);
    }

    if (newRole === 'student') {
      setActiveTab('student_dashboard');
    } else if (newRole === 'bvg_worker' || newRole === 'operator') {
      setActiveTab('bvg_dashboard');
    } else if (newRole === 'management') {
      setActiveTab('management_dashboard');
    } else {
      setActiveTab('admin_dashboard');
    }
  };

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  const handleOpenAccountSwitcher = (target?: UserRole) => {
    setTargetAuthRole(target || null);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (authenticatedRole: UserRole, profile: UserProfile) => {
    setIsAuthenticated(true);
    handleRoleChange(authenticatedRole, profile);
    showToast(`Signed in as ${profile.name} (${profile.roleTitle})`, 'success');
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    const guestProfile: UserProfile = {
      name: 'Campus Citizen (Guest)',
      role: 'student',
      roleTitle: 'Guest Citizen',
      department: 'Kanpur Nagar Public Civic Hub',
      badgeNumber: 'GUEST-CIVIC',
      email: '',
      avatar: 'GC',
      pin: '',
      permissions: ['lodge_report', 'view_public_map']
    };
    setCurrentUserProfile(guestProfile);
    setUserRole('student');
    setActiveTab('student_dashboard');
    showToast('Signed out. Active view: Student / Civic Hub', 'info');
  };
  
  // Modals and Drawers
  const [isReportDrawerOpen, setIsReportDrawerOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('report') === '1';
    }
    return false;
  });
  const [reportDrawerLocation, setReportDrawerLocation] = useState<string>('UIET Block 1 (Pedestrian Quad)');
  const [reportDrawerCoords, setReportDrawerCoords] = useState<{ x: number; y: number }>({ x: 38, y: 38 });
  const [selectedReportDetails, setSelectedReportDetails] = useState<MaintenanceReport | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('modal') === '1') {
        const saved = localStorage.getItem('csjmu_reports');
        const list = saved ? JSON.parse(saved) : initialReports;
        return list && list.length > 0 ? list[0] : null;
      }
    }
    return null;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  
  // Toast Alert Notification state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'urgent' | 'info' } | null>(null);

  // Backend Connection Status
  const [backendStatus, setBackendStatus] = useState<{ online: boolean; version?: string }>({ online: false });

  // Check Flask backend health on load
  useEffect(() => {
    checkBackendHealth().then((status) => {
      setBackendStatus(status);
      if (status.online) {
        fetchIncidentsFromBackend().then((apiIncidents) => {
          if (apiIncidents && apiIncidents.length > 0) {
            setReports(apiIncidents);
          }
        });
      }
    });
  }, []);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('csjmu_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('csjmu_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('csjmu_leave_requests', JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem('csjmu_reassign_requests', JSON.stringify(reassignmentRequests));
  }, [reassignmentRequests]);

  useEffect(() => {
    localStorage.setItem('csjmu_credentials', JSON.stringify(credentials));
  }, [credentials]);

  const showToast = (text: string, type: 'success' | 'urgent' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handlers
  const handleCreateReport = (newReportData: Omit<MaintenanceReport, 'id' | 'createdAt' | 'timeAgo'>) => {
    const newReport: MaintenanceReport = {
      ...newReportData,
      id: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      timeAgo: 'Just now'
    };

    setReports([newReport, ...reports]);

    // Create activity event
    const newAct: ActivityEvent = {
      id: `act-${Date.now()}`,
      type: 'new_report',
      title: `New report filed: ${newReport.title}`,
      description: `${(newReport.description || '').slice(0, 80)}...`,
      location: newReport.location,
      timestamp: 'JUST NOW',
      actor: newReport.reportedBy?.name || 'Campus Reporter',
      iconType: newReport.severity === 'urgent' ? 'report' : 'engineering'
    };

    setActivities([newAct, ...activities]);

    if (backendStatus.online) {
      createIncidentAPI({
        title: newReport.title,
        description: newReport.description,
        category: newReport.category,
        coordinates: newReport.coordinates,
        detectionClass: newReport.detectionClass || (newReport.category === 'waterlogging' ? 'blocked_drain' : 'overflow'),
        severity: newReport.severity,
        imageUrl: newReport.imageUrl,
        beforeImageUrl: newReport.imageUrl,
        garbageDetection: newReport.garbageDetection,
        estimatedAmount: newReport.estimatedAmount
      }).then((created) => {
        if (created) {
          setReports(prev => prev.map(r => r.id === newReport.id ? { 
            ...r, 
            id: created.id, 
            ticketNumber: created.ticketNumber,
            zoneName: created.zoneName,
            ward: created.ward,
            authority: created.authority,
            department: created.department
          } : r));
        }
      }).catch(err => console.warn('Failed to persist incident to backend:', err));
    }

    showToast(`Report ${newReport.id} registered on CSJMU map`, newReport.severity === 'urgent' ? 'urgent' : 'success');
  };

  const handleUpdateStatus = (
    reportId: string, 
    newStatus: ReportStatus, 
    note?: string,
    aiResult?: AiCleanupComparison,
    afterImg?: string
  ) => {
    setReports(prev => prev.map(r => {
      if (r.id === reportId) {
        const updatedUpdates = [...(r.updates || [])];
        if (note || r.status !== newStatus) {
          updatedUpdates.unshift({
            id: `up-${Date.now()}`,
            timestamp: 'Just now',
            author: userRole === 'admin' ? 'Planning Division Desk' : 'Field Technician (BVG)',
            message: note || `Status updated from ${r.status} to ${newStatus}.`,
            statusChange: newStatus
          });
        }
        return {
          ...r,
          status: newStatus,
          updates: updatedUpdates,
          ...(afterImg ? { afterImageUrl: afterImg } : {}),
          ...(aiResult ? { aiComparisonResult: aiResult } : {})
        };
      }
      return r;
    }));

    // Sync with backend API if online
    if (backendStatus.online) {
      if (newStatus === 'resolved' && afterImg) {
        verifyAndCloseAPI(reportId, afterImg).catch(err => {
          console.warn('Backend verify API error:', err);
        });
      } else {
        const statusMap: Record<string, string> = {
          'dispatched': 'DISPATCHED',
          'in_progress': 'IN_PROGRESS',
          'resolved': 'RESOLVED',
          'pending': 'DISPATCHED'
        };
        const backendStatusVal = statusMap[newStatus] || newStatus.toUpperCase();
        updateIncidentStatusAPI(reportId, backendStatusVal, note).catch(err => {
          console.warn('Backend status update error:', err);
        });
      }
    }

    const targetReport = reports.find(r => r.id === reportId);
    const reportTitle = targetReport?.title || reportId;

    // Add activity log
    const newAct: ActivityEvent = {
      id: `act-${Date.now()}`,
      type: newStatus === 'resolved' ? 'resolved' : 'status_change',
      title: `${reportTitle} marked as ${newStatus.replace('_', ' ').toUpperCase()}`,
      description: note || `Status transitioned to ${newStatus} by ${userRole === 'admin' ? 'Planning Desk' : 'BVG Staff'}.`,
      location: targetReport?.location || 'UIET Campus',
      timestamp: 'JUST NOW',
      actor: 'Maintenance Dispatch',
      iconType: newStatus === 'resolved' ? 'check_circle' : 'engineering'
    };

    setActivities([newAct, ...activities]);
    showToast(`Ticket ${reportId} updated to ${newStatus.replace('_', ' ')}`, 'info');
  };

  const handleAssignTeam = (reportId: string, teamName: string) => {
    setReports(prev => prev.map(r => {
      if (r.id === reportId) {
        return { ...r, assignedTeam: teamName };
      }
      return r;
    }));

    const targetReport = reports.find(r => r.id === reportId);
    const newAct: ActivityEvent = {
      id: `act-${Date.now()}`,
      type: 'dispatch',
      title: `${teamName.split(' ')[0]} ${teamName.split(' ')[1]} dispatched to ${targetReport?.location || 'Site'}`,
      description: `Task assigned for ticket ${reportId}.`,
      location: targetReport?.location || 'UIET Campus',
      timestamp: 'JUST NOW',
      actor: 'Dispatcher',
      iconType: 'engineering'
    };
    setActivities([newAct, ...activities]);
    showToast(`${teamName} dispatched`, 'info');
  };

  // Leave Handlers
  const handleAddLeaveRequest = (req: Omit<LeaveRequest, 'id' | 'appliedAt' | 'status'>) => {
    const newLeave: LeaveRequest = {
      ...req,
      id: `LV-${Date.now().toString().slice(-4)}`,
      status: 'pending',
      appliedAt: new Date().toISOString()
    };
    setLeaveRequests(prev => [newLeave, ...prev]);
    showToast('Leave request submitted to Management', 'info');
  };

  const handleReviewLeave = (requestId: string, status: 'approved' | 'rejected', remarks?: string) => {
    setLeaveRequests(prev => prev.map(l => {
      if (l.id === requestId) {
        return {
          ...l,
          status,
          reviewedBy: 'Er. R. K. Sharma (Directorate)',
          reviewRemarks: remarks,
          reviewedAt: new Date().toISOString()
        };
      }
      return l;
    }));
    showToast(`Leave request ${requestId} marked as ${status.toUpperCase()}`, status === 'approved' ? 'success' : 'info');
  };

  // Reassignment Handlers
  const handleAddReassignmentRequest = (req: Omit<ReassignmentRequest, 'id' | 'requestedAt' | 'status'>) => {
    const newReq: ReassignmentRequest = {
      ...req,
      id: `REASSIGN-${Date.now().toString().slice(-4)}`,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };
    setReassignmentRequests(prev => [newReq, ...prev]);
    showToast('Work reassignment request sent to Management', 'info');
  };

  const handleReviewReassignment = (requestId: string, status: 'approved' | 'rejected', remarks?: string, newAssignee?: string) => {
    setReassignmentRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status,
          reviewedBy: 'Estate Works Desk',
          reviewRemarks: remarks,
          reviewedAt: new Date().toISOString(),
          newAssignee
        };
      }
      return r;
    }));

    const targetReq = reassignmentRequests.find(r => r.id === requestId);
    if (status === 'approved' && newAssignee && targetReq?.reportId) {
      handleAssignTeam(targetReq.reportId, newAssignee);
    }
    showToast(`Reassignment request ${requestId} ${status.toUpperCase()}`, status === 'approved' ? 'success' : 'info');
  };

  // Credentials and Roles Handlers
  const handleUpdateCredentials = (updatedList: UserCredential[]) => {
    setCredentials(updatedList);
    showToast('Credentials updated successfully', 'success');
  };

  const handleUpdateUserRole = (userId: string, newRole: UserRole, department?: string, pin?: string) => {
    setCredentials(prev => prev.map(c => {
      if (c.id === userId) {
        return {
          ...c,
          role: newRole,
          department: department || c.department,
          pin: pin !== undefined ? pin : (newRole === 'student' ? '' : c.pin)
        };
      }
      return c;
    }));
    showToast(`Role updated to ${newRole.toUpperCase()}`, 'success');
  };

  const handleOpenReportDrawerWithLoc = (locName: string, coords: { x: number; y: number }) => {
    setReportDrawerLocation(locName);
    setReportDrawerCoords(coords);
    setIsReportDrawerOpen(true);
  };

  const handleResetData = () => {
    localStorage.setItem('csjmu_reports', JSON.stringify(initialReports));
    localStorage.setItem('csjmu_activities', JSON.stringify(initialActivities));
    localStorage.setItem('csjmu_leave_requests', JSON.stringify(initialLeaveRequests));
    localStorage.setItem('csjmu_reassign_requests', JSON.stringify(initialReassignmentRequests));
    localStorage.setItem('csjmu_credentials', JSON.stringify(initialCredentials));
    localStorage.setItem('csjmu_seed_version', SEED_DATA_VERSION);
    setReports(initialReports);
    setActivities(initialActivities);
    setLeaveRequests(initialLeaveRequests);
    setReassignmentRequests(initialReassignmentRequests);
    setCredentials(initialCredentials);
    showToast('Seed demo data reloaded for all roles', 'info');
  };

  const urgentCount = reports.filter(r => r.severity === 'urgent' && r.status !== 'resolved').length;

  // Filtered by top global search query if any
  const displayedReports = reports.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#111c2d] flex flex-col font-sans selection:bg-[#dee8ff] selection:text-[#001e40]">
      {/* Top Navigation Bar */}
      <TopNavBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activities={activities}
        urgentCount={urgentCount}
        userRole={userRole}
        currentProfile={currentUserProfile}
        isAuthenticated={isAuthenticated}
        onOpenAccountSwitcher={() => handleOpenAccountSwitcher()}
        onSignOut={handleSignOut}
        backendOnline={backendStatus.online}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onOpenReportDrawer={() => {
          setReportDrawerLocation('UIET Block 1');
          setReportDrawerCoords({ x: 38, y: 38 });
          setIsReportDrawerOpen(true);
        }}
      />

      {/* Main Container with SideNav and Content Area */}
      <div className="flex flex-1 pt-16">
        {/* Left Side Navigation Rail */}
        <SideNavBar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenReportDrawer={() => {
            setReportDrawerLocation('UIET Block 1');
            setReportDrawerCoords({ x: 38, y: 38 });
            setIsReportDrawerOpen(true);
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          userRole={userRole}
          currentProfile={currentUserProfile}
          onOpenAccountSwitcher={() => handleOpenAccountSwitcher()}
          urgentCount={urgentCount}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area Canvas */}
        <main className="flex-1 ml-0 md:ml-[240px] p-4 md:p-8 max-w-[1600px] w-full min-h-[calc(100vh-4rem)] transition-all">
          {/* Status Indicator & Optional Dev Controls */}
          {(() => {
            const isDev = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('dev') === '1';
            if (isDev) {
              return (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs px-3.5 py-2 rounded-lg border bg-slate-50 border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${backendStatus.online ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <span className="font-semibold text-slate-700">
                      {backendStatus.online ? `Live Backend (${backendStatus.version || 'v2'})` : 'Offline – using cached data'}
                    </span>
                    <span className="text-slate-400 text-[11px]">&bull; Dev Mode Active (?dev=1)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setActiveTab('heatisland')}
                      className="text-[11px] font-semibold px-2 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    >
                      Heat Island
                    </button>
                    <button 
                      onClick={() => setActiveTab('pipeline')}
                      className="text-[11px] font-semibold px-2 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    >
                      Pipeline Debug
                    </button>
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* DEDICATED 4-ROLE DASHBOARDS PROTECTED BY ERROR BOUNDARY */}
          <ErrorBoundary fallbackTitle="Dashboard Display Error">
            {activeTab === 'student_dashboard' && (
              <StudentDashboard
                reports={displayedReports}
                blocks={blocks}
                activities={activities}
                onOpenReportDrawer={() => {
                  setReportDrawerLocation('UIET Block 1');
                  setReportDrawerCoords({ x: 38, y: 38 });
                  setIsReportDrawerOpen(true);
                }}
                onSelectReport={(rep) => setSelectedReportDetails(rep)}
                onNavigateToTab={(tab) => setActiveTab(tab)}
                onOpenReportDrawerWithLocation={handleOpenReportDrawerWithLoc}
              />
            )}

            {(activeTab === 'bvg_dashboard' || activeTab === 'operator_dashboard') && (
              <BvgWorkerDashboard
                reports={displayedReports}
                activities={activities}
                onUpdateStatus={handleUpdateStatus}
                onSelectReport={(rep) => setSelectedReportDetails(rep)}
                onNavigateToTab={(tab) => setActiveTab(tab)}
                leaveRequests={leaveRequests}
                onAddLeaveRequest={handleAddLeaveRequest}
                reassignmentRequests={reassignmentRequests}
                onAddReassignmentRequest={handleAddReassignmentRequest}
              />
            )}

            {activeTab === 'management_dashboard' && (
              <ManagementDashboard
                reports={displayedReports}
                activities={activities}
                onUpdateStatus={handleUpdateStatus}
                onSelectReport={(rep) => setSelectedReportDetails(rep)}
                onNavigateToTab={(tab) => setActiveTab(tab)}
                reassignmentRequests={reassignmentRequests}
                onReviewReassignment={handleReviewReassignment}
                leaveRequests={leaveRequests}
                onReviewLeave={handleReviewLeave}
              />
            )}

            {activeTab === 'admin_dashboard' && (
              <AdminDashboard
                reports={displayedReports}
                blocks={blocks}
                activities={activities}
                credentials={credentials}
                onUpdateCredentials={handleUpdateCredentials}
                onUpdateUserRole={handleUpdateUserRole}
                onAssignTeam={handleAssignTeam}
                onUpdateStatus={handleUpdateStatus}
                onOpenReportDrawer={() => {
                  setReportDrawerLocation('UIET Block 1');
                  setReportDrawerCoords({ x: 38, y: 38 });
                  setIsReportDrawerOpen(true);
                }}
                onSelectReport={(rep) => setSelectedReportDetails(rep)}
                onNavigateToTab={(tab) => setActiveTab(tab)}
              />
            )}

            {/* OTHER ROLE-SPECIFIC / SHARED MODULE VIEWS */}
            {activeTab === 'operations' && (
              <StaffOperationsView
                reports={displayedReports}
                onSelectReport={(rep) => setSelectedReportDetails(rep)}
                onUpdateStatus={handleUpdateStatus}
                onNavigateToTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'heatisland' && (
              <HeatIslandMapView />
            )}

            {activeTab === 'pipeline' && (
              <PipelineVisualizer />
            )}

            {activeTab === 'cctv_pipeline' && (
              <CctvPipelineDashboard
                onNavigateToTab={(tab) => setActiveTab(tab)}
                onSelectReport={(rep) => setSelectedReportDetails(rep)}
              />
            )}

            {activeTab === 'map' && (
              <CampusMap
                reports={displayedReports}
                blocks={blocks}
                onSelectReport={(rep) => setSelectedReportDetails(rep)}
                onOpenReportDrawerWithLocation={handleOpenReportDrawerWithLoc}
                userRole={userRole}
              />
            )}

            {activeTab === 'maintenance' && (
              <MaintenanceManagementPanel
                reports={displayedReports}
                activities={activities}
                onUpdateStatus={handleUpdateStatus}
                onSelectReport={(rep) => setSelectedReportDetails(rep)}
                onOpenReportDrawer={() => {
                  setReportDrawerLocation('UIET Block 1');
                  setReportDrawerCoords({ x: 38, y: 38 });
                  setIsReportDrawerOpen(true);
                }}
              />
            )}

            {activeTab === 'feed' && (
              <LiveFeedView
                reports={displayedReports}
                onSelectReport={(rep) => setSelectedReportDetails(rep)}
                onOpenReportDrawer={() => {
                  setReportDrawerLocation('UIET Block 1');
                  setReportDrawerCoords({ x: 38, y: 38 });
                  setIsReportDrawerOpen(true);
                }}
              />
            )}

            {activeTab === 'planning' && (
              <PlanningBoardView />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView reports={reports} />
            )}

            {activeTab === 'terms' && (
              <TermsAndConditionsView
                onBackToDashboard={() => setActiveTab(
                  userRole === 'student' ? 'student_dashboard' :
                  userRole === 'bvg_worker' || userRole === 'operator' ? 'bvg_dashboard' :
                  userRole === 'management' ? 'management_dashboard' : 'admin_dashboard'
                )}
              />
            )}

            {activeTab === 'privacy' && (
              <PrivacyPolicyView
                onBackToDashboard={() => setActiveTab(
                  userRole === 'student' ? 'student_dashboard' :
                  userRole === 'bvg_worker' || userRole === 'operator' ? 'bvg_dashboard' :
                  userRole === 'management' ? 'management_dashboard' : 'admin_dashboard'
                )}
              />
            )}
          </ErrorBoundary>
        </main>
      </div>

      {/* Report Issue Slide-Over Drawer (Screen 2 matching Image 3) */}
      <ReportIssueDrawer
        isOpen={isReportDrawerOpen}
        onClose={() => setIsReportDrawerOpen(false)}
        onSubmitReport={handleCreateReport}
        prefilledLocation={reportDrawerLocation}
        prefilledCoords={reportDrawerCoords}
      />

      {/* Report Details Modal */}
      <ReportDetailsModal
        report={selectedReportDetails}
        onClose={() => setSelectedReportDetails(null)}
        onUpdateStatus={handleUpdateStatus}
        onAssignTeam={handleAssignTeam}
        onViewOnMap={(r) => {
          setActiveTab('map');
          setSelectedReportDetails(null);
        }}
      />

      {/* Portal Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userRole={userRole}
        currentProfile={currentUserProfile}
        onOpenAccountSwitcher={() => handleOpenAccountSwitcher()}
        onResetData={handleResetData}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* Role-Based Access Control (RBAC) Authentication Modal */}
      <RoleAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        targetRole={targetAuthRole || 'student'}
        currentRole={userRole}
        onSuccess={handleAuthSuccess}
        credentials={credentials}
      />

      {/* Toast Notification (Non-blocking, bottom-right, auto-dismiss) */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 pointer-events-none max-w-sm w-full p-2">
          <div className={`pointer-events-auto flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg shadow-lg border text-xs font-semibold ${
            toastMessage.type === 'urgent'
              ? 'bg-rose-50 text-rose-900 border-rose-200 shadow-rose-900/10'
              : toastMessage.type === 'info'
              ? 'bg-slate-900 text-slate-100 border-slate-700 shadow-slate-900/20'
              : 'bg-emerald-50 text-emerald-900 border-emerald-200 shadow-emerald-900/10'
          }`}>
            <div className="flex items-center gap-2 min-w-0">
              {toastMessage.type === 'urgent' ? (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : toastMessage.type === 'info' ? (
                <Info className="w-4 h-4 text-blue-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span className="truncate">{toastMessage.text}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
