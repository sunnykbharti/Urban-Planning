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
      {/* Header & Quick Stats Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200">
              OpenStreetMap &bull; Leaflet Engine
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs font-semibold text-slate-600">
              Chhatrapati Shahu Ji Maharaj University, Kanpur
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[#001e40] tracking-tight">
            CSJMU Campus Geographic Map &amp; Complaint Triage
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl mt-1 leading-relaxed">
            Real-time geospatial mapping of CSJMU academic blocks, hostels, and pathways. Markers are color-coded in 
            <strong className="text-red-700"> Red (Urgent)</strong>, 
            <strong className="text-amber-700"> Yellow (Normal)</strong>, and 
            <strong className="text-emerald-700"> Green (Low/Resolved)</strong> based on complaint severity.
          </p>
        </div>

        {/* Quick KPI Stat Cards */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Total Reports */}
          <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3 min-w-[130px]">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Total Logged</p>
              <p className="text-lg font-black text-slate-800 leading-tight">{totalCount}</p>
            </div>
          </div>

          {/* Red Urgent */}
          <div className="bg-white px-4 py-3 rounded-xl border border-red-200 shadow-xs flex items-center gap-3 min-w-[130px] bg-red-50/20">
            <div className="p-2 bg-red-100 text-red-700 rounded-lg animate-pulse">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-red-700">Red (Urgent)</p>
              <p className="text-lg font-black text-red-700 leading-tight">{redCount}</p>
            </div>
          </div>

          {/* Yellow Normal */}
          <div className="bg-white px-4 py-3 rounded-xl border border-amber-200 shadow-xs flex items-center gap-3 min-w-[130px] bg-amber-50/20">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-amber-800">Yellow (Active)</p>
              <p className="text-lg font-black text-amber-800 leading-tight">{yellowCount}</p>
            </div>
          </div>

          {/* Green Resolved/Low */}
          <div className="bg-white px-4 py-3 rounded-xl border border-emerald-200 shadow-xs flex items-center gap-3 min-w-[130px] bg-emerald-50/20">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-emerald-700">Green (Safe)</p>
              <p className="text-lg font-black text-emerald-700 leading-tight">{greenCount}</p>
            </div>
          </div>
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
        title="CSJMU Kanpur Master Infrastructure & Incident Map"
        subtitle="Zoom, pan, inspect complaint pins, or click anywhere on campus to file a new report."
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
