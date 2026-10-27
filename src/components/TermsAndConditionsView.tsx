import React from 'react';
import { FileText, Shield, Scale, Clock, AlertTriangle, CheckCircle, ArrowLeft, Building2, MapPin } from 'lucide-react';

interface TermsAndConditionsViewProps {
  onBackToDashboard?: () => void;
}

export const TermsAndConditionsView: React.FC<TermsAndConditionsViewProps> = ({ onBackToDashboard }) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#001e40] text-white flex items-center justify-center flex-shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Terms &amp; Conditions of Service</h1>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                Official Statute • Ver 2.4
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Chhatrapati Shahu Ji Maharaj University (CSJMU) • Directorate of Estate &amp; Civic Works
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

      {/* Document Overview Summary Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs text-slate-700 leading-relaxed space-y-2">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Building2 className="w-4 h-4 text-[#001e40]" />
          <span>Institutional Notice &amp; Scope of Municipal Operations</span>
        </div>
        <p>
          This operational portal governs the digital infrastructure, incident triage, automated computer vision detection, 
          and contractor field dispatch workflows operated across the 264-acre campus of Chhatrapati Shahu Ji Maharaj University 
          (Kalyanpur, Kanpur, Uttar Pradesh - 208024). All access by registered students, faculty, contractor workforces, and university 
          officers is subject to the following statutory terms.
        </p>
        <div className="text-[11px] text-slate-500 pt-1">
          Last Revised: October 2026 • Issued under the authority of the Registrar &amp; Executive Sanitation Engineer.
        </div>
      </div>

      {/* Main Legal Clauses */}
      <div className="space-y-4">
        {/* Section 1 */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base border-b border-slate-100 pb-2">
            <span className="w-6 h-6 rounded bg-slate-100 text-slate-800 text-xs flex items-center justify-center font-bold">1</span>
            <h2>Role-Based Authentication &amp; System Integrity</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Access to privileged operational dashboards (Contractor Field Tasks, Estate Management Approvals, and Super Admin Terminal) 
            is strictly restricted via cryptographic Role-Based Access Control (RBAC). Arbitrary client-side elevation of roles is prohibited. 
            Official personnel are assigned verified directory PIN credentials. Any attempt to bypass authorization checkpoints or forge 
            credential headers will be logged and referred to the University Proctorial Board.
          </p>
          <ul className="text-xs text-slate-600 list-disc list-inside space-y-1 pl-2">
            <li><strong>Campus Citizens (Students/Faculty):</strong> Authorized to lodge infrastructure grievances, monitor public status tickets, and view microclimate data.</li>
            <li><strong>BVG Sanitation Workers:</strong> Mandated to accept dispatched beat orders, verify physical cleanups with photographic proof, and request equipment reassignments when hazards exceed standard PPE.</li>
            <li><strong>Estate Directorate:</strong> Authorized to oversee SLA compliance, manage contractor rosters, and approve leaves or reassignments.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base border-b border-slate-100 pb-2">
            <span className="w-6 h-6 rounded bg-slate-100 text-slate-800 text-xs flex items-center justify-center font-bold">2</span>
            <h2>Incident Reporting &amp; Photographic Evidence Guidelines</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Campus residents utilizing the Incident Lodge module must ensure accurate spatial tagging and genuine photographic evidence. 
            Frivolous, staged, duplicate, or abusive submissions interfere with emergency municipal dispatch and are strictly prohibited.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <span className="font-bold text-slate-900 block mb-1">Permissible Submissions</span>
              <span className="text-slate-600">Solid waste overflows, clogged stormwater drains, hazardous pavement potholes, broken sanitary fixtures, exposed electrical wiring, and fallen arboriculture limbs.</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <span className="font-bold text-slate-900 block mb-1">Prohibited Submissions</span>
              <span className="text-slate-600">Personal grievances, academic grading appeals, unauthorized commercial promotion, staging artificial garbage piles, or uploading imagery infringing individual privacy.</span>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base border-b border-slate-100 pb-2">
            <span className="w-6 h-6 rounded bg-slate-100 text-slate-800 text-xs flex items-center justify-center font-bold">3</span>
            <h2>Contractor Service Level Agreements (SLA) &amp; Auditing</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Facility management contractors (including BVG India Ltd.) operate under contractually binding Service Level Agreements. 
            All dispatched tickets generate automated time-stamped audit trails monitored by the Authority Resolution Engine (ARE).
          </p>
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="font-semibold text-slate-800">Critical Hazards (Exposed 415V cables, acid spills, blocked main gates)</span>
              <span className="font-mono font-bold text-red-700">Resolution SLA: &le; 2.0 Hours</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="font-semibold text-slate-800">High-Priority Waste (Mess hall refuse, academic foyer bin overflows)</span>
              <span className="font-mono font-bold text-amber-700">Resolution SLA: &le; 4.0 Hours</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="font-semibold text-slate-800">Standard Grounds Sanitation (Pathway leaves, lawn segregation)</span>
              <span className="font-mono font-bold text-emerald-700">Resolution SLA: &le; 24.0 Hours</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            Failure to meet SLA targets triggers financial deductions against monthly contractor clearance certificates as per Section 14.3 of the Master Facility Contract.
          </p>
        </section>

        {/* Section 4 */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base border-b border-slate-100 pb-2">
            <span className="w-6 h-6 rounded bg-slate-100 text-slate-800 text-xs flex items-center justify-center font-bold">4</span>
            <h2>Automated CCTV Video Surveillance &amp; AI Analysis</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The platform interfaces with stationary CCTV surveillance nodes deployed across university walkways, bin corrals, 
            and cafeteria perimeters. Automated computer vision models (YOLOv11 neural network architectures) process periodic snapshot 
            frames to estimate waste volume and detect bin overflow.
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            CCTV imagery processed by the system is strictly limited to object classification (overflow, litter pile, drain silt) 
            and spatial coordinates. Biometric facial identification is strictly excluded from all civic maintenance workflows.
          </p>
        </section>

        {/* Section 5 */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base border-b border-slate-100 pb-2">
            <span className="w-6 h-6 rounded bg-slate-100 text-slate-800 text-xs flex items-center justify-center font-bold">5</span>
            <h2>Geospatial Cartography &amp; Intellectual Property</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            All GIS boundary data, UIET architectural polygon footprints, microclimate thermal island models, and algorithmic routing rules 
            are proprietary assets of Chhatrapati Shahu Ji Maharaj University. Unauthorized extraction, commercial scraping, or publication 
            of raw campus security camera coordinates without written authorization from the Registrar is an actionable offense.
          </p>
        </section>

        {/* Section 6 */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base border-b border-slate-100 pb-2">
            <span className="w-6 h-6 rounded bg-slate-100 text-slate-800 text-xs flex items-center justify-center font-bold">6</span>
            <h2>Governing Law &amp; Jurisdiction</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            These terms are governed by the laws of India and university statutes established under the Uttar Pradesh State Universities Act, 1973. 
            Any dispute arising out of or in connection with the operation of this civic portal shall fall under the exclusive jurisdiction 
            of the competent courts situated in Kanpur Nagar, Uttar Pradesh.
          </p>
        </section>
      </div>

      {/* Official Sign-off Footer */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-center text-xs text-slate-600">
        <p className="font-semibold text-slate-800">
          For statutory inquiries or formal contractor clarifications, contact:
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          Office of the Executive Engineer • Directorate of Estate &amp; Works, CSJMU Kanpur • Email: estate.office@csjmu.ac.in
        </p>
      </div>
    </div>
  );
};
