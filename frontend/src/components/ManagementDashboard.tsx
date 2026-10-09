import React, { useState } from 'react';
import { 
  MaintenanceReport, 
  ActivityEvent,
  ReportStatus,
  LeaveRequest,
  ReassignmentRequest
} from '../types';
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  MapPin, 
  BarChart3, 
  Layers, 
  Scale, 
  ShieldCheck, 
  TrendingUp, 
  FileText, 
  Calendar, 
  ArrowRight,
  HardHat,
  ChevronRight,
  UserCheck,
  XCircle,
  CheckCircle,
  HelpCircle,
  Filter,
  RefreshCw,
  Search,
  MessageSquare
} from 'lucide-react';
import { LeafletCampusMap } from './LeafletCampusMap';

interface ManagementDashboardProps {
  reports: MaintenanceReport[];
  activities: ActivityEvent[];
  onUpdateStatus: (reportId: string, status: ReportStatus, note?: string) => void;
  onSelectReport: (report: MaintenanceReport) => void;
  onNavigateToTab: (tab: any) => void;
  reassignmentRequests: ReassignmentRequest[];
  onReviewReassignment: (requestId: string, status: 'approved' | 'rejected', remarks?: string, newAssignee?: string) => void;
  leaveRequests: LeaveRequest[];
  onReviewLeave: (requestId: string, status: 'approved' | 'rejected', remarks?: string) => void;
}

export const ManagementDashboard: React.FC<ManagementDashboardProps> = ({
  reports,
  activities,
  onUpdateStatus,
  onSelectReport,
  onNavigateToTab,
  reassignmentRequests,
  onReviewReassignment,
  leaveRequests,
  onReviewLeave
}) => {
  // Simplified 3 Tabs requested by user: Statistics | Request Management | Leave Request Management
  const [activeTab, setActiveTab] = useState<'statistics' | 'request_management' | 'leave_management'>('statistics');

  // Request Management Filters & Modals
  const [reassignFilter, setReassignFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedReassignReq, setSelectedReassignReq] = useState<ReassignmentRequest | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState<string>('');
  const [reassignTeam, setReassignTeam] = useState<string>('BVG Rapid Response Unit 02');

  // Leave Management Filters & Modals
  const [leaveFilter, setLeaveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedLeaveReq, setSelectedLeaveReq] = useState<LeaveRequest | null>(null);
  const [leaveRemarks, setLeaveRemarks] = useState<string>('');

  // Statistics computations
  const resolved = reports.filter(r => r.status === 'resolved');
  const inProgress = reports.filter(r => r.status === 'in_progress');
  const dispatched = reports.filter(r => r.status === 'dispatched' || r.status === 'reported');
  const urgent = reports.filter(r => r.severity === 'urgent');

  const complianceRate = resolved.length > 0
    ? Math.round((resolved.filter(r => r.slaMet !== false).length / resolved.length) * 100)
    : 96;

  const totalWasteKg = reports.reduce((acc, r) => {
    return acc + (r.estimatedAmount?.weightKg || 0);
  }, 0);

  const pendingReassignments = reassignmentRequests.filter(r => r.status === 'pending').length;
  const pendingLeaves = leaveRequests.filter(r => r.status === 'pending').length;

  const handleApproveReassignment = (req: ReassignmentRequest) => {
    onReviewReassignment(req.id, 'approved', reviewRemarks || 'Reassignment approved by Estate Directorate.', reassignTeam);
    setSelectedReassignReq(null);
    setReviewRemarks('');
  };

  const handleRejectReassignment = (req: ReassignmentRequest) => {
    onReviewReassignment(req.id, 'rejected', reviewRemarks || 'Reassignment declined. Standard beat protocol applies.');
    setSelectedReassignReq(null);
    setReviewRemarks('');
  };

  const handleApproveLeave = (req: LeaveRequest) => {
    onReviewLeave(req.id, 'approved', leaveRemarks || 'Leave approved. Standby relief worker assigned.');
    setSelectedLeaveReq(null);
    setLeaveRemarks('');
  };

  const handleRejectLeave = (req: LeaveRequest) => {
    onReviewLeave(req.id, 'rejected', leaveRemarks || 'Leave request declined due to high campus footfall / urgent beat coverage.');
    setSelectedLeaveReq(null);
    setLeaveRemarks('');
  };

  const filteredReassignments = reassignmentRequests.filter(r => {
    if (reassignFilter === 'all') return true;
    return r.status === reassignFilter;
  });

  const filteredLeaves = leaveRequests.filter(r => {
    if (leaveFilter === 'all') return true;
    return r.status === leaveFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header & Navigation */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-blue-700/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md text-blue-200 border border-white/10">
                <Building2 className="w-3.5 h-3.5 text-blue-300" />
                CSJMU Directorate of Estate &amp; Public Health Engineering
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/20">
                Management Terminal
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
              Campus Operations &amp; Management
            </h1>
            <p className="text-xs text-blue-100/80 max-w-2xl leading-relaxed">
              Executive supervision and administrative approvals for BVG field staff, maintenance dispatch, and campus SLA compliance.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10">
            <div className="text-center px-2">
              <div className="text-xl font-black text-blue-300">{complianceRate}%</div>
              <div className="text-[9px] uppercase font-bold text-blue-200/80 tracking-wider">SLA Met</div>
            </div>
            <div className="text-center px-2 border-l border-white/10">
              <div className="text-xl font-black text-amber-300">{pendingReassignments}</div>
              <div className="text-[9px] uppercase font-bold text-amber-200/80 tracking-wider">Work Req</div>
            </div>
            <div className="text-center px-2 border-l border-white/10">
              <div className="text-xl font-black text-indigo-300">{pendingLeaves}</div>
              <div className="text-[9px] uppercase font-bold text-indigo-200/80 tracking-wider">Leaves</div>
            </div>
          </div>
        </div>

        {/* 3 Simplified Management Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10 overflow-x-auto">
          <button
            onClick={() => setActiveTab('statistics')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'statistics'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/40'
                : 'bg-white/10 hover:bg-white/15 text-blue-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Statistics</span>
          </button>

          <button
            onClick={() => setActiveTab('request_management')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer relative ${
              activeTab === 'request_management'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/40'
                : 'bg-white/10 hover:bg-white/15 text-blue-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Request Management</span>
            {pendingReassignments > 0 && (
              <span className="bg-amber-400 text-black text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {pendingReassignments}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('leave_management')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer relative ${
              activeTab === 'leave_management'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/40'
                : 'bg-white/10 hover:bg-white/15 text-blue-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Leave Request Management</span>
            {pendingLeaves > 0 && (
              <span className="bg-indigo-400 text-black text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {pendingLeaves}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: STATISTICS                                                         */}
      {/* ========================================================================= */}
      {activeTab === 'statistics' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Reports</span>
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl font-black text-slate-900">{reports.length}</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Across 5 Campus Beats</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Resolved</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-emerald-700">{resolved.length}</div>
              <div className="text-[11px] text-slate-500 mt-1">
                {Math.round((resolved.length / (reports.length || 1)) * 100)}% resolution rate
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Waste Cleared</span>
                <Scale className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-black text-amber-700">{totalWasteKg.toLocaleString()} kg</div>
              <div className="text-[11px] text-slate-500 mt-1">
                {(totalWasteKg / 1000).toFixed(2)} metric tons diverted
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Urgent Active</span>
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-3xl font-black text-rose-700">{urgent.length}</div>
              <div className="text-[11px] text-rose-600 font-semibold mt-1">
                Requires priority attention
              </div>
            </div>
          </div>

          {/* Leaflet Campus Map showing complaints severity */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-black text-slate-900">
                  CSJMU Live Complaint Density &amp; Severity Map
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> High / Urgent
                </span>
                <span className="inline-flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Medium
                </span>
                <span className="inline-flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Low / Resolved
                </span>
              </div>
            </div>
            <div className="h-[440px] w-full">
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

          {/* SLA Performance Breakdown & Operational Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                BVG SLA Target Adherence
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-700">High / Urgent Severity (SLA &lt; 2 hrs)</span>
                    <span className="text-blue-700 font-black">92% Met</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-700">Medium Severity (SLA &lt; 6 hrs)</span>
                    <span className="text-blue-700 font-black">97% Met</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '97%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-700">Low Severity / General Beat (SLA &lt; 12 hrs)</span>
                    <span className="text-blue-700 font-black">100% Met</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Incident Distribution by Category
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-500 font-semibold">Garbage Overflows</div>
                  <div className="text-xl font-black text-slate-900 mt-1">
                    {reports.filter(r => r.category === 'overflow' || r.category === 'garbage').length}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-500 font-semibold">Waterlogging &amp; Drains</div>
                  <div className="text-xl font-black text-slate-900 mt-1">
                    {reports.filter(r => r.category === 'waterlogging').length}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-500 font-semibold">Microclimate / Heat</div>
                  <div className="text-xl font-black text-slate-900 mt-1">
                    {reports.filter(r => r.category === 'heat_hotspot').length}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-500 font-semibold">Infrastructure / Other</div>
                  <div className="text-xl font-black text-slate-900 mt-1">
                    {reports.filter(r => r.category === 'infrastructure' || r.category === 'greenery').length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: REQUEST MANAGEMENT (BVG WORK REASSIGNMENTS)                         */}
      {/* ========================================================================= */}
      {activeTab === 'request_management' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                BVG Work Reassignment Requests
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review and approve worker requests to reassign tasks due to equipment constraints, safety hazards, or zone limits.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              {(['all', 'pending', 'approved', 'rejected'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setReassignFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                    reassignFilter === tab
                      ? 'bg-white text-blue-900 shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {filteredReassignments.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-bold text-slate-600">No Reassignment Requests</p>
              <p className="text-xs mt-1">All worker task assignments are proceeding smoothly.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredReassignments.map(req => {
                const isPending = req.status === 'pending';
                return (
                  <div 
                    key={req.id}
                    className={`bg-white rounded-2xl p-5 border transition-all shadow-xs ${
                      isPending ? 'border-amber-300 ring-2 ring-amber-400/20' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            req.status === 'pending'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : req.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}>
                            {req.status}
                          </span>

                          <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                            {req.id}
                          </span>

                          <span className="text-xs text-slate-400">
                            Requested {new Date(req.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="font-black text-slate-900 text-sm">
                          {req.reportTitle}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
                            <HardHat className="w-3.5 h-3.5 text-amber-600" />
                            {req.workerName} ({req.workerBadge})
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-blue-600" />
                            {req.location}
                          </span>
                          <span className="text-slate-400 font-medium">
                            Current: {req.currentBeat}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                          <div className="font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Reason: {req.reason.replace('_', ' ').toUpperCase()}
                          </div>
                          <p className="text-slate-600 leading-relaxed">{req.notes}</p>
                        </div>

                        {req.reviewRemarks && (
                          <div className="text-xs text-emerald-700 font-medium bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                            <strong>Reviewer Remark:</strong> {req.reviewRemarks} 
                            {req.newAssignee && <span> &bull; Reassigned to <strong>{req.newAssignee}</strong></span>}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      {isPending && (
                        <div className="flex sm:flex-col gap-2 shrink-0 justify-end">
                          <button
                            onClick={() => setSelectedReassignReq(req)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Approve &amp; Reassign</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedReassignReq(req);
                            }}
                            className="px-4 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-xl text-xs font-bold border border-slate-200 hover:border-rose-200 flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <XCircle className="w-4 h-4 text-rose-500" />
                            <span>Decline</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LEAVE REQUEST MANAGEMENT                                           */}
      {/* ========================================================================= */}
      {activeTab === 'leave_management' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                BVG Sanitation Staff Leave Applications
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review sick leave, emergency leave, and casual leave applications submitted by campus sweepers and machine operators.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              {(['all', 'pending', 'approved', 'rejected'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setLeaveFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                    leaveFilter === tab
                      ? 'bg-white text-indigo-900 shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {filteredLeaves.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-bold text-slate-600">No Leave Applications</p>
              <p className="text-xs mt-1">Full worker roster is on duty.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLeaves.map(leave => {
                const isPending = leave.status === 'pending';
                return (
                  <div
                    key={leave.id}
                    className={`bg-white rounded-2xl p-5 border transition-all shadow-xs flex flex-col justify-between ${
                      isPending ? 'border-indigo-300 ring-2 ring-indigo-400/20' : 'border-slate-200'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            leave.status === 'pending'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : leave.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}>
                            {leave.status}
                          </span>
                          <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                            {leave.id}
                          </span>
                        </div>

                        <span className="text-[11px] text-indigo-700 font-extrabold uppercase px-2 py-0.5 bg-indigo-50 rounded-md border border-indigo-100">
                          {leave.type} LEAVE
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-slate-900">
                          {leave.workerName}
                        </h4>
                        <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 mt-0.5">
                          <HardHat className="w-3.5 h-3.5 text-amber-600" />
                          <span>Badge: {leave.workerBadge}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                        <div className="flex items-center justify-between text-slate-700 font-bold">
                          <span>Period:</span>
                          <span className="text-slate-900">{leave.startDate} to {leave.endDate} ({leave.daysCount} days)</span>
                        </div>
                        <div className="text-slate-600 pt-1 border-t border-slate-200/60 leading-relaxed">
                          <strong>Reason:</strong> {leave.reason}
                        </div>
                      </div>

                      {leave.reviewRemarks && (
                        <div className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 font-medium">
                          <strong>Remarks:</strong> {leave.reviewRemarks}
                        </div>
                      )}
                    </div>

                    {isPending && (
                      <div className="pt-4 border-t border-slate-100 flex items-center gap-2 mt-4">
                        <button
                          onClick={() => setSelectedLeaveReq(leave)}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLeaveReq(leave);
                          }}
                          className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* REVIEW REASSIGNMENT MODAL                                                 */}
      {/* ========================================================================= */}
      {selectedReassignReq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                Review Reassignment Request
              </h3>
              <button
                onClick={() => setSelectedReassignReq(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl text-xs space-y-1.5 border border-slate-200">
              <div><strong>Ticket:</strong> {selectedReassignReq.reportTitle}</div>
              <div><strong>Worker:</strong> {selectedReassignReq.workerName} ({selectedReassignReq.workerBadge})</div>
              <div><strong>Reason:</strong> {selectedReassignReq.reason.replace('_', ' ').toUpperCase()}</div>
              <div><strong>Notes:</strong> {selectedReassignReq.notes}</div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Reassign To Sanitation Squad:</label>
              <select
                value={reassignTeam}
                onChange={(e) => setReassignTeam(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
              >
                <option value="BVG Rapid Response Unit 02">BVG Rapid Response Unit 02 (Heavy Debris)</option>
                <option value="Suction Tanker & Sludge Squad 01">Suction Tanker &amp; Sludge Squad 01</option>
                <option value="High Voltage Electrical Maintenance Squad">High Voltage Electrical Maintenance Squad</option>
                <option value="Mechanical Sweeper Crew B">Mechanical Sweeper Crew B</option>
                <option value="Ward 42 Zone 6 Standby Relief">Ward 42 Zone 6 Standby Relief</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Estate Directorate Remarks (Optional):</label>
              <textarea
                value={reviewRemarks}
                onChange={(e) => setReviewRemarks(e.target.value)}
                placeholder="Enter review decision remarks..."
                rows={2}
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => handleRejectReassignment(selectedReassignReq)}
                className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200 cursor-pointer"
              >
                Decline Request
              </button>
              <button
                onClick={() => handleApproveReassignment(selectedReassignReq)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer"
              >
                Approve &amp; Reassign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REVIEW LEAVE MODAL                                                        */}
      {/* ========================================================================= */}
      {selectedLeaveReq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Review Staff Leave Application
              </h3>
              <button
                onClick={() => setSelectedLeaveReq(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl text-xs space-y-1.5 border border-slate-200">
              <div><strong>Applicant:</strong> {selectedLeaveReq.workerName} ({selectedLeaveReq.workerBadge})</div>
              <div><strong>Type:</strong> {selectedLeaveReq.type.toUpperCase()} LEAVE</div>
              <div><strong>Dates:</strong> {selectedLeaveReq.startDate} to {selectedLeaveReq.endDate} ({selectedLeaveReq.daysCount} days)</div>
              <div><strong>Reason:</strong> {selectedLeaveReq.reason}</div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Approval Remarks / Relief Assignment:</label>
              <textarea
                value={leaveRemarks}
                onChange={(e) => setLeaveRemarks(e.target.value)}
                placeholder="E.g., Approved. Standby relief sweeper assigned to Beat 01..."
                rows={2}
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => handleRejectLeave(selectedLeaveReq)}
                className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200 cursor-pointer"
              >
                Reject Leave
              </button>
              <button
                onClick={() => handleApproveLeave(selectedLeaveReq)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer"
              >
                Approve Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
