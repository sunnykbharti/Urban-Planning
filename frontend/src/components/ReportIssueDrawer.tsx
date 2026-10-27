import React, { useState } from 'react';
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
  Eye,
  EyeOff,
  Layers,
  HardHat,
  Clock,
  ShieldCheck,
  FileCheck,
  Plus,
  Waves,
  Hammer,
  Droplet,
  Zap,
  ShieldAlert,
  Info
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
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [storedFileName, setStoredFileName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [showLocationPicker, setShowLocationPicker] = useState<boolean>(false);

  // Computer Vision & Garbage Detection States
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [detectionResult, setDetectionResult] = useState<GarbageDetectionResult | null>(null);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);

  // Sync prefilled location
  React.useEffect(() => {
    if (prefilledLocation) {
      setLocation(prefilledLocation);
    }
  }, [prefilledLocation]);

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

  const processImageUpload = async (
    fileOrUrl: File | string,
    suggestedCategory?: ReportCategory,
    suggestedTitle?: string
  ) => {
    setIsAnalyzing(true);
    try {
      const res = await uploadAndDetectGarbageAPI(fileOrUrl, {
        sourceType: 'CITIZEN_MOBILE',
        notes: (description || title || location)
      });

      setPhotoUrl(res.file.url);
      setPhotoUrls(prev => prev.includes(res.file.url) ? prev : [...prev, res.file.url]);
      setStoredFileName(res.file.filename);
      setDetectionResult(res.detection);

      // Auto-populate form if garbage or waste is detected
      if (res.detection.isGarbageDetected) {
        if (!category) {
          setCategory(res.detection.primaryClass === 'blocked_drain' ? 'waterlogging' : 'garbage');
        }
        if (res.detection.defaultSeverity) {
          const sevLower = res.detection.defaultSeverity.toLowerCase();
          setSeverity(sevLower === 'critical' || sevLower === 'high' ? 'urgent' : 'normal');
        }
        if (!title) {
          const amtKg = res.detection.estimatedAmount?.weightKg;
          setTitle(`${res.detection.classLabel} (${amtKg ? `~${amtKg} kg` : 'Detected'})`);
        }
        if (!description.trim()) {
          setDescription(res.detection.aiSummary);
        }
      } else if (suggestedCategory) {
        if (!category) setCategory(suggestedCategory);
        if (!title && suggestedTitle) setTitle(suggestedTitle);
      }
    } catch (err) {
      console.error('Failed to process image upload and detection:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplySamplePhoto = (sample: typeof samplePhotos[0]) => {
    if (photoUrls.length === 0) {
      processImageUpload(sample.url, sample.category, sample.suggestedTitle);
    } else {
      setPhotoUrls(prev => prev.includes(sample.url) ? prev : [...prev, sample.url]);
      if (!photoUrl) setPhotoUrl(sample.url);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileList = Array.from(files) as File[];
    fileList.forEach((file, index) => {
      if (index === 0 && photoUrls.length === 0) {
        processImageUpload(file);
      } else {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            const url = ev.target.result as string;
            setPhotoUrls(prev => prev.includes(url) ? prev : [...prev, url]);
            if (!photoUrl) setPhotoUrl(url);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleRemovePhoto = (index: number) => {
    const updated = photoUrls.filter((_, i) => i !== index);
    setPhotoUrls(updated);
    if (updated.length > 0) {
      setPhotoUrl(updated[0]);
    } else {
      setPhotoUrl('');
      setDetectionResult(null);
      setStoredFileName('');
    }
  };

  const handleApplyAiInsights = () => {
    if (!detectionResult) return;
    setCategory(detectionResult.primaryClass === 'blocked_drain' ? 'waterlogging' : 'garbage');
    const sevLower = detectionResult.defaultSeverity.toLowerCase();
    setSeverity(sevLower === 'critical' || sevLower === 'high' ? 'urgent' : 'normal');
    const amtKg = detectionResult.estimatedAmount?.weightKg;
    setTitle(`${detectionResult.classLabel} (${amtKg ? `~${amtKg} kg` : 'Waste Detected'})`);
    setDescription(detectionResult.aiSummary);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
        estimatedAmount: detectionResult?.estimatedAmount,
        estimatedAmountKg: detectionResult?.estimatedAmount?.weightKg,
        estimatedVolumeM3: detectionResult?.estimatedAmount?.volumeM3,
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
              ? `Report submitted with CV Waste Telemetry: ~${detectionResult.estimatedAmount.weightKg} kg (${detectionResult.estimatedAmount.volumeM3} m³) detected and stored.`
              : `Initial incident report logged into CSJMU maintenance system (${effectiveUrls.length} photos attached).`
          }
        ]
      });
      setIsSubmitting(false);
      // Reset
      setTitle('');
      setDescription('');
      setCategory('');
      setSeverity('normal');
      setPhotoUrl('');
      setPhotoUrls([]);
      setDetectionResult(null);
      setStoredFileName('');
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop with Blur */}
      <div 
        aria-hidden="true" 
        onClick={onClose}
        className="absolute inset-0 bg-[#111c2d]/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      />

      {/* Slide-over Panel (Full-screen sheet on mobile, slide-out drawer on desktop) */}
      <div className="relative z-10 w-full max-w-full md:max-w-lg h-full bg-white md:border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <header className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Report Waste / Civic Issue</h2>
            <p className="text-xs text-slate-500 mt-0.5">Submit location and photo to dispatch campus sanitation crew.</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-lg p-2 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Form Content */}
        <form id="report-issue-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
          {/* 1. Photo Upload & Visual Evidence (FIRST) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                1. Photo Evidence
              </label>
              {storedFileName && (
                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono flex items-center gap-1">
                  <FileCheck className="w-3 h-3" /> Stored: {storedFileName.slice(0, 16)}...
                </span>
              )}
            </div>

            {photoUrl ? (
              <div className="space-y-3">
                {/* Image Container with Bounding Boxes */}
                <div className="relative rounded-xl overflow-hidden border border-[#c3c6d1] bg-[#111c2d] shadow-sm">
                  <img 
                    src={photoUrl} 
                    alt="Issue attachment preview" 
                    className="w-full h-48 object-cover rounded-xl"
                  />

                  {/* AI Scanning Animation Overlay */}
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-[#001e40]/70 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-white z-20 animate-in fade-in">
                      <div className="w-12 h-12 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mb-3" />
                      <p className="text-sm font-bold flex items-center gap-1.5">
                        <Scan className="w-4 h-4 text-emerald-400 animate-pulse" />
                        Analyzing with Computer Vision...
                      </p>
                      <p className="text-xs text-white/80 mt-1">Storing image • Estimating waste weight & volume</p>
                    </div>
                  )}

                  {/* Bounding Boxes Overlay */}
                  {!isAnalyzing && showBoundingBoxes && detectionResult?.boundingBoxes && (
                    <div className="absolute inset-0 pointer-events-none z-10">
                      {detectionResult.boundingBoxes.map((bbox) => {
                        const top = `${bbox.box.ymin * 100}%`;
                        const left = `${bbox.box.xmin * 100}%`;
                        const width = `${(bbox.box.xmax - bbox.box.xmin) * 100}%`;
                        const height = `${(bbox.box.ymax - bbox.box.ymin) * 100}%`;

                        return (
                          <div
                            key={bbox.id}
                            className="absolute border-2 border-dashed rounded transition-all duration-300"
                            style={{
                              top,
                              left,
                              width,
                              height,
                              borderColor: bbox.color || '#ef4444',
                              backgroundColor: `${bbox.color || '#ef4444'}18`
                            }}
                          >
                            <span 
                              className="absolute -top-6 left-0 text-[10px] font-bold text-white px-2 py-0.5 rounded shadow-md whitespace-nowrap flex items-center gap-1"
                              style={{ backgroundColor: bbox.color || '#ef4444' }}
                            >
                              <span>{bbox.label}</span>
                              {bbox.weightShareKg && <span>• ~{bbox.weightShareKg} kg</span>}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Controls on Image Top */}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 z-20">
                    {detectionResult?.boundingBoxes && detectionResult.boundingBoxes.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                        className={`p-1.5 rounded-lg text-xs font-semibold shadow-md transition-colors flex items-center gap-1 ${
                          showBoundingBoxes ? 'bg-[#001e40] text-white hover:bg-[#003366]' : 'bg-white/90 text-[#111c2d] hover:bg-white'
                        }`}
                        title={showBoundingBoxes ? 'Hide Bounding Boxes' : 'Show Bounding Boxes'}
                      >
                        {showBoundingBoxes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setPhotoUrl('');
                        setDetectionResult(null);
                        setStoredFileName('');
                      }}
                      className="p-1.5 bg-[#ba1a1a] text-white rounded-lg hover:bg-[#93000a] shadow-md transition-colors"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* AI Detection & Amount Estimation Results Card */}
                {detectionResult && !isAnalyzing && (
                  detectionResult.isGarbageDetected ? (
                    <div className="p-3.5 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 to-teal-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-xs">
                            <CheckCircle2 className="w-4 h-4" />
                          </span>
                          <div>
                            <h4 className="text-xs font-bold text-[#001e40] flex items-center gap-1.5">
                              <span>{detectionResult.classLabel}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-mono font-semibold">
                                {Math.round(detectionResult.confidence * 100)}% Certainty
                              </span>
                            </h4>
                            <p className="text-[11px] text-[#43474f]">
                              Image stored & verified by Computer Vision inference
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleApplyAiInsights}
                          className="text-[11px] px-2 py-1 rounded bg-[#001e40] text-white font-semibold hover:bg-[#003366] transition-colors flex items-center gap-1 shadow-xs"
                        >
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span>Apply AI</span>
                        </button>
                      </div>

                    {/* Amount Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white/80 p-2 rounded-lg border border-emerald-100 text-center">
                        <div className="flex items-center justify-center gap-1 text-[10px] text-[#737780] font-semibold mb-0.5">
                          <Scale className="w-3 h-3 text-emerald-600" />
                          <span>Est. Weight</span>
                        </div>
                        <p className="text-sm font-extrabold text-[#001e40]">
                          ~{detectionResult.estimatedAmount.weightKg} kg
                        </p>
                      </div>

                      <div className="bg-white/80 p-2 rounded-lg border border-emerald-100 text-center">
                        <div className="flex items-center justify-center gap-1 text-[10px] text-[#737780] font-semibold mb-0.5">
                          <Box className="w-3 h-3 text-blue-600" />
                          <span>Est. Volume</span>
                        </div>
                        <p className="text-sm font-extrabold text-[#001e40]">
                          {detectionResult.estimatedAmount.volumeM3} m³
                        </p>
                        <span className="text-[10px] text-[#737780]">
                          ({detectionResult.estimatedAmount.volumeLiters} L)
                        </span>
                      </div>

                      <div className="bg-white/80 p-2 rounded-lg border border-emerald-100 text-center">
                        <div className="flex items-center justify-center gap-1 text-[10px] text-[#737780] font-semibold mb-0.5">
                          <Maximize2 className="w-3 h-3 text-amber-600" />
                          <span>Ground Area</span>
                        </div>
                        <p className="text-sm font-extrabold text-[#001e40]">
                          {detectionResult.estimatedAmount.spreadAreaSqM} m²
                        </p>
                        <span className="text-[10px] text-[#737780]">
                          depth: {detectionResult.estimatedAmount.pileDepthCm || 25}cm
                        </span>
                      </div>
                    </div>

                    {/* Composition Breakdown */}
                    {detectionResult.estimatedAmount.compositionBreakdown && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#43474f]">
                          Estimated Waste Composition:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {detectionResult.estimatedAmount.compositionBreakdown.map((item, i) => (
                            <span 
                              key={i} 
                              className="text-[10px] bg-white px-2 py-0.5 rounded-md border border-emerald-200 text-[#001e40] font-medium"
                            >
                              {item.item} ({item.percentage}%)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommended Crew & SLA */}
                    <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-[#43474f]">
                      <span className="flex items-center gap-1 font-semibold text-[#001e40]">
                        <HardHat className="w-3.5 h-3.5 text-amber-600" />
                        {detectionResult.estimatedAmount.recommendedCrew}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                        <Clock className="w-3 h-3" />
                        {detectionResult.estimatedAmount.recommendedSlaMinutes || 60}m SLA
                      </span>
                    </div>
                  </div>
                ) : (
                    <div className="p-3.5 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/80 to-slate-50 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-blue-600 text-white shadow-xs">
                          <ShieldCheck className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-[#001e40] flex items-center gap-1.5">
                            <span>{detectionResult.classLabel}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-mono font-semibold">
                              {Math.round(detectionResult.confidence * 100)}% Verified Clear
                            </span>
                          </h4>
                          <p className="text-[11px] text-[#43474f]">
                            Deep Learning Model verified: No solid waste or litter detected (0.0 kg).
                          </p>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-700 bg-white/90 p-2.5 rounded-lg border border-blue-100 leading-relaxed font-sans">
                        {detectionResult.aiSummary}
                      </p>
                    </div>
                  )
                )}

                {/* Multi-Photo Thumbnails Gallery */}
                {photoUrls.length > 0 && (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                        <span>Attached Photos ({photoUrls.length})</span>
                      </span>
                      <label className="text-[11px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-blue-200">
                        <Plus className="w-3 h-3" />
                        <span>+ Add More Photos</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="sr-only"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {photoUrls.map((url, idx) => (
                        <div 
                          key={idx}
                          onClick={() => setPhotoUrl(url)}
                          className={`relative rounded-lg overflow-hidden border-2 cursor-pointer h-16 group ${
                            photoUrl === url ? 'border-blue-600 ring-2 ring-blue-300' : 'border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          <img src={url} alt={`Attachment ${idx + 1}`} className="w-full h-full object-cover" />
                          <span className="absolute bottom-0.5 left-0.5 px-1 bg-black/70 text-[9px] text-white font-bold rounded">
                            #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemovePhoto(idx);
                            }}
                            className="absolute top-0.5 right-0.5 p-0.5 bg-red-600 text-white rounded-md opacity-80 hover:opacity-100 shadow-xs"
                            title="Remove Photo"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
                  onDragLeave={() => setIsDraggingFile(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingFile(false);
                    const files = e.dataTransfer.files;
                    if (files && files.length > 0) {
                      (Array.from(files) as File[]).forEach((file, index) => {
                        if (index === 0 && photoUrls.length === 0) {
                          processImageUpload(file);
                        } else {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) {
                              const url = ev.target.result as string;
                              setPhotoUrls(prev => prev.includes(url) ? prev : [...prev, url]);
                              if (!photoUrl) setPhotoUrl(url);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      });
                    }
                  }}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                    isDraggingFile ? 'border-[#001e40] bg-[#e7eeff]' : 'border-[#c3c6d1] bg-white hover:bg-[#f0f3ff]'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center space-y-1.5">
                    <div className="w-10 h-10 rounded-lg bg-[#f0f3ff] flex items-center justify-center text-[#001e40] mb-1">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div className="flex text-xs text-[#43474f] justify-center items-center gap-1">
                      <label htmlFor="file-upload" className="cursor-pointer font-bold text-[#001e40] hover:underline">
                        <span>Upload photo(s) of garbage</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="sr-only"
                        />
                      </label>
                      <span>or drag and drop</span>
                    </div>
                    <p className="text-[11px] text-[#737780]">Select 1 or multiple photos • PNG, JPG up to 10MB each</p>
                  </div>
                </div>

                {/* Quick sample photos for developer debugging only (?dev=1) */}
                {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('dev') === '1' && (
                  <div className="mt-2.5 p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-[11px] text-slate-500 mb-1 font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-slate-600" /> Dev Test Images:
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {samplePhotos.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleApplySamplePhoto(s)}
                          className="text-left text-[10px] p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 truncate transition-colors flex items-center gap-1.5 font-medium"
                        >
                          <ImageIcon className="w-3 h-3 shrink-0 text-slate-500" />
                          <span className="truncate">{s.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Issue Category (Compact Select) */}
          <div>
            <label htmlFor="category-select" className="block text-xs font-bold text-slate-700 mb-1">
              2. Issue Category
            </label>
            <select
              id="category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value as ReportCategory)}
              required
              className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer"
            >
              <option value="">Select category...</option>
              <option value="garbage">Solid Waste / Overflowing Bin</option>
              <option value="waterlogging">Storm Drainage &amp; Blocked Grate</option>
              <option value="infrastructure">Pavement / Pathway Defect</option>
              <option value="plumbing">Water Supply &amp; Plumbing</option>
              <option value="electrical">Lighting &amp; Exposed Wiring</option>
              <option value="safety">Campus Safety Hazard</option>
              <option value="other">General Facility Defect</option>
            </select>
          </div>

          {/* 3. Location on Campus (Auto-filled from map pin) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="location-input" className="block text-xs font-bold text-slate-700">
                3. Campus Location
              </label>
              {prefilledCoords && (
                <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                  Map Pin: {prefilledCoords.x}%, {prefilledCoords.y}%
                </span>
              )}
            </div>

            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                id="location-input"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. UIET Block 1, Central Library Quad"
                required
                className="w-full pl-9 pr-3 py-2 rounded border border-slate-300 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-blue-600"
              />
            </div>

            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Quick selection:</span>
              <button
                type="button"
                onClick={() => setShowLocationPicker(!showLocationPicker)}
                className="text-blue-700 hover:underline flex items-center gap-0.5 font-medium cursor-pointer"
              >
                <span>Browse buildings</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {showLocationPicker && (
              <div className="mt-1.5 p-2 bg-slate-50 rounded border border-slate-200 space-y-1 max-h-36 overflow-y-auto custom-scrollbar">
                {campusLocations.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      setLocation(loc);
                      setShowLocationPicker(false);
                    }}
                    className={`w-full text-left px-2 py-1 text-xs rounded transition-colors flex items-center justify-between ${
                      location === loc ? 'bg-blue-700 text-white font-medium' : 'hover:bg-slate-200/60 text-slate-800'
                    }`}
                  >
                    <span>{loc}</span>
                    {location === loc && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 4. Report Title */}
          <div>
            <label htmlFor="title-input" className="block text-xs font-bold text-slate-700 mb-1">
              4. Report Title
            </label>
            <input
              id="title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Garbage bin overflow and ground spillage"
              required
              className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-blue-600"
            />
          </div>

          {/* 5. System Priority & Citizen Note (Urgency radio removed; priority assigned by operations pipeline) */}
          <div className="space-y-2">
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900 block">System-Assigned Operational Priority</span>
                <span className="text-[11px] text-slate-500">Triage priority and SLA dispatch are assigned automatically based on computer-vision hazard classification and zone protocols.</span>
              </div>
            </div>

            <div>
              <label htmlFor="description-input" className="block text-xs font-bold text-slate-700 mb-1">
                Citizen Observation Note (Optional)
              </label>
              <textarea
                id="description-input"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any helpful observations for the field team (e.g. spilled during lunch rush, obstructing pedestrian pathway)..."
                className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-blue-600 resize-none"
              />
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="border-t border-[#c3c6d1] p-4 px-6 bg-white flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-[#737780] text-[#50606f] font-semibold text-sm rounded-lg hover:bg-[#f0f3ff] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || isAnalyzing}
            className="px-5 py-2 bg-[#001e40] text-white font-semibold text-sm rounded-lg hover:bg-[#003366] active:scale-[0.98] transition-all flex items-center gap-2 shadow-xs disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Report'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
