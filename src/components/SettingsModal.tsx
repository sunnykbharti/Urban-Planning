import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Bell, 
  Shield, 
  MapPin, 
  Database, 
  Check, 
  RefreshCw, 
  Server, 
  CheckCircle2,
  UserCheck,
  BadgeCheck,
  Lock,
  Sparkles,
  Key,
  ExternalLink
} from 'lucide-react';
import { UserRole, UserProfile } from '../types';
import { checkBackendHealth } from '../api/client';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
  currentProfile?: UserProfile;
  onOpenAccountSwitcher?: () => void;
  onResetData: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userRole,
  currentProfile,
  onOpenAccountSwitcher,
  onResetData,
  onNavigateTab
}) => {
  const [urgentAlerts, setUrgentAlerts] = useState(true);
  const [autoLocate, setAutoLocate] = useState(true);
  const [dbInfo, setDbInfo] = useState<{ type: string; host: string; incidentCount: number; status: string } | null>(null);
  const [geminiKey, setGeminiKey] = useState<string>('');
  const [keySaved, setKeySaved] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      checkBackendHealth().then((res) => {
        if (res.online && res.database) {
          setDbInfo(res.database);
        }
      });
      const storedKey = localStorage.getItem('GEMINI_API_KEY') || '';
      setGeminiKey(storedKey);
      setKeySaved(false);
    }
  }, [isOpen]);

  const handleSaveGeminiKey = () => {
    const trimmed = geminiKey.trim();
    if (trimmed) {
      localStorage.setItem('GEMINI_API_KEY', trimmed);
    } else {
      localStorage.removeItem('GEMINI_API_KEY');
    }
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2500);
  };

  if (!isOpen) return null;

  const isStudent = userRole === 'student';
  const isBvg = userRole === 'bvg_worker' || userRole === 'operator';
  const isManagement = userRole === 'management';
  const isSuperAdmin = userRole === 'super_admin' || userRole === 'admin';

  const roleLabel = isStudent
    ? 'Student / Citizen Reporter'
    : isBvg
    ? 'BVG Worker (Sanitation Beat Lead)'
    : isManagement
    ? 'Management (Directorate of Estate & Works)'
    : 'Super Admin (Registrar Secretariat)';

  const roleBadgeStyle = isStudent
    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
    : isBvg
    ? 'bg-amber-100 text-amber-900 border-amber-300'
    : isManagement
    ? 'bg-blue-100 text-blue-900 border-blue-300'
    : 'bg-slate-100 text-slate-800 border-slate-300';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-[#c3c6d1] shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#c3c6d1]">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#001e40]" />
            <h3 className="text-lg font-bold text-[#001e40]">Portal Configuration &amp; RBAC</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-[#737780] hover:text-[#111c2d] p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Setting 1: Authenticated Identity & RBAC Clearance (Read-Only) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#43474f] uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#001e40]" />
              Active Session &amp; RBAC Clearance
            </span>
            <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" />
              Directory Enforced
            </span>
          </label>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-[#001e40] text-white font-bold flex items-center justify-center text-xs tracking-wider shrink-0 shadow-xs border border-slate-700">
                  {currentProfile?.avatar || 'SB'}
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">
                    {currentProfile?.name || 'Sunny Bharti'}
                  </h4>
                  <p className="text-[11px] text-slate-600 font-medium">
                    {currentProfile?.roleTitle || roleLabel}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${roleBadgeStyle}`}>
                {isStudent ? 'Citizen' : isBvg ? 'BVG Worker' : isManagement ? 'Management' : 'Super Admin'}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
              <span><strong>Badge ID:</strong> <span className="font-mono text-slate-700">{currentProfile?.badgeNumber || 'CSJMU/UIET/2023/104'}</span></span>
              <span><strong>Dept:</strong> {currentProfile?.department || 'Computer Science & Engineering'}</span>
            </div>

            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
              <p className="text-[10px] text-slate-500 leading-tight max-w-[260px]">
                Roles and clearance privileges are managed centrally. Arbitrary in-app role changing is disabled.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenAccountSwitcher) onOpenAccountSwitcher();
                }}
                className="px-2.5 py-1.5 bg-[#001e40] hover:bg-[#002b5c] text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-200" />
                <span>Switch Account</span>
              </button>
            </div>
          </div>
        </div>

        {/* Setting 2: Notifications */}
        <div className="space-y-3 pt-3 border-t border-[#e7eeff]">
          <label className="block text-xs font-bold text-[#43474f] uppercase tracking-wider flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-slate-500" />
            Telemetry &amp; Notifications
          </label>

          <div className="flex items-center justify-between py-1">
            <div>
              <span className="text-xs font-semibold text-[#111c2d]">Urgent Hazard Push Alerts</span>
              <p className="text-[11px] text-[#737780]">Notify when Level-1 safety reports are lodged in UIET precinct</p>
            </div>
            <input
              type="checkbox"
              checked={urgentAlerts}
              onChange={(e) => setUrgentAlerts(e.target.checked)}
              className="w-4 h-4 rounded text-[#001e40] focus:ring-[#001e40] cursor-pointer"
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
              className="w-4 h-4 rounded text-[#001e40] focus:ring-[#001e40] cursor-pointer"
            />
          </div>
        </div>

        {/* Vision AI & Fallback Engine (Gemini Multimodal) */}
        <div className="pt-3 border-t border-[#c3c6d1] space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#43474f] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Vision AI &amp; Gemini Fallback API
            </label>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
              geminiKey ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
            }`}>
              {geminiKey ? 'Gemini 2.0 Flash Vision Active' : 'Local Computer Vision Engine'}
            </span>
          </div>

          <div className="bg-[#fefce8]/60 border border-amber-200/80 rounded-lg p-3 text-xs space-y-2">
            <p className="text-[11px] text-[#555b68] leading-relaxed">
              Provides zero-shot visual understanding for campus desks, classrooms, dried leaves, bottles, and supermarkets.
            </p>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="Paste your Gemini API key (AIzaSy...)"
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-amber-200 rounded-md text-[#111c2d] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <button
                type="button"
                onClick={handleSaveGeminiKey}
                className="px-3 py-1.5 bg-[#001e40] hover:bg-[#003366] text-white text-xs font-bold rounded-md transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
              >
                {keySaved ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Key className="w-3.5 h-3.5 text-amber-300" />}
                <span>{keySaved ? 'Saved!' : 'Save Key'}</span>
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#737780] pt-1 border-t border-amber-200/50">
              <span>Free key • No credit card needed</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[#001e40] font-semibold hover:underline flex items-center gap-0.5 inline-flex"
              >
                <span>Get Free Gemini Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
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
              <span className="font-semibold text-slate-700">Database Tip:</span> <span>To switch to cloud PostgreSQL (e.g., Supabase / Neon), set <code className="bg-white px-1 py-0.5 rounded border border-gray-300 font-mono">DATABASE_URL</code> in your backend <code className="font-mono">.env</code>.</span>
            </div>
          </div>
        </div>

        {/* Setting 3: Reset Demo State */}
        <div className="pt-3 border-t border-[#e7eeff] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#ba1a1a]">Reload Seed Demo Data</span>
            <p className="text-[11px] text-[#737780]">Reset reports, leave requests &amp; credentials to default seeded values</p>
          </div>
          <button
            onClick={() => {
              onResetData();
              onClose();
            }}
            className="px-3 py-1.5 border border-[#ffcdd2] bg-[#ffebee] text-[#ba1a1a] text-xs font-bold rounded-lg hover:bg-[#ffdad6] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Re-Seed Data
          </button>
        </div>

        {/* Compliance & Governance */}
        <div className="pt-3 border-t border-[#c3c6d1] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#001e40]">Campus Governance &amp; Privacy</span>
            <p className="text-[11px] text-[#737780]">Official University statutory charter and DPDP Act 2023 compliance</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onNavigateTab) onNavigateTab('terms');
              }}
              className="px-2.5 py-1.5 border border-[#c3c6d1] bg-white hover:bg-slate-50 text-[#001e40] text-[11px] font-bold rounded-lg cursor-pointer"
            >
              Terms &amp; Charter
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onNavigateTab) onNavigateTab('privacy');
              }}
              className="px-2.5 py-1.5 border border-[#c3c6d1] bg-white hover:bg-slate-50 text-[#001e40] text-[11px] font-bold rounded-lg cursor-pointer"
            >
              Privacy Policy
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-[#c3c6d1] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#001e40] text-white text-xs font-bold rounded-lg hover:bg-[#003366] cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
