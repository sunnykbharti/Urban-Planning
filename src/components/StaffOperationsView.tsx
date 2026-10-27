import React, { useState } from 'react';
import { 
  MaintenanceReport, 
  UserRole,
  ReportStatus 
} from '../types';
import { 
  Video, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  AlertOctagon,
  RefreshCw, 
  Search, 
  HardHat, 
  Calendar, 
  ShieldCheck, 
  Eye, 
  Filter, 
  MapPin, 
  ChevronRight,
  ExternalLink,
  Activity
} from 'lucide-react';
import { getSeverityBadge } from './StudentDashboard';

interface StaffOperationsViewProps {
  reports: MaintenanceReport[];
  onSelectReport: (report: MaintenanceReport) => void;
  onUpdateStatus: (reportId: string, newStatus: ReportStatus, note?: string) => void;
  onNavigateToTab: (tab: any) => void;
}

export interface CameraFeedInfo {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline';
  lastCaptureTime: string;
  fps: number;
  totalDetectionsToday: number;
  ip: string;
}

export interface SweepSchedule {
  id: string;
  label: string;
  scheduledTime: string;
  status: 'completed' | 'in_progress' | 'scheduled';
  summary: string;
  inspectedPoints: number;
}

export const StaffOperationsView: React.FC<StaffOperationsViewProps> = ({
  reports,
  onSelectReport,
  onUpdateStatus,
  onNavigateToTab
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'cameras' | 'sweeps'>('queue');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 5 verified CCTV cameras on campus
  const cameras: CameraFeedInfo[] = [
    {
      id: 'CAM-01',
      name: 'UIET Block 1 Entrance & Quad',
      location: 'Block 1 North Pedestrian Walkway',
      status: 'online',
      lastCaptureTime: 'Just now (12s ago)',
      fps: 15,
      totalDetectionsToday: 4,
      ip: '10.20.14.101'
    },
    {
      id: 'CAM-02',
      name: 'Central Library Lawn & Portico',
      location: 'Dr. B.R. Ambedkar Library Grounds',
      status: 'online',
      lastCaptureTime: '1 min ago',
      fps: 15,
      totalDetectionsToday: 6,
      ip: '10.20.14.102'
    },
    {
      id: 'CAM-03',
      name: 'Student Cafeteria & Concourse',
      location: 'Central Canteen Perimeter Road',
      status: 'online',
      lastCaptureTime: 'Just now (45s ago)',
      fps: 15,
      totalDetectionsToday: 9,
      ip: '10.20.14.103'
    },
    {
      id: 'CAM-04',
      name: 'Central Mechanical Workshop Bay',
      location: 'Workshop Rear Loading Dock',
      status: 'online',
      lastCaptureTime: '3 mins ago',
      fps: 12,
      totalDetectionsToday: 2,
      ip: '10.20.14.104'
    },
    {
      id: 'CAM-05',
      name: 'Hostel Complex Perimeter (GT Road)',
      location: 'Boys & Girls Hostel Access Corridor',
      status: 'online',
      lastCaptureTime: '2 mins ago',
      fps: 15,
      totalDetectionsToday: 3,
      ip: '10.20.14.105'
    }
  ];

  // Today's 4 Operations Sweep Schedules
  const sweeps: SweepSchedule[] = [
    {
      id: 'SWP-01',
      label: 'Morning Shift Inspection',
      scheduledTime: '08:00 AM',
      status: 'completed',
      summary: '14 waste bins cleared across UIET Block 1 & 2. 2 pavement potholes logged.',
      inspectedPoints: 18
    },
    {
      id: 'SWP-02',
      label: 'Midday Post-Lunch Patrol',
      scheduledTime: '11:30 AM',
      status: 'completed',
      summary: 'High cafeteria litter surge cleared. Solid waste bin spillage addressed at Beat 01.',
      inspectedPoints: 22
    },
    {
      id: 'SWP-03',
      label: 'Afternoon Campus Sweep',
      scheduledTime: '02:30 PM',
      status: 'in_progress',
      summary: 'Field crew currently inspecting Central Library Quad and Workshop loading bays.',
      inspectedPoints: 12
    },
    {
      id: 'SWP-04',
      label: 'Evening Grounds Closure',
      scheduledTime: '05:30 PM',
      status: 'scheduled',
      summary: 'Scheduled inspection of Sports Stadium spectator stands and hostel gates.',
      inspectedPoints: 16
    }
  ];

  // Filtered staff ticket queue
  const queueReports = reports.filter(r => {
    if (statusFilter === 'pending' && r.status !== 'pending') return false;
    if (statusFilter === 'in_progress' && r.status !== 'in_progress') return false;
    if (statusFilter === 'resolved' && r.status !== 'resolved') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = (r.ticketNumber || r.id)?.toLowerCase().includes(q) ||
                    r.title?.toLowerCase().includes(q) ||
                    r.location?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Estate &amp; Sanitation Operations Console
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
              UIET Precinct
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time management of automated camera telemetry, daily scheduled sweeps, and field remediation queue.
          </p>
        </div>

        {/* View Toggle Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md text-xs">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1 rounded font-semibold transition-colors ${
              activeTab === 'queue' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ticket Queue ({queueReports.length})
          </button>
          <button
            onClick={() => setActiveTab('cameras')}
            className={`px-3 py-1 rounded font-semibold transition-colors ${
              activeTab === 'cameras' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cameras ({cameras.length})
          </button>
          <button
            onClick={() => setActiveTab('sweeps')}
            className={`px-3 py-1 rounded font-semibold transition-colors ${
              activeTab === 'sweeps' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daily Sweeps (4)
          </button>
        </div>
      </div>

      {/* VIEW 1: TICKET TRIAGE QUEUE */}
      {activeTab === 'queue' && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
          {/* Queue Filters */}
          <div className="p-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Filter Status:</span>
              <div className="flex items-center gap-1 text-[11px]">
                {(['all', 'pending', 'in_progress', 'resolved'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2 py-0.5 rounded capitalize font-medium ${
                      statusFilter === s ? 'bg-white text-slate-900 border border-slate-300 shadow-2xs font-bold' : 'text-slate-600 hover:bg-slate-200/60'
                    }`}
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket ID or zone..."
                className="pl-8 pr-3 py-1 text-xs rounded border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:border-blue-600 w-full sm:w-56"
              />
            </div>
          </div>

          {/* Scannable Operations Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100 text-slate-600 uppercase font-semibold text-[10px]">
                  <th className="py-2.5 px-3">Ticket ID</th>
                  <th className="py-2.5 px-3">Title &amp; Zone</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Source</th>
                  <th className="py-2.5 px-3">Assigned Team</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queueReports.map((report) => {
                  const sev = getSeverityBadge(report.severity);
                  const SevIcon = sev.Icon;
                  const isCctv = report.source?.type === 'CCTV_FIXED' || report.reportedBy?.role?.includes('cctv');

                  return (
                    <tr 
                      key={report.id} 
                      onClick={() => onSelectReport(report)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-700 whitespace-nowrap">
                        {report.ticketNumber || report.id}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-900 block truncate max-w-xs">{report.title}</span>
                        <span className="text-[11px] text-slate-500 block truncate max-w-xs">{report.location}</span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${sev.className}`}>
                          <SevIcon className="w-3 h-3" />
                          <span>{sev.label}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-[11px] text-slate-600">
                        {isCctv ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                            <Video className="w-3 h-3 text-slate-500" />
                            {report.source?.sensorId || 'Cam 04'}
                          </span>
                        ) : (
                          <span>Citizen</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-600 whitespace-nowrap">
                        {typeof report.assignedTeam === 'object' ? report.assignedTeam?.name : (report.assignedTeam || 'Sanitation Beat 01')}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                          report.status === 'resolved' 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : 'bg-amber-50 text-amber-900 border-amber-200'
                        }`}>
                          {report.status === 'resolved' ? 'Resolved' : 'Active'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectReport(report);
                          }}
                          className="text-blue-700 hover:text-blue-900 font-semibold text-[11px] hover:underline"
                        >
                          Triage &rarr;
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: CCTV CAMERA TELEMETRY & LAST CAPTURE TIMES */}
      {activeTab === 'cameras' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {cameras.map((cam) => (
              <div 
                key={cam.id} 
                className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-slate-900 text-xs">{cam.id}</span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-semibold">
                    Online • {cam.fps} FPS
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-slate-800">{cam.name}</h3>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{cam.location}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                  <span>Last Capture: <b className="text-slate-800 font-mono">{cam.lastCaptureTime}</b></span>
                  <span>Detections: <b className="text-blue-700 font-mono">{cam.totalDetectionsToday}</b></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: DAILY 4-SWEEP SCHEDULES & PROGRESS */}
      {activeTab === 'sweeps' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sweeps.map((swp) => (
              <div 
                key={swp.id} 
                className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {swp.scheduledTime}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                    swp.status === 'completed' 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                      : swp.status === 'in_progress'
                      ? 'bg-blue-50 text-blue-800 border-blue-200 animate-pulse'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {swp.status === 'completed' ? 'Completed' : swp.status === 'in_progress' ? 'In Progress' : 'Scheduled'}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-slate-900">{swp.label}</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">{swp.summary}</p>

                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-medium flex items-center justify-between">
                  <span>Inspected Points: <b className="text-slate-800 font-mono">{swp.inspectedPoints} locations</b></span>
                  <span className="text-slate-400">CSJMU Estate Protocol</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
