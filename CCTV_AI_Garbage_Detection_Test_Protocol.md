# CCTV AI Garbage Detection Pipeline: Human Verification Test Protocol

**Document Version:** 1.0.0  
**Target System:** CSJMU Urban Planning & Civic Operations System (Campusr)  
**Modules Tested:**
- Frame Acquisition & Quality Filtering (`backend/cctv_frame_source.py`)
- ONNX CPU Detection & Tiling Engine (`backend/cctv_detector.py`)
- CCTV Pipeline & Temporal Confirmation (`backend/cctv_service.py`)
- Authority Resolution & Dispatch Engine (`backend/authority_engine.py`)

---

## 1. Test Objectives & Scope
The objective of this protocol is to provide a human-executable standard operating procedure (SOP) to validate:
1. **6-Class Computer Vision Classification**: Correct identification of `overflow`, `litter_pile`, `blocked_drain`, `bin_full`, `bin_partial`, and `bin_empty`.
2. **False Positive Elimination**: Rejection of transient moving objects (pedestrians, vehicles, animals) via **3-Frame Temporal Burst Confirmation** (~6s interval, IoU $\ge 0.30$, minimum 2 matching frames).
3. **Region of Interest (ROI) Masking**: Ignoring visual noise and background clutter (roads, sky, external boundary) outside the camera's defined polygon.
4. **Optical Quality Filtering**: Automatic rejection of blacked-out, over-exposed, or motion-blurred camera frames.
5. **Privacy Anonymization**: 100% facial and human silhouette blurring prior to capture storage or ticket attachment.
6. **Closed-Loop Verification**: Before vs. After cleanup photo analysis to ensure accountability before closing tickets.

---

## 2. Test Environment Setup
- **Web Portal URL**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://127.0.0.1:5001](http://127.0.0.1:5001)
- **Primary Test Accounts**:
  - **Super Admin**: `admin` / PIN: `9999` (Access to CCTV Sweeps & Model Analytics)
  - **Developer**: `developer` / PIN: `0000` (Access to Raw Inference, Embeddings & Telemetry)
  - **BVG Field Worker**: `bvg` / PIN: `1234` (Access to Work Orders & Verification Upload)

---

## 3. Test Phase 1: Classification & Confidence Thresholds

Verify that the YOLOv8 model detects each waste category and enforces strict confidence cutoffs.

| Test Case | Scenario / Input Image | Expected Classification | Required Confidence | Expected Severity & Action |
|:---|:---|:---|:---|:---|
| **TC-1.1** | Solid waste spilling over the bin rim onto surrounding ground | `overflow` | $\ge 0.60$ (60%) | Priority: **HIGH**<br>Action: Dispatch 2-person BVG team with wheelbarrow within 45 mins. |
| **TC-1.2** | Scattered plastic bottles, single-use cups, and wrappers on ground | `litter_pile` | $\ge 0.55$ (55%) | Priority: **HIGH**<br>Action: Manual sweeping squad with litter pickers. |
| **TC-1.3** | Storm water drain grate covered with silt, polythene, or wet debris | `blocked_drain` | $\ge 0.55$ (55%) | Priority: **CRITICAL**<br>Action: Immediate desilting squad with suction equipment. |
| **TC-1.4** | Waste level reaching within 5 cm of the top rim of bin | `bin_full` | $\ge 0.65$ (65%) | Priority: **MEDIUM**<br>Action: Routine compactor truck round within 90 mins. |
| **TC-1.5** | Normal day-to-day bin fill level (25% to 50% capacity) | `bin_partial` | $\ge 0.60$ (60%) | Priority: **LOW**<br>**No ticket dispatched** (Status recorded as routine). |
| **TC-1.6** | Empty receptacle and clean pavement within 2m radius | `bin_empty` | $\ge 0.70$ (70%) | Recorded as `CLEAN_RECORDED`. **Zero tickets generated**. |

### Human Execution Steps:
1. Log in to the portal as **Developer** (`developer` / `0000`) and navigate to **Developer Hub** or **Live CCTV Feed**.
2. Upload / feed the test image corresponding to each test case.
3. Verify that the displayed bounding box correctly outlines the object and matches the expected label.
4. Verify that detections falling below the confidence threshold are discarded.

---

## 4. Test Phase 2: False Positive Elimination (Temporal 3-Frame Burst)

CCTV cameras experience heavy transient movement (students walking with bags, stray animals, service vehicles). The system captures 3 frames spaced ~6 seconds apart ($t=0\text{s}, 6\text{s}, 12\text{s}$) and requires confirmation in $\ge 2$ frames with bounding box $\text{IoU} \ge 0.30$.

```
Temporal Confirmation Logic:
Frame 1 (t = 0s)      ──► Detection Candidate Box A
Frame 2 (t = 6s)      ──► Detection Candidate Box B  ──► Calculate IoU(A, B) >= 0.30?
Frame 3 (t = 12s)     ──► Detection Candidate Box C  ──► Calculate IoU(A, C) >= 0.30?
Result: Confirmed count >= 2 ? TICKET DISPATCHED : REJECTED AS TRANSIENT
```

### Scenario A: Transient Moving Object (Pedestrian / Passing Bag)
1. **Action**: Present a scene where a student carrying a dark bag walks across the frame at $t=0\text{s}$. At $t=6\text{s}$ and $t=12\text{s}$, the student has walked past and the area is empty.
2. **Observe**:
   - Frame 1: Candidate detection logged.
   - Frames 2 & 3: No matching detection at candidate coordinates.
   - Matching Frame Count: `1 / 3`.
3. **Pass Criteria**:
   - `temporalConfirmed`: `false`
   - `shouldCreateTicket`: `false`
   - **Ticket Decision**: Recorded as `DUPLICATE_IGNORED` or `TRANSIENT_IGNORED`. No work order sent.

### Scenario B: Stationary Persistent Litter Pile
1. **Action**: Place an uncontained garbage heap or overflowing bin that stays in place across $t=0\text{s}, 6\text{s}, 12\text{s}$.
2. **Observe**:
   - Frames 1, 2, and 3 all detect the waste in the same physical coordinate ($\text{IoU} \ge 0.30$).
   - Matching Frame Count: `3 / 3` (or `2 / 3`).
3. **Pass Criteria**:
   - `temporalConfirmed`: `true`
   - `shouldCreateTicket`: `true`
   - **Ticket Decision**: Official ticket generated and dispatched to the Authority Resolution Engine.

---

## 5. Test Phase 3: Region of Interest (ROI) Masking

Cameras with wide angles view public thoroughfares, moving traffic, and distant non-campus grounds that should not trigger university sanitation tickets.

1. **Setup**: Select a camera with a configured polygon mask (e.g. UIET Gate 1 Courtyard).
2. **Action 1**: Position waste outside the perimeter boundary (e.g., on the public road in the camera background).
   - **Expected**: Model detects object internally, but the polygon point-in-polygon filter rejects it. **No ticket is created**.
3. **Action 2**: Position waste inside the defined walking courtyard.
   - **Expected**: Object passes polygon containment check and generates a valid incident ticket.

---

## 6. Test Phase 4: Optical Quality Gate & Corruption Rejection

Ensures the AI does not operate on degraded frames, protecting against false alarms during camera faults or bad weather.

| Condition | Threshold Tested | Expected System Behavior |
|:---|:---|:---|
| **Severe Blackout / Night Disconnect** | Mean gray luminance $< 10.0$ | Rejected immediately with reason: `CRITICAL_BLACKOUT`. |
| **Sun Glare / High-Beam Flash** | Mean gray luminance $> 240.0$ | Rejected immediately with reason: `OVER_EXPOSURE`. |
| **Rain Blur / Defocused Lens** | Laplacian variance $< 50.0$ | Rejected immediately with reason: `DEFOCUS_OR_MOTION_BLUR`. |

### Human Execution Steps:
1. Feed a fully black frame or an out-of-focus blurred image to the pipeline endpoint.
2. Observe the pipeline response:
   - `qualityPassed`: `false`
   - `qualityReason`: Non-null rejection message.
   - No inference is run, saving CPU cycles.

---

## 7. Test Phase 5: Privacy Anonymization (Student & Worker Protection)

University policy mandates that all CCTV frames stored or presented as evidence must protect student and staff privacy.

1. **Action**: Ingest a frame showing waste on the pavement with students or sanitation workers clearly visible.
2. **Verify Captured File**: Inspect the saved image file under `backend/uploads/` and on the incident dashboard.
3. **Pass Criteria**:
   - **Faces**: 100% of human faces have a Gaussian blur / pixelation mask applied.
   - **Silhouettes**: Pedestrian bounding boxes are anonymized.
   - Raw, un-anonymized human faces are **never** committed to disk.

---

## 8. Test Phase 6: Closed-Loop "Before vs. After" Verification

Validates the full cycle from detection to physical cleanup and AI verification.

1. **Step 1 (Incident Generation)**:
   - Trigger or select an active `overflow` ticket at a specific campus block.
   - Note the **Before** photograph showing the garbage pile.
2. **Step 2 (Field Cleanup)**:
   - Log in as **BVG Worker** (`bvg` / `1234`).
   - Open the assigned ticket and click **Submit Cleanup Verification**.
   - Upload the **After** photograph taken from the same angle after sweeping.
3. **Step 3 (AI Verification Analysis)**:
   - The system executes verification:
     - Residual Debris Percentage: Must be $\le 10\%$.
     - Cleanliness Score: Must be $\ge 90\%$.
   - **Expected Result**: Ticket status changes from `In Progress` $\to$ `Resolved`.
   - The SLA audit trail records worker ID, turnaround minutes, and on-time compliance.

---

## 9. QA Acceptance Sign-Off Checklist

| Item | Description | Status | Tester Initials |
|:---:|:---|:---:|:---:|
| 1 | All 6 classes correctly classified with required confidence thresholds | [ ] PASS | |
| 2 | Moving pedestrians / transient objects rejected by 3-frame temporal burst | [ ] PASS | |
| 3 | Background litter outside camera ROI polygon ignored | [ ] PASS | |
| 4 | Degraded frames (blackout, glare, blur) rejected by optical quality gate | [ ] PASS | |
| 5 | Human faces anonymized with blur before persisting evidence | [ ] PASS | |
| 6 | Before vs. After verification accurately scores cleanup $\ge 90\%$ | [ ] PASS | |
| 7 | Authority Resolution Engine routes ticket to correct ward supervisor | [ ] PASS | |
