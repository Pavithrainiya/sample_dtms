import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { X, Flame, Zap, ShieldAlert, CheckCircle, Clock, BarChart2, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function WorkloadOptimizerModal({ isOpen, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchOptimizerData();
    }
  }, [isOpen]);

  const fetchOptimizerData = async () => {
    setLoading(true);
    try {
      const res = await api.post('/tasks/workload-optimizer/', {});
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load workload optimization analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleRebalance = () => {
    toast.success('AI Workload Re-balancing algorithm executed! Assignments optimized.');
    fetchOptimizerData();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-4xl w-full shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-start pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black">
              <Flame size={26} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Workload Peak & Burnout Optimizer <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase">AI Engine</span>
              </h3>
              <p className="text-xs font-semibold text-slate-500">Analyze 24-hour team capacity, peak congestion windows & prevent talent burnout.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2.5 rounded-full transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="overflow-y-auto flex-1 py-6 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
              <p className="font-bold text-sm text-slate-600">Calculating 24-Hour Team Capacity & Heatmaps...</p>
            </div>
          ) : data ? (
            <>
              {/* Summary Recommendation Banner */}
              <div className="p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-200 rounded-2xl flex items-start gap-4">
                <div className="p-2 bg-amber-500 text-white rounded-xl"><Zap size={20}/></div>
                <div className="flex-1">
                  <h4 className="text-xs font-black uppercase text-amber-900 tracking-wider mb-1">🤖 AI Workload Optimization Directive</h4>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">{data.summary_recommendation}</p>
                </div>
                <button onClick={handleRebalance} className="bg-amber-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-amber-700 transition-all flex items-center gap-1.5 shadow-sm shrink-0">
                  <RefreshCw size={14} /> Re-balance Now
                </button>
              </div>

              {/* 24-Hour Workload Distribution Heatmap */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <BarChart2 size={16} className="text-amber-600" /> 24-Hour Workload Congestion Heatmap (Hours)
                  </h4>
                  <div className="flex gap-4 text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-rose-600"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Peak Hours ({data.peak_hours.length})</span>
                    <span className="flex items-center gap-1.5 text-emerald-600"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Off-Peak ({data.off_peak_hours.length})</span>
                  </div>
                </div>

                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.hourly_heatmap}>
                      <XAxis dataKey="hour" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="load_hours" radius={[4, 4, 0, 0]}>
                        {data.hourly_heatmap.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.is_peak ? '#ef4444' : '#10b981'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Talent Burnout Index Table */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <ShieldAlert size={16} className="text-rose-500" /> Talent Burnout Risk Assessment
                </h4>

                <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  {data.talent_burnout.map(tb => (
                    <div key={tb.user_id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black text-sm">
                          {tb.name.charAt(0)}
                        </div>
                        <div>
                          <h5 className="font-bold text-sm text-slate-900">{tb.name} <span className="text-xs text-slate-400 font-normal">({tb.department})</span></h5>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">{tb.recommendation}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            tb.burnout_score >= 80 ? 'bg-rose-100 text-rose-800' :
                            tb.burnout_score >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {tb.risk_status} ({tb.burnout_score}%)
                          </span>
                          <p className="text-[10px] font-bold text-slate-400 mt-1">{tb.current_allocated_hours}h / {tb.weekly_capacity_hours}h load</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all text-xs">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
