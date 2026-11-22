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
  Activity,
  MoreVertical
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
          <h1 className="text-base sm:text-lg font-semibold text-slate-900">
            Work orders
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage automated camera alerts, daily sweeps, and repair tickets.
          </p>
        </div>

        {/* View Toggle Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-[6px] text-xs">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1 rounded-[6px] font-medium transition-colors ${
              activeTab === 'queue' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ticket queue ({queueReports.length})
          </button>
          <button
            onClick={() => setActiveTab('cameras')}
            className={`px-3 py-1 rounded-[6px] font-medium transition-colors ${
              activeTab === 'cameras' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cameras ({cameras.length})
          </button>
          <button
            onClick={() => setActiveTab('sweeps')}
            className={`px-3 py-1 rounded-[6px] font-medium transition-colors ${
              activeTab === 'sweeps' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daily sweeps (4)
          </button>
        </div>
      </div>

      {/* VIEW 1: TICKET QUEUE */}
      {activeTab === 'queue' && (
        <div className="bg-white border border-slate-200 rounded-[6px] overflow-hidden">
          {/* Queue Filters */}
          <div className="p-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600">Filter status:</span>
              <div className="flex items-center gap-1 text-[11px]">
                {(['all', 'pending', 'in_progress', 'resolved'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2 py-0.5 rounded-[6px] capitalize font-medium ${
                      statusFilter === s ? 'bg-white text-slate-900 border border-slate-300 font-semibold' : 'text-slate-600 hover:bg-slate-200/60'
                    }`}
                  >
                    {s === 'in_progress' ? 'In progress' : s}
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
                className="pl-8 pr-3 py-1 text-xs rounded-[6px] border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:border-indigo-600 w-full sm:w-56"
              />
            </div>
          </div>

          {/* Internal Tool Operations Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-medium text-xs">
                  <th className="py-2.5 px-3">Ticket ID</th>
                  <th className="py-2.5 px-3">Title &amp; location</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Source</th>
                  <th className="py-2.5 px-3">Assigned crew</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queueReports.map((report) => {
                  const isCctv = report.source?.type === 'CCTV_FIXED' || report.reportedBy?.role?.includes('cctv');
                  const s = (report.severity || '').toLowerCase();
                  const sevColor = s === 'critical' ? 'text-rose-700 bg-rose-50 border-rose-200' : s === 'urgent' || s === 'high' ? 'text-amber-800 bg-amber-50 border-amber-200' : 'text-slate-700 bg-slate-100 border-slate-200';
                  const sevLabel = s === 'critical' ? 'Critical' : s === 'urgent' || s === 'high' ? 'High' : 'Normal';

                  // Realistic crew names
                  const rawCrew = typeof report.assignedTeam === 'object' ? report.assignedTeam?.name || report.assignedTeam?.teamName : report.assignedTeam;
                  const crewName = !rawCrew ? null : rawCrew.toLowerCase().includes('ramesh') || rawCrew.toLowerCase().includes('beat 01') ? "Ramesh's crew" : rawCrew.toLowerCase().includes('sanitation') || rawCrew.toLowerCase().includes('beat 02') ? "Hostel maintenance" : rawCrew.toLowerCase().includes('workshop') || rawCrew.toLowerCase().includes('electrical') ? "Electrical unit" : rawCrew;

                  return (
                    <tr 
                      key={report.id} 
                      onClick={() => onSelectReport(report)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono text-xs text-slate-600 whitespace-nowrap">
                        {report.ticketNumber || report.id}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-slate-900 block truncate max-w-xs">{report.title}</span>
                        <span className="text-[11px] text-slate-500 block truncate max-w-xs">{report.location}</span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[10px] font-medium border ${sevColor}`}>
                          {sevLabel}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-[11px] text-slate-600">
                        {isCctv ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-600">
                            <Video className="w-3 h-3 text-slate-400" />
                            {report.source?.sensorId || 'Cam 04'}
                          </span>
                        ) : (
                          <span>Student report</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] whitespace-nowrap">
                        {crewName ? (
                          <span className="text-slate-700">{crewName}</span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectReport(report);
                            }}
                            className="text-indigo-700 hover:underline font-medium cursor-pointer"
                          >
                            Assign
                          </button>
                        )}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {report.status === 'resolved' ? (
                          <span className="text-[11px] font-medium text-emerald-700">Resolved</span>
                        ) : report.status === 'in_progress' ? (
                          <span className="text-[11px] font-medium text-indigo-700">In progress</span>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-600">Pending</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectReport(report);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Options"
                        >
                          <MoreVertical className="w-4 h-4" />
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
