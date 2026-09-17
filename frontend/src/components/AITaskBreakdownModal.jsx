import React, { useState } from 'react';
import { Sparkles, X, PlusCircle, Check, Layers, Clock, Award } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function AITaskBreakdownModal({ isOpen, onClose, onAddMilestoneToTask }) {
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [milestones, setMilestones] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!goalTitle.trim()) {
      toast.error("Please enter a high-level project title or goal!");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('tasks/ai-breakdown/', {
        title: goalTitle,
        description: goalDescription
      });
      setMilestones(res.data.milestones || []);
      toast.success("AI Sub-task Breakdown generated!");
    } catch (err) {
      toast.error("Failed to generate sub-task breakdown");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-white shadow-md">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">AI Sub-Task Breakdown Generator</h3>
              <p className="text-xs text-slate-500">Decompose high-level project goals into actionable milestones</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">High-Level Objective / Project Title</label>
            <input
              type="text"
              placeholder="e.g. Build E-commerce Payment Gateway Integration"
              required
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
              value={goalTitle}
              onChange={e => setGoalTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Optional Target Scope / Requirements</label>
            <input
              type="text"
              placeholder="e.g. Stripe checkout API, webhooks, responsive React UI..."
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
              value={goalDescription}
              onChange={e => setGoalDescription(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !goalTitle.trim()}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-95 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Sparkles size={18} />
            {isLoading ? "AI Breakdown Engine Generating..." : "Generate AI Sub-Tasks"}
          </button>
        </form>

        {/* Milestones List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {milestones.map((m, idx) => (
            <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex justify-between items-start gap-4 hover:border-indigo-300 transition-all">
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 text-sm mb-1">{m.title}</h4>
                <p className="text-xs text-slate-600 mb-2 leading-relaxed">{m.description}</p>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1 text-indigo-600"><Clock size={12}/> {m.estimated_hours}h estimated</span>
                  <span className="flex items-center gap-1 text-purple-600"><Award size={12}/> Skills: {m.required_skills}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onAddMilestoneToTask(m);
                  toast.success(`Loaded sub-task "${m.title}" into task form!`);
                }}
                className="px-3 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-xl border border-indigo-200 hover:bg-indigo-100 text-xs flex items-center gap-1"
              >
                <PlusCircle size={14}/> Use Milestone
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
