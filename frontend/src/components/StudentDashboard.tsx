import React, { useState, useMemo } from 'react';
import { 
  MaintenanceReport, 
  CampusBlock, 
  ActivityEvent,
  ReportCategory
} from '../types';
import { 
  AlertOctagon,
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Plus, 
  Search,
  Filter,
  Camera, 
  Compass,
  Video,
  Scale,
  ShieldCheck,
  Building2,
  Info,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import { LeafletCampusMap } from './LeafletCampusMap';
import { resolveMediaUrl } from '../api/client';

interface StudentDashboardProps {
  reports: MaintenanceReport[];
  blocks: CampusBlock[];
  activities: ActivityEvent[];
  onOpenReportDrawer: () => void;
  onSelectReport: (report: MaintenanceReport) => void;
  onNavigateToTab: (tab: any) => void;
  onOpenReportDrawerWithLocation?: (locationName: string, coords: { x: number; y: number }, gps?: { latitude: number; longitude: number }) => void;
}

// Unified Civic Severity Mapping (Color + Icon + Text)
export function getSeverityBadge(severity: string) {
  const s = (severity || 'normal').toLowerCase();
  if (s === 'critical') {
    return {
      label: 'Critical',
      Icon: AlertOctagon,
      className: 'bg-red-50 text-red-700 border-red-200',
      dotColor: 'bg-red-600'
    };
  }
  if (s === 'urgent' || s === 'high') {
    return {
      label: 'High Priority',
      Icon: AlertTriangle,
      className: 'bg-orange-50 text-orange-800 border-orange-200',
      dotColor: 'bg-orange-500'
    };
  }
  if (s === 'normal' || s === 'medium') {
    return {
      label: 'Medium',
      Icon: Clock,
      className: 'bg-amber-50 text-amber-900 border-amber-200',
      dotColor: 'bg-amber-500'
    };
  }
  return {
    label: 'Low',
    Icon: CheckCircle2,
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dotColor: 'bg-emerald-600'
  };
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  reports,
  blocks,
  activities,
  onOpenReportDrawer,
  onSelectReport,
  onNavigateToTab,
  onOpenReportDrawerWithLocation
}) => {
  const [filterScope, setFilterScope] = useState<'all' | 'active' | 'resolved' | 'cctv'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  // Check if secondary gamification modules should be shown (?extras=1 or ?dev=1)
  const showExtras = typeof window !== 'undefined' && 
    (new URLSearchParams(window.location.search).get('extras') === '1' || 
     new URLSearchParams(window.location.search).get('dev') === '1');

  // Computed summary metrics derived strictly from real state data
  const openCount = reports.filter(r => r.status !== 'resolved').length;
  const criticalCount = reports.filter(r => (r.severity === 'critical' || r.severity === 'urgent') && r.status !== 'resolved').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;
  const cctvReportsCount = reports.filter(r => r.source?.type === 'CCTV_FIXED' || r.reportedBy?.role?.includes('cctv')).length;
  const activeCamerasCount = 5; // 5 verified quad cameras online

  // Filtered reports list
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      if (filterScope === 'active' && report.status === 'resolved') return false;
      if (filterScope === 'resolved' && report.status !== 'resolved') return false;
      if (filterScope === 'cctv' && report.source?.type !== 'CCTV_FIXED' && !report.reportedBy?.role?.includes('cctv')) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = report.title?.toLowerCase().includes(q);
        const matchesLoc = report.location?.toLowerCase().includes(q);
        const matchesTicket = (report.ticketNumber || report.id)?.toLowerCase().includes(q);
        const matchesCat = report.category?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesLoc && !matchesTicket && !matchesCat) return false;
      }

      return true;
    });
  }, [reports, filterScope, searchQuery]);

  const getSeverityBorder = (severity: string, isResolved: boolean) => {
    if (isResolved) return 'border-l-slate-300';
    const s = (severity || '').toLowerCase();
    if (s === 'critical') return 'border-l-rose-600';
    if (s === 'urgent' || s === 'high') return 'border-l-amber-500';
    if (s === 'normal' || s === 'medium') return 'border-l-sky-500';
    return 'border-l-slate-300';
  };

  const formatRelativeTime = (timeAgo?: string, createdAt?: string) => {
    if (timeAgo) {
      const lower = timeAgo.toLowerCase();
      if (lower.includes('yesterday') || lower.includes('day')) return 'yesterday';
      if (lower.includes('hr') || lower.includes('hour')) return lower.replace(/hrs?(\s*ago)?/, 'h ago').trim();
      if (lower.includes('min')) return lower.replace(/mins?(\s*ago)?/, 'm ago').trim();
      return timeAgo;
    }
    if (!createdAt) return 'now';
    try {
      const diffMin = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
      if (diffMin < 1) return 'now';
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return 'yesterday';
    } catch {
      return '2h ago';
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. TOP SUMMARY STRIP (Plain text summary with no vertical dividers and no bold mono numbers) */}
      <section 
        aria-label="Civic Operations Summary"
        className="bg-white border border-slate-200 rounded-lg px-4 py-3 flex items-center justify-between gap-3 shadow-2xs"
      >
        <div className="text-xs text-slate-600">
          <span>{openCount} open</span>
          {criticalCount > 0 && <span>, <span className="text-rose-700 font-medium">{criticalCount} critical</span></span>}
          {resolvedCount > 0 && <span>, {resolvedCount} resolved</span>}
        </div>

        {/* Action Button */}
        <button
          id="report-hazard-button"
          onClick={onOpenReportDrawer}
          className="px-3.5 py-1.5 rounded bg-indigo-700 hover:bg-indigo-800 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Lodge Incident</span>
        </button>
      </section>

      {/* 2. MAIN SPLIT VIEW (List on Left, Map on Right on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* LEFT COLUMN: Ticketing Tool Incident Queue (5 cols on desktop) */}
        <section 
          aria-label="Incident Queue" 
          className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-2xs flex flex-col h-auto lg:h-[660px]"
        >
          {/* Queue Filter Controls */}
          <div className="pb-3 border-b border-slate-200 space-y-2 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <span>Campus Incidents</span>
                <span className="text-xs font-normal text-slate-500">
                  ({filteredReports.length})
                </span>
              </h2>

              {/* Scope Filters */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded text-[11px]">
                <button
                  onClick={() => setFilterScope('all')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    filterScope === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterScope('active')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    filterScope === 'active' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilterScope('resolved')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    filterScope === 'resolved' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Resolved
                </button>
                <button
                  onClick={() => setFilterScope('cctv')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    filterScope === 'cctv' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  CCTV
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by ID, zone, category..."
                className="w-full pl-8 pr-3 py-1.5 rounded border border-slate-200 bg-slate-50/50 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Incident List Body */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1 mt-1 custom-scrollbar">
            {filteredReports.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                <Info className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                <p className="font-semibold text-slate-700">No matching incidents</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {filterScope === 'resolved' ? 'No resolved reports in this view yet.' : 'All campus reporting points are clear.'}
                </p>
              </div>
            ) : (
              filteredReports.map((report) => {
                const isCctv = report.source?.type === 'CCTV_FIXED' || report.reportedBy?.role?.includes('cctv') || report.reportedBy?.name?.includes('CCTV');
                const isResolved = report.status === 'resolved';
                const isSelected = selectedIncidentId === report.id;
                const assigneeName = report.assignedTeam 
                  ? (typeof report.assignedTeam === 'string' ? report.assignedTeam : report.assignedTeam.teamName) 
                  : null;

                return (
                  <div
                    key={report.id}
                    onClick={() => {
                      setSelectedIncidentId(report.id);
                      onSelectReport(report);
                    }}
                    className={`py-2.5 px-3 rounded border-l-[3px] cursor-pointer transition-colors ${getSeverityBorder(report.severity, isResolved)} ${
                      isSelected ? 'bg-indigo-50/60' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Photo Thumbnail if available */}
                      {report.imageUrl && (
                        <img
                          src={report.imageUrl}
                          alt=""
                          className="w-10 h-10 rounded object-cover border border-slate-200 shrink-0 mt-0.5"
                        />
                      )}

                      <div className="min-w-0 flex-1">
                        {/* Meta Line: Ticket ID • Relative Time • CCTV feed */}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-0.5">
                          <span className="font-mono text-slate-700 font-medium">
                            {report.ticketNumber || report.id}
                          </span>
                          <span>&bull;</span>
                          <span>{formatRelativeTime(report.timeAgo, report.createdAt)}</span>
                          {isCctv && (
                            <>
                              <span>&bull;</span>
                              <span className="inline-flex items-center gap-1 text-slate-600">
                                <Video className="w-3 h-3 text-slate-400" />
                                <span>{report.source?.sensorId || 'CCTV Cam 04'}</span>
                              </span>
                            </>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-xs font-medium text-slate-900 leading-snug truncate">
                          {report.title}
                        </h3>

                        {/* Location & Assignee */}
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1 truncate max-w-[140px] sm:max-w-[180px]">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{report.location}</span>
                          </span>

                          <span>&bull;</span>

                          <span className="truncate">
                            {assigneeName ? (
                              <span className="text-slate-600">{assigneeName}</span>
                            ) : (
                              <span className="text-amber-700 italic">Unassigned</span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Status indicator: ONLY show when it differs from active */}
                      {report.status !== 'pending' && (
                        <div className="shrink-0 pt-0.5">
                          {isResolved ? (
                            <span className="text-[11px] font-medium text-emerald-700">Resolved</span>
                          ) : report.status === 'in_progress' ? (
                            <span className="text-[11px] font-medium text-indigo-700">In progress</span>
                          ) : (
                            <span className="text-[11px] font-medium text-slate-600 capitalize">
                              {report.status.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* RIGHT COLUMN: Interactive Campus Map (7 cols on desktop) */}
        <section 
          aria-label="Campus Incident Map"
          className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-2 sm:p-3 shadow-2xs"
        >
          <LeafletCampusMap
            reports={filteredReports}
            blocks={blocks}
            onSelectReport={onSelectReport}
            onOpenReportDrawerWithLocation={onOpenReportDrawerWithLocation}
            userRole="student"
            compact={false}
            height="620px"
            title="Campus Incident Triage Map"
            subtitle="Geospatial display of active waste hazards and CCTV detection locations."
          />
        </section>
      </div>

      {/* 3. OPTIONAL CIVIC MODULES (Guarded behind ?extras=1 feature flag) */}
      {showExtras && (
        <section className="mt-8 pt-6 border-t border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Campus Environmental Research Modules (Feature Flag Active)
            </h3>
            <span className="text-[10px] font-mono text-slate-400">?extras=1</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
            <div className="p-4 rounded border border-slate-200 bg-white">
              <h4 className="font-bold text-slate-900 mb-1">Thermal Comfort &amp; Shaded Havens</h4>
              <p className="text-slate-500 mb-2">Microclimate data from library commons and UIET shaded pergola.</p>
              <button 
                onClick={() => onNavigateToTab('heatisland')}
                className="text-blue-700 font-semibold hover:underline flex items-center gap-1"
              >
                <span>View Heat Island Map</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 rounded border border-slate-200 bg-white">
              <h4 className="font-bold text-slate-900 mb-1">Green Campus Audit</h4>
              <p className="text-slate-500 mb-2">Annual departmental waste segregation and tree canopy indexes.</p>
              <button 
                onClick={() => onNavigateToTab('planning')}
                className="text-blue-700 font-semibold hover:underline flex items-center gap-1"
              >
                <span>View Estate Planning Board</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
