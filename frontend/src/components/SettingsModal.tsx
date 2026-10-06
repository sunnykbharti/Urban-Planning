import React, { useState, useEffect } from 'react';
import { X, Settings, Bell, Shield, MapPin, Database, Check, RefreshCw, Server, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../types';
import { checkBackendHealth } from '../api/client';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userRole,
  onRoleChange,
  onResetData
}) => {
  const [urgentAlerts, setUrgentAlerts] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [autoLocate, setAutoLocate] = useState(true);
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [dbInfo, setDbInfo] = useState<{ type: string; host: string; incidentCount: number; status: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      checkBackendHealth().then((res) => {
        if (res.online && res.database) {
          setDbInfo(res.database);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-lg w-full border border-[#c3c6d1] shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#c3c6d1]">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#001e40]" />
            <h3 className="text-lg font-bold text-[#001e40]">Portal Configuration</h3>
          </div>
          <button onClick={onClose} className="text-[#737780] hover:text-[#111c2d] p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Setting 1: Role */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#43474f] uppercase tracking-wider">
            Active RBAC User Role Profile
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Student */}
            <div
              className={`p-3 rounded-lg border text-left text-xs transition-colors ${
                userRole === 'student'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-600'
                  : 'border-[#c3c6d1] text-[#43474f] bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5">
                  <span>👨‍🎓</span> Student / Audience
                </span>
                {userRole === 'student' && <Check className="w-4 h-4 text-emerald-600" />}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-normal">Report hazards, live tracking &amp; cool havens</p>
            </div>

            {/* BVG Worker */}
            <div
              className={`p-3 rounded-lg border text-left text-xs transition-colors ${
                userRole === 'bvg_worker' || userRole === 'operator'
                  ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold ring-1 ring-amber-600'
                  : 'border-[#c3c6d1] text-[#43474f] bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5">
                  <span>👷‍♂️</span> BVG Workers
                </span>
                {(userRole === 'bvg_worker' || userRole === 'operator') && <Check className="w-4 h-4 text-amber-600" />}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-normal">Campus cleaning contractor (PIN: 1234)</p>
            </div>

            {/* Management */}
            <div
              className={`p-3 rounded-lg border text-left text-xs transition-colors ${
                userRole === 'management'
                  ? 'border-blue-700 bg-blue-50 text-blue-950 font-bold ring-1 ring-blue-700'
                  : 'border-[#c3c6d1] text-[#43474f] bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5">
                  <span>👨‍💼</span> Management
                </span>
                {userRole === 'management' && <Check className="w-4 h-4 text-blue-700" />}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-normal">Estate Directorate &amp; SLA audits (PIN: 5678)</p>
            </div>

            {/* Super Admin */}
            <div
              className={`p-3 rounded-lg border text-left text-xs transition-colors ${
                userRole === 'super_admin' || userRole === 'admin'
                  ? 'border-purple-800 bg-purple-50 text-purple-950 font-bold ring-1 ring-purple-800'
                  : 'border-[#c3c6d1] text-[#43474f] bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5">
                  <span>🏛️</span> Super Admin
                </span>
                {(userRole === 'super_admin' || userRole === 'admin') && <Check className="w-4 h-4 text-purple-800" />}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-normal">Master configuration &amp; DB keys (PIN: 9999)</p>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 pt-1">
            🔒 Switch roles from the top navigation bar using your authenticated credentials.
          </p>
        </div>

        {/* Setting 2: Notifications */}
        <div className="space-y-3 pt-3 border-t border-[#e7eeff]">
          <label className="block text-xs font-bold text-[#43474f] uppercase tracking-wider">
            Telemetry &amp; Notifications
          </label>

          <div className="flex items-center justify-between py-1">
            <div>
              <span className="text-xs font-semibold text-[#111c2d]">Urgent Hazard Push Alerts</span>
              <p className="text-[11px] text-[#737780]">Notify when Level-1 safety reports are lodged in UIET</p>
            </div>
            <input
              type="checkbox"
              checked={urgentAlerts}
              onChange={(e) => setUrgentAlerts(e.target.checked)}
              className="w-4 h-4 rounded text-[#001e40] focus:ring-[#001e40]"
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <div>
              <span className="text-xs font-semibold text-[#111c2d]">Auto-Detect Map Location</span>
              <p className="text-[11px] text-[#737780]">Pre-fill closest UIET academic block during reporting</p>
            </div>
            <input
              type="checkbox"
              checked={autoLocate}
              onChange={(e) => setAutoLocate(e.target.checked)}
              className="w-4 h-4 rounded text-[#001e40] focus:ring-[#001e40]"
            />
          </div>
        </div>

        {/* Database & Storage Engine */}
        <div className="pt-3 border-t border-[#c3c6d1] space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#43474f] uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#001e40]" />
              Storage Engine
            </label>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">
              <CheckCircle2 className="w-3 h-3 text-green-600" />
              {dbInfo ? (dbInfo.type === 'postgresql' ? 'PostgreSQL (Cloud / Local)' : 'SQLite Persistent File') : 'Checking...'}
            </span>
          </div>

          <div className="bg-[#f8f9ff] border border-[#dce2f9] rounded-lg p-3 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#555b68] font-medium">Active Database:</span>
              <span className="font-mono font-bold text-[#111c2d] uppercase">
                {dbInfo?.type || 'Auto-Detecting'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#555b68] font-medium">Stored Incidents:</span>
              <span className="font-bold text-[#111c2d]">
                {dbInfo?.incidentCount ?? 0} records
              </span>
            </div>
            <div className="pt-1.5 border-t border-[#e2e7f7] text-[10px] text-[#6d7280]">
              💡 <span>To switch to cloud PostgreSQL (e.g., Supabase / Neon), set <code className="bg-white px-1 py-0.5 rounded border border-gray-300 font-mono">DATABASE_URL</code> in your backend <code className="font-mono">.env</code>.</span>
            </div>
          </div>
        </div>

        {/* Setting 3: Reset Demo State */}
        <div className="pt-3 border-t border-[#e7eeff] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#ba1a1a]">Reset Sample Data</span>
            <p className="text-[11px] text-[#737780]">Restore default prototype reports and map pins</p>
          </div>
          <button
            onClick={() => {
              onResetData();
              onClose();
            }}
            className="px-3 py-1.5 border border-[#ffcdd2] bg-[#ffebee] text-[#ba1a1a] text-xs font-bold rounded-lg hover:bg-[#ffdad6] flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>

        <div className="pt-3 border-t border-[#c3c6d1] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#001e40] text-white text-xs font-bold rounded-lg hover:bg-[#003366]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
