import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  Flame, 
  Thermometer, 
  Trees, 
  Building, 
  Droplets, 
  Sun, 
  Umbrella, 
  Compass, 
  Layers, 
  Sparkles, 
  Sliders, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  ArrowRight,
  MapPin,
  Wind,
  Calendar,
  RefreshCw,
  Check,
  X,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  CheckSquare,
  Square
} from 'lucide-react';
import { 
  HeatIslandLayer, 
  MicroclimateSector, 
  MicroclimateSummary,
  MaintenanceReport
} from '../types';
import { 
  fetchMicroclimateSectors, 
  fetchMicroclimateInterventions, 
  fetchMicroclimateSummary, 
  simulateMitigationAPI,
  fetchIncidentsFromBackend
} from '../api/client';
import { initialReports } from '../data/mockData';
import { CSJMU_CAMPUS_BOUNDARY } from '../data/csjmuGeoData';
import heatZonesJson from '../data/csjmu_heat_zones.json';

type ActiveMetric = 'temperature' | 'canopy' | 'pavement' | 'composite';
type SeasonType = 'pre_monsoon' | 'post_monsoon';
type DetailTab = 'details' | 'survey' | 'simulator';

interface SurveyCheckState {
  utilities: boolean;
  soil: boolean;
  irrigation: boolean;
  setback: boolean;
  notes?: string;
}

const defaultSectors: MicroclimateSector[] = (heatZonesJson.features as any[]).map(f => {
  const p = f.properties;
  const seasonMetrics = p.preMonsoon;
  return {
    id: p.id,
    name: p.name,
    zone: p.zone,
    bounds: { x: 30, y: 30, width: 20, height: 20 },
    gps: { latitude: p.center[0], longitude: p.center[1] },
    center: p.center,
    areaSqm: p.areaSqm,
    validThermalPixels: p.validThermalPixels,
    confidence: p.confidence,
    recommendedSpecies: p.recommendedSpecies,
    metricsProvenance: p.metricsProvenance,
    preMonsoon: p.preMonsoon,
    postMonsoon: p.postMonsoon,
    metrics: {
      surfaceTempC: seasonMetrics.surfaceTempC,
      treeCanopyPct: seasonMetrics.treeCanopyPct,
      buildingDensityPct: seasonMetrics.buildingDensityPct,
      pavedSurfacePct: seasonMetrics.pavedSurfacePct,
      waterBodyBufferM: seasonMetrics.waterBodyBufferM,
      pedestrianFootfall: seasonMetrics.pedestrianFootfall,
      albedo: seasonMetrics.albedo || 0.15
    },
    heatRiskScore: seasonMetrics.chriScore,
    classification: seasonMetrics.classification,
    statusColor: seasonMetrics.classification === 'CRITICAL_HOT_ZONE' ? '#dc2626' :
                 seasonMetrics.classification === 'HIGH_STRESS' ? '#ea580c' :
                 seasonMetrics.classification === 'MODERATE' ? '#0284c7' : '#16a34a',
    exposureSummary: p.exposureSummary
  };
});

export const HeatIslandMapView: React.FC = () => {
  // Global & Season State
  const [season, setSeason] = useState<SeasonType>('pre_monsoon');
  const [activeMetric, setActiveMetric] = useState<ActiveMetric>('temperature');
  const [showWasteOverlay, setShowWasteOverlay] = useState<boolean>(true);
  const [selectedSectorId, setSelectedSectorId] = useState<string>('sec-uiet-courtyard');
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>('details');
  const [showMethodology, setShowMethodology] = useState<boolean>(false);

  // Data States
  const [sectors, setSectors] = useState<MicroclimateSector[]>(defaultSectors);
  const [summary, setSummary] = useState<MicroclimateSummary | null>(null);
  const [reports, setReports] = useState<MaintenanceReport[]>(initialReports);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Site-Survey Checklist State (saved per sector)
  const [surveyChecks, setSurveyChecks] = useState<Record<string, SurveyCheckState>>({
    'sec-uiet-courtyard': { utilities: false, soil: false, irrigation: false, setback: false },
    'sec-workshop-yard': { utilities: false, soil: false, irrigation: false, setback: false },
    'sec-library-plaza': { utilities: false, soil: false, irrigation: false, setback: false },
    'sec-admin-parking': { utilities: false, soil: false, irrigation: false, setback: false },
    'sec-botanical-pond': { utilities: false, soil: false, irrigation: false, setback: false },
    'sec-sports-stadium': { utilities: false, soil: false, irrigation: false, setback: false },
    'sec-hostel-spine': { utilities: false, soil: false, irrigation: false, setback: false },
    'sec-girls-hostel': { utilities: false, soil: false, irrigation: false, setback: false }
  });

  // What-If Scenario Simulator Sliders
  const [addedTrees, setAddedTrees] = useState<number>(24);
  const [coolPaveSqm, setCoolPaveSqm] = useState<number>(350);
  const [shadeSqm, setShadeSqm] = useState<number>(180);
  const [simResult, setSimResult] = useState<any>(null);
  const [simLoading, setSimLoading] = useState<boolean>(false);

  // Map DOM and Leaflet References
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geojsonLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const wasteLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const polygonLayersMapRef = useRef<Map<string, L.Polygon>>(new Map());

  // Load Sectors, Summary & Incidents
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const [secData, sumData, incData] = await Promise.all([
          fetchMicroclimateSectors(season),
          fetchMicroclimateSummary(season),
          fetchIncidentsFromBackend()
        ]);

        if (isMounted) {
          if (secData && secData.length > 0) {
            setSectors(secData);
          } else {
            // Transform local GeoJSON data
            const fallbackSectors: MicroclimateSector[] = (heatZonesJson.features as any[]).map(f => {
              const p = f.properties;
              const seasonMetrics = season === 'pre_monsoon' ? p.preMonsoon : p.postMonsoon;
              return {
                id: p.id,
                name: p.name,
                zone: p.zone,
                bounds: { x: 30, y: 30, width: 20, height: 20 },
                gps: { latitude: p.center[0], longitude: p.center[1] },
                center: p.center,
                areaSqm: p.areaSqm,
                validThermalPixels: p.validThermalPixels,
                confidence: p.confidence,
                recommendedSpecies: p.recommendedSpecies,
                metricsProvenance: p.metricsProvenance,
                preMonsoon: p.preMonsoon,
                postMonsoon: p.postMonsoon,
                metrics: {
                  surfaceTempC: seasonMetrics.surfaceTempC,
                  treeCanopyPct: seasonMetrics.treeCanopyPct,
                  buildingDensityPct: seasonMetrics.buildingDensityPct,
                  pavedSurfacePct: seasonMetrics.pavedSurfacePct,
                  waterBodyBufferM: seasonMetrics.waterBodyBufferM,
                  pedestrianFootfall: seasonMetrics.pedestrianFootfall,
                  albedo: seasonMetrics.albedo || 0.15
                },
                heatRiskScore: seasonMetrics.chriScore,
                classification: seasonMetrics.classification,
                statusColor: seasonMetrics.classification === 'CRITICAL_HOT_ZONE' ? '#dc2626' :
                             seasonMetrics.classification === 'HIGH_STRESS' ? '#ea580c' :
                             seasonMetrics.classification === 'MODERATE' ? '#0284c7' : '#16a34a',
                exposureSummary: p.exposureSummary
              };
            });
            setSectors(fallbackSectors);
          }

          if (sumData) {
            setSummary(sumData);
          }
          if (incData && incData.length > 0) {
            setReports(incData);
          }
        }
      } catch (err) {
        console.warn('Error loading microclimate data, using local dataset', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [season]);

  // Update What-If Simulator whenever inputs change
  useEffect(() => {
    let active = true;
    setSimLoading(true);
    simulateMitigationAPI(selectedSectorId, addedTrees, coolPaveSqm, shadeSqm, season)
      .then((res) => {
        if (active && res) {
          setSimResult(res);
        }
      })
      .catch((err) => {
        console.warn('Simulation error', err);
      })
      .finally(() => {
        if (active) setSimLoading(false);
      });
    return () => { active = false; };
  }, [selectedSectorId, addedTrees, coolPaveSqm, shadeSqm, season]);

  // Selected Sector Object
  const selectedSector = sectors.find(s => s.id === selectedSectorId) || sectors[0] || null;

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    // CSJMU campus center coordinates
    const map = L.map(mapContainerRef.current, {
      center: [26.5030, 80.2678],
      zoom: 15.5,
      minZoom: 14,
      maxZoom: 18,
      zoomControl: true,
      attributionControl: true
    });

    // OpenStreetMap standard clean tiles
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Campus boundary outline
    L.polygon(CSJMU_CAMPUS_BOUNDARY, {
      color: '#3b82f6',
      weight: 2,
      dashArray: '5, 8',
      fillColor: '#3b82f6',
      fillOpacity: 0.03
    }).addTo(map);

    // Layer groups
    const geoGroup = L.layerGroup().addTo(map);
    const wasteGroup = L.layerGroup().addTo(map);

    geojsonLayerGroupRef.current = geoGroup;
    wasteLayerGroupRef.current = wasteGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Sequential Color Ramps
  const getFillColor = (sector: MicroclimateSector, metric: ActiveMetric) => {
    if (metric === 'temperature') {
      const t = sector.metrics.surfaceTempC;
      if (t >= 43.0) return '#7f1d1d'; // Deep crimson/plum
      if (t >= 40.0) return '#dc2626'; // Red
      if (t >= 37.0) return '#ea580c'; // Orange-red
      if (t >= 34.0) return '#f59e0b'; // Amber
      if (t >= 31.0) return '#eab308'; // Yellow
      return '#84cc16'; // Lime/cool sink
    }
    if (metric === 'canopy') {
      const c = sector.metrics.treeCanopyPct;
      if (c >= 60) return '#14532d'; // Forest dark
      if (c >= 40) return '#16a34a'; // Green
      if (c >= 25) return '#65a30d'; // Lime
      if (c >= 15) return '#ca8a04'; // Yellow-green
      return '#d97706'; // Sparse canopy
    }
    if (metric === 'pavement') {
      const p = sector.metrics.pavedSurfacePct;
      if (p >= 85) return '#1e293b'; // Dense dark asphalt
      if (p >= 70) return '#475569'; // Slate
      if (p >= 50) return '#64748b'; // Mid slate
      if (p >= 30) return '#94a3b8'; // Light slate
      return '#cbd5e1'; // Permeable ground
    }
    // Composite Risk
    if (sector.classification === 'CRITICAL_HOT_ZONE') return '#991b1b';
    if (sector.classification === 'HIGH_STRESS') return '#ea580c';
    if (sector.classification === 'MODERATE') return '#0284c7';
    return '#15803d';
  };

  // Render GeoJSON Polygons onto Leaflet
  useEffect(() => {
    if (!mapInstanceRef.current || !geojsonLayerGroupRef.current) return;
    const group = geojsonLayerGroupRef.current;
    group.clearLayers();
    polygonLayersMapRef.current.clear();

    const features = heatZonesJson.features as any[];

    features.forEach((feature) => {
      const zoneId = feature.properties.id;
      const sector = sectors.find(s => s.id === zoneId);
      if (!sector) return;

      const isSelected = zoneId === selectedSectorId;
      const fillColor = getFillColor(sector, activeMetric);

      // GeoJSON coordinates are [lon, lat] -> Leaflet requires [lat, lon]
      const rawCoords = feature.geometry.coordinates[0];
      const latLngs: L.LatLngExpression[] = rawCoords.map((c: number[]) => [c[1], c[0]]);

      const polygon = L.polygon(latLngs, {
        color: isSelected ? '#0f172a' : '#334155',
        weight: isSelected ? 3.5 : 1.5,
        opacity: isSelected ? 1 : 0.75,
        fillColor: fillColor,
        fillOpacity: isSelected ? 0.88 : 0.62,
        dashArray: isSelected ? undefined : '2, 2'
      });

      // Tooltip with full name (no truncation!) and provenance values
      const tooltipContent = `
        <div style="font-family: ui-sans-serif, system-ui, sans-serif; font-size: 11px; padding: 4px 6px; line-height: 1.35; color: #0f172a; min-width: 170px;">
          <div style="font-weight: 800; font-size: 12px; margin-bottom: 3px; color: #1e293b;">${sector.name}</div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
            <span style="color: #64748b;">Surface LST:</span>
            <span style="font-weight: 700; color: #b91c1c;">${sector.metrics.surfaceTempC}°C</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
            <span style="color: #64748b;">Tree Canopy:</span>
            <span style="font-weight: 700; color: #15803d;">${sector.metrics.treeCanopyPct}%</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
            <span style="color: #64748b;">Paved Surface:</span>
            <span style="font-weight: 700; color: #334155;">${sector.metrics.pavedSurfacePct}%</span>
          </div>
          <div style="margin-top: 4px; padding-top: 3px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #64748b;">
            Confidence: <b style="color: #0f172a;">${sector.validThermalPixels && sector.validThermalPixels < 8 ? 'LOW (<8 px)' : 'MODERATE'}</b>
          </div>
        </div>
      `;

      polygon.bindTooltip(tooltipContent, {
        sticky: true,
        className: 'csjmu-map-tooltip'
      });

      polygon.on('click', () => {
        setSelectedSectorId(zoneId);
      });

      polygon.addTo(group);
      polygonLayersMapRef.current.set(zoneId, polygon);
    });
  }, [sectors, activeMetric, selectedSectorId]);

  // Waste Incidents Overlay
  useEffect(() => {
    if (!mapInstanceRef.current || !wasteLayerGroupRef.current) return;
    const group = wasteLayerGroupRef.current;
    group.clearLayers();

    if (!showWasteOverlay) return;

    // Filter reports with valid coordinates
    reports.forEach((report) => {
      let lat = 26.5020;
      let lng = 80.2670;

      if (report.gps && report.gps.latitude && report.gps.longitude) {
        lat = report.gps.latitude;
        lng = report.gps.longitude;
      } else if (report.coordinates) {
        // Approximate projection from percentage bounds onto campus
        lat = 26.4985 + (1 - report.coordinates.y / 100) * 0.0090;
        lng = 80.2635 + (report.coordinates.x / 100) * 0.0100;
      }

      const iconHtml = `
        <div style="background-color: #ef4444; color: white; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); border-radius: 9999px; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; cursor: pointer;">
          !
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-waste-marker',
        html: iconHtml,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });
      const popupHtml = `
        <div style="font-family: ui-sans-serif, system-ui; font-size: 11px; padding: 4px; line-height: 1.35; color: #0f172a;">
          <div style="font-weight: 700; color: #dc2626; margin-bottom: 2px;">Waste Grievance Report</div>
          <div style="font-weight: 600; margin-bottom: 2px;">${report.title || 'Uncollected Waste'}</div>
          <div style="color: #64748b; font-size: 10px;">Status: <b>${report.status}</b> • Severity: <b>${report.severity}</b></div>
        </div>
      `;
      marker.bindPopup(popupHtml);
      marker.addTo(group);
    });
  }, [reports, showWasteOverlay]);

  // Recenter Map Helper
  const handleRecenterMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([26.5030, 80.2678], 15.5);
    }
  };

  // Toggle Survey Checklist Item
  const handleToggleSurveyCheck = (key: keyof SurveyCheckState) => {
    if (!selectedSectorId) return;
    setSurveyChecks(prev => {
      const current = prev[selectedSectorId] || { utilities: false, soil: false, irrigation: false, setback: false };
      return {
        ...prev,
        [selectedSectorId]: {
          ...current,
          [key]: !current[key]
        }
      };
    });
  };

  const currentSurvey = surveyChecks[selectedSectorId] || { utilities: false, soil: false, irrigation: false, setback: false };
  const completedChecksCount = Object.values(currentSurvey).filter(Boolean).length;

  // Correlated Waste Reports for Selected Sector
  const correlatedWasteCount = reports.filter(r => {
    if (r.zoneId === selectedSector?.zone) return true;
    if (selectedSector?.name && r.locationName && r.locationName.toLowerCase().includes(selectedSector.name.split(' ')[0].toLowerCase())) return true;
    return false;
  }).length;

  // Computed summary values fallback
  const peakTemp = summary?.peakHotZoneTempC || (sectors.length ? Math.max(...sectors.map(s => s.metrics.surfaceTempC)) : 44.2);
  const coolTemp = summary?.coolOasisTempC || (sectors.length ? Math.min(...sectors.map(s => s.metrics.surfaceTempC)) : 28.4);
  const deltaRange = +(peakTemp - coolTemp).toFixed(1);
  const criticalCount = summary?.criticalHotZonesCount || sectors.filter(s => s.classification === 'CRITICAL_HOT_ZONE').length || 2;
  const avgCanopy = summary?.avgTreeCanopyPct || (sectors.length ? +(sectors.reduce((acc, s) => acc + s.metrics.treeCanopyPct, 0) / sectors.length).toFixed(1) : 29.9);
  const avgPaved = summary?.avgPavedSurfacePct || (sectors.length ? +(sectors.reduce((acc, s) => acc + s.metrics.pavedSurfacePct, 0) / sectors.length).toFixed(1) : 63.1);

  return (
    <div className="space-y-6 max-w-[1720px] mx-auto p-2 sm:p-4 pb-20">
      {/* Institutional Module Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                <Thermometer className="w-3.5 h-3.5 text-blue-600" />
                Urban Microclimate &amp; Heat Island (UHI) Observatory
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-medium">
                Landsat-9 TIRS-2 (Band 10 ST) &bull; Sentinel-2 MSI
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Campus Heat Island &amp; Microclimate Zonal Model
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-4xl leading-relaxed">
              Spatial Land Surface Temperature (LST) and vegetation canopy analysis for the CSJMU Kanpur (UIET) precinct. Evaluates thermal hotspots, impervious pavement loads, and scientifically bounded microclimate mitigation interventions.
            </p>
          </div>

          {/* Right Controls: Seasonal Switcher & Waste Overlay Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Seasonal Switcher */}
            <div className="bg-slate-50 p-1 rounded-xl border border-slate-200 flex items-center">
              <button
                onClick={() => setSeason('pre_monsoon')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  season === 'pre_monsoon'
                    ? 'bg-[#1d4ed8] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Landsat-9 overpass: May 18, 2024 at 10:48 AM IST"
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Pre-Monsoon (May 2024)</span>
              </button>
              <button
                onClick={() => setSeason('post_monsoon')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  season === 'post_monsoon'
                    ? 'bg-[#1d4ed8] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Landsat-9 overpass: Oct 12, 2024 at 10:49 AM IST"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Post-Monsoon (Oct 2024)</span>
              </button>
            </div>

            {/* Waste Incidents Toggle */}
            <button
              onClick={() => setShowWasteOverlay(!showWasteOverlay)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                showWasteOverlay
                  ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${showWasteOverlay ? 'text-amber-600' : 'text-slate-400'}`} />
              <span>Waste Grievance Overlay</span>
            </button>
          </div>
        </div>

        {/* Provenance & Acquisition Date Subtitle Strip */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
          <div className="flex items-center gap-4">
            <span>
              Acquisition Date:{' '}
              <strong className="text-slate-700 font-mono">
                {season === 'pre_monsoon' ? '18 May 2024 (10:48 AM IST)' : '12 October 2024 (10:49 AM IST)'}
              </strong>
            </span>
            <span className="hidden sm:inline">&bull;</span>
            <span className="hidden sm:inline">
              Thermal Calibration: <strong className="text-slate-700">USGS USGS Level-2 ST_B10 (Planck Law + Atmospheric Correction)</strong>
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            CRS: EPSG:4326 (WGS 84) &bull; Native Sensor Grid: ~100m
          </div>
        </div>
      </div>

      {/* Summary KPI Strip (Computed from Real Zonal Dataset) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500">
            <span>Peak Hot Zone LST</span>
            <span className="px-1.5 py-0.2 rounded bg-red-50 text-red-700 border border-red-200 text-[9px] font-mono">MEASURED</span>
          </div>
          <div className="mt-1 text-2xl font-bold text-red-600 font-mono">
            {peakTemp}&deg;C
          </div>
          <span className="text-[11px] text-slate-500 truncate block mt-0.5">
            {season === 'pre_monsoon' ? 'Central Workshop' : 'Courtyard Concourse'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500">
            <span>Cool Oasis Sink</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-mono">MEASURED</span>
          </div>
          <div className="mt-1 text-2xl font-bold text-emerald-700 font-mono">
            {coolTemp}&deg;C
          </div>
          <span className="text-[11px] text-slate-500 truncate block mt-0.5">
            Botanical Garden Pond
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500">
            <span>Campus &Delta;T Gradient</span>
            <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-mono">MEASURED</span>
          </div>
          <div className="mt-1 text-2xl font-bold text-amber-600 font-mono">
            {deltaRange}&deg;C
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            Macro-thermal differential
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500">
            <span>Critical Hot Zones</span>
            <span className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[9px] font-mono">DERIVED</span>
          </div>
          <div className="mt-1 text-2xl font-bold text-rose-600 font-mono">
            {criticalCount} Zones
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            LST &ge; 42&deg;C &amp; dense transit
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500">
            <span>Average Tree Canopy</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[9px] font-mono">DERIVED</span>
          </div>
          <div className="mt-1 text-2xl font-bold text-slate-800 font-mono">
            {avgCanopy}%
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            Sentinel-2 NDVI &ge; 0.40
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500">
            <span>Average Paved Surface</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[9px] font-mono">DERIVED</span>
          </div>
          <div className="mt-1 text-2xl font-bold text-slate-800 font-mono">
            {avgPaved}%
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            Impervious albedo ratio
          </span>
        </div>
      </div>

      {/* Layer Selector & Map Legend Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 px-1">
            <Layers className="w-4 h-4 text-blue-700" />
            Choropleth Metric:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'temperature', label: 'Land Surface Temp (LST, °C)' },
              { id: 'canopy', label: 'Tree Canopy Cover (%)' },
              { id: 'pavement', label: 'Paved Surface (%)' },
              { id: 'composite', label: 'Composite Risk' }
            ].map((metric) => (
              <button
                key={metric.id}
                onClick={() => setActiveMetric(metric.id as ActiveMetric)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeMetric === metric.id
                    ? 'bg-[#0f172a] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {metric.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 bg-slate-50 px-3.5 py-1.5 rounded-lg border border-slate-200">
          <span className="text-[10px] text-slate-400 uppercase font-bold">
            {activeMetric === 'temperature' ? 'LST Ramp:' :
             activeMetric === 'canopy' ? 'Canopy Cover:' :
             activeMetric === 'pavement' ? 'Impervious Density:' : 'Risk Level:'}
          </span>
          
          {activeMetric === 'temperature' && (
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="w-3 h-3 rounded-xs bg-[#84cc16]" title="< 31°C Cool Sink" />
              <span>&lt; 31&deg;C</span>
              <span className="text-slate-300">&rarr;</span>
              <span className="w-3 h-3 rounded-xs bg-[#f59e0b]" title="34 - 37°C Moderate" />
              <span>35&deg;C</span>
              <span className="text-slate-300">&rarr;</span>
              <span className="w-3 h-3 rounded-xs bg-[#dc2626]" title="40 - 43°C High Stress" />
              <span>41&deg;C</span>
              <span className="text-slate-300">&rarr;</span>
              <span className="w-3 h-3 rounded-xs bg-[#7f1d1d]" title=">= 43°C Extreme" />
              <span className="font-bold text-red-700">43&deg;C+</span>
            </div>
          )}

          {activeMetric === 'canopy' && (
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="w-3 h-3 rounded-xs bg-[#d97706]" title="< 15% Sparse" />
              <span>&lt; 15%</span>
              <span className="text-slate-300">&rarr;</span>
              <span className="w-3 h-3 rounded-xs bg-[#65a30d]" title="25 - 40% Moderate" />
              <span>30%</span>
              <span className="text-slate-300">&rarr;</span>
              <span className="w-3 h-3 rounded-xs bg-[#14532d]" title=">= 60% Dense" />
              <span className="font-bold text-emerald-800">60%+</span>
            </div>
          )}

          {activeMetric === 'pavement' && (
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="w-3 h-3 rounded-xs bg-[#cbd5e1]" title="< 30% Low" />
              <span>&lt; 30%</span>
              <span className="text-slate-300">&rarr;</span>
              <span className="w-3 h-3 rounded-xs bg-[#64748b]" title="50 - 70% Moderate" />
              <span>60%</span>
              <span className="text-slate-300">&rarr;</span>
              <span className="w-3 h-3 rounded-xs bg-[#1e293b]" title=">= 85% High Impervious" />
              <span className="font-bold text-slate-900">85%+</span>
            </div>
          )}

          {activeMetric === 'composite' && (
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#15803d]" /> Refuge</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]" /> Moderate</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#ea580c]" /> High</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#991b1b]" /> Critical</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Left Map Canvas, Right Planning & Verification Suite */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Leaflet GIS Choropleth Canvas (xl:col-span-7) */}
        <div className="xl:col-span-7 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
          {/* Map Top Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-800 tracking-wide uppercase">
                CSJMU Campus Choropleth &bull; 8 Scientific Polygons
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRecenterMap}
                className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                title="Reset zoom to CSJMU Campus"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Center Campus</span>
              </button>
            </div>
          </div>

          {/* Leaflet Map DOM Element */}
          <div className="relative w-full h-[520px] rounded-xl border border-slate-200 overflow-hidden bg-slate-100">
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* In-Map Helper Capsule */}
            <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm text-[11px] text-slate-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Click any zone polygon to inspect botanical &amp; thermal properties</span>
            </div>

            {/* Waste Incident Overlay Active Chip */}
            {showWasteOverlay && (
              <div className="absolute top-3 right-3 z-[1000] bg-amber-500/90 text-white px-2.5 py-1 rounded-md shadow-sm text-[10px] font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3" />
                <span>Waste Incidents Visible ({reports.length})</span>
              </div>
            )}
          </div>

          {/* Sensor Grid Disclaimer Footer */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                Landsat-9 thermal infrared resolution (~100m native) resampled to 30m by USGS. Small campus courtyard polygons (&lt;100m) exhibit mixed-pixel effects.
              </span>
            </div>
            <span className="font-mono text-[10px] text-slate-400 shrink-0 hidden sm:inline">
              EPSG:4326
            </span>
          </div>
        </div>

        {/* Right Column: Zone Inspection, Field Checklist & What-If Simulator (xl:col-span-5) */}
        <div className="xl:col-span-5 space-y-4">
          {/* Sector Quick Switcher & Tab Navigation */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <label htmlFor="sector-select" className="text-xs font-bold text-slate-700 uppercase">
                Active Zone Inspection:
              </label>
              <select
                id="sector-select"
                value={selectedSectorId}
                onChange={(e) => setSelectedSectorId(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {sectors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.metrics.surfaceTempC}&deg;C)
                  </option>
                ))}
              </select>
            </div>

            {/* 3 Detail Tabs */}
            <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveDetailTab('details')}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center ${
                  activeDetailTab === 'details'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Zone Metrics
              </button>
              <button
                onClick={() => setActiveDetailTab('survey')}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
                  activeDetailTab === 'survey'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Site Survey</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                  completedChecksCount === 4 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                }`}>
                  {completedChecksCount}/4
                </span>
              </button>
              <button
                onClick={() => setActiveDetailTab('simulator')}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
                  activeDetailTab === 'simulator'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-3 h-3 text-blue-600" />
                <span>What-If Sim</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Zone Metrics & Provenance Matrix */}
          {activeDetailTab === 'details' && selectedSector && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    {selectedSector.zone} &bull; Area: {selectedSector.areaSqm ? `${selectedSector.areaSqm.toLocaleString()} m²` : '38,400 m²'}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 mt-0.5">
                    {selectedSector.name}
                  </h3>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md shrink-0 border ${
                  selectedSector.classification === 'CRITICAL_HOT_ZONE' ? 'bg-red-50 text-red-700 border-red-200' :
                  selectedSector.classification === 'HIGH_STRESS' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                  selectedSector.classification === 'COOL_REFUGE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {selectedSector.classification.replace(/_/g, ' ')}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {selectedSector.exposureSummary}
              </p>

              {/* Thermal Pixel Confidence Card */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Thermal Sensor Footprint</span>
                  <span className="font-semibold text-slate-800">
                    {selectedSector.validThermalPixels || 6} Landsat pixels (~100m)
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                  (selectedSector.validThermalPixels || 6) < 8
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  {(selectedSector.validThermalPixels || 6) < 8 ? 'LOW CONFIDENCE' : 'MODERATE CONFIDENCE'}
                </span>
              </div>

              {/* Data Provenance Matrix */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Metric Provenance &amp; Acquisition Lineage
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-0.5">
                      <span>Surface LST</span>
                      <span className="text-red-700 font-mono">MEASURED</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">{selectedSector.metrics.surfaceTempC}&deg;C</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Landsat 9 TIRS-2 Band 10 ST</div>
                  </div>

                  <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-0.5">
                      <span>Tree Canopy</span>
                      <span className="text-emerald-700 font-mono">DERIVED</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">{selectedSector.metrics.treeCanopyPct}%</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Sentinel-2 NDVI &ge; 0.40 proxy</div>
                  </div>

                  <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-0.5">
                      <span>Paved Surface</span>
                      <span className="text-slate-700 font-mono">DERIVED</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">{selectedSector.metrics.pavedSurfacePct}%</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Sentinel-2 NDBI + OSM Roads</div>
                  </div>

                  <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-0.5">
                      <span>Footfall Exposure</span>
                      <span className="text-amber-700 font-mono">ASSUMED</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">{selectedSector.metrics.pedestrianFootfall}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Campus Timetable Estimate</div>
                  </div>
                </div>
              </div>

              {/* Recommended Botanical Species & Silvicultural Cautions */}
              {selectedSector.recommendedSpecies && selectedSector.recommendedSpecies.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Trees className="w-3.5 h-3.5 text-emerald-600" />
                    Botanical Species Recommendations
                  </h4>
                  <div className="space-y-2">
                    {selectedSector.recommendedSpecies.map((sp, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/80 text-xs space-y-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-bold text-slate-900">{sp.name}</span>
                            {sp.type && <span className="text-[10px] text-emerald-800 ml-1.5">({sp.type})</span>}
                          </div>
                          {sp.canopyDiameterM && (
                            <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-emerald-200 text-emerald-800 font-bold">
                              ~{sp.canopyDiameterM}m Mature Canopy
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600 pt-0.5">
                          <div>Water: <b>{sp.waterNeed || 'Moderate'}</b></div>
                          <div>Root: <b>{sp.rootSpread || 'Deep taproot'}</b></div>
                        </div>

                        {sp.cautions && (
                          <div className="text-[10px] text-amber-900 bg-amber-50 p-1.5 rounded border border-amber-200/70 mt-1 flex items-start gap-1">
                            <AlertCircle className="w-3 h-3 text-amber-700 shrink-0 mt-0.5" />
                            <span><b>Silvicultural Caution:</b> {sp.cautions}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Waste Grievances In This Sector */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 block">Waste Grievances in Sector</span>
                    <span className="text-[11px] text-slate-500">Correlation with open refuse decomposition</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-sm text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                  {correlatedWasteCount} Reports
                </span>
              </div>
            </div>
          )}

          {/* Tab 2: Site Survey & Field Verification Checklist */}
          {activeDetailTab === 'survey' && selectedSector && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    Field Feasibility Audit
                  </span>
                  <h3 className="font-bold text-base text-slate-900">
                    Site-Check Checklist &bull; {selectedSector.name}
                  </h3>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                  completedChecksCount === 4 ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-amber-50 text-amber-700 border-amber-300'
                }`}>
                  {completedChecksCount === 4 ? 'Audit Passed' : 'Pending Verification'}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Before approving tree plantation or civil albedo retrofits, field engineers from the CSJMU Directorate of Estate &amp; Works must confirm subterranean and civil clearances.
              </p>

              {/* 4 Interactive Verification Items */}
              <div className="space-y-2.5">
                {[
                  {
                    key: 'utilities' as keyof SurveyCheckState,
                    title: 'Underground Utilities Clearance',
                    desc: 'Verify absence of buried 11kV HT lines, campus fiber trunks, and storm drainage lines within 3m radius.'
                  },
                  {
                    key: 'soil' as keyof SurveyCheckState,
                    title: 'Soil Permeability & Compaction Test',
                    desc: 'Confirm topsoil infiltration rate (>15 mm/hr) and core aeration requirement in heavy clay loam.'
                  },
                  {
                    key: 'irrigation' as keyof SurveyCheckState,
                    title: 'Irrigation & Maintenance Access',
                    desc: 'Confirm proximity to campus treated effluent/borewell line for sapling establishment (first 24 months).'
                  },
                  {
                    key: 'setback' as keyof SurveyCheckState,
                    title: 'Building Foundation Setback (> 5m)',
                    desc: 'Ensure mature canopy species are offset minimum 5 meters from structural columns and brick masonry.'
                  }
                ].map((item) => {
                  const isChecked = currentSurvey[item.key];
                  return (
                    <div
                      key={item.key}
                      onClick={() => handleToggleSurveyCheck(item.key)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer select-none flex items-start gap-3 ${
                        isChecked
                          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                          : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <button
                        type="button"
                        className="mt-0.5 shrink-0 text-slate-400 focus:outline-hidden"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${isChecked ? 'text-emerald-900' : 'text-slate-900'}`}>
                            {item.title}
                          </span>
                          <span className={`text-[10px] font-mono font-semibold ${isChecked ? 'text-emerald-700' : 'text-slate-400'}`}>
                            {isChecked ? 'VERIFIED' : 'NOT CHECKED'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status Banner */}
              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                completedChecksCount === 4
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                {completedChecksCount === 4 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span>
                  {completedChecksCount === 4
                    ? 'All 4 clearances confirmed. Site is approved for estate procurement and contractor deployment.'
                    : `Status: ${completedChecksCount}/4 clearances logged. Site remains unverified until on-site ground inspection is complete.`}
                </span>
              </div>
            </div>
          )}

          {/* Tab 3: What-If Scenario Simulator with Bounded Ranges */}
          {activeDetailTab === 'simulator' && selectedSector && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    Empirically Bounded Scenario Range
                  </span>
                  <h3 className="font-bold text-base text-slate-900">
                    Microclimate What-If Simulator &bull; {selectedSector.name}
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                  Literature Bounded
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Simulates microclimate mitigation based on peer-reviewed empirical studies (Bowler et al. 2010, Santamouris 2014, Lin et al. 2010). Outputs bounded ranges for <b>Land Surface Temperature (LST)</b> reduction with physical saturation caps.
              </p>

              {/* Sliders with Real Physical Units */}
              <div className="space-y-3.5 text-xs">
                {/* 1. Shade Trees */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Trees className="w-3.5 h-3.5 text-emerald-600" />
                      Add Native Canopy Trees:
                    </span>
                    <span className="font-mono font-bold text-emerald-700 text-xs">
                      +{addedTrees} Trees (~{(addedTrees * 25).toLocaleString()} m² shade)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="2"
                    value={addedTrees}
                    onChange={(e) => setAddedTrees(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>0 Trees</span>
                    <span>25 Trees</span>
                    <span>50 Trees (Saturation cap)</span>
                  </div>
                </div>

                {/* 2. Cool Pavement Area */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-cyan-600" />
                      Retrofit High-Albedo Cool Pavement (SRI &ge; 80):
                    </span>
                    <span className="font-mono font-bold text-cyan-700 text-xs">
                      {coolPaveSqm} m²
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="50"
                    value={coolPaveSqm}
                    onChange={(e) => setCoolPaveSqm(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer accent-cyan-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>0 m²</span>
                    <span>500 m²</span>
                    <span>1,000 m² (Albedo saturation)</span>
                  </div>
                </div>

                {/* 3. Tensile Shade Structures */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Umbrella className="w-3.5 h-3.5 text-amber-600" />
                      Deploy Tensile / Pergola Shade:
                    </span>
                    <span className="font-mono font-bold text-amber-700 text-xs">
                      {shadeSqm} m²
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="400"
                    step="20"
                    value={shadeSqm}
                    onChange={(e) => setShadeSqm(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer accent-amber-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>0 m²</span>
                    <span>200 m²</span>
                    <span>400 m²</span>
                  </div>
                </div>
              </div>

              {/* Simulator Output Box with Bounded Range */}
              {simResult && (
                <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 shadow-md">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                    <span className="font-bold text-slate-300">Projected Surface LST Outcome</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                      {simResult.confidenceLabel ? 'Empirical Range' : 'Scenario Model'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-mono">Net Surface LST Drop</span>
                      <div className="text-xl font-bold font-mono text-amber-300">
                        {simResult.totalLSTDropRangeC
                          ? `-${simResult.totalLSTDropRangeC[0]}°C to -${simResult.totalLSTDropRangeC[1]}°C`
                          : `-${simResult.totalTempDropC || 2.4}°C`}
                      </div>
                      <span className="text-[10px] text-slate-400">Surface LST reduction range</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-mono">Projected Surface LST</span>
                      <div className="text-xl font-bold font-mono text-emerald-300">
                        {simResult.projectedSurfaceTempRangeC
                          ? `${simResult.projectedSurfaceTempRangeC[0]}°C – ${simResult.projectedSurfaceTempRangeC[1]}°C`
                          : `${simResult.projectedTempC || 39.8}°C`}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Base: {selectedSector.metrics.surfaceTempC}&deg;C
                      </span>
                    </div>
                  </div>

                  {/* Ambient Air Temperature Reality Check */}
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300 space-y-1">
                    <div className="font-bold text-amber-300 flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5" />
                      Ambient Air Temperature (T_air) Reality Check:
                    </div>
                    <p className="leading-snug text-slate-300 text-[10px]">
                      Surface LST is not pedestrian air temperature. Empirical microclimate studies demonstrate that <b>ambient air temperature (T_air) drop is typically only 30% to 50% of surface LST reduction</b> (estimated: -{simResult.totalLSTDropRangeC ? (simResult.totalLSTDropRangeC[0] * 0.4).toFixed(1) : '0.8'}&deg;C to -{simResult.totalLSTDropRangeC ? (simResult.totalLSTDropRangeC[1] * 0.45).toFixed(1) : '1.4'}&deg;C).
                    </p>
                  </div>
                </div>
              )}

              {/* Literature Citations */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
                  Peer-Reviewed Literature Baseline:
                </span>
                <ul className="space-y-1 text-[11px] text-slate-600">
                  <li className="flex items-start justify-between">
                    <span>&bull; <b>Canopy Cooling:</b> Bowler et al. (2010), <i>Landscape &amp; Urban Planning</i></span>
                    <span className="font-mono text-[10px] text-blue-700">doi:10.1016/j.landurbplan.2010.05.006</span>
                  </li>
                  <li className="flex items-start justify-between">
                    <span>&bull; <b>Reflective Pavement:</b> Santamouris (2014), <i>Solar Energy</i></span>
                    <span className="font-mono text-[10px] text-blue-700">doi:10.1016/j.solener.2012.07.003</span>
                  </li>
                  <li className="flex items-start justify-between">
                    <span>&bull; <b>Architectural Shade:</b> Lin et al. (2010), <i>Building &amp; Environment</i></span>
                    <span className="font-mono text-[10px] text-blue-700">doi:10.1016/j.buildenv.2009.06.002</span>
                  </li>
                </ul>
              </div>

              {/* Expandable "How this is calculated" methodology disclosure */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowMethodology(!showMethodology)}
                  className="w-full p-3 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    How this scenario estimate is calculated
                  </span>
                  {showMethodology ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {showMethodology && (
                  <div className="p-3.5 bg-white text-[11px] text-slate-600 space-y-2 border-t border-slate-200 leading-relaxed">
                    <p>
                      <b>1. Non-Linear Saturation Model:</b> Unlike simple linear models which multiply trees by a constant, our model enforces diminishing marginal returns. Additional canopy in an already shaded precinct produces less incremental cooling than the first tree canopy layer.
                    </p>
                    <p>
                      <b>2. Physical Saturation Caps:</b> Maximum achievable surface LST drop from biological canopy is capped at 3.8&deg;C, cool pavement at 4.2&deg;C, and tensile shade at 2.8&deg;C, consistent with empirical sub-tropical campus field measurements. Total combined drop is bounded to 5.5&deg;C–7.0&deg;C.
                    </p>
                    <p>
                      <b>3. Bounded Uncertainty:</b> Environmental variables such as wind speed, relative humidity, and solar azimuth vary daily. Rather than asserting an invented single number, the simulator presents a bounded range of probable outcomes.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Zone Navigation Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>All 8 Campus Zones (Sorted by LST)</span>
              <span className="text-[10px] font-mono font-normal text-slate-400">Click to inspect</span>
            </h4>
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {[...sectors].sort((a, b) => b.metrics.surfaceTempC - a.metrics.surfaceTempC).map((sec) => (
                <div
                  key={sec.id}
                  onClick={() => setSelectedSectorId(sec.id)}
                  className={`p-2 rounded-lg border text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    sec.id === selectedSectorId
                      ? 'bg-blue-50 border-blue-400 text-blue-950 font-bold shadow-xs'
                      : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getFillColor(sec, 'temperature') }} />
                    <span className="truncate">{sec.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
                    <span className="font-bold text-red-600">{sec.metrics.surfaceTempC}&deg;C</span>
                    <span className="text-slate-400 hidden sm:inline">{sec.metrics.treeCanopyPct}% canopy</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
