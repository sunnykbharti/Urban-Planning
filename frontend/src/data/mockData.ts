import { 
  MaintenanceReport, 
  CampusBlock, 
  ActivityEvent, 
  PlanningProject,
  LeaveRequest,
  ReassignmentRequest,
  UserCredential
} from '../types';

export const initialBlocks: CampusBlock[] = [
  {
    id: 'block-1',
    name: 'UIET Block 1 (CSE & IT)',
    shortCode: 'A1 Science Center',
    department: 'Computer Science & Engineering, Information Technology',
    type: 'academic',
    bounds: { x: 34, y: 35, width: 14, height: 12 },
    activeReportsCount: 4,
    urgentCount: 1,
    condition: 'Fair'
  },
  {
    id: 'block-2',
    name: 'UIET Block 2 (ME & Civil)',
    shortCode: 'A15 Academic Hall',
    department: 'Mechanical Engineering & Civil Engineering',
    type: 'academic',
    bounds: { x: 44, y: 52, width: 12, height: 14 },
    activeReportsCount: 3,
    urgentCount: 1,
    condition: 'Requires Attention'
  },
  {
    id: 'block-3',
    name: 'UIET Block 3 (ECE & Chemical)',
    shortCode: 'A23 Tech Wing',
    department: 'Electronics & Comm. Eng., Chemical Engineering, Biotechnology',
    type: 'academic',
    bounds: { x: 45, y: 36, width: 10, height: 12 },
    activeReportsCount: 2,
    urgentCount: 0,
    condition: 'Good'
  },
  {
    id: 'library',
    name: 'Central University Library',
    shortCode: 'Library & Resource Hub',
    department: 'Central Academic Resource Center',
    type: 'library',
    bounds: { x: 55, y: 34, width: 14, height: 14 },
    activeReportsCount: 5,
    urgentCount: 2,
    condition: 'Requires Attention'
  },
  {
    id: 'workshop',
    name: 'Central Mechanical Workshop',
    shortCode: 'WS1 Workshop',
    department: 'Engineering Manufacturing & Fabrication',
    type: 'facility',
    bounds: { x: 24, y: 55, width: 14, height: 15 },
    activeReportsCount: 2,
    urgentCount: 0,
    condition: 'Fair'
  },
  {
    id: 'science-block-b',
    name: 'Science Block B (Physics & Chemistry Labs)',
    shortCode: 'A22 University Halls',
    department: 'Applied Sciences Department',
    type: 'academic',
    bounds: { x: 44, y: 20, width: 14, height: 12 },
    activeReportsCount: 3,
    urgentCount: 0,
    condition: 'Fair'
  },
  {
    id: 'admin-block',
    name: 'UIET Administrative Block',
    shortCode: 'Admin HQ',
    department: 'Director Office & Academic Registry',
    type: 'admin',
    bounds: { x: 62, y: 50, width: 12, height: 14 },
    activeReportsCount: 1,
    urgentCount: 0,
    condition: 'Good'
  },
  {
    id: 'sports-complex',
    name: 'University Sports Ground & Stadium',
    shortCode: 'Athletic Fields',
    department: 'Physical Education & Athletics',
    type: 'sports',
    bounds: { x: 78, y: 25, width: 16, height: 20 },
    activeReportsCount: 1,
    urgentCount: 0,
    condition: 'Good'
  },
  {
    id: 'hostels',
    name: 'Boys & Girls Residential Halls (Dorm 4 & 5)',
    shortCode: 'Residential Halls',
    department: 'Student Housing & Dining',
    type: 'hostel',
    bounds: { x: 65, y: 68, width: 15, height: 14 },
    activeReportsCount: 4,
    urgentCount: 1,
    condition: 'Requires Attention'
  },
  {
    id: 'main-gate',
    name: 'CSJMU Main Entrance Gate & North Quad',
    shortCode: 'North Campus Entrance',
    department: 'Campus Security & Transport',
    type: 'facility',
    bounds: { x: 70, y: 15, width: 16, height: 10 },
    activeReportsCount: 0,
    urgentCount: 0,
    condition: 'Good'
  }
];

export const initialReports: MaintenanceReport[] = [
  {
    id: 'REP-1092',
    title: 'Severely Cracked Walkway Near Library',
    description: 'Large crack has developed on the main pathway approaching the central library. Presents a trip hazard for students, especially during evening hours.',
    category: 'infrastructure',
    severity: 'urgent',
    status: 'pending',
    location: 'North Campus, Library Quad',
    blockId: 'library',
    coordinates: { x: 61, y: 41 },
    gps: { latitude: 26.5043, longitude: 80.2686 },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    timeAgo: '2 hrs ago',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUp83atXoJGMSBBu57auBMYXA5q4rcooRFstYO0jG7eJJu3uYCk0YukoTWBfW4aGrAesYRtp9rBm3-34Pdw2PPUu-PPwg3rSObF8iq_Y5AU3v-h-_z1tCb33Z_cLjOHTmilWqO91VF5f-sJsKkPkSYWlooLEOsILLYxA0gOZmAP-hDYaMRpgGlDjfzbTXQoXN0G1UgSHcnlqFhsxmkqDzQj2ou7aZY47UBiZrYe0u9VaZUE3OVFWMp',
    assignedTeam: 'Team Alpha (Civil)',
    reportedBy: {
      name: 'Rohan Sharma',
      role: 'B.Tech Student (IT 3rd Yr)',
    },
    updates: [
      {
        id: 'u-1',
        timestamp: '2 hrs ago',
        author: 'Rohan Sharma',
        message: 'Report submitted with photo of walkway fissure.',
      },
      {
        id: 'u-2',
        timestamp: '10 mins ago',
        author: 'Admin (Planning Desk)',
        message: 'Inspection team dispatched for immediate safety barricading.',
      }
    ]
  },
  {
    id: 'REP-1098',
    title: 'Uncapped Live Cable Box Near Sports Stadium',
    description: 'Ground junction box lid shattered with exposed 415V wiring near spectator bleachers. High risk for athletes and evening joggers.',
    category: 'safety',
    severity: 'critical',
    status: 'pending',
    location: 'Sports Ground West Spectator Pavilion',
    blockId: 'sports-complex',
    coordinates: { x: 79, y: 26 },
    gps: { latitude: 26.5057, longitude: 80.2715 },
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    timeAgo: '1 hr ago',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    assignedTeam: 'Team Beta (Electrical Maintenance)',
    reportedBy: {
      name: 'Captain Amit Yadav',
      role: 'Sports Committee Coordinator',
    },
    updates: [
      {
        id: 'u-9',
        timestamp: '1 hr ago',
        author: 'Capt. Amit Yadav',
        message: 'Caution perimeter cordoned off with cones.',
      }
    ]
  },
  {
    id: 'REP-1088',
    title: 'Minor Pipe Leak in Science Block B',
    description: 'Small drip noticed from overhead pipe in the basement corridor near lab B-12. Need a plumber to tighten fittings before water gathers on electrical conduits.',
    category: 'plumbing',
    severity: 'normal',
    status: 'in_progress',
    location: 'East Campus, Science Block B, Basement',
    blockId: 'science-block-b',
    coordinates: { x: 46, y: 26 },
    gps: { latitude: 26.5051, longitude: 80.2666 },
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    timeAgo: '5 hrs ago',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNz9kmKjs6xYEvNxTTRpzZZPl45MCRBjF5R8Y1Stw1P-6sNpm3xZvKlnHVVpTg6t55BMjLa7nxjO0HpMzHPTMJTbN1BB6vrIJWzoaPti2JTyECXgoOjODV9SnPsygTO7zq89eTelmoh4vZ1yZ9m-bc6LZtkf4SGKId8INwdgu73SbrbilYhDyQJyfD1S5BPpwYiNgo9VVFt5J2-Ry7vmNB4fwzldaPB0EFNg_suR-dzMo_uD8R1FEQ',
    assignedTeam: 'Team Gamma (Plumbing & Sanitation)',
    reportedBy: {
      name: 'Dr. Anita Verma',
      role: 'Assistant Professor, Chemistry',
    },
    updates: [
      {
        id: 'u-3',
        timestamp: '5 hrs ago',
        author: 'Dr. Anita Verma',
        message: 'Report created. Bucket temporarily placed.',
      },
      {
        id: 'u-4',
        timestamp: '3 hrs ago',
        author: 'Maintenance Coordinator',
        message: 'Assigned to Team Gamma. Spare PVC joiner requisitioned.',
        statusChange: 'in_progress'
      }
    ]
  },
  {
    id: 'REP-1085',
    title: 'Main Gate: Path Fixed & Resurfaced',
    description: 'Crushed gravel and concrete paving at North Gate completed with drainage curb installation.',
    category: 'infrastructure',
    severity: 'normal',
    status: 'resolved',
    location: 'North Campus Entrance & Athletic Gate',
    blockId: 'main-gate',
    coordinates: { x: 81, y: 36 },
    gps: { latitude: 26.5066, longitude: 80.2647 },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    timeAgo: '1 day ago',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUp83atXoJGMSBBu57auBMYXA5q4rcooRFstYO0jG7eJJu3uYCk0YukoTWBfW4aGrAesYRtp9rBm3-34Pdw2PPUu-PPwg3rSObF8iq_Y5AU3v-h-_z1tCb33Z_cLjOHTmilWqO91VF5f-sJsKkPkSYWlooLEOsILLYxA0gOZmAP-hDYaMRpgGlDjfzbTXQoXN0G1UgSHcnlqFhsxmkqDzQj2ou7aZY47UBiZrYe0u9VaZUE3OVFWMp',
    assignedTeam: 'Team Alpha (Civil Works)',
    reportedBy: {
      name: 'Campus Security Office',
      role: 'Estate Security Supervisor',
    },
    updates: [
      {
        id: 'u-5',
        timestamp: '1 day ago',
        author: 'Team Alpha',
        message: 'Bitumen resurfacing and inspection completed. Verified safe.',
        statusChange: 'resolved'
      }
    ]
  },
  {
    id: 'REP-1081',
    title: 'Workshop: Lighting & Distribution Panel',
    description: 'Fluorescent fixture blinking and flickering in the CNC Milling section of Workshop. Requires ballast change.',
    category: 'electrical',
    severity: 'normal',
    status: 'pending',
    location: 'Central Mechanical Workshop, Bay 2',
    blockId: 'workshop',
    coordinates: { x: 45, y: 59 },
    gps: { latitude: 26.5013, longitude: 80.2654 },
    createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    timeAgo: '7 hrs ago',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    assignedTeam: 'Team Beta (Electrical Maintenance)',
    reportedBy: {
      name: 'Er. Sandeep Pandey',
      role: 'Workshop Lab Instructor',
    },
    updates: [
      {
        id: 'u-6',
        timestamp: '7 hrs ago',
        author: 'Er. Sandeep Pandey',
        message: 'Report filed with photo of ballast spark.',
      }
    ]
  },
  {
    id: 'REP-1077',
    title: 'Heavy Waterlogging Near UIET Block 1 Lawn',
    description: 'Rainwater accumulation due to blocked storm drain on the west pedestrian pathway of Block 1. Impeding wheelchair access.',
    category: 'waterlogging',
    severity: 'urgent',
    status: 'pending',
    location: 'UIET Block 1 West Corridor',
    blockId: 'block-1',
    coordinates: { x: 38, y: 44 },
    gps: { latitude: 26.5029, longitude: 80.2660 },
    createdAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
    timeAgo: '9 hrs ago',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    assignedTeam: 'Team Delta (Drainage & Civil)',
    reportedBy: {
      name: 'Pooja Gupta',
      role: 'Student Council Representative',
    },
    updates: []
  },
  {
    id: 'REP-1072',
    title: 'Broken Window Glass at Dorm 4 First Floor',
    description: 'Exterior window pane cracked by gust of wind; needs glass replacement to prevent rain ingress and safety risk.',
    category: 'safety',
    severity: 'normal',
    status: 'in_progress',
    location: 'Hostel Complex, Dorm 4, Room 108 Corridor',
    blockId: 'hostels',
    coordinates: { x: 72, y: 74 },
    gps: { latitude: 26.5000, longitude: 80.2706 },
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    timeAgo: '1 hr ago',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    assignedTeam: 'Team Alpha (Carpentry & Glass)',
    reportedBy: {
      name: 'Hostel Warden Office',
      role: 'Hostel Supervisor',
    },
    updates: [
      {
        id: 'u-7',
        timestamp: '1 hr ago',
        author: 'Hostel Warden',
        message: 'Hazard tape applied. Waiting for new cut glass sheet.',
      }
    ]
  },
  {
    id: 'REP-1065',
    title: 'HVAC Air Conditioning Failure in Main Auditorium',
    description: 'Chiller compressor tripping after 10 minutes of runtime in the Central Seminar Hall.',
    category: 'hvac',
    severity: 'urgent',
    status: 'resolved',
    location: 'UIET Administrative Block, Seminar Hall 1',
    blockId: 'admin-block',
    coordinates: { x: 67, y: 55 },
    gps: { latitude: 26.5033, longitude: 80.2693 },
    createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    timeAgo: '14 hrs ago',
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    assignedTeam: 'Team Beta (HVAC Specialist)',
    reportedBy: {
      name: 'Planning Officer',
      role: 'Estate Officer UIET',
    },
    updates: [
      {
        id: 'u-8',
        timestamp: '45 mins ago',
        author: 'Team Beta',
        message: 'Thermostat relay replaced and refrigerant gas topped up. Test run passed.',
        statusChange: 'resolved'
      }
    ]
  },
  {
    id: 'REP-1060',
    title: 'Overflowing Waste Bins at Cafeteria Quad',
    description: 'Post-lunch waste bin overflow attracting stray animals near UIET Canteen courtyard.',
    category: 'garbage',
    severity: 'normal',
    status: 'resolved',
    location: 'Central Canteen & Student Plaza',
    blockId: 'block-2',
    coordinates: { x: 50, y: 65 },
    gps: { latitude: 26.5024, longitude: 80.2679 },
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    timeAgo: '18 hrs ago',
    imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    assignedTeam: 'Team Sanitation Services',
    reportedBy: {
      name: 'Vikas Mishra',
      role: 'Faculty Member',
    },
    updates: []
  },
  {
    id: 'REP-1054',
    title: 'Faded Directional Signpost at Central Concourse',
    description: 'Wayfinding arrows towards Health Centre and UIET Block 3 have oxidized and are difficult for freshers to read.',
    category: 'infrastructure',
    severity: 'low',
    status: 'pending',
    location: 'Central Concourse Junction, Near Health Centre',
    blockId: 'health-centre',
    coordinates: { x: 58, y: 48 },
    gps: { latitude: 26.5020, longitude: 80.2687 },
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    timeAgo: '1.5 days ago',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=800&q=80',
    assignedTeam: 'Team Alpha (Signage & Paint)',
    reportedBy: {
      name: 'Swati Sachan',
      role: '1st Year B.Tech Student',
    },
    updates: []
  }
];

export const initialActivities: ActivityEvent[] = [
  {
    id: 'act-1',
    type: 'dispatch',
    title: 'Team Alpha dispatched to Library Quad',
    description: 'Emergency response crew equipped with asphalt patching gear sent to secure cracked walkway.',
    location: 'North Campus, Library Quad',
    timestamp: '10 MINS AGO',
    actor: 'Team Alpha',
    iconType: 'engineering'
  },
  {
    id: 'act-2',
    type: 'resolved',
    title: 'HVAC Issue in Main Hall marked as Resolved',
    description: 'Chiller compressor verified running continuously with nominal temperature differential.',
    location: 'UIET Admin Block, Seminar Hall',
    timestamp: '45 MINS AGO',
    actor: 'Team Beta',
    iconType: 'check_circle'
  },
  {
    id: 'act-3',
    type: 'new_report',
    title: 'New report filed: Broken Window at Dorm 4',
    description: 'Hostel administration reported shattered window pane due to wind shear.',
    location: 'Hostel Complex, Dorm 4',
    timestamp: '1 HR AGO',
    actor: 'Hostel Supervisor',
    iconType: 'report'
  },
  {
    id: 'act-4',
    type: 'status_change',
    title: 'Science Block B pipe leak assigned to Team Gamma',
    description: 'Plumbing inventory checklist issued with replacement brass ball valves.',
    location: 'Science Block B, Basement',
    timestamp: '3 HRS AGO',
    actor: 'Dispatcher',
    iconType: 'engineering'
  },
  {
    id: 'act-5',
    type: 'resolved',
    title: 'North Entrance Roadway Resurfacing Completed',
    description: 'Pothole restoration and reflective lane markers completed by civil team.',
    location: 'North Gate Entrance',
    timestamp: '1 DAY AGO',
    actor: 'Team Alpha',
    iconType: 'check_circle'
  }
];

export const initialProjects: PlanningProject[] = [
  {
    id: 'PRJ-2026-01',
    title: 'Solar Rooftop Canopy Installation Phase 2',
    block: 'UIET Block 1 & 2 Rooftops',
    stage: 'In Progress',
    budget: '₹42,50,000',
    targetDate: 'Oct 2026',
    priority: 'High',
    leadEngineer: 'Er. R. K. Agrawal'
  },
  {
    id: 'PRJ-2026-02',
    title: 'Smart Stormwater Drainage & Rain Harvesting Well',
    block: 'Central Quad & Science Block',
    stage: 'Procurement',
    budget: '₹18,00,000',
    targetDate: 'Nov 2026',
    priority: 'High',
    leadEngineer: 'Er. Sunita Tripathi'
  },
  {
    id: 'PRJ-2026-03',
    title: 'Campus-wide LED Pathway Lighting Modernization',
    block: 'All Campus Perimeter Walkways',
    stage: 'Assessment',
    budget: '₹9,75,000',
    targetDate: 'Dec 2026',
    priority: 'Medium',
    leadEngineer: 'Er. A. K. Shukla'
  },
  {
    id: 'PRJ-2026-04',
    title: 'Central Library Accessibility Ramp & Automated Doors',
    block: 'Central University Library',
    stage: 'In Progress',
    budget: '₹6,20,000',
    targetDate: 'Sep 2026',
    priority: 'High',
    leadEngineer: 'Er. R. K. Agrawal'
  },
  {
    id: 'PRJ-2026-05',
    title: 'UIET Workshop CNC Lab Ventilation & Air Filtration System',
    block: 'Central Mechanical Workshop',
    stage: 'Backlog',
    budget: '₹12,40,000',
    targetDate: 'Jan 2027',
    priority: 'Medium',
    leadEngineer: 'Er. Sandeep Pandey'
  }
];

export const samplePhotos = [
  {
    title: 'Severe Overflowing Waste Bin',
    url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    category: 'garbage' as const,
    suggestedTitle: 'Critical Waste Bin Overflow & Ground Spillage'
  },
  {
    title: 'Plastic Litter Pile on Lawn',
    url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
    category: 'garbage' as const,
    suggestedTitle: 'Scattered Plastic Litter & Food Wrappers'
  },
  {
    title: 'Blocked Drain Silt & Waste',
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    category: 'waterlogging' as const,
    suggestedTitle: 'Blocked Storm Drain Clogged with Solid Waste'
  },
  {
    title: 'Cracked Pavement / Road Hazard',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUp83atXoJGMSBBu57auBMYXA5q4rcooRFstYO0jG7eJJu3uYCk0YukoTWBfW4aGrAesYRtp9rBm3-34Pdw2PPUu-PPwg3rSObF8iq_Y5AU3v-h-_z1tCb33Z_cLjOHTmilWqO91VF5f-sJsKkPkSYWlooLEOsILLYxA0gOZmAP-hDYaMRpgGlDjfzbTXQoXN0G1UgSHcnlqFhsxmkqDzQj2ou7aZY47UBiZrYe0u9VaZUE3OVFWMp',
    category: 'infrastructure' as const,
    suggestedTitle: 'Cracked Walkway Fissure'
  },
  {
    title: 'Basement Pipe Drip / Plumbing',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNz9kmKjs6xYEvNxTTRpzZZPl45MCRBjF5R8Y1Stw1P-6sNpm3xZvKlnHVVpTg6t55BMjLa7nxjO0HpMzHPTMJTbN1BB6vrIJWzoaPti2JTyECXgoOjODV9SnPsygTO7zq89eTelmoh4vZ1yZ9m-bc6LZtkf4SGKId8INwdgu73SbrbilYhDyQJyfD1S5BPpwYiNgo9VVFt5J2-Ry7vmNB4fwzldaPB0EFNg_suR-dzMo_uD8R1FEQ',
    category: 'plumbing' as const,
    suggestedTitle: 'Overhead Pipe Drip & Puddle'
  },
  {
    title: 'Electrical Panel / Wiring Spark',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    category: 'electrical' as const,
    suggestedTitle: 'Flickering Light & Exposed Ballast'
  }
];

export const initialLeaveRequests: LeaveRequest[] = [
  {
    id: 'LV-2026-08',
    workerId: 'USR-BVG-204',
    workerName: 'Ramesh Kumar',
    workerBadge: 'BVG-IND-KNP-204',
    startDate: '2026-10-12',
    endDate: '2026-10-14',
    daysCount: 3,
    type: 'casual',
    reason: 'Family wedding event in native village (Unnao). Backup assigned to Beat 02.',
    status: 'pending',
    appliedAt: '2026-10-07T09:30:00.000Z'
  },
  {
    id: 'LV-2026-07',
    workerId: 'USR-BVG-209',
    workerName: 'Suresh Chandra',
    workerBadge: 'BVG-IND-KNP-209',
    startDate: '2026-10-10',
    endDate: '2026-10-11',
    daysCount: 2,
    type: 'sick',
    reason: 'Viral fever and monsoon flu. Prescription attached.',
    status: 'pending',
    appliedAt: '2026-10-08T06:15:00.000Z'
  },
  {
    id: 'LV-2026-06',
    workerId: 'USR-BVG-215',
    workerName: 'Mahesh Pal',
    workerBadge: 'BVG-IND-KNP-215',
    startDate: '2026-10-03',
    endDate: '2026-10-04',
    daysCount: 2,
    type: 'emergency',
    reason: 'Household water pipe burst repair.',
    status: 'approved',
    appliedAt: '2026-10-02T14:00:00.000Z',
    reviewedBy: 'Er. R. K. Sharma (Estate)',
    reviewRemarks: 'Approved. Standby worker deputed.',
    reviewedAt: '2026-10-02T16:30:00.000Z'
  }
];

export const initialReassignmentRequests: ReassignmentRequest[] = [
  {
    id: 'REASSIGN-101',
    reportId: 'REP-1098',
    reportTitle: 'Uncapped Live Cable Box Near Sports Stadium',
    location: 'Sports Ground West Spectator Pavilion',
    workerId: 'USR-BVG-204',
    workerName: 'Ramesh Kumar',
    workerBadge: 'BVG-IND-KNP-204',
    currentBeat: 'Beat 01 (Sanitation)',
    reason: 'safety_hazard',
    notes: 'Exposed 415V live wires present high electrocution risk. Requires licensed high-voltage electrician team (Team Beta) with insulated tools, not general sweepers.',
    status: 'pending',
    requestedAt: '2026-10-08T10:15:00.000Z'
  },
  {
    id: 'REASSIGN-102',
    reportId: 'REP-1077',
    reportTitle: 'Heavy Waterlogging Near UIET Block 1 Lawn',
    location: 'UIET Block 1 West Corridor',
    workerId: 'USR-BVG-209',
    workerName: 'Suresh Chandra',
    workerBadge: 'BVG-IND-KNP-209',
    currentBeat: 'Beat 02',
    reason: 'equipment_needed',
    notes: 'Deep sludge and water stagnation requires suction pump tanker (UP-78-TK) and desilting squad with safety waders.',
    status: 'pending',
    requestedAt: '2026-10-08T08:45:00.000Z'
  }
];

export const initialCredentials: UserCredential[] = [
  {
    id: 'USR-STU-01',
    name: 'Sunny Bharti',
    email: 'sunny.student@csjmu.ac.in',
    role: 'student',
    pin: '',
    agency: 'CSJMU Student Council',
    department: 'Computer Science & Engineering (UIET)',
    badgeNumber: 'CSJMU/UIET/2023/104',
    lastLogin: 'Today, 01:15 PM',
    status: 'active'
  },
  {
    id: 'USR-BVG-204',
    name: 'Ramesh Kumar',
    email: 'ramesh.bvg@csjmu.facility.in',
    role: 'bvg_worker',
    pin: '1234',
    agency: 'BVG India Ltd.',
    department: 'Solid Waste Cleansing Beat 01',
    badgeNumber: 'BVG-IND-KNP-204',
    lastLogin: 'Today, 11:42 AM',
    status: 'active'
  },
  {
    id: 'USR-MGT-101',
    name: 'Er. R. K. Sharma',
    email: 'rksharma.estate@csjmu.ac.in',
    role: 'management',
    pin: '5678',
    agency: 'CSJMU Directorate of Estate & Works',
    department: 'Campus Works & Public Health Engineering',
    badgeNumber: 'CSJMU-EST-019',
    lastLogin: 'Today, 10:20 AM',
    status: 'active'
  },
  {
    id: 'USR-ADM-001',
    name: 'Vice Chancellor / Registrar Secretariat',
    email: 'registrar@csjmu.ac.in',
    role: 'super_admin',
    pin: '9999',
    agency: 'CSJMU Central Secretariat',
    department: 'Directorate of Campus Administration & IT',
    badgeNumber: 'CSJMU-EXEC-001',
    lastLogin: 'Today, 09:00 AM',
    status: 'active'
  }
];
