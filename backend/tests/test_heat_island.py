"""
Unit Tests for CSJMU Campus Heat Island (UHI) Analytics Service & What-If Simulator
Verifies data honesty, empirical bounded ranges, provenance classification, and saturation caps.
"""

import unittest
from heat_island_service import CampusHeatIslandService


class TestHeatIslandService(unittest.TestCase):
    def setUp(self):
        self.service = CampusHeatIslandService()

    def test_sectors_loading_pre_and_post_monsoon(self):
        """Verify sectors load with authentic satellite metrics and season changes."""
        pre_sectors = self.service.get_sectors(season="pre_monsoon")
        post_sectors = self.service.get_sectors(season="post_monsoon")

        self.assertEqual(len(pre_sectors), 8, "Expected 8 official CSJMU campus sectors")
        self.assertEqual(len(post_sectors), 8)

        # Pre-monsoon temperatures (May peak) must be higher than post-monsoon (October)
        uiet_pre = next(s for s in pre_sectors if s["id"] == "sec-uiet-courtyard")
        uiet_post = next(s for s in post_sectors if s["id"] == "sec-uiet-courtyard")

        self.assertGreater(uiet_pre["metrics"]["surfaceTempC"], uiet_post["metrics"]["surfaceTempC"])
        self.assertEqual(uiet_pre["acquisitionDate"], "2024-05-18")
        self.assertEqual(uiet_post["acquisitionDate"], "2024-10-12")

        # Verify provenance keys
        self.assertIn("metricsProvenance", uiet_pre)
        self.assertEqual(uiet_pre["metricsProvenance"]["surfaceTemp"]["type"], "MEASURED")
        self.assertEqual(uiet_pre["metricsProvenance"]["treeCanopy"]["type"], "DERIVED")

    def test_summary_metrics_computation(self):
        """Verify summary metrics are accurately computed from individual sector metrics."""
        summary = self.service.get_summary_metrics(season="pre_monsoon")
        sectors = self.service.get_sectors(season="pre_monsoon")

        temps = [s["metrics"]["surfaceTempC"] for s in sectors]
        expected_avg = round(sum(temps) / len(temps), 1)
        expected_peak = max(temps)
        expected_cool = min(temps)
        expected_delta = round(expected_peak - expected_cool, 1)

        self.assertEqual(summary["avgSurfaceTempC"], expected_avg)
        self.assertEqual(summary["peakHotZoneTempC"], expected_peak)
        self.assertEqual(summary["coolOasisTempC"], expected_cool)
        self.assertEqual(summary["uhiDeltaRangeC"], expected_delta)
        self.assertGreater(summary["criticalHotZonesCount"], 0)
        self.assertIn("Landsat 9", summary["thermalSensor"])

    def test_simulator_bounded_ranges_and_caps(self):
        """Verify What-If simulator produces bounded [min, max] intervals with physical saturation caps."""
        # Test 1: Moderate intervention
        res = self.service.simulate_mitigation(
            sector_id="sec-uiet-courtyard",
            added_trees=20,
            cool_pave_sqm=300,
            shade_sqm=150,
            season="pre_monsoon"
        )

        min_drop, max_drop = res["totalLSTDropRangeC"]
        self.assertLessEqual(min_drop, max_drop)
        self.assertGreater(min_drop, 0.0)

        # Output temperatures must be lower than base
        proj_min, proj_max = res["projectedSurfaceTempRangeC"]
        self.assertLess(proj_min, res["currentSurfaceTempLST_C"])
        self.assertLess(proj_max, res["currentSurfaceTempLST_C"])

        # Check ambient air temperature caveat
        self.assertIn("airTempNote", res)
        self.assertIn("30-50%", res["airTempNote"])

        # Test 2: Extreme intervention - physical saturation cap must prevent unrealistic drops
        extreme_res = self.service.simulate_mitigation(
            sector_id="sec-uiet-courtyard",
            added_trees=500,        # massive trees
            cool_pave_sqm=50000,    # massive pavement
            shade_sqm=10000,        # massive shade
            season="pre_monsoon"
        )
        ext_min, ext_max = extreme_res["totalLSTDropRangeC"]
        self.assertLessEqual(ext_max, 7.0, "Total surface LST drop must not exceed scientific cap of 7.0°C")
        self.assertLessEqual(ext_min, 5.5, "Total min drop must obey upper bound cap")

    def test_simulator_literature_sources_included(self):
        """Verify all returned simulation results cite peer-reviewed literature with DOIs."""
        res = self.service.simulate_mitigation(
            sector_id="sec-workshop-yard",
            added_trees=10,
            cool_pave_sqm=100,
            shade_sqm=50
        )
        sources = res.get("literatureSources", [])
        self.assertEqual(len(sources), 3)

        measures = {s["measure"] for s in sources}
        self.assertIn("Tree Canopy", measures)
        self.assertIn("Cool Pavement", measures)
        self.assertIn("Architectural Shade", measures)

        for src in sources:
            self.assertTrue(src["doi"].startswith("10.") or src["doi"].startswith("http"))

    def test_botanical_species_and_cautions(self):
        """Verify botanical recommendations contain authentic silvicultural cautions."""
        sectors = self.service.get_sectors()
        hostel = next(s for s in sectors if s["id"] == "sec-hostel-spine")
        
        species_names = [sp["name"] for sp in hostel.get("recommendedSpecies", [])]
        self.assertTrue(any("Shisham" in name or "sissoo" in name for name in species_names))

        shisham = next(sp for sp in hostel["recommendedSpecies"] if "sissoo" in sp["name"])
        self.assertIn("dieback", shisham["cautions"].lower())


if __name__ == "__main__":
    unittest.main()
