import React, { useState } from 'react';
import { 
  ThumbsUp, 
  MessageSquare, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Plus,
  Share2,
  ChevronRight
} from 'lucide-react';
import { MaintenanceReport } from '../types';

interface LiveFeedViewProps {
  reports: MaintenanceReport[];
  onSelectReport: (report: MaintenanceReport) => void;
  onOpenReportDrawer: () => void;
}

export const LiveFeedView: React.FC<LiveFeedViewProps> = ({
  reports,
  onSelectReport,
  onOpenReportDrawer
}) => {
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const toggleUpvote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUpvotedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = reports.filter(r => {
    if (categoryFilter === 'all') return true;
    return r.category === categoryFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#c3c6d1] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ba1a1a] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ba1a1a]"></span>
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-[#111c2d] tracking-tight">
              Campus Live Incident Feed
            </h1>
          </div>
          <p className="text-sm md:text-base text-[#43474f] mt-1">
            Real-time citizen reports and ongoing maintenance operations across UIET.
          </p>
        </div>

        <button
          onClick={onOpenReportDrawer}
          className="px-4 py-2.5 bg-[#001e40] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#003366] flex items-center gap-2 self-start md:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" /> Post New Report
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
        {['all', 'infrastructure', 'plumbing', 'electrical', 'waterlogging', 'safety'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              categoryFilter === cat
                ? 'bg-[#001e40] text-white'
                : 'bg-white border border-[#c3c6d1] text-[#43474f] hover:bg-[#dee8ff]'
            }`}
          >
            {cat === 'all' ? 'All Live Reports' : cat}
          </button>
        ))}
      </div>

      {/* Live Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((report) => {
          const isUrgent = report.severity === 'urgent';
          const isUpvoted = upvotedIds.has(report.id);
          const upvoteCount = (isUpvoted ? 1 : 0) + (isUrgent ? 14 : 5);

          return (
            <div
              key={report.id}
              onClick={() => onSelectReport(report)}
              className="bg-white rounded-xl border border-[#d8e3fb] hover:border-[#c3c6d1] shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col cursor-pointer group"
            >
              {/* Media Header */}
              <div className="relative h-44 bg-[#dee8ff] overflow-hidden">
                {report.imageUrl ? (
                  <img
                    src={report.imageUrl}
                    alt={report.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#737780]">
                    <Clock className="w-8 h-8 opacity-40" />
                  </div>
                )}
                
                {/* Status and Severity Badges */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  {isUrgent ? (
                    <span className="bg-[#ffdad6] text-[#ba1a1a] border border-[#ffcdd2] text-[10px] font-bold px-2 py-0.5 rounded shadow-xs uppercase flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> URGENT
                    </span>
                  ) : (
                    <span className="bg-[#d1e1f4] text-[#556474] text-[10px] font-bold px-2 py-0.5 rounded shadow-xs uppercase">
                      ROUTINE
                    </span>
                  )}
                </div>

                <div className="absolute top-2 right-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-xs uppercase ${
                    report.status === 'resolved'
                      ? 'bg-[#e8f5e9] text-[#2e7d32]'
                      : report.status === 'in_progress'
                      ? 'bg-[#d8e3fb] text-[#001e40]'
                      : 'bg-[#fff9c4] text-[#b78103]'
                  }`}>
                    {report.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Feed Card Content */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-[#737780] mb-1">
                    <span className="font-semibold text-[#001e40]">{report.reportedBy.name}</span>
                    <span>{report.timeAgo}</span>
                  </div>

                  <h3 className="text-sm font-bold text-[#111c2d] group-hover:text-[#001e40] transition-colors line-clamp-1 mb-1.5">
                    {report.title}
                  </h3>

                  <p className="text-xs text-[#43474f] line-clamp-2 leading-relaxed mb-3">
                    {report.description}
                  </p>

                  <div className="flex items-center gap-1 text-xs text-[#50606f]">
                    <MapPin className="w-3.5 h-3.5 text-[#737780] flex-shrink-0" />
                    <span className="truncate">{report.location}</span>
                  </div>
                </div>

                {/* Card Social & Status Footer */}
                <div className="mt-4 pt-3 border-t border-[#e7eeff] flex items-center justify-between text-xs text-[#43474f]">
                  <button
                    onClick={(e) => toggleUpvote(report.id, e)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
                      isUpvoted
                        ? 'bg-[#dee8ff] text-[#001e40] font-bold'
                        : 'hover:bg-[#f0f3ff] text-[#50606f]'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-current' : ''}`} />
                    <span>{upvoteCount} Confirmations</span>
                  </button>

                  <span className="text-[11px] font-bold text-[#001e40] flex items-center group-hover:underline">
                    Details <ChevronRight className="w-3 h-3 ml-0.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
