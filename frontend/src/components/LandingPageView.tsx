import React, { useState } from 'react';
import { 
  Shield, 
  MapPin, 
  Camera, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  LogIn, 
  Phone, 
  Mail, 
  Flame, 
  Wrench, 
  Activity, 
  Eye, 
  TrendingUp, 
  Users, 
  Building2,
  TreeDeciduous,
  Clock
} from 'lucide-react';

interface LandingPageViewProps {
  onNavigateToLogin: () => void;
  onNavigateToApp: () => void;
  isAuthenticated?: boolean;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onNavigateToLogin,
  onNavigateToApp,
  isAuthenticated = false
}) => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState('Campus Director / Estate Head');
  const [formNotes, setFormNotes] = useState('');

  const handleAppEntry = () => {
    if (isAuthenticated) {
      onNavigateToApp();
    } else {
      onNavigateToLogin();
    }
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1917] font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* 1. PLAIN FULL-WIDTH NAVBAR */}
      <header className="w-full bg-white border-b border-stone-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-7 h-7 rounded-md bg-indigo-700 flex items-center justify-center text-white font-bold text-xs">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-stone-900">Campusr</span>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
            <a href="#how-it-works" className="hover:text-indigo-700 transition-colors">How it works</a>
            <a href="#features" className="hover:text-indigo-700 transition-colors">Core Features</a>
            <a href="#contact" className="hover:text-indigo-700 transition-colors">Contact</a>
            <a href="#terms" className="hover:text-indigo-700 transition-colors">Terms</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={onNavigateToLogin}
                  className="px-3.5 py-1.5 text-sm font-medium text-stone-700 hover:text-indigo-700 hover:bg-stone-50 border border-stone-200 rounded-md transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log in</span>
                </button>
                <button
                  onClick={onNavigateToLogin}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-700 hover:bg-indigo-800 rounded-md transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <span>Sign In to App</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button
                onClick={onNavigateToApp}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-700 hover:bg-indigo-800 rounded-md transition-colors shadow-sm flex items-center gap-1.5"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>
      </header>

      {/* 2. LEFT-ALIGNED HERO WITH REAL PLATFORM PREVIEW */}
      <section className="py-16 sm:py-20 border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left: Headline & Actions */}
            <div className="lg:col-span-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-stone-900 leading-tight">
                Closed-loop campus operations &amp; civic governance.
              </h1>
              <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed">
                From student incident reports and automated CCTV garbage detection to field contractor dispatch and heat-island microclimate tracking — Campusr resolves campus maintenance with verified accountability.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={onNavigateToLogin}
                  className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-medium text-sm rounded-md transition-colors text-center shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Sign In to Campus Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleAppEntry}
                  className="px-5 py-2.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 font-medium text-sm rounded-md transition-colors text-center"
                >
                  {isAuthenticated ? 'Enter Live Dashboard →' : 'Sign In Required to Enter →'}
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-stone-200 flex flex-wrap items-center gap-6 text-xs text-stone-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Computer Vision &amp; GIS Enabled</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-stone-300 hidden sm:block"></div>
                <div>Strict SLA Accountability</div>
                <div className="w-1 h-1 rounded-full bg-stone-300 hidden sm:block"></div>
                <div>Role-Based Clearance (RBAC)</div>
              </div>
            </div>

            {/* Right: Realistic Product UI Mockup Reflecting Actual App */}
            <div className="lg:col-span-6">
              <div className="bg-white border border-stone-200 rounded-lg shadow-sm p-4 sm:p-5">
                
                {/* Status Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4 text-xs text-stone-500">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-semibold text-stone-800">Campus Incident &amp; Operations Monitor</span>
                  </div>
                  <span className="font-mono text-[11px] bg-stone-100 px-2 py-0.5 rounded">ARE Engine: Active</span>
                </div>

                {/* Active Incident Work Order Card */}
                <div className="bg-amber-50/70 border border-amber-200 rounded-md p-3.5 mb-3">
                  <div className="flex items-center justify-between text-xs text-amber-800 font-medium">
                    <span className="font-mono font-bold">REP-1092 • Library Approach Quad</span>
                    <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[11px] font-semibold">Urgent • In Progress</span>
                  </div>
                  <div className="text-sm font-bold text-stone-900 mt-1">Severely Cracked Walkway &amp; Paver Dislodgement</div>
                  <div className="text-xs text-stone-600 mt-0.5">Assigned: Beat 01 (Lead: Ramesh K.) • SLA Time Remaining: 1h 42m</div>
                </div>

                {/* Secondary Modules: CCTV AI Stream & Microclimate Index */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
                  
                  {/* CCTV AI Sweep */}
                  <div className="border border-stone-200 rounded-md p-2.5 text-xs bg-stone-50">
                    <div className="flex items-center justify-between font-semibold text-stone-900 mb-1">
                      <span className="flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-indigo-700" />
                        <span>CCTV AI Detection</span>
                      </span>
                      <span className="text-[10px] text-emerald-700 font-mono">94% Conf</span>
                    </div>
                    <div className="text-stone-600 leading-snug">North Gate Cam 04: Overflowing bin detected. Auto-ticket generated.</div>
                  </div>

                  {/* Microclimate Haven */}
                  <div className="border border-stone-200 rounded-md p-2.5 text-xs bg-stone-50">
                    <div className="flex items-center justify-between font-semibold text-stone-900 mb-1">
                      <span className="flex items-center gap-1.5">
                        <TreeDeciduous className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Cool Havens Index</span>
                      </span>
                      <span className="text-[10px] text-indigo-700 font-mono">27°C Comfort</span>
                    </div>
                    <div className="text-stone-600 leading-snug">Central Canopy Green Haven: High shade refuge, 120m from Science Block.</div>
                  </div>

                </div>

                {/* Bottom Verification Strip */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-500">Before &rarr; After AI Verification: <strong className="text-stone-800">Enabled</strong></span>
                  <button 
                    onClick={handleAppEntry}
                    className="text-indigo-700 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>{isAuthenticated ? 'Open operational console' : 'Sign in to access console'}</span>
                    <span>→</span>
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS: THE 5-STAGE CLOSED LOOP */}
      <section id="how-it-works" className="py-16 border-b border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="max-w-2xl mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
              The closed-loop governance workflow
            </h2>
            <p className="mt-3 text-sm sm:text-base text-stone-600 leading-relaxed">
              Sensing issues is only 10% of the problem. Campusr automates the other 90%: spatial ward mapping, authority routing, field contractor dispatch, and computer vision cleanup audits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* The Usual Way (Left 5 Cols) */}
            <div className="md:col-span-5 bg-stone-50 border border-stone-200 rounded-lg p-6">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide mb-4">Without Campusr</h3>
              <ul className="space-y-4 text-xs sm:text-sm text-stone-600">
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>Students take photos of broken infrastructure, but nobody knows which department owns the repair.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>Fixed CCTV cameras sit idle recording terabytes of video that no human monitors for overflowing waste.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>Sanitation contractors claim tickets are resolved without photographic proof or residual debris checks.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>No data on campus heat-islands or shaded zones for pedestrian navigation during peak summer heat.</span>
                </li>
              </ul>
            </div>

            {/* How Campusr Runs It (Right 7 Cols) */}
            <div className="md:col-span-7 bg-white border border-stone-200 rounded-lg p-6">
              <h3 className="text-sm font-bold text-indigo-700 uppercase tracking-wide mb-4">With Campusr Closed Loop</h3>
              
              <div className="space-y-5 text-sm">
                <div className="pb-4 border-b border-stone-100">
                  <div className="font-semibold text-stone-900">1. Multimodal Detection &amp; Geotagging</div>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1">
                    Ingests reports from student mobile uploads and automated CCTV video sweeps. Automatically tags GPS coordinates to the exact campus block and polygon ward.
                  </p>
                </div>

                <div className="pb-4 border-b border-stone-100">
                  <div className="font-semibold text-stone-900">2. Authority Resolution Engine (ARE) &amp; Dispatch</div>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1">
                    Routes the incident to the responsible zonal supervisor and nearest contractor beat (e.g. Beat 01) with strict SLA turnaround deadlines.
                  </p>
                </div>

                <div>
                  <div className="font-semibold text-stone-900">3. AI-Assisted Before &rarr; After Verification</div>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1">
                    Field crews capture a post-cleanup photo. Computer vision evaluates residual debris percentage before management approves ticket closure.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. REAL CORE MODULES AVAILABLE IN APP */}
      <section id="features" className="py-16 border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="max-w-2xl mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
              Built-in modules running in the live application
            </h2>
            <p className="mt-2 text-sm sm:text-base text-stone-600">
              Every feature below is actively implemented and available once you sign in.
            </p>
          </div>

          {/* Feature 1: GIS Map & Incident Management (Wide Layout) */}
          <div className="bg-white border border-stone-200 rounded-lg p-6 sm:p-8 mb-6 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6">
                <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded">Module 1 • GIS Incident Map</span>
                <h3 className="text-xl font-bold text-stone-900 mt-3 mb-2">Interactive Campus Map &amp; Report Drawer</h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
                  Visual GIS interface showing real-time health across academic blocks, administrative centers, hostels, and workshops. Students and staff drop pins to report hazards with photos and severity tags.
                </p>
                <ul className="space-y-2 text-xs sm:text-sm text-stone-600">
                  <li className="flex items-center gap-2">
                    <span className="text-indigo-700 font-bold">•</span>
                    <span>Categorization: Garbage overflow, cracked infrastructure, waterlogging, and safety hazards.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-indigo-700 font-bold">•</span>
                    <span>Tracks status in real time: Pending &rarr; Dispatched &rarr; In Progress &rarr; Resolved.</span>
                  </li>
                </ul>
              </div>

              <div className="lg:col-span-6 bg-stone-50 border border-stone-200 rounded-md p-4">
                <div className="text-xs font-semibold text-stone-800 mb-2">Active Campus Block Health</div>
                <div className="space-y-2 text-xs">
                  <div className="bg-white p-2.5 rounded border border-stone-200 flex items-center justify-between">
                    <div>
                      <span className="font-medium text-stone-900">UIET Block 1 (CSE &amp; IT)</span>
                      <span className="text-stone-500 block text-[11px]">4 active reports • 1 urgent</span>
                    </div>
                    <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Condition: Fair</span>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-stone-200 flex items-center justify-between">
                    <div>
                      <span className="font-medium text-stone-900">Central University Library</span>
                      <span className="text-stone-500 block text-[11px]">5 active reports • 2 urgent</span>
                    </div>
                    <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">Requires Attention</span>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-stone-200 flex items-center justify-between">
                    <div>
                      <span className="font-medium text-stone-900">Science Block B Labs</span>
                      <span className="text-stone-500 block text-[11px]">0 active reports</span>
                    </div>
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Condition: Good</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 & 3: CCTV AI Detection & Heat-Island Governance (2 Unequal Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
            
            {/* CCTV Computer Vision Detection */}
            <div className="md:col-span-7 bg-white border border-stone-200 rounded-lg p-6 shadow-sm">
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded">Module 2 • Computer Vision Pipeline</span>
              <h3 className="text-lg font-bold text-stone-900 mt-3 mb-2">Automated CCTV Sweeps &amp; YOLO Detection</h3>
              <p className="text-xs sm:text-sm text-stone-600 mb-4">
                Connected camera feeds automatically detect waste accumulation and infrastructure hazards without relying exclusively on manual reporting.
              </p>

              <div className="space-y-2 text-xs">
                <div className="border border-stone-200 rounded-md p-3 bg-stone-50">
                  <div className="flex items-center justify-between font-semibold text-stone-900">
                    <span>6 Trained Detection Classes</span>
                    <span className="text-indigo-700 text-[11px] font-mono">YOLOv8 Ingest</span>
                  </div>
                  <div className="text-stone-600 mt-1">
                    <span className="font-mono text-[11px] text-stone-700">bin_empty</span> &bull; <span className="font-mono text-[11px] text-stone-700">bin_partial</span> &bull; <span className="font-mono text-[11px] text-stone-700">bin_full</span> &bull; <span className="font-mono text-[11px] text-stone-700">overflow</span> &bull; <span className="font-mono text-[11px] text-stone-700">litter_pile</span> &bull; <span className="font-mono text-[11px] text-stone-700">blocked_drain</span>
                  </div>
                </div>

                <div className="border border-stone-200 rounded-md p-3 hover:bg-stone-50 transition-colors">
                  <div className="flex items-center justify-between font-semibold text-stone-900">
                    <span>AI Before vs. After Cleanup Verification</span>
                    <span className="text-emerald-700 font-mono text-[11px]">Audit Proof</span>
                  </div>
                  <div className="text-stone-500 mt-1">
                    Compares resolution images against original hazard shots to confirm residual debris removal before ticket sign-off.
                  </div>
                </div>
              </div>
            </div>

            {/* Urban Microclimate & Cool Havens */}
            <div className="md:col-span-5 bg-white border border-stone-200 rounded-lg p-6 shadow-sm">
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">Module 3 • Microclimate Governance</span>
              <h3 className="text-lg font-bold text-stone-900 mt-3 mb-2">Heat-Island Index &amp; Cool Havens</h3>
              <p className="text-xs sm:text-sm text-stone-600 mb-4">
                Identifies thermal stress zones across campus quads and maps shaded canopies and eco-refuges for pedestrian comfort.
              </p>

              <div className="bg-stone-50 border border-stone-200 rounded-md p-3.5 text-xs">
                <div className="flex items-center justify-between font-semibold text-stone-900 pb-2 border-b border-stone-200 mb-2">
                  <span>Thermal Microclimate Index</span>
                  <span className="text-indigo-700 font-medium">Zone 01 Quad</span>
                </div>
                <div className="space-y-1.5 text-stone-600">
                  <div className="flex justify-between">
                    <span>Library Concrete Plaza:</span>
                    <span className="font-mono font-semibold text-rose-600">38.2°C (Extreme)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Central Tree Canopy Haven:</span>
                    <span className="font-mono font-semibold text-emerald-700">26.8°C (Comfortable)</span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-stone-200 text-[11px] text-stone-500">
                  Guides campus capital planning for greening and canopy expansion.
                </div>
              </div>
            </div>

          </div>

          {/* Feature 4: Role-Based Access Control Architecture */}
          <div className="bg-white border border-stone-200 rounded-lg p-6 shadow-sm">
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded">Module 4 • Role-Based Access Control (RBAC)</span>
            <h3 className="text-base font-bold text-stone-900 mt-2 mb-3">4 Specialized Consoles Engineered for Every Stakeholder</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-md">
                <div className="font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Student &amp; Citizen</span>
                </div>
                <p className="text-stone-600 leading-snug">
                  Public civic reporting, live ticket tracking, Eco-Points leaderboard, and cool havens navigator.
                </p>
              </div>

              <div className="p-3 bg-stone-50 border border-stone-200 rounded-md">
                <div className="font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-amber-600" />
                  <span>Contractor Field Lead</span>
                </div>
                <p className="text-stone-600 leading-snug">
                  Assigned beat work orders, SLA countdown timers, cleanup photo verification, and reassignment requests.
                </p>
              </div>

              <div className="p-3 bg-stone-50 border border-stone-200 rounded-md">
                <div className="font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Estate Management</span>
                </div>
                <p className="text-stone-600 leading-snug">
                  Zonal incident triage, contractor SLA audits, workforce leave authorization, and equipment dispatch.
                </p>
              </div>

              <div className="p-3 bg-stone-50 border border-stone-200 rounded-md">
                <div className="font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-slate-800" />
                  <span>Super Admin Console</span>
                </div>
                <p className="text-stone-600 leading-snug">
                  Master credential directory, automated CCTV pipeline controls, and campus microclimate planning.
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 5. METRICS STRIP BASED ON ACTUAL APP DATA */}
      <section className="py-12 border-b border-stone-200 bg-stone-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-stone-900">40+</div>
              <div className="text-xs text-stone-600 mt-1">Campus zones &amp; blocks tracked</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-stone-900">94.8%</div>
              <div className="text-xs text-stone-600 mt-1">Contractor on-time SLA resolution</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-stone-900">&lt;4 Hours</div>
              <div className="text-xs text-stone-600 mt-1">Median incident resolution SLA</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-stone-900">6 Classes</div>
              <div className="text-xs text-stone-600 mt-1">YOLO computer vision detector</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CONTACT DETAILS */}
      <section id="contact" className="py-16 border-b border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left: Contact Info */}
            <div className="lg:col-span-5">
              <h2 className="text-2xl font-bold text-stone-900">Deploy Campusr on your campus</h2>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                Whether you are a university registrar, estate director, municipal administrator, or student representative, connect with our deployment team for custom GIS mapping and camera pipeline onboarding.
              </p>

              <div className="mt-6 space-y-4 text-xs sm:text-sm">
                <div className="p-4 border border-stone-200 rounded-md bg-stone-50">
                  <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-indigo-700" />
                    <span>Direct Institutional Inquiries</span>
                  </div>
                  <a href="mailto:partnerships@campusr.io" className="text-indigo-700 hover:underline font-medium block mt-1">
                    partnerships@campusr.io
                  </a>
                  <div className="text-stone-500 text-xs mt-1">Direct replies within 4 business hours.</div>
                </div>

                <div className="p-4 border border-stone-200 rounded-md bg-stone-50">
                  <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-indigo-700" />
                    <span>Campus Operations Desk</span>
                  </div>
                  <div className="text-stone-800 font-medium mt-1">+1 (800) 492-CAMPUS</div>
                  <div className="text-stone-500 text-xs mt-1">Monday through Friday, 9:00 AM – 6:00 PM EST</div>
                </div>

                <div className="p-4 border border-stone-200 rounded-md bg-stone-50">
                  <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-indigo-700" />
                    <span>Operations Headquarters</span>
                  </div>
                  <div className="text-stone-700 mt-1">Campusr Technologies Inc.</div>
                  <div className="text-stone-500 text-xs">440 Tech Square, 6th Floor, Cambridge, MA 02139</div>
                </div>
              </div>
            </div>

            {/* Right: Demo Request Form */}
            <div className="lg:col-span-7 bg-stone-50 border border-stone-200 rounded-lg p-6 sm:p-8">
              <h3 className="text-base font-bold text-stone-900 mb-1">Schedule an institutional walkthrough</h3>
              <p className="text-xs text-stone-600 mb-6">We will configure a test sandbox with your campus block boundaries and camera network.</p>

              <form onSubmit={handleDemoSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-stone-800 mb-1">Your Name</label>
                    <input 
                      required 
                      type="text" 
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Dr. Jennifer Vance" 
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-md text-xs focus:outline-none focus:border-indigo-700"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-stone-800 mb-1">Official Email</label>
                    <input 
                      required 
                      type="email" 
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="name@university.edu" 
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-md text-xs focus:outline-none focus:border-indigo-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-stone-800 mb-1">Role / Department</label>
                    <select 
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-md text-xs text-stone-800 focus:outline-none focus:border-indigo-700"
                    >
                      <option value="Campus Director / Estate Head">Campus Director / Estate Head</option>
                      <option value="Municipal Sanitation Lead">Municipal Sanitation Lead</option>
                      <option value="Facility Contractor Manager">Facility Contractor Manager</option>
                      <option value="Student Representative">Student Representative</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-stone-800 mb-1">Campus Scale</label>
                    <select className="w-full px-3 py-2 bg-white border border-stone-300 rounded-md text-xs text-stone-800 focus:outline-none focus:border-indigo-700">
                      <option value="small">Under 50 Acres / 5,000 Students</option>
                      <option value="medium">50 – 200 Acres / 15,000 Students</option>
                      <option value="large">200+ Acres / Multi-Campus</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-stone-800 mb-1">Primary operational priorities</label>
                  <textarea 
                    rows={3} 
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="e.g. CCTV automated garbage detection, contractor SLA accountability, or heat-island microclimate mapping..." 
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-md text-xs focus:outline-none focus:border-indigo-700"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full py-2.5 px-4 bg-indigo-700 hover:bg-indigo-800 text-white font-medium text-xs rounded-md transition-colors shadow-sm"
                >
                  {formSubmitted ? 'Walkthrough Request Sent ✓' : 'Send Walkthrough Request'}
                </button>

                {formSubmitted && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-center text-xs">
                    Thank you! Our operations engineering team has received your inquiry and will follow up today.
                  </div>
                )}
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* 7. TERMS & CONDITIONS */}
      <section id="terms" className="py-16 border-b border-stone-200 bg-stone-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900">Terms &amp; Conditions</h2>
            <p className="text-xs text-stone-500 mt-1">Last updated: January 2026</p>
          </div>

          <div className="bg-white border border-stone-200 rounded-lg p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-stone-600 leading-relaxed">
            <div>
              <h3 className="font-bold text-stone-900 mb-1">1. Institutional Service Scope</h3>
              <p>
                Campusr is an urban planning, facility management, and civic operations governance platform provided by Campusr Technologies Inc. Access is provisioned under active institutional and municipal agreements.
              </p>
            </div>

            <div className="pt-4 border-t border-stone-100">
              <h3 className="font-bold text-stone-900 mb-1">2. Data Privacy &amp; Sensor Feeds</h3>
              <p>
                All CCTV video analytics, geotagged photos, and sensor telemetry remain the exclusive property of the contracting institution. Computer vision models execute edge and on-premise inference solely for object detection (waste, paver cracks, waterlogging) without facial recognition or personal profiling.
              </p>
            </div>

            <div className="pt-4 border-t border-stone-100">
              <h3 className="font-bold text-stone-900 mb-1">3. Role-Based Access Control &amp; Audit Logs</h3>
              <p>
                Clearance credentials and security PINs are enforced on all operational endpoints. Arbitrary persona switching within privileged accounts is strictly restricted. All work order modifications and before/after verification images are logged to immutable audit records.
              </p>
            </div>

            <div className="pt-4 border-t border-stone-100">
              <h3 className="font-bold text-stone-900 mb-1">4. Availability &amp; SLA Commitment</h3>
              <p>
                Campusr targets 99.9% uptime for core incident routing, dispatch queues, and microclimate feeds. Regional campus caches ensure incident reporting remains accessible during localized network downtime.
              </p>
            </div>

            <div className="pt-4 border-t border-stone-100">
              <h3 className="font-bold text-stone-900 mb-1">5. Legal Counsel Contact</h3>
              <p>
                For data processing agreements or regulatory compliance reviews, contact our legal counsel at <a href="mailto:legal@campusr.io" className="text-indigo-700 underline font-medium">legal@campusr.io</a> or mail Campusr Technologies Inc., 440 Tech Square, Cambridge, MA 02139.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 8. FOOTER & COPYRIGHT */}
      <footer className="py-8 bg-white text-xs text-stone-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-900">Campusr</span>
            <span>— Closed-Loop Campus Operations &amp; Governance.</span>
          </div>

          <div className="flex items-center gap-6 text-stone-600">
            <a href="#how-it-works" className="hover:text-stone-900 transition-colors">How it works</a>
            <a href="#features" className="hover:text-stone-900 transition-colors">Features</a>
            <a href="#contact" className="hover:text-stone-900 transition-colors">Contact</a>
            <a href="#terms" className="hover:text-stone-900 transition-colors">Terms</a>
            <button onClick={onNavigateToLogin} className="hover:text-indigo-700 font-medium">Log in</button>
          </div>

          <div>
            &copy; 2026 Campusr Technologies Inc. All rights reserved.
          </div>

        </div>
      </footer>

    </div>
  );
};
