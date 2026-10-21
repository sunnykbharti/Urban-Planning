import React, { useState } from 'react';
import { 
  MaintenanceReport, 
  ActivityEvent,
  ReportStatus,
  LeaveRequest,
  ReassignmentRequest,
  AiCleanupComparison
} from '../types';
import { 
  HardHat, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Camera, 
  Check, 
  Truck, 
  Users, 
  Sparkles, 
  ArrowRight,
  Upload,
  Calendar,
  Layers,
  FileText,
  AlertCircle,
  X,
  RefreshCw,
  Plus,
  ShieldCheck,
  CheckCircle
} from 'lucide-react';
import { LeafletCampusMap } from './LeafletCampusMap';
import { samplePhotos } from '../data/mockData';
import { resolveMediaUrl } from '../api/client';

interface BvgWorkerDashboardProps {
  reports: MaintenanceReport[];
  activities: ActivityEvent[];
  onUpdateStatus: (
    reportId: string, 
    status: ReportStatus, 
    note?: string, 
    aiResult?: AiCleanupComparison, 
    afterImg?: string
  ) => void;
  onSelectReport: (report: MaintenanceReport) => void;
  onNavigateToTab: (tab: any) => void;
  leaveRequests: LeaveRequest[];
  onAddLeaveRequest: (req: Omit<LeaveRequest, 'id' | 'appliedAt' | 'status'>) => void;
  reassignmentRequests: ReassignmentRequest[];
  onAddReassignmentRequest: (req: Omit<ReassignmentRequest, 'id' | 'requestedAt' | 'status'>) => void;
}

export const BvgWorkerDashboard: React.FC<BvgWorkerDashboardProps> = ({
  reports,
  activities,
  onUpdateStatus,
  onSelectReport,
  onNavigateToTab,
  leaveRequests,
  onAddLeaveRequest,
  reassignmentRequests,
  onAddReassignmentRequest
}) => {
  // Main Tab State matching requirements
  const [activeSubTab, setActiveSubTab] = useState<'assigned_work' | 'reassignment_requests' | 'leave_requests'>('assigned_work');
  const [workFilter, setWorkFilter] = useState<'all' | 'urgent' | 'in_progress' | 'resolved'>('all');

  // AI Verification Modal States
  const [ticketToVerify, setTicketToVerify] = useState<MaintenanceReport | null>(null);
  const [afterImage, setAfterImage] = useState<string>('');
  const [isAiComparing, setIsAiComparing] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<AiCleanupComparison | null>(null);
  const [verificationNote, setVerificationNote] = useState<string>('');

  // Reassignment Modal States
  const [ticketToReassign, setTicketToReassign] = useState<MaintenanceReport | null>(null);
  const [reassignReason, setReassignReason] = useState<'equipment_needed' | 'safety_hazard' | 'out_of_zone' | 'shift_over' | 'medical_issue'>('equipment_needed');
  const [reassignNotes, setReassignNotes] = useState<string>('');

  // Leave Application Modal State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState<boolean>(false);
  const [leaveType, setLeaveType] = useState<'sick' | 'casual' | 'emergency' | 'earned'>('casual');
  const [leaveStartDate, setLeaveStartDate] = useState<string>('2026-10-14');
  const [leaveEndDate, setLeaveEndDate] = useState<string>('2026-10-15');
  const [leaveReason, setLeaveReason] = useState<string>('');

  // Clean after-image presets for instant testing
  const cleanSamplePhotos = [
    {
      title: 'Cleaned Pathway & Bagged Waste',
      url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=800&q=80'
    },
    {
      title: 'Empty Washed Waste Container',
      url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80'
    },
    {
      title: 'Desilted Dry Drain Basin',
      url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
    }
  ];

  // Assigned tickets filtering
  const activeReports = reports.filter(r => r.status !== 'resolved');
  const urgentReports = reports.filter(r => r.severity === 'urgent' && r.status !== 'resolved');
  const resolvedReports = reports.filter(r => r.status === 'resolved');

  const displayedReports = reports.filter(r => {
    if (workFilter === 'urgent') return r.severity === 'urgent' && r.status !== 'resolved';
    if (workFilter === 'in_progress') return r.status === 'in_progress';
    if (workFilter === 'resolved') return r.status === 'resolved';
    return true;
  });

  // Execute AI image comparison engine
  const handleRunAiComparison = () => {
    if (!afterImage) return;

    setIsAiComparing(true);
    setAiResult(null);

    // Simulate Computer Vision comparison of Before vs After photos
    setTimeout(() => {
      const generatedResult: AiCleanupComparison = {
        isClean: true,
        cleanlinessScore: Math.floor(92 + Math.random() * 7), // 92-98%
        debrisRemovedPct: 96.5,
        debrisDetectedAfter: false,
        confidence: 0.98,
        verificationDetails: 'Deep neural network verified: 0.0 kg residual debris detected. Ground surface fully cleared and sanitised.',
        verifiedAt: new Date().toISOString()
      };

      setAiResult(generatedResult);
      setIsAiComparing(false);
    }, 1200);
  };

  // Submit AI-verified resolution
  const handleConfirmAiResolution = () => {
    if (!ticketToVerify || !aiResult) return;

    onUpdateStatus(
      ticketToVerify.id,
      'resolved',
      verificationNote || `AI Verified Cleanup: ${aiResult.debrisRemovedPct}% debris cleared. Cleanliness score: ${aiResult.cleanlinessScore}/100.`,
      aiResult,
      afterImage
    );

    // Close and reset modal
    setTicketToVerify(null);
    setAfterImage('');
    setAiResult(null);
    setVerificationNote('');
  };

  // Submit Reassignment Request
  const handleSubmitReassignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketToReassign) return;

    onAddReassignmentRequest({
      reportId: ticketToReassign.id,
      reportTitle: ticketToReassign.title,
      location: ticketToReassign.location,
      workerId: 'USR-BVG-204',
      workerName: 'Ramesh Kumar',
      workerBadge: 'BVG-IND-KNP-204',
      currentBeat: 'Beat 01 (UIET & Canteen)',
      reason: reassignReason,
      notes: reassignNotes.trim() || 'Work reassignment requested due to site equipment/hazard requirements.'
    });

    setTicketToReassign(null);
    setReassignNotes('');
    setActiveSubTab('reassignment_requests');
  };

  // Submit Leave Application
  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason.trim()) return;

    const start = new Date(leaveStartDate);
    const end = new Date(leaveEndDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    onAddLeaveRequest({
      workerId: 'USR-BVG-204',
      workerName: 'Ramesh Kumar',
      workerBadge: 'BVG-IND-KNP-204',
      startDate: leaveStartDate,
      endDate: leaveEndDate,
      daysCount: days,
      type: leaveType,
      reason: leaveReason.trim()
    });

    setIsLeaveModalOpen(false);
    setLeaveReason('');
    setActiveSubTab('leave_requests');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* BVG Official Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-orange-800 to-amber-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-amber-600/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md text-amber-200 border border-white/10">
                <HardHat className="w-3.5 h-3.5 text-amber-300" />
                BVG India Ltd. &bull; Field Operations Terminal
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Lead: Ramesh Kumar &bull; Beat 01
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
              BVG Sanitation Field Portal
            </h1>
            <p className="text-xs text-amber-100/90 max-w-2xl leading-relaxed">
              Manage assigned work orders, update status with mandatory AI Before/After image comparison, 
              request task reassignments, and submit official leave applications.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 bg-black/25 backdrop-blur-md p-3.5 rounded-xl border border-white/10 text-center">
            <div className="px-3">
              <div className="text-2xl font-black text-amber-300">{activeReports.length}</div>
              <div className="text-[10px] uppercase font-bold text-amber-200/80 tracking-wider">Assigned</div>
            </div>
            <div className="px-3 border-l border-white/10">
              <div className="text-2xl font-black text-red-400">{urgentReports.length}</div>
              <div className="text-[10px] uppercase font-bold text-amber-200/80 tracking-wider">Urgent</div>
            </div>
            <div className="px-3 border-l border-white/10">
              <div className="text-2xl font-black text-emerald-400">{resolvedReports.length}</div>
              <div className="text-[10px] uppercase font-bold text-amber-200/80 tracking-wider">AI Verified</div>
            </div>
          </div>
        </div>
      </div>

      {/* Simplified BVG Navigation Pill Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('assigned_work')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'assigned_work'
              ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-300'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <HardHat className="w-4 h-4" />
          <span>Assigned Work ({activeReports.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('reassignment_requests')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'reassignment_requests'
              ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-300'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <RefreshCw className="w-4 h-4 text-amber-500" />
          <span>Change Assigned Work Requests ({reassignmentRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('leave_requests')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'leave_requests'
              ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-300'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4 text-emerald-500" />
          <span>Leave Requests ({leaveRequests.length})</span>
        </button>
      </div>

      {/* ===================== TAB 1: ASSIGNED WORK ===================== */}
      {activeSubTab === 'assigned_work' && (
        <div className="space-y-6">
          {/* Leaflet Beat Map */}
          <LeafletCampusMap
            reports={reports}
            onSelectReport={onSelectReport}
            userRole="bvg_worker"
            compact={true}
            height="380px"
            title="CSJMU Beat 01 Route &amp; Incident Triage Map"
            subtitle="Geospatial distribution of assigned tasks. Red pins indicate critical hazards."
          />

          {/* Assigned Work Orders List */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span>Assigned Field Work Orders</span>
                  <span className="bg-amber-100 text-amber-900 text-xs px-2 py-0.5 rounded-full font-bold">
                    {displayedReports.length}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  ⚠️ Status can ONLY be resolved after uploading proof and passing AI Image Verification.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-lg">
                <button
                  onClick={() => setWorkFilter('all')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    workFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({reports.length})
                </button>
                <button
                  onClick={() => setWorkFilter('urgent')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    workFilter === 'urgent' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Urgent ({urgentReports.length})
                </button>
                <button
                  onClick={() => setWorkFilter('in_progress')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    workFilter === 'in_progress' ? 'bg-amber-500 text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  In Progress ({reports.filter(r => r.status === 'in_progress').length})
                </button>
                <button
                  onClick={() => setWorkFilter('resolved')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    workFilter === 'resolved' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Resolved ({resolvedReports.length})
                </button>
              </div>
            </div>

            {/* Tickets Grid */}
            <div className="divide-y divide-slate-100">
              {displayedReports.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No work orders found matching filter.
                </div>
              ) : (
                displayedReports.map((report) => {
                  const isUrgent = report.severity === 'urgent' || report.severity === 'critical';
                  const isResolved = report.status === 'resolved';

                  return (
                    <div 
                      key={report.id}
                      className={`p-4 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isUrgent && !isResolved ? 'bg-red-50/20' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      {/* Ticket Info */}
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        {/* Thumbnail */}
                        <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 relative">
                          {report.imageUrl ? (
                            <img 
                              src={resolveMediaUrl(report.imageUrl)} 
                              alt={report.title} 
                              className="w-full h-full object-cover" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Camera className="w-5 h-5" />
                            </div>
                          )}
                          <span className={`absolute top-1 left-1 w-2 h-2 rounded-full ${
                            isResolved ? 'bg-emerald-500' : isUrgent ? 'bg-red-500 animate-ping' : 'bg-amber-500'
                          }`} />
                        </div>

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {report.id}
                            </span>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              isResolved 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : isUrgent 
                                ? 'bg-red-100 text-red-800 animate-pulse' 
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {isResolved ? 'Resolved' : isUrgent ? 'Urgent Hazard' : 'Normal Priority'}
                            </span>
                            <span className="text-xs text-slate-400">&bull;</span>
                            <span className="text-xs text-slate-500 capitalize">{report.category}</span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 leading-snug">
                            {report.title}
                          </h4>

                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{report.location}</span>
                          </div>

                          {report.aiComparisonResult && (
                            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md mt-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>AI Verified: {report.aiComparisonResult.debrisRemovedPct}% Cleared (Score {report.aiComparisonResult.cleanlinessScore}/100)</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                        {isResolved ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Verified Clean</span>
                          </div>
                        ) : (
                          <>
                            {/* AI Image Verification Button */}
                            <button
                              onClick={() => {
                                setTicketToVerify(report);
                                setAfterImage('');
                                setAiResult(null);
                              }}
                              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                              title="Upload clean photo and let AI verify to resolve"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                              <span>AI Verify &amp; Resolve</span>
                            </button>

                            {/* Request Reassignment Button */}
                            <button
                              onClick={() => {
                                setTicketToReassign(report);
                                setReassignNotes('');
                              }}
                              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                              title="Request Management to change assigned worker"
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                              <span>Request Change</span>
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => onSelectReport(report)}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: REASSIGNMENT REQUESTS ===================== */}
      {activeSubTab === 'reassignment_requests' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-amber-600" />
                  <span>Work Reassignment Requests</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Track tickets you requested Management to reassign due to equipment, hazard, or zone limits.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {reassignmentRequests.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No reassignment requests submitted yet. Use the &quot;Request Change&quot; button on any assigned work order.
                </div>
              ) : (
                reassignmentRequests.map((req) => (
                  <div key={req.id} className="py-4 space-y-2">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {req.id}
                        </span>
                        <h4 className="font-bold text-sm text-slate-800">{req.reportTitle}</h4>
                      </div>

                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        req.status === 'approved' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : req.status === 'rejected'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {req.status === 'approved' ? 'Approved & Reassigned' : req.status === 'rejected' ? 'Rejected' : 'Pending Review'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Reason: {req.reason.replace('_', ' ').toUpperCase()}</span>
                      </div>
                      <p>{req.notes}</p>

                      {req.reviewRemarks && (
                        <div className="mt-2 pt-2 border-t border-slate-200 text-slate-700 text-xs">
                          <strong>Management Response:</strong> {req.reviewRemarks} 
                          {req.newAssignee && <span className="text-emerald-700 font-bold ml-1">(&rarr; {req.newAssignee})</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 3: LEAVE REQUESTS ===================== */}
      {activeSubTab === 'leave_requests' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>BVG Staff Leave Portal</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Submit formal leave applications and track approval from Campus Estate Management.
                </p>
              </div>

              <button
                onClick={() => setIsLeaveModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Apply for Leave</span>
              </button>
            </div>

            {/* Leave Balance Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-emerald-50/60 border border-emerald-200 p-3 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-700">Casual Leave</span>
                <p className="text-xl font-black text-emerald-900 mt-0.5">8 Days</p>
                <span className="text-[10px] text-emerald-600">Remaining</span>
              </div>
              <div className="bg-blue-50/60 border border-blue-200 p-3 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-blue-700">Sick Leave</span>
                <p className="text-xl font-black text-blue-900 mt-0.5">5 Days</p>
                <span className="text-[10px] text-blue-600">Remaining</span>
              </div>
              <div className="bg-amber-50/60 border border-amber-200 p-3 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-amber-700">Emergency</span>
                <p className="text-xl font-black text-amber-900 mt-0.5">3 Days</p>
                <span className="text-[10px] text-amber-600">Available</span>
              </div>
              <div className="bg-purple-50/60 border border-purple-200 p-3 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-purple-700">Duty Shifts</span>
                <p className="text-xl font-black text-purple-900 mt-0.5">26/30</p>
                <span className="text-[10px] text-purple-600">Present</span>
              </div>
            </div>

            {/* Applications History */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Submitted Leave Applications
              </h4>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {leaveRequests.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    No leave applications submitted.
                  </div>
                ) : (
                  leaveRequests.map((req) => (
                    <div key={req.id} className="p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {req.id}
                          </span>
                          <span className="text-xs font-bold text-slate-800 capitalize">
                            {req.type} Leave ({req.daysCount} {req.daysCount === 1 ? 'day' : 'days'})
                          </span>
                          <span className="text-xs text-slate-400">&bull;</span>
                          <span className="text-xs text-slate-600 font-mono">
                            {req.startDate} to {req.endDate}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 italic">
                          &quot;{req.reason}&quot;
                        </p>
                        {req.reviewRemarks && (
                          <p className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded inline-block">
                            <strong>Estate Note:</strong> {req.reviewRemarks}
                          </p>
                        )}
                      </div>

                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full whitespace-nowrap self-start sm:self-center ${
                        req.status === 'approved' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : req.status === 'rejected'
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {req.status === 'approved' ? '✓ Approved' : req.status === 'rejected' ? '✕ Rejected' : '⏳ Pending Approval'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== AI CLEANUP COMPARISON & VERIFICATION MODAL ===================== */}
      {ticketToVerify && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-300 shadow-2xl overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-amber-700 to-amber-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="font-bold text-sm">AI Image Comparison &amp; Cleanup Verification</h3>
                  <p className="text-[11px] text-amber-200">Ticket: {ticketToVerify.id} &bull; {ticketToVerify.title}</p>
                </div>
              </div>
              <button 
                onClick={() => setTicketToVerify(null)}
                className="p-1 hover:bg-white/20 rounded-lg text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Mandatory Rule:</strong> The work order status cannot be manually marked resolved. 
                  You must attach proof of completed cleanup and run the AI Comparison engine to verify that waste was cleared.
                </p>
              </div>

              {/* Before vs After Photo Comparison Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* BEFORE IMAGE */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>1. BEFORE (Reported Hazard)</span>
                    <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.2 rounded uppercase">Complaint Proof</span>
                  </div>
                  <div className="h-44 rounded-xl border border-slate-200 overflow-hidden bg-slate-100">
                    {ticketToVerify.imageUrl ? (
                      <img 
                        src={resolveMediaUrl(ticketToVerify.imageUrl)} 
                        alt="Before cleanup" 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                        No before photo
                      </div>
                    )}
                  </div>
                </div>

                {/* AFTER IMAGE */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>2. AFTER (Cleanup Proof)</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded uppercase">
                      {afterImage ? 'Proof Ready' : 'Required'}
                    </span>
                  </div>
                  <div className="h-44 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 relative group flex items-center justify-center">
                    {afterImage ? (
                      <>
                        <img src={afterImage} alt="After cleanup" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => { setAfterImage(''); setAiResult(null); }}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full shadow-md"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-3">
                        <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                        <span className="text-xs text-slate-500 font-medium block">Upload or select clean proof photo</span>
                        <label className="mt-2 inline-block px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg cursor-pointer">
                          <span>Browse Device</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="sr-only" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const r = new FileReader();
                                r.onload = (ev) => { if (ev.target?.result) setAfterImage(ev.target.result as string); };
                                r.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Preset After-Photos */}
              {!afterImage && (
                <div>
                  <p className="text-[11px] font-bold text-slate-500 mb-1.5">
                    Or select from field crew camera presets:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {cleanSamplePhotos.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => { setAfterImage(s.url); setAiResult(null); }}
                        className="text-left p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-[10px] truncate transition-colors flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span className="truncate font-medium">{s.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Image Comparison Trigger */}
              {afterImage && !aiResult && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleRunAiComparison}
                    disabled={isAiComparing}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isAiComparing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-indigo-200" />
                        <span>Comparing Both Images with AI Model...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Run AI Image Comparison Engine</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* AI Verification Results Card */}
              {aiResult && (
                <div className="p-4 rounded-xl border border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-emerald-600 text-white rounded-lg">
                        <CheckCircle className="w-5 h-5" />
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-emerald-900">
                          AI Verification Status: CLEANUP_VERIFIED_PASS
                        </h4>
                        <p className="text-[11px] text-emerald-700">
                          {aiResult.verificationDetails}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-extrabold text-emerald-800 bg-emerald-100 px-2 py-1 rounded-lg">
                      {aiResult.cleanlinessScore}/100 Score
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                      <span className="text-[10px] text-slate-500 font-bold block">Debris Cleared</span>
                      <strong className="text-emerald-700">{aiResult.debrisRemovedPct}%</strong>
                    </div>
                    <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                      <span className="text-[10px] text-slate-500 font-bold block">Residual Litter</span>
                      <strong className="text-emerald-700">0.0 kg</strong>
                    </div>
                    <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                      <span className="text-[10px] text-slate-500 font-bold block">AI Confidence</span>
                      <strong className="text-emerald-700">{Math.round(aiResult.confidence * 100)}%</strong>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Technician Completion Notes:
                    </label>
                    <input
                      type="text"
                      value={verificationNote}
                      onChange={(e) => setVerificationNote(e.target.value)}
                      placeholder="e.g. Cleared by Beat 01 squad. Transferred to tipper truck."
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmAiResolution}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm &amp; Update Ticket to Resolved</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================== REASSIGNMENT REQUEST MODAL ===================== */}
      {ticketToReassign && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-300 shadow-2xl overflow-hidden">
            <div className="p-4 bg-[#001e40] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Request Work Reassignment</h3>
                <p className="text-[11px] text-blue-200">Ticket: {ticketToReassign.id}</p>
              </div>
              <button onClick={() => setTicketToReassign(null)} className="text-white hover:bg-white/20 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReassignment} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason for Reassignment:</label>
                <select
                  value={reassignReason}
                  onChange={(e: any) => setReassignReason(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="equipment_needed">Special Equipment Needed (Tipper/Suction Pump/Crane)</option>
                  <option value="safety_hazard">Severe Safety Hazard (High Voltage / Hazardous Chemicals)</option>
                  <option value="out_of_zone">Out of Beat 01 Assigned Perimeter</option>
                  <option value="shift_over">Shift Over / Handover to Next Crew</option>
                  <option value="medical_issue">Crew Member Health / Medical Injury</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Details &amp; Specific Request to Management:</label>
                <textarea
                  rows={3}
                  value={reassignNotes}
                  onChange={(e) => setReassignNotes(e.target.value)}
                  placeholder="Explain why this ticket cannot be handled by the current beat..."
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTicketToReassign(null)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#001e40] hover:bg-[#003366] text-white font-bold rounded-lg shadow-sm"
                >
                  Submit Reassignment Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== LEAVE APPLICATION MODAL ===================== */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-300 shadow-2xl overflow-hidden">
            <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Apply for Leave</h3>
                <p className="text-[11px] text-emerald-200">Applicant: Ramesh Kumar (BVG Beat 01)</p>
              </div>
              <button onClick={() => setIsLeaveModalOpen(false)} className="text-white hover:bg-white/20 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitLeave} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Leave Type:</label>
                <select
                  value={leaveType}
                  onChange={(e: any) => setLeaveType(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="casual">Casual Leave (8 days remaining)</option>
                  <option value="sick">Sick / Medical Leave (5 days remaining)</option>
                  <option value="emergency">Family Emergency Leave (3 days available)</option>
                  <option value="earned">Earned Duty Off</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">From Date:</label>
                  <input
                    type="date"
                    value={leaveStartDate}
                    onChange={(e) => setLeaveStartDate(e.target.value)}
                    required
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">To Date:</label>
                  <input
                    type="date"
                    value={leaveEndDate}
                    onChange={(e) => setLeaveEndDate(e.target.value)}
                    required
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason for Leave:</label>
                <textarea
                  rows={3}
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="State the purpose of your leave application..."
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-sm"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
