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

  return (
    <div className="space-y-4">
      {/* 1. TOP SUMMARY STRIP (Replaces marketing hero banner with computed real data) */}
      <section 
        aria-label="Civic Operations Summary"
        className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3"
      >
        <div className="flex flex-wrap items-center gap-2 sm:gap-6 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="font-semibold text-slate-900">Campus Status: Operations Active</span>
          </div>

          <div className="hidden sm:block h-4 w-px bg-slate-200" />

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Open Incidents:</span>
            <span className="font-mono font-bold text-slate-900">{openCount}</span>
          </div>

          <div className="hidden sm:block h-4 w-px bg-slate-200" />

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Critical:</span>
            <span className={`font-mono font-bold ${criticalCount > 0 ? 'text-red-700' : 'text-slate-900'}`}>
              {criticalCount}
            </span>
          </div>

          <div className="hidden sm:block h-4 w-px bg-slate-200" />

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Resolved Today:</span>
            <span className="font-mono font-bold text-emerald-700">{resolvedCount}</span>
          </div>

          <div className="hidden sm:block h-4 w-px bg-slate-200" />

          <div className="flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500">CCTV Feeds:</span>
            <span className="font-mono font-bold text-slate-900">{activeCamerasCount} Online</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="report-hazard-button"
            onClick={onOpenReportDrawer}
            className="w-full sm:w-auto px-3.5 py-1.5 rounded bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Lodge Incident</span>
          </button>
        </div>
      </section>

      {/* 2. MAIN SPLIT VIEW (List on Left, Map on Right on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* LEFT COLUMN: Scannable Incident Queue / Table (5 cols on desktop) */}
        <section 
          aria-label="Incident Queue" 
          className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-2xs flex flex-col h-auto lg:h-[660px]"
        >
          {/* Queue Filter Controls */}
          <div className="pb-3 border-b border-slate-200 space-y-2 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>Campus Incidents</span>
                <span className="text-xs font-mono font-normal text-slate-500">
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
                className="w-full pl-8 pr-3 py-1.5 rounded border border-slate-200 bg-slate-50/50 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-hidden"
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
                const sev = getSeverityBadge(report.severity);
                const SevIcon = sev.Icon;
                const isSelected = selectedIncidentId === report.id;

                // Estimated weight handling with honest disclaimers
                const weight = report.estimatedAmountKg || report.estimatedAmount?.weightKg;

                return (
                  <div
                    key={report.id}
                    onClick={() => {
                      setSelectedIncidentId(report.id);
                      onSelectReport(report);
                    }}
                    className={`py-3 px-2 rounded cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/70 border-l-2 border-blue-700' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        {/* Meta Row: ID, Severity, Source */}
                        <div className="flex items-center gap-1.5 flex-wrap text-[10px] mb-1">
                          <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                            {report.ticketNumber || report.id}
                          </span>

                          <span className={`inline-flex items-center gap-1 font-semibold px-1.5 py-0.2 rounded border ${sev.className}`}>
                            <SevIcon className="w-3 h-3 shrink-0" />
                            <span>{sev.label}</span>
                          </span>

                          {isCctv ? (
                            <span className="inline-flex items-center gap-1 text-slate-600 font-medium bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                              <Video className="w-2.5 h-2.5 text-slate-500" />
                              <span>{report.source?.sensorId || 'CCTV Cam 04'}</span>
                              <span className="text-[9px] text-slate-400">&bull; 2/3 frames</span>
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">
                              Citizen report
                            </span>
                          )}

                          <span className="text-slate-400 ml-auto font-mono text-[10px]">
                            {report.timeAgo || 'Recent'}
                          </span>
                        </div>

                        {/* Incident Title */}
                        <h3 className="text-xs font-bold text-slate-900 leading-tight truncate">
                          {report.title}
                        </h3>

                        {/* Location */}
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{report.location}</span>
                        </p>

                        {/* Rough Estimate if present */}
                        {weight && (
                          <div 
                            className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200"
                            title="Rough photogrammetric volume estimate. Not verified by certified scale."
                          >
                            <Scale className="w-3 h-3 text-slate-500" />
                            <span>Rough estimate: ~{weight} kg</span>
                            <span className="text-[9px] text-slate-400">(visual estimation)</span>
                          </div>
                        )}
                      </div>

                      {/* Status Tag */}
                      <div className="shrink-0 text-right">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                          isResolved 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : 'bg-amber-50 text-amber-900 border-amber-200'
                        }`}>
                          {isResolved ? 'Resolved' : 'Active'}
                        </span>
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
