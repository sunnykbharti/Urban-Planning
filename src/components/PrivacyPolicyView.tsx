import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Eye, 
  FileCheck, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Building2, 
  Camera, 
  MapPin, 
  Server, 
  UserCheck, 
  AlertCircle 
} from 'lucide-react';

interface PrivacyPolicyViewProps {
  onBackToDashboard?: () => void;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onBackToDashboard }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = 6;

  const policySections = [
    {
      pageNumber: 1,
      title: 'Preamble & Scope of Civic Data Processing',
      subtitle: 'Commitment to student and resident confidentiality under Indian IT Acts',
      icon: Shield,
      content: (
        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <p>
            Chhatrapati Shahu Ji Maharaj University (CSJMU), Kanpur, operates this Urban Operations &amp; Civic Governance Portal 
            in strict compliance with the Information Technology Act, 2000, the Digital Personal Data Protection (DPDP) Act, 2023, 
            and university confidentiality ordinances.
          </p>
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 text-xs block">Key Privacy Commitments:</span>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>No commercial monetization, behavioral profiling, or ad tracking.</li>
              <li>Data collection is strictly limited to municipal and sanitary upkeep purposes.</li>
              <li>Public dashboards aggregate incident volumes without exposing private residential addresses or contact telephone numbers.</li>
            </ul>
          </div>
          <p>
            This policy applies to all incident reports lodged via the web interface, automated CCTV feeds processed by computer vision nodes, 
            and GPS telemetry submitted by contractor sanitation teams.
          </p>
        </div>
      )
    },
    {
      pageNumber: 2,
      title: 'Citizen & Student Incident Lodging Confidentiality',
      subtitle: 'Whistleblower protection and grievance identity safeguards',
      icon: UserCheck,
      content: (
        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <p>
            When students or staff report an infrastructure anomaly (such as overflowing refuse, waterlogging, or electrical hazards), 
            the portal captures minimal identifying telemetry:
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">Captured Operational Data:</span>
              <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                <li>Campus affiliation &amp; department</li>
                <li>Report category and description</li>
                <li>Photographic upload of anomaly</li>
                <li>Selected block or landmark coordinates</li>
              </ul>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">Protected &amp; Redacted Data:</span>
              <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                <li>Student roll numbers are not publicly visible</li>
                <li>Personal mobile numbers are masked</li>
                <li>Hostel room interior photos are rejected</li>
                <li>Dispatched contractor sees only the incident beat location</li>
              </ul>
            </div>
          </div>
          <p>
            Reporters may also choose to submit anonymous tickets for sensitive environmental concerns. In such cases, 
            the submission is attributed solely to "Campus Citizen" with no reverse directory linkage.
          </p>
        </div>
      )
    },
    {
      pageNumber: 3,
      title: 'CCTV Surveillance & Computer Vision Feed Ingestion',
      subtitle: 'Non-biometric object detection and automated image retention cycles',
      icon: Camera,
      content: (
        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <p>
            The Automated CCTV Pipeline ingests low-framerate video sub-streams from designated outdoor university surveillance cameras. 
            The processing architecture is governed by rigorous data protection standards:
          </p>
          <div className="space-y-2.5">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3">
              <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">A</div>
              <div>
                <span className="font-bold text-slate-800 block">Strict Non-Biometric Processing</span>
                <span className="text-slate-600">The YOLOv11 neural network is trained exclusively on solid waste, bin capacity, and silt debris. Facial recognition and biometric profiling are strictly omitted from the model pipeline.</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3">
              <div className="w-6 h-6 rounded bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">B</div>
              <div>
                <span className="font-bold text-slate-800 block">Automated Snapshot Purge Policy</span>
                <span className="text-slate-600">Raw CCTV image frames that yield no detected debris are discarded from memory buffers immediately. Frames triggering work orders are archived for a maximum 30-day verification audit cycle, after which they are permanently purged.</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3">
              <div className="w-6 h-6 rounded bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">C</div>
              <div>
                <span className="font-bold text-slate-800 block">Privacy Shield &amp; Homography Masking</span>
                <span className="text-slate-600">Fixed polygonal masks are applied across private residential dormitory windows and classroom openings to block image capture outside public thoroughfares.</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      pageNumber: 4,
      title: 'GIS Coordinates & Spatial Telemetry',
      subtitle: 'Handling of map pins, device location, and beat boundaries',
      icon: MapPin,
      content: (
        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <p>
            Geographic coordinates captured during incident submission are used solely by the Authority Resolution Engine (ARE) 
            to determine jurisdictional ward allocation (e.g., Ward 03, UIET Quadrangle, Central Library lawn):
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-1 text-slate-600">
            <li><strong>Browser Geolocation:</strong> Device GPS coordinates are requested once when dropping an incident pin and are never tracked continuously in the background.</li>
            <li><strong>Spatial Quantization:</strong> Precise coordinates are snapped to campus administrative centroids to prevent tracking private individual movement.</li>
            <li><strong>Worker Beat Geofencing:</strong> Contractor workforce telemetry is logged solely during active duty shifts within university perimeter fences to verify cleaning SLA adherence.</li>
          </ul>
        </div>
      )
    },
    {
      pageNumber: 5,
      title: 'Inter-Agency Data Sharing & Municipal Integration',
      subtitle: 'Protocols for data exchange with Kanpur Nagar Nigam and Smart City Kanpur',
      icon: Server,
      content: (
        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <p>
            CSJMU coordinates with local municipal bodies for peripheral road maintenance and solid waste transfer station haulage:
          </p>
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 text-xs block">Data Shared with Kanpur Nagar Nigam (KNN):</span>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>Aggregate solid waste metric weights (metric tons per month).</li>
              <li>Boundary storm-drain overflow alerts impacting Kalyanpur public roadways.</li>
              <li>Urban heat island canopy deficiency indexes for municipal afforestation campaigns.</li>
            </ul>
          </div>
          <p>
            Under no circumstances is identifiable student or faculty data transmitted to third-party municipal aggregators. 
            All exported datasets are strictly anonymized and aggregated.
          </p>
        </div>
      )
    },
    {
      pageNumber: 6,
      title: 'Citizen Rights & Grievance Redressal Officer',
      subtitle: 'Data access, correction requests, and institutional contact points',
      icon: FileCheck,
      content: (
        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <p>
            Under university data governance statutes, all campus citizens possess the following explicit rights regarding their civic data:
          </p>
          <div className="grid sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <span className="font-bold text-slate-800 block text-xs mb-1">Right to Inspect</span>
              <span className="text-[11px] text-slate-500">View all past incident records lodged under your student directory identity.</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <span className="font-bold text-slate-800 block text-xs mb-1">Right to Rectify</span>
              <span className="text-[11px] text-slate-500">Request correction of misattributed locations or erroneous resolution photos.</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <span className="font-bold text-slate-800 block text-xs mb-1">Right to Redact</span>
              <span className="text-[11px] text-slate-500">Request immediate removal of accidentally submitted personal imagery.</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 space-y-1.5 mt-2">
            <span className="font-bold text-slate-900 block text-xs">Official Grievance Redressal Authority:</span>
            <p className="text-slate-700 font-semibold text-xs">Prof. N. K. Sachan • Data Protection Officer (DPO)</p>
            <p className="text-slate-500 text-[11px]">Directorate of Information Technology &amp; Campus Network Services</p>
            <p className="text-slate-500 text-[11px]">Chhatrapati Shahu Ji Maharaj University, Kalyanpur, Kanpur - 208024</p>
            <p className="text-slate-600 text-[11px] font-mono mt-1">Email: dpo.grievance@csjmu.ac.in • Tel: +91 512 2580044 (Ext. 204)</p>
          </div>
        </div>
      )
    }
  ];

  const currentSection = policySections[currentPage - 1];
  const IconComponent = currentSection.icon;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#001e40] text-white flex items-center justify-center flex-shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Campus Data Privacy Policy</h1>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                DPDP 2023 Compliant
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Information confidentiality, sensor ingestion &amp; citizen identity safeguards
            </p>
          </div>
        </div>

        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#001e40] hover:bg-[#003366] text-white text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Operations Hub</span>
          </button>
        )}
      </div>

      {/* Pager Step Progress Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
          <span>Section {currentPage} of {totalPages}: {currentSection.title}</span>
          <span className="text-slate-500 font-mono text-[11px]">{Math.round((currentPage / totalPages) * 100)}% viewed</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex gap-1 p-0.5">
          {policySections.map((sec) => (
            <div
              key={sec.pageNumber}
              onClick={() => setCurrentPage(sec.pageNumber)}
              title={sec.title}
              className={`flex-1 h-full rounded-sm cursor-pointer transition-colors ${
                sec.pageNumber === currentPage
                  ? 'bg-[#001e40]'
                  : sec.pageNumber < currentPage
                  ? 'bg-slate-400'
                  : 'bg-slate-200 hover:bg-slate-300'
              }`}
            />
          ))}
        </div>

        {/* Section Navigation Pills */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 text-xs">
          {policySections.map((sec) => (
            <button
              key={sec.pageNumber}
              onClick={() => setCurrentPage(sec.pageNumber)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                sec.pageNumber === currentPage
                  ? 'bg-[#001e40] text-white font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Part {sec.pageNumber}: {sec.title.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Active Pager Card Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6 min-h-[360px] flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-start gap-4 border-b border-slate-100 pb-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-[#001e40] flex items-center justify-center flex-shrink-0">
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                Policy Clause {currentPage}.0
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                {currentSection.title}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentSection.subtitle}
              </p>
            </div>
          </div>

          <div className="pt-2">
            {currentSection.content}
          </div>
        </div>

        {/* Pagination Navigation Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Clause</span>
          </button>

          <span className="text-xs text-slate-500 font-medium">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-[#001e40] hover:bg-[#003366] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <span>Next Clause</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
