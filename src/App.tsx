import React, { useState, useEffect } from 'react';
import { 
  MaintenanceReport, 
  CampusBlock, 
  ActivityEvent, 
  ActiveTab, 
  UserRole, 
  ReportStatus 
} from './types';
import { 
  initialBlocks, 
  initialReports, 
  initialActivities 
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
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

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

  const [activeTab, setActiveTab] = useState<ActiveTab>('map');
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals and Drawers
  const [isReportDrawerOpen, setIsReportDrawerOpen] = useState<boolean>(false);
  const [reportDrawerLocation, setReportDrawerLocation] = useState<string>('UIET Block 1');
  const [reportDrawerCoords, setReportDrawerCoords] = useState<{ x: number; y: number }>({ x: 38, y: 38 });
  const [selectedReportDetails, setSelectedReportDetails] = useState<MaintenanceReport | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  
  // Toast Alert Notification state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'urgent' | 'info' } | null>(null);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('csjmu_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('csjmu_activities', JSON.stringify(activities));
  }, [activities]);

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
      description: `${newReport.description.slice(0, 80)}...`,
      location: newReport.location,
      timestamp: 'JUST NOW',
      actor: newReport.reportedBy.name,
      iconType: newReport.severity === 'urgent' ? 'report' : 'engineering'
    };

    setActivities([newAct, ...activities]);
    showToast(`Report ${newReport.id} registered on CSJMU map`, newReport.severity === 'urgent' ? 'urgent' : 'success');
  };

  const handleUpdateStatus = (reportId: string, newStatus: ReportStatus, note?: string) => {
    setReports(prev => prev.map(r => {
      if (r.id === reportId) {
        const updatedUpdates = [...(r.updates || [])];
        if (note || r.status !== newStatus) {
          updatedUpdates.unshift({
            id: `up-${Date.now()}`,
            timestamp: 'Just now',
            author: userRole === 'admin' ? 'Planning Division Desk' : 'Field Technician',
            message: note || `Status updated from ${r.status} to ${newStatus}.`,
            statusChange: newStatus
          });
        }
        return {
          ...r,
          status: newStatus,
          updates: updatedUpdates
        };
      }
      return r;
    }));

    const targetReport = reports.find(r => r.id === reportId);
    const reportTitle = targetReport?.title || reportId;

    // Add activity log
    const newAct: ActivityEvent = {
      id: `act-${Date.now()}`,
      type: newStatus === 'resolved' ? 'resolved' : 'status_change',
      title: `${reportTitle} marked as ${newStatus.replace('_', ' ').toUpperCase()}`,
      description: note || `Status transitioned to ${newStatus} by ${userRole === 'admin' ? 'Planning Desk' : 'Technician'}.`,
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

  const handleOpenReportDrawerWithLoc = (locName: string, coords: { x: number; y: number }) => {
    setReportDrawerLocation(locName);
    setReportDrawerCoords(coords);
    setIsReportDrawerOpen(true);
  };

  const handleResetData = () => {
    localStorage.removeItem('csjmu_reports');
    localStorage.removeItem('csjmu_activities');
    setReports(initialReports);
    setActivities(initialActivities);
    showToast('Demo data restored to initial state', 'info');
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
        onRoleChange={setUserRole}
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
          onToggleRole={() => setUserRole(prev => prev === 'admin' ? 'student' : 'admin')}
          urgentCount={urgentCount}
        />

        {/* Main Content Area Canvas */}
        <main className="flex-1 ml-0 md:ml-[240px] p-4 md:p-8 max-w-[1600px] w-full min-h-[calc(100vh-4rem)] transition-all">
          {activeTab === 'map' && (
            <CampusMap
              reports={displayedReports}
              blocks={blocks}
              onSelectReport={(rep) => setSelectedReportDetails(rep)}
              onOpenReportDrawerWithLocation={handleOpenReportDrawerWithLoc}
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
        onRoleChange={setUserRole}
        onResetData={handleResetData}
      />

      {/* Toast Notification Alert Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-semibold ${
            toastMessage.type === 'urgent'
              ? 'bg-[#ba1a1a] text-white border-[#93000a]'
              : toastMessage.type === 'info'
              ? 'bg-[#001e40] text-white border-[#003366]'
              : 'bg-[#2e7d32] text-white border-[#1b5e20]'
          }`}>
            {toastMessage.type === 'urgent' ? (
              <AlertTriangle className="w-5 h-5 flex-shrink-0 animate-bounce" />
            ) : toastMessage.type === 'info' ? (
              <Info className="w-5 h-5 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
