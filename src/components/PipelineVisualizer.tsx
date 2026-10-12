import React, { useState } from 'react';
import { 
  Scan, 
  MapPin, 
  ShieldCheck, 
  Send, 
  CheckCircle2, 
  ArrowRight, 
  Cpu, 
  Clock, 
  Layers, 
  ChevronRight, 
  Sparkles,
  PhoneCall,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { DetectionClass, SensorSourceType, AuthorityResolution } from '../types';
import { resolveAuthorityAPI, simulateCVDetectionAPI } from '../api/client';

export const PipelineVisualizer: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(3); // Default to ARE stage highlighting the core engine
  const [selectedSource, setSelectedSource] = useState<SensorSourceType>('DRONE_SWEEP');
  const [selectedClass, setSelectedClass] = useState<DetectionClass>('overflow');
  const [coordinates, setCoordinates] = useState<{ x: number; y: number }>({ x: 38, y: 38 });
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [cvResult, setCvResult] = useState<any>({
    confidence: 0.94,
    boundingBox: { ymin: 0.28, xmin: 0.32, ymax: 0.68, xmax: 0.72 },
    estimatedVolumeM3: 0.45
  });
  const [resolutionResult, setResolutionResult] = useState<AuthorityResolution>({
    zoneId: 'zone-academic',
    zoneName: 'Academic Precinct (UIET Campus)',
    ward: 'Ward 4 - Academic Division',
    authority: 'CSJMU Directorate of Estate & Works',
    department: 'Campus Solid Waste & Academic Sanitation',
    supervisor: {
      id: 'SUP-101',
      name: 'Er. R. K. Sharma',
      role: 'Executive Sanitation Engineer',
      phone: '+91 98765 43210',
      whatsapp: '+919876543210'
    },
    assignedTeam: {
      teamId: 'BEAT-01',
      name: 'Sanitation Beat Alpha (UIET)',
      lead: 'Ramesh Kumar'
    },
    severity: 'HIGH',
    slaMinutes: 60,
    deadlineAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    resolutionPath: [
      'Coordinates (38%, 38%)',
      'Ward 4 - Academic Division',
      'CSJMU Directorate of Estate & Works',
      'Campus Solid Waste & Academic Sanitation',
      'Er. R. K. Sharma (+91 98765 43210)',
      'Sanitation Beat Alpha (UIET)',
      'Target SLA: 60 Minutes'
    ]
  });

  const runSimulation = async () => {
    setIsSimulating(true);
    try {
      const cv = await simulateCVDetectionAPI(selectedSource, selectedClass);
      setCvResult(cv);
      const res = await resolveAuthorityAPI(coordinates, selectedClass);
      setResolutionResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  const stages = [
    {
      step: 1,
      name: 'Detect',
      tech: 'YOLO / CV',
      icon: Scan,
      color: 'from-amber-500 to-orange-600',
      tag: 'Multi-Sensor Ingestion'
    },
    {
      step: 2,
      name: 'Geotag',
      tech: 'GPS + GIS Mapping',
      icon: MapPin,
      color: 'from-blue-500 to-cyan-600',
      tag: 'Spatial Containment'
    },
    {
      step: 3,
      name: 'Authority Engine',
      tech: 'ARE Decision Matrix',
      icon: ShieldCheck,
      color: 'from-emerald-500 to-teal-600',
      tag: 'Core Urban Logic'
    },
    {
      step: 4,
      name: 'Dispatch',
      tech: 'SLA + WhatsApp/SMS',
      icon: Send,
      color: 'from-purple-500 to-indigo-600',
      tag: 'Field Routing'
    },
    {
      step: 5,
      name: 'Verify & Close',
      tech: 'Before/After CV Delta',
      icon: CheckCircle2,
      color: 'from-green-500 to-emerald-600',
      tag: 'Audit Closed-Loop'
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Urban Operations Pipeline Architecture
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            5-Stage Civic Workflow & Authority Resolution Engine (ARE)
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            Decoupling physical data sources (Drone, CCTV, Mobile) from civic execution. The central system transforms raw visual detection into a legally-bound, ward-routed municipal ticket with guaranteed SLA response times.
          </p>
        </div>
      </div>

      {/* 5 Stages Navigation Track */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {stages.map((s) => {
          const Icon = s.icon;
          const isCurrent = activeStage === s.step;
          return (
            <button
              key={s.step}
              onClick={() => setActiveStage(s.step)}
              className={`text-left p-4 rounded-xl border transition-all duration-200 relative group ${
                isCurrent 
                  ? 'bg-slate-900 border-indigo-500 text-white shadow-lg ring-2 ring-indigo-500/20' 
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {s.step}
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">
                  {s.tag}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Icon className={`w-4 h-4 ${isCurrent ? 'text-indigo-400' : 'text-slate-400'}`} />
                <h3 className="font-bold text-sm">{s.name}</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">{s.tech}</p>
              {isCurrent && (
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-indigo-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Interactive Architecture Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Controls */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-600" />
              Sensor & Telemetry Input
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-medium">
              Interchangeable Source
            </span>
          </div>

          {/* Source Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2">
              1. Ingestion Stream (Sensor Source)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'DRONE_SWEEP', label: 'Drone Sweep', sub: 'DJI Matrice UAV' },
                { id: 'CCTV_FIXED', label: 'Fixed CCTV', sub: 'Axis PTZ 4K' },
                { id: 'CITIZEN_MOBILE', label: 'Mobile App', sub: 'Civic Snap' },
                { id: 'SWEEPER_VEHICLE', label: 'Vehicle Cam', sub: 'Patrol Truck' }
              ].map((src) => (
                <button
                  key={src.id}
                  onClick={() => setSelectedSource(src.id as SensorSourceType)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    selectedSource === src.id
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-semibold shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <div className="text-xs font-bold">{src.label}</div>
                  <div className="text-[10px] text-slate-500">{src.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Detection Class Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2">
              2. Target Computer Vision Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value as DetectionClass)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="overflow">overflow (Spilling bin, Critical)</option>
              <option value="blocked_drain">blocked_drain (Storm drain clog, Emergency)</option>
              <option value="litter_pile">litter_pile (Uncontained waste scattering)</option>
              <option value="bin_full">bin_full (100% capacity receptacle)</option>
              <option value="bin_partial">bin_partial (50% routine audit)</option>
              <option value="bin_empty">bin_empty (Sanitary / clear)</option>
            </select>
          </div>

          {/* Coordinate / Zone Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2">
              3. Spatial Coordinates (Campus Grid %)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-slate-500 font-mono">X Coord ({coordinates.x}%)</span>
                <input
                  type="range"
                  min="15"
                  max="85"
                  value={coordinates.x}
                  onChange={(e) => setCoordinates({ ...coordinates, x: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer accent-indigo-600"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-mono">Y Coord ({coordinates.y}%)</span>
                <input
                  type="range"
                  min="20"
                  max="90"
                  value={coordinates.y}
                  onChange={(e) => setCoordinates({ ...coordinates, y: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Run ARE Button */}
          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {isSimulating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Executing Pipeline & ARE...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Run Authority Resolution Engine
              </>
            )}
          </button>
        </div>

        {/* Right Column: The Authority Resolution Cascade */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Authority Resolution Engine (ARE) Live Output
              </h2>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60">
                SLA: {resolutionResult.slaMinutes} Minutes
              </span>
            </div>

            {/* Hierarchical Tree Cascade */}
            <div className="mt-5 space-y-3 font-mono text-xs">
              {/* Step A: GPS & GIS Coordinates */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold">
                  1
                </div>
                <div className="flex-1">
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    Geospatial Fix
                  </div>
                  <div className="font-bold text-slate-800 text-sm">
                    Map ({coordinates.x}%, {coordinates.y}%) &bull; GPS (26.4952° N, 80.2921° E)
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5 font-sans">
                    Containment match: <span className="font-semibold text-slate-700">{resolutionResult.ward}</span>
                  </div>
                </div>
              </div>

              {/* Step B: Municipal Authority */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 font-bold">
                  2
                </div>
                <div className="flex-1">
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    Institutional Jurisdiction & Department
                  </div>
                  <div className="font-bold text-slate-800 text-sm">
                    {resolutionResult.authority}
                  </div>
                  <div className="text-indigo-600 font-semibold text-xs mt-0.5 font-sans">
                    &rarr; {resolutionResult.department}
                  </div>
                </div>
              </div>

              {/* Step C: Designated Supervisor */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-bold">
                  3
                </div>
                <div className="flex-1">
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    Responsible Sanitation Supervisor
                  </div>
                  <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    {resolutionResult.supervisor.name}
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-sans font-medium">
                      On-Shift Active
                    </span>
                  </div>
                  <div className="text-slate-600 text-xs mt-1 flex items-center gap-3 font-sans">
                    <span className="flex items-center gap-1">
                      <PhoneCall className="w-3 h-3 text-slate-400" />
                      {resolutionResult.supervisor.phone}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <MessageSquare className="w-3 h-3" />
                      WhatsApp Bot Dispatched
                    </span>
                  </div>
                </div>
              </div>

              {/* Step D: Assigned Sanitation Beat / Team */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold">
                  4
                </div>
                <div className="flex-1">
                  <div className="text-[11px] uppercase tracking-wider text-emerald-800 font-semibold">
                    Assigned Rapid Response Beat
                  </div>
                  <div className="font-bold text-emerald-950 text-sm">
                    {resolutionResult.assignedTeam.name}
                  </div>
                  <div className="text-emerald-700 text-xs mt-0.5 font-sans flex items-center gap-2">
                    <span>Lead: <b>{resolutionResult.assignedTeam.lead}</b></span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Strict SLA: <b>{resolutionResult.slaMinutes} Mins</b>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Generated Structured Work Order Preview */}
          <div className="mt-5 p-4 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-emerald-400 font-mono font-bold">INCIDENT #1042 OFFICIAL WORK ORDER</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                STATUS: DISPATCHED
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono">
              <div>Type: <span className="text-white font-semibold">{selectedClass}</span></div>
              <div>Severity: <span className="text-amber-400 font-semibold">{resolutionResult.severity}</span></div>
              <div>Zone: <span className="text-white">{resolutionResult.zoneName}</span></div>
              <div>SLA Target: <span className="text-emerald-300 font-semibold">{resolutionResult.slaMinutes}m countdown</span></div>
              <div className="col-span-2">Supervisor: <span className="text-white">{resolutionResult.supervisor.name} ({resolutionResult.supervisor.phone})</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
