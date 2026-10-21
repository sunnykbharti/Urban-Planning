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
  UserCheck
} from 'lucide-react';
import { ActiveTab, UserRole } from '../types';

interface SideNavBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenReportDrawer: () => void;
  onOpenSettings: () => void;
  userRole: UserRole;
  onOpenAccountSwitcher?: () => void;
  currentProfile?: any;
  urgentCount: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const SideNavBar: React.FC<SideNavBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenReportDrawer,
  onOpenSettings,
  userRole,
  onOpenAccountSwitcher,
  currentProfile,
  urgentCount,
  isMobileOpen,
  onCloseMobile
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
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 md:hidden animate-in fade-in duration-200"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`fixed left-0 top-0 h-full w-[240px] z-40 pt-20 pb-6 flex flex-col justify-between bg-[#ffffff] border-r border-[#c3c6d1] transition-transform duration-200 ${
        isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Top Section */}
        <div className="flex flex-col">
          {/* Brand/Division Header customized per role */}
          <div className="px-5 mb-5">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-xs overflow-hidden flex-shrink-0 ${
                isStudent 
                  ? 'bg-gradient-to-br from-emerald-600 to-teal-700' 
                  : isBvg
                  ? 'bg-gradient-to-br from-amber-600 to-orange-700'
                  : isManagement
                  ? 'bg-gradient-to-br from-blue-700 to-indigo-900'
                  : 'bg-gradient-to-br from-purple-800 to-slate-900'
              }`}>
                {isStudent ? (
                  <GraduationCap className="w-5 h-5 text-white" />
                ) : isBvg ? (
                  <HardHat className="w-5 h-5 text-amber-200" />
                ) : isManagement ? (
                  <Building2 className="w-5 h-5 text-blue-200" />
                ) : (
                  <span className="text-base">👑</span>
                )}
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-black text-[#001e40] leading-tight truncate">
                  {isStudent ? 'Student Hub' : isBvg ? 'BVG Worker' : isManagement ? 'Management' : 'Super Admin'}
                </h2>
                <p className="text-[11px] text-[#737780] font-semibold truncate">
                  {isStudent ? 'CSJMU Citizen' : isBvg ? 'Field Sanitation' : isManagement ? 'Estate Directorate' : 'Master IT HQ'}
                </p>
              </div>
            </div>

            {/* New Report Action Button */}
            <button
              id="new-report-button"
              onClick={() => {
                onOpenReportDrawer();
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-2 group cursor-pointer transition-all active:scale-[0.98] ${
                isStudent
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/20'
                  : isBvg
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : isManagement
                  ? 'bg-blue-700 text-white hover:bg-blue-800'
                  : 'bg-[#001e40] text-white hover:bg-[#003366]'
              }`}
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
              <span>
                {isStudent ? 'Upload Hazard Photo' : isBvg ? 'Log Field Task' : 'New Incident'}
              </span>
            </button>
          </div>

          {/* Navigation Tabs List */}
          <nav className="flex flex-col gap-1 px-3 overflow-y-auto max-h-[calc(100vh-290px)] custom-scrollbar">
            
            {/* ==================== 1. STUDENT ROLE NAVIGATION ==================== */}
            {isStudent && (
              <>
                <button
                  id="nav-student-hub"
                  onClick={() => handleTabClick('student_dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-left ${
                    activeTab === 'student_dashboard'
                      ? 'bg-[#f0f3ff] text-[#001e40] border-r-4 border-[#001e40] shadow-xs'
                      : 'text-[#43474f] hover:bg-[#e7eeff] hover:text-[#001e40]'
                  }`}
                >
                  <Home className={`w-4 h-4 ${activeTab === 'student_dashboard' ? 'text-[#001e40]' : 'text-[#737780]'}`} />
                  <span>Incident Dashboard</span>
                </button>

                <button
                  id="nav-map-overview"
                  onClick={() => handleTabClick('map')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-left ${
                    activeTab === 'map'
                      ? 'bg-[#f0f3ff] text-[#001e40] border-r-4 border-[#001e40] shadow-xs'
                      : 'text-[#43474f] hover:bg-[#e7eeff] hover:text-[#001e40]'
                  }`}
                >
                  <MapIcon className={`w-4 h-4 ${activeTab === 'map' ? 'text-[#001e40]' : 'text-[#737780]'}`} />
                  <span>Explore Campus</span>
                </button>

                <button
                  id="nav-heat-island"
                  onClick={() => handleTabClick('heatisland')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-left ${
                    activeTab === 'heatisland'
                      ? 'bg-[#fff1f2] text-[#be123c] border-r-4 border-[#be123c] shadow-xs'
                      : 'text-[#43474f] hover:bg-[#fff1f2] hover:text-[#be123c]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <TreeDeciduous className="w-4 h-4 text-emerald-600" />
                    <span>Cool Havens</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded">
                    ECO
                  </span>
                </button>
              </>
            )}

            {/* ==================== 2. BVG WORKERS NAVIGATION ==================== */}
            {isBvg && (
              <>
                <button
                  id="nav-bvg-operations"
                  onClick={() => handleTabClick('bvg_dashboard')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-left ${
                    activeTab === 'bvg_dashboard' || activeTab === 'operator_dashboard'
                      ? 'bg-amber-50 text-amber-900 border-r-4 border-amber-600 shadow-xs'
                      : 'text-[#43474f] hover:bg-amber-50/60 hover:text-amber-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <HardHat className={`w-4 h-4 ${activeTab === 'bvg_dashboard' ? 'text-amber-700' : 'text-[#737780]'}`} />
                    <span>Assigned Work</span>
                  </div>
                  {urgentCount > 0 && (
                    <span className="bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                      {urgentCount}
                    </span>
                  )}
                </button>

                <button
                  id="nav-bvg-map"
                  onClick={() => handleTabClick('map')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-left ${
                    activeTab === 'map'
                      ? 'bg-amber-50 text-amber-900 border-r-4 border-amber-600 shadow-xs'
                      : 'text-[#43474f] hover:bg-amber-50/60 hover:text-amber-900'
                  }`}
                >
                  <MapIcon className={`w-4 h-4 ${activeTab === 'map' ? 'text-amber-700' : 'text-[#737780]'}`} />
                  <span>Beat GIS Map</span>
                </button>
              </>
            )}

            {/* ==================== 3. MANAGEMENT NAVIGATION ==================== */}
            {isManagement && (
              <>
                <button
                  id="nav-management-overview"
                  onClick={() => handleTabClick('management_dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-left ${
                    activeTab === 'management_dashboard'
                      ? 'bg-blue-50 text-blue-900 border-r-4 border-blue-700 shadow-xs'
                      : 'text-[#43474f] hover:bg-blue-50/60 hover:text-blue-900'
                  }`}
                >
                  <Building2 className={`w-4 h-4 ${activeTab === 'management_dashboard' ? 'text-blue-700' : 'text-[#737780]'}`} />
                  <span>Management HQ</span>
                </button>
              </>
            )}

            {/* ==================== 4. SUPER ADMIN NAVIGATION ==================== */}
            {isSuperAdmin && (
              <>
                <button
                  id="nav-admin-command"
                  onClick={() => handleTabClick('admin_dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-left ${
                    activeTab === 'admin_dashboard'
                      ? 'bg-purple-50 text-purple-900 border-r-4 border-purple-700 shadow-xs'
                      : 'text-[#43474f] hover:bg-purple-50/60 hover:text-purple-900'
                  }`}
                >
                  <Shield className={`w-4 h-4 ${activeTab === 'admin_dashboard' ? 'text-purple-700' : 'text-[#737780]'}`} />
                  <span>Admin Console</span>
                </button>
              </>
            )}

            {/* ==================== CAMPUS OPERATIONS & MONITORING (Admin & Management) ==================== */}
            {(isManagement || isSuperAdmin) && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 mb-1">
                  Campus Intelligence
                </span>

                <button
                  id="nav-cctv-pipeline"
                  onClick={() => handleTabClick('cctv_pipeline')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-left ${
                    activeTab === 'cctv_pipeline'
                      ? 'bg-indigo-50 text-indigo-900 border-r-4 border-indigo-600 shadow-xs'
                      : 'text-[#43474f] hover:bg-indigo-50/60 hover:text-indigo-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Layers className={`w-4 h-4 ${activeTab === 'cctv_pipeline' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>CCTV AI Sweeps</span>
                  </div>
                  <span className="bg-indigo-100 text-indigo-800 text-[9px] font-black px-1.5 py-0.5 rounded">
                    4x
                  </span>
                </button>

                <button
                  id="nav-campus-map"
                  onClick={() => handleTabClick('map')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-left ${
                    activeTab === 'map'
                      ? 'bg-slate-100 text-[#001e40] border-r-4 border-[#001e40] shadow-xs'
                      : 'text-[#43474f] hover:bg-slate-100/60 hover:text-[#001e40]'
                  }`}
                >
                  <MapIcon className={`w-4 h-4 ${activeTab === 'map' ? 'text-[#001e40]' : 'text-slate-400'}`} />
                  <span>GIS Campus Map</span>
                </button>

                <button
                  id="nav-heatisland-mgmt"
                  onClick={() => handleTabClick('heatisland')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-left ${
                    activeTab === 'heatisland'
                      ? 'bg-rose-50 text-rose-900 border-r-4 border-rose-600 shadow-xs'
                      : 'text-[#43474f] hover:bg-rose-50/60 hover:text-rose-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Flame className={`w-4 h-4 ${activeTab === 'heatisland' ? 'text-rose-600' : 'text-slate-400'}`} />
                    <span>Heat Island & UHI</span>
                  </div>
                  <span className="bg-rose-100 text-rose-800 text-[9px] font-black px-1.5 py-0.5 rounded">
                    SIM
                  </span>
                </button>

                <button
                  id="nav-planning-board"
                  onClick={() => handleTabClick('planning')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-left ${
                    activeTab === 'planning'
                      ? 'bg-slate-100 text-[#001e40] border-r-4 border-[#001e40] shadow-xs'
                      : 'text-[#43474f] hover:bg-slate-100/60 hover:text-[#001e40]'
                  }`}
                >
                  <LayoutGrid className={`w-4 h-4 ${activeTab === 'planning' ? 'text-[#001e40]' : 'text-slate-400'}`} />
                  <span>Planning Board</span>
                </button>

                <button
                  id="nav-analytics-mgmt"
                  onClick={() => handleTabClick('analytics')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-left ${
                    activeTab === 'analytics'
                      ? 'bg-slate-100 text-[#001e40] border-r-4 border-[#001e40] shadow-xs'
                      : 'text-[#43474f] hover:bg-slate-100/60 hover:text-[#001e40]'
                  }`}
                >
                  <BarChart3 className={`w-4 h-4 ${activeTab === 'analytics' ? 'text-[#001e40]' : 'text-slate-400'}`} />
                  <span>SWM Analytics</span>
                </button>
              </div>
            )}

          </nav>
        </div>

      {/* Bottom Footer Actions & Authenticated Session Badge */}
      <div className="flex flex-col gap-1.5 px-3 border-t border-[#e7eeff] pt-3">
        {/* Settings */}
        <button
          id="nav-settings"
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold tracking-wider uppercase text-[#43474f] hover:bg-[#e7eeff] hover:text-[#001e40] transition-colors text-left cursor-pointer"
        >
          <Settings className="w-4 h-4 text-[#737780]" />
          <span>Settings</span>
        </button>

        {/* Authenticated Identity Pill & Switch Account trigger */}
        <div className="mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg flex-shrink-0">{currentProfile?.avatar || '👤'}</span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-800 truncate leading-tight">
                {currentProfile?.name || (isStudent ? 'Sunny Bharti' : isBvg ? 'Ramesh Kumar' : isManagement ? 'Er. R. K. Sharma' : 'Prof. A. K. Shukla')}
              </p>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                {isStudent ? 'Student' : isBvg ? 'BVG Worker' : isManagement ? 'Estate Mgmt' : 'Super Admin'}
              </p>
            </div>
          </div>

          <button
            id="nav-switch-account"
            onClick={onOpenAccountSwitcher}
            className="p-1.5 text-slate-500 hover:text-[#001e40] hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer flex-shrink-0"
            title="Switch User Account"
          >
            <UserCheck className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
    </>
  );
};
