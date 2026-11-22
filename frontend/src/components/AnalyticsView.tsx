import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { Clock, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { MaintenanceReport } from '../types';

interface AnalyticsViewProps {
  reports: MaintenanceReport[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ reports }) => {
  const [reportingPeriod, setReportingPeriod] = useState<string>('current_month');

  // Horizontal bar data for categories
  const categoryData = [
    { name: 'Infrastructure', total: 38, urgent: 8 },
    { name: 'Plumbing', total: 24, urgent: 4 },
    { name: 'Electrical', total: 22, urgent: 5 },
    { name: 'Waterlogging', total: 18, urgent: 6 },
    { name: 'HVAC', total: 12, urgent: 2 },
    { name: 'Safety & glass', total: 10, urgent: 3 }
  ];

  // Daily trend with straight segments (no curve smoothing)
  const weeklyTrendData = [
    { day: 'Mon', reported: 14, resolved: 11 },
    { day: 'Tue', reported: 18, resolved: 15 },
    { day: 'Wed', reported: 22, resolved: 19 },
    { day: 'Thu', reported: 16, resolved: 14 },
    { day: 'Fri', reported: 25, resolved: 21 },
    { day: 'Sat', reported: 9, resolved: 12 },
    { day: 'Sun', reported: 6, resolved: 8 }
  ];

  const blockPerformance = [
    { block: 'UIET Block 1', reports: 28, avgHours: 3.2 },
    { block: 'UIET Block 2', reports: 34, avgHours: 4.8 },
    { block: 'Central Library', reports: 22, avgHours: 2.1 },
    { block: 'Science Block B', reports: 19, avgHours: 3.6 },
    { block: 'Hostels', reports: 31, avgHours: 5.1 },
    { block: 'Workshop', reports: 15, avgHours: 2.9 }
  ];

  // Target evaluations: only flag red when breaching target
  const avgTriageMins = 42;
  const triageTargetMins = 60; // 42 < 60 is GOOD (within target, not red)

  const slaCompliance = 94.2;
  const slaTarget = 90.0; // 94.2 >= 90 is GOOD (reaches target, not red)

  const urgentHours = 2.4;
  const urgentTargetHours = 2.0; // 2.4 > 2.0 breaches target -> flag red!

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-[6px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-semibold text-slate-900 leading-tight">
            Waste analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            How fast issues get reported and closed.
          </p>
        </div>

        {/* Real reporting period selector defaulting to current month */}
        <div className="flex items-center gap-2 text-xs">
          <label className="text-slate-500">Period:</label>
          <select
            value={reportingPeriod}
            onChange={(e) => setReportingPeriod(e.target.value)}
            className="px-2.5 py-1 rounded-[6px] border border-slate-200 bg-white text-slate-800 text-xs font-medium cursor-pointer focus:outline-hidden"
          >
            <option value="current_month">Current month (Nov 2026)</option>
            <option value="last_month">Last month (Oct 2026)</option>
            <option value="last_quarter">Last 90 days</option>
            <option value="year_to_date">Year to date</option>
          </select>
        </div>
      </div>

      {/* KPI Cards: Only red when breaching target */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-[6px] border border-slate-200">
          <div className="text-[11px] text-slate-500">Average response time</div>
          <div className="text-lg font-semibold text-slate-900 mt-1">{avgTriageMins} mins</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Target: under {triageTargetMins} mins</div>
        </div>

        <div className="bg-white p-3.5 rounded-[6px] border border-slate-200">
          <div className="text-[11px] text-slate-500">SLA compliance</div>
          <div className="text-lg font-semibold text-slate-900 mt-1">{slaCompliance}%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Target: 90%</div>
        </div>

        <div className="bg-white p-3.5 rounded-[6px] border border-slate-200">
          <div className="text-[11px] text-slate-500">Active duty crews</div>
          <div className="text-lg font-semibold text-slate-900 mt-1">5 crews</div>
          <div className="text-[11px] text-slate-500 mt-0.5">12 personnel on beat</div>
        </div>

        {/* Breaches target (2.4h > 2.0h) -> flags red */}
        <div className="bg-white p-3.5 rounded-[6px] border border-slate-200">
          <div className="text-[11px] text-slate-500">Urgent hazard resolution</div>
          <div className="text-lg font-semibold text-rose-700 mt-1">{urgentHours} hours</div>
          <div className="text-[11px] text-rose-700 font-medium mt-0.5">Breaches 2.0h target by 24m</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Daily inflow vs resolution (straight segments, 2px line, no smoothing) */}
        <div className="bg-white p-4 rounded-[6px] border border-slate-200 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-[14px] font-semibold text-slate-900">
              Daily reports filed and resolved
            </h3>
            <span className="text-[11px] text-slate-400">Past 7 days</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
                {/* Straight segments: type="linear", strokeWidth={2} */}
                <Line type="linear" dataKey="reported" name="New reports" stroke="#475569" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="linear" dataKey="resolved" name="Resolved" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category breakdown (Horizontal bars so category labels aren't rotated; neutral color for total, muted red for urgent) */}
        <div className="bg-white p-4 rounded-[6px] border border-slate-200 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-[14px] font-semibold text-slate-900">
              Volume by maintenance category
            </h3>
            <span className="text-[11px] text-slate-400">Total vs urgent</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} width={95} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
                {/* Neutral color for total, muted red for urgent */}
                <Bar dataKey="total" name="Total volume" fill="#64748b" radius={[0, 3, 3, 0]} />
                <Bar dataKey="urgent" name="Urgent hazards" fill="#dc2626" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Campus area workload */}
        <div className="bg-white p-4 rounded-[6px] border border-slate-200 space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-[14px] font-semibold text-slate-900">
              Campus area workload and average hours to close
            </h3>
            <span className="text-[11px] text-slate-400">By facility</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={blockPerformance} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis dataKey="block" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} width={100} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
                <Bar dataKey="reports" name="Reports count" fill="#64748b" radius={[0, 3, 3, 0]} />
                <Bar dataKey="avgHours" name="Avg hours to close" fill="#334155" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
