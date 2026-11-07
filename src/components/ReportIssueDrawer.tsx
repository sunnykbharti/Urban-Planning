import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  AlertTriangle, 
  Send, 
  Camera, 
  UploadCloud, 
  Check, 
  Image as ImageIcon, 
  Trash2, 
  Sparkles, 
  ChevronDown,
  Scale,
  Box,
  Maximize2,
  Scan,
  CheckCircle2,
  HardHat,
  Clock,
  ShieldCheck,
  FileCheck,
  Plus,
  RotateCcw,
  Info,
  Droplet,
  Zap,
  Hammer,
  Ban
} from 'lucide-react';
import { ReportCategory, ReportSeverity, MaintenanceReport, GarbageDetectionResult, BoundingBox } from '../types';
import { samplePhotos } from '../data/mockData';
import { uploadAndDetectGarbageAPI } from '../api/client';

interface ReportIssueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (newReport: Omit<MaintenanceReport, 'id' | 'createdAt' | 'timeAgo'>) => void;
  prefilledLocation?: string;
  prefilledCoords?: { x: number; y: number };
}

export const ReportIssueDrawer: React.FC<ReportIssueDrawerProps> = ({
  isOpen,
  onClose,
  onSubmitReport,
  prefilledLocation = 'UIET Block 1',
  prefilledCoords = { x: 38, y: 38 }
}) => {
  const [location, setLocation] = useState<string>(prefilledLocation);
  const [category, setCategory] = useState<ReportCategory | ''>('');
  const [severity, setSeverity] = useState<ReportSeverity>('normal');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  
  // Photos and per-photo detections
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [photoDetections, setPhotoDetections] = useState<Record<string, GarbageDetectionResult>>({});
  const [photoFileNames, setPhotoFileNames] = useState<Record<string, string>>({});
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [showLocationPicker, setShowLocationPicker] = useState<boolean>(false);

  // Computer Vision & Garbage Detection States
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStatus, setAnalysisStatus] = useState<string>('');
  const [detectionResult, setDetectionResult] = useState<GarbageDetectionResult | null>(null);

  // Sync prefilled location
  useEffect(() => {
    if (prefilledLocation) {
      setLocation(prefilledLocation);
    }
  }, [prefilledLocation]);

  // Safeguard: Check if photos have been analyzed and verified clean of waste
  const allDetectionsList: GarbageDetectionResult[] = Object.values(photoDetections);
  const hasAnalyzedPhotos = photoUrls.length > 0 && allDetectionsList.length > 0;
  const anyGarbageDetected = allDetectionsList.some(d => d.isGarbageDetected);
  const isCleanArea = hasAnalyzedPhotos && !anyGarbageDetected;
  const isSubmissionBlocked = isCleanArea && (category === 'garbage' || !category);

  if (!isOpen) return null;

  const campusLocations = [
    'UIET Block 1 (CSE & IT)',
    'UIET Block 2 (ME & Civil)',
    'UIET Block 3 (ECE & Chemical)',
    'Central University Library',
    'Central Mechanical Workshop',
    'Science Block B (Applied Sciences)',
    'UIET Administrative Block & Seminar Hall',
    'Hostel Complex (Dorm 4 & 5)',
    'North Campus Entrance & Main Gate',
    'University Sports Ground & Stadium',
    'Central Cafeteria & Student Plaza'
  ];

  // Process a batch of images running Computer Vision / Gemini AI on EVERY SINGLE PHOTO
  const processBatchImages = async (
    filesOrUrls: (File | string)[],
    suggestedCategory?: ReportCategory,
    suggestedTitle?: string
  ) => {
    if (!filesOrUrls || filesOrUrls.length === 0) return;

    setIsAnalyzing(true);
    const newUrls: string[] = [];
    const newDetections: Record<string, GarbageDetectionResult> = { ...photoDetections };
    const newFilenames: Record<string, string> = { ...photoFileNames };

    try {
      for (let i = 0; i < filesOrUrls.length; i++) {
        const item = filesOrUrls[i];
        const isFile = typeof item !== 'string';
        const label = isFile ? (item as File).name : `Sample Photo ${i + 1}`;
        setAnalysisStatus(`Running AI Model on photo ${i + 1} of ${filesOrUrls.length} (${label})...`);

        try {
          const res = await uploadAndDetectGarbageAPI(item, {
            sourceType: 'CITIZEN_MOBILE',
            notes: (description || title || location)
          });

          const storedUrl = res.file.url;
          if (!newUrls.includes(storedUrl)) {
            newUrls.push(storedUrl);
          }
          newDetections[storedUrl] = res.detection;
          newFilenames[storedUrl] = res.file.filename;
        } catch (itemErr) {
          console.warn(`Failed AI detection for image ${i + 1}:`, itemErr);
        }
      }

      // Update state with newly analyzed photos
      const updatedUrls = [...photoUrls, ...newUrls.filter(u => !photoUrls.includes(u))];
      setPhotoUrls(updatedUrls);
      setPhotoDetections(newDetections);
      setPhotoFileNames(newFilenames);

      // Set the active photo to the newest or first photo
      const activeUrl = newUrls[0] || updatedUrls[0] || '';
      setPhotoUrl(activeUrl);

      // Active photo's detection
      const activeDet = newDetections[activeUrl] || null;
      setDetectionResult(activeDet);

      // Aggregate insights across all analyzed photos
      const allDets: GarbageDetectionResult[] = Object.values(newDetections);
      const anyGarbage = allDets.some(d => d.isGarbageDetected);
      const allUnwanted = Array.from(new Set(allDets.flatMap(d => d.unwantedObjects || [])));
      const totalWeight = Math.round(allDets.reduce((acc: number, d: GarbageDetectionResult) => acc + (d.estimatedAmount?.weightKg || 0), 0) * 10) / 10;

      // Auto-populate form data based on AI identification
      if (anyGarbage) {
        const hasDrain = allDets.some(d => d.primaryClass === 'blocked_drain');
        setCategory(hasDrain ? 'waterlogging' : 'garbage');

        if (activeDet?.defaultSeverity) {
          const sevLower = activeDet.defaultSeverity.toLowerCase();
          setSeverity(sevLower === 'critical' || sevLower === 'high' ? 'urgent' : 'normal');
        }

        const unwantedSummary = allUnwanted.slice(0, 2).join(' & ');
        setTitle(
          unwantedSummary 
            ? `Campus Litter: ${unwantedSummary}` 
            : (activeDet?.classLabel || 'Campus Litter Detected')
        );

        if (activeDet?.aiSummary) {
          const multiPhotoPrefix = updatedUrls.length > 1 ? `[Verified across ${updatedUrls.length} photos] ` : '';
          setDescription(`${multiPhotoPrefix}${activeDet.aiSummary}`);
        }
      } else {
        // When AI verifies no litter or waste: do NOT pre-select waste category or title
        setCategory('');
        setTitle('');
        if (activeDet?.aiSummary) {
          setDescription(activeDet.aiSummary);
        } else {
          setDescription('AI Computer Vision verified clean area. No solid waste or litter detected.');
        }
      }
    } catch (err) {
      console.error('Failed to process batch image upload:', err);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStatus('');
    }
  };

  const handleApplySamplePhoto = (sample: typeof samplePhotos[0]) => {
    processBatchImages([sample.url], sample.category, sample.suggestedTitle);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileList = Array.from(files) as File[];
    processBatchImages(fileList);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileList = Array.from(e.dataTransfer.files) as File[];
      processBatchImages(fileList);
    }
  };

  const handleSelectPhoto = (url: string) => {
    setPhotoUrl(url);
    if (photoDetections[url]) {
      setDetectionResult(photoDetections[url]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    const targetUrl = photoUrls[index];
    const updated = photoUrls.filter((_, i) => i !== index);
    setPhotoUrls(updated);

    const updatedDets = { ...photoDetections };
    delete updatedDets[targetUrl];
    setPhotoDetections(updatedDets);

    if (updated.length > 0) {
      const nextUrl = updated[0];
      setPhotoUrl(nextUrl);
      setDetectionResult(updatedDets[nextUrl] || null);
    } else {
      handleClearCanvas();
    }
  };

  // Full reset / clear canvas button
  const handleClearCanvas = () => {
    setPhotoUrl('');
    setPhotoUrls([]);
    setPhotoDetections({});
    setPhotoFileNames({});
    setDetectionResult(null);
    setTitle('');
    setDescription('');
    setCategory('');
    setSeverity('normal');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmissionBlocked) {
      alert('False Report Blocked: Computer Vision verified this scene is clean with zero litter or waste. Disagreeing reports for clean areas cannot be dispatched.');
      return;
    }
    if (!category) {
      alert('Please select an issue category.');
      return;
    }
    if (!description.trim()) {
      alert('Please provide a description of the issue.');
      return;
    }

    setIsSubmitting(true);

    const generatedTitle = title.trim() || `${category.toUpperCase()} issue at ${location}`;
    const effectiveUrls = photoUrls.length > 0 ? photoUrls : photoUrl ? [photoUrl] : [samplePhotos[0].url];
    const primaryImage = effectiveUrls[0];

    // Compute aggregated amount across all photos
    const allDets: GarbageDetectionResult[] = Object.values(photoDetections);
    const totalWeightKg = allDets.length > 0 
      ? Math.round(allDets.reduce((acc: number, d: GarbageDetectionResult) => acc + (d.estimatedAmount?.weightKg || 0), 0) * 10) / 10 
      : detectionResult?.estimatedAmount?.weightKg;
    const totalVolumeM3 = allDets.length > 0
      ? Math.round(allDets.reduce((acc: number, d: GarbageDetectionResult) => acc + (d.estimatedAmount?.volumeM3 || 0), 0) * 100) / 100
      : detectionResult?.estimatedAmount?.volumeM3;

    setTimeout(() => {
      onSubmitReport({
        title: generatedTitle,
        description: description.trim(),
        category: category as ReportCategory,
        severity,
        status: 'pending',
        location,
        coordinates: prefilledCoords,
        imageUrl: primaryImage,
        imageUrls: effectiveUrls,
        beforeImageUrl: primaryImage,
        garbageDetection: detectionResult || undefined,
        estimatedAmount: detectionResult?.estimatedAmount ? {
          ...detectionResult.estimatedAmount,
          weightKg: totalWeightKg || detectionResult.estimatedAmount.weightKg,
          volumeM3: totalVolumeM3 || detectionResult.estimatedAmount.volumeM3
        } : undefined,
        estimatedAmountKg: totalWeightKg,
        estimatedVolumeM3: totalVolumeM3,
        reportedBy: {
          name: 'Sunny Bharti',
          role: 'Campus Student / Reporter'
        },
        updates: [
          {
            id: `up-${Date.now()}`,
            timestamp: 'Just now',
            author: 'Sunny Bharti',
            message: detectionResult?.isGarbageDetected
              ? `Report submitted with Computer Vision Telemetry: ~${totalWeightKg} kg waste detected across ${effectiveUrls.length} photo(s).`
              : `Initial incident report logged into CSJMU maintenance system (${effectiveUrls.length} photos attached).`
          }
        ]
      });
      setIsSubmitting(false);
      handleClearCanvas();
      onClose();
    }, 350);
  };

  const storedFileName = photoUrl ? photoFileNames[photoUrl] : '';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Clickable Backdrop */}
      <div 
        aria-hidden="true" 
        onClick={onClose}
        className="fixed inset-0 cursor-pointer"
      />

      {/* Centered Modal Pop-Up Window */}
      <div className="relative z-10 w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <header className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Report Waste / Civic Issue</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit photo evidence to trigger Computer Vision decomposition &amp; dispatch campus sanitation.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearCanvas}
              className="text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
              title="Clear all photos and reset form"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Canvas</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-lg p-2 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Form Content - 2-Column Responsive Layout */}
        <form 
          id="report-issue-form" 
          onSubmit={handleSubmit} 
          className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5"
        >
          {/* Left Column: Visual Evidence, Multi-Photo Canvas, & AI Detection (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-[#001e40]" />
                <span>Photo Evidence &amp; AI Decomposition</span>
              </label>
              {storedFileName && (
                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono flex items-center gap-1">
                  <FileCheck className="w-3 h-3" /> Stored: {storedFileName.slice(0, 14)}...
                </span>
              )}
            </div>

            {photoUrl ? (
              <div className="space-y-3">
                {/* Active Photo Canvas with Bounding Boxes */}
                <div className="relative rounded-xl overflow-hidden border border-[#c3c6d1] bg-[#111c2d] shadow-sm">
                  <img 
                    src={photoUrl} 
                    alt="Active canvas preview" 
                    className="w-full h-56 sm:h-64 object-cover rounded-xl"
                  />

                  {/* AI Scanning Progress Overlay */}
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-[#001e40]/75 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-white z-20 animate-in fade-in">
                      <div className="w-12 h-12 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mb-3" />
                      <p className="text-sm font-bold flex items-center gap-1.5 text-center">
                        <Scan className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <span>{analysisStatus || 'Identifying and auto-filling form data...'}</span>
                      </p>
                    </div>
                  )}

                  {/* Remove Single Photo Control */}
                  <div className="absolute top-2 right-2 z-20">
                    <button
                      type="button"
                      onClick={() => {
                        const activeIdx = photoUrls.indexOf(photoUrl);
                        if (activeIdx >= 0) {
                          handleRemovePhoto(activeIdx);
                        } else {
                          handleClearCanvas();
                        }
                      }}
                      className="p-1.5 bg-[#ba1a1a]/90 hover:bg-[#ba1a1a] text-white rounded-lg shadow-md transition-colors cursor-pointer"
                      title="Remove This Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Multi-Photo Thumbnails Gallery Strip */}
                {photoUrls.length > 0 && (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                        <span>Attached Photos ({photoUrls.length})</span>
                      </span>
                      <label className="text-[11px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-blue-200 hover:bg-blue-50 transition-colors">
                        <Plus className="w-3 h-3" />
                        <span>+ Add More (Auto-AI)</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="sr-only"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {photoUrls.map((url, idx) => {
                        const det = photoDetections[url];
                        const isWaste = det?.isGarbageDetected;
                        return (
                          <div 
                            key={idx}
                            onClick={() => handleSelectPhoto(url)}
                            className={`relative rounded-lg overflow-hidden border-2 cursor-pointer h-16 group transition-all ${
                              photoUrl === url ? 'border-blue-600 ring-2 ring-blue-300 scale-[1.02]' : 'border-slate-200 hover:border-slate-400'
                            }`}
                          >
                            <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                            <span className="absolute bottom-0.5 left-0.5 px-1 bg-black/70 text-[9px] text-white font-bold rounded">
                              #{idx + 1}
                            </span>
                            {det && (
                              <span 
                                className={`absolute top-0.5 left-0.5 w-2 h-2 rounded-full ${
                                  isWaste ? 'bg-red-500 ring-1 ring-white' : 'bg-emerald-400 ring-1 ring-white'
                                }`} 
                                title={isWaste ? 'Litter Detected' : 'Clean Surface'}
                              />
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePhoto(idx);
                              }}
                              className="absolute top-0.5 right-0.5 p-0.5 bg-red-600 text-white rounded-md opacity-80 hover:opacity-100 shadow-xs cursor-pointer"
                              title="Remove Photo"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* AI Identification Summary Card (Clean, No Bounding Boxes, No Confidence Percentages) */}
                {detectionResult && !isAnalyzing && (
                  <div className={`p-3.5 rounded-xl border ${
                    detectionResult.isGarbageDetected 
                      ? 'border-emerald-200 bg-emerald-50/70' 
                      : 'border-blue-200 bg-blue-50/70'
                  } space-y-2.5`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`p-1.5 rounded-lg text-white shadow-xs ${
                          detectionResult.isGarbageDetected ? 'bg-emerald-600' : 'bg-emerald-600'
                        }`}>
                          {detectionResult.isGarbageDetected ? <CheckCircle2 className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-[#001e40]">
                            {detectionResult.isGarbageDetected ? detectionResult.classLabel : 'Sanitary / Clean Area Verified'}
                          </h4>
                          <p className="text-[11px] text-[#43474f]">
                            {detectionResult.isGarbageDetected 
                              ? 'Issue identified • Form fields automatically populated' 
                              : 'Surface verified clean • No solid waste detected'}
                          </p>
                        </div>
                      </div>

                      {detectionResult.isGarbageDetected ? (
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>Data Filled</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                          <Ban className="w-3 h-3 text-amber-700" />
                          <span>Report Blocked</span>
                        </span>
                      )}
                    </div>

                    {detectionResult.isGarbageDetected && detectionResult.estimatedAmount && (
                      <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs text-[#43474f]">
                        <span className="flex items-center gap-1 font-semibold text-[#001e40]">
                          <Scale className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Est. Amount: ~{detectionResult.estimatedAmount.weightKg} kg</span>
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-[#001e40]">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span>Housekeeping SLA: {detectionResult.estimatedAmount.recommendedSlaMinutes || 30}m</span>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Dropzone for Uploading Photos */
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
                onDragLeave={() => setIsDraggingFile(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                  isDraggingFile 
                    ? 'border-blue-500 bg-blue-50/50 scale-[0.99]' 
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/60'
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2 shadow-xs">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 mb-0.5">
                  Upload Evidence Photos (Multiple Supported)
                </h4>
                <p className="text-[11px] text-slate-500 mb-3">
                  Drag &amp; drop photos or browse files • AI runs on every photo
                </p>

                <div className="pt-3 border-t border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2 tracking-wider">
                    Or select a CSJMU campus sample
                  </span>
                  <div className="flex justify-center gap-2 overflow-x-auto py-1">
                    {samplePhotos.slice(0, 3).map((sample, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleApplySamplePhoto(sample);
                        }}
                        className="text-left p-1 rounded-lg border border-slate-200 bg-white hover:border-blue-500 hover:shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <img src={sample.url} alt={sample.title} className="w-9 h-9 rounded object-cover" />
                        <div className="text-[10px] pr-1">
                          <p className="font-semibold text-slate-800 leading-tight">{sample.title}</p>
                          <span className="text-[9px] text-slate-400 uppercase">{sample.category}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Incident Details, Category, Location & Priority (5 cols) */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Location Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>2. Incident Location</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowLocationPicker(!showLocationPicker)}
                    className="w-full px-3 py-2 text-left rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800 flex items-center justify-between hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <span className="truncate">{location || 'Select CSJMU Campus Zone...'}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>

                  {showLocationPicker && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-30 max-h-48 overflow-y-auto custom-scrollbar p-1">
                      {campusLocations.map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => {
                            setLocation(loc);
                            setShowLocationPicker(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                            location === loc ? 'bg-blue-50 text-blue-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  3. Issue Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'garbage', label: 'Solid Waste / Litter', icon: Trash2, color: 'text-emerald-700 bg-emerald-50 border-emerald-300' },
                    { id: 'waterlogging', label: 'Drain / Water Clog', icon: Droplet, color: 'text-blue-700 bg-blue-50 border-blue-300' },
                    { id: 'electrical', label: 'Electrical Hazard', icon: Zap, color: 'text-amber-700 bg-amber-50 border-amber-300' },
                    { id: 'infrastructure', label: 'Civil / Pathway Repair', icon: Hammer, color: 'text-purple-700 bg-purple-50 border-purple-300' }
                  ].map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id as ReportCategory)}
                        className={`p-2.5 rounded-lg border text-left transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected ? `${cat.color} ring-1 ring-offset-1` : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-semibold">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title & Observations */}
              <div>
                <label htmlFor="report-title-input" className="block text-xs font-bold text-slate-700 mb-1">
                  4. Report Summary Title
                </label>
                <input
                  id="report-title-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Discarded plastic bottles & paper under lab desk"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="description-input" className="block text-xs font-bold text-slate-700 mb-1">
                  5. Citizen Observation Notes
                </label>
                <textarea
                  id="description-input"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional context for housekeeping beat crew (e.g. hallway near room 204)..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* False report blocked banner */}
              {isSubmissionBlocked && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-start gap-2.5 shadow-2xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-bold text-amber-950 block">False Incident Submission Blocked:</span>
                    <span>Computer Vision verified this area is clean with zero litter or solid waste detected. Submitting false reports to campus housekeeping crews is disabled.</span>
                  </div>
                </div>
              )}

              {/* Priority Notice */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-bold text-slate-800 block">Automated Dispatch Protocol:</span>
                  Triage priority and SLA dispatch are assigned automatically based on computer-vision hazard classification and zone protocols.
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleClearCanvas}
                className="px-3 py-2 border border-slate-300 hover:border-rose-300 text-slate-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Canvas</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || isAnalyzing || isSubmissionBlocked}
                  className={`px-5 py-2 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-sm ${
                    isSubmissionBlocked 
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300' 
                      : 'bg-[#001e40] text-white hover:bg-[#003366] active:scale-[0.98] cursor-pointer'
                  } disabled:opacity-60`}
                  title={isSubmissionBlocked ? 'Area verified clean: false incident reporting blocked' : undefined}
                >
                  {isSubmissionBlocked ? (
                    <>
                      <Ban className="w-3.5 h-3.5 text-rose-500" />
                      <span>Submission Blocked</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? 'Submitting...' : 'Submit Report'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
