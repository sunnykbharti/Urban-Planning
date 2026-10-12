import { MicroclimateSector, MicroclimateSummary } from '../types';

export const defaultMicroclimateSectors: MicroclimateSector[] = [
  {
    id: "sec-uiet-courtyard",
    name: "UIET Central Courtyard & Transit Concourse",
    zone: "Academic Precinct",
    bounds: { x: 36, y: 38, width: 14, height: 12 },
    gps: { latitude: 26.4952, longitude: 80.2921 },
    metrics: {
      surfaceTempC: 42.6,
      treeCanopyPct: 12,
      buildingDensityPct: 68,
      pavedSurfacePct: 84,
      waterBodyBufferM: 320,
      pedestrianFootfall: "EXTREME",
      albedo: 0.14
    },
    heatRiskScore: 92,
    classification: "CRITICAL_HOT_ZONE",
    statusColor: "#ef4444",
    exposureSummary: "Severe heat island trap: High student pedestrian transit through unshaded concrete courtyard with high thermal retention."
  },
  {
    id: "sec-workshop-yard",
    name: "Central Mechanical Workshop & Scrap Yard",
    zone: "Engineering & Utilities",
    bounds: { x: 22, y: 56, width: 16, height: 14 },
    gps: { latitude: 26.4938, longitude: 80.2895 },
    metrics: {
      surfaceTempC: 44.2,
      treeCanopyPct: 6,
      buildingDensityPct: 75,
      pavedSurfacePct: 92,
      waterBodyBufferM: 410,
      pedestrianFootfall: "MEDIUM",
      albedo: 0.11
    },
    heatRiskScore: 95,
    classification: "CRITICAL_HOT_ZONE",
    statusColor: "#dc2626",
    exposureSummary: "Highest recorded surface temperature (44.2°C) due to unpainted galvanized corrugated roofs and dark bitumen paving."
  },
  {
    id: "sec-library-plaza",
    name: "Central Library Forecourt & Sun Plaza",
    zone: "Central Academic",
    bounds: { x: 56, y: 32, width: 14, height: 14 },
    gps: { latitude: 26.4965, longitude: 80.2940 },
    metrics: {
      surfaceTempC: 39.8,
      treeCanopyPct: 18,
      buildingDensityPct: 52,
      pavedSurfacePct: 78,
      waterBodyBufferM: 190,
      pedestrianFootfall: "HIGH",
      albedo: 0.22
    },
    heatRiskScore: 79,
    classification: "HIGH_STRESS",
    statusColor: "#f97316",
    exposureSummary: "Red sandstone paving re-radiates midday solar radiation directly onto students entering and leaving the central reading hall."
  },
  {
    id: "sec-admin-parking",
    name: "Vice Chancellor Secretariat & VIP Parking Lot",
    zone: "Administrative Precinct",
    bounds: { x: 68, y: 24, width: 15, height: 12 },
    gps: { latitude: 26.4975, longitude: 80.2965 },
    metrics: {
      surfaceTempC: 41.4,
      treeCanopyPct: 22,
      buildingDensityPct: 45,
      pavedSurfacePct: 88,
      waterBodyBufferM: 260,
      pedestrianFootfall: "MEDIUM",
      albedo: 0.12
    },
    heatRiskScore: 83,
    classification: "HIGH_STRESS",
    statusColor: "#f97316",
    exposureSummary: "Unshaded open asphalt parking generates local micro-plume of buoyant heated air drifting toward administrative offices."
  },
  {
    id: "sec-botanical-pond",
    name: "North Botanical Garden & Rainwater Retention Pond",
    zone: "Eco-Conservation Zone",
    bounds: { x: 72, y: 50, width: 18, height: 18 },
    gps: { latitude: 26.4982, longitude: 80.2980 },
    metrics: {
      surfaceTempC: 28.4,
      treeCanopyPct: 86,
      buildingDensityPct: 4,
      pavedSurfacePct: 8,
      waterBodyBufferM: 0,
      pedestrianFootfall: "LOW",
      albedo: 0.35
    },
    heatRiskScore: 14,
    classification: "COOL_REFUGE",
    statusColor: "#10b981",
    exposureSummary: "Primary natural cooling engine of the campus. Water surface evaporation combined with multi-tiered tree canopy suppresses temperature by 14.2°C."
  },
  {
    id: "sec-sports-stadium",
    name: "Athletic Stadium & Synthetic Running Track",
    zone: "Sports & Recreation",
    bounds: { x: 38, y: 72, width: 22, height: 16 },
    gps: { latitude: 26.4920, longitude: 80.2950 },
    metrics: {
      surfaceTempC: 42.1,
      treeCanopyPct: 10,
      buildingDensityPct: 18,
      pavedSurfacePct: 76,
      waterBodyBufferM: 380,
      pedestrianFootfall: "HIGH",
      albedo: 0.16
    },
    heatRiskScore: 86,
    classification: "CRITICAL_HOT_ZONE",
    statusColor: "#ef4444",
    exposureSummary: "Wide open, unshaded spectator stands and synthetic poly-turf reach peak thermal saturation by 13:00 hrs."
  },
  {
    id: "sec-hostel-spine",
    name: "Boys Hostel Spine & Canteen Pathway (Gate 2)",
    zone: "Residential Sector",
    bounds: { x: 74, y: 70, width: 16, height: 16 },
    gps: { latitude: 26.4970, longitude: 80.2995 },
    metrics: {
      surfaceTempC: 39.5,
      treeCanopyPct: 26,
      buildingDensityPct: 60,
      pavedSurfacePct: 74,
      waterBodyBufferM: 210,
      pedestrianFootfall: "EXTREME",
      albedo: 0.18
    },
    heatRiskScore: 81,
    classification: "HIGH_STRESS",
    statusColor: "#f97316",
    exposureSummary: "High vulnerability due to extreme evening and midday student pedestrian traffic crossing between hostels and academic mess."
  },
  {
    id: "sec-girls-hostel",
    name: "Girls Hostel Inner Courtyard & Neem Grove",
    zone: "Residential Sector",
    bounds: { x: 54, y: 55, width: 14, height: 14 },
    gps: { latitude: 26.4950, longitude: 80.2960 },
    metrics: {
      surfaceTempC: 31.8,
      treeCanopyPct: 68,
      buildingDensityPct: 42,
      pavedSurfacePct: 32,
      waterBodyBufferM: 140,
      pedestrianFootfall: "MEDIUM",
      albedo: 0.28
    },
    heatRiskScore: 32,
    classification: "MODERATE",
    statusColor: "#3b82f6",
    exposureSummary: "Protected courtyard microclimate with mature Azadirachta indica (Neem) trees providing continuous biological shade."
  }
];

export const defaultPlanningInterventions = {
  treePlanting: [
    {
      id: "TP-01",
      title: "UIET North Boulevard Green Corridor",
      sectorId: "sec-uiet-courtyard",
      location: "North Pedestrian Spine between UIET 1 & 3",
      coordinates: { x: 42, y: 36 },
      gps: { latitude: 26.4955, longitude: 80.2925 },
      urgency: "HIGH",
      recommendedSpecies: [
        { name: "Azadirachta indica (Neem)", reason: "Dense evergreen shade, high evapotranspiration, dust filtration", coolingEffect: "High (-3.8°C)" },
        { name: "Cassia fistula (Amaltas)", reason: "Drought tolerant, medium canopy, seasonal aesthetic", coolingEffect: "Medium (-2.4°C)" },
        { name: "Dalbergia sissoo (Shisham)", reason: "Deep root system, non-disruptive to pavement foundation", coolingEffect: "High (-3.2°C)" }
      ],
      treeCountTarget: 45,
      estimatedTempDropC: 4.2,
      soilPermeability: "Good (Sandy Loam)",
      undergroundUtilitiesCheck: "PASSED (Safe from sewer mains)",
      whyHere: "Currently 84% paved with only 12% canopy. Extreme student footfall makes this the #1 priority for biological shading."
    },
    {
      id: "TP-02",
      title: "Stadium Perimeter Heat Buffer Belt",
      sectorId: "sec-sports-stadium",
      location: "West Bleacher Boundary Road",
      coordinates: { x: 37, y: 74 },
      gps: { latitude: 26.4918, longitude: 80.2945 },
      urgency: "MEDIUM",
      recommendedSpecies: [
        { name: "Ficus benghalensis (Banyan)", reason: "Massive canopy footprint, multi-generational microclimate sink", coolingEffect: "Very High (-5.1°C)" },
        { name: "Terminalia arjuna (Arjun)", reason: "Rapid vertical growth, strong windbreak property", coolingEffect: "High (-3.5°C)" }
      ],
      treeCountTarget: 30,
      estimatedTempDropC: 3.6,
      soilPermeability: "Moderate",
      undergroundUtilitiesCheck: "PASSED",
      whyHere: "Blocks afternoon solar glare and western hot winds (Loo) from heating the running tracks and bleachers."
    }
  ],

  shadeStructures: [
    {
      id: "SS-01",
      title: "UIET Central Tensile Fabric Canopy Walkway",
      sectorId: "sec-uiet-courtyard",
      location: "Connecting UIET Block 1 to Canteen Hub",
      coordinates: { x: 39, y: 42 },
      gps: { latitude: 26.4950, longitude: 80.2922 },
      structureType: "PTFE Architectural Tensile Membrane with Photovoltaic Integrated Skin",
      spanLengthMeters: 85,
      uvProtectionPct: 98,
      solarInsolationCut: "82% direct radiation cut",
      whyNoTrees: "Underground 11kV electrical duct bank and stormwater culvert prevent tree root growth.",
      immediateImpact: "Instant 6.5°C perceived thermal comfort improvement (PET) along main student thoroughfare."
    },
    {
      id: "SS-02",
      title: "Library Concourse Solar Pergola Gallery",
      sectorId: "sec-library-plaza",
      location: "Central Library Main Approach Steps",
      coordinates: { x: 58, y: 34 },
      gps: { latitude: 26.4967, longitude: 80.2942 },
      structureType: "Bifacial Solar Glass Pergola with Climber Trellises (Bougainvillea)",
      spanLengthMeters: 50,
      uvProtectionPct: 95,
      solarInsolationCut: "75% solar reflection + 12 kW clean power generation",
      whyNoTrees: "Sandstone podium slab over underground book archive basement.",
      immediateImpact: "Creates sheltered waiting and congregation foyer outside reading hall."
    }
  ],

  coolPavement: [
    {
      id: "CP-01",
      title: "Workshop Logistics & Loading Dock Retrofit",
      sectorId: "sec-workshop-yard",
      location: "Central Mechanical Workshop North Apron",
      coordinates: { x: 26, y: 60 },
      gps: { latitude: 26.4936, longitude: 80.2892 },
      currentMaterial: "Aged Weathered Asphalt (Albedo: 0.10, Surface: 44.2°C)",
      recommendedTreatment: "Permeable Concrete Pavers with High Solar Reflectance Index (SRI ≥ 78)",
      retrofitAreaSqM: 3200,
      expectedSurfaceTempDrop: "Down from 44.2°C to 34.5°C (-9.7°C drop)",
      permeabilityGain: "Permits 180mm/hr stormwater infiltration, recharging campus groundwater"
    },
    {
      id: "CP-02",
      title: "Admin & VIP Parking Lot Cool Coating",
      sectorId: "sec-admin-parking",
      location: "Secretariat Open Car Park",
      coordinates: { x: 71, y: 26 },
      gps: { latitude: 26.4973, longitude: 80.2962 },
      currentMaterial: "Bituminous Macadam (Albedo: 0.12)",
      recommendedTreatment: "Titanium-Dioxide Polymer Cool Pavement Slurry (SRI ≥ 82, Light Grey Finish)",
      retrofitAreaSqM: 2400,
      expectedSurfaceTempDrop: "Down from 41.4°C to 33.0°C (-8.4°C drop)",
      permeabilityGain: "Reflective thermal barrier stops re-radiation into adjacent offices"
    }
  ],

  optimalSeating: [
    {
      id: "OS-01",
      title: "Botanical Lake Breeze Study Pavilion",
      sectorId: "sec-botanical-pond",
      location: "South-West Shore of Eco Retention Pond",
      coordinates: { x: 75, y: 54 },
      gps: { latitude: 26.4980, longitude: 80.2978 },
      thermalComfortIndex: "EXCELLENT (28.4°C ambient micro-climate)",
      canopyShadeFactor: "95% Mature Ficus & Neem canopy",
      windChanneling: "Catches prevailing easterly lake breezes",
      furnitureType: "Recycled composite timber benches with solar USB charging ports",
      capacity: 24,
      walkDistanceMinutes: "2.5 mins from Central Library"
    },
    {
      id: "OS-02",
      title: "UIET West Pocket Forest Seating Ring",
      sectorId: "sec-uiet-courtyard",
      location: "Adjacent to UIET Block 2 Lawn Margin",
      coordinates: { x: 45, y: 50 },
      gps: { latitude: 26.4948, longitude: 80.2928 },
      thermalComfortIndex: "GOOD (32.2°C with planned canopy extension)",
      canopyShadeFactor: "70% existing Gulmohar canopy",
      windChanneling: "Building venturi draft provides natural air velocity (1.8 m/s)",
      furnitureType: "Granite curved seating benches with backrests under dense tree ring",
      capacity: 18,
      walkDistanceMinutes: "45 seconds from Mechanical & Civil classrooms"
    }
  ]
};

export const defaultMicroclimateSummary: MicroclimateSummary = {
  avgSurfaceTempC: 38.7,
  peakHotZoneTempC: 44.2,
  coolOasisTempC: 28.4,
  uhiDeltaRangeC: 15.8,
  criticalHotZonesCount: 3,
  avgTreeCanopyPct: 31.0,
  avgPavedSurfacePct: 66.5,
  totalInterventions: {
    treePlantingTarget: 75,
    shadeCanopyMeters: 135,
    coolPavementSqM: 5600,
    seatingCapacity: 42
  }
};
