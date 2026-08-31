import React, { useState } from 'react';
import { X, Settings, Bell, Shield, MapPin, Database, Check, RefreshCw } from 'lucide-react';
import { UserRole } from '../types';

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
            Active User Role Profile
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onRoleChange('admin')}
              className={`p-3 rounded-lg border text-left text-xs transition-colors ${
                userRole === 'admin'
                  ? 'border-[#001e40] bg-[#e7eeff] text-[#001e40] font-bold ring-1 ring-[#001e40]'
                  : 'border-[#c3c6d1] text-[#43474f] hover:bg-[#f0f3ff]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">Planning Officer</span>
                {userRole === 'admin' && <Check className="w-4 h-4 text-[#001e40]" />}
              </div>
              <p className="text-[11px] text-[#737780] mt-1 font-normal">Full triage &amp; dispatch access</p>
            </button>

            <button
              onClick={() => onRoleChange('student')}
              className={`p-3 rounded-lg border text-left text-xs transition-colors ${
                userRole === 'student'
                  ? 'border-[#001e40] bg-[#e7eeff] text-[#001e40] font-bold ring-1 ring-[#001e40]'
                  : 'border-[#c3c6d1] text-[#43474f] hover:bg-[#f0f3ff]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">Student / Staff</span>
                {userRole === 'student' && <Check className="w-4 h-4 text-[#001e40]" />}
              </div>
              <p className="text-[11px] text-[#737780] mt-1 font-normal">Campus incident reporter</p>
            </button>
          </div>
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
