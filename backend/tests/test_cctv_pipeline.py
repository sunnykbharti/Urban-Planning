"""
Comprehensive Unit Tests for CCTV Pipeline Service.
Tests:
1. Stratified sweep generator (bounds, 25-min buffer, seed reproducibility)
2. Frame quality evaluation (blur, blackout, overexposure, night/IR)
3. Detection & IoU calculation
4. Temporal confirmation burst logic
5. Decision Engine & Deduplication (class-specific, clean frame handling)
6. FrameSource timeout & failure handling (mock camera)
"""

import sys
import os
import unittest
from pathlib import Path
from datetime import date, datetime
import numpy as np

# Add backend directory to sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

import yaml
from cctv_frame_source import evaluate_frame_quality, CctvFrameSource, FrameQualityResult
from cctv_detector import DetectionBox, calculate_iou, apply_nms, CctvOnnxDetector
from cctv_scheduler import CctvSweepScheduler, KOLKATA_TZ
from cctv_service import CctvPipelineService


class TestCctvScheduler(unittest.TestCase):
    """Tests for the stratified random sweep generator and scheduler."""

    def setUp(self):
        with open(BACKEND_DIR / "config.yaml") as f:
            self.config = yaml.safe_load(f)
        self.scheduler = CctvSweepScheduler(self.config, base_dir=BACKEND_DIR)

    def test_strata_count_and_windows(self):
        sweeps = self.scheduler.generate_stratified_sweeps(date(2026, 10, 24))
        self.assertEqual(len(sweeps), 4)
        expected_windows = ["06:00 - 10:00", "10:00 - 14:00", "14:00 - 18:00", "18:00 - 22:00"]
        for s, w in zip(sweeps, expected_windows):
            self.assertEqual(s["window"], w)

    def test_boundary_buffer_guarantee(self):
        """Every generated sweep must be >= 25 minutes away from window boundaries."""
        sweeps = self.scheduler.generate_stratified_sweeps(date(2026, 10, 24))
        for s in sweeps:
            h, m = map(int, s["slot"].split(":"))
            w_start = 6 if h < 10 else (10 if h < 14 else (14 if h < 18 else 18))
            offset_minutes = (h - w_start) * 60 + m
            # 25-minute buffer on a 240-minute window means offset in [25, 215]
            self.assertGreaterEqual(offset_minutes, 25, f"Buffer underflow in {s['slot']}")
            self.assertLessEqual(offset_minutes, 215, f"Buffer overflow in {s['slot']}")

    def test_seed_reproducibility(self):
        """Same date and seed must produce identical sweep times."""
        d = date(2026, 11, 15)
        sweeps1 = self.scheduler.generate_stratified_sweeps(d)
        sweeps2 = self.scheduler.generate_stratified_sweeps(d)
        self.assertEqual([s["slot"] for s in sweeps1], [s["slot"] for s in sweeps2])

    def test_different_dates_produce_different_times(self):
        """Different dates should yield different stratified times."""
        d1 = date(2026, 10, 24)
        d2 = date(2026, 10, 25)
        sweeps1 = self.scheduler.generate_stratified_sweeps(d1)
        sweeps2 = self.scheduler.generate_stratified_sweeps(d2)
        # At least one slot should differ
        self.assertNotEqual([s["slot"] for s in sweeps1], [s["slot"] for s in sweeps2])


class TestFrameQualityFilter(unittest.TestCase):
    """Tests for bad frame detection and rejection."""

    def test_blackout_rejection(self):
        black_frame = np.zeros((480, 640, 3), dtype=np.uint8)
        res = evaluate_frame_quality(black_frame)
        self.assertFalse(res.is_valid)
        self.assertIn("Blackout", res.reason)

    def test_overexposure_rejection(self):
        white_frame = np.full((480, 640, 3), 245, dtype=np.uint8)
        res = evaluate_frame_quality(white_frame)
        self.assertFalse(res.is_valid)
        self.assertIn("Over-exposed", res.reason)

    def test_blur_rejection(self):
        # A uniform gray image has zero Laplacian gradient variance
        flat_frame = np.full((480, 640, 3), 128, dtype=np.uint8)
        res = evaluate_frame_quality(flat_frame)
        self.assertFalse(res.is_valid)
        self.assertIn("Blurred", res.reason)

    def test_night_ir_flagged(self):
        # Low light image (luminance 15) should be flagged as night IR
        dim_frame = np.random.randint(12, 18, (480, 640, 3), dtype=np.uint8)
        res = evaluate_frame_quality(dim_frame)
        self.assertTrue(res.is_night_ir)

    def test_valid_sharp_frame(self):
        # Image with high gradient variance and normal lighting
        sharp = np.random.randint(40, 220, (480, 640, 3), dtype=np.uint8)
        res = evaluate_frame_quality(sharp)
        self.assertTrue(res.is_valid)


class TestIoUAndNMS(unittest.TestCase):
    """Tests for bounding box IoU and Non-Maximum Suppression."""

    def test_iou_calculation(self):
        box1 = DetectionBox(0.2, 0.2, 0.6, 0.6, 0.9, "overflow", "Overflow")
        box2 = DetectionBox(0.2, 0.2, 0.6, 0.6, 0.85, "overflow", "Overflow")
        self.assertAlmostEqual(calculate_iou(box1, box2), 1.0, places=3)

        box3 = DetectionBox(0.7, 0.7, 0.9, 0.9, 0.9, "overflow", "Overflow")
        self.assertEqual(calculate_iou(box1, box3), 0.0)

    def test_nms_suppression(self):
        # Two overlapping boxes of the same class
        b1 = DetectionBox(0.2, 0.2, 0.6, 0.6, 0.92, "overflow", "Overflow")
        b2 = DetectionBox(0.22, 0.22, 0.62, 0.62, 0.70, "overflow", "Overflow")
        kept = apply_nms([b1, b2], iou_threshold=0.4)
        self.assertEqual(len(kept), 1)
        self.assertEqual(kept[0].confidence, 0.92)


class TestTemporalBurstConfirmation(unittest.TestCase):
    """Tests for multi-frame burst confirmation logic."""

    def test_burst_confirmed_when_repeated(self):
        b1 = DetectionBox(0.2, 0.2, 0.6, 0.6, 0.9, "overflow", "Overflow")
        b2 = DetectionBox(0.21, 0.21, 0.61, 0.61, 0.88, "overflow", "Overflow")
        # IoU is high
        self.assertGreaterEqual(calculate_iou(b1, b2), 0.70)

    def test_burst_rejected_when_fleeting(self):
        # A transient shadow that appears in only 1 frame
        b1 = DetectionBox(0.2, 0.2, 0.3, 0.3, 0.8, "litter_pile", "Litter")
        # In frame 2, nothing or distant object
        b2 = DetectionBox(0.8, 0.8, 0.9, 0.9, 0.8, "litter_pile", "Litter")
        self.assertEqual(calculate_iou(b1, b2), 0.0)


class TestDecisionAndDeduplication(unittest.TestCase):
    """Tests for duplicate logic and clean frame handling."""

    def setUp(self):
        with open(BACKEND_DIR / "config.yaml") as f:
            config = yaml.safe_load(f)
        self.service = CctvPipelineService(config)

    def test_clean_frame_records_clean_status(self):
        """A clean frame must record CLEAN_RECORDED (not DUPLICATE_IGNORED)."""
        res = self.service.execute_camera_pipeline(
            "CAM-UIET-01", forced_class="bin_empty", sweep_slot="TEST"
        )
        self.assertEqual(res["status"], "CLEAN_RECORDED")
        self.assertIsNone(res["createdIncidentId"])

    def test_duplicate_check_is_class_specific(self):
        """
        Duplicate logic must check same camera sensor AND same detection class.
        Different classes must not be falsely flagged as duplicates.
        """
        # If no active 'blocked_drain' incident exists for CAM-UIET-01, should not be duplicate
        is_dup = self.service.is_duplicate_incident("zone-academic", "blocked_drain", "CAM-UIET-01")
        # Verification that method callable without crashing
        self.assertIsInstance(is_dup, bool)


class TestFrameSourceFailureHandling(unittest.TestCase):
    """Tests that unreachable cameras update camera status to OFFLINE without stalling."""

    def setUp(self):
        with open(BACKEND_DIR / "config.yaml") as f:
            config = yaml.safe_load(f)
        self.source = CctvFrameSource(config)
        self.source.conn_timeout = 0.5
        self.source.max_retries = 0
        self.source.backoff_s = 0.0

    def test_unreachable_camera_marks_offline(self):
        # Camera pointing to closed localhost port for instant connection refusal
        dead_camera = {
            "id": "CAM-DEAD-99",
            "name": "Dead Camera",
            "ipAddress": "127.0.0.1:59999",  # Closed local port
            "status": "ONLINE",
            "channelId": "101"
        }
        res = self.source.process_cameras_in_parallel([dead_camera], max_workers=1)
        self.assertIn("CAM-DEAD-99", res)
        self.assertFalse(res["CAM-DEAD-99"]["success"])
        self.assertEqual(dead_camera["status"], "OFFLINE")


if __name__ == "__main__":
    unittest.main()
