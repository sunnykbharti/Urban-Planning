import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { BarChart3, TrendingUp, Clock, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { MaintenanceReport } from '../types';

interface AnalyticsViewProps {
  reports: MaintenanceReport[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ reports }) => {
  const categoryData = [
    { name: 'Infrastructure', count: 38, urgent: 8, fill: '#001e40' },
    { name: 'Plumbing', count: 24, urgent: 4, fill: '#003366' },
    { name: 'Electrical', count: 22, urgent: 5, fill: '#3a5f94' },
    { name: 'Waterlogging', count: 18, urgent: 6, fill: '#799dd6' },
    { name: 'HVAC', count: 12, urgent: 2, fill: '#50606f' },
    { name: 'Safety / Glass', count: 10, urgent: 3, fill: '#ba1a1a' }
  ];

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
    { block: 'Block 1 (CSE/IT)', reports: 28, avgHours: 3.2 },
    { block: 'Block 2 (ME/Civil)', reports: 34, avgHours: 4.8 },
    { block: 'Central Library', reports: 22, avgHours: 2.1 },
    { block: 'Science Block B', reports: 19, avgHours: 3.6 },
    { block: 'Hostels (Dorm 4-5)', reports: 31, avgHours: 5.1 },
    { block: 'Mechanical Workshop', reports: 15, avgHours: 2.9 }
  ];

  const COLORS = ['#001e40', '#003366', '#3a5f94', '#799dd6', '#ba1a1a', '#50606f'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#c3c6d1] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#001e40]" />
            <h1 className="text-2xl md:text-3xl font-bold text-[#111c2d] tracking-tight">
              Campus Infrastructure Analytics
            </h1>
          </div>
          <p className="text-sm md:text-base text-[#43474f] mt-1">
            Service Level Agreements (SLA), resolution velocity, and spatial incident heat analysis for UIET.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#c3c6d1] text-xs font-semibold text-[#001e40]">
          <span>Reporting Period: Aug 2026</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#c3c6d1] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#737780] font-bold uppercase mb-2">
            <span>Avg Triage Time</span>
            <Clock className="w-4 h-4 text-[#003366]" />
          </div>
          <p className="text-2xl font-bold text-[#001e40]">42 Mins</p>
          <span className="text-[11px] text-[#2e7d32] font-semibold">↓ 14% faster than last month</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#c3c6d1] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#737780] font-bold uppercase mb-2">
            <span>SLA Compliance</span>
            <ShieldCheck className="w-4 h-4 text-[#2e7d32]" />
          </div>
          <p className="text-2xl font-bold text-[#001e40]">94.2%</p>
          <span className="text-[11px] text-[#2e7d32] font-semibold">Target: 90% reached</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#c3c6d1] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#737780] font-bold uppercase mb-2">
            <span>Active Dispatch Teams</span>
            <CheckCircle2 className="w-4 h-4 text-[#001e40]" />
          </div>
          <p className="text-2xl font-bold text-[#001e40]">5 Crews</p>
          <span className="text-[11px] text-[#43474f]">12 Technicians on duty</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#c3c6d1] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#737780] font-bold uppercase mb-2">
            <span>Urgent Resolution Speed</span>
            <AlertTriangle className="w-4 h-4 text-[#ba1a1a]" />
          </div>
          <p className="text-2xl font-bold text-[#ba1a1a]">2.4 Hours</p>
          <span className="text-[11px] text-[#737780]">Average closure time</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Weekly Inflow vs Resolution */}
        <div className="bg-white p-5 rounded-xl border border-[#c3c6d1] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#e7eeff] pb-2">
            <h3 className="text-sm font-bold text-[#001e40] uppercase tracking-wider">
              Weekly Report Velocity &amp; Resolution
            </h3>
            <span className="text-xs text-[#737780]">Daily Count</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f3ff" />
                <XAxis dataKey="day" stroke="#737780" fontSize={12} />
                <YAxis stroke="#737780" fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="reported" name="New Reports Filed" stroke="#001e40" strokeWidth={2.5} />
                <Line type="monotone" dataKey="resolved" name="Resolved &amp; Closed" stroke="#2e7d32" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-[#c3c6d1] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#e7eeff] pb-2">
            <h3 className="text-sm font-bold text-[#001e40] uppercase tracking-wider">
              Issue Volume by Maintenance Category
            </h3>
            <span className="text-xs text-[#737780]">Total vs Urgent</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f3ff" />
                <XAxis dataKey="name" stroke="#737780" fontSize={11} interval={0} angle={-15} textAnchor="end" height={45} />
                <YAxis stroke="#737780" fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Total Volume" fill="#001e40" radius={[4, 4, 0, 0]} />
                <Bar dataKey="urgent" name="Urgent Hazards" fill="#ba1a1a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Block Incident Density */}
        <div className="bg-white p-5 rounded-xl border border-[#c3c6d1] shadow-xs space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[#e7eeff] pb-2">
            <h3 className="text-sm font-bold text-[#001e40] uppercase tracking-wider">
              UIET Campus Zone Repair Load &amp; Avg Resolution Duration
            </h3>
            <span className="text-xs text-[#737780]">Hours to Close</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={blockPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f3ff" />
                <XAxis type="number" stroke="#737780" fontSize={12} />
                <YAxis dataKey="block" type="category" stroke="#737780" fontSize={11} width={150} />
                <Tooltip />
                <Legend />
                <Bar dataKey="reports" name="Total Reports" fill="#3a5f94" radius={[0, 4, 4, 0]} />
                <Bar dataKey="avgHours" name="Avg Resolution Time (Hours)" fill="#003366" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
