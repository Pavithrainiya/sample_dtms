import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Calendar, Clock, AlertTriangle, CheckCircle, Activity, ChevronRight, Layers } from 'lucide-react';

export default function GanttRoadmapView({ tasks = [], submissions = [] }) {
  const [slaData, setSlaData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlaData();
  }, []);

  const fetchSlaData = async () => {
    try {
      const res = await api.get('/tasks/sla-workflows/');
      setSlaData(res.data);
    } catch (err) {
      console.error("Failed to load SLA workflow data");
    } finally {
      setLoading(false);
    }
  };

  const mySubMap = {};
  submissions.forEach(s => { mySubMap[s.task] = s; });

  const getTaskProgress = (t) => {
    const assignedCount = t.assigned_users?.length || 1;
    const reviewedCount = submissions.filter(s => s.task === t.id && s.status === 'Reviewed').length;
    const submittedCount = submissions.filter(s => s.task === t.id && s.status === 'Submitted').length;
    
    if (reviewedCount >= assignedCount) return 100;
    if (reviewedCount > 0) return Math.round((reviewedCount / assignedCount) * 80);
    if (submittedCount > 0) return 40;
    return 15;
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 animate-fade-in space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="text-indigo-600" size={24} /> Interactive Gantt Roadmap & SLA Predictor
          </h3>
          <p className="text-xs font-semibold text-slate-500 mt-1">Real-time task schedule tracking, milestone completion & SLA risk warnings.</p>
        </div>

        {slaData?.summary && (
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-emerald-600"><CheckCircle size={14}/> {slaData.summary.healthy_count} Healthy</span>
            <span className="flex items-center gap-1.5 text-amber-600"><Clock size={14}/> {slaData.summary.at_risk_count} At Risk</span>
            <span className="flex items-center gap-1.5 text-rose-600"><AlertTriangle size={14}/> {slaData.summary.breached_count} Breached</span>
          </div>
        )}
      </div>

      {/* Visual Timeline Section */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Layers size={40} className="mx-auto mb-3 opacity-30 text-indigo-500" />
            <p className="font-bold text-slate-600">No active tasks in Gantt roadmap</p>
          </div>
        ) : (
          tasks.map(t => {
            const progress = getTaskProgress(t);
            const slaItem = slaData?.sla_report?.find(s => s.task_id === t.id);
            const isBreached = slaItem?.sla_status === "SLA BREACHED";
            const isAtRisk = slaItem?.sla_status === "SLA AT RISK";

            return (
              <div key={t.id} className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all bg-slate-50/50 hover:bg-white shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div className="flex items-center gap-3">
                    <h4 className="font-black text-slate-900 text-base">{t.title}</h4>
                    {isBreached && <span className="bg-rose-100 text-rose-800 text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">🚨 SLA Breached</span>}
                    {isAtRisk && <span className="bg-amber-100 text-amber-800 text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">⚠️ At Risk</span>}
                    {!isBreached && !isAtRisk && <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">✓ On Track</span>}
                  </div>
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <Clock size={14} /> Deadline: {new Date(t.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Progress Bar & Milestone Timeline */}
                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                    <span className="text-slate-500">Milestone Progress: <strong className="text-indigo-600">{progress}%</strong></span>
                    <span className="text-slate-400 font-semibold">{t.assigned_users?.length || 0} Assigned Talent</span>
                  </div>
                  
                  <div className="w-full bg-slate-200 rounded-full h-3 relative overflow-hidden">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        progress === 100 ? 'bg-emerald-500' :
                        isBreached ? 'bg-rose-500' :
                        isAtRisk ? 'bg-amber-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* SLA Action Instruction */}
                {slaItem && (
                  <div className="text-xs font-medium text-slate-500 flex items-center justify-between pt-1">
                    <span>Action: <strong className="text-slate-700">{slaItem.action_required}</strong></span>
                    <span className="font-bold text-indigo-600 flex items-center gap-0.5">Details <ChevronRight size={14}/></span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
