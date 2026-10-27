"""
CCTV Frame Acquisition Module (FrameSource).
Standard University Deployment: Hikvision/ISAPI HTTP Snapshots + RTSP Sub-stream Fallback.
CPU-only, memory-efficient (single-frame grab-and-release), bad-frame rejection, thread-pooled sweeps.
"""

import os
import time
import logging
import urllib.request
import urllib.error
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass
from concurrent.futures import ThreadPoolExecutor, as_completed
import numpy as np
import cv2

logger = logging.getLogger("cctv_frame_source")
if not logger.handlers:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")


@dataclass
class FrameQualityResult:
    is_valid: bool
    reason: Optional[str]
    is_night_ir: bool
    laplacian_var: float
    mean_luminance: float


def evaluate_frame_quality(
    frame: np.ndarray,
    min_laplacian_var: float = 50.0,
    min_mean_luminance: float = 25.0,
    max_mean_luminance: float = 240.0
) -> FrameQualityResult:
    """
    Evaluates frame quality:
    - Black / severely dark frames rejected (luminance < 10)
    - Night / low-light IR frames flagged (luminance < min_mean_luminance)
    - Over-exposed / whiteout frames rejected (luminance > max_mean_luminance)
    - Motion-blurred or out-of-focus frames rejected (Laplacian variance < min_laplacian_var)
    """
    if frame is None or frame.size == 0:
        return FrameQualityResult(
            is_valid=False,
            reason="Empty frame buffer",
            is_night_ir=False,
            laplacian_var=0.0,
            mean_luminance=0.0
        )

    # Convert to grayscale for metric calculations
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY) if len(frame.shape) == 3 else frame
    mean_lum = float(np.mean(gray))
    lap_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())

    # Critical blackout
    if mean_lum < 10.0:
        return FrameQualityResult(
            is_valid=False,
            reason="Blackout frame (luminance < 10)",
            is_night_ir=True,
            laplacian_var=lap_var,
            mean_luminance=mean_lum
        )

    # Over-exposed frame
    if mean_lum > max_mean_luminance:
        return FrameQualityResult(
            is_valid=False,
            reason=f"Over-exposed frame (luminance {mean_lum:.1f} > {max_mean_luminance})",
            is_night_ir=False,
            laplacian_var=lap_var,
            mean_luminance=mean_lum
        )

    # Night / IR low illumination flag
    is_night_ir = (mean_lum < min_mean_luminance)

    # Severe blur check (only reject for blur if not night IR, as IR noise lowers gradient)
    if not is_night_ir and lap_var < min_laplacian_var:
        return FrameQualityResult(
            is_valid=False,
            reason=f"Blurred frame (Laplacian variance {lap_var:.1f} < {min_laplacian_var})",
            is_night_ir=is_night_ir,
            laplacian_var=lap_var,
            mean_luminance=mean_lum
        )

    return FrameQualityResult(
        is_valid=True,
        reason=None if not is_night_ir else "Night / Low-light IR operational frame",
        is_night_ir=is_night_ir,
        laplacian_var=lap_var,
        mean_luminance=mean_lum
    )


class CctvFrameSource:
    """
    Handles reliable, lightweight frame acquisition for campus CCTV networks.
    Never holds connections open between sweeps.
    """

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        acq_cfg = self.config.get("frame_acquisition", {})
        self.conn_timeout = acq_cfg.get("connection_timeout_seconds", 4)
        self.read_timeout = acq_cfg.get("read_timeout_seconds", 4)
        self.max_retries = acq_cfg.get("max_retries", 2)
        self.backoff_s = acq_cfg.get("backoff_seconds", 0.5)
        
        q_cfg = acq_cfg.get("quality_filter", {})
        self.min_laplacian_var = q_cfg.get("min_laplacian_variance", 50.0)
        self.min_mean_luminance = q_cfg.get("min_mean_luminance", 25.0)
        self.max_mean_luminance = q_cfg.get("max_mean_luminance", 240.0)

        # Credentials fallback
        cred_cfg = self.config.get("credentials", {})
        self.default_user = os.environ.get("CCTV_USER", cred_cfg.get("default_username", "admin"))
        self.default_pass = os.environ.get("CCTV_PASS", cred_cfg.get("default_password", "pass123"))

    def build_isapi_uri(self, camera: Dict[str, Any]) -> str:
        """Returns snapshot URI formatted for camera."""
        if camera.get("snapshotUri"):
            return camera["snapshotUri"]
        ip = camera.get("ipAddress", "127.0.0.1")
        channel = camera.get("channelId", "101")
        return f"http://{ip}/ISAPI/Streaming/channels/{channel}/picture"

    def build_rtsp_uri(self, camera: Dict[str, Any]) -> str:
        """Returns RTSP URI with credentials safely injected."""
        ip = camera.get("ipAddress", "127.0.0.1")
        channel = camera.get("channelId", "102")
        return f"rtsp://{self.default_user}:{self.default_pass}@{ip}:554/Streaming/Channels/{channel}"

    def grab_isapi_snapshot(self, camera: Dict[str, Any]) -> Optional[np.ndarray]:
        """
        Lightest snapshot grab via HTTP ISAPI picture endpoint.
        Returns decoded BGR numpy image or None on failure.
        """
        uri = self.build_isapi_uri(camera)
        
        # Setup basic/digest authentication password manager
        pass_mgr = urllib.request.HTTPPasswordMgrWithDefaultRealm()
        pass_mgr.add_password(None, uri, self.default_user, self.default_pass)
        auth_handler = urllib.request.HTTPDigestAuthHandler(pass_mgr)
        basic_handler = urllib.request.HTTPBasicAuthHandler(pass_mgr)
        opener = urllib.request.build_opener(auth_handler, basic_handler)

        req = urllib.request.Request(
            uri,
            headers={"User-Agent": "CSJMU-CivicOps-CctvWorker/1.0"}
        )

        try:
            with opener.open(req, timeout=self.conn_timeout) as response:
                if response.status == 200:
                    data = response.read()
                    if data:
                        np_arr = np.frombuffer(data, dtype=np.uint8)
                        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
                        if frame is not None and frame.size > 0:
                            return frame
        except Exception as e:
            logger.debug(f"[{camera.get('id')}] ISAPI snapshot failed: {e}")
            return None

        return None

    def grab_rtsp_substream_frame(self, camera: Dict[str, Any]) -> Optional[np.ndarray]:
        """
        Sub-stream RTSP fallback: opens cv2.VideoCapture, grabs exactly 1 frame,
        and releases immediately to avoid network/memory leakage.
        """
        uri = self.build_rtsp_uri(camera)
        cap = None
        try:
            # Configure OpenCV FFMPEG transport via environment/properties with strict timeout
            timeout_us = int(self.conn_timeout * 1000000)
            os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = f"rtsp_transport;tcp|stimeout;{timeout_us}"
            cap = cv2.VideoCapture(uri, cv2.CAP_FFMPEG)
            
            # Set connection and read timeouts if supported by backend build
            try:
                cap.set(cv2.CAP_PROP_OPEN_TIMEOUT_MSEC, int(self.conn_timeout * 1000))
                cap.set(cv2.CAP_PROP_READ_TIMEOUT_MSEC, int(self.read_timeout * 1000))
            except Exception:
                pass

            if not cap.isOpened():
                return None

            ret, frame = cap.read()
            if ret and frame is not None and frame.size > 0:
                return frame
        except Exception as e:
            logger.debug(f"[{camera.get('id')}] RTSP grab failed: {e}")
            return None
        finally:
            if cap is not None:
                cap.release()

        return None

    def acquire_single_frame(
        self,
        camera: Dict[str, Any]
    ) -> Tuple[Optional[np.ndarray], FrameQualityResult, str]:
        """
        Attempts acquisition (ISAPI -> RTSP) with retries and quality validation.
        Returns: (frame, quality_eval, source_method)
        """
        last_eval = FrameQualityResult(False, "Not attempted", False, 0.0, 0.0)

        for attempt in range(self.max_retries + 1):
            # 1. Try ISAPI HTTP Snapshot
            frame = self.grab_isapi_snapshot(camera)
            method = "HTTP_ISAPI"

            # 2. Fallback to RTSP Sub-stream
            if frame is None:
                frame = self.grab_rtsp_substream_frame(camera)
                method = "RTSP_SUBSTREAM"

            # 3. Evaluate frame quality
            if frame is not None:
                q_eval = evaluate_frame_quality(
                    frame,
                    min_laplacian_var=self.min_laplacian_var,
                    min_mean_luminance=self.min_mean_luminance,
                    max_mean_luminance=self.max_mean_luminance
                )
                if q_eval.is_valid:
                    return frame, q_eval, method
                else:
                    last_eval = q_eval
                    logger.warning(
                        f"[{camera.get('id')}] Attempt {attempt+1}: Frame rejected: {q_eval.reason}"
                    )
            else:
                last_eval = FrameQualityResult(False, "Camera connection failed / unreachable", False, 0.0, 0.0)

            if attempt < self.max_retries:
                time.sleep(self.backoff_s * (attempt + 1))

        return None, last_eval, "NONE"

    def acquire_burst(
        self,
        camera: Dict[str, Any],
        burst_size: int = 3,
        interval_seconds: float = 6.0
    ) -> List[Tuple[np.ndarray, FrameQualityResult, str, float]]:
        """
        Acquires a temporal burst of frames for multi-frame confirmation.
        Returns list of tuples: (frame, quality, method, timestamp_offset)
        """
        burst_results = []
        for i in range(burst_size):
            t_start = time.time()
            frame, q_eval, method = self.acquire_single_frame(camera)
            if frame is not None:
                burst_results.append((frame, q_eval, method, float(i * interval_seconds)))
            
            # Wait for interval if more frames needed
            if i < burst_size - 1:
                elapsed = time.time() - t_start
                sleep_time = max(0.1, interval_seconds - elapsed)
                time.sleep(sleep_time)

        return burst_results

    def process_cameras_in_parallel(
        self,
        cameras: List[Dict[str, Any]],
        max_workers: int = 4
    ) -> Dict[str, Dict[str, Any]]:
        """
        Captures single frame from all cameras concurrently using ThreadPoolExecutor.
        Updates camera['status'] to 'ONLINE' or 'OFFLINE' based on real acquisition.
        """
        results: Dict[str, Dict[str, Any]] = {}

        def _task(cam):
            cid = cam.get("id", "UNKNOWN")
            t0 = time.time()
            frame, q_eval, method = self.acquire_single_frame(cam)
            latency_ms = int((time.time() - t0) * 1000)
            
            # Update camera dictionary status in-place
            if frame is not None and q_eval.is_valid:
                cam["status"] = "ONLINE"
                return cid, {
                    "success": True,
                    "frame": frame,
                    "quality": q_eval,
                    "method": method,
                    "latencyMs": latency_ms,
                    "camera": cam
                }
            else:
                cam["status"] = "OFFLINE"
                logger.error(f"Camera [{cid}] is OFFLINE: {q_eval.reason}")
                return cid, {
                    "success": False,
                    "frame": None,
                    "quality": q_eval,
                    "method": "FAILED",
                    "latencyMs": latency_ms,
                    "camera": cam
                }

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_cam = {executor.submit(_task, cam): cam for cam in cameras}
            for future in as_completed(future_to_cam):
                try:
                    cid, res = future.result()
                    results[cid] = res
                except Exception as exc:
                    cam = future_to_cam[future]
                    cid = cam.get("id", "UNKNOWN")
                    cam["status"] = "OFFLINE"
                    results[cid] = {
                        "success": False,
                        "frame": None,
                        "quality": FrameQualityResult(False, str(exc), False, 0.0, 0.0),
                        "method": "EXCEPTION",
                        "latencyMs": 0,
                        "camera": cam
                    }

        return results
