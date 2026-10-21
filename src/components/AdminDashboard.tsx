import React, { useState } from 'react';
import { 
  MaintenanceReport, 
  CampusBlock, 
  ActivityEvent,
  ReportStatus,
  UserCredential,
  UserRole
} from '../types';
import { 
  Building2, 
  Flame, 
  Layers, 
  Wrench, 
  BarChart3, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Download, 
  Send, 
  HardHat, 
  UserCheck, 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  Edit3, 
  UserPlus, 
  Shield, 
  Sparkles, 
  Check, 
  X, 
  RefreshCw,
  MapPin,
  Filter
} from 'lucide-react';
import { LeafletCampusMap } from './LeafletCampusMap';
import { initialCredentials } from '../data/mockData';

interface AdminDashboardProps {
  reports: MaintenanceReport[];
  blocks: CampusBlock[];
  activities: ActivityEvent[];
  credentials: UserCredential[];
  onUpdateCredentials: (updatedList: UserCredential[]) => void;
  onUpdateUserRole: (userId: string, newRole: UserRole, department?: string, pin?: string) => void;
  onAssignTeam: (reportId: string, teamName: string) => void;
  onUpdateStatus: (reportId: string, status: ReportStatus, note?: string) => void;
  onOpenReportDrawer: () => void;
  onSelectReport: (report: MaintenanceReport) => void;
  onNavigateToTab: (tab: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  reports,
  blocks,
  activities,
  credentials,
  onUpdateCredentials,
  onUpdateUserRole,
  onAssignTeam,
  onUpdateStatus,
  onOpenReportDrawer,
  onSelectReport,
  onNavigateToTab
}) => {
  // Simplified 3 Tabs requested: BVG Assigned Work | Roles Change Updation & Management | Manage Password and Login Credentials
  const [activeTab, setActiveTab] = useState<'bvg_work' | 'roles_management' | 'credentials_management'>('bvg_work');

  // Work filter
  const [workFilter, setWorkFilter] = useState<'all' | 'urgent' | 'in_progress' | 'resolved'>('all');

  // Role edit modal state
  const [editingUser, setEditingUser] = useState<UserCredential | null>(null);
  const [newSelectedRole, setNewSelectedRole] = useState<UserRole>('bvg_worker');
  const [newDepartment, setNewDepartment] = useState<string>('');

  // Add user modal state
  const [isAddUserOpen, setIsAddUserOpen] = useState<boolean>(false);
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('bvg_worker');
  const [newUserAgency, setNewUserAgency] = useState<string>('BVG India Ltd.');
  const [newUserDept, setNewUserDept] = useState<string>('Campus Sanitation Beat 03');
  const [newUserBadge, setNewUserBadge] = useState<string>('');
  const [newUserPin, setNewUserPin] = useState<string>('1234');

  // Password / PIN edit state
  const [editingPinUser, setEditingPinUser] = useState<UserCredential | null>(null);
  const [tempPin, setTempPin] = useState<string>('');
  const [visiblePins, setVisiblePins] = useState<Record<string, boolean>>({});
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const togglePinVisibility = (id: string) => {
    setVisiblePins(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // Metrics
  const totalTasks = reports.length;
  const urgentTasks = reports.filter(r => r.severity === 'urgent' && r.status !== 'resolved').length;
  const inProgressTasks = reports.filter(r => r.status === 'in_progress').length;
  const resolvedTasks = reports.filter(r => r.status === 'resolved').length;

  const filteredReports = reports.filter(r => {
    if (workFilter === 'urgent') return r.severity === 'urgent' && r.status !== 'resolved';
    if (workFilter === 'in_progress') return r.status === 'in_progress';
    if (workFilter === 'resolved') return r.status === 'resolved';
    return true;
  });

  const handleSaveRoleChange = () => {
    if (!editingUser) return;
    onUpdateUserRole(editingUser.id, newSelectedRole, newDepartment || editingUser.department);
    showFeedback(`Role for ${editingUser.name} updated to ${newSelectedRole.toUpperCase()}`);
    setEditingUser(null);
  };

  const handleSavePin = () => {
    if (!editingPinUser) return;
    const updated = credentials.map(c => {
      if (c.id === editingPinUser.id) {
        return { ...c, pin: tempPin };
      }
      return c;
    });
    onUpdateCredentials(updated);
    showFeedback(`PIN for ${editingPinUser.name} successfully updated to ${tempPin}`);
    setEditingPinUser(null);
    setTempPin('');
  };

  const handleToggleAccountStatus = (id: string) => {
    const updated = credentials.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === 'active' ? 'suspended' : 'active';
        return { ...c, status: nextStatus as 'active' | 'suspended' };
      }
      return c;
    });
    onUpdateCredentials(updated);
    showFeedback('User account access status updated');
  };

  const handleResetDefaultPins = () => {
    onUpdateCredentials(initialCredentials);
    showFeedback('Factory default PINs restored (BVG: 1234, MGT: 5678, Super Admin: 9999)');
  };

  const handleAddNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const newCred: UserCredential = {
      id: `USR-${Date.now().toString().slice(-5)}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      pin: newUserRole === 'student' ? '' : (newUserPin || '1234'),
      agency: newUserAgency,
      department: newUserDept,
      badgeNumber: newUserBadge || `CSJMU-${Math.floor(100 + Math.random() * 900)}`,
      lastLogin: 'Never',
      status: 'active'
    };

    onUpdateCredentials([newCred, ...credentials]);
    showFeedback(`New user ${newCred.name} added successfully`);
    setIsAddUserOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserBadge('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Super Admin Command Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-[#001e40] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-purple-800/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md text-purple-200 border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
                CSJMU Central Secretariat &amp; IT Directorate
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-200 border border-amber-400/30">
                Master Super Admin Terminal
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
              Super Admin Executive Console
            </h1>
            <p className="text-xs text-purple-100/80 max-w-2xl leading-relaxed">
              Complete administrative authority over BVG contractor dispatch, role assignment permissions, security policies, and role login PIN credentials.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10">
            <div className="text-center px-2">
              <div className="text-xl font-black text-amber-300">{urgentTasks}</div>
              <div className="text-[9px] uppercase font-bold text-purple-200/80 tracking-wider">Urgent Tasks</div>
            </div>
            <div className="text-center px-2 border-l border-white/10">
              <div className="text-xl font-black text-emerald-300">{credentials.length}</div>
              <div className="text-[9px] uppercase font-bold text-purple-200/80 tracking-wider">Personnel</div>
            </div>
            <div className="text-center px-2 border-l border-white/10">
              <div className="text-xl font-black text-purple-300">4</div>
              <div className="text-[9px] uppercase font-bold text-purple-200/80 tracking-wider">Active Roles</div>
            </div>
          </div>
        </div>

        {/* Feedback notification toast if active */}
        {feedbackMsg && (
          <div className="mt-4 p-2.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs rounded-xl font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* 3 Simplified Super Admin Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10 overflow-x-auto">
          <button
            onClick={() => setActiveTab('bvg_work')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'bvg_work'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-400/40'
                : 'bg-white/10 hover:bg-white/15 text-purple-100'
            }`}
          >
            <HardHat className="w-4 h-4" />
            <span>BVG Assigned Work</span>
          </button>

          <button
            onClick={() => setActiveTab('roles_management')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'roles_management'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-400/40'
                : 'bg-white/10 hover:bg-white/15 text-purple-100'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Roles Change Updation &amp; Management</span>
          </button>

          <button
            onClick={() => setActiveTab('credentials_management')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'credentials_management'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-400/40'
                : 'bg-white/10 hover:bg-white/15 text-purple-100'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Manage Password &amp; Login Credentials</span>
          </button>
        </div>

        {/* Quick Access to Operational Intelligence */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10 overflow-x-auto text-[11px]">
          <span className="text-purple-300/80 font-bold uppercase tracking-wider text-[10px] mr-1 flex-shrink-0">
            Direct Jump:
          </span>
          <button
            onClick={() => onNavigateToTab('cctv_pipeline')}
            className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-400/20 font-semibold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
          >
            <Layers className="w-3 h-3 text-indigo-300" />
            <span>CCTV AI Pipeline</span>
          </button>
          <button
            onClick={() => onNavigateToTab('map')}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/10 font-semibold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
          >
            <MapPin className="w-3 h-3 text-purple-300" />
            <span>Campus GIS Map</span>
          </button>
          <button
            onClick={() => onNavigateToTab('heatisland')}
            className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/20 font-semibold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
          >
            <Flame className="w-3 h-3 text-rose-300" />
            <span>Heat Island Analysis</span>
          </button>
          <button
            onClick={() => onNavigateToTab('analytics')}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/20 font-semibold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
          >
            <BarChart3 className="w-3 h-3 text-emerald-300" />
            <span>SWM Analytics</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BVG ASSIGNED WORK                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'bvg_work' && (
        <div className="space-y-6">
          {/* Quick Filters & Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <HardHat className="w-4 h-4 text-amber-600" />
                BVG Contractor Work Dispatch Board
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Master dispatch oversight: Assign sanitation squads, override task statuses, and monitor field work.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              {(['all', 'urgent', 'in_progress', 'resolved'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setWorkFilter(f)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                    workFilter === f
                      ? 'bg-white text-purple-900 shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Leaflet Map Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs font-black text-slate-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-600" />
                CSJMU Live Dispatch Beat Map (Red = Urgent &bull; Yellow = Medium &bull; Green = Low/Resolved)
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                {reports.length} Map Waypoints
              </span>
            </div>
            <div className="h-[360px] w-full">
              <LeafletCampusMap
                reports={reports}
                onSelectReport={onSelectReport}
                filterSeverity="all"
                height="100%"
                center={[26.5030, 80.2678]}
                zoom={16}
              />
            </div>
          </div>

          {/* Master Work Dispatch Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Ticket</th>
                    <th className="py-3 px-4">Issue &amp; Location</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Assigned Sanitation Squad</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReports.map(report => {
                    const isUrgent = report.severity === 'urgent';
                    return (
                      <tr key={report.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                          {report.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{report.title}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{report.location}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isUrgent 
                              ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                              : report.severity === 'medium'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            {report.severity}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={report.assignedTeam || 'BVG Beat 01 UIET Sanitation'}
                            onChange={(e) => onAssignTeam(report.id, e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-purple-500 cursor-pointer"
                          >
                            <option value="BVG Beat 01 UIET Sanitation">BVG Beat 01 (UIET & Labs)</option>
                            <option value="BVG Beat 02 Admin Corridor">BVG Beat 02 (Admin & Central)</option>
                            <option value="BVG Beat 03 Stadium & Hostel">BVG Beat 03 (Stadium & Hostels)</option>
                            <option value="BVG Rapid Response Unit 02">BVG Rapid Response Unit 02</option>
                            <option value="Suction Tanker & Desilting Squad">Suction Tanker &amp; Desilting Squad</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            report.status === 'resolved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : report.status === 'in_progress'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {report.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => onSelectReport(report)}
                            className="px-3 py-1 bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ROLES CHANGE UPDATION & MANAGEMENT                                 */}
      {/* ========================================================================= */}
      {activeTab === 'roles_management' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-purple-600" />
                Campus Personnel &amp; Roles Directory
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Assign and modify user roles across Student, BVG Field Worker, Management, and Super Admin.
              </p>
            </div>

            <button
              onClick={() => setIsAddUserOpen(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Personnel</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Current Role</th>
                    <th className="py-3 px-4">Agency / Department</th>
                    <th className="py-3 px-4">Badge / ID</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {credentials.map(user => {
                    const isSuspended = user.status === 'suspended';
                    return (
                      <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{user.name}</div>
                          <div className="text-[11px] text-slate-500 font-medium">{user.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            user.role === 'super_admin'
                              ? 'bg-purple-100 text-purple-900 border border-purple-300'
                              : user.role === 'management'
                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                              : user.role === 'bvg_worker'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}>
                            {user.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{user.agency}</div>
                          <div className="text-[11px] text-slate-500">{user.department}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                          {user.badgeNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            isSuspended ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setNewSelectedRole(user.role);
                              setNewDepartment(user.department);
                            }}
                            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1 ml-auto"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Change Role</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MANAGE PASSWORD AND LOGIN CREDENTIALS                              */}
      {/* ========================================================================= */}
      {activeTab === 'credentials_management' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-purple-600" />
                Access Control &amp; PIN Authentication Manager
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Update login PINs/passwords for BVG Field Workers, Management, and Super Admin. Changes apply immediately across all sessions.
              </p>
            </div>

            <button
              onClick={handleResetDefaultPins}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
              <span>Reset Factory PINs</span>
            </button>
          </div>

          {/* Quick Overview Cards for the 4 Core Roles */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs">
              <div className="text-[10px] font-black uppercase text-emerald-700">Role 1: Student / Citizen</div>
              <div className="text-sm font-black text-slate-900 mt-1">Open Access</div>
              <div className="text-xs text-slate-500 mt-1">No PIN required &bull; Community reporting open to all students</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-xs">
              <div className="text-[10px] font-black uppercase text-amber-700">Role 2: BVG Worker</div>
              <div className="text-sm font-black text-slate-900 mt-1">
                PIN: {credentials.find(c => c.role === 'bvg_worker')?.pin || '1234'}
              </div>
              <div className="text-xs text-slate-500 mt-1">Field staff beat assignments &amp; AI photo resolution</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-blue-200 shadow-xs">
              <div className="text-[10px] font-black uppercase text-blue-700">Role 3: Management</div>
              <div className="text-sm font-black text-slate-900 mt-1">
                PIN: {credentials.find(c => c.role === 'management')?.pin || '5678'}
              </div>
              <div className="text-xs text-slate-500 mt-1">Estate Directorate SLA oversight, reassignment &amp; leave approval</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-purple-200 shadow-xs">
              <div className="text-[10px] font-black uppercase text-purple-700">Role 4: Super Admin</div>
              <div className="text-sm font-black text-slate-900 mt-1">
                PIN: {credentials.find(c => c.role === 'super_admin')?.pin || '9999'}
              </div>
              <div className="text-xs text-slate-500 mt-1">Full executive master dispatch and credential control</div>
            </div>
          </div>

          {/* Credentials Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Account / Personnel</th>
                    <th className="py-3 px-4">Role Access</th>
                    <th className="py-3 px-4">Current Login PIN / Passcode</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {credentials.map(user => {
                    const isVisible = visiblePins[user.id];
                    const isStudent = user.role === 'student';
                    return (
                      <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{user.name}</div>
                          <div className="text-[11px] text-slate-500">{user.email} &bull; {user.badgeNumber}</div>
                        </td>
                        <td className="py-3.5 px-4 font-bold uppercase text-[11px] text-slate-800">
                          {user.role.replace('_', ' ')}
                        </td>
                        <td className="py-3.5 px-4">
                          {isStudent ? (
                            <span className="text-slate-400 italic font-medium">None (Public Access)</span>
                          ) : (
                            <div className="flex items-center gap-2 font-mono">
                              <span className="font-bold text-sm bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                                {isVisible ? user.pin : '••••'}
                              </span>
                              <button
                                onClick={() => togglePinVisibility(user.id)}
                                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                              >
                                {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleAccountStatus(user.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase cursor-pointer transition-colors ${
                              user.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                            }`}
                          >
                            {user.status === 'active' ? 'Active' : 'Suspended'}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {!isStudent && (
                            <button
                              onClick={() => {
                                setEditingPinUser(user);
                                setTempPin(user.pin);
                              }}
                              className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5 ml-auto"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              <span>Update PIN</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT ROLE                                                          */}
      {/* ========================================================================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-purple-600" />
                Change User Role
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-200">
              <div><strong>Name:</strong> {editingUser.name}</div>
              <div><strong>Email:</strong> {editingUser.email}</div>
              <div><strong>Badge:</strong> {editingUser.badgeNumber}</div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Select New Role:</label>
              <select
                value={newSelectedRole}
                onChange={(e) => setNewSelectedRole(e.target.value as UserRole)}
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-purple-500"
              >
                <option value="student">Student / Campus Citizen</option>
                <option value="bvg_worker">BVG Sanitation Worker</option>
                <option value="management">Estate Management &amp; SLA Oversight</option>
                <option value="super_admin">Super Admin Executive</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Department / Division Assignment:</label>
              <input
                type="text"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                placeholder="E.g. Solid Waste Beat 02, Directorate Office..."
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRoleChange}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer"
              >
                Save Role Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: UPDATE PIN / PASSWORD                                              */}
      {/* ========================================================================= */}
      {editingPinUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-purple-600" />
                Update Login PIN
              </h3>
              <button
                onClick={() => setEditingPinUser(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600">
              Setting new security PIN for <strong>{editingPinUser.name}</strong> ({editingPinUser.role.toUpperCase()}).
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Enter New 4-Digit PIN / Passcode:</label>
              <input
                type="text"
                maxLength={6}
                value={tempPin}
                onChange={(e) => setTempPin(e.target.value)}
                placeholder="E.g. 1234"
                className="w-full text-center tracking-widest text-lg font-mono font-black p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setEditingPinUser(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePin}
                disabled={!tempPin.trim()}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer"
              >
                Update PIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD PERSONNEL                                                      */}
      {/* ========================================================================= */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" />
                Add New Campus Personnel
              </h3>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewUser} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Full Name:</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="E.g. Vikash Sharma"
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Official Email:</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="vikash@csjmu.ac.in"
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Role:</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-purple-500 mt-1"
                  >
                    <option value="student">Student</option>
                    <option value="bvg_worker">BVG Worker</option>
                    <option value="management">Management</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Initial PIN:</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={newUserPin}
                    onChange={(e) => setNewUserPin(e.target.value)}
                    placeholder="1234"
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold focus:ring-2 focus:ring-purple-500 mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Agency / Organization:</label>
                <input
                  type="text"
                  value={newUserAgency}
                  onChange={(e) => setNewUserAgency(e.target.value)}
                  placeholder="BVG India Ltd. or CSJMU Directorate"
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 mt-1"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer"
                >
                  Create Personnel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
