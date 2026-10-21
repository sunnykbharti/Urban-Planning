import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  MaintenanceReport, 
  CampusBlock, 
  UserRole,
  ReportSeverity
} from '../types';
import { 
  CSJMU_CENTER, 
  CSJMU_LANDMARKS, 
  CSJMU_CAMPUS_BOUNDARY, 
  SEVERITY_CONFIGS, 
  SeverityColor, 
  getReportSeverityColor, 
  getReportLatLng 
} from '../data/csjmuGeoData';
import { resolveMediaUrl } from '../api/client';
import { 
  Layers, 
  Compass, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Maximize2, 
  Eye, 
  MapPin, 
  Building, 
  Filter, 
  Info,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  Flame,
  Check,
  Search
} from 'lucide-react';

interface LeafletCampusMapProps {
  reports: MaintenanceReport[];
  blocks?: CampusBlock[];
  onSelectReport?: (report: MaintenanceReport) => void;
  onOpenReportDrawerWithLocation?: (locationName: string, coords: { x: number; y: number }, gps?: { latitude: number; longitude: number }) => void;
  userRole?: UserRole;
  compact?: boolean;
  height?: string;
  title?: string;
  subtitle?: string;
}

export const LeafletCampusMap: React.FC<LeafletCampusMapProps> = ({
  reports,
  blocks = [],
  onSelectReport,
  onOpenReportDrawerWithLocation,
  userRole = 'student',
  compact = false,
  height,
  title,
  subtitle
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const landmarksLayerRef = useRef<L.LayerGroup | null>(null);
  const boundaryLayerRef = useRef<L.Polygon | null>(null);

  // Filter and view state
  const [severityFilter, setSeverityFilter] = useState<'all' | 'red' | 'yellow' | 'green'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [mapTileStyle, setMapTileStyle] = useState<'streets' | 'satellite' | 'voyager'>('voyager');
  const [showLandmarks, setShowLandmarks] = useState<boolean>(true);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [clickedCoord, setClickedCoord] = useState<{ lat: number; lng: number; nearLandmark?: string } | null>(null);

  // Statistics calculation based on severity
  const totalCount = reports.length;
  const redReports = reports.filter(r => getReportSeverityColor(r) === 'red');
  const yellowReports = reports.filter(r => getReportSeverityColor(r) === 'yellow');
  const greenReports = reports.filter(r => getReportSeverityColor(r) === 'green');

  const redCount = redReports.length;
  const yellowCount = yellowReports.length;
  const greenCount = greenReports.length;

  // Filtered reports
  const filteredReports = reports.filter(r => {
    const sevColor = getReportSeverityColor(r);
    if (severityFilter !== 'all' && sevColor !== severityFilter) return false;
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    return true;
  });

  // CARTO Basemaps API key to remove 'API key required' watermark
  const cartoApiKey = (import.meta.env.VITE_CARTO_API_KEY as string) || 'cb1_4dy5_1_0d753d363b3e59d14a3ff0fe';

  // Base tile layers configurations
  const tileUrls = {
    voyager: `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${cartoApiKey}`,
    streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  };

  const tileAttributions = {
    voyager: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    streets: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    satellite: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  };

  // Tile layer ref to swap on demand
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return; // Prevent double init

    // Create Map centered at CSJMU Kanpur
    const map = L.map(mapContainerRef.current, {
      center: CSJMU_CENTER,
      zoom: compact ? 16 : 16.5,
      minZoom: 14,
      maxZoom: 19,
      zoomControl: false // custom placement
    });

    mapRef.current = map;

    // Add zoom control at top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial Tile Layer
    const tileLayer = L.tileLayer(tileUrls[mapTileStyle], {
      attribution: tileAttributions[mapTileStyle],
      maxZoom: 19
    }).addTo(map);
    currentTileLayerRef.current = tileLayer;

    // Create campus boundary polygon
    const boundary = L.polygon(CSJMU_CAMPUS_BOUNDARY, {
      color: '#1d4ed8',
      weight: 2.5,
      dashArray: '6, 6',
      fillColor: '#3b82f6',
      fillOpacity: 0.05
    }).addTo(map);
    boundaryLayerRef.current = boundary;

    // Boundary tooltip
    boundary.bindTooltip(
      '<div class="font-bold text-xs text-blue-900">🏛️ CSJMU Kanpur University Perimeter</div>',
      { sticky: true, className: 'csjmu-boundary-tooltip' }
    );

    // Create Landmark Layer Group
    const landmarksGroup = L.layerGroup().addTo(map);
    landmarksLayerRef.current = landmarksGroup;

    // Create Complaints Markers Layer Group
    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    // Map Click Listener to capture coordinates
    map.on('click', (e: L.LeafletMouseEvent) => {
      const lat = Number(e.latlng.lat.toFixed(6));
      const lng = Number(e.latlng.lng.toFixed(6));

      // Find nearest landmark
      let nearestName = 'CSJMU Campus';
      let shortestDist = Infinity;
      CSJMU_LANDMARKS.forEach(lm => {
        const d = Math.hypot(lm.coords[0] - lat, lm.coords[1] - lng);
        if (d < shortestDist) {
          shortestDist = d;
          nearestName = lm.shortName;
        }
      });

      setClickedCoord({ lat, lng, nearLandmark: nearestName });
    });

    // Handle popup button clicks safely via event delegation
    const container = mapContainerRef.current;
    const handlePopupClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const inspectBtn = target.closest('[data-inspect-report-id]');
      if (inspectBtn) {
        const reportId = inspectBtn.getAttribute('data-inspect-report-id');
        const rep = reports.find(r => r.id === reportId);
        if (rep && onSelectReport) {
          onSelectReport(rep);
        }
      }

      const reportHereBtn = target.closest('[data-action="report-here"]');
      if (reportHereBtn && clickedCoord && onOpenReportDrawerWithLocation) {
        // approximate percentages for backward compatibility
        const pctX = Math.round(((clickedCoord.lng - 80.2630) / (80.2735 - 80.2630)) * 100);
        const pctY = Math.round(((26.5075 - clickedCoord.lat) / (26.5075 - 26.4985)) * 100);
        onOpenReportDrawerWithLocation(
          `${clickedCoord.nearLandmark} (${clickedCoord.lat.toFixed(4)}, ${clickedCoord.lng.toFixed(4)})`,
          { x: Math.max(5, Math.min(95, pctX)), y: Math.max(5, Math.min(95, pctY)) },
          { latitude: clickedCoord.lat, longitude: clickedCoord.lng }
        );
      }
    };

    container.addEventListener('click', handlePopupClick);

    // Fix leaflet tile rendering on initial layout mount
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      container.removeEventListener('click', handlePopupClick);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Tile Layer when mapTileStyle changes
  useEffect(() => {
    if (!mapRef.current) return;
    if (currentTileLayerRef.current) {
      mapRef.current.removeLayer(currentTileLayerRef.current);
    }
    const newTileLayer = L.tileLayer(tileUrls[mapTileStyle], {
      attribution: tileAttributions[mapTileStyle],
      maxZoom: 19
    }).addTo(mapRef.current);
    currentTileLayerRef.current = newTileLayer;
  }, [mapTileStyle]);

  // Update Landmark markers
  useEffect(() => {
    if (!landmarksLayerRef.current || !mapRef.current) return;
    landmarksLayerRef.current.clearLayers();

    if (!showLandmarks) return;

    CSJMU_LANDMARKS.forEach(landmark => {
      // Badge icon for building
      const iconHtml = `
        <div class="group relative cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110">
          <div class="px-2 py-0.5 rounded-md bg-slate-900/85 backdrop-blur-sm text-white text-[10px] font-bold border border-slate-700 shadow-md flex items-center gap-1 whitespace-nowrap">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            <span>${landmark.shortName}</span>
          </div>
        </div>
      `;

      const landmarkIcon = L.divIcon({
        html: iconHtml,
        className: 'csjmu-landmark-div-icon',
        iconSize: [120, 24],
        iconAnchor: [60, 12]
      });

      const marker = L.marker(landmark.coords, { icon: landmarkIcon });
      marker.bindPopup(`
        <div class="p-1 max-w-[240px]">
          <div class="flex items-center gap-1.5 mb-1 text-blue-900 font-bold text-xs">
            <span class="text-sm">🏛️</span>
            <span>${landmark.name}</span>
          </div>
          <p class="text-[11px] text-slate-600 mb-2 leading-relaxed">${landmark.description}</p>
          <div class="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
            GPS: ${landmark.coords[0].toFixed(4)}° N, ${landmark.coords[1].toFixed(4)}° E
          </div>
        </div>
      `);

      landmarksLayerRef.current?.addLayer(marker);
    });
  }, [showLandmarks]);

  // Update Complaint Markers with Red / Yellow / Green Severity Styling
  useEffect(() => {
    if (!markersLayerRef.current || !mapRef.current) return;
    markersLayerRef.current.clearLayers();

    filteredReports.forEach(report => {
      const coords = getReportLatLng(report);
      const sevColor = getReportSeverityColor(report);
      const config = SEVERITY_CONFIGS[sevColor];

      // Custom HTML Marker matching Severity Color (Red, Yellow, Green)
      // Red: Urgent pulsing aura
      // Yellow: Warning beacon
      // Green: Verified safe / low ring
      const isUrgent = sevColor === 'red';
      const isYellow = sevColor === 'yellow';
      const isGreen = sevColor === 'green';

      const pulseRing = isUrgent
        ? `<div class="absolute -inset-2.5 rounded-full bg-red-500/40 animate-ping"></div>`
        : '';

      const markerBadgeIcon = isUrgent 
        ? '!' 
        : isYellow 
        ? '⚡' 
        : '✓';

      const customMarkerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="width: 38px; height: 38px;">
          ${pulseRing}
          <!-- Outer Halo -->
          <div 
            class="absolute inset-0 rounded-full transition-transform group-hover:scale-125 duration-200"
            style="background: ${config.glowHex}; border: 2px solid ${config.borderHex};"
          ></div>
          
          <!-- Inner Core Pin -->
          <div 
            class="relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-white font-extrabold text-xs shadow-lg"
            style="background: ${config.hex};"
          >
            <span>${markerBadgeIcon}</span>
          </div>

          <!-- Bottom Point Indicator -->
          <div 
            class="absolute -bottom-1 z-0 w-2 h-2 rotate-45"
            style="background: ${config.hex};"
          ></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: customMarkerHtml,
        className: `csjmu-complaint-icon csjmu-${sevColor}-icon`,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [0, -20]
      });

      const marker = L.marker(coords, { icon: customIcon });

      // Severity Banner Label
      const severityBanner = `
        <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase ${config.badgeBg} ${config.badgeText} border ${config.badgeBorder} mb-1.5">
          <span class="w-2 h-2 rounded-full inline-block" style="background-color: ${config.hex}"></span>
          <span>${config.label}</span>
        </div>
      `;

      // Status pill
      const statusPillColor = report.status === 'resolved' 
        ? 'bg-emerald-100 text-emerald-800' 
        : report.status === 'in_progress'
        ? 'bg-blue-100 text-blue-800'
        : 'bg-amber-100 text-amber-800';

      const popupHtml = `
        <div class="p-1 min-w-[260px] max-w-[300px] text-slate-800 font-sans">
          <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
            ${severityBanner}
            <span class="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              ${report.id}
            </span>
          </div>

          <h3 class="font-bold text-sm text-slate-900 leading-snug mb-1">
            ${report.title}
          </h3>

          <div class="flex items-center gap-1.5 text-xs text-slate-600 mb-2">
            <span class="text-slate-400">📍</span>
            <span class="font-medium">${report.location}</span>
          </div>

          ${report.imageUrl ? `
            <div class="mb-2.5 rounded-lg overflow-hidden border border-slate-200 h-28 bg-slate-100">
              <img src="${resolveMediaUrl(report.imageUrl)}" alt="${report.title}" class="w-full h-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80'" />
            </div>
          ` : ''}

          <p class="text-xs text-slate-600 line-clamp-2 mb-2.5 leading-relaxed bg-slate-50 p-2 rounded border border-slate-100">
            ${report.description || 'No detailed description provided.'}
          </p>

          <div class="flex items-center justify-between text-[11px] mb-3">
            <span class="px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${statusPillColor}">
              ${report.status.replace('_', ' ')}
            </span>
            <span class="text-slate-500 font-medium">${report.timeAgo || 'Recent'}</span>
          </div>

          <button 
            data-inspect-report-id="${report.id}"
            class="w-full py-1.5 px-3 rounded-lg bg-[#001e40] hover:bg-[#003366] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <span>View Full Incident Report</span>
            <span>&rarr;</span>
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'csjmu-custom-popup',
        maxWidth: 320
      });

      marker.on('click', () => {
        setSelectedReportId(report.id);
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [filteredReports]);

  // Reset to CSJMU Center
  const handleResetCenter = () => {
    if (mapRef.current) {
      mapRef.current.flyTo(CSJMU_CENTER, compact ? 16 : 16.5, { duration: 1.2 });
      setClickedCoord(null);
    }
  };

  return (
    <div className={`flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm ${compact ? 'p-3' : 'p-5 space-y-4'}`}>
      {/* Top Header & Severity Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg md:text-xl font-black text-[#001e40] tracking-tight">
              {title || (userRole === 'student' ? 'CSJMU Campus Infrastructure & Hazard Map' : userRole === 'bvg_worker' ? 'CSJMU Beat 01 Route & Waste Triage Map' : userRole === 'management' ? 'CSJMU Campus Spatial Triage & SLA Map' : 'CSJMU Municipal Operations Command Map')}
            </h2>
            <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Leaflet &bull; Kanpur
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {subtitle || 'Interactive geographic map of CSJMU Kanpur (Kalyanpur). Markers color-coded by complaint severity.'}
          </p>
        </div>

        {/* Severity Legend & Counts */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* RED Filter Button */}
          <button
            onClick={() => setSeverityFilter(severityFilter === 'red' ? 'all' : 'red')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              severityFilter === 'red'
                ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-400'
                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
            }`}
            title="Show Urgent & Critical Complaints"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            <span>Red (Urgent)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-red-200/60 text-red-900 text-[10px]">
              {redCount}
            </span>
          </button>

          {/* YELLOW Filter Button */}
          <button
            onClick={() => setSeverityFilter(severityFilter === 'yellow' ? 'all' : 'yellow')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              severityFilter === 'yellow'
                ? 'bg-amber-500 text-slate-900 shadow-sm ring-2 ring-amber-300'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
            title="Show Medium & Normal Complaints"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Yellow (Normal)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-200/60 text-amber-900 text-[10px]">
              {yellowCount}
            </span>
          </button>

          {/* GREEN Filter Button */}
          <button
            onClick={() => setSeverityFilter(severityFilter === 'green' ? 'all' : 'green')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              severityFilter === 'green'
                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
            title="Show Low Severity & Resolved Complaints"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Green (Resolved/Low)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-200/60 text-emerald-900 text-[10px]">
              {greenCount}
            </span>
          </button>

          {/* Reset All filter */}
          {severityFilter !== 'all' && (
            <button
              onClick={() => setSeverityFilter('all')}
              className="text-[11px] text-slate-500 hover:text-slate-800 underline px-1 py-1"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Map Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-50 p-2 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-600" /> Layer:
          </span>
          <div className="flex bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
            <button
              onClick={() => setMapTileStyle('voyager')}
              className={`px-2 py-0.5 text-xs font-semibold rounded transition-colors ${
                mapTileStyle === 'voyager' ? 'bg-[#001e40] text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Campus Clean
            </button>
            <button
              onClick={() => setMapTileStyle('streets')}
              className={`px-2 py-0.5 text-xs font-semibold rounded transition-colors ${
                mapTileStyle === 'streets' ? 'bg-[#001e40] text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              OpenStreetMap
            </button>
            <button
              onClick={() => setMapTileStyle('satellite')}
              className={`px-2 py-0.5 text-xs font-semibold rounded transition-colors ${
                mapTileStyle === 'satellite' ? 'bg-[#001e40] text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Satellite
            </button>
          </div>

          <button
            onClick={() => setShowLandmarks(!showLandmarks)}
            className={`px-2 py-1 rounded-md text-xs font-semibold border flex items-center gap-1 transition-colors ${
              showLandmarks ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-500 border-slate-200'
            }`}
          >
            <Building className="w-3 h-3" />
            <span>Landmarks</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetCenter}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
            title="Refocus CSJMU Kanpur Center"
          >
            <Compass className="w-3.5 h-3.5 text-[#001e40]" />
            <span>Recenter CSJMU</span>
          </button>

          {onOpenReportDrawerWithLocation && (
            <button
              onClick={() => {
                onOpenReportDrawerWithLocation('UIET Block 1 (CSE/IT)', { x: 38, y: 38 }, { latitude: 26.5028, longitude: 80.2658 });
              }}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#001e40] text-white hover:bg-[#003366] flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Report at Pin</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Leaflet Map Viewport */}
      <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner">
        <div 
          ref={mapContainerRef} 
          style={{ height: height || (compact ? '420px' : '580px') }}
          className="w-full bg-slate-100 z-10"
        />

        {/* Floating Coordinates / Pin Info Pill if user clicked on map */}
        {clickedCoord && (
          <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-300 shadow-lg max-w-sm text-xs space-y-1 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between gap-3">
              <span className="font-extrabold text-[#001e40] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-600" />
                <span>Selected: {clickedCoord.nearLandmark}</span>
              </span>
              <button 
                onClick={() => setClickedCoord(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Lat: {clickedCoord.lat}°, Lng: {clickedCoord.lng}°
            </div>
            {onOpenReportDrawerWithLocation && (
              <button
                data-action="report-here"
                className="w-full mt-1.5 py-1 px-2.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-xs cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Log Complaint At This Location</span>
              </button>
            )}
          </div>
        )}

        {/* Floating Severity Legend Overlay */}
        <div className="absolute top-3 left-3 z-20 hidden sm:flex flex-col gap-1 bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200/90 shadow-md text-[11px]">
          <div className="font-bold text-slate-800 text-[10px] uppercase tracking-wider mb-0.5">
            Severity Classification
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600 shadow-xs flex items-center justify-center text-[8px] text-white font-black">!</span>
            <span className="text-slate-700 font-medium">Red: Urgent / Critical Hazard</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-xs flex items-center justify-center text-[8px] text-slate-900 font-black">⚡</span>
            <span className="text-slate-700 font-medium">Yellow: Medium / Normal Active</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-600 shadow-xs flex items-center justify-center text-[8px] text-white font-black">✓</span>
            <span className="text-slate-700 font-medium">Green: Low / Resolved Issue</span>
          </div>
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-1">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-slate-700">
            Showing {filteredReports.length} of {reports.length} campus complaints
          </span>
          <span className="hidden sm:inline">&bull;</span>
          <span className="hidden sm:inline text-slate-500">
            Click any pin for complaint details or click on map to report a hazard.
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span>Center: 26.5030° N, 80.2678° E</span>
        </div>
      </div>
    </div>
  );
};
