import React, { useState } from 'react';
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
  Sparkles 
} from 'lucide-react';
import { UserRole, UserProfile, DEFAULT_PROFILES } from '../types';

interface RoleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole: UserRole;
  currentRole: UserRole;
  onSuccess: (role: UserRole, profile: UserProfile) => void;
}

export const RoleAuthModal: React.FC<RoleAuthModalProps> = ({
  isOpen,
  onClose,
  targetRole,
  currentRole,
  onSuccess
}) => {
  const [pin, setPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Normalize target role
  const normalizedTarget: 'student' | 'bvg_worker' | 'management' | 'super_admin' = 
    targetRole === 'admin' ? 'super_admin' : targetRole === 'operator' ? 'bvg_worker' : targetRole as any;

  const profile = DEFAULT_PROFILES[normalizedTarget];
  const isStudent = normalizedTarget === 'student';

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    // Student role does not require PIN
    if (isStudent) {
      onSuccess(normalizedTarget, profile);
      onClose();
      return;
    }

    if (pin.trim() === profile.pin) {
      onSuccess(normalizedTarget, profile);
      setPin('');
      onClose();
    } else {
      setError(`Invalid PIN for ${profile.roleTitle}. Access Denied.`);
    }
  };

  const handleQuickFill = () => {
    setPin(profile.pin);
    setError(null);
  };

  const getRoleHeaderStyle = () => {
    switch (normalizedTarget) {
      case 'bvg_worker':
        return {
          bg: 'from-amber-600 to-orange-700',
          badge: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: <HardHat className="w-6 h-6 text-white" />
        };
      case 'management':
        return {
          bg: 'from-blue-700 to-indigo-900',
          badge: 'bg-blue-100 text-blue-900 border-blue-300',
          icon: <Building2 className="w-6 h-6 text-white" />
        };
      case 'super_admin':
        return {
          bg: 'from-purple-800 to-slate-900',
          badge: 'bg-purple-100 text-purple-900 border-purple-300',
          icon: <Crown className="w-6 h-6 text-white" />
        };
      default:
        return {
          bg: 'from-emerald-600 to-teal-800',
          badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          icon: <GraduationCap className="w-6 h-6 text-white" />
        };
    }
  };

  const headerStyle = getRoleHeaderStyle();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full border border-gray-200 shadow-2xl overflow-hidden relative">
        {/* Modal Header */}
        <div className={`p-6 bg-gradient-to-r ${headerStyle.bg} text-white relative`}>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center flex-shrink-0 shadow-inner">
              {headerStyle.icon}
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded-full text-white/90">
                RBAC Security Gateway
              </span>
              <h3 className="text-xl font-black mt-1 leading-tight">
                {profile.roleTitle}
              </h3>
              <p className="text-xs text-white/80 mt-0.5 font-medium">
                {profile.agency}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Official Badge Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-semibold uppercase text-[10px]">Officer / Lead</span>
              <span className="font-bold text-slate-800">{profile.name}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-semibold uppercase text-[10px]">Department</span>
              <span className="font-semibold text-slate-700">{profile.department}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold uppercase text-[10px]">Badge ID</span>
              <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                {profile.badgeNumber}
              </span>
            </div>
          </div>

          {/* Form Content */}
          {isStudent ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                The <strong>Student / Citizen Audience</strong> role provides open civic access to lodge garbage reports, track cleaning tickets, and browse campus thermal comfort zones without administrative restrictions.
              </p>

              <button
                type="button"
                onClick={() => handleVerify()}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <Check className="w-4 h-4" />
                <span>Continue as Student / Audience</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                    Enter Authorization PIN
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    4 Digits Required
                  </span>
                </label>

                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    maxLength={8}
                    autoFocus
                    placeholder="Enter security PIN"
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      setError(null);
                    }}
                    className={`w-full px-4 py-3 rounded-xl border text-base font-mono tracking-widest transition-all outline-none ${
                      error
                        ? 'border-red-500 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-400'
                        : 'border-slate-300 bg-white text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {error && (
                  <p className="text-[11px] font-bold text-red-600 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{error}</span>
                  </p>
                )}
              </div>

              {/* Demo PIN Assistance Chip */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-amber-900">
                  <Lock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span className="text-[11px]">
                    Demo PIN: <strong className="font-mono font-bold text-amber-950">{profile.pin}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="px-2.5 py-1 bg-amber-200/80 hover:bg-amber-300 text-amber-950 font-bold text-[10px] rounded-md transition-colors"
                >
                  Quick Fill
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Authenticate &amp; Switch</span>
                </button>
              </div>
            </form>
          )}

          {/* Permissions preview */}
          <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
              Active Role Privileges:
            </span>
            <div className="flex flex-wrap gap-1">
              {profile.permissions.map((p) => (
                <span key={p} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium border border-slate-200">
                  ✓ {p.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
