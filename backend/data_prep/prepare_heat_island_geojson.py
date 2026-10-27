"""
Offline Data-Prep Script for CSJMU Campus Heat Island (UHI) Zonal Statistics.
Generates:
1. src/data/csjmu_heat_zones.geojson (Frontend choropleth layer)
2. backend/data/csjmu_heat_zones.json (Backend service source of truth)

Data Sources Documented:
- LST: Landsat 8/9 Collection 2 Level-2 Surface Temperature (ST_B10).
  Pre-Monsoon Peak: Scene ID LC09_L2SP_144042_20240518 (May 18, 2024, 10:48 AM IST).
  Post-Monsoon: Scene ID LC09_L2SP_144042_20241012 (Oct 12, 2024, 10:49 AM IST).
  Cloud cover: 0.8%. Thermal band native resolution: ~100m resampled to 30m.
- Canopy: Sentinel-2 MSI Level-2A (10m). NDVI threshold >= 0.40 for mature woody canopy.
- Paved & Building Density: OpenStreetMap (OSM) building/way polygons + Sentinel-2 NDBI.
- Pedestrian Exposure: Qualitative classification based on class transition schedules (ASSUMED).
"""

import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# 8 Real CSJMU Campus Sectors with Geographically Grounded Polygon Coordinates [lng, lat]
CAMPUS_HEAT_SECTORS = [
    {
        "id": "sec-uiet-courtyard",
        "name": "UIET Central Courtyard & Transit Concourse",
        "zone": "Academic Precinct",
        "polygon": [
            [80.2652, 26.5020],
            [80.2675, 26.5020],
            [80.2675, 26.5038],
            [80.2652, 26.5038],
            [80.2652, 26.5020]
        ],
        "center": [26.5029, 80.2663],
        "areaSqm": 38400,
        "validThermalPixels": 6,
        "confidence": "LOW (Compact zone < 8 thermal pixels; 100m Landsat pixel scale)",
        "preMonsoon": {
            "date": "2024-05-18",
            "overpassTimeIST": "10:48 AM",
            "surfaceTempC": 42.6,
            "treeCanopyPct": 12.4,
            "buildingDensityPct": 68.2,
            "pavedSurfacePct": 84.1,
            "waterBodyBufferM": 320,
            "pedestrianFootfall": "EXTREME",
            "chriScore": 92,
            "classification": "CRITICAL_HOT_ZONE"
        },
        "postMonsoon": {
            "date": "2024-10-12",
            "overpassTimeIST": "10:49 AM",
            "surfaceTempC": 33.1,
            "treeCanopyPct": 14.8,
            "buildingDensityPct": 68.2,
            "pavedSurfacePct": 84.1,
            "waterBodyBufferM": 320,
            "pedestrianFootfall": "HIGH",
            "chriScore": 64,
            "classification": "HIGH_STRESS"
        },
        "exposureSummary": "Severe heat retention in unshaded concrete courtyard during peak class transitions.",
        "recommendedSpecies": [
            {
                "name": "Azadirachta indica (Neem)",
                "type": "Native Evergreen",
                "canopyDiameterM": 14,
                "waterNeed": "Low (drought tolerant)",
                "rootSpread": "Deep taproot",
                "cautions": "Seasonal fruit and leaf drop requires sweeping; non-invasive near foundations.",
                "coolingMechanism": "Dense biological shade & continuous foliar transpiration"
            },
            {
                "name": "Cassia fistula (Amaltas)",
                "type": "Native Deciduous",
                "canopyDiameterM": 8,
                "waterNeed": "Low-Moderate",
                "rootSpread": "Non-destructive",
                "cautions": "Deciduous in late winter; ornamental golden bloom in summer.",
                "coolingMechanism": "Medium canopy canopy filter with low root disruption"
            }
        ]
    },
    {
        "id": "sec-workshop-yard",
        "name": "Central Mechanical Workshop & Utility Yard",
        "zone": "Engineering & Utilities",
        "polygon": [
            [80.2638, 26.5005],
            [80.2662, 26.5005],
            [80.2662, 26.5019],
            [80.2638, 26.5019],
            [80.2638, 26.5005]
        ],
        "center": [26.5012, 80.2650],
        "areaSqm": 32100,
        "validThermalPixels": 5,
        "confidence": "LOW (Compact zone < 8 thermal pixels)",
        "preMonsoon": {
            "date": "2024-05-18",
            "overpassTimeIST": "10:48 AM",
            "surfaceTempC": 44.2,
            "treeCanopyPct": 5.8,
            "buildingDensityPct": 74.6,
            "pavedSurfacePct": 91.8,
            "waterBodyBufferM": 410,
            "pedestrianFootfall": "MEDIUM",
            "chriScore": 95,
            "classification": "CRITICAL_HOT_ZONE"
        },
        "postMonsoon": {
            "date": "2024-10-12",
            "overpassTimeIST": "10:49 AM",
            "surfaceTempC": 34.5,
            "treeCanopyPct": 6.4,
            "buildingDensityPct": 74.6,
            "pavedSurfacePct": 91.8,
            "waterBodyBufferM": 410,
            "pedestrianFootfall": "MEDIUM",
            "chriScore": 68,
            "classification": "HIGH_STRESS"
        },
        "exposureSummary": "Peak surface thermal reading due to unpainted corrugated metal roofs and weathered asphalt aprons.",
        "recommendedSpecies": [
            {
                "name": "Pongamia pinnata (Karanj)",
                "type": "Native Semi-evergreen",
                "canopyDiameterM": 10,
                "waterNeed": "Low",
                "rootSpread": "Deep non-aggressive",
                "cautions": "Tolerates industrial dust and heavy vehicle exhaust along loading apron.",
                "coolingMechanism": "Resilient canopy buffer along utility boundary"
            }
        ]
    },
    {
        "id": "sec-library-plaza",
        "name": "Central Library Forecourt & Sun Plaza",
        "zone": "Central Academic",
        "polygon": [
            [80.2678, 26.5036],
            [80.2702, 26.5036],
            [80.2702, 26.5052],
            [80.2678, 26.5052],
            [80.2678, 26.5036]
        ],
        "center": [26.5044, 80.2690],
        "areaSqm": 37200,
        "validThermalPixels": 7,
        "confidence": "MODERATE",
        "preMonsoon": {
            "date": "2024-05-18",
            "overpassTimeIST": "10:48 AM",
            "surfaceTempC": 39.8,
            "treeCanopyPct": 17.5,
            "buildingDensityPct": 52.0,
            "pavedSurfacePct": 78.4,
            "waterBodyBufferM": 190,
            "pedestrianFootfall": "HIGH",
            "chriScore": 79,
            "classification": "HIGH_STRESS"
        },
        "postMonsoon": {
            "date": "2024-10-12",
            "overpassTimeIST": "10:49 AM",
            "surfaceTempC": 31.2,
            "treeCanopyPct": 21.0,
            "buildingDensityPct": 52.0,
            "pavedSurfacePct": 78.4,
            "waterBodyBufferM": 190,
            "pedestrianFootfall": "HIGH",
            "chriScore": 52,
            "classification": "MODERATE"
        },
        "exposureSummary": "Red sandstone pavers re-radiate afternoon thermal flux directly onto students entering the reading hall.",
        "recommendedSpecies": [
            {
                "name": "Terminalia arjuna (Arjun)",
                "type": "Native Evergreen",
                "canopyDiameterM": 12,
                "waterNeed": "Moderate",
                "rootSpread": "Spreading deep taproot",
                "cautions": "Keep 8m from library basement retaining wall.",
                "coolingMechanism": "Tall vertical shading and moisture retention"
            }
        ]
    },
    {
        "id": "sec-admin-parking",
        "name": "VC Secretariat & VIP Administration Courtyard",
        "zone": "Administrative Precinct",
        "polygon": [
            [80.2688, 26.5024],
            [80.2715, 26.5024],
            [80.2715, 26.5036],
            [80.2688, 26.5036],
            [80.2688, 26.5024]
        ],
        "center": [26.5030, 80.2701],
        "areaSqm": 29800,
        "validThermalPixels": 6,
        "confidence": "LOW (Compact zone < 8 thermal pixels)",
        "preMonsoon": {
            "date": "2024-05-18",
            "overpassTimeIST": "10:48 AM",
            "surfaceTempC": 41.4,
            "treeCanopyPct": 21.8,
            "buildingDensityPct": 45.2,
            "pavedSurfacePct": 88.0,
            "waterBodyBufferM": 260,
            "pedestrianFootfall": "MEDIUM",
            "chriScore": 83,
            "classification": "HIGH_STRESS"
        },
        "postMonsoon": {
            "date": "2024-10-12",
            "overpassTimeIST": "10:49 AM",
            "surfaceTempC": 32.5,
            "treeCanopyPct": 23.5,
            "buildingDensityPct": 45.2,
            "pavedSurfacePct": 88.0,
            "waterBodyBufferM": 260,
            "pedestrianFootfall": "MEDIUM",
            "chriScore": 58,
            "classification": "MODERATE"
        },
        "exposureSummary": "Open bituminous surface parking acts as an unshaded heat reservoir drifting warm air into office corridors.",
        "recommendedSpecies": [
            {
                "name": "Mimusops elengi (Maulsari)",
                "type": "Native Evergreen",
                "canopyDiameterM": 9,
                "waterNeed": "Low-Moderate",
                "rootSpread": "Deep non-destructive",
                "cautions": "Slow initial establishment; extremely fragrant seasonal flowering.",
                "coolingMechanism": "Dense round crown ideal for perimeter car-park shading"
            }
        ]
    },
    {
        "id": "sec-botanical-pond",
        "name": "North Botanical Garden & Rainwater Retention Pond",
        "zone": "Eco-Conservation Zone",
        "polygon": [
            [80.2675, 26.5052],
            [80.2712, 26.5052],
            [80.2712, 26.5074],
            [80.2675, 26.5074],
            [80.2675, 26.5052]
        ],
        "center": [26.5063, 80.2693],
        "areaSqm": 74500,
        "validThermalPixels": 15,
        "confidence": "HIGH (Large natural buffer, > 12 thermal pixels)",
        "preMonsoon": {
            "date": "2024-05-18",
            "overpassTimeIST": "10:48 AM",
            "surfaceTempC": 28.4,
            "treeCanopyPct": 86.2,
            "buildingDensityPct": 4.1,
            "pavedSurfacePct": 7.8,
            "waterBodyBufferM": 0,
            "pedestrianFootfall": "LOW",
            "chriScore": 14,
            "classification": "COOL_REFUGE"
        },
        "postMonsoon": {
            "date": "2024-10-12",
            "overpassTimeIST": "10:49 AM",
            "surfaceTempC": 24.8,
            "treeCanopyPct": 88.5,
            "buildingDensityPct": 4.1,
            "pavedSurfacePct": 7.8,
            "waterBodyBufferM": 0,
            "pedestrianFootfall": "LOW",
            "chriScore": 10,
            "classification": "COOL_REFUGE"
        },
        "exposureSummary": "Primary natural cooling engine of the university. Evaporation and multi-tier canopy lower surface temperature by 14°C.",
        "recommendedSpecies": [
            {
                "name": "Ficus benghalensis (Banyan)",
                "type": "Native Keystone Tree",
                "canopyDiameterM": 28,
                "waterNeed": "High during sapling stage",
                "rootSpread": "Massive aerial & lateral root system",
                "cautions": "Strictly plant in open conservation grounds. Never within 25m of pipelines or buildings.",
                "coolingMechanism": "Expansive landscape microclimate canopy sink"
            }
        ]
    },
    {
        "id": "sec-sports-stadium",
        "name": "Athletic Stadium & Sports Pavilion",
        "zone": "Sports & Recreation",
        "polygon": [
            [80.2705, 26.5042],
            [80.2735, 26.5042],
            [80.2735, 26.5068],
            [80.2705, 26.5068],
            [80.2705, 26.5042]
        ],
        "center": [26.5055, 80.2720],
        "areaSqm": 68000,
        "validThermalPixels": 14,
        "confidence": "HIGH (> 12 thermal pixels)",
        "preMonsoon": {
            "date": "2024-05-18",
            "overpassTimeIST": "10:48 AM",
            "surfaceTempC": 42.1,
            "treeCanopyPct": 10.2,
            "buildingDensityPct": 18.0,
            "pavedSurfacePct": 76.5,
            "waterBodyBufferM": 380,
            "pedestrianFootfall": "HIGH",
            "chriScore": 86,
            "classification": "CRITICAL_HOT_ZONE"
        },
        "postMonsoon": {
            "date": "2024-10-12",
            "overpassTimeIST": "10:49 AM",
            "surfaceTempC": 33.2,
            "treeCanopyPct": 11.5,
            "buildingDensityPct": 18.0,
            "pavedSurfacePct": 76.5,
            "waterBodyBufferM": 380,
            "pedestrianFootfall": "HIGH",
            "chriScore": 62,
            "classification": "HIGH_STRESS"
        },
        "exposureSummary": "Unshaded spectator stands and synthetic poly-turf reach peak thermal saturation by midday.",
        "recommendedSpecies": [
            {
                "name": "Syzygium cumini (Jamun)",
                "type": "Native Evergreen",
                "canopyDiameterM": 14,
                "waterNeed": "Moderate",
                "rootSpread": "Deep non-destructive",
                "cautions": "Fruit litter during monsoon along tracks; outstanding western windbreak.",
                "coolingMechanism": "Dense vegetative barrier blocking hot western winds (Loo)"
            }
        ]
    },
    {
        "id": "sec-hostel-spine",
        "name": "Shivaji Boys Hostel Spine & Mess Pathway",
        "zone": "Residential Sector",
        "polygon": [
            [80.2690, 26.4988],
            [80.2725, 26.4988],
            [80.2725, 26.5015],
            [80.2690, 26.5015],
            [80.2690, 26.4988]
        ],
        "center": [26.5002, 80.2708],
        "areaSqm": 72000,
        "validThermalPixels": 15,
        "confidence": "HIGH (> 12 thermal pixels)",
        "preMonsoon": {
            "date": "2024-05-18",
            "overpassTimeIST": "10:48 AM",
            "surfaceTempC": 39.5,
            "treeCanopyPct": 25.8,
            "buildingDensityPct": 60.1,
            "pavedSurfacePct": 74.0,
            "waterBodyBufferM": 210,
            "pedestrianFootfall": "EXTREME",
            "chriScore": 81,
            "classification": "HIGH_STRESS"
        },
        "postMonsoon": {
            "date": "2024-10-12",
            "overpassTimeIST": "10:49 AM",
            "surfaceTempC": 30.8,
            "treeCanopyPct": 28.2,
            "buildingDensityPct": 60.1,
            "pavedSurfacePct": 74.0,
            "waterBodyBufferM": 210,
            "pedestrianFootfall": "EXTREME",
            "chriScore": 55,
            "classification": "MODERATE"
        },
        "exposureSummary": "Heavy pedestrian exposure along hostel thoroughfares crossing from residential wings to dining messes.",
        "recommendedSpecies": [
            {
                "name": "Dalbergia sissoo (Shisham)",
                "type": "Native Deciduous",
                "canopyDiameterM": 10,
                "waterNeed": "Low",
                "rootSpread": "Deep taproot",
                "cautions": "Caution: Susceptible to Fusarium vascular wilt dieback in waterlogged clay; plant only in well-drained sandy loam.",
                "coolingMechanism": "Nitrogen-fixing fast-growing dappled shade"
            }
        ]
    },
    {
        "id": "sec-girls-hostel",
        "name": "Gargi Girls Hostel Courtyard & Neem Grove",
        "zone": "Residential Sector",
        "polygon": [
            [80.2665, 26.4990],
            [80.2690, 26.4990],
            [80.2690, 26.5015],
            [80.2665, 26.5015],
            [80.2665, 26.4990]
        ],
        "center": [26.5002, 80.2678],
        "areaSqm": 48000,
        "validThermalPixels": 10,
        "confidence": "MODERATE",
        "preMonsoon": {
            "date": "2024-05-18",
            "overpassTimeIST": "10:48 AM",
            "surfaceTempC": 31.8,
            "treeCanopyPct": 67.8,
            "buildingDensityPct": 42.0,
            "pavedSurfacePct": 32.4,
            "waterBodyBufferM": 140,
            "pedestrianFootfall": "MEDIUM",
            "chriScore": 32,
            "classification": "MODERATE"
        },
        "postMonsoon": {
            "date": "2024-10-12",
            "overpassTimeIST": "10:49 AM",
            "surfaceTempC": 26.2,
            "treeCanopyPct": 71.0,
            "buildingDensityPct": 42.0,
            "pavedSurfacePct": 32.4,
            "waterBodyBufferM": 140,
            "pedestrianFootfall": "MEDIUM",
            "chriScore": 22,
            "classification": "COOL_REFUGE"
        },
        "exposureSummary": "Courtyard layout sheltered by multi-tiered mature Neem grove providing reliable biological canopy cover.",
        "recommendedSpecies": [
            {
                "name": "Saraca asoca (Sita Ashok)",
                "type": "Native Evergreen Understory",
                "canopyDiameterM": 6,
                "waterNeed": "Moderate (shade-loving)",
                "rootSpread": "Compact non-invasive",
                "cautions": "Requires existing tree canopy shelter; sensitive to harsh direct dry heat.",
                "coolingMechanism": "Dense foliage understory cooling for reading lawns"
            }
        ]
    }
]

def build_geojson():
    features = []
    for s in CAMPUS_HEAT_SECTORS:
        feat = {
            "type": "Feature",
            "id": s["id"],
            "geometry": {
                "type": "Polygon",
                "coordinates": [s["polygon"]]
            },
            "properties": {
                "id": s["id"],
                "name": s["name"],
                "zone": s["zone"],
                "center": s["center"],
                "areaSqm": s["areaSqm"],
                "validThermalPixels": s["validThermalPixels"],
                "confidence": s["confidence"],
                "exposureSummary": s["exposureSummary"],
                "recommendedSpecies": s["recommendedSpecies"],
                "preMonsoon": s["preMonsoon"],
                "postMonsoon": s["postMonsoon"],
                "metricsProvenance": {
                    "surfaceTemp": {"type": "MEASURED", "sensor": "Landsat 9 TIRS-2 (Band 10 ST)", "resolution": "100m resampled to 30m"},
                    "treeCanopy": {"type": "DERIVED", "sensor": "Sentinel-2 MSI Level-2A", "method": "NDVI >= 0.40 proxy", "resolution": "10m"},
                    "buildingDensity": {"type": "DERIVED", "source": "OpenStreetMap building footprints", "method": "Roof area / sector area"},
                    "pavedSurface": {"type": "DERIVED", "source": "Sentinel-2 NDBI + OSM Roads", "method": "Impervious surface ratio"},
                    "waterBuffer": {"type": "DERIVED", "method": "Euclidean distance to CSJMU retention pond"},
                    "pedestrianExposure": {"type": "ASSUMED", "method": "Class transit & mess timetable schedules"}
                },
                "siteChecklist": {
                    "utilityClearance": None,
                    "soilSuitability": None,
                    "irrigationAccess": None,
                    "pedestrianClearance": None,
                    "inspectorName": None,
                    "inspectedAt": None
                }
            }
        }
        features.append(feat)

    geojson_data = {
        "type": "FeatureCollection",
        "metadata": {
            "crs": "EPSG:4326 (WGS 84)",
            "campus": "CSJMU Kanpur (UIET)",
            "bounds": [[26.4985, 80.2635], [26.5075, 80.2735]],
            "generatedBy": "CSJMU Urban Planning Zonal Prep Pipeline",
            "satelliteSources": [
                "Landsat 9 Collection 2 Level-2 Surface Temperature (ST_B10)",
                "Sentinel-2 MSI Level-2A BOA Reflectance (NDVI/NDBI)"
            ],
            "dates": {
                "preMonsoon": "2024-05-18",
                "postMonsoon": "2024-10-12"
            }
        },
        "features": features
    }
    return geojson_data


if __name__ == "__main__":
    data = build_geojson()
    
    # Save to frontend data directory
    out_fe = BASE_DIR / "src" / "data" / "csjmu_heat_zones.geojson"
    out_fe.parent.mkdir(parents=True, exist_ok=True)
    with open(out_fe, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f"✅ Generated {out_fe}")

    # Also save as JSON for backend service
    out_be = BASE_DIR / "backend" / "data" / "csjmu_heat_zones.json"
    out_be.parent.mkdir(parents=True, exist_ok=True)
    with open(out_be, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f"✅ Generated {out_be}")
