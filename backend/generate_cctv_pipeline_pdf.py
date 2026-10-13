"""
Generates the official technical and architectural PDF document for:
CSJMU Campus CCTV Garbage Detection & Autonomous Sanitation Pipeline
"""

import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

PDF_OUTPUT_PATH = "/Users/sunnykumarbharti/Desktop/Desktop/CSJMU/Urban Planning/CSJMU_CCTV_Garbage_Detection_Pipeline_Architecture.pdf"

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and render total page numbers
    along with running header, accent bars, and institutional footer.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#475569"))

        # Running Header (Pages 2+)
        if self._pageNumber > 1:
            self.drawString(54, 11 * inch - 36, "CSJMU KANPUR — SMART CAMPUS CCTV PIPELINE ARCHITECTURE")
            self.setFont("Helvetica", 8)
            self.drawRightString(8.5 * inch - 54, 11 * inch - 36, "INSTITUTIONAL TECHNICAL SPECIFICATION")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.6)
            self.line(54, 11 * inch - 42, 8.5 * inch - 54, 11 * inch - 42)

        # Running Footer (All pages)
        self.setFont("Helvetica", 8)
        self.drawString(54, 34, "Chhatrapati Shahu Ji Maharaj University • AI & Urban Planning Division • v2.4 (Production)")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * inch - 54, 34, page_str)
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.6)
        self.line(54, 46, 8.5 * inch - 54, 46)
        
        self.restoreState()


def create_cctv_pipeline_pdf(filename: str):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=50,
        bottomMargin=50
    )

    styles = getSampleStyleSheet()

    # Custom harmonious palette
    primary_color = colors.HexColor("#1E1B4B")     # Deep Slate Indigo
    indigo_accent = colors.HexColor("#4F46E5")     # Vibrant Indigo
    teal_accent = colors.HexColor("#0D9488")       # Emerald/Teal
    dark_text = colors.HexColor("#0F172A")         # Slate 900
    muted_text = colors.HexColor("#475569")        # Slate 600
    bg_light = colors.HexColor("#F8FAFC")          # Off white row
    border_color = colors.HexColor("#CBD5E1")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=primary_color,
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=indigo_accent,
        spaceAfter=10
    )

    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11.5,
        textColor=muted_text
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=primary_color,
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11.5,
        textColor=dark_text,
        spaceAfter=5
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.8,
        leading=11,
        textColor=dark_text,
        leftIndent=10,
        spaceAfter=2.5
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.white,
        alignment=0
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.4,
        leading=9.5,
        textColor=dark_text
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.4,
        leading=9.5,
        textColor=dark_text
    )

    story = []

    # =========================================================================
    # PAGE 1: TITLE BANNER, EXECUTIVE PRINCIPLES & 8-STAGE WORKFLOW
    # =========================================================================
    story.append(Paragraph("Autonomous Campus CCTV Waste Surveillance Pipeline", title_style))
    story.append(Paragraph("8-Stage Computer Vision, Stratified Dynamic Auditing & BVG Dispatch Specification", subtitle_style))

    meta_text = (
        "<b>Institution:</b> Chhatrapati Shahu Ji Maharaj University (CSJMU), Kanpur &bull; "
        "<b>Division:</b> Smart Campus Urban Planning Cell<br/>"
        "<b>Architecture Build:</b> v2.4 (Production Institutional Release) &bull; "
        "<b>Surveillance Area:</b> 264-Acre Campus &bull; "
        "<b>Inference Model:</b> YOLOv11-TACO (640&times;640)"
    )
    story.append(Paragraph(meta_text, meta_style))
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=1.5, color=indigo_accent, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph("1. Executive Summary & Operational Engineering Principles", h1_style))
    summary_p = (
        "Monitoring sanitation compliance across CSJMU's 264-acre campus requires high-frequency surveillance without "
        "imposing unrealistic network overhead or staffing costs. Standard campus CCTV systems (CP PLUS, Hikvision, Dahua) "
        "cannot sustain continuous 4K @ 30 FPS video streaming across campus core switches without severe bandwidth saturation. "
        "Furthermore, standard YOLO models downsample inputs to <b>640&times;640 tensors</b>, making full-frame 4K streaming wasteful in both compute cycles and network capacity."
    )
    story.append(Paragraph(summary_p, body_style))

    key_principles = [
        "<b>1. Ephemeral Sub-Stream / Snapshot Ingestion:</b> Instead of opening persistent 24/7 RTSP sessions, the pipeline queries camera HTTP snapshot APIs (<code>/ISAPI/Streaming/channels/101/picture</code>) or pulls from RTSP sub-streams (<code>Channel 102</code>). Network bandwidth consumption drops by over 99.8%.",
        "<b>2. Stratified Dynamic Random Auditing:</b> Fixed sweep times (e.g. 6 AM, 12 PM) create the 'anticipation effect,' where cleaning teams only tidy up minutes before scheduled sweeps. The pipeline implements a stratified pseudo-random scheduler that computes unpredictable audit timestamps inside 4 operational shift quarters (06:00 to 22:00) with a minimum 90-minute spacing buffer.",
        "<b>3. Centralized Datacenter Inference:</b> Because audits occur only 4 times daily across 10–30 cameras, central server inference processes all camera frames in <b>under 2.5 seconds total</b>, eliminating expensive and failure-prone outdoor edge hardware (Jetson) on camera poles.",
        "<b>4. Closed-Loop Municipal Action:</b> Optical detections feed directly into the CSJMU Ward Authority Matrix and BVG Sanitation Beat crews, completing work order generation, SLA tracking, and before-vs-after verification."
    ]
    for kp in key_principles:
        story.append(Paragraph(f"&bull; {kp}", bullet_style))

    story.append(Spacer(1, 6))

    story.append(Paragraph("2. The 8-Stage CCTV Pipeline Architecture", h1_style))
    story.append(Paragraph(
        "The pipeline executes an autonomous 8-step sequence that transforms raw campus camera optics into verified sanitation ticket closures:",
        body_style
    ))

    stages_data = [
        [
            Paragraph("Stage", table_header_style),
            Paragraph("Pipeline Stage Name", table_header_style),
            Paragraph("Technical Process & Mechanism", table_header_style),
            Paragraph("Output / Artifact", table_header_style)
        ],
        [
            Paragraph("<b>Stage 1</b>", table_cell_bold),
            Paragraph("<b>CCTV Data Collection</b>", table_cell_bold),
            Paragraph("Stratified random trigger activates sweep across camera registry across 4 shift windows.", table_cell_style),
            Paragraph("Triggered Camera Manifest", table_cell_style)
        ],
        [
            Paragraph("<b>Stage 2</b>", table_cell_bold),
            Paragraph("<b>Data Ingestion & Storage</b>", table_cell_bold),
            Paragraph("HTTP GET ISAPI snapshot capture (~180 KB), letterbox resize, face/license privacy blur.", table_cell_style),
            Paragraph("Clean 640x640 Input Buffer", table_cell_style)
        ],
        [
            Paragraph("<b>Stage 3</b>", table_cell_bold),
            Paragraph("<b>AI Computer Vision</b>", table_cell_bold),
            Paragraph("YOLOv11-TACO inference (6 classes), confidence gate (&ge;0.70), volumetric & weight estimation.", table_cell_style),
            Paragraph("Bounding Box, Class, Weight (kg)", table_cell_style)
        ],
        [
            Paragraph("<b>Stage 4</b>", table_cell_bold),
            Paragraph("<b>Geotagging & GIS</b>", table_cell_bold),
            Paragraph("Camera ID lookup against campus spatial database; tags 2D floor coordinates and WGS84 GPS.", table_cell_style),
            Paragraph("Geolocated Telemetry Package", table_cell_style)
        ],
        [
            Paragraph("<b>Stage 5</b>", table_cell_bold),
            Paragraph("<b>LLM Structured Parsing</b>", table_cell_bold),
            Paragraph("Multimodal LLM synthesizes telemetry into municipal title, natural language summary, and SOP plan.", table_cell_style),
            Paragraph("Structured Work Order JSON", table_cell_style)
        ],
        [
            Paragraph("<b>Stage 6</b>", table_cell_bold),
            Paragraph("<b>Authority Routing Engine</b>", table_cell_bold),
            Paragraph("Spatial query resolves: Zone &rarr; Ward &rarr; Department &rarr; Supervisor &rarr; BVG Sanitation Team.", table_cell_style),
            Paragraph("Assigned Team & SLA Deadline", table_cell_style)
        ],
        [
            Paragraph("<b>Stage 7</b>", table_cell_bold),
            Paragraph("<b>Field Dispatch</b>", table_cell_bold),
            Paragraph("Automated incident creation in database, push notification to field beat leader's handheld terminal.", table_cell_style),
            Paragraph("Active Ticket (DISPATCHED)", table_cell_style)
        ],
        [
            Paragraph("<b>Stage 8</b>", table_cell_bold),
            Paragraph("<b>Cleaning Verification</b>", table_cell_bold),
            Paragraph("Post-cleaning camera re-capture or worker handheld photo comparison. AI confirms clean state.", table_cell_style),
            Paragraph("Ticket Resolved & Audit Logged", table_cell_style)
        ]
    ]

    stages_table = Table(stages_data, colWidths=[48, 112, 214, 130])
    stages_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, bg_light])
    ]))
    story.append(stages_table)

    # PAGE BREAK TO PAGE 2
    story.append(PageBreak())

    # =========================================================================
    # PAGE 2: HARDWARE SPECS, NETWORK ECONOMICS & SCHEDULER MATH
    # =========================================================================
    story.append(Paragraph("3. Campus Surveillance Registry: Institutional Hardware Specs", h1_style))
    story.append(Paragraph(
        "Active CCTV units configured in the CSJMU production registry, reflecting standard institutional 2 MP and 1.3 MP deployments:",
        body_style
    ))

    cams_data = [
        [
            Paragraph("Camera ID", table_header_style),
            Paragraph("Location & Campus Zone", table_header_style),
            Paragraph("Resolution & FPS", table_header_style),
            Paragraph("Stream Protocol", table_header_style),
            Paragraph("Channel", table_header_style),
            Paragraph("Target Tensor", table_header_style)
        ],
        [
            Paragraph("<b>CAM-UIET-01</b>", table_cell_bold),
            Paragraph("UIET Block-3 Canteen Concourse", table_cell_style),
            Paragraph("1080p (1920&times;1080) @ 15 fps", table_cell_style),
            Paragraph("SUB_STREAM_RTSP", table_cell_style),
            Paragraph("Ch 102", table_cell_style),
            Paragraph("640&times;640 px", table_cell_style)
        ],
        [
            Paragraph("<b>CAM-LIB-02</b>", table_cell_bold),
            Paragraph("Central Library Plaza Entrance", table_cell_style),
            Paragraph("1080p (1920&times;1080) @ 15 fps", table_cell_style),
            Paragraph("SUB_STREAM_RTSP", table_cell_style),
            Paragraph("Ch 102", table_cell_style),
            Paragraph("640&times;640 px", table_cell_style)
        ],
        [
            Paragraph("<b>CAM-WS-03</b>", table_cell_bold),
            Paragraph("Central Workshop North Drain", table_cell_style),
            Paragraph("720p (1280&times;720) @ 15 fps", table_cell_style),
            Paragraph("SUB_STREAM_RTSP", table_cell_style),
            Paragraph("Ch 102", table_cell_style),
            Paragraph("640&times;640 px", table_cell_style)
        ],
        [
            Paragraph("<b>CAM-HST-04</b>", table_cell_bold),
            Paragraph("Ramanujan Hostel Mess Quad", table_cell_style),
            Paragraph("1080p (1920&times;1080) @ 15 fps", table_cell_style),
            Paragraph("SUB_STREAM_RTSP", table_cell_style),
            Paragraph("Ch 102", table_cell_style),
            Paragraph("640&times;640 px", table_cell_style)
        ],
        [
            Paragraph("<b>CAM-STAD-05</b>", table_cell_bold),
            Paragraph("Stadium Pavilion South Bleachers", table_cell_style),
            Paragraph("720p (1280&times;720) @ 15 fps", table_cell_style),
            Paragraph("SUB_STREAM_RTSP", table_cell_style),
            Paragraph("Ch 102", table_cell_style),
            Paragraph("640&times;640 px", table_cell_style)
        ],
        [
            Paragraph("<b>CAM-ADMIN-06</b>", table_cell_bold),
            Paragraph("VC Secretariat VIP Porch", table_cell_style),
            Paragraph("1080p (1920&times;1080) @ 15 fps", table_cell_style),
            Paragraph("HTTP_SNAPSHOT_ISAPI", table_cell_style),
            Paragraph("Ch 101", table_cell_style),
            Paragraph("640&times;640 px", table_cell_style)
        ]
    ]

    cams_table = Table(cams_data, colWidths=[65, 140, 110, 95, 45, 49])
    cams_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, bg_light])
    ]))
    story.append(cams_table)
    story.append(Spacer(1, 8))

    story.append(Paragraph("4. Network Bandwidth & Ingestion Economics", h1_style))
    story.append(Paragraph(
        "Quantitative comparison of network traffic across alternative ingestion topologies:",
        body_style
    ))

    bw_data = [
        [
            Paragraph("Ingestion Strategy", table_header_style),
            Paragraph("Bitrate / Size Per Cam", table_header_style),
            Paragraph("Daily Volume (20 Cams)", table_header_style),
            Paragraph("Switch Impact & Risk Profile", table_header_style)
        ],
        [
            Paragraph("<b>Continuous 4K Streams</b><br/>(3840&times;2160 @ 30fps H.264)", table_cell_bold),
            Paragraph("~12.0 Mbps per stream", table_cell_style),
            Paragraph("<b>~2,592 GB / day</b><br/>(240 Mbps continuous)", table_cell_style),
            Paragraph("<font color='#DC2626'><b>Severe Congestion:</b></font> Saturates campus switches, drops VoIP/ERP traffic, requires heavy GPU decoding servers.", table_cell_style)
        ],
        [
            Paragraph("<b>Continuous 1080p Streams</b><br/>(1920&times;1080 @ 15fps H.264)", table_cell_bold),
            Paragraph("~1.8 Mbps per stream", table_cell_style),
            Paragraph("<b>~388 GB / day</b><br/>(36 Mbps continuous)", table_cell_style),
            Paragraph("<font color='#D97706'><b>Moderate Overhead:</b></font> Substantially lower, but still wastes bandwidth streaming during unoccupied hours.", table_cell_style)
        ],
        [
            Paragraph("<b>CSJMU Ephemeral Snapshots</b><br/>(Single 1080p JPEG @ 4 sweeps/day)", table_cell_bold),
            Paragraph("~180 KB per capture query", table_cell_style),
            Paragraph("<b>~14.4 MB / day</b><br/>(0.00017 Mbps avg)", table_cell_style),
            Paragraph("<font color='#16A34A'><b>Optimal Institutional Fit:</b></font> <b>99.99% bandwidth savings.</b> Zero network contention. Sub-second direct tensor ingestion.", table_cell_style)
        ]
    ]

    bw_table = Table(bw_data, colWidths=[120, 95, 115, 174])
    bw_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, bg_light])
    ]))
    story.append(bw_table)
    story.append(Spacer(1, 8))

    story.append(Paragraph("5. Stratified Dynamic Random Auditing Scheduler", h1_style))
    story.append(Paragraph(
        "To prevent facilities crews from anticipating audits, CSJMU divides the active campus day (06:00 to 22:00) "
        "into four non-overlapping 4-hour operational quarters with boundary buffers:",
        body_style
    ))

    strat_data = [
        [
            Paragraph("Quarter", table_header_style),
            Paragraph("Shift Window", table_header_style),
            Paragraph("Audit Focus & Critical Targets", table_header_style),
            Paragraph("Trigger Offset Algorithm", table_header_style)
        ],
        [
            Paragraph("<b>1st Sweep</b>", table_cell_bold),
            Paragraph("06:00 &ndash; 10:00", table_cell_style),
            Paragraph("Overnight waste accumulation, hostel mess dumping, pre-class concourses.", table_cell_style),
            Paragraph("<code>t &isin; [06:25, 09:35]</code> (Gaussian offset)", table_cell_style)
        ],
        [
            Paragraph("<b>2nd Sweep</b>", table_cell_bold),
            Paragraph("10:00 &ndash; 14:00", table_cell_style),
            Paragraph("UIET canteen peak, lunch kiosk overflow, open lawn takeaway wrappers.", table_cell_style),
            Paragraph("<code>t &isin; [10:25, 13:35]</code> (&ge;90 min from Sweep 1)", table_cell_style)
        ],
        [
            Paragraph("<b>3rd Sweep</b>", table_cell_bold),
            Paragraph("14:00 &ndash; 18:00", table_cell_style),
            Paragraph("Post-afternoon dispersal, sports bleachers, library walkway bins.", table_cell_style),
            Paragraph("<code>t &isin; [14:25, 17:35]</code> (&ge;90 min from Sweep 2)", table_cell_style)
        ],
        [
            Paragraph("<b>4th Sweep</b>", table_cell_bold),
            Paragraph("18:00 &ndash; 22:00", table_cell_style),
            Paragraph("Hostel dinner mess exits, evening study walkways, gate bins before night lock.", table_cell_style),
            Paragraph("<code>t &isin; [18:25, 21:35]</code> (&ge;90 min from Sweep 3)", table_cell_style)
        ]
    ]

    strat_table = Table(strat_data, colWidths=[65, 80, 204, 155])
    strat_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, bg_light])
    ]))
    story.append(strat_table)

    # PAGE BREAK TO PAGE 3
    story.append(PageBreak())

    # =========================================================================
    # PAGE 3: CV CLASSES, AUTHORITY DISPATCH & TECHNICAL GOVERNANCE
    # =========================================================================
    story.append(Paragraph("6. AI Detection Classes & Volumetric Density Model", h1_style))
    story.append(Paragraph(
        "The model is fine-tuned on municipal waste datasets (TACO / ZeroWaste) to recognize 6 operational states. "
        "Each class maps to bulk density coefficients to convert visual volume into estimated kilograms:",
        body_style
    ))

    classes_data = [
        [
            Paragraph("Detection Class", table_header_style),
            Paragraph("Priority", table_header_style),
            Paragraph("Density", table_header_style),
            Paragraph("SLA", table_header_style),
            Paragraph("Standard Operating Dispatch Action", table_header_style)
        ],
        [
            Paragraph("<b>blocked_drain</b>", table_cell_bold),
            Paragraph("<font color='#DC2626'><b>CRITICAL</b></font>", table_cell_style),
            Paragraph("160 kg/m³", table_cell_style),
            Paragraph("<b>30 min</b>", table_cell_style),
            Paragraph("Deploy desilting squad with suction pumps and rods to avert campus storm flooding.", table_cell_style)
        ],
        [
            Paragraph("<b>overflow</b>", table_cell_bold),
            Paragraph("<font color='#EA580C'><b>HIGH</b></font>", table_cell_style),
            Paragraph("120 kg/m³", table_cell_style),
            Paragraph("<b>45 min</b>", table_cell_style),
            Paragraph("Dispatch 2-person BVG crew with 240L wheelbarrow. Clear overflow and disinfect perimeter.", table_cell_style)
        ],
        [
            Paragraph("<b>litter_pile</b>", table_cell_bold),
            Paragraph("<font color='#EA580C'><b>HIGH</b></font>", table_cell_style),
            Paragraph("90 kg/m³", table_cell_style),
            Paragraph("<b>60 min</b>", table_cell_style),
            Paragraph("Dispatch manual sweeping squad with litter pickers and heavy-duty polythene bags.", table_cell_style)
        ],
        [
            Paragraph("<b>bin_full</b>", table_cell_bold),
            Paragraph("<font color='#D97706'><b>MEDIUM</b></font>", table_cell_style),
            Paragraph("110 kg/m³", table_cell_style),
            Paragraph("<b>90 min</b>", table_cell_style),
            Paragraph("Schedule compactor truck beat round to empty bin before overflow threshold.", table_cell_style)
        ],
        [
            Paragraph("<b>bin_partial</b>", table_cell_bold),
            Paragraph("<font color='#2563EB'><b>LOW</b></font>", table_cell_style),
            Paragraph("100 kg/m³", table_cell_style),
            Paragraph("Next Shift", table_cell_style),
            Paragraph("Logged in daily analytics. No emergency dispatch required.", table_cell_style)
        ],
        [
            Paragraph("<b>bin_empty</b>", table_cell_bold),
            Paragraph("<font color='#16A34A'><b>NORMAL</b></font>", table_cell_style),
            Paragraph("N/A", table_cell_style),
            Paragraph("Audit Pass", table_cell_style),
            Paragraph("Recorded as positive cleanliness compliance for zone supervisor scorecard.", table_cell_style)
        ]
    ]

    classes_table = Table(classes_data, colWidths=[70, 48, 56, 46, 284])
    classes_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, bg_light])
    ]))
    story.append(classes_table)
    story.append(Spacer(1, 8))

    story.append(Paragraph("7. Municipal Authority Hierarchy & BVG Workforce Dispatch", h1_style))
    story.append(Paragraph(
        "Detections trigger legally enforceable municipal work orders mapped to specific ward supervisors and contractors:",
        body_style
    ))

    auth_matrix = [
        [
            Paragraph("Campus Precinct", table_header_style),
            Paragraph("Ward Designation", table_header_style),
            Paragraph("Departmental Owner", table_header_style),
            Paragraph("Beat Supervisor", table_header_style),
            Paragraph("Assigned Field Crew", table_header_style)
        ],
        [
            Paragraph("<b>UIET Academic Block</b>", table_cell_bold),
            Paragraph("Ward 4 &ndash; Academic Division", table_cell_style),
            Paragraph("Estate Office / Academic Maintenance", table_cell_style),
            Paragraph("Er. Mahendra Gupta<br/><i>(Sanitation Inspector)</i>", table_cell_style),
            Paragraph("BVG Beat Squad Alpha<br/>(2 Sweep + 1 Cart)", table_cell_style)
        ],
        [
            Paragraph("<b>Central Library & Admin</b>", table_cell_bold),
            Paragraph("Ward 2 &ndash; Central Secretariat", table_cell_style),
            Paragraph("Registrar's Office Facilities Cell", table_cell_style),
            Paragraph("Mr. R. K. Srivastava<br/><i>(Assistant Registrar)</i>", table_cell_style),
            Paragraph("BVG Admin Flying Squad<br/>(VIP Beat)", table_cell_style)
        ],
        [
            Paragraph("<b>Mechanical Workshops</b>", table_cell_bold),
            Paragraph("Ward 5 &ndash; Industrial & Utilities", table_cell_style),
            Paragraph("Works & Infrastructure Dept", table_cell_style),
            Paragraph("Er. Suresh Verma<br/><i>(Works Supervisor)</i>", table_cell_style),
            Paragraph("Utility & Drain Clear Crew<br/>(Heavy Rodding)", table_cell_style)
        ],
        [
            Paragraph("<b>Ramanujan Hostels</b>", table_cell_bold),
            Paragraph("Ward 7 &ndash; Student Residences", table_cell_style),
            Paragraph("Chief Warden Office", table_cell_style),
            Paragraph("Dr. Pradeep Mishra<br/><i>(Hostel Sanitation Supv)</i>", table_cell_style),
            Paragraph("BVG Hostel Sanitation Beat<br/>(Mess Clearing)", table_cell_style)
        ]
    ]

    auth_table = Table(auth_matrix, colWidths=[95, 95, 110, 100, 104])
    auth_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, bg_light])
    ]))
    story.append(auth_table)
    story.append(Spacer(1, 8))

    story.append(Paragraph("8. Micro-Litter Detection (SAHI) & De-Duplication Logic", h1_style))
    story.append(Paragraph(
        "<b>Micro-Litter Handling:</b> Small cups and wrappers cover &lt;20&times;20 px in wide camera frames. The system handles this through (1) prioritizing macro piles/overflow, (2) static receptacle ROI cropping (focusing on a 5m radius around bins), and (3) <b>SAHI (Slicing Aided Hyper Inference)</b> which tiles 1080p frames into overlapping 640&times;640 patches.<br/>"
        "<b>De-Duplication Gate:</b> To prevent duplicate ticket spamming across successive sweeps, tickets are gated: "
        "<code>should_dispatch = (confidence &ge; 0.70) AND (class != clean) AND (no_active_ticket_in_zone)</code>.<br/>"
        "<b>Verification:</b> Resolved tickets require an 'After' photo from the field beat, which is verified by AI before ticket closure.",
        body_style
    ))

    # SIGN-OFF BLOCK
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1, color=border_color, spaceBefore=2, spaceAfter=6))
    sign_off_text = (
        "<b>Technical Specifications Approved By:</b> Directorate of Works & Campus Infrastructure &bull; "
        "Department of Urban Planning & GIS Systems &bull; "
        "Chhatrapati Shahu Ji Maharaj University, Kalyanpur, Kanpur, Uttar Pradesh 208024"
    )
    story.append(Paragraph(sign_off_text, meta_style))

    # Build PDF
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF at: {filename}")


if __name__ == "__main__":
    out_file = PDF_OUTPUT_PATH
    if len(sys.argv) > 1:
        out_file = sys.argv[1]
    create_cctv_pipeline_pdf(out_file)
