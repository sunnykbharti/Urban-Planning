import React, { useState } from 'react';
import { 
  MaintenanceReport, 
  ActivityEvent,
  ReportStatus 
} from '../types';
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  MapPin, 
  Phone, 
  Users, 
  Layers, 
  Scale, 
  ShieldCheck, 
  TrendingUp, 
  FileText, 
  BarChart3, 
  Flame, 
  ArrowRight,
  HardHat,
  ChevronRight,
  Calendar
} from 'lucide-react';

interface ManagementDashboardProps {
  reports: MaintenanceReport[];
  activities: ActivityEvent[];
  onUpdateStatus: (reportId: string, status: ReportStatus, note?: string) => void;
  onSelectReport: (report: MaintenanceReport) => void;
  onNavigateToTab: (tab: any) => void;
}

export const ManagementDashboard: React.FC<ManagementDashboardProps> = ({
  reports,
  activities,
  onUpdateStatus,
  onSelectReport,
  onNavigateToTab
}) => {
  const [filter, setFilter] = useState<'all' | 'urgent' | 'dispatched' | 'resolved'>('all');

  const resolved = reports.filter(r => r.status === 'resolved');
  const dispatched = reports.filter(r => r.status === 'dispatched' || r.status === 'reported');
  const inProgress = reports.filter(r => r.status === 'in_progress');
  const urgent = reports.filter(r => r.severity === 'urgent');

  const complianceRate = resolved.length > 0
    ? Math.round((resolved.filter(r => r.slaMet !== false).length / resolved.length) * 100)
    : 100;

  const totalWasteKg = reports.reduce((acc, r) => {
    return acc + (r.estimatedAmount?.weightKg || 0);
  }, 0);

  const displayedReports = reports.filter(r => {
    if (filter === 'urgent') return r.severity === 'urgent';
    if (filter === 'dispatched') return r.status === 'dispatched' || r.status === 'reported';
    if (filter === 'resolved') return r.status === 'resolved';
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Management Leadership Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-blue-700/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md text-blue-200 border border-white/10">
                <Building2 className="w-3.5 h-3.5 text-blue-300" />
                CSJMU Directorate of Estate &amp; Public Health Engineering
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/20">
                Ward Overseer Terminal
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
              Executive Management &amp; SLA Audit
            </h1>
            <p className="text-xs text-blue-100/80 max-w-2xl leading-relaxed">
              Oversight dashboard for Campus Sanitation Engineers. Monitor BVG contractor SLA performance, desilting operations, and heat island microclimate interventions across all 5 municipal precincts.
            </p>
          </div>

          {/* Management KPI Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/30 backdrop-blur-md p-3.5 rounded-xl border border-white/10">
            <div className="text-center px-2">
              <div className="text-2xl font-black text-blue-300">{complianceRate}%</div>
              <div className="text-[10px] uppercase font-bold text-blue-200/80 tracking-wider">SLA Met</div>
            </div>
            <div className="text-center px-2 border-l border-white/10">
              <div className="text-2xl font-black text-indigo-300">{reports.length}</div>
              <div className="text-[10px] uppercase font-bold text-blue-200/80 tracking-wider">Total Incidents</div>
            </div>
            <div className="text-center px-2 border-l border-white/10">
              <div className="text-2xl font-black text-amber-300">~{Math.round(totalWasteKg)} kg</div>
              <div className="text-[10px] uppercase font-bold text-blue-200/80 tracking-wider">Waste Managed</div>
            </div>
            <div className="text-center px-2 border-l border-white/10">
              <div className="text-2xl font-black text-emerald-400">{resolved.length}</div>
              <div className="text-[10px] uppercase font-bold text-blue-200/80 tracking-wider">Closed Clean</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BVG Contractor Audit Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <HardHat className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">
                BVG Cleaning Agency Performance Scorecard
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Contractor SLA performance audit for CSJMU campus sanitation contract (Q4 2026).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              Contractor Score: A+ (Incentive Eligible)
            </span>
          </div>
        </div>

        {/* Beats Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400">Beat Alpha (UIET &amp; Canteen)</span>
            <div className="text-lg font-black text-slate-800 mt-0.5">Lead: Ramesh Kumar</div>
            <p className="text-[11px] text-slate-500 mt-1">4 Workers • 100% SLA Compliance</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400">Beat 03 (Library &amp; Admin)</span>
            <div className="text-lg font-black text-slate-800 mt-0.5">Lead: Pradeep Tiwari</div>
            <p className="text-[11px] text-slate-500 mt-1">3 Workers • Proactive Patrol</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400">Desilting Squad (Workshop Drains)</span>
            <div className="text-lg font-black text-slate-800 mt-0.5">Lead: Mahesh Chand</div>
            <p className="text-[11px] text-slate-500 mt-1">6 Workers • Tipper Truck Equipped</p>
          </div>
        </div>
      </div>

      {/* 3. Incidents Triage & Resolution Stream */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800">
              Campus Incident Oversight Queue
            </h3>
            <span className="bg-blue-100 text-blue-900 text-xs font-bold px-2 py-0.5 rounded-full">
              {displayedReports.length}
            </span>
          </div>

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
              onClick={() => setFilter('urgent')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                filter === 'urgent' ? 'bg-white text-red-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Urgent ({urgent.length})
            </button>
            <button
              onClick={() => setFilter('dispatched')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                filter === 'dispatched' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dispatched ({dispatched.length})
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                filter === 'resolved' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Resolved ({resolved.length})
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {displayedReports.map((report) => (
            <div 
              key={report.id}
              className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4 min-w-0">
                <div 
                  onClick={() => onSelectReport(report)}
                  className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 cursor-pointer"
                >
                  <img 
                    src={report.beforeImageUrl || report.imageUrl || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=400&q=80'} 
                    alt={report.title} 
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-500">
                      {report.ticketNumber || report.id}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      report.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : report.status === 'in_progress'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-blue-100 text-blue-900'
                    }`}>
                      {report.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h4 
                    onClick={() => onSelectReport(report)}
                    className="text-sm font-bold text-slate-900 hover:text-blue-700 cursor-pointer transition-colors truncate"
                  >
                    {report.title}
                  </h4>

                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {report.location}
                    </span>
                    {report.estimatedAmount && (
                      <span className="font-semibold text-slate-700">
                        Payload: ~{report.estimatedAmount.weightKg} kg ({report.estimatedAmount.volumeM3} m³)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 justify-end">
                <button
                  onClick={() => onSelectReport(report)}
                  className="px-3 py-2 text-xs font-bold border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
                >
                  Audit Details
                </button>
                <button
                  onClick={() => onNavigateToTab('pipeline')}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                >
                  <span>ARE Visualizer</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
