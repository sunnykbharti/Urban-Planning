import React, { useState } from 'react';
import { 
  MaintenanceReport, 
  CampusBlock, 
  ActivityEvent,
  ReportCategory
} from '../types';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Plus, 
  Sparkles, 
  ShieldCheck, 
  Flame, 
  ThumbsUp, 
  Award, 
  Building2, 
  ArrowRight, 
  Camera, 
  Compass,
  CheckCircle,
  Eye,
  TreeDeciduous,
  Droplets,
  Scale,
  Box,
  UploadCloud,
  Scan
} from 'lucide-react';

interface StudentDashboardProps {
  reports: MaintenanceReport[];
  blocks: CampusBlock[];
  activities: ActivityEvent[];
  onOpenReportDrawer: () => void;
  onSelectReport: (report: MaintenanceReport) => void;
  onNavigateToTab: (tab: any) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  reports,
  blocks,
  activities,
  onOpenReportDrawer,
  onSelectReport,
  onNavigateToTab
}) => {
  const [filterTab, setFilterTab] = useState<'my_reports' | 'campus_updates' | 'cool_spots' | 'eco_score'>('my_reports');
  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [confirmedReports, setConfirmedReports] = useState<Record<string, number>>({});

  // Filter reports submitted by students or UIET citizen reporters
  const myReports = reports.filter(r => {
    // include reports with student role, or student reported, or fallback top 4
    return r.reportedBy?.role?.toLowerCase().includes('student') || 
           r.reportedBy?.role?.toLowerCase().includes('citizen') ||
           r.reportedBy?.name?.includes('Sunny') ||
           r.category === 'garbage' ||
           r.category === 'waterlogging';
  });

  const displayedReports = myReports.filter(r => {
    if (reportFilter === 'pending') return r.status !== 'resolved';
    if (reportFilter === 'resolved') return r.status === 'resolved';
    return true;
  });

  const resolvedCount = reports.filter(r => r.status === 'resolved').length;
  const activeCount = reports.filter(r => r.status !== 'resolved').length;

  const handleUpvote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmedReports(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  // Mock thermal cool spots on campus for students
  const coolHavens = [
    {
      id: 'haven-1',
      name: 'Central University Library (AC Commons)',
      location: 'Central Library, 2nd Floor',
      temp: '24.5°C',
      coolerBy: '-6.2°C cooler than outdoors',
      features: ['Air-Conditioned Reading Halls', 'Chilled RO Water Dispensers', 'High-Speed Wi-Fi'],
      status: 'Open • Quiet Zone'
    },
    {
      id: 'haven-2',
      name: 'UIET Shaded Pergola & Central Lawn',
      location: 'Between Block 1 & Block 2',
      temp: '28.0°C',
      coolerBy: '-3.8°C cooler under Neem Canopy',
      features: ['Dense Tree Shade Canopy', 'Stone Benches with USB Solar Charging', 'Lush Turf'],
      status: 'Open • Natural Breeze'
    },
    {
      id: 'haven-3',
      name: 'Science Block B Covered Corridor Walkway',
      location: 'Science Complex Quadrangle',
      temp: '27.2°C',
      coolerBy: '-4.1°C cooler (UV Shielded)',
      features: ['High-Ceiling Ventilated Arches', 'Filtered Cold Water Cooler', 'Pedestrian Walkway'],
      status: 'Open • Sheltered Path'
    }
  ];

  // Hostel / Block Cleanliness scoreboard
  const ecoRankings = [
    { rank: 1, name: 'UIET Block 1 (CSE & IT)', score: 94, badges: '🏆 Green Tech Campus', status: 'Spotless' },
    { rank: 2, name: 'Central University Library', score: 91, badges: '🌿 Zero Litter Zone', status: 'Clean' },
    { rank: 3, name: 'UIET Block 3 (ECE Wing)', score: 88, badges: '⚡ Solar Powered', status: 'Good' },
    { rank: 4, name: 'Boys Hostel Hall 4', score: 82, badges: '♻️ Segregation Champions', status: 'Fair' },
    { rank: 5, name: 'Science Block Labs', score: 79, badges: '💧 Water Reclaim', status: 'Action Needed' }
  ];

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#001e40] via-[#003366] to-[#0d5999] text-white p-6 md:p-8 shadow-md">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>CSJMU Student &amp; Resident Portal</span>
              <span className="text-white/40">&bull;</span>
              <span className="text-emerald-300">Active Campus Member</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Hello, Sunny Bharti 👋
            </h1>
            <p className="text-blue-100/90 text-sm leading-relaxed">
              Help keep CSJMU clean, green, and safe. Spot an overflowing bin, water leakage, or electrical hazard? 
              Snap a picture and report it directly to the campus sanitation authorities.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-blue-200/80">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-300" />
                UIET CSE • 3rd Year
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-300" />
                Campus Eco Contributor: <strong className="text-white">180 Points</strong>
              </span>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 flex-shrink-0">
            <button
              id="student-report-hazard-cta"
              onClick={onOpenReportDrawer}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 cursor-pointer active:scale-95"
            >
              <Camera className="w-5 h-5" />
              <span>Report Campus Hazard</span>
            </button>
            <button
              onClick={() => onNavigateToTab('map')}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Campus Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Student Fast Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">My Lodged Reports</p>
            <h3 className="text-xl font-bold text-slate-800">{myReports.length}</h3>
            <span className="text-[10px] text-blue-600 font-semibold">{activeCount} active in queue</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Resolved on Campus</p>
            <h3 className="text-xl font-bold text-slate-800">{resolvedCount}</h3>
            <span className="text-[10px] text-emerald-600 font-semibold">Verified clean by staff</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Avg Fix Time</p>
            <h3 className="text-xl font-bold text-slate-800">42 min</h3>
            <span className="text-[10px] text-amber-700 font-semibold">94% within SLA</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Eco Clean Score</p>
            <h3 className="text-xl font-bold text-slate-800">92/100</h3>
            <span className="text-[10px] text-indigo-600 font-semibold">UIET Campus Rank #1</span>
          </div>
        </div>
      </div>

      {/* Student Navigation Pill Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setFilterTab('my_reports')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            filterTab === 'my_reports'
              ? 'bg-[#001e40] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>My Reports &amp; Track Status ({myReports.length})</span>
        </button>

        <button
          onClick={() => setFilterTab('cool_spots')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            filterTab === 'cool_spots'
              ? 'bg-[#001e40] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TreeDeciduous className="w-4 h-4 text-emerald-500" />
          <span>Cool Havens &amp; Study Spots</span>
        </button>

        <button
          onClick={() => setFilterTab('eco_score')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            filterTab === 'eco_score'
              ? 'bg-[#001e40] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>Green Campus Leaderboard</span>
        </button>

        <button
          onClick={() => setFilterTab('campus_updates')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            filterTab === 'campus_updates'
              ? 'bg-[#001e40] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span>Campus Cleanliness Stream</span>
        </button>
      </div>

      {/* Tab 1: My Reports & Status Tracker */}
      {filterTab === 'my_reports' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-800">Your Lodged Reports &amp; Live Tracking</h2>
              <p className="text-xs text-slate-500">Track resolution progress from initial detection to beat cleanup</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setReportFilter('all')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                  reportFilter === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                All ({myReports.length})
              </button>
              <button
                onClick={() => setReportFilter('pending')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                  reportFilter === 'pending' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                In Progress ({myReports.filter(r => r.status !== 'resolved').length})
              </button>
              <button
                onClick={() => setReportFilter('resolved')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                  reportFilter === 'resolved' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Resolved ({myReports.filter(r => r.status === 'resolved').length})
              </button>
            </div>
          </div>

          {displayedReports.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-800">No reports in this category</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                All clear! If you notice any garbage overflow, broken pavement or drainage issue around UIET, report it now.
              </p>
              <button
                onClick={onOpenReportDrawer}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#001e40] text-white text-xs font-bold hover:bg-[#003366] transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Submit New Report</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedReports.map((report) => {
                const isResolved = report.status === 'resolved';
                const upvotes = (confirmedReports[report.id] || 0) + (isResolved ? 4 : 1);

                return (
                  <div
                    key={report.id}
                    onClick={() => onSelectReport(report)}
                    className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top bar with ID & status */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {report.ticketNumber || report.id}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            report.severity === 'urgent'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}>
                            {report.severity.toUpperCase()}
                          </span>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          isResolved
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800 animate-pulse'
                        }`}>
                          {isResolved ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>CLEANED &amp; VERIFIED</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>IN PROGRESS</span>
                            </>
                          )}
                        </span>
                      </div>

                      {/* Title & Location */}
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors line-clamp-1">
                        {report.title}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{report.location}</span>
                      </p>

                      {/* Waste Payload & Volume Badge if present */}
                      {((report.estimatedAmountKg || report.estimatedAmount?.weightKg) || report.category === 'garbage') && (
                        <div className="mt-2 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200/80 text-emerald-900 flex items-center justify-between text-[11px] font-semibold">
                          <span className="flex items-center gap-1">
                            <Scale className="w-3 h-3 text-emerald-600" />
                            <span>Waste: ~{report.estimatedAmountKg || report.estimatedAmount?.weightKg || 12.5} kg</span>
                          </span>
                          <span className="text-[10px] text-emerald-700 font-mono">
                            {report.estimatedVolumeM3 || report.estimatedAmount?.volumeM3 || 0.35} m³ vol
                          </span>
                        </div>
                      )}

                      {/* Before / After Photo Comparison */}
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="relative rounded-lg overflow-hidden bg-slate-100 aspect-video border border-slate-200">
                          <img 
                            src={report.beforeImageUrl || report.imageUrl || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80'} 
                            alt="Before" 
                            className="w-full h-full object-cover" 
                          />
                          <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            BEFORE
                          </span>
                        </div>

                        <div className="relative rounded-lg overflow-hidden bg-slate-100 aspect-video border border-slate-200 flex items-center justify-center">
                          {isResolved ? (
                            <>
                              <img 
                                src={report.afterImageUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=600&q=80'} 
                                alt="After Verification" 
                                className="w-full h-full object-cover" 
                              />
                              <span className="absolute bottom-1 left-1 bg-emerald-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <ShieldCheck className="w-2.5 h-2.5" /> VERIFIED
                              </span>
                            </>
                          ) : (
                            <div className="text-center p-2">
                              <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1 animate-spin" />
                              <span className="text-[10px] text-slate-500 font-medium leading-tight block">
                                Field crew dispatched to site
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Resolution Progress Bar */}
                      <div className="mt-3.5 pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between text-[11px] mb-1.5 text-slate-600 font-medium">
                          <span>Progress Status:</span>
                          <span className="font-bold text-slate-800">
                            {isResolved ? '4/4 Completed' : '2/4 Dispatched to Beat'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
                          <div className="bg-blue-600 h-full w-1/4" title="Reported" />
                          <div className="bg-blue-500 h-full w-1/4" title="Dispatched" />
                          <div className={`${isResolved ? 'bg-emerald-500' : 'bg-slate-200'} h-full w-1/4`} title="Action" />
                          <div className={`${isResolved ? 'bg-emerald-600' : 'bg-slate-200'} h-full w-1/4`} title="Verified" />
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-semibold">
                          <span>Reported</span>
                          <span>Dispatched</span>
                          <span>In-Progress</span>
                          <span>Verified</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        onClick={(e) => handleUpvote(report.id, e)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                          confirmedReports[report.id]
                            ? 'bg-emerald-50 text-emerald-700 font-bold'
                            : 'hover:bg-slate-100 text-slate-600'
                        }`}
                        title="Confirm report or thank maintenance team"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{upvotes} students confirmed</span>
                      </button>

                      <span className="text-blue-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Cool Havens & Thermal Comfort Finder */}
      {filterTab === 'cool_spots' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-emerald-900 flex items-center gap-2">
                <TreeDeciduous className="w-5 h-5 text-emerald-600" />
                <span>CSJMU Thermal Comfort &amp; Shaded Havens</span>
              </h2>
              <p className="text-xs text-emerald-800">
                Beat the heat during campus walks! These spots have high tree canopy, cold water dispensers, and low surface temperature.
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('heatisland')}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>Open Campus Heat Map</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {coolHavens.map((haven) => (
              <div key={haven.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      {haven.temp}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">{haven.status}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">{haven.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{haven.location}</p>
                  <p className="text-xs font-semibold text-emerald-600 mt-2">{haven.coolerBy}</p>

                  <div className="mt-3 space-y-1.5">
                    {haven.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onNavigateToTab('map')}
                  className="mt-4 pt-3 border-t border-slate-100 w-full text-center text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center justify-center gap-1"
                >
                  <span>Locate On Map</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Green Campus Leaderboard */}
      {filterTab === 'eco_score' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>CSJMU Clean &amp; Green Department Rankings</span>
                </h2>
                <p className="text-xs text-slate-500">Based on rapid resolution, waste segregation, and tree canopy health</p>
              </div>
              <div className="text-xs bg-amber-50 text-amber-800 font-bold px-3 py-1.5 rounded-lg border border-amber-200">
                Monthly Eco Cup 🌿
              </div>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {ecoRankings.map((item) => (
                <div key={item.rank} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm ${
                      item.rank === 1 ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-300' :
                      item.rank === 2 ? 'bg-slate-200 text-slate-700' :
                      item.rank === 3 ? 'bg-amber-50 text-amber-900' : 'bg-slate-100 text-slate-500'
                    }`}>
                      #{item.rank}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">{item.name}</h4>
                      <span className="text-xs text-slate-500 font-medium">{item.badges}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-800">{item.score}/100</span>
                    <span className="block text-[10px] font-bold text-emerald-600">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Campus Cleanliness Stream */}
      {filterTab === 'campus_updates' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-800 mb-1">Campus Cleanliness &amp; Works Live Stream</h2>
            <p className="text-xs text-slate-500 mb-4">Real-time updates posted by CSJMU Sanitation Teams and campus marshals</p>

            <div className="space-y-3">
              {activities.slice(0, 8).map((act) => (
                <div key={act.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-800 mt-0.5">
                    {act.type === 'resolved' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Building2 className="w-4 h-4 text-[#001e40]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-800 truncate">{act.title}</p>
                      <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap">{act.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{act.description}</p>
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 mt-1 font-medium">
                      <MapPin className="w-3 h-3" />
                      {act.location}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
