import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Minus, 
  Crosshair, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Building, 
  Info,
  Maximize2,
  FileText,
  Eye,
  Search
} from 'lucide-react';
import { MaintenanceReport, CampusBlock } from '../types';

interface CampusMapProps {
  reports: MaintenanceReport[];
  blocks: CampusBlock[];
  onSelectReport: (report: MaintenanceReport) => void;
  onOpenReportDrawerWithLocation?: (locationName: string, coords: { x: number; y: number }) => void;
}

export const CampusMap: React.FC<CampusMapProps> = ({
  reports,
  blocks,
  onSelectReport,
  onOpenReportDrawerWithLocation
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [mapStyle, setMapStyle] = useState<'blueprint' | 'satellite' | 'cad'>('blueprint');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedBlock, setSelectedBlock] = useState<CampusBlock | null>(null);
  const [hoveredReport, setHoveredReport] = useState<MaintenanceReport | null>(null);
  const [activePinHighlight, setActivePinHighlight] = useState<string | null>(null);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Statistics calculation
  const totalReportsCount = 124; // baseline from prototype + live adjustments
  const resolvedCount = reports.filter(r => r.status === 'resolved').length + 79;
  const urgentCount = reports.filter(r => r.severity === 'urgent' && r.status !== 'resolved').length + 10;

  // Filtered reports
  const filteredReports = reports.filter(r => {
    if (selectedCategoryFilter === 'all') return true;
    if (selectedCategoryFilter === 'urgent') return r.severity === 'urgent' && r.status !== 'resolved';
    if (selectedCategoryFilter === 'pending') return r.status === 'pending';
    if (selectedCategoryFilter === 'resolved') return r.status === 'resolved';
    return r.category === selectedCategoryFilter;
  });

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 2.2));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.8));
  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setSelectedBlock(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof SVGElement || (e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).closest('.marker-btn')) {
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If clicked directly on canvas, calculate coordinate percentage
    if (!mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left - panOffset.x) / (rect.width * zoomLevel)) * 100;
    const clickY = ((e.clientY - rect.top - panOffset.y) / (rect.height * zoomLevel)) * 100;

    if (clickX >= 0 && clickX <= 100 && clickY >= 0 && clickY <= 100) {
      // Find nearest block if any
      const nearbyBlock = blocks.find(b => 
        clickX >= b.bounds.x - 2 && clickX <= b.bounds.x + b.bounds.width + 2 &&
        clickY >= b.bounds.y - 2 && clickY <= b.bounds.y + b.bounds.height + 2
      );

      if (e.detail === 2 && onOpenReportDrawerWithLocation) {
        // Double click drops a pin report
        const locName = nearbyBlock ? nearbyBlock.name : `Campus Coordinates (${Math.round(clickX)}%, ${Math.round(clickY)}%)`;
        onOpenReportDrawerWithLocation(locName, { x: Math.round(clickX), y: Math.round(clickY) });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#001e40] tracking-tight mb-1">
            Campus Infrastructure Overview
          </h1>
          <p className="text-sm md:text-base text-[#43474f]">
            Real-time status of UIET blocks, pathways, and campus facilities.
          </p>
        </div>

        {/* Quick Stats Metric Cards */}
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          {/* Total Reports */}
          <div className="bg-white px-4 py-3 rounded-xl border border-[#c3c6d1] flex items-center gap-3.5 min-w-[150px] shadow-xs hover:border-[#001e40] transition-colors">
            <div className="p-2.5 bg-[#e7eeff] rounded-full text-[#001e40]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#43474f] uppercase tracking-wider">Total Reports</p>
              <p className="text-xl font-bold text-[#111c2d] leading-tight">{totalReportsCount}</p>
            </div>
          </div>

          {/* Resolved */}
          <div className="bg-white px-4 py-3 rounded-xl border border-[#c3c6d1] flex items-center gap-3.5 min-w-[150px] shadow-xs hover:border-[#2e7d32] transition-colors">
            <div className="p-2.5 bg-[#e8f5e9] rounded-full text-[#2e7d32]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#43474f] uppercase tracking-wider">Resolved</p>
              <p className="text-xl font-bold text-[#111c2d] leading-tight">{resolvedCount}</p>
            </div>
          </div>

          {/* Urgent */}
          <div className="bg-white px-4 py-3 rounded-xl border border-[#ffcdd2] flex items-center gap-3.5 min-w-[150px] shadow-[0_0_15px_rgba(186,26,26,0.12)] hover:border-[#ba1a1a] transition-all">
            <div className="p-2.5 bg-[#ffebee] rounded-full text-[#ba1a1a] animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#43474f] uppercase tracking-wider">Urgent</p>
              <p className="text-xl font-bold text-[#ba1a1a] leading-tight">{urgentCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Map Filter Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 px-4 rounded-xl border border-[#c3c6d1] shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar py-1">
          <span className="text-xs font-bold text-[#43474f] uppercase mr-1 flex items-center gap-1.5 flex-shrink-0">
            <Layers className="w-3.5 h-3.5 text-[#001e40]" /> Filter:
          </span>
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategoryFilter === 'all'
                ? 'bg-[#001e40] text-white'
                : 'bg-[#f0f3ff] text-[#43474f] hover:bg-[#e7eeff]'
            }`}
          >
            All Active Pins ({reports.length})
          </button>
          <button
            onClick={() => setSelectedCategoryFilter('urgent')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
              selectedCategoryFilter === 'urgent'
                ? 'bg-[#ba1a1a] text-white'
                : 'bg-[#ffdad6] text-[#93000a] hover:bg-[#ffcdd2]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#ba1a1a] inline-block animate-ping"></span>
            Urgent Hazards ({reports.filter(r => r.severity === 'urgent' && r.status !== 'resolved').length})
          </button>
          <button
            onClick={() => setSelectedCategoryFilter('pending')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategoryFilter === 'pending'
                ? 'bg-[#fbc02d] text-gray-900 font-bold'
                : 'bg-[#fff9c4] text-[#b78103] hover:bg-[#fff59d]'
            }`}
          >
            Pending Review
          </button>
          <button
            onClick={() => setSelectedCategoryFilter('resolved')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategoryFilter === 'resolved'
                ? 'bg-[#2e7d32] text-white'
                : 'bg-[#e8f5e9] text-[#1b5e20] hover:bg-[#c8e6c9]'
            }`}
          >
            Resolved Points
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#737780] hidden lg:inline">
            💡 Tip: Double-click anywhere on the map to drop a new maintenance report
          </span>
          <div className="flex bg-[#f0f3ff] p-0.5 rounded-lg border border-[#c3c6d1]">
            <button
              onClick={() => setMapStyle('blueprint')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                mapStyle === 'blueprint' ? 'bg-white text-[#001e40] shadow-xs font-bold' : 'text-[#43474f]'
              }`}
            >
              Architectural
            </button>
            <button
              onClick={() => setMapStyle('satellite')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                mapStyle === 'satellite' ? 'bg-white text-[#001e40] shadow-xs font-bold' : 'text-[#43474f]'
              }`}
            >
              Cadastral
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Map Container */}
      <div 
        ref={mapContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleMapClick}
        className={`relative w-full h-[620px] bg-[#d8e3fb] rounded-xl border border-[#c3c6d1] overflow-hidden shadow-sm select-none cursor-grab ${
          isDragging ? 'cursor-grabbing' : ''
        }`}
      >
        {/* Layer 1: Simulated Architectural Campus Vector / Raster Background */}
        <div 
          className="absolute inset-0 transition-transform duration-100 ease-out origin-center"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`
          }}
        >
          {/* Realistic Architectural Campus Map Artwork matching Image 1 */}
          <svg 
            className="w-full h-full object-cover min-w-[900px] min-h-[620px]" 
            viewBox="0 0 1000 700" 
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <pattern id="campus-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#c3c6d1" strokeWidth="0.5" opacity="0.3" />
              </pattern>
              <pattern id="grass-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
                <rect width="10" height="10" fill="#e8f5e9" opacity="0.6" />
                <circle cx="5" cy="5" r="1" fill="#c8e6c9" />
              </pattern>
              <filter id="building-shadow" x="-5%" y="-5%" width="120%" height="120%">
                <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#001e40" floodOpacity="0.12" />
              </filter>
            </defs>

            {/* Base Terrain */}
            <rect width="1000" height="700" fill="#eef3f9" />
            <rect width="1000" height="700" fill="url(#campus-grid)" />

            {/* Green Lawn & Tree Quads */}
            {/* North Campus Green */}
            <path d="M 50 40 Q 200 20 400 50 L 380 180 Q 200 160 60 170 Z" fill="url(#grass-pattern)" stroke="#c8e6c9" strokeWidth="1.5" />
            {/* Central Quad Lawn */}
            <rect x="420" y="320" width="120" height="180" rx="8" fill="url(#grass-pattern)" stroke="#c8e6c9" strokeWidth="1.5" />
            {/* Sports Grounds */}
            <rect x="750" y="160" width="200" height="260" rx="16" fill="#e8f5e9" stroke="#a5d6a7" strokeWidth="2" />
            <ellipse cx="850" cy="290" rx="80" ry="100" fill="none" stroke="#81c784" strokeWidth="1.5" strokeDasharray="4 4" />
            <text x="850" y="295" textAnchor="middle" fill="#2e7d32" fontSize="13" fontWeight="bold" opacity="0.7">Athletic Fields &amp; Stadium</text>

            {/* Main Roadways & Pedestrian Boulevards */}
            {/* Outer Ring Road */}
            <path d="M 30 120 L 970 120" stroke="#ffffff" strokeWidth="24" strokeLinecap="round" />
            <path d="M 30 120 L 970 120" stroke="#c3c6d1" strokeWidth="26" strokeDasharray="6 6" fill="none" opacity="0.4" />
            {/* North Entrance Avenue */}
            <path d="M 550 20 L 550 680" stroke="#ffffff" strokeWidth="32" strokeLinecap="square" />
            <path d="M 550 20 L 550 680" stroke="#d5e3ff" strokeWidth="2" strokeDasharray="8 8" />
            {/* Cross East-West Spine */}
            <path d="M 40 480 L 960 480" stroke="#ffffff" strokeWidth="28" />
            {/* Internal Walkways */}
            <path d="M 220 120 L 220 620" stroke="#ffffff" strokeWidth="14" />
            <path d="M 380 200 L 380 580" stroke="#ffffff" strokeWidth="14" />
            <path d="M 720 120 L 720 620" stroke="#ffffff" strokeWidth="14" />

            {/* Campus Architectural Blocks (Buildings) */}
            {/* 1. UIET Block 1 (A1 Science Center) */}
            <g 
              className="cursor-pointer transition-transform hover:opacity-90"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedBlock(blocks[0]);
              }}
              filter="url(#building-shadow)"
            >
              <rect x="300" y="240" width="120" height="90" rx="4" fill="#ffffff" stroke="#737780" strokeWidth="1.5" />
              <rect x="320" y="260" width="80" height="50" rx="2" fill="#f0f3ff" stroke="#c3c6d1" strokeWidth="1" />
              <text x="360" y="280" textAnchor="middle" fill="#001e40" fontSize="12" fontWeight="bold">A1</text>
              <text x="360" y="295" textAnchor="middle" fill="#43474f" fontSize="10">Science Center</text>
              <text x="360" y="320" textAnchor="middle" fill="#737780" fontSize="9">UIET Block 1</text>
            </g>

            {/* 2. UIET Block 2 (A15 Academic Hall) */}
            <g 
              className="cursor-pointer transition-transform hover:opacity-90"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedBlock(blocks[1]);
              }}
              filter="url(#building-shadow)"
            >
              <rect x="420" y="490" width="110" height="100" rx="4" fill="#ffffff" stroke="#737780" strokeWidth="1.5" />
              <path d="M 435 505 L 515 505 L 515 575 L 435 575 Z" fill="#f0f3ff" stroke="#c3c6d1" strokeWidth="1" />
              <text x="475" y="535" textAnchor="middle" fill="#001e40" fontSize="12" fontWeight="bold">A15</text>
              <text x="475" y="550" textAnchor="middle" fill="#43474f" fontSize="10">Academic Hall</text>
              <text x="475" y="580" textAnchor="middle" fill="#737780" fontSize="9">UIET Block 2 (ME/Civil)</text>
            </g>

            {/* 3. Central Library */}
            <g 
              className="cursor-pointer transition-transform hover:opacity-90"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedBlock(blocks[3]);
              }}
              filter="url(#building-shadow)"
            >
              <rect x="540" y="230" width="130" height="110" rx="6" fill="#ffffff" stroke="#003366" strokeWidth="2" />
              <circle cx="605" cy="285" r="30" fill="#e7eeff" stroke="#799dd6" strokeWidth="1" />
              <text x="605" y="280" textAnchor="middle" fill="#001e40" fontSize="13" fontWeight="bold">Library</text>
              <text x="605" y="295" textAnchor="middle" fill="#43474f" fontSize="10">Resource Hub</text>
            </g>

            {/* 4. UIET Block 3 (A23 Tech Wing) */}
            <g 
              className="cursor-pointer transition-transform hover:opacity-90"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedBlock(blocks[2]);
              }}
              filter="url(#building-shadow)"
            >
              <rect x="435" y="245" width="95" height="80" rx="4" fill="#ffffff" stroke="#737780" strokeWidth="1.5" />
              <text x="482" y="280" textAnchor="middle" fill="#001e40" fontSize="11" fontWeight="bold">A23</text>
              <text x="482" y="295" textAnchor="middle" fill="#43474f" fontSize="9">Tech Wing</text>
            </g>

            {/* 5. Science Block B (A22 University Halls) */}
            <g 
              className="cursor-pointer transition-transform hover:opacity-90"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedBlock(blocks[5]);
              }}
              filter="url(#building-shadow)"
            >
              <rect x="430" y="140" width="120" height="85" rx="4" fill="#ffffff" stroke="#737780" strokeWidth="1.5" />
              <text x="490" y="175" textAnchor="middle" fill="#001e40" fontSize="11" fontWeight="bold">A22</text>
              <text x="490" y="190" textAnchor="middle" fill="#43474f" fontSize="9">University Halls</text>
            </g>

            {/* 6. Central Mechanical Workshop (WS1) */}
            <g 
              className="cursor-pointer transition-transform hover:opacity-90"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedBlock(blocks[4]);
              }}
              filter="url(#building-shadow)"
            >
              <rect x="180" y="380" width="130" height="120" rx="4" fill="#ffffff" stroke="#737780" strokeWidth="1.5" />
              <text x="245" y="435" textAnchor="middle" fill="#001e40" fontSize="12" fontWeight="bold">WS1 Workshop</text>
              <text x="245" y="450" textAnchor="middle" fill="#43474f" fontSize="10">Mechanical Bays</text>
            </g>

            {/* 7. Student Activity Center & Gym (SU) */}
            <g filter="url(#building-shadow)">
              <rect x="640" y="240" width="70" height="60" rx="4" fill="#ffffff" stroke="#737780" strokeWidth="1" />
              <text x="675" y="275" textAnchor="middle" fill="#001e40" fontSize="11" fontWeight="bold">SU</text>
              <rect x="720" y="240" width="60" height="60" rx="4" fill="#ffffff" stroke="#737780" strokeWidth="1" />
              <text x="750" y="275" textAnchor="middle" fill="#001e40" fontSize="11" fontWeight="bold">GYM</text>
            </g>

            {/* 8. Residential Halls / Hostels (L1 to L9) */}
            <g 
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedBlock(blocks[8]);
              }}
              filter="url(#building-shadow)"
            >
              <rect x="640" y="480" width="120" height="90" rx="4" fill="#ffffff" stroke="#737780" strokeWidth="1.5" />
              <text x="700" y="520" textAnchor="middle" fill="#001e40" fontSize="11" fontWeight="bold">Residence</text>
              <text x="700" y="535" textAnchor="middle" fill="#43474f" fontSize="9">Halls (Dorm 4-5)</text>
              {/* Secondary Hostel blocks */}
              <rect x="770" y="480" width="80" height="90" rx="4" fill="#ffffff" stroke="#737780" strokeWidth="1.5" />
              <text x="810" y="525" textAnchor="middle" fill="#001e40" fontSize="11" fontWeight="bold">R16 - R18</text>
            </g>

            {/* 9. Parking and Quad labels */}
            <rect x="860" y="480" width="90" height="120" rx="4" fill="#e7eeff" stroke="#c3c6d1" strokeWidth="1" strokeDasharray="3 3" />
            <text x="905" y="545" textAnchor="middle" fill="#799dd6" fontSize="16" fontWeight="bold">P4 / P5</text>
            <text x="905" y="565" textAnchor="middle" fill="#50606f" fontSize="9">North Parking</text>

            <text x="550" y="430" textAnchor="middle" fill="#737780" fontSize="10" fontStyle="italic">Central Quad</text>
          </svg>

          {/* Interactive Report Pins Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {filteredReports.map((report) => {
              const isUrgent = report.severity === 'urgent' && report.status !== 'resolved';
              const isResolved = report.status === 'resolved';
              const isPending = report.status === 'pending';
              const isHighlighted = activePinHighlight === report.id;

              return (
                <div
                  key={report.id}
                  style={{
                    left: `${report.coordinates.x}%`,
                    top: `${report.coordinates.y}%`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto marker-btn z-20 group"
                  onMouseEnter={() => setHoveredReport(report)}
                  onMouseLeave={() => setHoveredReport(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePinHighlight(report.id);
                    onSelectReport(report);
                  }}
                >
                  {/* Pin Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-30 transition-all pointer-events-none">
                    <div className="bg-[#001e40] text-white border border-[#c3c6d1] px-3 py-1.5 rounded-lg shadow-xl text-xs whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className={`w-2 h-2 rounded-full ${
                          isUrgent ? 'bg-[#ffdad6] text-[#ba1a1a]' : isResolved ? 'bg-[#a5d6a7]' : 'bg-[#fff59d]'
                        }`}></span>
                        {report.title}
                      </div>
                      <div className="text-[10px] text-[#dee8ff] mt-0.5 flex items-center justify-between gap-2">
                        <span>{report.location}</span>
                        <span className="font-semibold uppercase text-white/90">({report.status})</span>
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-[#001e40] rotate-45 -mt-1"></div>
                  </div>

                  {/* Marker Pin Visual */}
                  <div className="relative cursor-pointer transition-transform hover:scale-125 duration-150">
                    {/* Urgent Pin (Red with Bouncing and Pulse) */}
                    {isUrgent && (
                      <div className="flex flex-col items-center animate-bounce">
                        <div className="relative flex items-center justify-center">
                          <span className="absolute w-8 h-8 rounded-full bg-[#ba1a1a]/30 animate-ping"></span>
                          <div className="w-9 h-9 rounded-full bg-[#ba1a1a] text-white flex items-center justify-center shadow-lg border-2 border-white">
                            <MapPin className="w-5 h-5 fill-current" />
                          </div>
                        </div>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] mt-0.5"></span>
                      </div>
                    )}

                    {/* Pending Review Pin (Yellow) */}
                    {isPending && !isUrgent && (
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-[#fbc02d] text-gray-900 flex items-center justify-center shadow-md border-2 border-white">
                          <MapPin className="w-4 h-4 fill-current" />
                        </div>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#fbc02d] mt-0.5"></span>
                      </div>
                    )}

                    {/* Resolved Pin (Green) */}
                    {isResolved && (
                      <div className="flex flex-col items-center opacity-85 hover:opacity-100">
                        <div className="w-7 h-7 rounded-full bg-[#388e3c] text-white flex items-center justify-center shadow-sm border-2 border-white">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="w-1 h-1 rounded-full bg-[#388e3c] mt-0.5"></span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating Map Controls (Zoom In, Zoom Out, Center) */}
        <div className="absolute top-4 right-4 bg-white p-1.5 rounded-lg border border-[#c3c6d1] shadow-md flex flex-col gap-1 z-30">
          <button
            id="map-zoom-in"
            onClick={handleZoomIn}
            aria-label="Zoom In"
            title="Zoom In"
            className="p-2 text-[#111c2d] hover:bg-[#f0f3ff] hover:text-[#001e40] rounded transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="w-full h-px bg-[#c3c6d1]"></div>
          <button
            id="map-zoom-out"
            onClick={handleZoomOut}
            aria-label="Zoom Out"
            title="Zoom Out"
            className="p-2 text-[#111c2d] hover:bg-[#f0f3ff] hover:text-[#001e40] rounded transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="w-full h-px bg-[#c3c6d1]"></div>
          <button
            id="map-recenter"
            onClick={handleResetView}
            aria-label="Reset View"
            title="Reset Map View"
            className="p-2 text-[#111c2d] hover:bg-[#f0f3ff] hover:text-[#001e40] rounded transition-colors"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>

        {/* Status Legend Overlay matching Image 1 */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-xs p-3 rounded-lg border border-[#c3c6d1] shadow-md flex flex-col gap-2 z-30">
          <p className="text-[11px] font-bold text-[#111c2d] uppercase tracking-wider">Status Legend</p>
          <div className="flex items-center gap-2 text-xs text-[#111c2d]">
            <span className="w-3 h-3 rounded-full bg-[#ba1a1a] animate-pulse ring-2 ring-[#ffdad6]"></span>
            <span>Urgent Attention ({urgentCount})</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#111c2d]">
            <span className="w-3 h-3 rounded-full bg-[#fbc02d]"></span>
            <span>Pending Review</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#111c2d]">
            <span className="w-3 h-3 rounded-full bg-[#388e3c]"></span>
            <span>Resolved</span>
          </div>
        </div>

        {/* Selected Block Info Card Popover */}
        {selectedBlock && (
          <div className="absolute top-4 left-4 max-w-xs bg-white rounded-xl border border-[#c3c6d1] p-4 shadow-xl z-30 animate-in fade-in duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-[#001e40]">
                <Building className="w-4 h-4" />
                <h3 className="font-bold text-sm text-[#001e40]">{selectedBlock.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedBlock(null)}
                className="text-[#737780] hover:text-[#111c2d] text-xs font-bold p-1"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#43474f] mt-1">{selectedBlock.department}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#f0f3ff] p-2 rounded">
                <span className="text-[10px] text-[#737780] uppercase block">Condition</span>
                <span className="font-semibold text-[#001e40]">{selectedBlock.condition}</span>
              </div>
              <div className="bg-[#f0f3ff] p-2 rounded">
                <span className="text-[10px] text-[#737780] uppercase block">Open Reports</span>
                <span className="font-semibold text-[#ba1a1a]">{selectedBlock.activeReportsCount}</span>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  if (onOpenReportDrawerWithLocation) {
                    onOpenReportDrawerWithLocation(selectedBlock.name, {
                      x: selectedBlock.bounds.x + 5,
                      y: selectedBlock.bounds.y + 5
                    });
                  }
                }}
                className="flex-1 py-1.5 bg-[#001e40] text-white text-xs font-semibold rounded hover:bg-[#003366] transition-colors"
              >
                + Report In This Block
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
