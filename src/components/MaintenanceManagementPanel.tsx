import React, { useState } from 'react';
import { 
  Filter, 
  ArrowUpDown, 
  MapPin, 
  AlertTriangle, 
  Info, 
  ChevronRight, 
  ChevronDown, 
  CheckCircle2, 
  Wrench, 
  ShieldAlert, 
  Radio, 
  Check,
  Search,
  Plus
} from 'lucide-react';
import { MaintenanceReport, ReportStatus, ActivityEvent, ReportCategory } from '../types';

interface MaintenanceManagementPanelProps {
  reports: MaintenanceReport[];
  activities: ActivityEvent[];
  onUpdateStatus: (reportId: string, newStatus: ReportStatus) => void;
  onSelectReport: (report: MaintenanceReport) => void;
  onOpenReportDrawer: () => void;
}

export const MaintenanceManagementPanel: React.FC<MaintenanceManagementPanelProps> = ({
  reports,
  activities,
  onUpdateStatus,
  onSelectReport,
  onOpenReportDrawer
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'urgent_first' | 'status'>('latest');
  const [showFilterMenu, setShowFilterMenu] = useState<boolean>(false);
  const [showSortMenu, setShowSortMenu] = useState<boolean>(false);
  const [showFullLogModal, setShowFullLogModal] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Calculations for daily metrics
  const newReportsCount = reports.filter(r => r.status === 'pending').length + 8;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length + 6;
  const totalRelevant = newReportsCount + resolvedCount;
  const resolutionRate = Math.round((resolvedCount / (totalRelevant || 1)) * 100) || 66;

  // Filter & Sort logic
  const filteredReports = reports
    .filter(report => {
      if (filterCategory !== 'all' && report.category !== filterCategory) return false;
      if (filterStatus !== 'all' && report.status !== filterStatus) return false;
      if (filterSeverity !== 'all' && report.severity !== filterSeverity) return false;
      if (searchFilter) {
        const query = searchFilter.toLowerCase();
        const matchesTitle = report.title.toLowerCase().includes(query);
        const matchesLoc = report.location.toLowerCase().includes(query);
        const matchesDesc = report.description.toLowerCase().includes(query);
        if (!matchesTitle && !matchesLoc && !matchesDesc) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'urgent_first') {
        if (a.severity === 'urgent' && b.severity !== 'urgent') return -1;
        if (b.severity === 'urgent' && a.severity !== 'urgent') return 1;
      }
      if (sortBy === 'status') {
        const order: Record<ReportStatus, number> = { pending: 1, in_progress: 2, resolved: 3 };
        return order[a.status] - order[b.status];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#c3c6d1] pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#111c2d] tracking-tight mb-1">
            Maintenance Management Panel
          </h1>
          <p className="text-sm md:text-base text-[#43474f]">
            Review and triage recent campus maintenance reports.
          </p>
        </div>

        {/* Filter & Sort Action Buttons */}
        <div className="flex items-center gap-2 relative">
          {/* Filter Button */}
          <div className="relative">
            <button
              id="filter-button"
              onClick={() => {
                setShowFilterMenu(!showFilterMenu);
                setShowSortMenu(false);
              }}
              className={`px-4 py-2 border rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer ${
                filterCategory !== 'all' || filterStatus !== 'all' || filterSeverity !== 'all'
                  ? 'bg-[#001e40] text-white border-[#001e40]'
                  : 'border-[#737780] text-[#43474f] hover:bg-[#dee8ff]'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>FILTER</span>
              {(filterCategory !== 'all' || filterStatus !== 'all' || filterSeverity !== 'all') && (
                <span className="w-2 h-2 rounded-full bg-white"></span>
              )}
            </button>

            {/* Filter Dropdown Popover */}
            {showFilterMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowFilterMenu(false)} />
                <div className="absolute right-0 mt-2 w-64 bg-white border border-[#c3c6d1] rounded-xl shadow-xl z-40 p-4 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-[#e7eeff] mb-3">
                    <span className="text-xs font-bold text-[#001e40] uppercase">Filter Reports</span>
                    <button
                      onClick={() => {
                        setFilterCategory('all');
                        setFilterStatus('all');
                        setFilterSeverity('all');
                        setShowFilterMenu(false);
                      }}
                      className="text-[11px] text-[#ba1a1a] hover:underline"
                    >
                      Reset
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-[#737780] uppercase mb-1">Status</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full p-1.5 border border-[#c3c6d1] rounded bg-[#f0f3ff] text-xs outline-none"
                      >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#737780] uppercase mb-1">Severity</label>
                      <select
                        value={filterSeverity}
                        onChange={(e) => setFilterSeverity(e.target.value)}
                        className="w-full p-1.5 border border-[#c3c6d1] rounded bg-[#f0f3ff] text-xs outline-none"
                      >
                        <option value="all">All Severities</option>
                        <option value="urgent">Urgent Only</option>
                        <option value="normal">Normal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#737780] uppercase mb-1">Category</label>
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full p-1.5 border border-[#c3c6d1] rounded bg-[#f0f3ff] text-xs outline-none"
                      >
                        <option value="all">All Categories</option>
                        <option value="infrastructure">Infrastructure</option>
                        <option value="plumbing">Plumbing</option>
                        <option value="electrical">Electrical</option>
                        <option value="waterlogging">Waterlogging</option>
                        <option value="safety">Safety</option>
                        <option value="garbage">Garbage</option>
                        <option value="hvac">HVAC</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sort Button */}
          <div className="relative">
            <button
              id="sort-button"
              onClick={() => {
                setShowSortMenu(!showSortMenu);
                setShowFilterMenu(false);
              }}
              className="px-4 py-2 border border-[#737780] text-[#43474f] rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#dee8ff] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span>SORT</span>
            </button>

            {/* Sort Dropdown Popover */}
            {showSortMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowSortMenu(false)} />
                <div className="absolute right-0 mt-2 w-52 bg-white border border-[#c3c6d1] rounded-xl shadow-xl z-40 p-2 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                  <button
                    onClick={() => { setSortBy('latest'); setShowSortMenu(false); }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center justify-between ${
                      sortBy === 'latest' ? 'bg-[#001e40] text-white' : 'hover:bg-[#f0f3ff] text-[#111c2d]'
                    }`}
                  >
                    <span>Newest First</span>
                    {sortBy === 'latest' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => { setSortBy('urgent_first'); setShowSortMenu(false); }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center justify-between ${
                      sortBy === 'urgent_first' ? 'bg-[#001e40] text-white' : 'hover:bg-[#f0f3ff] text-[#111c2d]'
                    }`}
                  >
                    <span>Urgent Priority</span>
                    {sortBy === 'urgent_first' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => { setSortBy('status'); setShowSortMenu(false); }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center justify-between ${
                      sortBy === 'status' ? 'bg-[#001e40] text-white' : 'hover:bg-[#f0f3ff] text-[#111c2d]'
                    }`}
                  >
                    <span>By Lifecycle Status</span>
                    {sortBy === 'status' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bento Grid Layout for Dashboard Content matching Image 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Report Cards Grid (Spans 8 columns on large screens) */}
        <div className="lg:col-span-8 space-y-5">
          {filteredReports.length === 0 ? (
            <div className="bg-white border border-[#c3c6d1] rounded-xl p-12 text-center">
              <p className="text-base font-semibold text-[#001e40]">No maintenance reports match your filter.</p>
              <p className="text-xs text-[#737780] mt-1">Try resetting the filter criteria or create a new report.</p>
              <button
                onClick={() => { setFilterCategory('all'); setFilterStatus('all'); setFilterSeverity('all'); setSearchFilter(''); }}
                className="mt-4 px-4 py-2 bg-[#001e40] text-white text-xs font-bold rounded-lg hover:bg-[#003366]"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            filteredReports.map((report) => {
              const isUrgent = report.severity === 'urgent';
              return (
                <div
                  key={report.id}
                  id={`report-card-${report.id}`}
                  className="bg-white border border-[#d8e3fb] hover:border-[#c3c6d1] rounded-xl p-5 shadow-xs hover:shadow-md transition-all group"
                >
                  <div className="flex flex-col md:flex-row gap-5">
                    {/* Media / Photo Thumbnail */}
                    <div className="w-full md:w-44 md:h-44 aspect-video md:aspect-square rounded-lg overflow-hidden relative flex-shrink-0 bg-[#dee8ff]">
                      {report.imageUrl ? (
                        <img
                          src={report.imageUrl}
                          alt={report.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#737780]">
                          <Wrench className="w-8 h-8 opacity-40" />
                        </div>
                      )}

                      {/* Urgency Badge */}
                      <div className="absolute top-2 left-2">
                        {isUrgent ? (
                          <div className="bg-[#ffdad6] text-[#ba1a1a] border border-[#ffcdd2] px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-xs">
                            <AlertTriangle className="w-3.5 h-3.5 text-[#ba1a1a]" />
                            <span>URGENT</span>
                          </div>
                        ) : (
                          <div className="bg-[#d1e1f4] text-[#556474] border border-[#c3c6d1] px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-xs">
                            <Info className="w-3.5 h-3.5 text-[#50606f]" />
                            <span>ROUTINE</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Report Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-1.5 gap-2">
                          <h3 
                            onClick={() => onSelectReport(report)}
                            className="text-base font-bold text-[#111c2d] group-hover:text-[#001e40] cursor-pointer transition-colors"
                          >
                            {report.title}
                          </h3>
                          <span className="text-xs text-[#43474f] font-medium whitespace-nowrap">
                            {report.timeAgo}
                          </span>
                        </div>

                        <p className="text-xs text-[#43474f] mb-3 line-clamp-2 leading-relaxed">
                          {report.description}
                        </p>

                        <div className="flex items-center gap-1.5 text-xs text-[#43474f] mb-3">
                          <MapPin className="w-4 h-4 text-[#737780] flex-shrink-0" />
                          <span className="font-medium">{report.location}</span>
                        </div>
                      </div>

                      {/* Action Bar / Status Dropdown */}
                      <div className="pt-3 border-t border-[#c3c6d1] flex items-center justify-between gap-3">
                        {/* Interactive Status Selector */}
                        <div className="relative inline-block text-left">
                          <select
                            value={report.status}
                            onChange={(e) => onUpdateStatus(report.id, e.target.value as ReportStatus)}
                            className={`appearance-none text-xs font-semibold py-1.5 pl-3 pr-8 rounded-lg border outline-none cursor-pointer transition-colors ${
                              report.status === 'resolved'
                                ? 'bg-[#e8f5e9] text-[#2e7d32] border-[#a5d6a7]'
                                : report.status === 'in_progress'
                                ? 'bg-[#d8e3fb] text-[#001e40] border-[#c3c6d1]'
                                : 'bg-[#fff9c4] text-[#b78103] border-[#ffe082]'
                            }`}
                          >
                            <option value="pending">Status: Pending</option>
                            <option value="in_progress">Status: In Progress</option>
                            <option value="resolved">Status: Resolved</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#43474f]">
                            <ChevronDown className="w-3.5 h-3.5" />
                          </div>
                        </div>

                        {/* View Details Button */}
                        <button
                          onClick={() => onSelectReport(report)}
                          className="text-[#001e40] hover:text-[#003366] text-xs font-bold tracking-wider uppercase flex items-center gap-1 transition-colors group/btn cursor-pointer"
                        >
                          <span>VIEW DETAILS</span>
                          <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Analytics & Activity (Spans 4 columns on large screens) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Daily Overview Card */}
          <div className="bg-white border border-[#d8e3fb] rounded-xl p-5 shadow-xs">
            <h4 className="text-base font-bold text-[#111c2d] mb-4 pb-2 border-b border-[#c3c6d1]">
              Daily Overview
            </h4>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[#e7eeff] p-3.5 rounded-lg border border-[#dee8ff]">
                <div className="text-[10px] font-bold text-[#43474f] uppercase tracking-wider mb-1">
                  NEW REPORTS
                </div>
                <div className="text-3xl font-bold text-[#001e40] leading-none">
                  {newReportsCount < 10 ? `0${newReportsCount}` : newReportsCount}
                </div>
              </div>

              <div className="bg-[#e7eeff] p-3.5 rounded-lg border border-[#dee8ff]">
                <div className="text-[10px] font-bold text-[#43474f] uppercase tracking-wider mb-1">
                  RESOLVED
                </div>
                <div className="text-3xl font-bold text-[#001e40] leading-none">
                  {resolvedCount < 10 ? `0${resolvedCount}` : resolvedCount}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-[#43474f]">Resolution Rate</span>
              <span className="text-xs font-bold text-[#001e40]">{resolutionRate}%</span>
            </div>

            {/* Resolution Progress Bar */}
            <div className="w-full bg-[#dee8ff] rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-[#001e40] h-2 rounded-full transition-all duration-500"
                style={{ width: `${resolutionRate}%` }}
              />
            </div>
          </div>

          {/* Live Activity Feed Card matching Image 5 */}
          <div className="bg-white border border-[#d8e3fb] rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#c3c6d1]">
              <h4 className="text-base font-bold text-[#111c2d]">Live Activity</h4>
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#001e40] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#001e40]"></span>
              </span>
            </div>

            <ul className="space-y-4">
              {activities.slice(0, 4).map((activity) => (
                <li key={activity.id} className="flex items-start gap-3 text-xs">
                  <div className="w-7 h-7 rounded-full bg-[#dee8ff] flex items-center justify-center flex-shrink-0 text-[#001e40] mt-0.5">
                    {activity.iconType === 'check_circle' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2e7d32]" />
                    ) : activity.iconType === 'engineering' ? (
                      <Wrench className="w-3.5 h-3.5 text-[#001e40]" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-[#ba1a1a]" />
                    )}
                  </div>
                  <div>
                    <p className="text-[#111c2d] leading-snug">
                      <span className="font-semibold">{activity.title}</span>
                    </p>
                    <p className="text-[10px] font-bold text-[#737780] uppercase tracking-wider mt-1">
                      {activity.timestamp}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <button
              onClick={() => setShowFullLogModal(true)}
              className="w-full mt-5 py-2 border border-[#737780] text-[#43474f] hover:text-[#001e40] rounded-lg text-xs font-bold tracking-wider uppercase hover:bg-[#dee8ff] transition-colors cursor-pointer"
            >
              VIEW FULL LOG
            </button>
          </div>
        </div>
      </div>

      {/* Full Log History Modal */}
      {showFullLogModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 border border-[#c3c6d1] shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#c3c6d1]">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#ba1a1a] animate-pulse" />
                <h3 className="text-lg font-bold text-[#001e40]">UIET Maintenance Telemetry Log</h3>
              </div>
              <button
                onClick={() => setShowFullLogModal(false)}
                className="text-[#737780] hover:text-[#111c2d] text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar my-4 space-y-3">
              {activities.map((act) => (
                <div key={act.id} className="p-3 bg-[#f0f3ff] rounded-lg border border-[#dee8ff]">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-xs text-[#001e40]">{act.title}</p>
                    <span className="text-[10px] font-bold text-[#737780] uppercase">{act.timestamp}</span>
                  </div>
                  <p className="text-xs text-[#43474f] mt-1">{act.description}</p>
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-[#737780]">
                    <span>📍 {act.location}</span>
                    {act.actor && <span>👤 Operator: {act.actor}</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#c3c6d1] flex justify-end">
              <button
                onClick={() => setShowFullLogModal(false)}
                className="px-4 py-2 bg-[#001e40] text-white text-xs font-bold rounded-lg hover:bg-[#003366]"
              >
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
