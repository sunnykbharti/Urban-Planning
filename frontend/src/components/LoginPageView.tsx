import React, { useState } from 'react';
import { 
  BookOpen, 
  ArrowLeft, 
  GraduationCap, 
  HardHat, 
  Building2, 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Check, 
  ArrowRight,
  Shield,
  HelpCircle,
  Terminal
} from 'lucide-react';
import { UserRole, UserProfile, DEFAULT_PROFILES, UserCredential } from '../types';

interface LoginPageViewProps {
  onLoginSuccess: (role: UserRole, profile: UserProfile) => void;
  onBackToLanding: () => void;
  credentials?: UserCredential[];
}

export const LoginPageView: React.FC<LoginPageViewProps> = ({
  onLoginSuccess,
  onBackToLanding,
  credentials
}) => {
  const [selectedRole, setSelectedRole] = useState<'student' | 'bvg_worker' | 'management' | 'super_admin' | 'developer'>('student');
  const [emailInput, setEmailInput] = useState<string>(() => DEFAULT_PROFILES?.student?.email || 'sunny.student@csjmu.ac.in');
  const [pinInput, setPinInput] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Quick switch role handler
  const handleRoleSelect = (role: 'student' | 'bvg_worker' | 'management' | 'super_admin' | 'developer') => {
    setSelectedRole(role);
    const profile = DEFAULT_PROFILES[role] || DEFAULT_PROFILES.student;
    setEmailInput(profile.email || '');
    setPinInput('');
    setError(null);
  };

  // Instant demo one-click login
  const handleQuickDemoLogin = (role: 'student' | 'bvg_worker' | 'management' | 'super_admin' | 'developer') => {
    const profile = DEFAULT_PROFILES[role] || DEFAULT_PROFILES.student;
    onLoginSuccess(role, profile);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const activeProfile = DEFAULT_PROFILES[selectedRole] || DEFAULT_PROFILES.student;
    
    // Check if dynamic credentials exist
    const targetCred = Array.isArray(credentials) ? credentials.find(c => c.role === selectedRole) : undefined;
    if (targetCred?.status === 'suspended') {
      setError('This institutional account is currently suspended. Contact your university IT administrator.');
      return;
    }

    const expectedPin = targetCred?.pin ?? activeProfile.pin;

    // Student role does not require PIN unless configured
    if (selectedRole !== 'student' && expectedPin && pinInput !== expectedPin) {
      setError(`Invalid security PIN for ${activeProfile.roleTitle || 'this role'}. (Demo PIN: ${expectedPin})`);
      return;
    }

    onLoginSuccess(selectedRole, activeProfile);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      
      {/* Top Bar – Uber-style black */}
      <header className="w-full bg-black h-16 flex items-center px-4 sm:px-8 justify-between">
        <button
          onClick={onBackToLanding}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-white flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-black" />
          </div>
          <span className="font-bold text-sm text-white">Campusr</span>
        </div>

        <a 
          href="mailto:support@campusr.io" 
          className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:inline"
        >
          Help
        </a>
      </header>

      {/* Main Centered Login Box */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 py-10">
        <div className="max-w-md w-full">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Sign in
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Select your role and enter your credentials.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8">
            
            {/* Role Selection Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1 bg-gray-100 rounded-lg mb-6 text-xs">
              <button
                type="button"
                onClick={() => handleRoleSelect('student')}
                className={`py-2 px-1.5 rounded-md font-medium flex flex-col items-center gap-1 transition-all ${
                  selectedRole === 'student'
                    ? 'bg-white text-black shadow-sm font-semibold'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span className="truncate">Student</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('bvg_worker')}
                className={`py-2 px-1.5 rounded font-medium flex flex-col items-center gap-1 transition-all ${
                  selectedRole === 'bvg_worker'
                    ? 'bg-white text-black shadow-sm font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <HardHat className="w-3.5 h-3.5" />
                <span className="truncate">Staff</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('management')}
                className={`py-2 px-1.5 rounded font-medium flex flex-col items-center gap-1 transition-all ${
                  selectedRole === 'management'
                    ? 'bg-white text-black shadow-sm font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span className="truncate">Dean</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('super_admin')}
                className={`py-2 px-1.5 rounded font-medium flex flex-col items-center gap-1 transition-all ${
                  selectedRole === 'super_admin'
                    ? 'bg-white text-black shadow-sm font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="truncate">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('developer')}
                className={`py-2 px-1.5 rounded font-medium flex flex-col items-center gap-1 transition-all ${
                  selectedRole === 'developer'
                    ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                    : 'text-emerald-700 hover:text-emerald-900'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span className="truncate">Dev</span>
              </button>
            </div>

            {/* Quick-Fill Demo Notice */}
            <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-md text-xs">
              <div className="font-semibold text-gray-900 flex items-center justify-between">
                <span>Quick Demo Access:</span>
                <span className="text-[11px] text-black font-normal">1-click login</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('student')}
                  className="px-2 py-1 bg-white border border-gray-200 text-gray-800 rounded hover:bg-gray-50 font-medium text-[11px] transition-colors"
                >
                  Student (Sunny)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('developer')}
                  className="px-2 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded hover:bg-emerald-100 font-medium text-[11px] transition-colors"
                >
                  Dev (Sunny • 0000)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('bvg_worker')}
                  className="px-2 py-1 bg-white border border-gray-200 text-gray-800 rounded hover:bg-gray-50 font-medium text-[11px] transition-colors"
                >
                  Staff (Ramesh • 1234)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('management')}
                  className="px-2 py-1 bg-white border border-gray-200 text-gray-800 rounded hover:bg-gray-50 font-medium text-[11px] transition-colors"
                >
                  Estate (Sharma • 5678)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('super_admin')}
                  className="px-2 py-1 bg-white border border-gray-200 text-gray-800 rounded hover:bg-gray-50 font-medium text-[11px] transition-colors"
                >
                  Registrar (9999)
                </button>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-stone-800 mb-1">
                  Institutional Email or Roll Number
                </label>
                <input
                  type="text"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="rollno@university.edu"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-md text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-black transition-colors"
                />
              </div>

              {selectedRole !== 'student' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-medium text-stone-800">
                      Security PIN / Access Code
                    </label>
                    <span className="text-[11px] text-stone-500 font-mono">
                      Demo: {selectedRole === 'bvg_worker' ? '1234' : selectedRole === 'management' ? '5678' : '9999'}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      required
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      placeholder="••••"
                      maxLength={6}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-md text-xs font-mono tracking-widest text-stone-900 focus:bg-white focus:outline-none focus:border-black transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                    >
                      {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-700 flex items-start gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-stone-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-stone-300 text-black focus:ring-black"
                  />
                  <span>Remember this device</span>
                </label>
                <a href="mailto:support@campusr.io?subject=Forgot%20Campus%20PIN" className="text-black hover:underline">
                  Forgot PIN?
                </a>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-black hover:bg-gray-800 text-white font-medium text-xs rounded-md transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span>
                    Sign In to {
                      selectedRole === 'student' ? 'Student Dashboard' :
                      selectedRole === 'bvg_worker' ? 'Field Operations Hub' :
                      selectedRole === 'management' ? 'Management Dashboard' :
                      'Super Admin Terminal'
                    }
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

          </div>

          {/* Footer Assistance */}
          <div className="text-center text-xs text-stone-500 mt-6 space-y-1">
            <div>Campusr Institutional Single Sign-On • 256-Bit Encrypted</div>
            <div>Need account activation? Contact your department registrar.</div>
          </div>

        </div>
      </div>

    </div>
  );
};

