import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Thermometer, 
  Trees, 
  Building, 
  Footprints, 
  Droplets, 
  Sun, 
  Umbrella, 
  Compass, 
  Layers, 
  Sparkles, 
  ArrowDownRight, 
  Sliders, 
  ShieldAlert, 
  CheckCircle2, 
  Info, 
  ArrowRight,
  MapPin,
  Wind
} from 'lucide-react';
import { 
  HeatIslandLayer, 
  InterventionCategory, 
  MicroclimateSector, 
  MicroclimateSummary 
} from '../types';
import { 
  fetchMicroclimateSectors, 
  fetchMicroclimateInterventions, 
  fetchMicroclimateSummary, 
  simulateMitigationAPI 
} from '../api/client';
import { 
  defaultMicroclimateSectors, 
  defaultPlanningInterventions, 
  defaultMicroclimateSummary 
} from '../data/microclimateData';

export const HeatIslandMapView: React.FC = () => {
  // Layer Selection State
  const [activeLayer, setActiveLayer] = useState<HeatIslandLayer>('composite');
  const [activeInterventionTab, setActiveInterventionTab] = useState<InterventionCategory>('treePlanting');
  const [selectedSectorId, setSelectedSectorId] = useState<string>('sec-uiet-courtyard');
  
  // Data States with guaranteed default initial values
  const [sectors, setSectors] = useState<MicroclimateSector[]>(defaultMicroclimateSectors);
  const [interventions, setInterventions] = useState<any>(defaultPlanningInterventions);
  const [summary, setSummary] = useState<MicroclimateSummary>(defaultMicroclimateSummary);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Simulation Sliders
  const [addedTrees, setAddedTrees] = useState<number>(30);
  const [coolPavePct, setCoolPavePct] = useState<number>(60);
  const [shadeSqm, setShadeSqm] = useState<number>(200);
  const [simResult, setSimResult] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [secData, intData, sumData] = await Promise.all([
          fetchMicroclimateSectors(),
          fetchMicroclimateInterventions(),
          fetchMicroclimateSummary()
        ]);

        if (secData && secData.length > 0) setSectors(secData);
        if (intData) setInterventions(intData);
        if (sumData) setSummary(sumData);
      } catch (err) {
        console.warn('Using default microclimate dataset');
      }
    }
    loadData();
  }, []);

  // Update simulation when parameters or selected sector change
  useEffect(() => {
    simulateMitigationAPI(selectedSectorId, addedTrees, coolPavePct, shadeSqm).then((res) => {
      if (res) setSimResult(res);
    });
  }, [selectedSectorId, addedTrees, coolPavePct, shadeSqm]);

  const selectedSector = sectors.find(s => s.id === selectedSectorId) || sectors[0] || defaultMicroclimateSectors[0];

  // Helper to color sectors according to active layer
  const getSectorLayerStyle = (sector: MicroclimateSector) => {
    switch (activeLayer) {
      case 'temperature':
        if (sector.metrics.surfaceTempC >= 42) return 'bg-red-600/75 border-red-500 text-white';
        if (sector.metrics.surfaceTempC >= 39) return 'bg-orange-500/75 border-orange-400 text-white';
        if (sector.metrics.surfaceTempC >= 35) return 'bg-amber-400/70 border-amber-300 text-slate-900';
        return 'bg-emerald-500/75 border-emerald-400 text-white';

      case 'canopy':
        if (sector.metrics.treeCanopyPct >= 60) return 'bg-emerald-600/80 border-emerald-400 text-white';
        if (sector.metrics.treeCanopyPct >= 25) return 'bg-lime-500/70 border-lime-400 text-slate-900';
        return 'bg-amber-200/75 border-amber-400 text-amber-950';

      case 'density':
        if (sector.metrics.buildingDensityPct >= 60) return 'bg-purple-600/75 border-purple-400 text-white';
        if (sector.metrics.buildingDensityPct >= 30) return 'bg-indigo-400/70 border-indigo-300 text-white';
        return 'bg-blue-200/70 border-blue-400 text-blue-950';

      case 'pavement':
        if (sector.metrics.pavedSurfacePct >= 75) return 'bg-slate-700/85 border-slate-500 text-white';
        if (sector.metrics.pavedSurfacePct >= 40) return 'bg-slate-400/70 border-slate-300 text-slate-900';
        return 'bg-emerald-300/70 border-emerald-400 text-slate-900';

      case 'water':
        if (sector.metrics.waterBodyBufferM === 0) return 'bg-cyan-500/85 border-cyan-300 text-white animate-pulse';
        if (sector.metrics.waterBodyBufferM <= 200) return 'bg-sky-400/60 border-sky-300 text-slate-900';
        return 'bg-slate-200/70 border-slate-300 text-slate-600';

      case 'pedestrian':
        if (sector.metrics.pedestrianFootfall === 'EXTREME') return 'bg-rose-600/80 border-rose-400 text-white';
        if (sector.metrics.pedestrianFootfall === 'HIGH') return 'bg-amber-500/75 border-amber-400 text-white';
        return 'bg-slate-200/60 border-slate-300 text-slate-700';

      case 'composite':
      default:
        if (sector.classification === 'CRITICAL_HOT_ZONE') return 'bg-red-600/85 border-red-400 text-white shadow-lg ring-2 ring-red-500/40';
        if (sector.classification === 'HIGH_STRESS') return 'bg-orange-500/80 border-orange-400 text-white';
        if (sector.classification === 'MODERATE') return 'bg-blue-500/75 border-blue-300 text-white';
        return 'bg-emerald-500/80 border-emerald-400 text-white ring-2 ring-emerald-400/40';
    }
  };

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto p-2 sm:p-4 pb-20">
      {/* Title Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 bottom-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold mb-3">
              <Flame className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              Urban Microclimate & Spatial Resilience Model
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Campus Heat Island (UHI) & Hot Zones Map
            </h1>
            <p className="mt-2 text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
              Moving beyond basic sustainability into <b>predictive microclimate urban planning</b>. Combining Land Surface Temperature (LST), canopy void analysis, pavement thermal mass, and pedestrian footfall to pinpoint critical heat stress zones and deploy targeted microclimate interventions.
            </p>
          </div>

          {/* Quick Metrics Capsule */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Peak Hot Zone</span>
              <span className="text-xl font-black text-red-400">
                {summary?.peakHotZoneTempC || 44.2}°C
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Cool Oasis Sink</span>
              <span className="text-xl font-black text-emerald-400">
                {summary?.coolOasisTempC || 28.4}°C
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Campus ΔT Range</span>
              <span className="text-xl font-black text-amber-400">
                {summary?.uhiDeltaRangeC || 15.8}°C
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Hot Zones</span>
              <span className="text-xl font-black text-rose-500">
                {summary?.criticalHotZonesCount || 3} Areas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Layer Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 px-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            Active Layer:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'composite', label: '🔥 Composite Heat Risk', desc: 'Weighted Multi-Factor' },
              { id: 'temperature', label: '🌡️ Surface Temp (LST)', desc: 'Thermal Gradient' },
              { id: 'canopy', label: '🌳 Tree Canopy', desc: 'NDVI Green Cover' },
              { id: 'density', label: '🏢 Building Density', desc: 'Thermal Mass' },
              { id: 'pavement', label: '🛣️ Paved Surfaces', desc: 'Impervious Albedo' },
              { id: 'water', label: '💧 Water Sinks', desc: 'Evaporative Buffers' },
              { id: 'pedestrian', label: '🚶 Pedestrian Flow', desc: 'Human Exposure' }
            ].map((layer) => (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id as HeatIslandLayer)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeLayer === layer.id
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {layer.label}
              </button>
            ))}
          </div>
        </div>

        {/* Temperature Legend */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 uppercase">Thermal Gradient:</span>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-emerald-500" title="28°C Cool Sink" />
            <span className="text-[10px]">28°C</span>
          </div>
          <span>&rarr;</span>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-amber-400" title="35°C Moderate" />
            <span className="text-[10px]">35°C</span>
          </div>
          <span>&rarr;</span>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-600" title="44°C Severe Hot Zone" />
            <span className="text-[10px] text-red-600 font-bold">44°C+</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Map Canvas, Right Planning Interventions */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Spatial Heat Map Canvas */}
        <div className="xl:col-span-7 bg-slate-950 rounded-3xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden min-h-[580px]">
          {/* Map Top Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 text-white z-10">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold tracking-wider uppercase font-mono">
                CSJMU Spatial Grid &bull; 8 Microclimate Polygons
              </span>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
              Interactive: Click any zone to inspect &amp; simulate
            </span>
          </div>

          {/* Interactive GIS Spatial Canvas */}
          <div className="relative w-full h-[460px] my-4 bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-inner">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-40" />

            {/* Campus Road Network Vector Overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-700/60" strokeWidth="3" fill="none">
              <path d="M 50 200 L 950 200" strokeDasharray="6 6" />
              <path d="M 450 50 L 450 500" strokeDasharray="6 6" />
              <circle cx="780" cy="270" r="45" className="stroke-cyan-500/40 fill-cyan-500/10" strokeWidth="2" />
            </svg>

            {/* Microclimate Sector Polygons */}
            {sectors.map((sector) => {
              const isSelected = sector.id === selectedSectorId;
              const styleClasses = getSectorLayerStyle(sector);
              return (
                <div
                  key={sector.id}
                  onClick={() => setSelectedSectorId(sector.id)}
                  style={{
                    left: `${sector.bounds.x}%`,
                    top: `${sector.bounds.y}%`,
                    width: `${sector.bounds.width}%`,
                    height: `${sector.bounds.height}%`
                  }}
                  className={`absolute rounded-xl border p-2 cursor-pointer transition-all duration-200 flex flex-col justify-between backdrop-blur-xs select-none ${styleClasses} ${
                    isSelected ? 'ring-4 ring-white z-20 scale-[1.02] shadow-2xl' : 'hover:scale-[1.01] hover:z-10'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-black uppercase truncate max-w-[80%] drop-shadow-xs">
                      {sector.name}
                    </span>
                    <span className="text-[11px] font-black font-mono">
                      {sector.metrics.surfaceTempC}°C
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[9px] opacity-90 font-mono mt-1">
                    <span>Canopy: {sector.metrics.treeCanopyPct}%</span>
                    <span>Paved: {sector.metrics.pavedSurfacePct}%</span>
                  </div>

                  {sector.classification === 'CRITICAL_HOT_ZONE' && (
                    <div className="mt-1 flex items-center gap-1 text-[8px] font-extrabold bg-black/40 px-1.5 py-0.5 rounded text-red-200 tracking-wider">
                      <Flame className="w-2.5 h-2.5 text-red-400" /> HOT ZONE
                    </div>
                  )}
                </div>
              );
            })}

            {/* Overlay of Intervention Badges if matching tab */}
            {interventions && (
              <>
                {activeInterventionTab === 'treePlanting' && interventions.treePlanting.map((tp: any) => (
                  <div
                    key={tp.id}
                    style={{ left: `${tp.coordinates.x}%`, top: `${tp.coordinates.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-30 flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-600 text-white font-bold text-[10px] shadow-lg border border-emerald-300 animate-bounce"
                    title={`Plant Trees: ${tp.title}`}
                  >
                    <Trees className="w-3 h-3" />
                    <span>+{tp.treeCountTarget} Trees</span>
                  </div>
                ))}

                {activeInterventionTab === 'shadeStructures' && interventions.shadeStructures.map((ss: any) => (
                  <div
                    key={ss.id}
                    style={{ left: `${ss.coordinates.x}%`, top: `${ss.coordinates.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-30 flex items-center gap-1 px-2 py-1 rounded-full bg-purple-600 text-white font-bold text-[10px] shadow-lg border border-purple-300 animate-bounce"
                    title={`Canopy: ${ss.title}`}
                  >
                    <Umbrella className="w-3 h-3" />
                    <span>{ss.spanLengthMeters}m Shade</span>
                  </div>
                ))}

                {activeInterventionTab === 'coolPavement' && interventions.coolPavement.map((cp: any) => (
                  <div
                    key={cp.id}
                    style={{ left: `${cp.coordinates.x}%`, top: `${cp.coordinates.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-30 flex items-center gap-1 px-2 py-1 rounded-full bg-cyan-600 text-white font-bold text-[10px] shadow-lg border border-cyan-300 animate-bounce"
                    title={`Cool Pavement: ${cp.title}`}
                  >
                    <Sun className="w-3 h-3" />
                    <span>SRI ≥ 80 Coating</span>
                  </div>
                ))}

                {activeInterventionTab === 'optimalSeating' && interventions.optimalSeating.map((os: any) => (
                  <div
                    key={os.id}
                    style={{ left: `${os.coordinates.x}%`, top: `${os.coordinates.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-30 flex items-center gap-1 px-2 py-1 rounded-full bg-blue-600 text-white font-bold text-[10px] shadow-lg border border-blue-300 animate-bounce"
                    title={`Seating: ${os.title}`}
                  >
                    <Wind className="w-3 h-3" />
                    <span>Cool Seating</span>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Selected Zone Deep Dive Capsule */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-100">{selectedSector.name}</h3>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  selectedSector.classification === 'CRITICAL_HOT_ZONE' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                  selectedSector.classification === 'HIGH_STRESS' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' :
                  selectedSector.classification === 'COOL_REFUGE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                  'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                }`}>
                  {selectedSector.classification.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{selectedSector.exposureSummary}</p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono shrink-0">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Surface LST</span>
                <span className="text-base font-extrabold text-red-400">{selectedSector.metrics.surfaceTempC}°C</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Canopy</span>
                <span className="text-base font-extrabold text-emerald-400">{selectedSector.metrics.treeCanopyPct}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Pavement</span>
                <span className="text-base font-extrabold text-slate-200">{selectedSector.metrics.pavedSurfacePct}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 4 Actionable Urban Planning Recommendations */}
        <div className="xl:col-span-5 space-y-6">
          {/* The 4 Urban Planning Action Tabs */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-extrabold text-slate-900 flex items-center gap-2 text-base">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                Actionable Urban Interventions
              </h2>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                Planning Decisions
              </span>
            </div>

            {/* 4 Action Navigation Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveInterventionTab('treePlanting')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  activeInterventionTab === 'treePlanting'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-extrabold">
                  <Trees className="w-4 h-4 text-emerald-600" />
                  Where to plant trees?
                </div>
                <div className="text-[10px] text-slate-500 mt-1 font-normal">Biological Canopy Gaps</div>
              </button>

              <button
                onClick={() => setActiveInterventionTab('shadeStructures')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  activeInterventionTab === 'shadeStructures'
                    ? 'border-purple-600 bg-purple-50/70 text-purple-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-extrabold">
                  <Umbrella className="w-4 h-4 text-purple-600" />
                  Where to create shade?
                </div>
                <div className="text-[10px] text-slate-500 mt-1 font-normal">Architectural Canopies</div>
              </button>

              <button
                onClick={() => setActiveInterventionTab('coolPavement')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  activeInterventionTab === 'coolPavement'
                    ? 'border-cyan-600 bg-cyan-50/70 text-cyan-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-extrabold">
                  <Sun className="w-4 h-4 text-cyan-600" />
                  Where to use cool pavement?
                </div>
                <div className="text-[10px] text-slate-500 mt-1 font-normal">High Albedo &amp; SRI &gt; 80</div>
              </button>

              <button
                onClick={() => setActiveInterventionTab('optimalSeating')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  activeInterventionTab === 'optimalSeating'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-extrabold">
                  <Wind className="w-4 h-4 text-blue-600" />
                  Where to locate seating?
                </div>
                <div className="text-[10px] text-slate-500 mt-1 font-normal">Thermal Comfort Refuges</div>
              </button>
            </div>

            {/* Dynamic Intervention Content Panel */}
            <div className="space-y-4 pt-2">
              {/* Category 1: Tree Planting */}
              {activeInterventionTab === 'treePlanting' && interventions?.treePlanting && (
                <div className="space-y-3">
                  {interventions.treePlanting.map((item: any) => (
                    <div key={item.id} className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-2.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase bg-emerald-200/70 px-2 py-0.5 rounded">
                            {item.id} &bull; Target: {item.treeCountTarget} Trees
                          </span>
                          <h4 className="font-extrabold text-slate-900 text-sm mt-1">{item.title}</h4>
                          <p className="text-xs text-slate-600">{item.location}</p>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                          ΔT -{item.estimatedTempDropC}°C
                        </span>
                      </div>

                      <div className="p-2.5 bg-white rounded-xl border border-emerald-100 text-xs">
                        <span className="font-bold text-slate-800 block text-[11px] mb-1">Recommended Native Species:</span>
                        <ul className="space-y-1 text-slate-600">
                          {item.recommendedSpecies.map((sp: any, idx: number) => (
                            <li key={idx} className="flex items-center justify-between text-[11px]">
                              <span>&bull; <b>{sp.name}</b></span>
                              <span className="text-emerald-700 font-semibold">{sp.coolingEffect}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1">
                        <span>Soil: <b>{item.soilPermeability}</b></span>
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {item.undergroundUtilitiesCheck}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Category 2: Shade Structures */}
              {activeInterventionTab === 'shadeStructures' && interventions?.shadeStructures && (
                <div className="space-y-3">
                  {interventions.shadeStructures.map((item: any) => (
                    <div key={item.id} className="p-4 rounded-2xl bg-purple-50/40 border border-purple-200/80 space-y-2.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-purple-800 uppercase bg-purple-200/70 px-2 py-0.5 rounded">
                            {item.id} &bull; Span: {item.spanLengthMeters} Meters
                          </span>
                          <h4 className="font-extrabold text-slate-900 text-sm mt-1">{item.title}</h4>
                          <p className="text-xs text-slate-600">{item.location}</p>
                        </div>
                        <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-lg">
                          {item.uvProtectionPct}% UV Cut
                        </span>
                      </div>

                      <div className="p-2.5 bg-white rounded-xl border border-purple-100 text-xs text-slate-700 space-y-1">
                        <div className="font-semibold text-purple-950">{item.structureType}</div>
                        <div className="text-[11px] text-slate-500">Constraint: <i>{item.whyNoTrees}</i></div>
                        <div className="text-[11px] text-emerald-700 font-bold">Impact: {item.immediateImpact}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Category 3: Cool Pavement */}
              {activeInterventionTab === 'coolPavement' && interventions?.coolPavement && (
                <div className="space-y-3">
                  {interventions.coolPavement.map((item: any) => (
                    <div key={item.id} className="p-4 rounded-2xl bg-cyan-50/40 border border-cyan-200/80 space-y-2.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-cyan-800 uppercase bg-cyan-200/70 px-2 py-0.5 rounded">
                            {item.id} &bull; Retrofit: {item.retrofitAreaSqM} m²
                          </span>
                          <h4 className="font-extrabold text-slate-900 text-sm mt-1">{item.title}</h4>
                          <p className="text-xs text-slate-600">{item.location}</p>
                        </div>
                        <span className="text-xs font-bold text-cyan-800 bg-cyan-100 px-2.5 py-1 rounded-lg">
                          SRI &ge; 80
                        </span>
                      </div>

                      <div className="p-2.5 bg-white rounded-xl border border-cyan-100 text-xs text-slate-700 space-y-1">
                        <div>Current: <span className="text-red-700 font-medium">{item.currentMaterial}</span></div>
                        <div className="font-semibold text-cyan-950">Target: {item.recommendedTreatment}</div>
                        <div className="text-[11px] text-emerald-700 font-bold">{item.expectedSurfaceTempDrop}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Category 4: Optimal Seating */}
              {activeInterventionTab === 'optimalSeating' && interventions?.optimalSeating && (
                <div className="space-y-3">
                  {interventions.optimalSeating.map((item: any) => (
                    <div key={item.id} className="p-4 rounded-2xl bg-blue-50/40 border border-blue-200/80 space-y-2.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-blue-800 uppercase bg-blue-200/70 px-2 py-0.5 rounded">
                            {item.id} &bull; Capacity: {item.capacity} Seats
                          </span>
                          <h4 className="font-extrabold text-slate-900 text-sm mt-1">{item.title}</h4>
                          <p className="text-xs text-slate-600">{item.location}</p>
                        </div>
                        <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg">
                          {item.walkDistanceMinutes}
                        </span>
                      </div>

                      <div className="p-2.5 bg-white rounded-xl border border-blue-100 text-xs text-slate-700 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Thermal Comfort:</span>
                          <span className="font-bold text-emerald-700">{item.thermalComfortIndex}</span>
                        </div>
                        <div className="text-[11px] text-slate-600">Canopy: {item.canopyShadeFactor} &bull; Wind: {item.windChanneling}</div>
                        <div className="text-[11px] font-medium text-slate-800">{item.furnitureType}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Interactive "What-If" Heat Mitigation Simulator */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                "What-If" Scenario Simulator ({selectedSector.name})
              </h3>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                Live Microclimate Delta
              </span>
            </div>

            {/* Sliders */}
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Add Native Shade Trees:</span>
                  <span className="font-bold font-mono text-emerald-400">+{addedTrees} Trees</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={addedTrees}
                  onChange={(e) => setAddedTrees(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg cursor-pointer accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Retrofit Cool Pavement Area:</span>
                  <span className="font-bold font-mono text-cyan-400">{coolPavePct}% Paved Surface</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={coolPavePct}
                  onChange={(e) => setCoolPavePct(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg cursor-pointer accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Deploy Tensile Architectural Shade:</span>
                  <span className="font-bold font-mono text-purple-400">{shadeSqm} m²</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="400"
                  value={shadeSqm}
                  onChange={(e) => setShadeSqm(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg cursor-pointer accent-purple-500"
                />
              </div>
            </div>

            {/* Simulator Output Box */}
            {simResult && (
              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Projected LST</span>
                  <span className="text-xl font-black text-emerald-300">{simResult.projectedTempC}°C</span>
                  <span className="text-[10px] text-slate-400 ml-1.5 line-through">({simResult.currentTempC}°C)</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">Net Temperature Drop</span>
                  <span className="text-xl font-black text-amber-300">- {simResult.totalTempDropC}°C</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
