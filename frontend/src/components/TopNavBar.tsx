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
  ChevronDown
} from 'lucide-react';
import { ActivityEvent, UserRole } from '../types';

interface TopNavBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activities: ActivityEvent[];
  urgentCount: number;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onRequestRoleChange?: (role: UserRole) => void;
  onOpenReportDrawer: () => void;
  currentProfile?: any;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  searchQuery,
  onSearchChange,
  activities,
  urgentCount,
  userRole,
  onRoleChange,
  onRequestRoleChange,
  onOpenReportDrawer,
  currentProfile
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const handleRoleClick = (targetRole: UserRole) => {
    if (onRequestRoleChange) {
      onRequestRoleChange(targetRole);
    } else {
      onRoleChange(targetRole);
    }
  };

  const isRoleActive = (role: string) => {
    if (role === 'super_admin') return userRole === 'super_admin' || userRole === 'admin';
    if (role === 'bvg_worker') return userRole === 'bvg_worker' || userRole === 'operator';
    return userRole === role;
  };

  return (
    <header className="fixed top-0 left-0 w-full z-40 flex justify-between items-center px-4 md:px-8 h-16 bg-[#ffffff] border-b border-[#c3c6d1] shadow-xs">
      {/* Brand Logo / Title */}
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
          userRole === 'student'
            ? 'bg-emerald-600'
            : userRole === 'bvg_worker' || userRole === 'operator'
            ? 'bg-amber-600'
            : userRole === 'management'
            ? 'bg-blue-700'
            : 'bg-purple-900'
        }`}>
          {userRole === 'student' ? (
            <GraduationCap className="w-5 h-5" />
          ) : userRole === 'bvg_worker' || userRole === 'operator' ? (
            <HardHat className="w-5 h-5 text-amber-200" />
          ) : userRole === 'management' ? (
            <Building2 className="w-5 h-5 text-blue-200" />
          ) : (
            <span className="text-sm font-black">👑</span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-base md:text-lg font-extrabold text-[#001e40] tracking-tight leading-tight">
            CSJMU Urban Planning Portal
          </span>
          <span className="text-[10px] text-slate-500 font-bold hidden sm:inline">
            {userRole === 'student'
              ? 'Student & Citizen Reporting Hub'
              : userRole === 'bvg_worker' || userRole === 'operator'
              ? 'BVG India Ltd. Campus Cleaning Contractor'
              : userRole === 'management'
              ? 'Campus Directorate of Estate & Works'
              : 'Super Admin Master Terminal'}
          </span>
        </div>
      </div>

      {/* 4-Role RBAC Switcher Bar */}
      <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs gap-1">
        {/* 1. Student / Audience */}
        <button
          onClick={() => handleRoleClick('student')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            isRoleActive('student')
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
          title="Student / Campus Citizen (Open Access)"
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Student</span>
        </button>

        {/* 2. BVG Workers */}
        <button
          onClick={() => handleRoleClick('bvg_worker')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            isRoleActive('bvg_worker')
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
          title="BVG India Ltd Cleaning Agency (Requires PIN: 1234)"
        >
          <HardHat className="w-3.5 h-3.5" />
          <span>BVG Workers</span>
        </button>

        {/* 3. Management */}
        <button
          onClick={() => handleRoleClick('management')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            isRoleActive('management')
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
          title="Campus Sanitation Management & Estate Engineers (Requires PIN: 5678)"
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Management</span>
        </button>

        {/* 4. Super Admin */}
        <button
          onClick={() => handleRoleClick('super_admin')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            isRoleActive('super_admin')
              ? 'bg-purple-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
          title="Super Administrator Master Key (Requires PIN: 9999)"
        >
          <span className="text-xs">👑</span>
          <span>Super Admin</span>
        </button>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-xs mx-4 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#43474f]" />
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search reports, blocks, wards..."
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

      {/* Trailing Action Icons */}
      <div className="flex items-center gap-2 text-[#001e40]">
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
                    className="text-xs text-[#001e40] font-bold hover:underline cursor-pointer"
                  >
                    + Report New Hazard
                  </button>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-[#737780] hover:text-[#111c2d] cursor-pointer"
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
            className="p-1.5 rounded-xl hover:bg-slate-100 text-[#001e40] transition-colors flex items-center gap-2 cursor-pointer border border-transparent hover:border-slate-200"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white ${
              userRole === 'student'
                ? 'bg-blue-600'
                : userRole === 'operator'
                ? 'bg-emerald-700'
                : 'bg-[#003366]'
            }`}>
              {userRole === 'student' ? 'ST' : userRole === 'operator' ? 'OP' : 'PE'}
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {userRole === 'student' ? 'Sunny Bharti' : userRole === 'operator' ? 'Rajesh Kumar' : 'Er. R. K. Agrawal'}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold capitalize">{userRole}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showAccountMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowAccountMenu(false)} 
              />
              <div className="absolute right-0 mt-2 w-72 bg-white border border-[#c3c6d1] rounded-xl shadow-xl z-50 p-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-2 border-b border-[#e7eeff] mb-2">
                  <p className="text-[11px] text-[#737780]">Active Persona</p>
                  <p className="text-sm font-bold text-[#001e40]">
                    {userRole === 'student'
                      ? 'Sunny Bharti (Student Reporter)'
                      : userRole === 'operator'
                      ? 'Rajesh Kumar (Field Beat Supervisor)'
                      : 'Er. R. K. Agrawal (Chief Planning Officer)'}
                  </p>
                  <span className={`inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                    userRole === 'student'
                      ? 'bg-blue-50 text-blue-800'
                      : userRole === 'operator'
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'bg-indigo-50 text-indigo-800'
                  }`}>
                    {userRole === 'student'
                      ? 'UIET CSE • Campus Resident'
                      : userRole === 'operator'
                      ? 'Sanitation Beat Alpha • Ward 42'
                      : 'Planning & Works Directorate • CSJMU'}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-[#737780] px-2 uppercase tracking-wider">Switch Portal Role</p>
                  
                  {/* Option 1: Student */}
                  <button
                    onClick={() => {
                      onRoleChange('student');
                      setShowAccountMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between cursor-pointer ${
                      userRole === 'student' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-[#f0f3ff] text-[#111c2d]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      <div>
                        <p className="leading-tight">Student / Campus Citizen</p>
                        <p className={`text-[10px] ${userRole === 'student' ? 'text-blue-100' : 'text-slate-400'}`}>
                          Report hazards, track status &amp; cool spots
                        </p>
                      </div>
                    </div>
                    {userRole === 'student' && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  {/* Option 2: Operator */}
                  <button
                    onClick={() => {
                      onRoleChange('operator');
                      setShowAccountMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between cursor-pointer ${
                      userRole === 'operator' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-[#f0f3ff] text-[#111c2d]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <HardHat className="w-4 h-4" />
                      <div>
                        <p className="leading-tight">Operator / Field Authority</p>
                        <p className={`text-[10px] ${userRole === 'operator' ? 'text-emerald-100' : 'text-slate-400'}`}>
                          Work orders, SLA timers &amp; photo verification
                        </p>
                      </div>
                    </div>
                    {userRole === 'operator' && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  {/* Option 3: Admin */}
                  <button
                    onClick={() => {
                      onRoleChange('admin');
                      setShowAccountMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between cursor-pointer ${
                      userRole === 'admin' ? 'bg-[#001e40] text-white font-bold' : 'hover:bg-[#f0f3ff] text-[#111c2d]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <div>
                        <p className="leading-tight">Planning Officer (Admin)</p>
                        <p className={`text-[10px] ${userRole === 'admin' ? 'text-blue-100' : 'text-slate-400'}`}>
                          Command HQ, ARE pipeline, UHI &amp; capital board
                        </p>
                      </div>
                    </div>
                    {userRole === 'admin' && <CheckCircle2 className="w-4 h-4" />}
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
              className="absolute top-4 right-4 p-1.5 text-[#737780] hover:text-[#111c2d] hover:bg-[#f0f3ff] rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-[#dee8ff] text-[#001e40] rounded-xl">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#001e40]">CSJMU Role-Based Portals</h3>
                <p className="text-xs text-[#43474f]">University Institute of Engineering and Technology</p>
              </div>
            </div>
            <div className="space-y-3 text-sm text-[#43474f]">
              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200">
                <p className="font-bold text-xs text-blue-900 uppercase tracking-wider mb-1">🎓 Student Portal</p>
                <p className="text-xs text-slate-700">
                  Allows students and campus residents to lodge hazard reports, monitor live resolution progress with before/after photos, and find shaded cool walking routes.
                </p>
              </div>
              <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200">
                <p className="font-bold text-xs text-emerald-900 uppercase tracking-wider mb-1">👷 Field Operator / Authority</p>
                <p className="text-xs text-slate-700">
                  Equips sanitation beat supervisors and field crews with active work order queues, SLA countdowns, and instant post-cleaning AI photo verification closing.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="font-bold text-xs text-[#001e40] uppercase tracking-wider mb-1">🏛️ Admin / Planning Division</p>
                <p className="text-xs text-slate-700">
                  Comprehensive executive oversight of the 5-Stage ARE pipeline, master spatial maps, urban heat island (UHI) microclimate interventions, and capital maintenance board.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowHelp(false)}
                className="px-4 py-2 bg-[#001e40] text-white text-xs font-bold rounded-lg hover:bg-[#003366] transition-colors cursor-pointer"
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
