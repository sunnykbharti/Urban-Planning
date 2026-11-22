import React, { useState } from 'react';
import { 
  BookOpen,
  MapPin, 
  Camera, 
  ArrowRight, 
  LogIn, 
  Flame, 
  Wrench, 
  Activity, 
  TreeDeciduous,
  Clock,
  Check,
  Shield,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Footer } from './Footer';

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
  const [locationInput, setLocationInput] = useState('UIET Block 1 • Pedestrian Quad');
  const [issueInput, setIssueInput] = useState('Overflowing recycling bin');
  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedTime, setSelectedTime] = useState('Immediate dispatch');

  const handleAppEntry = () => {
    if (isAuthenticated) {
      onNavigateToApp();
    } else {
      onNavigateToLogin();
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-gray-100 selection:text-black">
      
      {/* 1. UBER-STYLE BLACK TOP NAVBAR */}
      <header className="w-full bg-black text-white h-16 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-full flex items-center justify-between">
          
          {/* Left: Brand & Nav Links */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-2xl font-bold tracking-tight text-white hover:text-gray-200 transition-colors cursor-pointer"
            >
              Campusr
            </button>

            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-300">
              <a href="#explore" className="hover:text-white transition-colors">Overview</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">Operations</a>
              <a href="#plan" className="hover:text-white transition-colors">Planning</a>
              <a href="#features" className="hover:text-white transition-colors">Services</a>
              <a href="#terms" className="hover:text-white transition-colors">Governance</a>
            </nav>
          </div>

          {/* Right: Language, Help, Login, Sign up Button */}
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="hidden sm:inline-flex text-xs font-medium text-gray-300 px-2 py-1 rounded-full border border-gray-700">
              CSJMU Kanpur
            </span>

            <a 
              href="mailto:support@campusr.io" 
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors hidden sm:inline"
            >
              Help
            </a>

            {!isAuthenticated ? (
              <>
                <button
                  onClick={onNavigateToLogin}
                  className="text-sm font-medium text-white hover:text-gray-300 px-3 py-1.5 transition-colors cursor-pointer"
                >
                  Log in
                </button>
                <button
                  onClick={onNavigateToLogin}
                  className="px-4 py-2 text-sm font-semibold text-black bg-white hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
                >
                  Sign in
                </button>
              </>
            ) : (
              <button
                onClick={onNavigateToApp}
                className="px-4 py-2 text-sm font-semibold text-black bg-white hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
              >
                Go to App
              </button>
            )}
          </div>

        </div>
      </header>

      {/* 2. HERO SECTION (MATCHING UBER SCREENSHOT 1) */}
      <section className="py-12 lg:py-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left: Ride / Request Box */}
            <div className="lg:col-span-6 xl:col-span-5">
              
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-2">
                <MapPin className="w-3.5 h-3.5 text-black" />
                <span>CSJMU Precinct, Kanpur • <span className="underline cursor-pointer">Live Operations</span></span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-black leading-[1.08] mb-6">
                Request civic action
              </h1>

              {/* Minimalist Dispatch Form (Uber Style) */}
              <div className="space-y-3">
                
                {/* Mode Selector */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-semibold text-black cursor-pointer transition-colors mb-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Report now ▾</span>
                </div>

                {/* Input 1: Location */}
                <div className="relative flex items-center bg-gray-100 rounded-lg px-3.5 py-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-black shrink-0 mr-3"></span>
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    placeholder="Campus location (e.g. Library Quad)"
                    className="w-full bg-transparent text-sm font-medium text-black placeholder-gray-500 focus:outline-none"
                  />
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                </div>

                {/* Input 2: Problem Description */}
                <div className="relative flex items-center bg-gray-100 rounded-lg px-3.5 py-3">
                  <span className="w-2.5 h-2.5 bg-black shrink-0 mr-3"></span>
                  <input
                    type="text"
                    value={issueInput}
                    onChange={(e) => setIssueInput(e.target.value)}
                    placeholder="Problem type (e.g. Overflow, Pavement crack)"
                    className="w-full bg-transparent text-sm font-medium text-black placeholder-gray-500 focus:outline-none"
                  />
                  <Wrench className="w-4 h-4 text-gray-400 shrink-0" />
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  <button
                    onClick={handleAppEntry}
                    className="w-full sm:w-auto px-7 py-3.5 bg-black hover:bg-gray-800 text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer text-center"
                  >
                    {isAuthenticated ? 'Dispatch to Field Crew' : 'Sign in to file report'}
                  </button>
                </div>

              </div>

            </div>

            {/* Right: Clean Visual / Mockup Preview */}
            <div className="lg:col-span-6 xl:col-span-7">
              <div className="rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 relative aspect-[16/10] flex items-center justify-center p-6">
                
                {/* Realistic Dashboard Strip */}
                <div className="w-full max-w-lg bg-white rounded-xl shadow-lg border border-gray-200 p-5 space-y-4">
                  
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                      <span className="font-semibold text-black">Beat 01 Active Sweep</span>
                    </div>
                    <span className="text-gray-500 font-mono text-[11px]">SLA: 1h 42m remaining</span>
                  </div>

                  <div className="flex items-start gap-3.5 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold shrink-0">
                      RK
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-black">Ramesh Kumar (BVG Beat Lead)</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">Assigned</span>
                      </div>
                      <p className="text-gray-600 mt-0.5">En route to UIET Block 1 Pedestrian Quad • Paver clearance</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg border border-gray-200 bg-white">
                      <div className="text-[11px] text-gray-500">CCTV Camera Sweeps</div>
                      <div className="text-sm font-bold text-black mt-0.5">18 Active cameras</div>
                    </div>
                    <div className="p-2.5 rounded-lg border border-gray-200 bg-white">
                      <div className="text-[11px] text-gray-500">Peak Campus Comfort</div>
                      <div className="text-sm font-bold text-black mt-0.5">27°C Shade canopy</div>
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. UBER NOTIFICATION STRIP (MATCHING UBER ORANGE BANNER IN SCREENSHOT 1) */}
      <div className="w-full bg-[#ff7d44] text-black py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs sm:text-sm font-medium">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-black shrink-0"></span>
            <span>Civic SLA Promise: Urgent hazards resolved within 2.0 hours. Transparent institutional accountability.</span>
          </div>
          <a href="#terms" className="underline font-semibold shrink-0 ml-4 hidden sm:inline">
            View SLA terms
          </a>
        </div>
      </div>

      {/* 4. EXPLORE GRID (MATCHING UBER SCREENSHOT 2 "Explore what you can do with Uber") */}
      <section id="explore" className="py-16 lg:py-24 border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-black mb-10">
            Explore what you can do with Campusr
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1: Incidents */}
            <div className="bg-[#f6f6f6] rounded-2xl p-6 flex flex-col justify-between h-56 hover:bg-[#efefef] transition-colors">
              <div>
                <h3 className="text-lg font-bold text-black">Incidents</h3>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  Report overflowing bins, broken paving, or water hazards with live status and photo evidence.
                </p>
              </div>
              <div>
                <button
                  onClick={handleAppEntry}
                  className="px-4 py-2 bg-white text-black font-semibold text-xs rounded-full border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Details
                </button>
              </div>
            </div>

            {/* Card 2: Operations */}
            <div className="bg-[#f6f6f6] rounded-2xl p-6 flex flex-col justify-between h-56 hover:bg-[#efefef] transition-colors">
              <div>
                <h3 className="text-lg font-bold text-black">Work orders</h3>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  Direct dispatch to BVG beat leads with single-click assignment and SLA countdowns.
                </p>
              </div>
              <div>
                <button
                  onClick={handleAppEntry}
                  className="px-4 py-2 bg-white text-black font-semibold text-xs rounded-full border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Details
                </button>
              </div>
            </div>

            {/* Card 3: Campus map */}
            <div className="bg-[#f6f6f6] rounded-2xl p-6 flex flex-col justify-between h-56 hover:bg-[#efefef] transition-colors">
              <div>
                <h3 className="text-lg font-bold text-black">Campus map</h3>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  Interactive GIS map with exact building footprints, waste markers, and pedestrian paths.
                </p>
              </div>
              <div>
                <button
                  onClick={handleAppEntry}
                  className="px-4 py-2 bg-white text-black font-semibold text-xs rounded-full border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Details
                </button>
              </div>
            </div>

            {/* Card 4: CCTV Sweeps */}
            <div className="bg-[#f6f6f6] rounded-2xl p-6 flex flex-col justify-between h-56 hover:bg-[#efefef] transition-colors">
              <div>
                <h3 className="text-lg font-bold text-black">CCTV sweeps</h3>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  Fixed camera feeds monitor high-traffic quads and automatically flag overflow spots.
                </p>
              </div>
              <div>
                <button
                  onClick={handleAppEntry}
                  className="px-4 py-2 bg-white text-black font-semibold text-xs rounded-full border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Details
                </button>
              </div>
            </div>

            {/* Card 5: Cool havens */}
            <div className="bg-[#f6f6f6] rounded-2xl p-6 flex flex-col justify-between h-56 hover:bg-[#efefef] transition-colors">
              <div>
                <h3 className="text-lg font-bold text-black">Cool havens</h3>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  Microclimate heat-island layer pinpointing high-tree-canopy shade and cool corridors.
                </p>
              </div>
              <div>
                <button
                  onClick={handleAppEntry}
                  className="px-4 py-2 bg-white text-black font-semibold text-xs rounded-full border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Details
                </button>
              </div>
            </div>

            {/* Card 6: Planning board */}
            <div className="bg-[#f6f6f6] rounded-2xl p-6 flex flex-col justify-between h-56 hover:bg-[#efefef] transition-colors">
              <div>
                <h3 className="text-lg font-bold text-black">Planning board</h3>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  Track ₹ budgets, contractor assignees, and target dates across 5 clear lifecycle stages.
                </p>
              </div>
              <div>
                <button
                  onClick={handleAppEntry}
                  className="px-4 py-2 bg-white text-black font-semibold text-xs rounded-full border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Details
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 5. PLAN FOR LATER SECTION (MATCHING UBER SCREENSHOT 3) */}
      <section id="plan" className="py-16 lg:py-24 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-black mb-10">
            Schedule campus operations
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Schedule Card with soft pastel background (Uber style) */}
            <div className="lg:col-span-7 bg-[#cde4e8] rounded-2xl p-8 sm:p-10 flex flex-col justify-between min-h-[380px]">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-black mb-3">
                  Set recurring cleaning sweeps &amp; beat schedules
                </h3>
                <p className="text-sm text-gray-800 max-w-md">
                  Choose specific quad dates and times to deploy automated CCTV sweeps or contractor crews in advance.
                </p>
              </div>

              <div className="mt-8 space-y-4 max-w-sm">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <span className="text-gray-500 block text-[10px]">Date</span>
                    <span className="font-semibold text-black mt-0.5 block">{selectedDate}</span>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <span className="text-gray-500 block text-[10px]">Window</span>
                    <span className="font-semibold text-black mt-0.5 block">{selectedTime}</span>
                  </div>
                </div>

                <button
                  onClick={handleAppEntry}
                  className="w-full py-3 bg-black hover:bg-gray-800 text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer"
                >
                  Open Operations Schedule
                </button>
              </div>
            </div>

            {/* Right: Benefits checklist (Uber style) */}
            <div className="lg:col-span-5 space-y-6 lg:pl-6">
              <h4 className="text-xl font-bold text-black">Operational standards</h4>

              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <strong className="text-black">2-Hour SLA for urgent tasks</strong>
                    <p className="text-gray-600 text-xs mt-0.5">Automated timer alerts estate engineers before deadlines breach.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <strong className="text-black">Verified closure documentation</strong>
                    <p className="text-gray-600 text-xs mt-0.5">Before and after visual audit records for sanitation contractor review.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <strong className="text-black">Strict role-based governance</strong>
                    <p className="text-gray-600 text-xs mt-0.5">Distinct access tiers for students, beat staff, engineering, and administration.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a href="#terms" className="text-xs font-semibold text-black underline">
                  See service terms
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. THREE-COLUMN CARDS (MATCHING UBER SCREENSHOT 4) */}
      <section id="features" className="py-16 lg:py-24 border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-black mb-10">
            Civic tools built for campus scale
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="space-y-4">
              <div className="aspect-[4/3] rounded-2xl bg-[#eef3f6] border border-gray-200 flex items-center justify-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center">
                  <Wrench className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-black">Work order routing</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Assign beats with two clicks, track in-progress jobs, and review lead technicians across all blocks.
              </p>
              <div>
                <button
                  onClick={handleAppEntry}
                  className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white font-semibold text-xs rounded-full transition-colors cursor-pointer"
                >
                  Explore work orders
                </button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="space-y-4">
              <div className="aspect-[4/3] rounded-2xl bg-[#eef3f6] border border-gray-200 flex items-center justify-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center">
                  <Camera className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-black">18 Camera sweep nodes</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Automated sweep schedules scan library approaches, student hostels, and quads for paver and waste issues.
              </p>
              <div>
                <button
                  onClick={handleAppEntry}
                  className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white font-semibold text-xs rounded-full transition-colors cursor-pointer"
                >
                  Explore CCTV sweeps
                </button>
              </div>
            </div>

            {/* Card 3 */}
            <div className="space-y-4">
              <div className="aspect-[4/3] rounded-2xl bg-[#eef3f6] border border-gray-200 flex items-center justify-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center">
                  <TreeDeciduous className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-black">Heat island mitigation</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Surface temperature zones mapped against tree canopies to pinpoint optimal shade structures and seating.
              </p>
              <div>
                <button
                  onClick={handleAppEntry}
                  className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white font-semibold text-xs rounded-full transition-colors cursor-pointer"
                >
                  Explore cool havens
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 7. TERMS & LEGAL SECTION */}
      <section id="terms" className="py-16 bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-black">Institutional Governance &amp; Terms</h2>
            <p className="text-xs text-gray-500 mt-1">CSJMU Urban Planning &amp; Facility Operations Platform</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <div>
              <h3 className="font-bold text-black mb-1">1. Scope of Operations</h3>
              <p>
                Campusr delivers centralized civic issue lodging, CCTV visual sweeps, and microclimate data for Chhatrapati Shahu Ji Maharaj University (CSJMU) precinct.
              </p>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <h3 className="font-bold text-black mb-1">2. Single Sign-On &amp; Role Integrity</h3>
              <p>
                Access to operational queues requires verified university credentials. Switching privileges is strictly monitored with audit records.
              </p>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <h3 className="font-bold text-black mb-1">3. Privacy &amp; Imagery</h3>
              <p>
                All camera feeds and citizen report photos are processed solely for civic infrastructure maintenance without personal identification profiling.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 8. UNIFIED UBER FOOTER */}
      <Footer 
        onNavigateToLanding={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onNavigateToLogin={onNavigateToLogin}
      />

    </div>
  );
};
