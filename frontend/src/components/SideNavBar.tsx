import React from 'react';
import {
  Map as MapIcon,
  LayoutGrid,
  Wrench,
  BarChart3,
  Settings,
  Plus,
  Building2,
  Home,
  Shield,
  Flame,
  Layers,
  Activity,
  TreeDeciduous,
  Scale,
  BookOpen,
  Terminal
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
  const isDeveloper = userRole === 'developer';

  const handleTabClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const navBtn = (tab: ActiveTab, label: string, icon: React.ReactNode, badge?: number) => (
    <button
      onClick={() => handleTabClick(tab)}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors text-left cursor-pointer ${
        activeTab === tab
          ? 'bg-gray-100 text-black font-semibold'
          : 'text-gray-600 hover:bg-gray-50 hover:text-black'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={activeTab === tab ? 'text-black' : 'text-gray-400'}>{icon}</span>
        <span>{label}</span>
      </div>
      {badge !== undefined && badge > 0 && (
        <span className="bg-red-100 text-red-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">{badge}</span>
      )}
    </button>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-[240px] z-40 flex flex-col justify-between bg-white border-r border-gray-200 transition-transform duration-200 ${
        isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
      }`}>

        {/* Top Section */}
        <div className="flex flex-col pt-4">

          {/* Report Button */}
          <div className="px-3 mb-4">
            <button
              onClick={() => { onOpenReportDrawer(); if (onCloseMobile) onCloseMobile(); }}
              className="w-full py-2.5 px-3 rounded-lg font-medium text-sm bg-black text-white hover:bg-gray-800 flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{isStudent ? 'Report an incident' : isBvg ? 'Log field task' : 'New incident'}</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-0.5 px-3 overflow-y-auto max-h-[calc(100vh-270px)]">

            {/* Student */}
            {isStudent && (
              <>
                {navBtn('student_dashboard', 'Incidents', <Home className="w-4 h-4" />)}
                {navBtn('operations', 'Operations', <Activity className="w-4 h-4" />)}
                {navBtn('map', 'Explore campus', <MapIcon className="w-4 h-4" />)}
                {navBtn('heatisland', 'Shaded spots', <TreeDeciduous className="w-4 h-4" />)}
              </>
            )}

            {/* BVG Worker */}
            {isBvg && (
              <>
                {navBtn('bvg_dashboard', 'Assigned work', <Wrench className="w-4 h-4" />, urgentCount)}
                {navBtn('operations', 'Operations', <Activity className="w-4 h-4" />)}
                {navBtn('map', 'Beat map', <MapIcon className="w-4 h-4" />)}
              </>
            )}

            {/* Management */}
            {isManagement && (
              <>
                {navBtn('management_dashboard', 'Management dashboard', <Building2 className="w-4 h-4" />)}
              </>
            )}

            {/* Super Admin */}
            {isSuperAdmin && (
              <>
                {navBtn('admin_dashboard', 'Admin console', <Shield className="w-4 h-4" />)}
              </>
            )}

            {/* Developer */}
            {isDeveloper && (
              <>
                {navBtn('developer_hub', 'Developer Hub', <Terminal className="w-4 h-4 text-emerald-600" />)}
                {navBtn('admin_dashboard', 'Admin console', <Shield className="w-4 h-4" />)}
                {navBtn('cctv_pipeline', 'CCTV sweeps', <Layers className="w-4 h-4" />)}
                {navBtn('map', 'Campus map', <MapIcon className="w-4 h-4" />)}
                {navBtn('operations', 'Operations', <Activity className="w-4 h-4" />)}
                {navBtn('analytics', 'Waste analytics', <BarChart3 className="w-4 h-4" />)}
              </>
            )}

            {/* Shared – Management & Admin */}
            {(isManagement || isSuperAdmin) && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-0.5">
                <span className="text-[11px] font-medium text-gray-400 px-3 mb-1 uppercase tracking-wider">
                  Intelligence
                </span>
                {navBtn('cctv_pipeline', 'CCTV sweeps', <Layers className="w-4 h-4" />)}
                {navBtn('map', 'Campus map', <MapIcon className="w-4 h-4" />)}
                {navBtn('heatisland', 'Heat island', <Flame className="w-4 h-4" />)}
                {navBtn('planning', 'Planning board', <LayoutGrid className="w-4 h-4" />)}
                {navBtn('analytics', 'Waste analytics', <BarChart3 className="w-4 h-4" />)}
              </div>
            )}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col gap-1 px-3 border-t border-gray-100 pt-2 pb-3">
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs text-gray-500 hover:bg-gray-50 hover:text-black transition-colors text-left cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-gray-400" />
            <span>Settings</span>
          </button>

          {/* Compact links footer */}
          <div className="px-3 py-1 text-[11px] text-gray-400 flex items-center justify-between">
            {onNavigateToLanding && (
              <button onClick={onNavigateToLanding} className="hover:text-gray-700 cursor-pointer">
                Home
              </button>
            )}
            <span>&bull;</span>
            <button onClick={() => handleTabClick('terms' as ActiveTab)} className="hover:text-gray-700 cursor-pointer">
              Terms
            </button>
            <span>&bull;</span>
            <button onClick={() => handleTabClick('privacy' as ActiveTab)} className="hover:text-gray-700 cursor-pointer">
              Privacy
            </button>
          </div>

          {/* User identity */}
          <div className="mt-1 p-2 rounded-md bg-gray-50 border border-gray-200 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#001e40] text-white flex items-center justify-center font-semibold text-xs flex-shrink-0">
              {currentProfile?.avatar || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate leading-tight">
                {currentProfile?.name || 'User'}
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                {isDeveloper ? 'Lead Developer' : isStudent ? 'Student' : isBvg ? 'Field staff' : isManagement ? 'Management' : 'Admin'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-gray-200 z-30 flex items-center justify-around px-2 md:hidden">
        <button
          onClick={() => handleTabClick(isStudent ? 'student_dashboard' : isBvg ? 'bvg_dashboard' : isManagement ? 'management_dashboard' : 'admin_dashboard')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 text-[10px] font-medium transition-colors ${
            activeTab.includes('dashboard') ? 'text-[#001e40] font-semibold' : 'text-gray-400'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => handleTabClick('map')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 text-[10px] font-medium transition-colors ${
            activeTab === 'map' ? 'text-[#001e40] font-semibold' : 'text-gray-400'
          }`}
        >
          <MapIcon className="w-4 h-4" />
          <span>Map</span>
        </button>

        <button
          onClick={() => handleTabClick(isStudent ? 'heatisland' : 'operations')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 text-[10px] font-medium transition-colors ${
            activeTab === 'heatisland' || activeTab === 'operations' ? 'text-[#001e40] font-semibold' : 'text-gray-400'
          }`}
        >
          {isStudent ? <TreeDeciduous className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
          <span>{isStudent ? 'Shaded spots' : 'Operations'}</span>
        </button>
      </nav>
    </>
  );
};
