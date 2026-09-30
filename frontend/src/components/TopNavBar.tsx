import React, { useState } from 'react';
import { Search, Bell, HelpCircle, User, ShieldAlert, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { ActivityEvent, UserRole } from '../types';

interface TopNavBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activities: ActivityEvent[];
  urgentCount: number;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenReportDrawer: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  searchQuery,
  onSearchChange,
  activities,
  urgentCount,
  userRole,
  onRoleChange,
  onOpenReportDrawer
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-40 flex justify-between items-center px-6 md:px-10 h-16 bg-[#ffffff] border-b border-[#c3c6d1] shadow-xs">
      {/* Brand Logo / Title */}
      <div className="flex items-center gap-4">
        <span className="text-lg md:text-xl font-bold text-[#001e40] tracking-tight">
          CSJMU Urban Planning &amp; Maintenance Portal
        </span>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#43474f]" />
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search reports, areas, blocks..."
            className="w-full pl-10 pr-4 py-2 rounded-full border border-[#c3c6d1] bg-[#f0f3ff] focus:bg-white focus:border-[#001e40] focus:ring-1 focus:ring-[#001e40] outline-none text-sm text-[#111c2d] placeholder-[#737780] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737780] hover:text-[#111c2d]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Trailing Action Icons */}
      <div className="flex items-center gap-2 text-[#001e40]">
        {/* Help Button */}
        <button
          id="help-button"
          onClick={() => setShowHelp(true)}
          aria-label="Help & Documentation"
          className="p-2 rounded-full hover:bg-[#dee8ff] text-[#43474f] hover:text-[#001e40] transition-colors flex items-center justify-center relative"
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
            className="p-2 rounded-full hover:bg-[#dee8ff] text-[#43474f] hover:text-[#001e40] transition-colors flex items-center justify-center relative"
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
                    {urgentCount} Urgent
                  </span>
                </div>
                <div className="divide-y divide-[#e7eeff] max-h-80 overflow-y-auto custom-scrollbar my-1">
                  {activities.slice(0, 5).map((act) => (
                    <div key={act.id} className="py-2.5 px-1 hover:bg-[#f0f3ff] rounded-lg transition-colors">
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 bg-[#dee8ff] text-[#001e40] rounded-full mt-0.5 flex-shrink-0">
                          {act.type === 'resolved' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#2e7d32]" />
                          ) : act.type === 'dispatch' ? (
                            <ShieldAlert className="w-3.5 h-3.5 text-[#001e40]" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-[#ba1a1a]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#111c2d] truncate">{act.title}</p>
                          <p className="text-[11px] text-[#43474f] line-clamp-1">{act.description}</p>
                          <span className="text-[10px] text-[#737780] font-bold uppercase mt-0.5 block">{act.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-[#c3c6d1] flex items-center justify-between">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      onOpenReportDrawer();
                    }}
                    className="text-xs text-[#001e40] font-bold hover:underline"
                  >
                    + Report New Hazard
                  </button>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-[#737780] hover:text-[#111c2d]"
                  >
                    Close
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Account Menu */}
        <div className="relative">
          <button
            id="account-button"
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            aria-label="Account Settings"
            className="p-1.5 rounded-full hover:bg-[#dee8ff] text-[#001e40] transition-colors flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-full bg-[#003366] text-white flex items-center justify-center font-bold text-xs">
              {userRole === 'admin' ? 'PE' : 'ST'}
            </div>
          </button>

          {showAccountMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowAccountMenu(false)} 
              />
              <div className="absolute right-0 mt-2 w-64 bg-white border border-[#c3c6d1] rounded-xl shadow-xl z-50 p-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1.5 border-b border-[#e7eeff] mb-2">
                  <p className="text-xs text-[#737780]">Signed in as</p>
                  <p className="text-sm font-bold text-[#001e40]">
                    {userRole === 'admin' ? 'Er. R. K. Agrawal' : 'Sunny Bharti (Student)'}
                  </p>
                  <span className="inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-[#dee8ff] text-[#001e40]">
                    {userRole === 'admin' ? 'Planning Division • Admin' : 'UIET CSE • Reporter'}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-[#737780] px-2 uppercase tracking-wider">Switch Role</p>
                  <button
                    onClick={() => {
                      onRoleChange('admin');
                      setShowAccountMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between ${
                      userRole === 'admin' ? 'bg-[#001e40] text-white' : 'hover:bg-[#f0f3ff] text-[#111c2d]'
                    }`}
                  >
                    <span>Planning Officer (Admin)</span>
                    {userRole === 'admin' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => {
                      onRoleChange('student');
                      setShowAccountMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between ${
                      userRole === 'student' ? 'bg-[#001e40] text-white' : 'hover:bg-[#f0f3ff] text-[#111c2d]'
                    }`}
                  >
                    <span>Student / Staff Citizen</span>
                    {userRole === 'student' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
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
              className="absolute top-4 right-4 p-1.5 text-[#737780] hover:text-[#111c2d] hover:bg-[#f0f3ff] rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-[#dee8ff] text-[#001e40] rounded-xl">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#001e40]">CSJMU Maintenance Protocols</h3>
                <p className="text-xs text-[#43474f]">University Institute of Engineering and Technology</p>
              </div>
            </div>
            <div className="space-y-3 text-sm text-[#43474f]">
              <div className="p-3 bg-[#f0f3ff] rounded-lg border border-[#dee8ff]">
                <p className="font-semibold text-xs text-[#001e40] uppercase tracking-wider mb-1">🚨 Urgent Reports</p>
                <p className="text-xs">
                  Electrical hazards, severe walkway fissures, broken glass, or massive waterlogging trigger immediate dispatcher alerts to Team Alpha &amp; Team Beta.
                </p>
              </div>
              <div className="p-3 bg-[#f0f3ff] rounded-lg border border-[#dee8ff]">
                <p className="font-semibold text-xs text-[#001e40] uppercase tracking-wider mb-1">📍 Interactive Map Navigation</p>
                <p className="text-xs">
                  Click directly on any building or open lawn on the map to inspect active reports or drop a pinpoint report with pre-filled coordinates.
                </p>
              </div>
              <div className="p-3 bg-[#f0f3ff] rounded-lg border border-[#dee8ff]">
                <p className="font-semibold text-xs text-[#001e40] uppercase tracking-wider mb-1">🔧 Triage Management</p>
                <p className="text-xs">
                  Estate engineers can update status in real-time from the Maintenance Log, assign repair crews, and view detailed photographic records.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowHelp(false)}
                className="px-4 py-2 bg-[#001e40] text-white text-xs font-bold rounded-lg hover:bg-[#003366] transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
