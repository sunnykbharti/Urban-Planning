# CSJMU Kanpur (UIET) Civic Operations — CCTV Backend Service

Automated campus waste & solid waste management (SWM) pipeline for university surveillance networks.
Designed for a **standard university machine** (i5/i7, 8 GB RAM, CPU only, no GPU, offline-capable, Windows or Linux) connecting to university CCTV cameras (Hikvision/ISAPI HTTP snapshots + RTSP H.264 sub-streams).

---

## 1. System Architecture

The pipeline executes an automated 8-stage civic operations flow:

```
[4 Stratified Sweeps/Day] (Asia/Kolkata: 06-10, 10-14, 14-18, 18-22 with 25-min edge buffer)
          │
          ▼
1. FrameSource: ISAPI HTTP Snapshot (primary) / RTSP Sub-stream Fallback (cv2.VideoCapture)
   ├── Grabs 1 frame and releases immediately (zero stream leaks)
   └── Quality Filter: Rejects blackout, over-exposure, blur (Laplacian var < 50), flags IR/night
          │
          ▼
2. Temporal Burst: 3 frames (~6s apart)
          │
          ▼
3. ONNX Runtime CPU Detection:
   ├── Model: YOLO ONNX on CPU (models/yolov8n.onnx)
   ├── 640x640 overlapping tiling + NMS for small litter in wide-angle shots
   └── Camera ROI polygon filter (ignores roads and sky)
          │
          ▼
4. Temporal Confirmation: Detection must appear in ≥ 2 of 3 burst frames (IoU ≥ 0.30)
          │
          ▼
5. Privacy Anonymization: OpenCV face/person blur before persisting to captures/
          │
          ▼
6. Decision Engine & Deduplication:
   ├── Duplicate = same camera AND same detection class (or same zone + class)
   ├── Configurable 48h ticket expiry (prevents blocking cameras forever)
   └── Clean frame records CLEAN_RECORDED
          │
          ▼
7. Honest Estimation: Volumetric coverage based on camera height & meters-per-pixel calibration
          │
          ▼
8. Stage 8 Verification: Reopening tickets if cleanup failed on subsequent sweep
```

---

## 2. Server Installation (Vanilla 8GB RAM / CPU-Only)

### Prerequisites:
- Python 3.9+ (Windows, Linux, or macOS)
- Standard university network connection to camera IP subnet (e.g. `10.20.x.x`)

### Setup:
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install lean runtime dependencies (No PyTorch/TensorFlow in runtime)
pip install -r requirements.txt
```

---

## 3. Configuration: Real Mode vs DEMO_MODE

Copy the configuration templates:
```bash
cp config.yaml.example config.yaml
cp .env.example .env
```

### Real CCTV Mode:
In `config.yaml`:
```yaml
system:
  demo_mode: false       # Uses real camera ISAPI / RTSP endpoints
  timezone: "Asia/Kolkata"
  random_seed: 42
  device: "cpu"
```
In `.env`:
```ini
CCTV_USER=admin
CCTV_PASS=YourCampusCameraPassword
PORT=5001
```

### DEMO Mode (Offline / Simulated):
If physical university cameras are unreachable or you are developing on a laptop:
In `config.yaml`:
```yaml
system:
  demo_mode: true        # Falls back to sample images with visible simulated: true flag
```
When running in `demo_mode: true`:
- Every pipeline execution log explicitly includes `"simulated": true`.
- Every ticket payload reports `"aiModel": "SIMULATED_DEMO_ENGINE"`.
- The system **never silently simulates**.

---

## 4. Running the Backend Service

```bash
python3 app.py
```
- API will start on `http://127.0.0.1:5001`.
- The persistent stratified sweep scheduler starts automatically as a background daemon in the `Asia/Kolkata` timezone.
- Daily sweep times are saved to `data/cctv_sweeps_schedule.json`.

---

## 5. Running the Unit Tests

Execute the automated test suite covering sweep generation, blur/darkness filters, IoU/NMS, temporal burst confirmation, deduplication, and dead camera timeout handling:

```bash
python3 tests/test_cctv_pipeline.py
```

Expected output:
```
Ran 16 tests in ~2.7s
OK
```
