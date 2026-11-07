import React from 'react';
import { 
  Map as MapIcon, 
  LayoutGrid, 
  Compass, 
  Wrench, 
  BarChart3, 
  Settings, 
  RefreshCw, 
  Plus, 
  Building2, 
  Home, 
  Shield, 
  Flame, 
  Layers, 
  GraduationCap, 
  HardHat, 
  Award, 
  TreeDeciduous, 
  CheckCircle2, 
  Calendar, 
  KeyRound, 
  UserCheck, 
  Scale, 
  FileText, 
  ShieldCheck, 
  Activity, 
  Video,
  BookOpen
} from 'lucide-react';
import { ActiveTab, UserRole } from '../types';

interface SideNavBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenReportDrawer: () => void;
  onOpenSettings: () => void;
  userRole: UserRole;
  currentProfile?: any;
  urgentCount: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onNavigateToLanding?: () => void;
}

export const SideNavBar: React.FC<SideNavBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenReportDrawer,
  onOpenSettings,
  userRole,
  currentProfile,
  urgentCount,
  isMobileOpen,
  onCloseMobile,
  onNavigateToLanding
}) => {
  const isStudent = userRole === 'student';
  const isBvg = userRole === 'bvg_worker' || userRole === 'operator';
  const isManagement = userRole === 'management';
  const isSuperAdmin = userRole === 'super_admin' || userRole === 'admin';

  const handleTabClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar Shell */}
      <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-[240px] z-40 pt-4 pb-6 flex flex-col justify-between bg-white border-r border-[#c3c6d1] transition-transform duration-200 ${
        isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
      }`}>
        
        {/* Top Section */}
        <div className="flex flex-col">
          
          {/* Action Button (Simplified top: no Citizen Portal / UIET header) */}
          <div className="px-3 mb-4">
            <button
              id="new-report-button"
              onClick={() => {
                onOpenReportDrawer();
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full py-2.5 px-3 rounded-lg font-medium text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                isStudent
                  ? 'bg-indigo-700 text-white hover:bg-indigo-800'
                  : isBvg
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : isManagement
                  ? 'bg-blue-700 text-white hover:bg-blue-800'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>
                {isStudent ? 'Report an incident' : isBvg ? 'Log field task' : 'New incident'}
              </span>
            </button>
          </div>

          {/* Navigation Tabs List: Normal Sentence-Case, No Uppercase/Tracked, No LIVE/ECO Badges */}
          <nav className="flex flex-col gap-1 px-3 overflow-y-auto max-h-[calc(100vh-270px)] custom-scrollbar">
            
            {/* 1. STUDENT ROLE NAVIGATION */}
            {isStudent && (
              <>
                <button
                  id="nav-student-hub"
                  onClick={() => handleTabClick('student_dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                    activeTab === 'student_dashboard'
                      ? 'bg-indigo-50 text-indigo-900 font-semibold'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                  }`}
                >
                  <Home className={`w-4 h-4 ${activeTab === 'student_dashboard' ? 'text-indigo-700' : 'text-stone-400'}`} />
                  <span>Incidents</span>
                </button>

                <button
                  id="nav-operations-console"
                  onClick={() => handleTabClick('operations')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                    activeTab === 'operations'
                      ? 'bg-indigo-50 text-indigo-900 font-semibold'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                  }`}
                >
                  <Activity className={`w-4 h-4 ${activeTab === 'operations' ? 'text-indigo-700' : 'text-stone-400'}`} />
                  <span>Operations</span>
                </button>

                <button
                  id="nav-map-overview"
                  onClick={() => handleTabClick('map')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                    activeTab === 'map'
                      ? 'bg-indigo-50 text-indigo-900 font-semibold'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                  }`}
                >
                  <MapIcon className={`w-4 h-4 ${activeTab === 'map' ? 'text-indigo-700' : 'text-stone-400'}`} />
                  <span>Explore campus</span>
                </button>

                <button
                  id="nav-heat-island"
                  onClick={() => handleTabClick('heatisland')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                    activeTab === 'heatisland'
                      ? 'bg-rose-50 text-rose-900 font-semibold'
                      : 'text-stone-600 hover:bg-rose-50/50 hover:text-rose-900'
                  }`}
                >
                  <TreeDeciduous className={`w-4 h-4 ${activeTab === 'heatisland' ? 'text-rose-600' : 'text-stone-400'}`} />
                  <span>Cool havens</span>
                </button>
              </>
            )}

            {/* 2. BVG WORKER ROLE NAVIGATION */}
            {isBvg && (
              <>
                <button
                  id="nav-bvg-operations"
                  onClick={() => handleTabClick('bvg_dashboard')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                    activeTab === 'bvg_dashboard' || activeTab === 'operator_dashboard'
                      ? 'bg-amber-50 text-amber-900 font-semibold'
                      : 'text-stone-600 hover:bg-amber-50/50 hover:text-amber-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <HardHat className={`w-4 h-4 ${activeTab === 'bvg_dashboard' ? 'text-amber-700' : 'text-stone-400'}`} />
                    <span>Assigned work</span>
                  </div>
                  {urgentCount > 0 && (
                    <span className="bg-rose-100 text-rose-800 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                      {urgentCount}
                    </span>
                  )}
                </button>

                <button
                  id="nav-bvg-operations-console"
                  onClick={() => handleTabClick('operations')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                    activeTab === 'operations'
                      ? 'bg-amber-50 text-amber-900 font-semibold'
                      : 'text-stone-600 hover:bg-amber-50/50 hover:text-amber-900'
                  }`}
                >
                  <Activity className={`w-4 h-4 ${activeTab === 'operations' ? 'text-amber-700' : 'text-stone-400'}`} />
                  <span>Operations</span>
                </button>

                <button
                  id="nav-bvg-map"
                  onClick={() => handleTabClick('map')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                    activeTab === 'map'
                      ? 'bg-amber-50 text-amber-900 font-semibold'
                      : 'text-stone-600 hover:bg-amber-50/50 hover:text-amber-900'
                  }`}
                >
                  <MapIcon className={`w-4 h-4 ${activeTab === 'map' ? 'text-amber-700' : 'text-stone-400'}`} />
                  <span>Beat map</span>
                </button>
              </>
            )}

            {/* 3. MANAGEMENT NAVIGATION */}
            {isManagement && (
              <>
                <button
                  id="nav-management-overview"
                  onClick={() => handleTabClick('management_dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                    activeTab === 'management_dashboard'
                      ? 'bg-blue-50 text-blue-900 font-semibold'
                      : 'text-stone-600 hover:bg-blue-50/50 hover:text-blue-900'
                  }`}
                >
                  <Building2 className={`w-4 h-4 ${activeTab === 'management_dashboard' ? 'text-blue-700' : 'text-stone-400'}`} />
                  <span>Management dashboard</span>
                </button>
              </>
            )}

            {/* 4. SUPER ADMIN NAVIGATION */}
            {isSuperAdmin && (
              <>
                <button
                  id="nav-admin-command"
                  onClick={() => handleTabClick('admin_dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                    activeTab === 'admin_dashboard'
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-stone-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Shield className={`w-4 h-4 ${activeTab === 'admin_dashboard' ? 'text-slate-900' : 'text-stone-400'}`} />
                  <span>Admin console</span>
                </button>
              </>
            )}

            {/* CAMPUS OPERATIONS & MONITORING (Admin & Management) */}
            {(isManagement || isSuperAdmin) && (
              <div className="mt-2 pt-2 border-t border-stone-100 flex flex-col gap-1">
                <span className="text-[11px] font-medium text-stone-400 px-3 mb-1">
                  Campus intelligence
                </span>

                <button
                  id="nav-cctv-pipeline"
                  onClick={() => handleTabClick('cctv_pipeline')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                    activeTab === 'cctv_pipeline'
                      ? 'bg-indigo-50 text-indigo-900 font-semibold'
                      : 'text-stone-600 hover:bg-indigo-50/50 hover:text-indigo-900'
                  }`}
                >
                  <Layers className={`w-4 h-4 ${activeTab === 'cctv_pipeline' ? 'text-indigo-600' : 'text-stone-400'}`} />
                  <span>CCTV camera sweeps</span>
                </button>

                <button
                  id="nav-campus-map"
                  onClick={() => handleTabClick('map')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                    activeTab === 'map'
                      ? 'bg-stone-100 text-stone-900 font-semibold'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                  }`}
                >
                  <MapIcon className={`w-4 h-4 ${activeTab === 'map' ? 'text-stone-900' : 'text-stone-400'}`} />
                  <span>Campus map</span>
                </button>

                <button
                  id="nav-heatisland-mgmt"
                  onClick={() => handleTabClick('heatisland')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                    activeTab === 'heatisland'
                      ? 'bg-rose-50 text-rose-900 font-semibold'
                      : 'text-stone-600 hover:bg-rose-50/50 hover:text-rose-900'
                  }`}
                >
                  <Flame className={`w-4 h-4 ${activeTab === 'heatisland' ? 'text-rose-600' : 'text-stone-400'}`} />
                  <span>Heat island analysis</span>
                </button>

                <button
                  id="nav-planning-board"
                  onClick={() => handleTabClick('planning')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                    activeTab === 'planning'
                      ? 'bg-stone-100 text-stone-900 font-semibold'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                  }`}
                >
                  <LayoutGrid className={`w-4 h-4 ${activeTab === 'planning' ? 'text-stone-900' : 'text-stone-400'}`} />
                  <span>Planning board</span>
                </button>

                <button
                  id="nav-analytics-mgmt"
                  onClick={() => handleTabClick('analytics')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                    activeTab === 'analytics'
                      ? 'bg-stone-100 text-stone-900 font-semibold'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                  }`}
                >
                  <BarChart3 className={`w-4 h-4 ${activeTab === 'analytics' ? 'text-stone-900' : 'text-stone-400'}`} />
                  <span>Waste analytics</span>
                </button>
              </div>
            )}

          </nav>
        </div>

        {/* Bottom Footer Actions & Policy Links */}
        <div className="flex flex-col gap-1 px-3 border-t border-stone-100 pt-2.5">
          {onNavigateToLanding && (
            <button
              onClick={onNavigateToLanding}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors text-left cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-stone-400" />
              <span>Landing page</span>
            </button>
          )}

          <button
            id="nav-terms"
            onClick={() => handleTabClick('terms')}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
              activeTab === 'terms' ? 'bg-stone-100 text-stone-900 font-semibold' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-stone-400" />
            <span>Terms &amp; conditions</span>
          </button>

          <button
            id="nav-privacy"
            onClick={() => handleTabClick('privacy')}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
              activeTab === 'privacy' ? 'bg-stone-100 text-stone-900 font-semibold' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-stone-400" />
            <span>Privacy policy</span>
          </button>

          {/* Settings */}
          <button
            id="nav-settings"
            onClick={onOpenSettings}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors text-left cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-stone-400" />
            <span>Settings</span>
          </button>

          {/* Authenticated Identity Card */}
          <div className="mt-1 p-2 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-md bg-[#001e40] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                {currentProfile?.avatar || (isStudent ? 'SB' : isBvg ? 'RK' : isManagement ? 'RS' : 'VC')}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-stone-900 truncate leading-tight">
                  {currentProfile?.name || (isStudent ? 'Sunny Bharti' : isBvg ? 'Ramesh Kumar' : isManagement ? 'Er. R. K. Sharma' : 'Prof. A. K. Shukla')}
                </p>
                <p className="text-[10px] text-stone-500 truncate">
                  {isStudent ? 'Student' : isBvg ? 'BVG Worker' : isManagement ? 'Estate Management' : 'Super Admin'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (visible only on mobile < md) */}
      <nav className="fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-stone-200 z-30 flex items-center justify-around px-2 md:hidden">
        <button
          onClick={() => handleTabClick(isStudent ? 'student_dashboard' : isBvg ? 'bvg_dashboard' : isManagement ? 'management_dashboard' : 'admin_dashboard')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab.includes('dashboard') ? 'text-indigo-700 font-semibold' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => handleTabClick('map')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'map' ? 'text-indigo-700 font-semibold' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <MapIcon className="w-4 h-4" />
          <span>Map</span>
        </button>

        <button
          onClick={onOpenReportDrawer}
          className="flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-medium text-indigo-700"
        >
          <Plus className="w-5 h-5" />
          <span>Report</span>
        </button>

        <button
          onClick={() => handleTabClick(isStudent ? 'heatisland' : 'operations')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'heatisland' || activeTab === 'operations' ? 'text-indigo-700 font-semibold' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          {isStudent ? <TreeDeciduous className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
          <span>{isStudent ? 'Cool havens' : 'Operations'}</span>
        </button>
      </nav>
    </>
  );
};
