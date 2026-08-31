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
  ChevronDown
} from 'lucide-react';
import { ReportCategory, ReportSeverity, MaintenanceReport } from '../types';
import { samplePhotos } from '../data/mockData';

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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [showLocationPicker, setShowLocationPicker] = useState<boolean>(false);

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

  const handleApplySamplePhoto = (sample: typeof samplePhotos[0]) => {
    setPhotoUrl(sample.url);
    if (!category) setCategory(sample.category);
    if (!title) setTitle(sample.suggestedTitle);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
    }
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

    setTimeout(() => {
      onSubmitReport({
        title: generatedTitle,
        description: description.trim(),
        category: category as ReportCategory,
        severity,
        status: 'pending',
        location,
        coordinates: prefilledCoords,
        imageUrl: photoUrl || samplePhotos[0].url,
        reportedBy: {
          name: 'Sunny Bharti',
          role: 'Campus Student / Reporter'
        },
        updates: [
          {
            id: `up-${Date.now()}`,
            timestamp: 'Just now',
            author: 'Sunny Bharti',
            message: 'Initial incident report logged into CSJMU maintenance system.'
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

      {/* Slide-over Panel matching Image 3 */}
      <div className="relative z-10 w-full max-w-md h-full bg-white border-l border-[#c3c6d1] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <header className="px-6 py-4 border-b border-[#c3c6d1] flex items-center justify-between bg-white">
          <div>
            <h2 className="text-lg font-bold text-[#001e40]">Report an Issue</h2>
            <p className="text-xs text-[#43474f] mt-0.5">Submit a new maintenance or safety report.</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-[#43474f] hover:bg-[#f0f3ff] hover:text-[#001e40] rounded-full p-2 transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Form Content */}
        <form id="report-issue-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">
          {/* Location Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="location-input" className="block text-xs font-bold text-[#43474f] uppercase tracking-wider">
                Location
              </label>
              <button
                type="button"
                onClick={() => setShowLocationPicker(!showLocationPicker)}
                className="text-[11px] text-[#003366] font-semibold hover:underline"
              >
                {showLocationPicker ? 'Lock Location' : 'Change Block'}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737780]">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                id="location-input"
                name="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                readOnly={!showLocationPicker}
                className={`block w-full pl-9 pr-3 py-2 border border-[#c3c6d1] rounded-lg text-sm font-medium text-[#111c2d] focus:ring-1 focus:ring-[#001e40] focus:border-[#001e40] outline-none ${
                  showLocationPicker ? 'bg-white' : 'bg-[#f0f3ff] cursor-pointer'
                }`}
                placeholder="Select or enter location"
              />
            </div>

            {showLocationPicker && (
              <div className="mt-2 p-2 bg-[#f0f3ff] border border-[#c3c6d1] rounded-lg max-h-40 overflow-y-auto custom-scrollbar space-y-1">
                {campusLocations.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      setLocation(loc);
                      setShowLocationPicker(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs text-[#111c2d] hover:bg-white rounded font-medium transition-colors"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            )}
            <p className="text-xs text-[#43474f] mt-1 flex items-center gap-1">
              <span>📍 Location detected automatically from map coords.</span>
            </p>
          </div>

          {/* Category Selector */}
          <div>
            <label htmlFor="category-select" className="block text-xs font-bold text-[#43474f] uppercase tracking-wider mb-1.5">
              Category <span className="text-[#ba1a1a]">*</span>
            </label>
            <div className="relative">
              <select
                id="category-select"
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ReportCategory)}
                required
                className="block w-full pl-3 pr-10 py-2 border border-[#c3c6d1] rounded-lg bg-white text-[#111c2d] text-sm focus:ring-1 focus:ring-[#001e40] focus:border-[#001e40] outline-none appearance-none cursor-pointer"
              >
                <option value="" disabled>Select an issue category</option>
                <option value="garbage">Garbage / Waste</option>
                <option value="infrastructure">Damaged Infrastructure</option>
                <option value="waterlogging">Waterlogging</option>
                <option value="safety">Safety / Electrical Hazard</option>
                <option value="plumbing">Plumbing / Water Leak</option>
                <option value="electrical">Lighting / Power</option>
                <option value="hvac">HVAC / Air Conditioning</option>
                <option value="other">Other Campus Issue</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#737780]">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Severity Level Toggle */}
          <div>
            <label className="block text-xs font-bold text-[#43474f] uppercase tracking-wider mb-1.5">
              Severity Level
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Normal Option */}
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="severity"
                  value="normal"
                  checked={severity === 'normal'}
                  onChange={() => setSeverity('normal')}
                  className="sr-only"
                />
                <div className={`py-2 px-4 rounded-lg border text-center font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  severity === 'normal'
                    ? 'border-[#001e40] bg-[#001e40] text-white shadow-xs'
                    : 'border-[#c3c6d1] bg-white text-[#43474f] hover:bg-[#f0f3ff]'
                }`}>
                  <Check className={`w-4 h-4 ${severity === 'normal' ? 'opacity-100' : 'opacity-0'}`} />
                  <span>Normal</span>
                </div>
              </label>

              {/* Urgent Option */}
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="severity"
                  value="urgent"
                  checked={severity === 'urgent'}
                  onChange={() => setSeverity('urgent')}
                  className="sr-only"
                />
                <div className={`py-2 px-4 rounded-lg border text-center font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  severity === 'urgent'
                    ? 'border-[#ba1a1a] bg-[#ffdad6] text-[#93000a] ring-1 ring-[#ba1a1a]'
                    : 'border-[#c3c6d1] bg-white text-[#43474f] hover:bg-[#f0f3ff]'
                }`}>
                  <AlertTriangle className="w-4 h-4 text-[#ba1a1a]" />
                  <span>Urgent</span>
                </div>
              </label>
            </div>
          </div>

          {/* Short Title (Optional helper) */}
          <div>
            <label htmlFor="issue-title" className="block text-xs font-bold text-[#43474f] uppercase tracking-wider mb-1.5">
              Issue Summary (Title)
            </label>
            <input
              id="issue-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Broken pavement near library entrance"
              className="block w-full border border-[#c3c6d1] rounded-lg bg-white text-[#111c2d] text-sm p-2.5 focus:ring-1 focus:ring-[#001e40] focus:border-[#001e40] outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="description-input" className="block text-xs font-bold text-[#43474f] uppercase tracking-wider">
                Description <span className="text-[#ba1a1a]">*</span>
              </label>
              <span className="text-[11px] text-[#737780]">{description.length}/300</span>
            </div>
            <textarea
              id="description-input"
              name="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Provide details about the issue (exact room, floor, safety hazard)..."
              className="block w-full border border-[#c3c6d1] rounded-lg bg-white text-[#111c2d] text-sm p-3 focus:ring-1 focus:ring-[#001e40] focus:border-[#001e40] outline-none resize-none"
            />
          </div>

          {/* Photo Upload Zone matching Image 3 */}
          <div>
            <label className="block text-xs font-bold text-[#43474f] uppercase tracking-wider mb-1.5">
              Attach Photo (Optional)
            </label>

            {photoUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-[#c3c6d1] bg-[#f0f3ff] p-2">
                <img 
                  src={photoUrl} 
                  alt="Issue attachment preview" 
                  className="w-full h-36 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  className="absolute top-3 right-3 p-1.5 bg-[#ba1a1a] text-white rounded-full hover:bg-[#93000a] shadow-md transition-colors"
                  title="Remove Photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
                  onDragLeave={() => setIsDraggingFile(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingFile(false);
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      setPhotoUrl(URL.createObjectURL(file));
                    }
                  }}
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                    isDraggingFile ? 'border-[#001e40] bg-[#e7eeff]' : 'border-[#c3c6d1] bg-white hover:bg-[#f0f3ff]'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <Camera className="w-8 h-8 text-[#737780]" />
                    <div className="flex text-xs text-[#43474f] justify-center items-center gap-1">
                      <label htmlFor="file-upload" className="cursor-pointer font-bold text-[#001e40] hover:underline">
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="sr-only"
                        />
                      </label>
                      <span>or drag and drop</span>
                    </div>
                    <p className="text-[11px] text-[#737780]">PNG, JPG up to 10MB</p>
                  </div>
                </div>

                {/* Preset quick sample photos for testing convenience */}
                <div className="mt-2">
                  <p className="text-[11px] text-[#737780] mb-1 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#003366]" /> Quick sample photos:
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {samplePhotos.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplySamplePhoto(s)}
                        className="text-left text-[10px] p-1.5 rounded border border-[#dee8ff] bg-[#f0f3ff] hover:bg-[#dee8ff] text-[#001e40] truncate transition-colors flex items-center gap-1"
                      >
                        <ImageIcon className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{s.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
            disabled={isSubmitting}
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
