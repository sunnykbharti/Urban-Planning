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
  Building2
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
        {/* Brand/Division Header */}
        <div className="px-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#003366] flex items-center justify-center text-white font-bold shadow-xs overflow-hidden flex-shrink-0">
              <Building2 className="w-5 h-5 text-[#a7c8ff]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#001e40] leading-tight">UIET Dashboard</h2>
              <p className="text-xs text-[#43474f]">Planning Division</p>
            </div>
          </div>

          {/* New Report Action Button */}
          <button
            id="new-report-button"
            onClick={onOpenReportDrawer}
            className="w-full bg-[#001e40] text-white py-2.5 px-4 rounded-lg font-semibold text-sm hover:bg-[#003366] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm group cursor-pointer"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
            <span>New Report</span>
          </button>
        </div>

        {/* Navigation Tabs List */}
        <nav className="flex flex-col gap-1 px-3">
          {/* 1. Map Overview */}
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
            <span>Map Overview</span>
          </button>

          {/* 2. Live Feed */}
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

          {/* 3. Planning Board */}
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

          {/* 4. Maintenance Log */}
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
              <span>Maintenance Log</span>
            </div>
            {urgentCount > 0 && (
              <span className="bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {urgentCount}
              </span>
            )}
          </button>

          {/* 5. Analytics */}
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
        </nav>
      </div>

      {/* Bottom Footer Actions */}
      <div className="flex flex-col gap-1 px-3 border-t border-[#e7eeff] pt-4">
        {/* Settings */}
        <button
          id="nav-settings"
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold tracking-wider uppercase text-[#43474f] hover:bg-[#e7eeff] hover:text-[#001e40] transition-colors text-left"
        >
          <Settings className="w-4 h-4 text-[#737780]" />
          <span>Settings</span>
        </button>

        {/* Switch View */}
        <button
          id="nav-switch-view"
          onClick={onToggleRole}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold tracking-wider uppercase text-[#43474f] hover:bg-[#e7eeff] hover:text-[#001e40] transition-colors text-left"
          title={`Currently in ${userRole.toUpperCase()} Mode`}
        >
          <div className="flex items-center gap-3">
            <RefreshCw className="w-4 h-4 text-[#737780]" />
            <span>Switch View</span>
          </div>
          <span className="text-[10px] lowercase text-[#737780] bg-[#f0f3ff] px-1.5 py-0.5 rounded font-normal">
            {userRole}
          </span>
        </button>
      </div>
    </aside>
  );
};
