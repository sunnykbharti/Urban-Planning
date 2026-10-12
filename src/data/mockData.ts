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
    title: 'Severely Cracked Walkway Near Library Quad',
    description: 'Deep fissure and dislodged paver blocks on the main approach walkway to Central Library. Poses severe trip hazard for students during evening hours.',
    category: 'infrastructure',
    severity: 'urgent',
    status: 'in_progress',
    location: 'North Campus, Library Quad Pathway',
    blockId: 'library',
    coordinates: { x: 61, y: 41 },
    gps: { latitude: 26.5043, longitude: 80.2686 },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    timeAgo: '2 hrs ago',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUp83atXoJGMSBBu57auBMYXA5q4rcooRFstYO0jG7eJJu3uYCk0YukoTWBfW4aGrAesYRtp9rBm3-34Pdw2PPUu-PPwg3rSObF8iq_Y5AU3v-h-_z1tCb33Z_cLjOHTmilWqO91VF5f-sJsKkPkSYWlooLEOsILLYxA0gOZmAP-hDYaMRpgGlDjfzbTXQoXN0G1UgSHcnlqFhsxmkqDzQj2ou7aZY47UBiZrYe0u9VaZUE3OVFWMp',
    assignedTeam: 'Beat 01 - Lead: Ramesh Kumar (BVG India)',
    reportedBy: {
      name: 'Sunny Bharti',
      role: 'UIET B.Tech Student / Citizen Reporter',
    },
    updates: [
      {
        id: 'u-1',
        timestamp: '2 hrs ago',
        author: 'Sunny Bharti',
        message: 'Report submitted with photo of paver dislocation near reading hall entrance.',
      },
      {
        id: 'u-2',
        timestamp: '45 mins ago',
        author: 'Er. R. K. Sharma (Estate)',
        message: 'Dispatched to BVG Beat 01 (Lead: Ramesh Kumar) for safety cones and mortar leveling.',
        statusChange: 'in_progress'
      }
    ]
  },
  {
    id: 'REP-1098',
    title: 'Uncapped Live Cable Box Near Sports Stadium',
    description: 'Ground junction box lid shattered with exposed 415V wiring near spectator bleachers. High electrocution hazard for athletes and evening joggers.',
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
    assignedTeam: 'Beat 01 - Lead: Ramesh Kumar (BVG India)',
    reportedBy: {
      name: 'Sunny Bharti',
      role: 'UIET B.Tech Student / Citizen Reporter',
    },
    updates: [
      {
        id: 'u-9',
        timestamp: '1 hr ago',
        author: 'Sunny Bharti',
        message: 'Spotted during football practice. Placed temporary safety branch over lid.',
      },
      {
        id: 'u-10',
        timestamp: '20 mins ago',
        author: 'Ramesh Kumar (BVG Lead)',
        message: 'Reassignment requested to High-Voltage Electrical Unit (Team Beta). Sweeper team lacks HV insulated gear.'
      }
    ]
  },
  {
    id: 'REP-1088',
    title: 'Overflowing Garbage Bins & Food Debris at Cafeteria Quad',
    description: 'Post-lunch student rush caused twin bins to overflow. Residual food waste scattering on pedestrian plaza attracting stray monkeys and dogs.',
    category: 'garbage',
    severity: 'urgent',
    status: 'pending',
    location: 'Central Canteen & Student Activity Plaza',
    blockId: 'block-2',
    coordinates: { x: 50, y: 65 },
    gps: { latitude: 26.5024, longitude: 80.2679 },
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    timeAgo: '4 hrs ago',
    imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    assignedTeam: 'Beat 01 - Lead: Ramesh Kumar (BVG India)',
    reportedBy: {
      name: 'Sunny Bharti',
      role: 'UIET B.Tech Student / Citizen Reporter',
    },
    updates: [
      {
        id: 'u-3',
        timestamp: '4 hrs ago',
        author: 'Sunny Bharti',
        message: 'Report filed with photo of overflowing bio-bin.',
      },
      {
        id: 'u-4',
        timestamp: '2 hrs ago',
        author: 'Estate Operations Desk',
        message: 'SLA timer set to 90 mins. Beat 01 cart team en route.'
      }
    ]
  },
  {
    id: 'REP-1085',
    title: 'North Gate Resurfacing & Drainage Curb Completed',
    description: 'Crushed gravel and concrete paving at North Gate completed with stormwater drain curb installation.',
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
    assignedTeam: 'Beat 01 - Lead: Ramesh Kumar (BVG India)',
    reportedBy: {
      name: 'Campus Security Office',
      role: 'Estate Security Supervisor',
    },
    updates: [
      {
        id: 'u-5',
        timestamp: '1 day ago',
        author: 'Ramesh Kumar (BVG Lead)',
        message: 'Bitumen resurfacing and inspection completed. Verified safe.',
        statusChange: 'resolved'
      }
    ]
  },
  {
    id: 'REP-1081',
    title: 'Mechanical Workshop: Metal Scrap & Solvent Spill',
    description: 'Lathe machining shavings and coolant lubricating oil spillage across Bay 2 walkway creating slipping hazard.',
    category: 'safety',
    severity: 'urgent',
    status: 'in_progress',
    location: 'Central Mechanical Workshop, Bay 2 Passage',
    blockId: 'workshop',
    coordinates: { x: 45, y: 59 },
    gps: { latitude: 26.5013, longitude: 80.2654 },
    createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    timeAgo: '7 hrs ago',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    assignedTeam: 'Beat 01 - Lead: Ramesh Kumar (BVG India)',
    reportedBy: {
      name: 'Er. Sandeep Pandey',
      role: 'Workshop Lab Instructor',
    },
    updates: [
      {
        id: 'u-6',
        timestamp: '7 hrs ago',
        author: 'Er. Sandeep Pandey',
        message: 'Machining coolant leaked during practical exam session.',
      },
      {
        id: 'u-7',
        timestamp: '3 hrs ago',
        author: 'Ramesh Kumar (BVG)',
        message: 'Sawdust applied to absorb oil. Sweeping in progress.',
        statusChange: 'in_progress'
      }
    ]
  },
  {
    id: 'REP-1077',
    title: 'Heavy Waterlogging Near UIET Block 1 Lawn',
    description: 'Monsoon rainwater accumulation due to choked perimeter drain along west pedestrian pathway. Impeding wheelchair and pedestrian access.',
    category: 'waterlogging',
    severity: 'urgent',
    status: 'pending',
    location: 'UIET Block 1 West Pedestrian Corridor',
    blockId: 'block-1',
    coordinates: { x: 38, y: 44 },
    gps: { latitude: 26.5029, longitude: 80.2660 },
    createdAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
    timeAgo: '9 hrs ago',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    assignedTeam: 'Beat 01 - Lead: Ramesh Kumar (BVG India)',
    reportedBy: {
      name: 'Sunny Bharti',
      role: 'UIET B.Tech Student / Citizen Reporter',
    },
    updates: [
      {
        id: 'u-8',
        timestamp: '9 hrs ago',
        author: 'Sunny Bharti',
        message: 'Water depth approximately 6 inches. Students forced to walk through mud.'
      }
    ]
  },
  {
    id: 'REP-1072',
    title: 'Broken Study Benches & Window in Hostel Reading Room',
    description: 'Two study table fixtures broken and exterior window latch damaged in Dorm 4 common room causing cold drafts.',
    category: 'infrastructure',
    severity: 'normal',
    status: 'resolved',
    location: 'Hostel Complex, Dorm 4 Reading Room',
    blockId: 'hostels',
    coordinates: { x: 72, y: 74 },
    gps: { latitude: 26.5000, longitude: 80.2706 },
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    timeAgo: '18 hrs ago',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    assignedTeam: 'Beat 01 - Lead: Ramesh Kumar (BVG India)',
    reportedBy: {
      name: 'Sunny Bharti',
      role: 'UIET B.Tech Student / Citizen Reporter',
    },
    updates: [
      {
        id: 'u-11',
        timestamp: '18 hrs ago',
        author: 'Sunny Bharti',
        message: 'Reported on behalf of hostel residents committee.'
      },
      {
        id: 'u-12',
        timestamp: '2 hrs ago',
        author: 'Ramesh Kumar (BVG)',
        message: 'Carpentry squad replaced table joints and refitted window latch. Cleaned room.',
        statusChange: 'resolved'
      }
    ]
  },
  {
    id: 'REP-1065',
    title: 'Auditorium Bio-Waste & Food Wrappers Cleared',
    description: 'Post-convocation event trash including carton packaging and disposable containers successfully sanitized.',
    category: 'garbage',
    severity: 'normal',
    status: 'resolved',
    location: 'Central Auditorium Plaza Entrance',
    blockId: 'admin-block',
    coordinates: { x: 67, y: 55 },
    gps: { latitude: 26.5033, longitude: 80.2693 },
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    timeAgo: '20 hrs ago',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=800&q=80',
    assignedTeam: 'Beat 01 - Lead: Ramesh Kumar (BVG India)',
    reportedBy: {
      name: 'Er. R. K. Sharma',
      role: 'Executive Sanitation Engineer',
    },
    updates: [
      {
        id: 'u-13',
        timestamp: '5 hrs ago',
        author: 'Ramesh Kumar (BVG Lead)',
        message: 'Before & After AI photo verification passed with 97% cleanliness rating.',
        statusChange: 'resolved'
      }
    ]
  },
  {
    id: 'REP-1054',
    title: 'Unlit Pedestrian Stretch on Girls Hostel Road',
    description: 'Three consecutive street solar lamps non-operational between Health Centre and Girls Hostel. High student safety concern after 7 PM.',
    category: 'safety',
    severity: 'critical',
    status: 'resolved',
    location: 'Girls Hostel Access Road, Near Health Centre',
    blockId: 'health-centre',
    coordinates: { x: 58, y: 48 },
    gps: { latitude: 26.5020, longitude: 80.2687 },
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    timeAgo: '1.5 days ago',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=800&q=80',
    assignedTeam: 'Beat 01 - Lead: Ramesh Kumar (BVG India)',
    reportedBy: {
      name: 'Sunny Bharti',
      role: 'UIET B.Tech Student / Citizen Reporter',
    },
    updates: [
      {
        id: 'u-14',
        timestamp: '1.5 days ago',
        author: 'Sunny Bharti',
        message: 'Lodge urgent safety hazard for female students walking to library.'
      },
      {
        id: 'u-15',
        timestamp: '12 hrs ago',
        author: 'Er. R. K. Sharma (Estate)',
        message: 'Solar battery controller replaced. Illumination tested and verified safe.',
        statusChange: 'resolved'
      }
    ]
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
    id: 'LV-2026-01',
    workerId: 'USR-BVG-204',
    workerName: 'Ramesh Kumar',
    workerBadge: 'BVG-IND-KNP-204',
    startDate: '2026-10-14',
    endDate: '2026-10-15',
    daysCount: 2,
    type: 'sick',
    reason: 'Acute viral bronchitis & monsoon fever. Medical prescription attached from CSJMU Health Centre.',
    status: 'approved',
    appliedAt: '2026-10-10T08:30:00.000Z',
    reviewedBy: 'Er. R. K. Sharma (Executive Sanitation Engineer)',
    reviewRemarks: 'Approved. Standby Beat Lead (Sunil Yadav) deputed to Beat 01 during absence.',
    reviewedAt: '2026-10-10T11:00:00.000Z'
  },
  {
    id: 'LV-2026-02',
    workerId: 'USR-BVG-209',
    workerName: 'Suresh Chandra',
    workerBadge: 'BVG-IND-KNP-209',
    startDate: '2026-10-16',
    endDate: '2026-10-16',
    daysCount: 1,
    type: 'casual',
    reason: 'Daughter school admission counseling and document verification at Kanpur Nagar board.',
    status: 'pending',
    appliedAt: '2026-10-12T07:15:00.000Z'
  },
  {
    id: 'LV-2026-03',
    workerId: 'USR-BVG-214',
    workerName: 'Dharmendra Singh',
    workerBadge: 'BVG-IND-KNP-214',
    startDate: '2026-10-25',
    endDate: '2026-10-28',
    daysCount: 4,
    type: 'earned',
    reason: 'Annual Chhath Puja celebration in native village (Buxar, Bihar). Advance notice given.',
    status: 'approved',
    appliedAt: '2026-10-06T10:00:00.000Z',
    reviewedBy: 'Er. R. K. Sharma (Estate)',
    reviewRemarks: 'Approved. Advance beat roster adjusted with contractor BVG coordinator.',
    reviewedAt: '2026-10-07T14:20:00.000Z'
  },
  {
    id: 'LV-2026-04',
    workerId: 'USR-BVG-218',
    workerName: 'Sunil Yadav',
    workerBadge: 'BVG-IND-KNP-218',
    startDate: '2026-10-13',
    endDate: '2026-10-14',
    daysCount: 2,
    type: 'emergency',
    reason: 'Domestic sewer line rupture at residence causing sanitary emergency. Need urgent home repair.',
    status: 'pending',
    appliedAt: '2026-10-12T06:45:00.000Z'
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
    notes: 'Exposed 415V live terminal carries lethal electrocution risk. BVG sanitation sweepers lack Class-0 insulating gloves and dielectric testing tools. Must be escalated to Licensed Electrical Division (Team Beta).',
    status: 'pending',
    requestedAt: '2026-10-12T09:15:00.000Z'
  },
  {
    id: 'REASSIGN-102',
    reportId: 'REP-1077',
    reportTitle: 'Heavy Waterlogging Near UIET Block 1 Lawn',
    location: 'UIET Block 1 West Pedestrian Corridor',
    workerId: 'USR-BVG-209',
    workerName: 'Suresh Chandra',
    workerBadge: 'BVG-IND-KNP-209',
    currentBeat: 'Beat 02 (Drainage)',
    reason: 'equipment_needed',
    notes: 'Standing silt and mud requires high-vacuum suction tanker (UP-78-TK) and hydro-jetting nozzle to de-clog underground 12-inch RCC culvert.',
    status: 'pending',
    requestedAt: '2026-10-12T08:30:00.000Z'
  },
  {
    id: 'REASSIGN-103',
    reportId: 'REP-1085',
    reportTitle: 'Heavy Fallen Banyan Tree Limb Blocking Road',
    location: 'North Campus Entrance & Athletic Gate',
    workerId: 'USR-BVG-204',
    workerName: 'Ramesh Kumar',
    workerBadge: 'BVG-IND-KNP-204',
    currentBeat: 'Beat 01 (Sanitation)',
    reason: 'equipment_needed',
    notes: 'Massive trunk branch (est. 1.2 tons) blocking ambulance passage. Requires industrial hydraulic boom crane and gasoline chainsaw crew.',
    status: 'approved',
    requestedAt: '2026-10-11T14:10:00.000Z',
    reviewedBy: 'Er. R. K. Sharma (Estate)',
    reviewedAt: '2026-10-11T15:00:00.000Z',
    reviewRemarks: 'Approved. Deputed CSJMU Horticulture & Tree Management Crane Squad.',
    newAssignee: 'Horticulture Heavy Crane Unit'
  },
  {
    id: 'REASSIGN-104',
    reportId: 'REP-1081',
    reportTitle: 'Corrosive Chemical Reagent Spill in Chemistry Corridor',
    location: 'Science Block B, Ground Floor Corridor',
    workerId: 'USR-BVG-218',
    workerName: 'Sunil Yadav',
    workerBadge: 'BVG-IND-KNP-218',
    currentBeat: 'Beat 03',
    reason: 'safety_hazard',
    notes: 'Hydrochloric acid vapors detected from cracked 5L carboy. BVG janitorial brooms cannot contact acid. Requires Chemical Spill Containment & Hazmat Unit with soda ash neutralizer.',
    status: 'pending',
    requestedAt: '2026-10-12T10:00:00.000Z'
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
    agency: 'BVG India Ltd. (Facility Contractor)',
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
    name: 'Prof. A. K. Shukla (Registrar)',
    email: 'registrar@csjmu.ac.in',
    role: 'super_admin',
    pin: '9999',
    agency: 'CSJMU Central Secretariat',
    department: 'Directorate of Campus Administration & IT',
    badgeNumber: 'CSJMU-ROOT-001',
    lastLogin: 'Today, 09:00 AM',
    status: 'active'
  }
];
