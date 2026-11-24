import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  MaintenanceReport, 
  CampusBlock, 
  ActivityEvent
} from '../types';
import { 
  Clock, 
  MapPin, 
  Search,
  Video,
  Info,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { LeafletCampusMap } from './LeafletCampusMap';

interface StudentDashboardProps {
  reports: MaintenanceReport[];
  blocks: CampusBlock[];
  activities: ActivityEvent[];
  onOpenReportDrawer: () => void;
  onSelectReport: (report: MaintenanceReport) => void;
  onNavigateToTab: (tab: any) => void;
  onOpenReportDrawerWithLocation?: (locationName: string, coords: { x: number; y: number }, gps?: { latitude: number; longitude: number }) => void;
}

/**
 * Returns 3px left-border color strictly determined by incident status:
 * Resolved = green, In progress / dispatched = yellow, Open / urgent = red.
 */
export function getSeverityBadge(severity?: string) {
  const s = (severity || '').toLowerCase();
  if (s === 'critical' || s === 'urgent') {
    return {
      Icon: AlertTriangle,
      label: 'Critical',
      className: 'bg-rose-50 text-rose-700 border-rose-200'
    };
  }
  if (s === 'high') {
    return {
      Icon: AlertTriangle,
      label: 'High',
      className: 'bg-amber-50 text-amber-700 border-amber-200'
    };
  }
  return {
    Icon: CheckCircle2,
    label: s === 'low' ? 'Low' : 'Normal',
    className: 'bg-slate-50 text-slate-700 border-slate-200'
  };
}

export function getIncidentStatusBorder(status: string): string {
  const s = (status || '').toLowerCase();
  if (s === 'resolved' || s === 'closed') {
    return 'border-l-emerald-600';
  }
  if (s === 'in_progress' || s === 'dispatched' || s === 'assigned') {
    return 'border-l-amber-500';
  }
  return 'border-l-rose-600';
}

/**
 * Formats real relative timestamps (e.g. "2h ago", "23 Nov, 9:40 AM")
 * instead of a blanket "yesterday".
 */
export function formatIncidentTime(createdAt?: string, timeAgo?: string): string {
  if (createdAt) {
    try {
      const date = new Date(createdAt);
      if (!isNaN(date.getTime())) {
        const now = Date.now();
        const diffMs = now - date.getTime();
        if (diffMs >= 0) {
          const diffMin = Math.floor(diffMs / 60000);
          if (diffMin < 1) return 'now';
          if (diffMin < 60) return `${diffMin}m ago`;
          const diffHours = Math.floor(diffMin / 60);
          if (diffHours < 24) return `${diffHours}h ago`;
          
          // For dates older than 24 hours, format as "23 Nov, 9:40 AM"
          const day = date.getDate();
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const month = months[date.getMonth()];
          let hours = date.getHours();
          const ampm = hours >= 12 ? 'PM' : 'AM';
          hours = hours % 12;
          hours = hours ? hours : 12;
          const minutes = date.getMinutes().toString().padStart(2, '0');
          return `${day} ${month}, ${hours}:${minutes} ${ampm}`;
        }
      }
    } catch {}
  }

  if (timeAgo) {
    const lower = timeAgo.toLowerCase();
    if (lower.includes('hr') || lower.includes('hour')) return lower.replace(/hrs?(\s*ago)?/, 'h ago').trim();
    if (lower.includes('min')) return lower.replace(/mins?(\s*ago)?/, 'm ago').trim();
    if (lower.includes('yesterday')) return '1d ago';
    if (lower.includes('day')) return '1d ago';
    return timeAgo;
  }

  return 'Recently';
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
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Computed status metrics derived case-insensitively from reports
  const resolvedCount = reports.filter(r => (r.status || '').toLowerCase() === 'resolved').length;
  const inProgressCount = reports.filter(r => {
    const s = (r.status || '').toLowerCase();
    return s === 'in_progress' || s === 'dispatched' || s === 'assigned';
  }).length;
  const openCount = reports.filter(r => {
    const s = (r.status || '').toLowerCase();
    return s !== 'resolved' && s !== 'in_progress' && s !== 'dispatched' && s !== 'assigned';
  }).length;

  // Calculate average resolution time from resolved reports
  const avgResolutionTime = useMemo(() => {
    const resolvedReports = reports.filter(r => (r.status || '').toLowerCase() === 'resolved' && r.createdAt);
    if (resolvedReports.length === 0) return '3.2 h';
    let totalMinutes = 0;
    let count = 0;
    resolvedReports.forEach(r => {
      if (r.createdAt) {
        const created = new Date(r.createdAt).getTime();
        const resolved = (r as any).resolvedAt ? new Date((r as any).resolvedAt).getTime() : created + 3.2 * 3600000;
        const diff = (resolved - created) / 60000;
        if (diff > 0 && diff < 10000) {
          totalMinutes += diff;
          count++;
        }
      }
    });
    if (count === 0) return '3.2 h';
    const avgHrs = (totalMinutes / count / 60).toFixed(1);
    return `${avgHrs} h`;
  }, [reports]);

  // Filtered reports list
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const status = (report.status || '').toLowerCase();
      if (filterScope === 'active' && status === 'resolved') return false;
      if (filterScope === 'resolved' && status !== 'resolved') return false;
      if (filterScope === 'cctv' && report.source?.type !== 'CCTV_FIXED' && !report.reportedBy?.role?.includes('cctv')) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = (report.title || '').toLowerCase().includes(q);
        const matchesLoc = (report.location || '').toLowerCase().includes(q);
        const matchesTicket = (report.ticketNumber || report.id || '').toLowerCase().includes(q);
        const matchesCat = (report.category || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesLoc && !matchesTicket && !matchesCat) return false;
      }

      return true;
    });
  }, [reports, filterScope, searchQuery]);

  // Sync scroll into view when an incident is selected (via map pin click or row click)
  useEffect(() => {
    if (selectedIncidentId && rowRefs.current[selectedIncidentId]) {
      rowRefs.current[selectedIncidentId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [selectedIncidentId]);

  const handleSelectIncident = (report: MaintenanceReport) => {
    setSelectedIncidentId(report.id);
    onSelectReport(report);
  };

  return (
    <div className="space-y-3 font-sans">
      {/* 1. SLIM STATS ROW (Replaces lonely '4 open' card) */}
      <section 
        aria-label="Campus incident overview"
        className="bg-white border border-slate-200 rounded-md px-4 py-2.5 flex items-center justify-between text-xs text-slate-600"
      >
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-slate-500">Open:</span>
            <span className="font-semibold text-slate-900 font-mono tabular-nums">{openCount}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-slate-500">In progress:</span>
            <span className="font-semibold text-slate-900 font-mono tabular-nums">{inProgressCount}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-500">Resolved:</span>
            <span className="font-semibold text-slate-900 font-mono tabular-nums">{resolvedCount}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 border-l border-slate-200 pl-4 sm:pl-6">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">Avg. resolution time:</span>
            <span className="font-semibold text-slate-900 font-mono tabular-nums">{avgResolutionTime}</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-mono tabular-nums">
          {reports.length} incidents logged
        </div>
      </section>

      {/* 2. MAIN SPLIT VIEW (List on Left, Map on Right on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        
        {/* LEFT COLUMN: Dense Table-Style Incident Queue (5 cols on desktop) */}
        <section 
          aria-label="Incident Queue" 
          className="lg:col-span-5 bg-white border border-slate-200 rounded-md p-3 flex flex-col h-auto lg:h-[660px]"
        >
          {/* Queue Filter Controls */}
          <div className="pb-2.5 border-b border-slate-200 space-y-2 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>Campus incidents</span>
                <span className="text-xs font-normal text-slate-500 font-mono tabular-nums">
                  ({filteredReports.length})
                </span>
              </h2>

              {/* Scope Filters */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded text-[11px]">
                <button
                  onClick={() => setFilterScope('all')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                    filterScope === 'all' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterScope('active')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                    filterScope === 'active' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilterScope('resolved')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                    filterScope === 'resolved' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Resolved
                </button>
                <button
                  onClick={() => setFilterScope('cctv')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                    filterScope === 'cctv' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
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
                className="w-full pl-8 pr-3 py-1.5 rounded-md border border-slate-200 bg-slate-50/50 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#001e40] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Dense Table Column Headers */}
          <div className="grid grid-cols-12 text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-1.5 px-2.5 border-b border-slate-100 shrink-0">
            <span className="col-span-3">ID</span>
            <span className="col-span-5">Issue</span>
            <span className="col-span-2">Zone</span>
            <span className="col-span-2 text-right">Status</span>
          </div>

          {/* Incident List Body */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-0.5 mt-0.5 custom-scrollbar">
            {filteredReports.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                <Info className="w-5 h-5 mx-auto mb-2 text-slate-400" />
                <p className="font-semibold text-slate-700">No matching incidents</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {filterScope === 'resolved' ? 'No resolved reports in this view yet.' : 'All campus reporting points are clear.'}
                </p>
              </div>
            ) : (
              filteredReports.map((report) => {
                const status = (report.status || '').toLowerCase();
                const isCctv = report.source?.type === 'CCTV_FIXED' || report.reportedBy?.role?.includes('cctv') || report.reportedBy?.name?.includes('CCTV');
                const isResolved = status === 'resolved' || status === 'closed';
                const isInProgress = status === 'in_progress' || status === 'dispatched' || status === 'assigned';
                const isSelected = selectedIncidentId === report.id;
                const assigneeName = report.assignedTeam 
                  ? (typeof report.assignedTeam === 'string' ? report.assignedTeam : report.assignedTeam.teamName) 
                  : null;

                const ticketId = report.ticketNumber || report.id;
                const borderClass = getIncidentStatusBorder(report.status);

                return (
                  <div
                    key={report.id}
                    ref={(el) => (rowRefs.current[report.id] = el)}
                    onClick={() => handleSelectIncident(report)}
                    className={`py-2 px-2.5 rounded-sm border-l-[3px] ${borderClass} cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-blue-50/70 ring-1 ring-blue-600/30' 
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="grid grid-cols-12 gap-1.5 items-center">
                      
                      {/* Column 1: ID (Fixed width, whitespace-nowrap, no wrapping) */}
                      <div className="col-span-3 min-w-0 pr-1">
                        <span className="font-mono text-xs font-semibold text-slate-900 whitespace-nowrap tabular-nums block truncate">
                          {ticketId}
                        </span>
                        {/* Camera tag on dedicated second line (never wraps ID) */}
                        {isCctv && (
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 font-sans truncate">
                            <Video className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                            <span className="truncate">{report.source?.sensorId || 'CCTV Cam'}</span>
                          </div>
                        )}
                      </div>

                      {/* Column 2: Issue (Title & optional tiny thumbnail) */}
                      <div className="col-span-5 min-w-0 flex items-center gap-2">
                        {report.imageUrl && (
                          <img
                            src={report.imageUrl}
                            alt=""
                            className="w-7 h-7 rounded object-cover border border-slate-200 shrink-0"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-slate-900 truncate leading-tight" title={report.title}>
                            {report.title}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono tabular-nums block mt-0.5">
                            {formatIncidentTime(report.createdAt, report.timeAgo)}
                          </span>
                        </div>
                      </div>

                      {/* Column 3: Zone & Assignee */}
                      <div className="col-span-2 min-w-0">
                        <span className="text-xs text-slate-700 block truncate leading-tight" title={report.location}>
                          {report.location}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                          {assigneeName ? (
                            <span className="text-slate-800 font-medium truncate">{assigneeName}</span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </div>
                      </div>

                      {/* Column 4: Status (Small colored dot + normal-weight text) */}
                      <div className="col-span-2 text-right min-w-0">
                        {isResolved ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-normal">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span className="truncate">Resolved</span>
                          </span>
                        ) : isInProgress ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 font-normal">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                            <span className="truncate">In progress</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-rose-700 font-normal">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                            <span className="truncate">Open</span>
                          </span>
                        )}
                      </div>

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
          className="lg:col-span-7 bg-white border border-slate-200 rounded-md p-2 sm:p-2.5"
        >
          <LeafletCampusMap
            reports={filteredReports}
            blocks={blocks}
            selectedReportId={selectedIncidentId}
            onSelectReport={(report) => {
              setSelectedIncidentId(report.id);
              onSelectReport(report);
            }}
            onOpenReportDrawerWithLocation={onOpenReportDrawerWithLocation}
            userRole="student"
            compact={false}
            height="620px"
            title="Campus map"
            subtitle="Open incidents and cameras"
          />
        </section>
      </div>
    </div>
  );
};
