import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  AlertCircle, 
  GraduationCap, 
  HardHat, 
  Building2, 
  Crown, 
  Check, 
  Eye, 
  EyeOff, 
  Sparkles,
  ArrowRight,
  UserCheck,
  Shield
} from 'lucide-react';
import { UserRole, UserProfile, DEFAULT_PROFILES, UserCredential } from '../types';

interface RoleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole?: UserRole | null;
  currentRole: UserRole;
  onSuccess: (role: UserRole, profile: UserProfile) => void;
  credentials?: UserCredential[];
}

export const RoleAuthModal: React.FC<RoleAuthModalProps> = ({
  isOpen,
  onClose,
  targetRole,
  currentRole,
  onSuccess,
  credentials
}) => {
  // Normalize current role
  const normCurrent: 'student' | 'bvg_worker' | 'management' | 'super_admin' = 
    currentRole === 'admin' ? 'super_admin' : currentRole === 'operator' ? 'bvg_worker' : (currentRole as any) || 'student';

  // Selected account in modal
  const [selectedRole, setSelectedRole] = useState<'student' | 'bvg_worker' | 'management' | 'super_admin'>(() => {
    if (targetRole) {
      return targetRole === 'admin' ? 'super_admin' : targetRole === 'operator' ? 'bvg_worker' : (targetRole as any);
    }
    return normCurrent;
  });

  const [pin, setPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (targetRole) {
        const norm = targetRole === 'admin' ? 'super_admin' : targetRole === 'operator' ? 'bvg_worker' : (targetRole as any);
        setSelectedRole(norm);
      } else {
        setSelectedRole(normCurrent);
      }
      setPin('');
      setError(null);
    }
  }, [isOpen, targetRole, normCurrent]);

  if (!isOpen) return null;

  const activeProfile = DEFAULT_PROFILES[selectedRole] || DEFAULT_PROFILES.student;
  const isStudent = selectedRole === 'student';

  // Find active dynamic credential for this role if configured by Super Admin
  const targetCred = credentials?.find(c => c.role === selectedRole);
  const activeExpectedPin = targetCred?.pin ?? activeProfile.pin;
  const isAccountSuspended = targetCred?.status === 'suspended';

  const handleSelectRole = (role: 'student' | 'bvg_worker' | 'management' | 'super_admin') => {
    setSelectedRole(role);
    setPin('');
    setError(null);
  };

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (isAccountSuspended) {
      setError(`Access Denied: This account has been suspended by the Registrar.`);
      return;
    }

    // Student role does not require PIN
    if (isStudent) {
      onSuccess('student', DEFAULT_PROFILES.student);
      onClose();
      return;
    }

    if (pin.trim() === activeExpectedPin.trim()) {
      onSuccess(selectedRole, activeProfile);
      setPin('');
      onClose();
    } else {
      setError(`Invalid Security PIN for ${activeProfile.roleTitle}. Access Denied.`);
    }
  };

  const handleQuickFill = () => {
    setPin(activeExpectedPin);
    setError(null);
  };

  const accounts: Array<{
    role: 'student' | 'bvg_worker' | 'management' | 'super_admin';
    title: string;
    name: string;
    badge: string;
    badgeText: string;
    pinHint: string;
    icon: React.ReactNode;
    colorClasses: string;
    activeBorder: string;
  }> = [
    {
      role: 'student',
      title: 'Student / Citizen Reporter',
      name: 'Sunny Bharti',
      badge: 'CSJMU/UIET/2023/104',
      badgeText: 'Public Citizen Access',
      pinHint: 'No PIN Required',
      icon: <GraduationCap className="w-5 h-5 text-emerald-600" />,
      colorClasses: 'hover:bg-emerald-50/60',
      activeBorder: 'border-emerald-600 ring-2 ring-emerald-500/30 bg-emerald-50/40'
    },
    {
      role: 'bvg_worker',
      title: 'Sanitation Beat Lead',
      name: 'Ramesh Kumar (BVG India)',
      badge: 'BVG-IND-KNP-204',
      badgeText: 'Field Contractor',
      pinHint: 'PIN: 1234',
      icon: <HardHat className="w-5 h-5 text-amber-600" />,
      colorClasses: 'hover:bg-amber-50/60',
      activeBorder: 'border-amber-600 ring-2 ring-amber-500/30 bg-amber-50/40'
    },
    {
      role: 'management',
      title: 'Executive Sanitation Engineer',
      name: 'Er. R. K. Sharma',
      badge: 'CSJMU-EST-019',
      badgeText: 'Estate Directorate',
      pinHint: 'PIN: 5678',
      icon: <Building2 className="w-5 h-5 text-blue-600" />,
      colorClasses: 'hover:bg-blue-50/60',
      activeBorder: 'border-blue-600 ring-2 ring-blue-500/30 bg-blue-50/40'
    },
    {
      role: 'super_admin',
      title: 'Registrar & Chief Administrator',
      name: 'Prof. A. K. Shukla',
      badge: 'CSJMU-ROOT-001',
      badgeText: 'Central Secretariat',
      pinHint: 'PIN: 9999',
      icon: <Crown className="w-5 h-5 text-purple-700" />,
      colorClasses: 'hover:bg-purple-50/60',
      activeBorder: 'border-purple-600 ring-2 ring-purple-500/30 bg-purple-50/40'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden relative">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-[#001e40] to-indigo-950 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest uppercase bg-blue-500/20 text-blue-200 px-2 py-0.5 rounded-full">
                CSJMU Access Control Portal
              </span>
              <h3 className="text-lg font-black mt-1 leading-tight text-white">
                Switch User Account
              </h3>
              <p className="text-xs text-blue-200/80 mt-0.5">
                Select an authenticated campus persona to switch your active session and workspace
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Account Selector Cards */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Seeded Campus Accounts (Select Persona)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {accounts.map((acc) => {
                const isSelected = selectedRole === acc.role;
                const isCurrent = normCurrent === acc.role;

                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleSelectRole(acc.role)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? acc.activeBorder
                        : `border-slate-200 bg-white ${acc.colorClasses}`
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <div className="flex items-center gap-2">
                          {acc.icon}
                          <span className="text-xs font-bold text-slate-900 leading-tight">
                            {acc.name}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-[#001e40] text-white flex items-center justify-center flex-shrink-0">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">
                        {acc.title}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px]">
                      <span className="font-mono text-slate-500">
                        {acc.badge}
                      </span>
                      <span className="font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {acc.pinHint}
                      </span>
                    </div>

                    {isCurrent && (
                      <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider shadow-xs">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Selection Details & PIN Form */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{activeProfile.avatar}</span>
                <div>
                  <h4 className="text-xs font-black text-slate-900 leading-tight">
                    {activeProfile.name}
                  </h4>
                  <p className="text-[11px] text-slate-600 font-medium">
                    {activeProfile.roleTitle}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                {activeProfile.badgeNumber}
              </span>
            </div>

            <div className="text-[11px] text-slate-600 flex items-center justify-between">
              <span><strong>Department:</strong> {activeProfile.department}</span>
              <span className="text-[10px] text-slate-500">{activeProfile.agency}</span>
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Form actions */}
            {isStudent ? (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => handleVerify()}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Sign In as Sunny Bharti (Student)</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerify} className="space-y-3 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                      Security Authorization PIN
                    </label>
                    <button
                      type="button"
                      onClick={handleQuickFill}
                      className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer"
                      title="Quick Fill Demo PIN"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      <span>Use Demo PIN ({activeExpectedPin})</span>
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      maxLength={8}
                      autoFocus
                      placeholder="Enter 4-digit PIN"
                      value={pin}
                      onChange={(e) => {
                        setPin(e.target.value);
                        setError(null);
                      }}
                      className="w-full pl-3 pr-10 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#001e40] focus:border-transparent font-mono tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#001e40] hover:bg-[#002b5c] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Verify Credentials &amp; Sign In</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>🔒 Role-Based Access Control Enforced</span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
