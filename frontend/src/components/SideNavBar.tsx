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
  Radio,
  Flame,
  Layers,
  GraduationCap,
  HardHat,
  Award,
  TreeDeciduous,
  CheckCircle2,
  Video
} from 'lucide-react';
import { ActiveTab, UserRole } from '../types';

interface SideNavBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenReportDrawer: () => void;
  onOpenSettings: () => void;
  userRole: UserRole;
  onToggleRole?: () => void;
  onRequestRoleChange?: (role: UserRole) => void;
  urgentCount: number;
}

export const SideNavBar: React.FC<SideNavBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenReportDrawer,
  onOpenSettings,
  userRole,
  onToggleRole,
  onRequestRoleChange,
  urgentCount
}) => {
  const isStudent = userRole === 'student';
  const isBvg = userRole === 'bvg_worker' || userRole === 'operator';
  const isManagement = userRole === 'management';
  const isSuperAdmin = userRole === 'super_admin' || userRole === 'admin';

  return (
    <aside className="fixed left-0 top-0 h-full w-[240px] z-30 pt-20 pb-6 flex flex-col justify-between bg-[#ffffff] border-r border-[#c3c6d1] transition-transform duration-200">
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
                {isStudent ? 'UIET Student' : isBvg ? 'BVG Cleaning Agency' : isManagement ? 'Estate Management' : 'Super Admin HQ'}
              </h2>
              <p className="text-[11px] text-[#737780] font-semibold truncate">
                {isStudent ? 'Citizen Hub' : isBvg ? 'Beat 01 Field Staff' : isManagement ? 'Sanitation Oversight' : 'Master IT Terminal'}
              </p>
            </div>
          </div>

          {/* New Report Action Button */}
          <button
            id="new-report-button"
            onClick={onOpenReportDrawer}
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
              {isStudent ? 'Report Hazard' : isBvg ? 'Log Field Task' : 'New Incident'}
            </span>
          </button>
        </div>

        {/* Navigation Tabs List - Filtered by User Role */}
        <nav className="flex flex-col gap-1 px-3 overflow-y-auto max-h-[calc(100vh-290px)] custom-scrollbar">
          
          {/* ==================== 1. STUDENT ROLE NAVIGATION ==================== */}
          {userRole === 'student' && (
            <>
              {/* Student Hub / Dashboard */}
              <button
                id="nav-student-hub"
                onClick={() => onSelectTab('student_dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-left ${
                  activeTab === 'student_dashboard'
                    ? 'bg-[#f0f3ff] text-[#001e40] border-r-4 border-[#001e40] shadow-xs'
                    : 'text-[#43474f] hover:bg-[#e7eeff] hover:text-[#001e40]'
                }`}
              >
                <Home className={`w-4 h-4 ${activeTab === 'student_dashboard' ? 'text-[#001e40]' : 'text-[#737780]'}`} />
                <span>Student Hub</span>
              </button>

              {/* Campus Interactive Map */}
              <button
                id="nav-map-overview"
                onClick={() => onSelectTab('map')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-left ${
                  activeTab === 'map'
                    ? 'bg-[#f0f3ff] text-[#001e40] border-r-4 border-[#001e40] shadow-xs'
                    : 'text-[#43474f] hover:bg-[#e7eeff] hover:text-[#001e40]'
                }`}
              >
                <MapIcon className={`w-4 h-4 ${activeTab === 'map' ? 'text-[#001e40]' : 'text-[#737780]'}`} />
                <span>Campus Map</span>
              </button>

              {/* Cool Havens & Heat Map */}
              <button
                id="nav-heat-island"
                onClick={() => onSelectTab('heatisland')}
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
                  COMFORT
                </span>
              </button>

              {/* Campus Community Feed */}
              <button
                id="nav-live-feed"
                onClick={() => onSelectTab('feed')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-left ${
                  activeTab === 'feed'
                    ? 'bg-[#f0f3ff] text-[#001e40] border-r-4 border-[#001e40] shadow-xs'
                    : 'text-[#43474f] hover:bg-[#e7eeff] hover:text-[#001e40]'
                }`}
              >
                <LayoutGrid className={`w-4 h-4 ${activeTab === 'feed' ? 'text-[#001e40]' : 'text-[#737780]'}`} />
                <span>Campus Feed</span>
              </button>
            </>
          )}

          {/* ==================== 2. BVG WORKERS NAVIGATION ==================== */}
          {isBvg && (
            <>
              {/* Field Work Orders */}
              <button
                id="nav-operator-orders"
                onClick={() => onSelectTab('bvg_dashboard')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-left ${
                  activeTab === 'bvg_dashboard' || activeTab === 'operator_dashboard'
                    ? 'bg-amber-50 text-amber-900 border-r-4 border-amber-600 shadow-xs'
                    : 'text-[#43474f] hover:bg-amber-50/60 hover:text-amber-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <HardHat className={`w-4 h-4 ${activeTab === 'bvg_dashboard' ? 'text-amber-700' : 'text-[#737780]'}`} />
                  <span>BVG Work Orders</span>
                </div>
                {urgentCount > 0 && (
                  <span className="bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                    {urgentCount}
                  </span>
                )}
              </button>

              {/* Field Route Map */}
              <button
                id="nav-map-overview"
                onClick={() => onSelectTab('map')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-left ${
                  activeTab === 'map'
                    ? 'bg-[#f0f3ff] text-[#001e40] border-r-4 border-[#001e40] shadow-xs'
                    : 'text-[#43474f] hover:bg-[#e7eeff] hover:text-[#001e40]'
                }`}
              >
                <MapIcon className={`w-4 h-4 ${activeTab === 'map' ? 'text-[#001e40]' : 'text-[#737780]'}`} />
                <span>Beat Route Map</span>
              </button>

              {/* Maintenance Log */}
              <button
                id="nav-maintenance-log"
                onClick={() => onSelectTab('maintenance')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-left ${
                  activeTab === 'maintenance'
                    ? 'bg-[#f0f3ff] text-[#001e40] border-r-4 border-[#001e40] shadow-xs'
                    : 'text-[#43474f] hover:bg-[#e7eeff] hover:text-[#001e40]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Wrench className={`w-4 h-4 ${activeTab === 'maintenance' ? 'text-[#001e40]' : 'text-[#737780]'}`} />
                  <span>Beat Triage</span>
                </div>
              </button>

              {/* Live Feed */}
              <button
                id="nav-live-feed"
                onClick={() => onSelectTab('feed')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-left ${
                  activeTab === 'feed'
                    ? 'bg-[#f0f3ff] text-[#001e40] border-r-4 border-[#001e40] shadow-xs'
                    : 'text-[#43474f] hover:bg-[#e7eeff] hover:text-[#001e40]'
                }`}
              >
                <LayoutGrid className={`w-4 h-4 ${activeTab === 'feed' ? 'text-[#001e40]' : 'text-[#737780]'}`} />
                <span>Beat Feed</span>
              </button>
            </>
          )}

          {/* ==================== 3. MANAGEMENT NAVIGATION ==================== */}
          {isManagement && (
            <>
              {/* Management Oversight */}
              <button
                id="nav-management-overview"
                onClick={() => onSelectTab('management_dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-left ${
                  activeTab === 'management_dashboard'
                    ? 'bg-blue-50 text-blue-900 border-r-4 border-blue-700 shadow-xs'
                    : 'text-[#43474f] hover:bg-blue-50/60 hover:text-blue-900'
                }`}
              >
                <Building2 className={`w-4 h-4 ${activeTab === 'management_dashboard' ? 'text-blue-700' : 'text-[#737780]'}`} />
                <span>Management HQ</span>
              </button>

              {/* Campus Master Map */}
              <button
                id="nav-map-overview"
                onClick={() => onSelectTab('map')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-left ${
                  activeTab === 'map'
                    ? 'bg-[#f0f3ff] text-[#001e40] border-r-4 border-[#001e40] shadow-xs'
                    : 'text-[#43474f] hover:bg-[#e7eeff] hover:text-[#001e40]'
                }`}
              >
                <MapIcon className={`w-4 h-4 ${activeTab === 'map' ? 'text-[#001e40]' : 'text-[#737780]'}`} />
                <span>Master Map</span>
              </button>

              {/* Heat Island Studio */}
              <button
                id="nav-heat-island"
                onClick={() => onSelectTab('heatisland')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-left ${
                  activeTab === 'heatisland'
                    ? 'bg-[#fff1f2] text-[#be123c] border-r-4 border-[#be123c] shadow-xs'
                    : 'text-[#43474f] hover:bg-[#fff1f2] hover:text-[#be123c]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Flame className="w-4 h-4 text-rose-600" />
                  <span>Heat Island</span>
                </div>
              </button>

              {/* ARE Pipeline */}
              <button
                id="nav-pipeline-visualizer"
                onClick={() => onSelectTab('pipeline')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-left ${
                  activeTab === 'pipeline'
                    ? 'bg-[#f0f3ff] text-[#001e40] border-r-4 border-[#001e40] shadow-xs'
                    : 'text-[#43474f] hover:bg-[#e7eeff] hover:text-[#001e40]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Layers className={`w-4 h-4 ${activeTab === 'pipeline' ? 'text-indigo-600' : 'text-[#737780]'}`} />
                  <span>ARE Pipeline</span>
                </div>
              </button>

              {/* CCTV Garbage Pipeline */}
              <button
                id="nav-cctv-pipeline-operator"
                onClick={() => onSelectTab('cctv_pipeline')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-left ${
                  activeTab === 'cctv_pipeline'
                    ? 'bg-[#f0f3ff] text-[#001e40] border-r-4 border-indigo-600 shadow-xs'
                    : 'text-[#43474f] hover:bg-[#e7eeff] hover:text-[#001e40]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Video className={`w-4 h-4 ${activeTab === 'cctv_pipeline' ? 'text-indigo-600' : 'text-[#737780]'}`} />
                  <span>CCTV Pipeline</span>
                </div>
              </button>

              {/* Maintenance Log */}
              <button
                id="nav-maintenance-log"
                onClick={() => onSelectTab('maintenance')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-left ${
                  activeTab === 'maintenance'
                    ? 'bg-[#f0f3ff] text-[#001e40] border-r-4 border-[#001e40] shadow-xs'
                    : 'text-[#43474f] hover:bg-[#e7eeff] hover:text-[#001e40]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Wrench className={`w-4 h-4 ${activeTab === 'maintenance' ? 'text-[#001e40]' : 'text-[#737780]'}`} />
                  <span>SLA Audit</span>
                </div>
              </button>
            </>
          )}

          {/* ==================== 4. SUPER ADMIN NAVIGATION ==================== */}
          {isSuperAdmin && (
            <>
              {/* Executive Command */}
              <button
                id="nav-admin-command"
                onClick={() => onSelectTab('admin_dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-left ${
                  activeTab === 'admin_dashboard'
                    ? 'bg-[#f0f3ff] text-[#001e40] border-r-4 border-[#001e40] shadow-xs'
                    : 'text-[#43474f] hover:bg-[#e7eeff] hover:text-[#001e40]'
                }`}
              >
                <Building2 className={`w-4 h-4 ${activeTab === 'admin_dashboard' ? 'text-[#001e40]' : 'text-[#737780]'}`} />
                <span>Command HQ</span>
              </button>

              {/* Master Campus Map */}
              <button
                id="nav-map-overview"
                onClick={() => onSelectTab('map')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-left ${
                  activeTab === 'map'
                    ? 'bg-[#f0f3ff] text-[#001e40] border-r-4 border-[#001e40] shadow-xs'
                    : 'text-[#43474f] hover:bg-[#e7eeff] hover:text-[#001e40]'
                }`}
              >
                <MapIcon className={`w-4 h-4 ${activeTab === 'map' ? 'text-[#001e40]' : 'text-[#737780]'}`} />
                <span>Master Map</span>
              </button>

              {/* Heat Island Studio */}
              <button
                id="nav-heat-island"
                onClick={() => onSelectTab('heatisland')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-left ${
                  activeTab === 'heatisland'
                    ? 'bg-[#fff1f2] text-[#be123c] border-r-4 border-[#be123c] shadow-xs'
                    : 'text-[#43474f] hover:bg-[#fff1f2] hover:text-[#be123c]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Flame className="w-4 h-4 text-rose-600" />
                  <span className="font-extrabold">Heat Island</span>
                </div>
                <span className="bg-red-100 text-red-700 text-[9px] font-black px-1.5 py-0.5 rounded tracking-wider">
                  STUDIO
                </span>
              </button>

              {/* ARE Pipeline Visualizer */}
              <button
                id="nav-pipeline-visualizer"
                onClick={() => onSelectTab('pipeline')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-left ${
                  activeTab === 'pipeline'
                    ? 'bg-[#f0f3ff] text-[#001e40] border-r-4 border-[#001e40] shadow-xs'
                    : 'text-[#43474f] hover:bg-[#e7eeff] hover:text-[#001e40]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Layers className={`w-4 h-4 ${activeTab === 'pipeline' ? 'text-indigo-600' : 'text-[#737780]'}`} />
                  <span>ARE Pipeline</span>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                  5-STAGE
                </span>
              </button>

              {/* CCTV Garbage Pipeline */}
              <button
                id="nav-cctv-pipeline"
                onClick={() => onSelectTab('cctv_pipeline')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-left ${
                  activeTab === 'cctv_pipeline'
                    ? 'bg-[#f0f3ff] text-[#001e40] border-r-4 border-indigo-600 shadow-xs'
                    : 'text-[#43474f] hover:bg-[#e7eeff] hover:text-[#001e40]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Video className={`w-4 h-4 ${activeTab === 'cctv_pipeline' ? 'text-indigo-600' : 'text-[#737780]'}`} />
                  <span className="font-extrabold">CCTV Pipeline</span>
                </div>
                <span className="bg-indigo-100 text-indigo-800 text-[9px] font-black px-1.5 py-0.5 rounded tracking-wider">
                  4X DAILY
                </span>
              </button>

              {/* Maintenance Log */}
              <button
                id="nav-maintenance-log"
                onClick={() => onSelectTab('maintenance')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-left ${
                  activeTab === 'maintenance'
                    ? 'bg-[#f0f3ff] text-[#001e40] border-r-4 border-[#001e40] shadow-xs'
                    : 'text-[#43474f] hover:bg-[#e7eeff] hover:text-[#001e40]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Wrench className={`w-4 h-4 ${activeTab === 'maintenance' ? 'text-[#001e40]' : 'text-[#737780]'}`} />
                  <span>Maintenance</span>
                </div>
                {urgentCount > 0 && (
                  <span className="bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {urgentCount}
                  </span>
                )}
              </button>

              {/* Planning Board */}
              <button
                id="nav-planning-board"
                onClick={() => onSelectTab('planning')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-left ${
                  activeTab === 'planning'
                    ? 'bg-[#f0f3ff] text-[#001e40] border-r-4 border-[#001e40] shadow-xs'
                    : 'text-[#43474f] hover:bg-[#e7eeff] hover:text-[#001e40]'
                }`}
              >
                <Compass className={`w-4 h-4 ${activeTab === 'planning' ? 'text-[#001e40]' : 'text-[#737780]'}`} />
                <span>Planning Board</span>
              </button>

              {/* Analytics */}
              <button
                id="nav-analytics"
                onClick={() => onSelectTab('analytics')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-left ${
                  activeTab === 'analytics'
                    ? 'bg-[#f0f3ff] text-[#001e40] border-r-4 border-[#001e40] shadow-xs'
                    : 'text-[#43474f] hover:bg-[#e7eeff] hover:text-[#001e40]'
                }`}
              >
                <BarChart3 className={`w-4 h-4 ${activeTab === 'analytics' ? 'text-[#001e40]' : 'text-[#737780]'}`} />
                <span>Analytics</span>
              </button>

              {/* Live Feed */}
              <button
                id="nav-live-feed"
                onClick={() => onSelectTab('feed')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-left ${
                  activeTab === 'feed'
                    ? 'bg-[#f0f3ff] text-[#001e40] border-r-4 border-[#001e40] shadow-xs'
                    : 'text-[#43474f] hover:bg-[#e7eeff] hover:text-[#001e40]'
                }`}
              >
                <LayoutGrid className={`w-4 h-4 ${activeTab === 'feed' ? 'text-[#001e40]' : 'text-[#737780]'}`} />
                <span>Live Feed</span>
              </button>
            </>
          )}

        </nav>
      </div>

      {/* Bottom Footer Actions */}
      <div className="flex flex-col gap-1 px-3 border-t border-[#e7eeff] pt-3">
        {/* Settings */}
        <button
          id="nav-settings"
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold tracking-wider uppercase text-[#43474f] hover:bg-[#e7eeff] hover:text-[#001e40] transition-colors text-left"
        >
          <Settings className="w-4 h-4 text-[#737780]" />
          <span>Settings</span>
        </button>

        {/* Switch View Button triggering RBAC modal */}
        <button
          id="nav-switch-view"
          onClick={() => {
            if (onRequestRoleChange) {
              const nextRole: UserRole = 
                isStudent ? 'bvg_worker' : isBvg ? 'management' : isManagement ? 'super_admin' : 'student';
              onRequestRoleChange(nextRole);
            } else if (onToggleRole) {
              onToggleRole();
            }
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold tracking-wider uppercase text-[#43474f] hover:bg-[#e7eeff] hover:text-[#001e40] transition-colors text-left cursor-pointer"
          title={`Click to authenticate and switch role (Current: ${userRole.toUpperCase()})`}
        >
          <div className="flex items-center gap-2.5">
            <RefreshCw className="w-4 h-4 text-[#737780]" />
            <span>Switch Role</span>
          </div>
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full capitalize ${
            isStudent
              ? 'bg-emerald-100 text-emerald-800'
              : isBvg
              ? 'bg-amber-100 text-amber-900'
              : isManagement
              ? 'bg-blue-100 text-blue-900'
              : 'bg-purple-100 text-purple-900'
          }`}>
            {isStudent ? 'Student' : isBvg ? 'BVG' : isManagement ? 'Mgmt' : 'Super Admin'}
          </span>
        </button>
      </div>
    </aside>
  );
};
