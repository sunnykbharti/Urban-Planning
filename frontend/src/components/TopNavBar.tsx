import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  HelpCircle, 
  User, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  X,
  GraduationCap,
  HardHat,
  Building2,
  ChevronDown,
  UserCheck,
  LogOut,
  Shield,
  BadgeCheck,
  Server
} from 'lucide-react';
import { ActivityEvent, UserRole, UserProfile } from '../types';

interface TopNavBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activities: ActivityEvent[];
  urgentCount: number;
  userRole: UserRole;
  onOpenReportDrawer: () => void;
  currentProfile?: UserProfile;
  onOpenAccountSwitcher?: () => void;
  onSignOut?: () => void;
  backendOnline?: boolean;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  searchQuery,
  onSearchChange,
  activities,
  urgentCount,
  userRole,
  onOpenReportDrawer,
  currentProfile,
  onOpenAccountSwitcher,
  onSignOut,
  backendOnline
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  // Role display metadata
  const getRoleBadge = () => {
    switch (userRole) {
      case 'bvg_worker':
      case 'operator':
        return {
          title: 'Sanitation Beat Lead',
          badgeText: 'BVG Field Worker',
          color: 'bg-amber-100 text-amber-900 border-amber-300',
          iconColor: 'bg-amber-600'
        };
      case 'management':
        return {
          title: 'Executive Sanitation Engineer',
          badgeText: 'Estate Directorate',
          color: 'bg-blue-100 text-blue-900 border-blue-300',
          iconColor: 'bg-blue-700'
        };
      case 'super_admin':
      case 'admin':
        return {
          title: 'Registrar & Chief Administrator',
          badgeText: 'Super Admin',
          color: 'bg-purple-100 text-purple-900 border-purple-300',
          iconColor: 'bg-purple-900'
        };
      default:
        return {
          title: 'UIET B.Tech Student',
          badgeText: 'Campus Citizen',
          color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          iconColor: 'bg-emerald-600'
        };
    }
  };

  const roleMeta = getRoleBadge();
  const userName = currentProfile?.name || (userRole === 'student' ? 'Sunny Bharti' : userRole === 'bvg_worker' ? 'Ramesh Kumar' : userRole === 'management' ? 'Er. R. K. Sharma' : 'Prof. A. K. Shukla');
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <header className="fixed top-0 left-0 w-full z-40 flex justify-between items-center px-4 md:px-8 h-16 bg-[#ffffff] border-b border-[#c3c6d1] shadow-xs">
      {/* Brand Logo / Title & Active Persona Badge */}
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs ${roleMeta.iconColor}`}>
          {userRole === 'student' ? (
            <GraduationCap className="w-5 h-5" />
          ) : userRole === 'bvg_worker' || userRole === 'operator' ? (
            <HardHat className="w-5 h-5 text-amber-200" />
          ) : userRole === 'management' ? (
            <Building2 className="w-5 h-5 text-blue-200" />
          ) : (
            <span className="text-sm font-black">🏛️</span>
          )}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-base md:text-lg font-extrabold text-[#001e40] tracking-tight leading-tight">
              CSJMU Urban Planning Portal
            </span>
            <span className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${roleMeta.color}`}>
              <BadgeCheck className="w-3 h-3" />
              <span>{roleMeta.badgeText}</span>
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-semibold hidden md:inline">
            {currentProfile?.department || 'Kanpur Nagar Campus Municipal Precinct'}
          </span>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-sm mx-4 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#43474f]" />
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search reports, wards, work orders..."
            className="w-full pl-9 pr-7 py-1.5 rounded-full border border-[#c3c6d1] bg-[#f0f3ff] focus:bg-white focus:border-[#001e40] focus:ring-1 focus:ring-[#001e40] outline-none text-xs text-[#111c2d] placeholder-[#737780] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737780] hover:text-[#111c2d]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Trailing Action Icons & User Account Profile */}
      <div className="flex items-center gap-2 text-[#001e40]">
        {/* Backend Online status indicator */}
        {backendOnline !== undefined && (
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-bold bg-slate-100 border border-slate-200">
            <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-slate-600">{backendOnline ? 'API Synced' : 'Offline Cache'}</span>
          </div>
        )}

        {/* Help Button */}
        <button
          id="help-button"
          onClick={() => setShowHelp(true)}
          aria-label="Help & Documentation"
          className="p-2 rounded-full hover:bg-[#dee8ff] text-[#43474f] hover:text-[#001e40] transition-colors flex items-center justify-center relative cursor-pointer"
          title="Help & Campus Protocols"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            id="notifications-button"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className="p-2 rounded-full hover:bg-[#dee8ff] text-[#43474f] hover:text-[#001e40] transition-colors flex items-center justify-center relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {urgentCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#ba1a1a] rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {showNotifications && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowNotifications(false)} 
              />
              <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white border border-[#c3c6d1] rounded-xl shadow-xl z-50 p-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-[#c3c6d1]">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#001e40]" />
                    <span className="font-semibold text-sm text-[#001e40]">Campus Dispatch Alerts</span>
                  </div>
                  <span className="text-xs bg-[#ffdad6] text-[#ba1a1a] font-bold px-2 py-0.5 rounded-full">
                    {urgentCount} High Priority
                  </span>
                </div>

                <div className="py-2 max-h-72 overflow-y-auto divide-y divide-[#dee8ff]/50">
                  {activities.length === 0 ? (
                    <p className="text-xs text-[#737780] py-4 text-center">No recent alerts</p>
                  ) : (
                    activities.map((act) => (
                      <div key={act.id} className="py-2.5 flex items-start gap-3 hover:bg-[#f0f3ff] px-2 rounded-lg transition-colors">
                        <div className="p-1.5 bg-[#e7eeff] text-[#001e40] rounded-full mt-0.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-[#ba1a1a]" />
                        </div>
                        <div className="flex-1 text-xs">
                          <p className="font-semibold text-[#111c2d] leading-tight">{act.title}</p>
                          <p className="text-[#43474f] mt-0.5 line-clamp-2">{act.description}</p>
                          <span className="text-[10px] text-[#737780] mt-1 block">{act.timestamp}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Account Profile & Switcher Dropdown */}
        <div className="relative ml-1">
          <button
            id="account-menu-button"
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            aria-label="User profile and account options"
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className={`w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-xs ${roleMeta.iconColor}`}>
              {userInitials}
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {userName}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">{roleMeta.badgeText}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showAccountMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowAccountMenu(false)} 
              />
              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#c3c6d1] rounded-2xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-150">
                {/* Active User Identity Card */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{currentProfile?.avatar || '👤'}</span>
                    <div>
                      <p className="text-xs font-black text-slate-900 leading-tight">
                        {userName}
                      </p>
                      <p className="text-[11px] text-slate-600 font-medium">
                        {currentProfile?.roleTitle || roleMeta.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleMeta.color}`}>
                          {roleMeta.badgeText}
                        </span>
                        <span className="text-[10px] font-mono font-semibold text-slate-500">
                          {currentProfile?.badgeNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
                    <span>{currentProfile?.agency}</span>
                    <span className="text-emerald-700 font-bold">● Active Session</span>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="space-y-1.5">
                  {/* Switch Account */}
                  <button
                    onClick={() => {
                      setShowAccountMenu(false);
                      if (onOpenAccountSwitcher) onOpenAccountSwitcher();
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 hover:bg-[#dee8ff] hover:text-[#001e40] transition-colors flex items-center justify-between cursor-pointer border border-slate-200/60"
                  >
                    <div className="flex items-center gap-2.5">
                      <UserCheck className="w-4 h-4 text-[#001e40]" />
                      <div>
                        <p className="leading-tight">Switch User Account</p>
                        <p className="text-[10px] text-slate-500 font-normal">
                          Sign in as another seeded campus account
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Sign Out */}
                  <button
                    onClick={() => {
                      setShowAccountMenu(false);
                      if (onSignOut) onSignOut();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-red-700 hover:bg-red-50 transition-colors flex items-center gap-2.5 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-600" />
                    <span>Sign Out (Return to Public Hub)</span>
                  </button>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-400 text-center">
                  🔒 RBAC credentials verified via CSJMU Directory
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 border border-[#c3c6d1] shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 p-1.5 text-[#737780] hover:text-[#111c2d] hover:bg-[#f0f3ff] rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-[#e7eeff] text-[#001e40] rounded-lg">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#001e40]">CSJMU Portal Protocols</h3>
                <p className="text-xs text-[#737780]">Operational guidelines &amp; role responsibilities</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-[#43474f] leading-relaxed max-h-96 overflow-y-auto pr-1">
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="font-bold text-emerald-900 mb-1">👨‍🎓 Student / Campus Citizen Role</p>
                <p>Public civic access. Report infrastructure anomalies, track cleaning progress, view campus heat island zones and eco-refuges.</p>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="font-bold text-amber-900 mb-1">👷‍♂️ BVG Worker Role (Field Operations)</p>
                <p>Contractor task queue. Execute cleaning work orders, run Computer Vision AI before/after verification, and submit beat reassignments or leave applications.</p>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-bold text-blue-900 mb-1">👨‍💼 Management Role (Directorate of Estate &amp; Works)</p>
                <p>Executive sanitation oversight. Audit contractor SLAs, authorize beat reassignments, approve workforce leaves, and monitor campus-wide sanitary hygiene.</p>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="font-bold text-purple-900 mb-1">👑 Super Admin Role (Registrar Secretariat)</p>
                <p>System master terminal. Credential administration, automated CCTV AI sweeps, microclimate heat-island planning, and system audit governance.</p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#c3c6d1] flex justify-end">
              <button
                onClick={() => setShowHelp(false)}
                className="px-4 py-2 bg-[#001e40] text-white text-xs font-semibold rounded-lg hover:bg-[#003366] transition-colors cursor-pointer"
              >
                Close Guidelines
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
