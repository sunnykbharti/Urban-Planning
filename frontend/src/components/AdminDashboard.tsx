import React, { useState } from 'react';
import { 
  MaintenanceReport, 
  CampusBlock, 
  ActivityEvent,
  ReportStatus 
} from '../types';
import { 
  Building2, 
  Flame, 
  Layers, 
  Wrench, 
  BarChart3, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Download, 
  Send, 
  Radio, 
  Compass, 
  Plus, 
  ArrowRight,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Cpu
} from 'lucide-react';

interface AdminDashboardProps {
  reports: MaintenanceReport[];
  blocks: CampusBlock[];
  activities: ActivityEvent[];
  onOpenReportDrawer: () => void;
  onSelectReport: (report: MaintenanceReport) => void;
  onNavigateToTab: (tab: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  reports,
  blocks,
  activities,
  onOpenReportDrawer,
  onSelectReport,
  onNavigateToTab
}) => {
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const totalReports = reports.length;
  const resolvedReports = reports.filter(r => r.status === 'resolved').length;
  const urgentReports = reports.filter(r => r.severity === 'urgent' && r.status !== 'resolved').length;
  const inProgressReports = reports.filter(r => r.status === 'in_progress').length;
  const complianceRate = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 94;

  const handleExportReport = () => {
    setExportNotice('Exporting CSJMU-Municipal-Operations-Audit.pdf...');
    setTimeout(() => {
      setExportNotice('Report successfully generated & downloaded!');
      setTimeout(() => setExportNotice(null), 3000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Admin Executive Header */}
      <div className="rounded-2xl bg-gradient-to-r from-[#001e40] via-[#002b5c] to-[#0a4074] text-white p-6 md:p-8 shadow-xl relative overflow-hidden border border-slate-700">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400/15 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-300" />
                <span>CSJMU ESTATE &amp; WORKS DIRECTORATE</span>
              </span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-semibold">
                ARE 5-Stage Autonomous Engine: ACTIVE
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Campus Urban Planning &amp; Operations Command
            </h1>

            <p className="text-blue-100/80 text-xs md:text-sm leading-relaxed">
              Supervising institutional infrastructure, municipal ward coordination (Ward 42), automated CV detection feeds, 
              and campus microclimate thermal resilience planning.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-blue-200">
              <span>Chief Town Planner: <strong className="text-white">Er. R. K. Agrawal</strong></span>
              <span>&bull;</span>
              <span>Division: <strong className="text-white">UIET Campus Planning &amp; Maintenance</strong></span>
              <span>&bull;</span>
              <span>Municipal Liaison: <strong className="text-white">Kanpur Nagar Nigam Zone 6</strong></span>
            </div>
          </div>

          {/* Executive Quick Actions */}
          <div className="flex flex-wrap lg:flex-col gap-2.5 flex-shrink-0">
            <button
              onClick={handleExportReport}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-blue-300" />
              <span>Export Ward Audit PDF</span>
            </button>
            <button
              onClick={() => onNavigateToTab('heatisland')}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Flame className="w-4 h-4 text-amber-200" />
              <span>Open Heat Island Studio</span>
            </button>
            <button
              onClick={() => onNavigateToTab('pipeline')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Layers className="w-4 h-4 text-indigo-200" />
              <span>ARE 5-Stage Pipeline</span>
            </button>
          </div>
        </div>

        {exportNotice && (
          <div className="mt-4 p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{exportNotice}</span>
          </div>
        )}
      </div>

      {/* Macro KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">Total Logged</span>
            <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-800">{totalReports}</h3>
          <p className="text-[11px] text-blue-600 font-semibold mt-0.5">Across 8 campus blocks</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/20 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-red-700">Urgent Hazards</span>
            <span className="p-1.5 bg-red-100 text-red-700 rounded-lg animate-pulse">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-2xl font-black text-red-700">{urgentReports}</h3>
          <p className="text-[11px] text-red-600 font-semibold mt-0.5">Requires immediate squad</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">In Progress Triage</span>
            <span className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-800">{inProgressReports}</h3>
          <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Beat Alpha &amp; Beta</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">SLA Compliance</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-2xl font-black text-emerald-700">94.8%</h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Met 60-min deadline</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">UHI Heat Stress</span>
            <span className="p-1.5 bg-rose-50 text-rose-700 rounded-lg">
              <Flame className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-2xl font-black text-rose-700">+4.8°C</h3>
          <p className="text-[11px] text-rose-600 font-semibold mt-0.5">Peak surface delta</p>
        </div>
      </div>

      {/* Main Split Layout: Campus Facility Condition Matrix & Live Resolution Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Campus Blocks Condition Matrix */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>UIET Campus Facility Condition Matrix</span>
              </h2>
              <p className="text-xs text-slate-500">Spatial health status, active maintenance reports, and risk triage</p>
            </div>
            <button
              onClick={() => onNavigateToTab('map')}
              className="text-xs text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>View On Master Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {blocks.map((block) => (
              <div
                key={block.id}
                onClick={() => onNavigateToTab('map')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-extrabold text-slate-800 group-hover:text-blue-700 transition-colors">
                      {block.name}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      block.condition === 'Good'
                        ? 'bg-emerald-100 text-emerald-800'
                        : block.condition === 'Fair'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {block.condition}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{block.department}</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-600 font-medium">
                      Active: <strong className="text-slate-800">{block.activeReportsCount}</strong>
                    </span>
                    {block.urgentCount > 0 && (
                      <span className="text-red-700 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {block.urgentCount} Urgent
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (1 Col): ARE Automated Resolution Pipeline Stream */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-800">ARE Pipeline Activity</h3>
              </div>
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                LIVE POLLING
              </span>
            </div>

            <div className="mt-3 space-y-3">
              <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs">
                <span className="font-bold text-indigo-900 block mb-1">5-Module Architecture:</span>
                <div className="flex items-center justify-between text-[11px] text-indigo-700 font-medium">
                  <span>1. Detect (CV)</span>
                  <span>&rarr;</span>
                  <span>2. Geotag</span>
                  <span>&rarr;</span>
                  <span>3. ARE</span>
                  <span>&rarr;</span>
                  <span>4. Dispatch</span>
                </div>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {activities.slice(0, 5).map((act) => (
                  <div key={act.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center justify-between text-slate-500 mb-0.5 text-[10px]">
                      <span className="font-bold text-slate-700">{act.type.toUpperCase()}</span>
                      <span>{act.timestamp}</span>
                    </div>
                    <p className="font-semibold text-slate-800 line-clamp-1">{act.title}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{act.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              onClick={() => onNavigateToTab('maintenance')}
              className="w-full py-2.5 px-3 bg-[#001e40] hover:bg-[#003366] text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Wrench className="w-4 h-4" />
              <span>Open Maintenance Matrix &amp; Triage</span>
            </button>
            <button
              onClick={() => onNavigateToTab('analytics')}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Comprehensive Analytics &amp; Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* Urban Climate Interventions Snapshot */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Campus Urban Heat Island &amp; Microclimate Resilience</span>
          </div>
          <h3 className="text-lg font-bold">Planned Interventions: 45 Shade Trees &bull; 800m Cool Pavement Retrofit</h3>
          <p className="text-xs text-emerald-200/80">
            Mitigate high surface temperatures (+4.8°C) detected at UIET parking lot &amp; Science quadrangle.
          </p>
        </div>

        <button
          onClick={() => onNavigateToTab('heatisland')}
          className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-2 flex-shrink-0 transition-colors cursor-pointer shadow-xs"
        >
          <span>Launch Heat Studio</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
