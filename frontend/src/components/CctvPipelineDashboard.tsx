import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Video, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  RefreshCw, 
  Sparkles, 
  MapPin, 
  ShieldCheck, 
  Send, 
  Check, 
  X, 
  Eye, 
  Filter, 
  Layers, 
  Cpu, 
  Bot, 
  TrendingUp, 
  ArrowRight, 
  HardHat, 
  ExternalLink,
  ChevronRight,
  Shield,
  Activity,
  Shuffle
} from 'lucide-react';
import { 
  CctvCamera, 
  CctvSweep, 
  CctvPipelineRun, 
  MaintenanceReport 
} from '../types';
import { 
  fetchCctvCamerasAPI, 
  fetchCctvSweepsAPI, 
  randomizeCctvSweepsAPI,
  triggerCctvCaptureAPI, 
  runScheduledSweepAPI, 
  fetchCctvRunsAPI 
} from '../api/client';

interface CctvPipelineDashboardProps {
  onNavigateToTab?: (tab: any) => void;
  onSelectReport?: (report: MaintenanceReport) => void;
}

export const CctvPipelineDashboard: React.FC<CctvPipelineDashboardProps> = ({
  onNavigateToTab,
  onSelectReport
}) => {
  const [cameras, setCameras] = useState<CctvCamera[]>([]);
  const [sweeps, setSweeps] = useState<CctvSweep[]>([]);
  const [pipelineRuns, setPipelineRuns] = useState<CctvPipelineRun[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCameraId, setActiveCameraId] = useState<string>('CAM-UIET-01');
  const [isExecutingSweep, setIsExecutingSweep] = useState<boolean>(false);
  const [selectedSweepSlot, setSelectedSweepSlot] = useState<string>('12:00');
  const [activePipelineStep, setActivePipelineStep] = useState<number | null>(null);
  const [lastExecutionResult, setLastExecutionResult] = useState<any | null>(null);
  const [showExecutionModal, setShowExecutionModal] = useState<boolean>(false);
  const [selectedSimClass, setSelectedSimClass] = useState<Record<string, string>>({
    'CAM-UIET-01': 'overflow',
    'CAM-LIB-02': 'bin_full',
    'CAM-WS-03': 'blocked_drain',
    'CAM-HST-04': 'litter_pile',
    'CAM-STAD-05': 'bin_empty',
    'CAM-ADMIN-06': 'bin_empty'
  });

  // Load cameras and sweeps on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [camsData, sweepsData, runsData] = await Promise.all([
        fetchCctvCamerasAPI(),
        fetchCctvSweepsAPI(),
        fetchCctvRunsAPI()
      ]);
      setCameras(camsData);
      setSweeps(sweepsData);
      setPipelineRuns(runsData);
    } catch (err) {
      console.error('Failed to load CCTV data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunSingleCamera = async (camId: string) => {
    const forcedClass = selectedSimClass[camId] || 'overflow';
    setIsExecutingSweep(true);
    setShowExecutionModal(true);
    setActivePipelineStep(1);

    // Simulate stepping through the 8 stages visually
    const stepInterval = setInterval(() => {
      setActivePipelineStep(prev => {
        if (prev === null) return 1;
        if (prev < 8) return prev + 1;
        clearInterval(stepInterval);
        return 8;
      });
    }, 450);

    try {
      const res = await triggerCctvCaptureAPI(camId, forcedClass, 'ON_DEMAND');
      setLastExecutionResult(res);
      // Refresh runs
      const updatedRuns = await fetchCctvRunsAPI();
      setPipelineRuns(updatedRuns);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => {
        setIsExecutingSweep(false);
      }, 3600);
    }
  };

  const handleRunBatchSweep = async (slot: string) => {
    setSelectedSweepSlot(slot);
    setIsExecutingSweep(true);
    setShowExecutionModal(true);
    setActivePipelineStep(1);

    const stepInterval = setInterval(() => {
      setActivePipelineStep(prev => {
        if (prev === null) return 1;
        if (prev < 8) return prev + 1;
        clearInterval(stepInterval);
        return 8;
      });
    }, 500);

    try {
      const res = await runScheduledSweepAPI(slot);
      setLastExecutionResult(res);
      // Reload sweeps & history
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => {
        setIsExecutingSweep(false);
      }, 4000);
    }
  };

  const handleRandomizeSweeps = async () => {
    try {
      const updated = await randomizeCctvSweepsAPI();
      if (updated && updated.length > 0) {
        setSweeps(updated);
      }
    } catch (err) {
      console.error('Failed to randomize sweeps', err);
    }
  };

  const activeCamera = cameras.find(c => c.id === activeCameraId) || cameras[0];

  const PIPELINE_STAGES = [
    { num: 1, title: 'CCTV Data Collection', desc: '4x Daily Captures (Stratified Shift Windows)', icon: Video, color: 'from-blue-600 to-indigo-600' },
    { num: 2, title: 'Data Ingestion & Storage', desc: 'Sub-stream/Snapshot frame, aspect resize, privacy blur', icon: Layers, color: 'from-indigo-600 to-sky-600' },
    { num: 3, title: 'AI Detection (YOLOv11)', desc: 'Overflow, litter pile, drain clog, bin capacity', icon: Cpu, color: 'from-purple-600 to-pink-600' },
    { num: 4, title: 'Geotagging & GIS Mapping', desc: 'Camera ID → Fixed spatial coordinates & zone', icon: MapPin, color: 'from-amber-600 to-orange-600' },
    { num: 5, title: 'LLM-Assisted Parsing', desc: 'Converts detection into structured work order', icon: Bot, color: 'from-emerald-600 to-teal-600' },
    { num: 6, title: 'Authority Engine Routing', desc: 'Zone → Ward → Supervisor → Cleaning team', icon: ShieldCheck, color: 'from-blue-700 to-indigo-800' },
    { num: 7, title: 'Field Dispatch & Cleaning', desc: 'Mobile work order dispatched to BVG Beat', icon: HardHat, color: 'from-amber-700 to-yellow-600' },
    { num: 8, title: 'Cleaning Verification', desc: 'Before vs After photo audit & closure in DB', icon: CheckCircle2, color: 'from-emerald-700 to-green-800' },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-500/20">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Vision AI Automated Surveillance
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              CCTV-Based Garbage Detection Pipeline
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              4x Daily Stratified Random Sweeps: Sub-Stream (1080p/720p) &rarr; YOLOv11 Tensor (640x640) &rarr; 
              Decision Deduplication Gate &rarr; LLM Ticket Dispatch &rarr; BVG Worker Cleaning Verification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleRunBatchSweep(sweeps[0]?.slot || '12:00')}
              disabled={isExecutingSweep}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-500 transition-all active:scale-95 disabled:opacity-50"
            >
              {isExecutingSweep ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running Sweep Pipeline...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  Trigger Campus-Wide Sweep Now
                </>
              )}
            </button>
            <button
              onClick={loadData}
              className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition-colors"
              title="Refresh Feeds"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Daily Schedule Timeline Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Stratified Random Campus Sweeps (4x Operational Shift Quarters)
            </span>
            <button
              onClick={handleRandomizeSweeps}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/30 text-indigo-300 text-xs font-medium transition-colors"
              title="Re-calculate 4 random trigger times across operational shift windows"
            >
              <Shuffle className="w-3 h-3 text-indigo-300" />
              Re-Roll Random Shift Triggers
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {sweeps.map((sweep, idx) => {
              const isSelected = selectedSweepSlot === sweep.slot;
              const isCompleted = sweep.status === 'COMPLETED';
              return (
                <div 
                  key={sweep.slot}
                  onClick={() => handleRunBatchSweep(sweep.slot)}
                  className={`cursor-pointer rounded-xl p-3.5 border transition-all ${
                    isSelected 
                      ? 'bg-indigo-900/40 border-indigo-400 ring-2 ring-indigo-500/30' 
                      : 'bg-slate-800/50 border-slate-700/70 hover:bg-slate-800/80 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-white text-sm flex items-center gap-1.5">
                      <span className="text-indigo-400 font-mono">{sweep.targetTime}</span>
                      <span className="text-slate-400 text-xs">({idx + 1}st)</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
                      isCompleted ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {sweep.status}
                    </span>
                  </div>
                  {sweep.window && (
                    <div className="text-[10px] text-slate-400 font-mono mb-1">
                      Window: <span className="text-indigo-300">{sweep.window}</span>
                    </div>
                  )}
                  <p className="text-slate-300 text-xs font-medium truncate">{sweep.name.replace(/^[0-9]+[a-z]+ Sweep \(/i, '').replace(/\)$/, '')}</p>
                  <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{sweep.detectionsCount} detections</span>
                    <span className="text-emerald-400 font-semibold">{sweep.ticketsGenerated} tickets closed</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. The 8-Stage Architecture Stepper Diagram */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              8-Stage Automated Computer Vision Workflow
            </h2>
            <p className="text-xs text-slate-500">Autonomous loop from RTSP Camera feed to BVG Contractor work order closure</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
            End-to-End Latency: &lt; 2.5 seconds
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {PIPELINE_STAGES.map((stage) => {
            const Icon = stage.icon;
            const isActive = activePipelineStep === stage.num;
            const isCompleted = activePipelineStep !== null && activePipelineStep > stage.num;

            return (
              <div 
                key={stage.num}
                className={`relative rounded-xl p-3 border transition-all ${
                  isActive 
                    ? 'bg-indigo-50 border-indigo-500 shadow-md ring-2 ring-indigo-400 scale-[1.03]'
                    : isCompleted
                    ? 'bg-emerald-50/60 border-emerald-300 text-slate-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCompleted ? 'bg-emerald-600 text-white' : isActive ? 'bg-indigo-600 text-white animate-pulse' : 'bg-slate-300 text-slate-700'
                  }`}>
                    {isCompleted ? <Check className="w-3 h-3" /> : stage.num}
                  </span>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
                </div>
                <h4 className="text-xs font-bold leading-tight line-clamp-2 text-slate-900 mb-1">{stage.title}</h4>
                <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{stage.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Main Two-Column Layout: Live Camera Feeds & Decision Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Campus CCTV Cameras Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-indigo-600" />
              Campus CCTV Fixed Cameras ({cameras.length})
            </h3>
            <span className="text-xs text-slate-500">Click any camera to execute single-frame scan</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cameras.map((cam) => {
              const isSelected = cam.id === activeCameraId;
              const simClass = selectedSimClass[cam.id] || 'overflow';

              // Get sample image
              const sampleImg = cam.sampleImages?.[simClass] || 
                               cam.sampleImages?.['overflow'] || 
                               cam.sampleImages?.['clean'] || 
                               'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=800&q=80';

              const hasOverflow = simClass === 'overflow';
              const hasDrain = simClass === 'blocked_drain';
              const hasLitter = simClass === 'litter_pile';
              const isClean = simClass === 'bin_empty';

              return (
                <div
                  key={cam.id}
                  onClick={() => setActiveCameraId(cam.id)}
                  className={`rounded-2xl overflow-hidden border transition-all ${
                    isSelected 
                      ? 'border-indigo-600 shadow-md ring-2 ring-indigo-500/20 bg-white' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {/* Camera Header */}
                  <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-mono text-xs font-bold text-indigo-300">{cam.id}</span>
                      <span className="text-xs text-slate-300 font-medium truncate max-w-[150px]">{cam.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                      <span className="px-1.5 py-0.5 rounded bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 font-semibold text-[9px]">
                        {cam.streamType === 'HTTP_SNAPSHOT_ISAPI' ? 'HTTP ISAPI' : 'RTSP Sub-Stream'}
                      </span>
                      <span>{cam.resolution.split(' ')[0]}</span>
                      <span>&bull;</span>
                      <span>{cam.fps}fps</span>
                    </div>
                  </div>

                  {/* Camera Live Snapshot with YOLO Bounding Box Overlay */}
                  <div className="relative aspect-video bg-black overflow-hidden group">
                    <img 
                      src={sampleImg} 
                      alt={cam.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Live CCTV Timestamp Overlay */}
                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-mono tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                      REC &bull; {new Date().toLocaleTimeString()}
                    </div>

                    {/* Geolocation Tag Overlay */}
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-slate-200 px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-amber-400" />
                      {cam.location}
                    </div>

                    {/* Simulated YOLO Bounding Box */}
                    {!isClean && (
                      <div className="absolute inset-x-8 inset-y-6 border-2 border-dashed border-emerald-400 bg-emerald-500/15 rounded flex flex-col justify-between p-1.5 animate-pulse">
                        <div className="flex items-center justify-between">
                          <span className="bg-emerald-600 text-white font-mono font-bold text-[10px] px-1.5 py-0.5 rounded shadow">
                            {simClass.toUpperCase()} (0.94)
                          </span>
                          <span className="bg-black/60 text-emerald-300 font-mono text-[9px] px-1 rounded">
                            YOLOv11
                          </span>
                        </div>
                        <div className="text-[9px] text-emerald-200 bg-black/60 px-1 py-0.5 rounded self-start font-mono">
                          Est: ~14.2 kg &bull; 0.42 m³
                        </div>
                      </div>
                    )}

                    {/* Clean Receptacle Indicator */}
                    {isClean && (
                      <div className="absolute bottom-2 left-2 bg-emerald-600/90 text-white px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shadow">
                        <CheckCircle2 className="w-3 h-3" />
                        CLEAN & SANITARY (NO ACTION)
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Simulation Switcher & Scan Action */}
                  <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Test Condition:</span>
                      <select
                        value={simClass}
                        onChange={(e) => {
                          setSelectedSimClass({ ...selectedSimClass, [cam.id]: e.target.value });
                        }}
                        className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="overflow">Bin Overflowing (HIGH)</option>
                        <option value="litter_pile">Scattered Litter Pile (HIGH)</option>
                        <option value="blocked_drain">Blocked Drain Grate (CRITICAL)</option>
                        <option value="bin_full">Bin Full 100% (MEDIUM)</option>
                        <option value="bin_empty">Bin Empty & Clean (PASS)</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleRunSingleCamera(cam.id)}
                        disabled={isExecutingSweep}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                      >
                        <Cpu className="w-3.5 h-3.5" />
                        Scan Camera AI Pipeline
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (1 Col): Decision Engine & LLM Work Order Telemetry */}
        <div className="space-y-6">
          
          {/* Decision Engine Rules Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600" />
                Decision Engine & Deduplication Gate
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                Stage 4 Filter
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800">1. Confidence Threshold Check</span>
                  <p className="text-slate-500 text-[11px]">Rejects false positives below 70% threshold score.</p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-2.5">
                <Filter className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800">2. Significance Evaluation</span>
                  <p className="text-slate-500 text-[11px]">Filters out normal clean bins; flags only overflow, litter piles, and clogs.</p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800">3. Anti-Spam Deduplication Gate</span>
                  <p className="text-slate-500 text-[11px]">Prevents opening duplicate tickets if an active beat work order already exists for that zone.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Camera Metadata Card */}
          {activeCamera && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Selected Camera Profile</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {activeCamera.status}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-base">{activeCamera.name}</h4>
                <p className="text-xs text-slate-500">{activeCamera.location} &bull; {activeCamera.zoneName}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                <div className="p-2 rounded-lg bg-slate-50">
                  <span className="text-slate-400 block text-[10px]">Camera ID</span>
                  <span className="font-mono font-bold text-slate-800">{activeCamera.id}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50">
                  <span className="text-slate-400 block text-[10px]">IP Stream</span>
                  <span className="font-mono font-bold text-slate-800">{activeCamera.ipAddress}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50">
                  <span className="text-slate-400 block text-[10px]">Mount Height</span>
                  <span className="font-bold text-slate-800">{activeCamera.installedHeightMeters} meters</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50">
                  <span className="text-slate-400 block text-[10px]">GPS Coordinates</span>
                  <span className="font-mono text-[11px] font-bold text-slate-800">
                    {activeCamera.gps.latitude.toFixed(4)}, {activeCamera.gps.longitude.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Nav to BVG Worker Portal */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg shadow-orange-500/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-white/20">
                <HardHat className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">BVG Field Cleaning Portal</h4>
                <p className="text-amber-100 text-xs">Stage 7: Beat Work Order Dispatch</p>
              </div>
            </div>
            <p className="text-xs text-amber-50 leading-relaxed mb-4">
              All validated CCTV detection work orders flow directly into the Bharat Vikas Group (BVG) mobile beat board with automated routing to Beat Alpha.
            </p>
            <button
              onClick={() => onNavigateToTab?.('bvg_dashboard')}
              className="w-full py-2.5 rounded-xl bg-white text-orange-900 font-bold text-xs shadow hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
            >
              <span>View BVG Workers Assigned Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* 5. Historical CCTV Detections Audit Trail Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              CCTV AI Detections & Automated Dispatch Audit Log
            </h3>
            <p className="text-xs text-slate-500">Live stream of computer vision decisions, deduplication checks, and work orders</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {pipelineRuns.length} Telemetry Events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Timestamp / Run ID</th>
                <th className="px-4 py-3">Camera / GIS Location</th>
                <th className="px-4 py-3">AI Detection</th>
                <th className="px-4 py-3">Confidence & Weight</th>
                <th className="px-4 py-3">Decision Gate</th>
                <th className="px-4 py-3">Dispatched Work Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {pipelineRuns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No CCTV sweep runs recorded yet. Click "Trigger 12:00 PM Sweep" above to execute the pipeline!
                  </td>
                </tr>
              ) : (
                pipelineRuns.map((run, i) => {
                  const isDispatched = run.status === 'TICKET_DISPATCHED';
                  const isDup = run.status === 'DUPLICATE_IGNORED';

                  return (
                    <tr key={run.runId || i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5">
                        <span className="font-mono font-bold text-slate-900 block">{run.runId}</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(run.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-800 block">{run.camera?.name}</span>
                        <span className="text-slate-500 text-[11px]">{run.camera?.location}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                          run.detection?.detectionClass === 'blocked_drain' 
                            ? 'bg-red-100 text-red-800'
                            : run.detection?.detectionClass === 'overflow'
                            ? 'bg-amber-100 text-amber-800'
                            : run.detection?.detectionClass === 'litter_pile'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {run.detection?.detectionClass?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-800">{Math.round((run.detection?.confidence || 0.9) * 100)}%</span>
                        <span className="text-slate-400 text-[11px] block">
                          {run.detection?.estimatedAmount?.weightKg ? `${run.detection.estimatedAmount.weightKg} kg` : '0 kg'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isDispatched 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                            : isDup 
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {isDispatched && <Check className="w-2.5 h-2.5" />}
                          {run.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {run.ticketNumber ? (
                          <span className="font-mono font-bold text-indigo-700 block">
                            {run.ticketNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No ticket needed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Execution Modal / Real-Time Stepper Drawer */}
      {showExecutionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 animate-scale-up">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
                  <Cpu className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">
                    {isExecutingSweep ? 'Executing 8-Stage CCTV Pipeline...' : 'CCTV Pipeline Execution Complete'}
                  </h3>
                  <p className="text-xs text-slate-500">Autonomous Garbage Detection & Dispatch Engine</p>
                </div>
              </div>
              {!isExecutingSweep && (
                <button
                  onClick={() => setShowExecutionModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Stepper Display */}
            <div className="space-y-3">
              {PIPELINE_STAGES.map((s) => {
                const isCurrent = activePipelineStep === s.num;
                const isDone = activePipelineStep !== null && activePipelineStep >= s.num;

                return (
                  <div 
                    key={s.num} 
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      isCurrent 
                        ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-400' 
                        : isDone 
                        ? 'bg-emerald-50/50 border-emerald-200' 
                        : 'bg-slate-50/50 border-slate-100 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isDone ? 'bg-emerald-600 text-white' : isCurrent ? 'bg-indigo-600 text-white animate-spin' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {isDone ? <Check className="w-3.5 h-3.5" /> : s.num}
                      </div>
                      <span className="text-xs font-bold text-slate-800">{s.title}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {isDone ? 'COMPLETED' : isCurrent ? 'PROCESSING...' : 'PENDING'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Final Outcome Box */}
            {!isExecutingSweep && lastExecutionResult && (
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Pipeline Output</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-mono text-xs font-bold">
                    {lastExecutionResult.ticketNumber || 'PROCESSED'}
                  </span>
                </div>
                {lastExecutionResult.ticket ? (
                  <>
                    <h5 className="font-bold text-slate-900 text-sm">{lastExecutionResult.ticket.title}</h5>
                    <p className="text-xs text-slate-600 leading-relaxed">{lastExecutionResult.ticket.summary}</p>
                    <div className="pt-2 text-xs flex items-center justify-between font-semibold text-indigo-700">
                      <span>Assigned to: Er. R. K. Sharma (Beat Alpha)</span>
                      <span>SLA: 60 mins</span>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-600">
                    Sweep completed. All detected zones checked against duplicate threshold.
                  </p>
                )}
              </div>
            )}

            {!isExecutingSweep && (
              <button
                onClick={() => setShowExecutionModal(false)}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors"
              >
                Close & Return to CCTV Command Grid
              </button>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
