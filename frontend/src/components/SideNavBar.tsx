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
  CheckCircle2
} from 'lucide-react';
import { ActiveTab, UserRole } from '../types';

interface SideNavBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenReportDrawer: () => void;
  onOpenSettings: () => void;
  userRole: UserRole;
  onToggleRole: () => void;
  urgentCount: number;
}

export const SideNavBar: React.FC<SideNavBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenReportDrawer,
  onOpenSettings,
  userRole,
  onToggleRole,
  urgentCount
}) => {
  return (
    <aside className="fixed left-0 top-0 h-full w-[240px] z-30 pt-20 pb-6 flex flex-col justify-between bg-[#ffffff] border-r border-[#c3c6d1] transition-transform duration-200">
      {/* Top Section */}
      <div className="flex flex-col">
        {/* Brand/Division Header customized per role */}
        <div className="px-5 mb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-xs overflow-hidden flex-shrink-0 ${
              userRole === 'student' 
                ? 'bg-gradient-to-br from-blue-600 to-indigo-700' 
                : userRole === 'operator'
                ? 'bg-gradient-to-br from-emerald-600 to-teal-800'
                : 'bg-gradient-to-br from-[#001e40] to-[#003366]'
            }`}>
              {userRole === 'student' ? (
                <GraduationCap className="w-5 h-5 text-white" />
              ) : userRole === 'operator' ? (
                <HardHat className="w-5 h-5 text-emerald-200" />
              ) : (
                <Building2 className="w-5 h-5 text-blue-200" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-black text-[#001e40] leading-tight truncate">
                {userRole === 'student' ? 'UIET Student' : userRole === 'operator' ? 'Beat Operations' : 'Planning Division'}
              </h2>
              <p className="text-[11px] text-[#737780] font-semibold truncate">
                {userRole === 'student' ? 'Citizen Hub' : userRole === 'operator' ? 'Beat 01 • Ward 42' : 'Estate & Works HQ'}
              </p>
            </div>
          </div>

          {/* New Report Action Button */}
          <button
            id="new-report-button"
            onClick={onOpenReportDrawer}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-2 group cursor-pointer transition-all active:scale-[0.98] ${
              userRole === 'student'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-amber-500/20'
                : userRole === 'operator'
                ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                : 'bg-[#001e40] text-white hover:bg-[#003366]'
            }`}
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
            <span>
              {userRole === 'student' ? 'Report Hazard' : userRole === 'operator' ? 'Log Field Task' : 'New Incident'}
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

          {/* ==================== 2. OPERATOR / AUTHORITY NAVIGATION ==================== */}
          {userRole === 'operator' && (
            <>
              {/* Field Work Orders */}
              <button
                id="nav-operator-orders"
                onClick={() => onSelectTab('operator_dashboard')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all text-left ${
                  activeTab === 'operator_dashboard'
                    ? 'bg-emerald-50 text-emerald-900 border-r-4 border-emerald-700 shadow-xs'
                    : 'text-[#43474f] hover:bg-emerald-50/60 hover:text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Wrench className={`w-4 h-4 ${activeTab === 'operator_dashboard' ? 'text-emerald-700' : 'text-[#737780]'}`} />
                  <span>Work Orders</span>
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
                <span>Field Route Map</span>
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
                  <HardHat className={`w-4 h-4 ${activeTab === 'maintenance' ? 'text-[#001e40]' : 'text-[#737780]'}`} />
                  <span>Beat Triage</span>
                </div>
              </button>

              {/* ARE Pipeline Engine */}
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
                  <span>ARE Engine</span>
                </div>
                <span className="bg-indigo-100 text-indigo-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                  DISPATCH
                </span>
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

          {/* ==================== 3. ADMIN ROLE NAVIGATION ==================== */}
          {userRole === 'admin' && (
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

        {/* Switch View Button cycling through 3 roles */}
        <button
          id="nav-switch-view"
          onClick={onToggleRole}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold tracking-wider uppercase text-[#43474f] hover:bg-[#e7eeff] hover:text-[#001e40] transition-colors text-left cursor-pointer"
          title={`Click to switch role (Current: ${userRole.toUpperCase()})`}
        >
          <div className="flex items-center gap-2.5">
            <RefreshCw className="w-4 h-4 text-[#737780]" />
            <span>Switch Role</span>
          </div>
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full capitalize ${
            userRole === 'student'
              ? 'bg-blue-100 text-blue-800'
              : userRole === 'operator'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-indigo-100 text-indigo-800'
          }`}>
            {userRole}
          </span>
        </button>
      </div>
    </aside>
  );
};
