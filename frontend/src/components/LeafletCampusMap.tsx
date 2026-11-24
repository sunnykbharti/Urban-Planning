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
  selectedReportId?: string | null;
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
  selectedReportId = null,
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
  const markerByReportIdRef = useRef<Record<string, L.Marker>>({});

  // Filter and view state
  const [severityFilter, setSeverityFilter] = useState<'all' | 'red' | 'yellow' | 'green'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [mapTileStyle, setMapTileStyle] = useState<'streets' | 'satellite' | 'voyager'>('voyager');
  const [showLandmarks, setShowLandmarks] = useState<boolean>(true);
  const [activeReportId, setActiveReportId] = useState<string | null>(selectedReportId);
  const [clickedCoord, setClickedCoord] = useState<{ lat: number; lng: number; nearLandmark?: string } | null>(null);
  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(false);
  const [currentZoom, setCurrentZoom] = useState<number>(compact ? 16 : 16.5);

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

    // Zoom listener for collision-aware landmark visibility
    map.on('zoomend', () => {
      if (mapRef.current) {
        setCurrentZoom(mapRef.current.getZoom());
      }
    });

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
      '<div class="font-bold text-xs text-blue-900">CSJMU Kanpur University Perimeter</div>',
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

    // Set campus bounds so UIET, central library, and southern hostels are all in view
    try {
      const bounds = L.polygon(CSJMU_CAMPUS_BOUNDARY).getBounds();
      map.fitBounds(bounds, { padding: [24, 24], maxZoom: 17 });
    } catch (e) {
      // fallback
    }

    // Fix leaflet tile rendering whenever the container resizes
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    });
    resizeObserver.observe(container);

    const initialTimer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(initialTimer);
      resizeObserver.disconnect();
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

  // Directional collision-safe anchor configuration for campus landmarks
  const landmarkAnchorMap: Record<string, { size: [number, number]; anchor: [number, number]; labelOffsetClass: string }> = {
    'block-1': { size: [16, 16], anchor: [8, 8], labelOffsetClass: 'bottom-full mb-1.5' },
    'block-2': { size: [16, 16], anchor: [8, 8], labelOffsetClass: 'top-full mt-1.5' },
    'block-3': { size: [16, 16], anchor: [8, 8], labelOffsetClass: 'left-full ml-1.5' },
    'canteen-quad': { size: [16, 16], anchor: [8, 8], labelOffsetClass: 'right-full mr-1.5' },
    'health-centre': { size: [16, 16], anchor: [8, 8], labelOffsetClass: 'top-full mt-1.5' },
    'library': { size: [16, 16], anchor: [8, 8], labelOffsetClass: 'bottom-full mb-1.5' },
    'workshop': { size: [16, 16], anchor: [8, 8], labelOffsetClass: 'top-full mt-1.5' },
    'science-block-b': { size: [16, 16], anchor: [8, 8], labelOffsetClass: 'bottom-full mb-1.5' },
    'admin-block': { size: [16, 16], anchor: [8, 8], labelOffsetClass: 'left-full ml-1.5' },
    'sports-complex': { size: [16, 16], anchor: [8, 8], labelOffsetClass: 'top-full mt-1.5' },
    'hostels': { size: [16, 16], anchor: [8, 8], labelOffsetClass: 'bottom-full mb-1.5' },
    'main-gate': { size: [16, 16], anchor: [8, 8], labelOffsetClass: 'bottom-full mb-1.5' }
  };

  // Update Landmark markers
  useEffect(() => {
    if (!landmarksLayerRef.current || !mapRef.current) return;
    landmarksLayerRef.current.clearLayers();

    if (!showLandmarks) return;

    const isZoomedIn = currentZoom >= 16.5;

    CSJMU_LANDMARKS.forEach(landmark => {
      const cfg = landmarkAnchorMap[landmark.id] || { size: [16, 16], anchor: [8, 8], labelOffsetClass: 'top-full mt-1' };

      const iconHtml = `
        <div class="cursor-pointer select-none group relative flex items-center justify-center" style="width: 16px; height: 16px;">
          <div class="w-2.5 h-2.5 rounded-full bg-slate-700 border-2 border-white shadow-xs"></div>
          <div class="${isZoomedIn ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity whitespace-nowrap absolute ${cfg.labelOffsetClass} px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-800 bg-white/95 border border-slate-200 shadow-2xs pointer-events-none z-30">
            ${landmark.shortName}
          </div>
        </div>
      `;

      const landmarkIcon = L.divIcon({
        html: iconHtml,
        className: 'csjmu-landmark-div-icon',
        iconSize: cfg.size,
        iconAnchor: cfg.anchor
      });

      const marker = L.marker(landmark.coords, { icon: landmarkIcon });
      marker.bindPopup(`
        <div class="p-1 max-w-[240px]">
          <div class="flex items-center gap-1.5 mb-1 text-slate-900 font-semibold text-xs">
            <span class="text-[10px] font-bold text-slate-700 bg-slate-100 px-1 py-0.5 rounded">CAMPUS</span>
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
  }, [showLandmarks, currentZoom]);

  // Sync map view when selectedReportId prop changes from parent list
  useEffect(() => {
    if (selectedReportId) {
      setActiveReportId(selectedReportId);
      const targetMarker = markerByReportIdRef.current[selectedReportId];
      if (targetMarker && mapRef.current) {
        mapRef.current.panTo(targetMarker.getLatLng(), { animate: true, duration: 0.5 });
        targetMarker.openPopup();
      }
    }
  }, [selectedReportId]);

  // Update Complaint Markers with Red / Yellow / Green Severity Styling & Coordinate Clustering
  useEffect(() => {
    if (!markersLayerRef.current || !mapRef.current) return;
    markersLayerRef.current.clearLayers();
    markerByReportIdRef.current = {};

    // Group reports by proximity key to prevent overlapping markers from occluding each other
    const coordGroups: Record<string, MaintenanceReport[]> = {};
    filteredReports.forEach(r => {
      const raw = getReportLatLng(r);
      const key = `${raw[0].toFixed(3)}_${raw[1].toFixed(3)}`;
      if (!coordGroups[key]) coordGroups[key] = [];
      coordGroups[key].push(r);
    });

    Object.values(coordGroups).forEach(group => {
      group.forEach((report, indexInGroup) => {
        const rawCoords = getReportLatLng(report);
        // Distribute markers in a small petal offset if more than 1 at identical coords
        let coords: [number, number] = rawCoords;
        if (group.length > 1) {
          const angle = (indexInGroup / group.length) * 2 * Math.PI;
          const offsetRadius = 0.0003; // ~25 meters geographical separation
          coords = [
            rawCoords[0] + Math.sin(angle) * offsetRadius,
            rawCoords[1] + Math.cos(angle) * offsetRadius
          ];
        }

        const sevColor = getReportSeverityColor(report);
        const config = SEVERITY_CONFIGS[sevColor];

        const isUrgent = sevColor === 'red';
        const isYellow = sevColor === 'yellow';
        const isSelected = activeReportId === report.id;

        const pulseRing = isUrgent
          ? `<div class="absolute -inset-2 rounded-full bg-red-500/30 animate-ping"></div>`
          : '';

        const markerBadgeIcon = isUrgent 
          ? '!' 
          : isYellow 
          ? '•' 
          : '✓';

        const clusterBadge = group.length > 1 && indexInGroup === 0 ? `
          <div class="absolute -top-1.5 -right-1.5 z-20 px-1 py-0.2 bg-slate-900 text-white text-[8px] font-bold rounded-full border border-white">
            ${group.length}
          </div>
        ` : '';

        const customMarkerHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group ${isSelected ? 'scale-115 z-30' : ''}" style="width: 32px; height: 32px;">
            ${pulseRing}
            ${clusterBadge}
            <!-- Outer Halo -->
            <div 
              class="absolute inset-0 rounded-full transition-transform group-hover:scale-110 duration-200"
              style="background: ${config.glowHex}; border: ${isSelected ? '2.5px solid #001e40' : `1.5px solid ${config.borderHex}`};"
            ></div>
            
            <!-- Inner Core Pin -->
            <div 
              class="relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-white font-extrabold text-[11px] shadow-sm"
              style="background: ${config.hex};"
            >
              <span>${markerBadgeIcon}</span>
            </div>

            <!-- Bottom Point Indicator -->
            <div 
              class="absolute -bottom-0.5 z-0 w-1.5 h-1.5 rotate-45"
              style="background: ${config.hex};"
            ></div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: customMarkerHtml,
          className: `csjmu-complaint-icon csjmu-${sevColor}-icon`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16]
        });

        const marker = L.marker(coords, { icon: customIcon });
        markerByReportIdRef.current[report.id] = marker;

      // Severity Banner Label
      const severityBanner = `
        <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${config.badgeBg} ${config.badgeText} border ${config.badgeBorder} mb-1.5">
          <span class="w-1.5 h-1.5 rounded-full inline-block" style="background-color: ${config.hex}"></span>
          <span>${config.label}</span>
        </div>
      `;

      // Status pill
      const statusPillColor = (report.status || '').toLowerCase() === 'resolved' 
        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
        : (report.status || '').toLowerCase() === 'in_progress'
        ? 'bg-amber-50 text-amber-800 border border-amber-200'
        : 'bg-rose-50 text-rose-800 border border-rose-200';

      const popupHtml = `
        <div class="p-1 min-w-[240px] max-w-[280px] text-slate-800 font-sans">
          <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 mb-2">
            ${severityBanner}
            <span class="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              ${report.ticketNumber || report.id}
            </span>
          </div>

          <h3 class="font-semibold text-xs text-slate-900 leading-snug mb-1">
            ${report.title}
          </h3>

          <div class="flex items-center gap-1.5 text-xs text-slate-600 mb-2">
            <span class="text-slate-400 font-medium text-[10px]">LOC:</span>
            <span class="font-medium truncate">${report.location}</span>
          </div>

          ${report.imageUrl ? `
            <div class="mb-2 rounded overflow-hidden border border-slate-200 h-24 bg-slate-100">
              <img src="${resolveMediaUrl(report.imageUrl)}" alt="${report.title}" class="w-full h-full object-cover" onerror="this.src='/sample-incidents/overflow_bin.jpg'" />
            </div>
          ` : ''}

          <div class="flex items-center justify-between text-[11px] mb-2.5">
            <span class="px-2 py-0.5 rounded text-[10px] font-medium capitalize ${statusPillColor}">
              ${(report.status || 'open').replace('_', ' ')}
            </span>
            <span class="text-slate-400 font-mono text-[10px]">${report.timeAgo || 'Recent'}</span>
          </div>

          <button 
            data-inspect-report-id="${report.id}"
            class="w-full py-1.5 px-3 rounded-md bg-[#001e40] hover:bg-[#003366] text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>View report details</span>
            <span>&rarr;</span>
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'csjmu-custom-popup',
        maxWidth: 300
      });

      marker.on('click', () => {
        setActiveReportId(report.id);
        if (onSelectReport) {
          onSelectReport(report);
        }
      });

      markersLayerRef.current?.addLayer(marker);
      });
    });
  }, [filteredReports, activeReportId]);

  // Reset to CSJMU Center
  const handleResetCenter = () => {
    if (mapRef.current) {
      mapRef.current.flyTo(CSJMU_CENTER, compact ? 16 : 16.5, { duration: 1.2 });
      setClickedCoord(null);
    }
  };

  return (
    <div className={`flex flex-col bg-white rounded-[6px] border border-slate-200 overflow-hidden ${compact ? 'p-3' : 'p-4 space-y-3'}`}>
      {/* Top Header & Severity Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-semibold text-slate-900">
              {title || (userRole === 'student' ? 'Campus map' : userRole === 'bvg_worker' ? 'Beat route map' : userRole === 'management' ? 'Campus map' : 'Campus map')}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {subtitle || 'Geospatial view of campus reports and facilities.'}
          </p>
        </div>

        {/* Severity Legend & Counts */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* RED Filter Button */}
          <button
            onClick={() => setSeverityFilter(severityFilter === 'red' ? 'all' : 'red')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              severityFilter === 'red'
                ? 'bg-rose-600 text-white font-semibold'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
            title="Filter Urgent & Critical"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Red (Urgent)</span>
            <span className="font-mono tabular-nums text-[10px] opacity-80">
              {redCount}
            </span>
          </button>

          {/* YELLOW Filter Button */}
          <button
            onClick={() => setSeverityFilter(severityFilter === 'yellow' ? 'all' : 'yellow')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              severityFilter === 'yellow'
                ? 'bg-amber-500 text-slate-900 font-semibold'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
            title="Filter Medium & In Progress"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Yellow (Normal)</span>
            <span className="font-mono tabular-nums text-[10px] opacity-80">
              {yellowCount}
            </span>
          </button>

          {/* GREEN Filter Button */}
          <button
            onClick={() => setSeverityFilter(severityFilter === 'green' ? 'all' : 'green')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              severityFilter === 'green'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
            title="Filter Low Severity & Resolved"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Green (Resolved)</span>
            <span className="font-mono tabular-nums text-[10px] opacity-80">
              {greenCount}
            </span>
          </button>

          {/* Reset All filter */}
          {severityFilter !== 'all' && (
            <button
              onClick={() => setSeverityFilter('all')}
              className="text-[11px] text-slate-500 hover:text-slate-800 underline px-1 py-0.5 cursor-pointer"
            >
              All
            </button>
          )}
        </div>
      </div>

      {/* Map Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50/80 p-1.5 rounded-md border border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            Layer:
          </span>
          <div className="flex bg-white p-0.5 rounded-md border border-slate-200">
            <button
              onClick={() => setMapTileStyle('voyager')}
              className={`px-2 py-0.5 text-xs rounded transition-colors cursor-pointer ${
                mapTileStyle === 'voyager' ? 'bg-[#001e40] text-white font-medium' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Campus
            </button>
            <button
              onClick={() => setMapTileStyle('streets')}
              className={`px-2 py-0.5 text-xs rounded transition-colors cursor-pointer ${
                mapTileStyle === 'streets' ? 'bg-[#001e40] text-white font-medium' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Street
            </button>
            <button
              onClick={() => setMapTileStyle('satellite')}
              className={`px-2 py-0.5 text-xs rounded transition-colors cursor-pointer ${
                mapTileStyle === 'satellite' ? 'bg-[#001e40] text-white font-medium' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Satellite
            </button>
          </div>

          <button
            onClick={() => setShowLandmarks(!showLandmarks)}
            className={`px-2 py-0.5 rounded-md text-xs font-medium border flex items-center gap-1 transition-colors cursor-pointer ${
              showLandmarks ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-white text-slate-500 border-slate-200'
            }`}
          >
            <Building className="w-3 h-3" />
            <span>Landmarks</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetCenter}
            className="px-2 py-1 text-xs font-medium rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1 transition-colors cursor-pointer"
            title="Refocus CSJMU Kanpur Center"
          >
            <Compass className="w-3.5 h-3.5 text-[#001e40]" />
            <span>Center campus</span>
          </button>

          {onOpenReportDrawerWithLocation && (
            <button
              onClick={() => {
                onOpenReportDrawerWithLocation('UIET Block 1 (CSE/IT)', { x: 38, y: 38 }, { latitude: 26.5028, longitude: 80.2658 });
              }}
              className="px-2 py-1 text-xs font-medium rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3 text-slate-500" />
              <span>Report at pin</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Leaflet Map Viewport */}
      <div className="relative w-full rounded-md overflow-hidden border border-slate-200">
        <div 
          ref={mapContainerRef} 
          style={{ height: height || (compact ? '420px' : '580px') }}
          className="w-full bg-slate-100 z-10"
        />

        {/* Floating Coordinates / Pin Info Pill if user clicked on map */}
        {clickedCoord && (
          <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-md px-3 py-2 rounded-md border border-slate-300 shadow-sm max-w-sm text-xs space-y-1 animate-in fade-in">
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-[#001e40] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                <span>{clickedCoord.nearLandmark}</span>
              </span>
              <button 
                onClick={() => setClickedCoord(null)}
                className="text-slate-400 hover:text-slate-700 text-xs px-1"
              >
                ✕
              </button>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {clickedCoord.lat.toFixed(4)}° N, {clickedCoord.lng.toFixed(4)}° E
            </div>
            {onOpenReportDrawerWithLocation && (
              <button
                data-action="report-here"
                className="w-full mt-1 py-1 px-2 rounded-md bg-[#001e40] hover:bg-[#003366] text-white font-medium text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Log incident here</span>
              </button>
            )}
          </div>
        )}

        {/* Collapsible Severity Legend in Bottom-Left Corner (does not cover map) */}
        <div className="absolute bottom-3 left-3 z-20 font-sans">
          {isLegendOpen ? (
            <div className="bg-white/95 backdrop-blur-md p-2.5 rounded-md border border-slate-200 shadow-sm text-[11px] space-y-1 animate-in fade-in duration-100">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-1">
                <span className="font-semibold text-slate-700 text-[10px] uppercase tracking-wider">
                  Severity
                </span>
                <button
                  onClick={() => setIsLegendOpen(false)}
                  className="text-slate-400 hover:text-slate-700 text-xs px-1 cursor-pointer"
                  title="Collapse legend"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                <span className="text-slate-700">Red: Urgent / Critical</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span className="text-slate-700">Yellow: Normal active</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-slate-700">Green: Low / Resolved</span>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsLegendOpen(true)}
              className="px-2 py-1 rounded-md bg-white/95 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-slate-900 shadow-2xs text-[11px] font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Legend</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-700">
            Showing {filteredReports.length} of {reports.length} incidents
          </span>
          <span className="text-slate-300">&bull;</span>
          <span className="hidden sm:inline text-slate-500">
            Click any pin to inspect or click the map to select coordinates.
          </span>
        </div>
        <div className="text-[11px] font-mono text-slate-400">
          <span>Center: 26.5030° N, 80.2678° E</span>
        </div>
      </div>
    </div>
  );
};
