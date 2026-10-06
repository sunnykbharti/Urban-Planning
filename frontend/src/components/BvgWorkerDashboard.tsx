import React, { useState } from 'react';
import { 
  MaintenanceReport, 
  ActivityEvent,
  ReportStatus 
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
  Radio, 
  Sparkles, 
  ArrowRight,
  Upload,
  Layers,
  Scale,
  Box,
  Shield,
  Trash2,
  Calendar,
  Award
} from 'lucide-react';

interface BvgWorkerDashboardProps {
  reports: MaintenanceReport[];
  activities: ActivityEvent[];
  onUpdateStatus: (reportId: string, status: ReportStatus, note?: string) => void;
  onSelectReport: (report: MaintenanceReport) => void;
  onNavigateToTab: (tab: any) => void;
}

export const BvgWorkerDashboard: React.FC<BvgWorkerDashboardProps> = ({
  reports,
  activities,
  onUpdateStatus,
  onSelectReport,
  onNavigateToTab
}) => {
  const [filter, setFilter] = useState<'all' | 'assigned' | 'in_progress' | 'resolved'>('all');
  const [selectedTicketForVerify, setSelectedTicketForVerify] = useState<MaintenanceReport | null>(null);
  const [afterImageChoice, setAfterImageChoice] = useState<string>(
    'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=800&q=80'
  );
  const [verificationNote, setVerificationNote] = useState<string>(
    'Site cleared by BVG Sanitation Beat 01. Waste bagged and transferred to municipal tipper truck.'
  );
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Filter BVG tasks
  const bvgReports = reports;
  const activeReports = bvgReports.filter(r => r.status !== 'resolved');
  const urgentReports = bvgReports.filter(r => r.severity === 'urgent' && r.status !== 'resolved');
  const inProgressReports = bvgReports.filter(r => r.status === 'in_progress');
  const resolvedReports = bvgReports.filter(r => r.status === 'resolved');

  const displayedReports = bvgReports.filter(r => {
    if (filter === 'assigned') return r.status === 'reported' || r.status === 'dispatched';
    if (filter === 'in_progress') return r.status === 'in_progress';
    if (filter === 'resolved') return r.status === 'resolved';
    return true;
  });

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketForVerify) return;

    setIsVerifying(true);
    setTimeout(() => {
      onUpdateStatus(
        selectedTicketForVerify.id, 
        'resolved', 
        verificationNote || 'BVG Cleanup completed and verified clean.'
      );
      setIsVerifying(false);
      setSelectedTicketForVerify(null);
    }, 600);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. BVG Cleaning Agency Official Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-orange-800 to-amber-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-amber-600/30">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-500/20 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md text-amber-200 border border-white/10">
                <HardHat className="w-3.5 h-3.5 text-amber-300" />
                BVG India Ltd. Campus Facility Services
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Shift: Beat 01 (UIET &amp; Canteen)
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
              BVG Sanitation Beat Portal
            </h1>
            <p className="text-xs text-amber-100/80 max-w-2xl leading-relaxed">
              Official field terminal for Bharat Vikas Group (BVG) cleaning contractors. Accept assigned solid waste work orders, log equipment dispatch, and upload verified &quot;After&quot; photos to fulfill CSJMU sanitation SLAs.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/25 backdrop-blur-md p-3.5 rounded-xl border border-white/10">
            <div className="text-center px-2">
              <div className="text-2xl font-black text-amber-300">{activeReports.length}</div>
              <div className="text-[10px] uppercase font-bold text-amber-200/80 tracking-wider">Pending</div>
            </div>
            <div className="text-center px-2 border-l border-white/10">
              <div className="text-2xl font-black text-amber-400">{inProgressReports.length}</div>
              <div className="text-[10px] uppercase font-bold text-amber-200/80 tracking-wider">Active</div>
            </div>
            <div className="text-center px-2 border-l border-white/10">
              <div className="text-2xl font-black text-emerald-400">{resolvedReports.length}</div>
              <div className="text-[10px] uppercase font-bold text-amber-200/80 tracking-wider">Cleared</div>
            </div>
            <div className="text-center px-2 border-l border-white/10">
              <div className="text-2xl font-black text-red-400">{urgentReports.length}</div>
              <div className="text-[10px] uppercase font-bold text-amber-200/80 tracking-wider">Urgent</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Beat Operational Row: Roster & Equipment Readiness */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card A: Crew Lead */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-xl flex-shrink-0">
            👷‍♂️
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Assigned Beat Lead</span>
            <h4 className="text-sm font-bold text-slate-800 truncate">Ramesh Kumar</h4>
            <p className="text-[11px] text-slate-500 font-mono">BVG-IND-KNP-204 • Beat Alpha</p>
          </div>
        </div>

        {/* Card B: Equipment Checklist */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Tipper Truck UP-78-40</h4>
              <p className="text-[11px] text-slate-500">Wheeled Bins &amp; Rakes Active</p>
            </div>
          </div>
          <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase">
            Ready
          </span>
        </div>

        {/* Card C: Supervisor Hotline */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Er. R. K. Sharma (Estate)</h4>
              <p className="text-[11px] text-slate-500 font-mono">+91 98765 43210</p>
            </div>
          </div>
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noreferrer"
            className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            title="Chat on WhatsApp"
          >
            <MessageSquare className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* 3. Work Orders List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800">
              Assigned Field Work Orders
            </h3>
            <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
              {displayedReports.length}
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-lg">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('assigned')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                filter === 'assigned' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending ({activeReports.length})
            </button>
            <button
              onClick={() => setFilter('in_progress')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                filter === 'in_progress' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In Progress ({inProgressReports.length})
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                filter === 'resolved' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cleared ({resolvedReports.length})
            </button>
          </div>
        </div>

        {/* Work Order Cards Grid */}
        <div className="divide-y divide-slate-100">
          {displayedReports.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2 opacity-80" />
              <p className="text-sm font-bold text-slate-600">All BVG Beat Work Orders Cleared</p>
              <p className="text-xs text-slate-400 mt-1">No pending tickets in this category for Beat 01.</p>
            </div>
          ) : (
            displayedReports.map((report) => {
              const isResolved = report.status === 'resolved';
              const isInProgress = report.status === 'in_progress';

              return (
                <div 
                  key={report.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Image & Details */}
                  <div className="flex items-start gap-4 min-w-0">
                    {/* Thumbnail */}
                    <div 
                      onClick={() => onSelectReport(report)}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 cursor-pointer relative group"
                    >
                      <img 
                        src={report.beforeImageUrl || report.imageUrl || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=400&q=80'} 
                        alt={report.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      {report.severity === 'urgent' && (
                        <span className="absolute top-1 left-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                          URGENT
                        </span>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-500">
                          {report.ticketNumber || report.id}
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isResolved 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : isInProgress
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                            : 'bg-blue-100 text-blue-900'
                        }`}>
                          {isResolved ? 'CLEARED' : isInProgress ? 'IN PROGRESS' : 'ASSIGNED TO BVG'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {report.timeAgo || 'Recent'}
                        </span>
                      </div>

                      <h4 
                        onClick={() => onSelectReport(report)}
                        className="text-sm font-bold text-slate-900 hover:text-amber-700 cursor-pointer transition-colors leading-tight truncate"
                      >
                        {report.title}
                      </h4>

                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {report.location}
                        </span>

                        {report.estimatedAmount && (
                          <span className="flex items-center gap-1 font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <Scale className="w-3 h-3 text-amber-700" />
                            ~{report.estimatedAmount.weightKg} kg waste
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Worker Actions */}
                  <div className="flex items-center gap-2.5 flex-shrink-0 justify-end">
                    {/* View Details */}
                    <button
                      onClick={() => onSelectReport(report)}
                      className="px-3 py-2 text-xs font-bold border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
                    >
                      Audit Details
                    </button>

                    {/* Status Action Button */}
                    {!isResolved && !isInProgress && (
                      <button
                        onClick={() => onUpdateStatus(report.id, 'in_progress', 'BVG workers arriving on site.')}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 active:scale-[0.98]"
                      >
                        <HardHat className="w-3.5 h-3.5" />
                        <span>Start Cleaning</span>
                      </button>
                    )}

                    {!isResolved && isInProgress && (
                      <button
                        onClick={() => setSelectedTicketForVerify(report)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 active:scale-[0.98]"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Verify &amp; Close</span>
                      </button>
                    )}

                    {isResolved && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>SLA Compliant</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. Verification & Close Modal (Stage 5) */}
      {selectedTicketForVerify && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Upload Clean Verification Photo</h3>
                  <p className="text-[11px] text-slate-500 font-mono">{selectedTicketForVerify.ticketNumber}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTicketForVerify(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {/* Before vs After Comparison */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Before (Reported)</span>
                <div className="h-28 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                  <img 
                    src={selectedTicketForVerify.beforeImageUrl || selectedTicketForVerify.imageUrl} 
                    alt="Before" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-700 block mb-1">After (Clean Surface)</span>
                <div className="h-28 rounded-lg overflow-hidden border-2 border-emerald-500 bg-slate-100 relative group">
                  <img 
                    src={afterImageChoice} 
                    alt="After" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-[10px] font-bold">Verified Clean</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Work log note */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                BVG Sanitation Clearance Notes
              </label>
              <textarea
                rows={2}
                value={verificationNote}
                onChange={(e) => setVerificationNote(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-200"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedTicketForVerify(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifySubmit}
                disabled={isVerifying}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isVerifying ? (
                  <span>Submitting Audit...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm &amp; Close Ticket</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
