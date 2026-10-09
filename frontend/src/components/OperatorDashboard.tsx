import React, { useState } from 'react';
import { 
  MaintenanceReport, 
  ActivityEvent,
  ReportStatus
} from '../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Camera, 
  ShieldAlert, 
  Wrench, 
  Check, 
  Truck, 
  Users, 
  Radio, 
  Sparkles, 
  ArrowRight,
  ExternalLink,
  X,
  Upload,
  Layers,
  ChevronRight,
  Scale,
  Box
} from 'lucide-react';
import { LeafletCampusMap } from './LeafletCampusMap';

interface OperatorDashboardProps {
  reports: MaintenanceReport[];
  activities: ActivityEvent[];
  onUpdateStatus: (reportId: string, status: ReportStatus, note?: string) => void;
  onSelectReport: (report: MaintenanceReport) => void;
  onNavigateToTab: (tab: any) => void;
}

export const OperatorDashboard: React.FC<OperatorDashboardProps> = ({
  reports,
  activities,
  onUpdateStatus,
  onSelectReport,
  onNavigateToTab
}) => {
  const [filter, setFilter] = useState<'all' | 'urgent' | 'in_progress' | 'resolved'>('all');
  const [selectedTicketForVerify, setSelectedTicketForVerify] = useState<MaintenanceReport | null>(null);
  const [afterImageChoice, setAfterImageChoice] = useState<string>(
    'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=800&q=80'
  );
  const [verificationNote, setVerificationNote] = useState<string>('Site cleared by Sanitation Beat Alpha. Area washed and disinfected.');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Operator focuses on active field maintenance reports
  const activeReports = reports.filter(r => r.status !== 'resolved');
  const urgentReports = reports.filter(r => r.severity === 'urgent' && r.status !== 'resolved');
  const inProgressReports = reports.filter(r => r.status === 'in_progress');
  const resolvedReports = reports.filter(r => r.status === 'resolved');

  const filteredReports = reports.filter(r => {
    if (filter === 'urgent') return r.severity === 'urgent' && r.status !== 'resolved';
    if (filter === 'in_progress') return r.status === 'in_progress';
    if (filter === 'resolved') return r.status === 'resolved';
    return true;
  });

  const handleStartWork = (e: React.MouseEvent, reportId: string) => {
    e.stopPropagation();
    onUpdateStatus(reportId, 'in_progress', 'Field squad arrived on site. Cleanup in progress.');
  };

  const handleOpenVerifyModal = (e: React.MouseEvent, report: MaintenanceReport) => {
    e.stopPropagation();
    setSelectedTicketForVerify(report);
  };

  const handleExecuteVerification = () => {
    if (!selectedTicketForVerify) return;
    setIsVerifying(true);

    setTimeout(() => {
      onUpdateStatus(
        selectedTicketForVerify.id, 
        'resolved', 
        `AI Verified Resolution: ${verificationNote}`
      );
      setIsVerifying(false);
      setSelectedTicketForVerify(null);
    }, 600);
  };

  // Sample alternative after-clean photos for operator testing
  const sampleCleanPhotos = [
    {
      title: 'Pavement Swept & Cleared',
      url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=800&q=80'
    },
    {
      title: 'Sanitized Bin Bay',
      url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80'
    },
    {
      title: 'Cleared Drain & Roadside',
      url: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Field Operator Station Header */}
      <div className="rounded-2xl bg-[#001e40] text-white p-6 border border-slate-700 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>FIELD OPERATOR TERMINAL</span>
              </span>
              <span className="text-xs bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full font-mono">
                BEAT: ALPHA-01 (Ward 42 • UIET Academic Precinct)
              </span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Sanitation Beat Operations &amp; Dispatch Console</span>
            </h1>

            <p className="text-slate-300 text-xs max-w-2xl leading-relaxed">
              Assigned Supervisor: <strong className="text-white">Rajesh Kumar</strong> &bull; Emergency Beat Hotline: <strong className="text-white font-mono">+91 98765 43210</strong>
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                Squad on Duty: <strong>6 Technicians</strong>
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-400" />
                Vehicle: <strong>SWEEPER-02 (Active on Beat)</strong>
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Current Shift: <strong>07:00 - 15:00 IST</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 flex-shrink-0">
            <button
              onClick={() => onNavigateToTab('map')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <MapPin className="w-4 h-4" />
              <span>Open Field Map</span>
            </button>
            <button
              onClick={() => onNavigateToTab('pipeline')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>ARE Routing Engine</span>
            </button>
          </div>
        </div>
      </div>

      {/* Operator KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">Active Work Orders</span>
            <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
              <Wrench className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-800">{activeReports.length}</h3>
          <p className="text-[11px] text-blue-600 font-semibold mt-0.5">Assigned to your beat</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/20 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-red-700">Urgent / SLA Alert</span>
            <span className="p-1.5 bg-red-100 text-red-700 rounded-lg animate-pulse">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-2xl font-black text-red-700">{urgentReports.length}</h3>
          <p className="text-[11px] text-red-600 font-semibold mt-0.5">&lt; 30m SLA window</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">In Progress Now</span>
            <span className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-800">{inProgressReports.length}</h3>
          <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Crews on-site</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">Resolved Today</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-2xl font-black text-emerald-700">{resolvedReports.length}</h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">SLA Compliance: 94.8%</p>
        </div>
      </div>

      {/* Field Operator Leaflet Map with Red, Yellow, Green Severity */}
      <LeafletCampusMap
        reports={reports}
        onSelectReport={onSelectReport}
        userRole="operator"
        compact={true}
        height="420px"
        title="CSJMU Beat Dispatch &amp; Route Triage Map"
        subtitle="Geographic tracking of field maintenance tickets. Red pins mark critical hazards."
      />

      {/* Work Orders Header & Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-600" />
              <span>Field Dispatch Queue &amp; Work Orders</span>
            </h2>
            <p className="text-xs text-slate-500">
              Immediate triage work orders dispatched via Authority Resolution Engine (ARE)
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                filter === 'all' ? 'bg-[#001e40] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({reports.length})
            </button>
            <button
              onClick={() => setFilter('urgent')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                filter === 'urgent' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Urgent ({urgentReports.length})
            </button>
            <button
              onClick={() => setFilter('in_progress')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                filter === 'in_progress' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In Progress ({inProgressReports.length})
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                filter === 'resolved' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Closed ({resolvedReports.length})
            </button>
          </div>
        </div>

        {/* Work Order Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {filteredReports.map((report) => {
            const isResolved = report.status === 'resolved';
            const isInProgress = report.status === 'in_progress';
            const isUrgent = report.severity === 'urgent';
            const slaTime = report.slaMinutes || 60;

            return (
              <div
                key={report.id}
                onClick={() => onSelectReport(report)}
                className={`rounded-xl border p-4.5 transition-all flex flex-col justify-between cursor-pointer hover:shadow-md ${
                  isUrgent && !isResolved
                    ? 'border-red-300 bg-red-50/15'
                    : isResolved
                    ? 'border-slate-200 bg-slate-50/30'
                    : 'border-slate-200 bg-white hover:border-blue-400'
                }`}
              >
                <div>
                  {/* Card Header: Ticket #, Category, Severity */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded border border-slate-200">
                        {report.ticketNumber || report.id}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {report.category || 'Solid Waste'}
                      </span>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isUrgent
                        ? 'bg-red-100 text-red-800 animate-pulse font-black'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {report.severity.toUpperCase()} PRIORITY
                    </span>
                  </div>

                  {/* Title & Location */}
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-1">
                    {report.title}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{report.location}</span>
                  </p>

                  {/* SLA Countdown Bar */}
                  <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-600 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Target SLA:
                      </span>
                      <span className={`font-mono font-bold ${
                        isResolved
                          ? 'text-emerald-700'
                          : isUrgent
                          ? 'text-red-700 font-extrabold'
                          : 'text-amber-700'
                      }`}>
                        {isResolved ? 'SLA MET (Closed)' : `${slaTime} Minutes Target`}
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full ${
                          isResolved 
                            ? 'bg-emerald-600 w-full' 
                            : isUrgent 
                            ? 'bg-red-600 w-3/4 animate-pulse' 
                            : 'bg-amber-500 w-1/2'
                        }`} 
                      />
                    </div>
                  </div>

                  {/* Detected Waste Payload if applicable */}
                  {((report.estimatedAmountKg || report.estimatedAmount?.weightKg) || report.category === 'garbage') && (
                    <div className="mt-2.5 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-[11px] font-semibold">
                      <span className="flex items-center gap-1">
                        <Scale className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Waste Payload: ~{report.estimatedAmountKg || report.estimatedAmount?.weightKg || 14.5} kg</span>
                      </span>
                      <span className="text-[10px] text-emerald-700 font-mono">
                        {report.estimatedVolumeM3 || report.estimatedAmount?.volumeM3 || 0.35} m³ vol
                      </span>
                    </div>
                  )}

                  {/* Incident Snapshot Image Preview */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="aspect-video rounded-lg overflow-hidden bg-slate-100 border relative">
                      <img 
                        src={report.beforeImageUrl || report.imageUrl || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80'} 
                        alt="Before" 
                        className="w-full h-full object-cover" 
                      />
                      <span className="absolute bottom-1 left-1 bg-black/75 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                        EVIDENCE PHOTO
                      </span>
                    </div>

                    <div className="aspect-video rounded-lg overflow-hidden bg-slate-100 border relative flex items-center justify-center">
                      {isResolved ? (
                        <>
                          <img 
                            src={report.afterImageUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=600&q=80'} 
                            alt="After Clean" 
                            className="w-full h-full object-cover" 
                          />
                          <span className="absolute bottom-1 left-1 bg-emerald-700 text-white text-[9px] px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> VERIFIED CLEAN
                          </span>
                        </>
                      ) : (
                        <div className="text-center p-2">
                          <Camera className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                          <span className="text-[10px] text-slate-500 block leading-tight">
                            Awaiting post-clean verification photo
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ward & Team Info */}
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span>Beat Alpha &bull; Ward 42</span>
                    <span className="font-semibold text-slate-700">Source: {report.source?.type || 'DRONE_SWEEP'}</span>
                  </div>
                </div>

                {/* Tactical Field Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <a
                      href="tel:+919876543210"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="Call Supervisor"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href="https://wa.me/919876543210"
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                      title="WhatsApp Dispatch"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isResolved && (
                      <>
                        {!isInProgress && (
                          <button
                            onClick={(e) => handleStartWork(e, report.id)}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Mark On-Site</span>
                          </button>
                        )}
                        <button
                          onClick={(e) => handleOpenVerifyModal(e, report)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Verify &amp; Close</span>
                        </button>
                      </>
                    )}

                    {isResolved && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Closed &amp; Audited</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Field Photo Verification Modal */}
      {selectedTicketForVerify && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-300 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-800">
                  Stage 5: AI Photo Verification &amp; Close
                </h3>
              </div>
              <button 
                onClick={() => setSelectedTicketForVerify(null)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500">Closing Ticket: </span>
                <strong className="text-slate-800 font-mono">{selectedTicketForVerify.ticketNumber || selectedTicketForVerify.id}</strong>
                <p className="font-semibold text-slate-700 mt-1">{selectedTicketForVerify.title}</p>
                <p className="text-slate-500">{selectedTicketForVerify.location}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select or Upload &quot;After Cleanup&quot; Photo
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {sampleCleanPhotos.map((photo, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAfterImageChoice(photo.url)}
                      className={`relative rounded-lg overflow-hidden border-2 aspect-video transition-all ${
                        afterImageChoice === photo.url ? 'border-emerald-600 ring-2 ring-emerald-500/30' : 'border-slate-200'
                      }`}
                    >
                      <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                      {afterImageChoice === photo.url && (
                        <div className="absolute inset-0 bg-emerald-600/30 flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Field Verification Note
                </label>
                <textarea
                  value={verificationNote}
                  onChange={(e) => setVerificationNote(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  rows={2}
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>AI Automated Verification Engine</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  Before vs After comparison will check cleanliness confidence (96.4%). SLA turnaround time will be logged in the CSJMU municipal ledger.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedTicketForVerify(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteVerification}
                disabled={isVerifying}
                className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Verifying AI Model...</span>
                  </>
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
