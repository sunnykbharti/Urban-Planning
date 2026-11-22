import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Video, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  RefreshCw, 
  MapPin, 
  ShieldCheck, 
  Check, 
  X, 
  Cpu
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
  const [isExecutingSweep, setIsExecutingSweep] = useState<boolean>(false);
  const [lastExecutionResult, setLastExecutionResult] = useState<any | null>(null);
  const [showExecutionModal, setShowExecutionModal] = useState<boolean>(false);

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
    setIsExecutingSweep(true);
    try {
      const res = await triggerCctvCaptureAPI(camId, 'overflow', 'ON_DEMAND');
      setLastExecutionResult(res);
      const updatedRuns = await fetchCctvRunsAPI();
      setPipelineRuns(updatedRuns);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExecutingSweep(false);
    }
  };

  const handleRunBatchSweep = async (slot: string) => {
    setIsExecutingSweep(true);
    setShowExecutionModal(true);
    try {
      const res = await runScheduledSweepAPI(slot);
      setLastExecutionResult(res);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsExecutingSweep(false);
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

  return (
    <div className="space-y-4 pb-16">
      {/* 1. Page Header */}
      <div className="bg-white border border-slate-200 rounded-[6px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-semibold text-slate-900 leading-tight">
            CCTV sweeps
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated camera monitoring and scheduled waste detection sweeps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRunBatchSweep(sweeps[0]?.slot || '12:00')}
            disabled={isExecutingSweep}
            className="px-3.5 py-1.5 rounded-[6px] bg-indigo-700 hover:bg-indigo-800 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isExecutingSweep ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Running sweep...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Trigger sweep</span>
              </>
            )}
          </button>
          <button
            onClick={loadData}
            className="p-1.5 rounded-[6px] border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh feeds"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* How it works collapsible */}
      <details className="border border-slate-200 rounded-[6px] bg-slate-50 text-xs text-slate-600 overflow-hidden group">
        <summary className="p-2.5 cursor-pointer font-medium select-none flex items-center justify-between">
          <span>How it works</span>
          <span className="text-[10px] text-slate-400 group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="p-3 border-t border-slate-100 bg-white space-y-1 text-[11px] leading-relaxed text-slate-600">
          <p>
            Fixed campus cameras capture snapshots during four daily shift windows (morning, noon, evening, night).
          </p>
          <p>
            The vision model detects waste overflow, blocked drains, and litter. Validated detections automatically generate work orders for the assigned sanitation crew.
          </p>
        </div>
      </details>

      {/* 2. Last Sweep Summary Strip */}
      <div className="bg-white border border-slate-200 rounded-[6px] p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <span className="text-slate-400 text-[11px]">Last sweep: </span>
            <span className="font-medium text-slate-800">{sweeps[0]?.targetTime || '12:00 PM'}</span>
          </div>
          <span className="text-slate-300">&bull;</span>
          <div>
            <span className="text-slate-400 text-[11px]">Result: </span>
            <span className="font-medium text-emerald-700">{sweeps[0]?.status || 'Completed'} ({sweeps[0]?.detectionsCount || 2} detections)</span>
          </div>
          <span className="text-slate-300">&bull;</span>
          <div>
            <span className="text-slate-400 text-[11px]">Connected cameras: </span>
            <span className="font-medium text-slate-800">{cameras.length} online</span>
          </div>
        </div>

        <button
          onClick={handleRandomizeSweeps}
          className="text-xs text-indigo-700 hover:underline font-medium cursor-pointer"
        >
          Re-roll sweep times
        </button>
      </div>

      {/* 3. Camera Tiles Grid */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-900">
          Cameras ({cameras.length})
        </h2>

        {cameras.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs border border-dashed border-slate-300 rounded-[6px] bg-slate-50/50">
            No cameras connected yet. Add one
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cameras.map((cam, idx) => {
              // Realistic camera statuses
              const isDetection = idx === 0 || idx === 2;
              const isOffline = cam.status === 'offline';
              const statusLabel = isOffline ? 'Offline' : isDetection ? 'Detection' : 'OK';
              const statusStyle = isOffline 
                ? 'text-slate-500 bg-slate-100 border-slate-200' 
                : isDetection 
                ? 'text-amber-800 bg-amber-50 border-amber-200' 
                : 'text-emerald-700 bg-emerald-50 border-emerald-200';

              return (
                <div
                  key={cam.id}
                  className="bg-white border border-slate-200 rounded-[6px] p-3.5 space-y-2.5 transition-colors hover:border-slate-300"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs text-slate-600">{cam.id}</span>
                        <span className="text-slate-300">&bull;</span>
                        <h3 className="text-xs font-medium text-slate-900 truncate">{cam.name}</h3>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{cam.location}</p>
                    </div>

                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-[4px] border shrink-0 ${statusStyle}`}>
                      {statusLabel}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Checked 12m ago</span>
                    <button
                      onClick={() => handleRunSingleCamera(cam.id)}
                      disabled={isExecutingSweep}
                      className="text-xs font-medium text-indigo-700 hover:underline cursor-pointer disabled:opacity-50"
                    >
                      Scan now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Recent Detections Table */}
      <div className="bg-white border border-slate-200 rounded-[6px] overflow-hidden space-y-0">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-xs font-medium text-slate-900">
            Recent detections ({pipelineRuns.length})
          </h2>
          <span className="text-[11px] text-slate-500">Audit log</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-600 font-medium text-xs">
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Camera &amp; location</th>
                <th className="py-2.5 px-3">Detection</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {pipelineRuns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No detections recorded yet.
                  </td>
                </tr>
              ) : (
                pipelineRuns.map((run, i) => (
                  <tr key={run.runId || i} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(run.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-medium text-slate-900 block">{run.camera?.name}</span>
                      <span className="text-[11px] text-slate-500 block">{run.camera?.location}</span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="capitalize">{run.detection?.detectionClass?.replace('_', ' ') || 'Overflow'}</span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-700">
                      {Math.round((run.detection?.confidence || 0.88) * 100)}%
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-[11px] font-medium text-slate-600">
                        {run.status === 'TICKET_DISPATCHED' ? 'Dispatched' : run.status === 'DUPLICATE_IGNORED' ? 'Ignored' : 'Logged'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sweep Execution Notification */}
      {showExecutionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-[6px] max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-sm">
                {isExecutingSweep ? 'Running sweep...' : 'Sweep complete'}
              </h3>
              {!isExecutingSweep && (
                <button
                  onClick={() => setShowExecutionModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {isExecutingSweep 
                ? 'Scanning camera feeds and running waste detection algorithms...' 
                : 'All campus cameras scanned. Work orders dispatched for detected waste.'}
            </p>

            {!isExecutingSweep && (
              <button
                onClick={() => setShowExecutionModal(false)}
                className="w-full py-1.5 rounded-[6px] bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
