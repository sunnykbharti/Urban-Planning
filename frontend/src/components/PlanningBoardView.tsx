import React, { useState } from 'react';
import { 
  Compass, 
  Plus, 
  Calendar, 
  DollarSign, 
  User, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Sparkles,
  Building
} from 'lucide-react';
import { PlanningProject } from '../types';
import { initialProjects } from '../data/mockData';

export const PlanningBoardView: React.FC = () => {
  const [projects, setProjects] = useState<PlanningProject[]>(initialProjects);
  const [showAddProjectModal, setShowAddProjectModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBlock, setNewBlock] = useState('UIET Block 1 & 2');
  const [newBudget, setNewBudget] = useState('₹15,00,000');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('High');

  const stages: PlanningProject['stage'][] = [
    'Backlog',
    'Assessment',
    'Procurement',
    'In Progress',
    'Completed'
  ];

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newProj: PlanningProject = {
      id: `PRJ-2026-0${projects.length + 1}`,
      title: newTitle.trim(),
      block: newBlock,
      stage: 'Assessment',
      budget: newBudget,
      targetDate: 'Dec 2026',
      priority: newPriority,
      leadEngineer: 'Er. R. K. Agrawal'
    };

    setProjects([newProj, ...projects]);
    setNewTitle('');
    setShowAddProjectModal(false);
  };

  const moveProject = (projectId: string, nextStage: PlanningProject['stage']) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, stage: nextStage } : p));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#c3c6d1] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-[#001e40]" />
            <h1 className="text-2xl md:text-3xl font-bold text-[#111c2d] tracking-tight">
              UIET Urban Planning &amp; Infrastructure Board
            </h1>
          </div>
          <p className="text-sm md:text-base text-[#43474f] mt-1">
            Capital works, building retrofits, energy efficiency, and long-term campus masterplan roadmap.
          </p>
        </div>

        <button
          onClick={() => setShowAddProjectModal(true)}
          className="px-4 py-2.5 bg-[#001e40] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#003366] flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Propose Campus Project
        </button>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto custom-scrollbar pb-4">
        {stages.map((stage) => {
          const stageProjects = projects.filter(p => p.stage === stage);
          return (
            <div key={stage} className="bg-[#f0f3ff] rounded-xl border border-[#d8e3fb] p-3 flex flex-col min-w-[240px]">
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#c3c6d1]">
                <h3 className="text-xs font-bold text-[#001e40] uppercase tracking-wider">
                  {stage}
                </h3>
                <span className="text-xs font-bold bg-[#dee8ff] text-[#001e40] px-2 py-0.5 rounded-full">
                  {stageProjects.length}
                </span>
              </div>

              {/* Project Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] custom-scrollbar">
                {stageProjects.map((proj) => (
                  <div
                    key={proj.id}
                    className="bg-white rounded-lg border border-[#c3c6d1] hover:border-[#001e40] p-3 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono font-bold text-[#737780]">{proj.id}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          proj.priority === 'High'
                            ? 'bg-[#ffdad6] text-[#93000a]'
                            : 'bg-[#d1e1f4] text-[#556474]'
                        }`}>
                          {proj.priority}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-[#111c2d] leading-snug group-hover:text-[#001e40] transition-colors mb-2">
                        {proj.title}
                      </h4>

                      <div className="space-y-1 text-[11px] text-[#43474f] mb-3">
                        <div className="flex items-center gap-1">
                          <Building className="w-3 h-3 text-[#737780]" />
                          <span className="truncate">{proj.block}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-[#737780]" />
                          <span className="font-semibold text-[#001e40]">{proj.budget}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#737780]" />
                          <span>Target: {proj.targetDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Move stage control */}
                    <div className="pt-2 border-t border-[#e7eeff] flex items-center justify-between text-[11px]">
                      <span className="text-[10px] text-[#737780] truncate">Eng: {proj.leadEngineer.split(' ')[1]}</span>
                      {stage !== 'Completed' && (
                        <button
                          onClick={() => {
                            const nextIndex = stages.indexOf(stage) + 1;
                            if (nextIndex < stages.length) {
                              moveProject(proj.id, stages[nextIndex]);
                            }
                          }}
                          className="text-[#001e40] hover:text-[#003366] font-bold flex items-center gap-0.5 hover:underline"
                          title="Advance to next phase"
                        >
                          Next <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Project Modal */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-[#c3c6d1] shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#c3c6d1] mb-4">
              <h3 className="text-base font-bold text-[#001e40]">Propose Masterplan Project</h3>
              <button onClick={() => setShowAddProjectModal(false)} className="text-[#737780] hover:text-[#111c2d]">✕</button>
            </div>

            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#43474f] uppercase mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Smart Solar Lighting at Central Quad"
                  className="w-full text-xs p-2.5 border border-[#c3c6d1] rounded-lg bg-[#f0f3ff] focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#43474f] uppercase mb-1">Target Campus Block</label>
                <input
                  type="text"
                  required
                  value={newBlock}
                  onChange={(e) => setNewBlock(e.target.value)}
                  placeholder="e.g. Science Block B & Library"
                  className="w-full text-xs p-2.5 border border-[#c3c6d1] rounded-lg bg-[#f0f3ff] focus:bg-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#43474f] uppercase mb-1">Estimated Budget</label>
                  <input
                    type="text"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    placeholder="₹10,00,000"
                    className="w-full text-xs p-2.5 border border-[#c3c6d1] rounded-lg bg-[#f0f3ff] focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#43474f] uppercase mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full text-xs p-2.5 border border-[#c3c6d1] rounded-lg bg-[#f0f3ff] focus:bg-white outline-none"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#c3c6d1] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  className="px-4 py-2 border border-[#737780] text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#001e40] text-white text-xs font-bold rounded-lg hover:bg-[#003366]"
                >
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
