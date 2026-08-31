import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  Send, 
  User, 
  Layers, 
  ShieldCheck, 
  Calendar,
  Building2,
  Navigation
} from 'lucide-react';
import { MaintenanceReport, ReportStatus } from '../types';

interface ReportDetailsModalProps {
  report: MaintenanceReport | null;
  onClose: () => void;
  onUpdateStatus: (reportId: string, newStatus: ReportStatus, note?: string) => void;
  onAssignTeam: (reportId: string, teamName: string) => void;
  onViewOnMap: (report: MaintenanceReport) => void;
}

export const ReportDetailsModal: React.FC<ReportDetailsModalProps> = ({
  report,
  onClose,
  onUpdateStatus,
  onAssignTeam,
  onViewOnMap
}) => {
  const [newNote, setNewNote] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus>(report?.status || 'pending');
  const [selectedTeam, setSelectedTeam] = useState<string>(report?.assignedTeam || 'Team Alpha (Civil)');

  React.useEffect(() => {
    if (report) {
      setSelectedStatus(report.status);
      setSelectedTeam(report.assignedTeam || 'Team Alpha (Civil)');
    }
  }, [report]);

  if (!report) return null;

  const isUrgent = report.severity === 'urgent';

  const handleSaveUpdates = () => {
    if (selectedStatus !== report.status || newNote.trim()) {
      onUpdateStatus(report.id, selectedStatus, newNote.trim());
    }
    if (selectedTeam !== report.assignedTeam) {
      onAssignTeam(report.id, selectedTeam);
    }
    setNewNote('');
    onClose();
  };

  const availableTeams = [
    'Team Alpha (Civil Works & Masonry)',
    'Team Beta (Electrical & Power Systems)',
    'Team Gamma (Plumbing & Sanitation)',
    'Team Delta (Drainage & Grounds)',
    'Team Epsilon (HVAC & Ventilation)',
    'Campus Security Rapid Response'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div 
        className="relative bg-white rounded-xl max-w-2xl w-full border border-[#c3c6d1] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#c3c6d1] flex items-center justify-between bg-[#f0f3ff]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold bg-[#001e40] text-white px-2.5 py-1 rounded">
              {report.id}
            </span>
            <h2 className="text-lg font-bold text-[#001e40] truncate max-w-md">
              {report.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#43474f] hover:text-[#001e40] p-1.5 rounded-full hover:bg-[#dee8ff] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">
          {/* Top Info Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#e7eeff] rounded-lg border border-[#dee8ff]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-[#001e40] font-semibold">
                <MapPin className="w-4 h-4 text-[#737780]" />
                <span>{report.location}</span>
              </div>
              <span className="text-[#c3c6d1]">•</span>
              <span className="text-xs text-[#43474f] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Filed {report.timeAgo}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isUrgent ? (
                <span className="bg-[#ffdad6] text-[#ba1a1a] border border-[#ffcdd2] px-2.5 py-0.5 rounded text-xs font-bold uppercase flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Urgent Hazard
                </span>
              ) : (
                <span className="bg-[#d1e1f4] text-[#556474] px-2.5 py-0.5 rounded text-xs font-bold uppercase">
                  Routine Maintenance
                </span>
              )}
            </div>
          </div>

          {/* Photo & Description Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {report.imageUrl && (
              <div className="md:col-span-5 rounded-lg overflow-hidden border border-[#c3c6d1] bg-[#f0f3ff] h-48 md:h-auto">
                <img
                  src={report.imageUrl}
                  alt={report.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className={report.imageUrl ? 'md:col-span-7 space-y-3' : 'md:col-span-12 space-y-3'}>
              <div>
                <h4 className="text-xs font-bold text-[#737780] uppercase tracking-wider mb-1">Issue Description</h4>
                <p className="text-sm text-[#111c2d] leading-relaxed bg-[#f0f3ff] p-3 rounded-lg border border-[#dee8ff]">
                  {report.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-white border border-[#c3c6d1] rounded-lg">
                  <span className="text-[10px] text-[#737780] uppercase block font-bold">Reported By</span>
                  <span className="font-semibold text-[#001e40]">{report.reportedBy.name}</span>
                  <span className="text-[10px] text-[#43474f] block">{report.reportedBy.role}</span>
                </div>
                <div className="p-2.5 bg-white border border-[#c3c6d1] rounded-lg">
                  <span className="text-[10px] text-[#737780] uppercase block font-bold">Category</span>
                  <span className="font-semibold text-[#001e40] capitalize">{report.category}</span>
                  <span className="text-[10px] text-[#43474f] block">Campus Infrastructure</span>
                </div>
              </div>
            </div>
          </div>

          {/* Triage Controls (Status & Team Assignment) */}
          <div className="bg-[#f0f3ff] p-4 rounded-xl border border-[#dee8ff] space-y-3">
            <h4 className="text-xs font-bold text-[#001e40] uppercase tracking-wider flex items-center gap-1.5">
              <Wrench className="w-4 h-4" /> Dispatcher Triage Controls
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#43474f] uppercase mb-1">
                  Lifecycle Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as ReportStatus)}
                  className="w-full p-2 text-xs font-bold rounded-lg border border-[#c3c6d1] bg-white text-[#001e40] outline-none"
                >
                  <option value="pending">🟡 Pending Review / Triaging</option>
                  <option value="in_progress">🔵 In Progress (Team On-Site)</option>
                  <option value="resolved">🟢 Resolved &amp; Verified</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#43474f] uppercase mb-1">
                  Assigned Maintenance Unit
                </label>
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="w-full p-2 text-xs font-medium rounded-lg border border-[#c3c6d1] bg-white text-[#001e40] outline-none"
                >
                  {availableTeams.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Activity Log / Progress History */}
          <div>
            <h4 className="text-xs font-bold text-[#737780] uppercase tracking-wider mb-2">
              Resolution Audit Trail
            </h4>
            <div className="space-y-2 max-h-36 overflow-y-auto custom-scrollbar">
              {report.updates && report.updates.length > 0 ? (
                report.updates.map((update) => (
                  <div key={update.id} className="p-2.5 bg-[#f0f3ff] rounded-lg border border-[#dee8ff] text-xs flex justify-between items-start">
                    <div>
                      <span className="font-bold text-[#001e40]">{update.author}</span>
                      <p className="text-[#43474f] mt-0.5">{update.message}</p>
                    </div>
                    <span className="text-[10px] text-[#737780] font-medium whitespace-nowrap ml-2">
                      {update.timestamp}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#737780] italic">No prior field logs for this ticket.</p>
              )}
            </div>
          </div>

          {/* Add Quick Work Note */}
          <div>
            <label className="block text-xs font-bold text-[#43474f] uppercase tracking-wider mb-1">
              Add Field Note / Dispatch Update
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="e.g. Electrician arrived with spare circuit breaker..."
                className="flex-1 text-xs p-2.5 border border-[#c3c6d1] rounded-lg bg-white outline-none focus:border-[#001e40]"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#c3c6d1] bg-[#ffffff] flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onViewOnMap(report);
              onClose();
            }}
            className="text-xs text-[#003366] hover:text-[#001e40] font-bold flex items-center gap-1.5"
          >
            <Navigation className="w-3.5 h-3.5" /> Locate on Campus Map
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#737780] text-[#50606f] text-xs font-semibold rounded-lg hover:bg-[#f0f3ff]"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveUpdates}
              className="px-5 py-2 bg-[#001e40] text-white text-xs font-bold rounded-lg hover:bg-[#003366] flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" /> Save &amp; Dispatch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
