import React, { useState } from 'react';
import { 
  Building, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Plus, 
  Compass, 
  Layers, 
  Flame, 
  ShieldCheck, 
  Search,
  Filter,
  Info
} from 'lucide-react';
import { MaintenanceReport, CampusBlock, UserRole } from '../types';
import { LeafletCampusMap } from './LeafletCampusMap';
import { getReportSeverityColor } from '../data/csjmuGeoData';

interface CampusMapProps {
  reports: MaintenanceReport[];
  blocks: CampusBlock[];
  onSelectReport: (report: MaintenanceReport) => void;
  onOpenReportDrawerWithLocation?: (locationName: string, coords: { x: number; y: number }, gps?: { latitude: number; longitude: number }) => void;
  userRole?: UserRole;
}

export const CampusMap: React.FC<CampusMapProps> = ({
  reports,
  blocks,
  onSelectReport,
  onOpenReportDrawerWithLocation,
  userRole = 'student'
}) => {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // Statistics calculation
  const totalCount = reports.length;
  const redCount = reports.filter(r => getReportSeverityColor(r) === 'red').length;
  const yellowCount = reports.filter(r => getReportSeverityColor(r) === 'yellow').length;
  const greenCount = reports.filter(r => getReportSeverityColor(r) === 'green').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-slate-500">
              Chhatrapati Shahu Ji Maharaj University (UIET campus area)
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-semibold text-slate-900">
            Campus map
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Map of campus zones, waste hotspots, and active work orders.
          </p>
        </div>
      </div>

      {/* Main Interactive Leaflet Map */}
      <LeafletCampusMap
        reports={reports}
        blocks={blocks}
        onSelectReport={onSelectReport}
        onOpenReportDrawerWithLocation={onOpenReportDrawerWithLocation}
        userRole={userRole}
        compact={false}
        height="640px"
        title="Campus map"
        subtitle="Open incidents and cameras"
      />

      {/* Campus Blocks Quick Summary Strip */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-700" />
            <h3 className="text-sm font-bold text-slate-800">
              CSJMU Key Faculty Blocks &amp; Condition Overview
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {blocks.length} monitored facilities
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {blocks.slice(0, 10).map(block => {
            const hasUrgent = block.urgentCount > 0;
            return (
              <div 
                key={block.id}
                className={`p-2.5 rounded-lg border text-xs transition-all ${
                  hasUrgent 
                    ? 'border-red-200 bg-red-50/30' 
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800 truncate" title={block.name}>
                    {block.shortCode || block.name}
                  </span>
                  {hasUrgent && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  )}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{block.activeReportsCount} issues</span>
                  <span className={`font-semibold ${
                    block.condition === 'Good' ? 'text-emerald-700' : hasUrgent ? 'text-red-700' : 'text-amber-700'
                  }`}>
                    {block.condition}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
