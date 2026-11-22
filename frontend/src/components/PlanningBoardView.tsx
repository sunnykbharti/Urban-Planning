import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  Building,
  X
} from 'lucide-react';
import { PlanningProject } from '../types';
import { initialProjects } from '../data/mockData';

export const PlanningBoardView: React.FC = () => {
  const [projects, setProjects] = useState<PlanningProject[]>(initialProjects);
  const [showAddProjectModal, setShowAddProjectModal] = useState<boolean>(false);
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
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
      budget: newBudget.startsWith('₹') ? newBudget : `₹${newBudget}`,
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

  const getOverdueLabel = (targetDate: string, stage: string): string | null => {
    if (stage === 'Completed') return null;
    const months: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    const parts = targetDate.trim().toLowerCase().split(/\s+/);
    if (parts.length >= 2) {
      const month = months[parts[0].slice(0, 3)];
      const year = parseInt(parts[1], 10);
      if (month !== undefined && !isNaN(year)) {
        // Current local year is 2026, month is November (10)
        const diffMonths = (2026 - year) * 12 + (10 - month);
        if (diffMonths > 0) {
          return `Overdue by ${diffMonths} ${diffMonths === 1 ? 'month' : 'months'}`;
        }
      }
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-[6px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-semibold text-slate-900 leading-tight">
            Planning board
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Capital works, building retrofits, and campus masterplan projects.
          </p>
        </div>

        <button
          onClick={() => setShowAddProjectModal(true)}
          className="px-3.5 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-medium rounded-[6px] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Propose project</span>
        </button>
      </div>

      {/* Kanban Board Columns (5th column visible without horizontal scrolling at 1440px) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5 pb-4">
        {stages.map((stage) => {
          const stageProjects = projects.filter(p => p.stage === stage);
          const stageLabel = stage === 'In Progress' ? 'In progress' : stage;

          return (
            <div 
              key={stage} 
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData('text/plain') || draggedProjectId;
                if (id) moveProject(id, stage);
                setDraggedProjectId(null);
              }}
              className="bg-slate-50/70 rounded-[6px] border border-slate-200 p-3 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200">
                <h3 className="text-xs font-semibold text-slate-800">
                  {stageLabel}
                </h3>
                <span className="text-[11px] font-medium text-slate-500">
                  {stageProjects.length}
                </span>
              </div>

              {/* Project Cards */}
              <div className="space-y-2.5 flex-1">
                {stageProjects.map((proj) => {
                  const overdueText = getOverdueLabel(proj.targetDate, proj.stage);

                  return (
                    <div
                      key={proj.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', proj.id);
                        setDraggedProjectId(proj.id);
                      }}
                      className="bg-white rounded-[6px] border border-slate-200 hover:border-slate-300 p-3 transition-colors flex flex-col justify-between cursor-grab active:cursor-grabbing space-y-2"
                    >
                      <div>
                        {/* Meta: ID and Priority Dot */}
                        <div className="flex items-center justify-between mb-1 text-xs">
                          <span className="text-slate-500 font-normal">{proj.id}</span>
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-600">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              proj.priority === 'High' ? 'bg-rose-500' : proj.priority === 'Medium' ? 'bg-amber-500' : 'bg-slate-400'
                            }`} />
                            <span>{proj.priority}</span>
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-medium text-slate-900 leading-snug mb-2">
                          {proj.title}
                        </h4>

                        {/* Details */}
                        <div className="space-y-1 text-[11px] text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Building className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{proj.block}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500 font-medium">₹</span>
                            <span className="font-medium text-slate-900">{proj.budget.replace(/^[₹$]/, '')}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>Target: {proj.targetDate}</span>
                          </div>
                          {overdueText && (
                            <div className="text-[11px] text-rose-700 font-medium pt-0.5">
                              {overdueText}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer: Engineer & Status Dropdown */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] gap-2">
                        <span className="text-slate-500 truncate">
                          {proj.leadEngineer || 'Unassigned'}
                        </span>

                        <select
                          value={proj.stage}
                          onChange={(e) => moveProject(proj.id, e.target.value as any)}
                          className="text-[10px] font-medium bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-700 cursor-pointer focus:outline-hidden"
                          title="Change stage"
                        >
                          {stages.map(s => (
                            <option key={s} value={s}>
                              {s === 'In Progress' ? 'In progress' : s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Project Modal */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[6px] max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Propose project</h3>
              <button 
                onClick={() => setShowAddProjectModal(false)} 
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddProject} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Project title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Solar lighting at Central Quad"
                  className="w-full p-2 border border-slate-300 rounded-[6px] bg-white text-slate-900 focus:border-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Target campus block</label>
                <input
                  type="text"
                  required
                  value={newBlock}
                  onChange={(e) => setNewBlock(e.target.value)}
                  placeholder="e.g. Science Block B & Library"
                  className="w-full p-2 border border-slate-300 rounded-[6px] bg-white text-slate-900 focus:border-indigo-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Estimated budget (₹)</label>
                  <input
                    type="text"
                    required
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    placeholder="₹15,00,000"
                    className="w-full p-2 border border-slate-300 rounded-[6px] bg-white text-slate-900 focus:border-indigo-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-[6px] bg-white text-slate-900 focus:border-indigo-600 outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-[6px] text-slate-600 hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-[6px] font-medium cursor-pointer"
                >
                  Propose project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
