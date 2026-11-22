import React, { useState } from 'react';
import {
  Search,
  Bell,
  HelpCircle,
  X,
  ChevronDown,
  LogOut,
  Menu,
  BookOpen,
  AlertTriangle
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
  onSignOut?: () => void;
  backendOnline?: boolean;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
  isAuthenticated?: boolean;
  onNavigateToLanding?: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  searchQuery,
  onSearchChange,
  activities,
  urgentCount,
  userRole,
  onOpenReportDrawer,
  currentProfile,
  onSignOut,
  backendOnline,
  isMobileMenuOpen,
  onToggleMobileMenu,
  isAuthenticated = true,
  onNavigateToLanding
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const userName = isAuthenticated
    ? (currentProfile?.name || 'User')
    : 'Guest';
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-40 h-16 bg-black flex items-center justify-between px-4 md:px-6">

      {/* Left: Hamburger + Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          className="p-1.5 rounded text-gray-300 hover:text-white md:hidden cursor-pointer"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <button
          onClick={onNavigateToLanding}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-7 h-7 rounded bg-white flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-black" />
          </div>
          <span className="text-white text-base font-bold tracking-tight">Campusr</span>
        </button>

        {/* Top-level nav links – desktop only */}
        <nav className="hidden lg:flex items-center gap-1 ml-4">
          <span className="px-3 py-1.5 text-sm font-medium text-white bg-gray-800 rounded-full cursor-default">
            {userRole === 'student' ? 'Dashboard' : userRole === 'bvg_worker' || userRole === 'operator' ? 'Field ops' : userRole === 'management' ? 'Management' : 'Admin'}
          </span>
          <button onClick={onOpenReportDrawer} className="px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors cursor-pointer">
            Report
          </button>
        </nav>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search reports, wards, work orders…"
            className="w-full pl-9 pr-8 py-2 rounded-full bg-gray-800 border-none text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer relative"
          >
            <Bell className="w-5 h-5" />
            {urgentCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-black" />
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <span className="font-semibold text-sm text-gray-900">Alerts</span>
                  {urgentCount > 0 && (
                    <span className="text-xs bg-red-50 text-red-700 font-semibold px-2 py-0.5 rounded">
                      {urgentCount} urgent
                    </span>
                  )}
                </div>
                <div className="py-2 max-h-72 overflow-y-auto divide-y divide-gray-50">
                  {activities.length === 0 ? (
                    <p className="text-xs text-gray-400 py-4 text-center">No recent alerts</p>
                  ) : (
                    activities.slice(0, 8).map((act) => (
                      <div key={act.id} className="py-2.5 flex items-start gap-3 hover:bg-gray-50 px-2 rounded transition-colors">
                        <div className="p-1.5 bg-gray-100 rounded mt-0.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-gray-500" />
                        </div>
                        <div className="flex-1 text-xs">
                          <p className="font-medium text-gray-900 leading-tight">{act.title}</p>
                          <span className="text-[10px] text-gray-400 mt-1 block">{act.timestamp}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Help */}
        <button
          aria-label="Help"
          className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer hidden sm:flex"
          onClick={() => window.open('mailto:support@campusr.io?subject=Help', '_blank')}
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* User dropdown */}
        <div className="relative ml-1">
          <button
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            aria-label="Account"
            className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center font-semibold text-xs">
              {currentProfile?.avatar || userInitials}
            </div>
            <span className="hidden xl:inline text-sm font-medium text-white">{userName.split(' ')[0]}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden xl:block" />
          </button>

          {showAccountMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowAccountMenu(false)} />
              <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-2">
                {/* User info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{currentProfile?.roleTitle || 'User'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{currentProfile?.email}</p>
                </div>

                {/* Actions */}
                <div className="py-1">
                  {onNavigateToLanding && (
                    <button
                      onClick={() => { setShowAccountMenu(false); onNavigateToLanding(); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-gray-400" />
                      Home page
                    </button>
                  )}

                  <button
                    onClick={() => { setShowAccountMenu(false); if (onSignOut) onSignOut(); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2.5 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-gray-400" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
