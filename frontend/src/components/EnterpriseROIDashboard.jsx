import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { DollarSign, Clock, TrendingUp, Award, ShieldCheck, Zap, BarChart2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function EnterpriseROIDashboard() {
  const [roi, setRoi] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoiData();
  }, []);

  const fetchRoiData = async () => {
    try {
      const res = await api.get('/tasks/enterprise-roi/');
      setRoi(res.data);
    } catch (err) {
      toast.error('Failed to load Enterprise ROI analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
      <p className="font-bold text-sm text-slate-600">Calculating Enterprise ROI & Savings Metrics...</p>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 animate-fade-in space-y-8">
      
      {/* Executive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-black uppercase tracking-wider">Enterprise Tier</span>
            <span className="text-xs font-bold text-slate-400">• Executive ROI Intelligence</span>
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight mt-1">Enterprise ROI & Financial Impact Analytics</h3>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-2.5 rounded-2xl border border-emerald-200 text-xs font-bold">
          <ShieldCheck size={18} className="text-emerald-600" /> Operational Efficiency Audit Verified
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-6 rounded-3xl shadow-lg shadow-emerald-600/20 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-emerald-300 opacity-40"><DollarSign size={40}/></div>
          <h4 className="text-xs font-black uppercase tracking-widest text-emerald-200 mb-2">Total Financial ROI</h4>
          <p className="text-4xl font-black">{roi?.financial_roi?.total_dollars_saved}</p>
          <p className="text-xs font-medium text-emerald-100 mt-3">Calculated at benchmark {roi?.financial_roi?.hourly_rate_benchmark}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black mb-4">
            <Clock size={20} />
          </div>
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Hours Saved by AI</h4>
          <p className="text-3xl font-black text-slate-900">{roi?.financial_roi?.total_hours_saved} hrs</p>
          <p className="text-xs font-bold text-indigo-600 mt-2">Dictation + AI Reviews + Matcher</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-purple-200 transition-colors">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black mb-4">
            <TrendingUp size={20} />
          </div>
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Velocity Improvement</h4>
          <p className="text-3xl font-black text-purple-600">+{roi?.performance_metrics?.velocity_improvement_pct}%</p>
          <p className="text-xs font-bold text-slate-500 mt-2">Avg {roi?.performance_metrics?.avg_completion_time_days} days to mission completion</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-amber-200 transition-colors">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black mb-4">
            <Award size={20} />
          </div>
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Evaluation Accuracy</h4>
          <p className="text-3xl font-black text-amber-600">{roi?.performance_metrics?.accuracy_score_pct}%</p>
          <p className="text-xs font-bold text-slate-500 mt-2">Multi-rubric AI grading consistency</p>
        </div>
      </div>

      {/* Monthly Financial Trend Chart */}
      <div className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-200/80">
        <h4 className="text-base font-black text-slate-900 mb-6 flex items-center gap-2">
          <BarChart2 size={20} className="text-emerald-600" /> Cumulative Financial Savings Growth (\$)
        </h4>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={roi?.monthly_trend || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `\$${val}`} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="dollars_saved" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakdown Hours Saved Table */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80">
          <h5 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">🎙️ Voice Dictation Savings</h5>
          <p className="text-2xl font-black text-slate-900">{roi?.financial_roi?.dictation_savings_hrs} Hours</p>
          <p className="text-xs text-slate-500 mt-1">Saved from speech-to-task parsing</p>
        </div>

        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80">
          <h5 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">🤖 Multi-Rubric AI Grading</h5>
          <p className="text-2xl font-black text-slate-900">{roi?.financial_roi?.evaluation_savings_hrs} Hours</p>
          <p className="text-xs text-slate-500 mt-1">Saved from automated rubric scoring</p>
        </div>

        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80">
          <h5 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">⚡ Vector Skill Matching</h5>
          <p className="text-2xl font-black text-slate-900">{roi?.financial_roi?.matching_savings_hrs} Hours</p>
          <p className="text-xs text-slate-500 mt-1">Saved from automated talent allocation</p>
        </div>
      </div>
    </div>
  );
}
