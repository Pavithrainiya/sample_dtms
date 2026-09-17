import { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { 
  Search, Filter, Clock, CheckCircle, AlertCircle, PlusCircle, Trash2, Calendar, 
  Edit, Save, X, LayoutDashboard, Users, Settings, Menu, Sparkles, Upload, ExternalLink, 
  Bot, UserCheck, Award, Zap, BookOpen, Mic, Layers, Activity, Flame, DollarSign, ShieldCheck,
  Bell, FileText, CheckSquare, LogOut
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, 
  ResponsiveContainer, CartesianGrid 
} from 'recharts';
import VoiceTaskModal from '../components/VoiceTaskModal';
import AITaskBreakdownModal from '../components/AITaskBreakdownModal';
import WorkloadOptimizerModal from '../components/WorkloadOptimizerModal';
import GanttRoadmapView from '../components/GanttRoadmapView';
import MissionAnalyst from '../components/MissionAnalyst';
import ThemeToggle from '../components/ThemeToggle';
import RAGKnowledgeView from '../components/RAGKnowledgeView';

export default function UserDashboard() {
  const { user, logout } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const isLight = theme === 'light';
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_tasks: 0, completed_tasks: 0, pending_tasks: 0, completion_rate: 0,
    task_completion_data: [], submission_status_data: [], assignment_metrics: [],
    skill_distribution_data: [], workforce_utilization_rate: 0, ai_insights: ''
  });
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activeView, setActiveView] = useState('center'); // center, gantt, talent, audit, profile
  const [users, setUsers] = useState([]);
  const [talentDirectory, setTalentDirectory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Task & Filter States
  const [searchTaskTerm, setSearchTaskTerm] = useState('');
  const [searchSubTerm, setSearchSubTerm] = useState('');
  const [subFilter, setSubFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('overview'); // overview, assigned, completed

  // Modals & AI States
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  const [showWorkloadModal, setShowWorkloadModal] = useState(false);
  const [predictiveMap, setPredictiveMap] = useState({});

  // Natural Language Search States
  const [nlQuery, setNlQuery] = useState('');
  const [nlSearchResult, setNlSearchResult] = useState('');
  const [isNlSearching, setIsNlSearching] = useState(false);

  useEffect(() => {
    fetchData();
    fetchUsers();
    fetchTalentDirectory();
  }, []);

  const fetchData = async () => {
    try {
      const ts = new Date().getTime();
      const [statsRes, tasksRes, subsRes, predictRes] = await Promise.all([
        api.get(`tasks/dashboard/stats/?_cb=${ts}`),
        api.get(`tasks/tasks/?_cb=${ts}`),
        api.get(`tasks/submissions/?_cb=${ts}`),
        api.post(`tasks/predict-completion/`, {})
      ]);
      setStats(statsRes.data);
      setTasks(tasksRes.data);
      setSubmissions(subsRes.data);
      
      const pMap = {};
      if (predictRes.data?.predictions) {
        predictRes.data.predictions.forEach(p => { pMap[p.task_id] = p; });
      }
      setPredictiveMap(pMap);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('auth/users/');
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users");
    }
  };

  const fetchTalentDirectory = async () => {
    try {
      const res = await api.get('auth/talent/');
      setTalentDirectory(res.data);
    } catch (err) {
      console.error("Failed to fetch talent directory");
    }
  };

  const handleRunNlSearch = async (e) => {
    e.preventDefault();
    if (!nlQuery.trim()) return;
    setIsNlSearching(true);
    try {
      const res = await api.post('tasks/talent-search/', { query: nlQuery });
      setNlSearchResult(res.data.reply || '');
      toast.success("Talent Search RAG query processed!");
    } catch (err) {
      toast.error("Failed to execute natural language search");
    } finally {
      setIsNlSearching(false);
    }
  };

  const handleAIEvaluate = async (id) => {
    const toastId = toast.loading('Mission Intelligence is analyzing context...');
    try {
      const res = await api.post(`tasks/submissions/${id}/evaluate/`);
      toast.dismiss(toastId);
      const aiData = res.data.ai_evaluation;
      alert(`🤖 Mission Intelligence Feedback:\n\nScore: ${aiData.score}/100\nGrade: ${aiData.grade}\n\nFeedback:\n${aiData.feedback}`);
      toast.success('Analysis complete');
    } catch (err) {
      toast.dismiss(toastId);
      toast.error('AI Intelligence assessment failed.');
    }
  };

  const mySubmissionsMap = useMemo(() => {
    const map = {};
    submissions.forEach(s => map[s.task] = s);
    return map;
  }, [submissions]);

  // Task Filter calculations
  const assignedTasks = useMemo(() => {
    return tasks.filter(t => !mySubmissionsMap[t.id] || mySubmissionsMap[t.id].status !== 'Reviewed');
  }, [tasks, mySubmissionsMap]);

  const completedTasks = useMemo(() => {
    return tasks.filter(t => mySubmissionsMap[t.id] && mySubmissionsMap[t.id].status === 'Reviewed');
  }, [tasks, mySubmissionsMap]);

  const displayTasks = useMemo(() => {
    let source = [];
    if (activeTab === 'assigned') source = assignedTasks;
    else if (activeTab === 'completed') source = completedTasks;
    else source = tasks;

    return source.filter(t => 
      t.title.toLowerCase().includes(searchTaskTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTaskTerm.toLowerCase())
    );
  }, [activeTab, assignedTasks, completedTasks, tasks, searchTaskTerm]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(s => {
      const matchesSearch = s.task_details?.title.toLowerCase().includes(searchSubTerm.toLowerCase()) ||
        (s.content || '').toLowerCase().includes(searchSubTerm.toLowerCase());
      const matchesFilter = subFilter === 'All' || s.status === subFilter;
      return matchesSearch && matchesFilter;
    });
  }, [submissions, searchSubTerm, subFilter]);

  const chartData = useMemo(() => [
    { name: 'Completed', value: stats.completed_tasks, color: '#10b981' },
    { name: 'In Progress', value: stats.pending_tasks, color: '#f59e0b' },
    { name: 'Available', value: Math.max(0, stats.total_tasks - stats.completed_tasks - stats.pending_tasks), color: '#475569' }
  ], [stats]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
    </div>
  );

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-300 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 cyber-grid-bg text-slate-100'}`}>
      {/* High-Tech User Sidebar */}
      <aside className={`w-72 flex flex-col hidden lg:flex z-20 transition-colors duration-300 border-r ${isLight ? 'bg-white border-slate-200/90 text-slate-800 shadow-xs' : 'bg-slate-900 border-slate-800 text-slate-100 shadow-2xl'}`}>
        {/* Brand Header */}
        <div className={`p-6 border-b ${isLight ? 'border-slate-100' : 'border-slate-800/80'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/25 border border-blue-400/30">
              <span className="text-white font-black text-2xl leading-none">D</span>
            </div>
            <div>
              <span className={`text-xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                DTMS <span className="text-blue-600">User</span>
              </span>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full inline-block mt-0.5 border border-blue-200/60">
                Talent Portal
              </p>
            </div>
          </div>
        </div>

        {/* User Identity Card */}
        <div className="px-4 pt-5 pb-3">
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${isLight ? 'bg-slate-50 border-slate-200/80 shadow-xs' : 'bg-slate-950/80 border-slate-800 shadow-inner'}`}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-black flex items-center justify-center text-base shadow-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full animate-pulse"></span>
              </div>
              <div className="overflow-hidden">
                <p className={`text-sm font-extrabold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {user?.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                    {user?.role || 'User'} Clearance
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Categorized matching user reference screenshot */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
          {/* 1. Dashboard */}
          <button
            onClick={() => setActiveView('dashboard')}
            className={`w-full px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-3 transition-all cursor-pointer ${
              activeView === 'dashboard' || activeView === 'center'
                ? 'bg-[#5452f6] text-white shadow-lg shadow-indigo-500/30 font-black'
                : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          {/* 2. Tasks */}
          <button
            onClick={() => setActiveView('tasks')}
            className={`w-full px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-3 transition-all cursor-pointer ${
              activeView === 'tasks'
                ? 'bg-[#5452f6] text-white shadow-lg shadow-indigo-500/30 font-black'
                : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CheckSquare size={18} />
            <span>Tasks</span>
          </button>

          {/* 3. Team */}
          <button
            onClick={() => setActiveView('team')}
            className={`w-full px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-3 transition-all cursor-pointer ${
              activeView === 'team' || activeView === 'talent'
                ? 'bg-[#5452f6] text-white shadow-lg shadow-indigo-500/30 font-black'
                : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users size={18} />
            <span>Team</span>
          </button>

          {/* 4. Analytics */}
          <button
            onClick={() => setActiveView('analytics')}
            className={`w-full px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-3 transition-all cursor-pointer ${
              activeView === 'analytics'
                ? 'bg-[#5452f6] text-white shadow-lg shadow-indigo-500/30 font-black'
                : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart size={18} />
            <span>Analytics</span>
          </button>

          {/* 5. Reports (RAG Model Knowledge Base) */}
          <button
            onClick={() => setActiveView('reports')}
            className={`w-full px-4 py-3 rounded-xl font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${
              activeView === 'reports' || activeView === 'audit'
                ? 'bg-[#5452f6] text-white shadow-lg shadow-indigo-500/30 font-black'
                : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText size={18} />
              <span>Reports</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold">RAG AI</span>
          </button>

          {/* 6. Settings */}
          <button
            onClick={() => setActiveView('settings')}
            className={`w-full px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-3 transition-all cursor-pointer ${
              activeView === 'settings' || activeView === 'profile'
                ? 'bg-[#5452f6] text-white shadow-lg shadow-indigo-500/30 font-black'
                : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </nav>

        {/* Logout Footer Button */}
        <div className={`p-4 border-t ${isLight ? 'border-slate-100 bg-slate-50/50' : 'border-slate-800 bg-slate-950/40'}`}>
          <button
            onClick={logout}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-3 transition-all cursor-pointer ${
              isLight
                ? 'text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200'
                : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 border border-transparent hover:border-rose-500/30'
            }`}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto w-full mx-auto">

        {/* Mobile Header Navbar */}
        <div className="mb-6 flex justify-between items-center lg:hidden bg-slate-900 p-4 rounded-xl shadow-lg border border-slate-800">
          <div className="flex items-center gap-3">
            <button className="text-slate-400 hover:text-cyan-400"><Menu size={24} /></button>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <div className="w-6 h-6 bg-indigo-500 rounded flex items-center justify-center text-xs">D</div> DTMS
            </h2>
          </div>
          <button onClick={logout} className="text-rose-400 font-bold text-sm bg-rose-500/10 px-4 py-2 rounded-lg border border-rose-500/20">Logout</button>
        </div>

        {/* Header Title Banner */}
        <div className="mb-8 animate-fade-in flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">{user?.name.split(' ')[0]}</span>
            </h1>
            <p className="text-slate-400 mt-2 font-medium text-sm">Review assigned missions, track delay risk, and submit deliverables.</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <ThemeToggle />
            <button 
              onClick={() => setShowWorkloadModal(true)}
              className="bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold px-3 py-2 rounded-xl text-xs hover:bg-amber-500/20 transition-all flex items-center gap-1.5"
            >
              <Flame size={14} /> Workload Optimizer
            </button>
            <p className="text-xs font-bold text-slate-300 bg-slate-900 px-4 py-2.5 rounded-xl shadow-sm border border-slate-800 inline-flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400" /> Clearance Active
            </p>
          </div>
        </div>

        {/* AI Performance Insights Callout Banner (Matching Admin Dashboard) */}
        {stats.ai_insights && (
          <div className="mb-8 p-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white rounded-2xl shadow-lg border border-indigo-700/50 flex items-start gap-4 animate-fade-in">
             <div className="p-2 bg-indigo-500/30 rounded-xl text-cyan-400 mt-0.5"><Sparkles size={22}/></div>
             <div className="flex-1">
                <h4 className="text-xs font-black uppercase tracking-widest text-cyan-300 mb-1">🤖 AI Mission Directive & Personal Intelligence</h4>
                <p className="text-sm font-medium leading-relaxed text-slate-200">{stats.ai_insights}</p>
             </div>
          </div>
        )}

        {/* View 1: Command Center / Dashboard */}
        {(activeView === 'center' || activeView === 'dashboard') && (
          <>
            {/* Global Metric Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-colors group cursor-pointer" onClick={() => setActiveTab('overview')}>
                <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2 group-hover:text-cyan-400 transition-colors">Assigned Missions</h3>
                <p className="text-4xl font-black text-white">{stats.total_tasks}</p>
              </div>
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-colors group cursor-pointer" onClick={() => setActiveTab('completed')}>
                <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2 group-hover:text-emerald-400 transition-colors">Certified Submissions</h3>
                <p className="text-4xl font-black text-emerald-400">{stats.completed_tasks}</p>
              </div>
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-colors group cursor-pointer" onClick={() => setActiveTab('assigned')}>
                <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2 group-hover:text-amber-400 transition-colors">Pending Review</h3>
                <p className="text-4xl font-black text-amber-400">{stats.pending_tasks}</p>
              </div>
              <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 relative overflow-hidden bg-gradient-to-br from-indigo-900/80 to-slate-900 text-white">
                <h3 className="text-cyan-200 text-xs font-black uppercase tracking-widest mb-2">Network Yield</h3>
                <p className="text-4xl font-black">{stats.completion_rate}%</p>
                <div className="w-full bg-slate-950/60 rounded-full h-2 mt-2">
                   <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-2 rounded-full" style={{ width: `${stats.completion_rate}%` }}></div>
                </div>
              </div>
            </div>

            {/* Graphical Analytics Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:shadow-md transition-shadow">
                <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2"><Award size={16} className="text-cyan-400"/> Personal Completion Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#0f172a', color: '#fff', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:shadow-md transition-shadow">
                <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2"><Activity size={16} className="text-indigo-400"/> Mission Status Breakdown</h3>
                <div className="space-y-4 pt-2">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-400">Completed & Certified</span>
                      <span className="text-emerald-400">{stats.completed_tasks} Missions</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-3">
                      <div className="bg-emerald-500 h-3 rounded-full" style={{ width: `${(stats.completed_tasks / max1(stats.total_tasks)) * 100}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-400">Pending Review</span>
                      <span className="text-amber-400">{stats.pending_tasks} Missions</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-3">
                      <div className="bg-amber-500 h-3 rounded-full" style={{ width: `${(stats.pending_tasks / max1(stats.total_tasks)) * 100}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-400">Completion Ratio</span>
                      <span className="text-cyan-400">{stats.completion_rate}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-3">
                      <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-3 rounded-full" style={{ width: `${stats.completion_rate}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Tasks List Section */}
            <div className="glass-panel rounded-2xl border border-slate-800 flex flex-col min-h-[500px]">
              <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/50 rounded-t-2xl">
                <h3 className="text-lg font-black text-white flex items-center gap-2"><Calendar size={20} className="text-indigo-400" /> Active Assigned Missions</h3>
                <div className="flex items-center gap-3">
                  <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-800 text-xs font-bold">
                    <button onClick={() => setActiveTab('overview')} className={`px-3 py-1 rounded-lg ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>All</button>
                    <button onClick={() => setActiveTab('assigned')} className={`px-3 py-1 rounded-lg ${activeTab === 'assigned' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Assigned</button>
                    <button onClick={() => setActiveTab('completed')} className={`px-3 py-1 rounded-lg ${activeTab === 'completed' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Completed</button>
                  </div>
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input type="text" placeholder="Search missions..." className="pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl w-full sm:w-48 focus:ring-2 focus:ring-cyan-400 outline-none text-sm font-medium text-white placeholder-slate-500" value={searchTaskTerm} onChange={e => setSearchTaskTerm(e.target.value)} />
                  </div>
                </div>
              </div>

              <ul className="overflow-y-auto flex-1 divide-y divide-slate-800/80 p-2">
                {displayTasks.map(t => {
                  const sub = mySubmissionsMap[t.id];
                  const isSubmitted = !!sub;
                  const pred = predictiveMap[t.id];
                  let statusColor = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
                  if (isSubmitted && sub.status === 'Reviewed') statusColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
                  if (isSubmitted && sub.status === 'Submitted') statusColor = 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';

                  return (
                    <li key={t.id} className="p-4 hover:bg-slate-900/60 rounded-xl transition-colors group select-none">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                             <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors cursor-pointer text-base">{t.title}</h4>
                             <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-black border ${statusColor}`}>
                                {!isSubmitted ? 'Pending Action' : sub.status}
                             </span>
                             {pred && (
                               <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${
                                  pred.completion_probability >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                                  pred.completion_probability >= 50 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                               }`}>
                                  <Activity size={10}/> {pred.completion_probability}% On-Time ({pred.risk_level})
                               </span>
                             )}
                          </div>
                          <p className="text-xs font-medium text-slate-400 mb-2 truncate max-w-xl">{t.description}</p>
                          <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                            <span><Clock size={14} className="inline mr-1 text-amber-400"/> Due: {new Date(t.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(t.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                        <div>
                          <button onClick={() => navigate(`/tasks/${t.id}`)} className="bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-black text-xs px-4 py-2 rounded-xl hover:shadow-cyan-500/20 shadow-md transition-all flex items-center gap-1.5">
                            Review Mission <ExternalLink size={14}/>
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}

        {/* View 2: Tasks View */}
        {activeView === 'tasks' && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex justify-between items-center bg-slate-900/60">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <CheckSquare size={22} className="text-cyan-400" /> Assigned Tasks & Deliverable Workspace
                </h3>
                <p className="text-xs font-medium text-slate-400 mt-1">Review your assigned tasks, attached guidelines & SOPs, deadlines, and upload completed work.</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Filter tasks..." 
                  className="pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl w-60 focus:ring-2 focus:ring-cyan-400 outline-none text-xs font-medium text-white placeholder-slate-500" 
                  value={searchTaskTerm} 
                  onChange={e => setSearchTaskTerm(e.target.value)} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {displayTasks.map(t => {
                const sub = mySubmissionsMap[t.id];
                const isSubmitted = !!sub;
                return (
                  <div key={t.id} className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-all flex flex-col md:flex-row justify-between gap-6 items-start">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h4 className="text-lg font-black text-white">{t.title}</h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${isSubmitted ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                          {isSubmitted ? `Submitted (${sub.status})` : 'Pending Submission'}
                        </span>
                        {t.priority && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                            {t.priority} Priority
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-slate-300 leading-relaxed">{t.description}</p>
                      
                      <div className="flex items-center gap-6 text-xs font-bold text-slate-400 pt-2 border-t border-slate-800/80">
                        <span className="flex items-center gap-1.5 text-amber-400">
                          <Clock size={15} /> Deadline: {new Date(t.deadline).toLocaleDateString()} at {new Date(t.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {t.document && (
                          <a 
                            href={t.document} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="flex items-center gap-1 text-cyan-400 hover:underline font-bold"
                          >
                            <FileText size={15} /> View Attached Brief Document
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 min-w-[160px]">
                      <button 
                        onClick={() => navigate(`/tasks/${t.id}`)} 
                        className="w-full bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-black text-xs px-4 py-3 rounded-xl hover:shadow-cyan-500/20 shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <Upload size={14} /> Submit Work
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* View 3: Team View */}
        {(activeView === 'team' || activeView === 'talent') && (
          <div className="space-y-6 animate-fade-in">
             <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-3xl text-white shadow-xl border border-slate-800">
                <div className="flex items-center gap-3 mb-3">
                   <div className="p-2 bg-indigo-500/20 rounded-xl text-cyan-400"><Bot size={24}/></div>
                   <div>
                      <h3 className="text-xl font-black">Natural Language Talent Search (RAG Engine)</h3>
                      <p className="text-xs text-slate-400">Query team workforce knowledge base in plain English.</p>
                   </div>
                </div>

                <form onSubmit={handleRunNlSearch} className="flex gap-3 mt-4">
                   <input 
                      type="text" 
                      placeholder="e.g. Find team members experienced in React and Django REST framework"
                      className="flex-1 bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 px-5 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-cyan-400 text-sm font-medium"
                      value={nlQuery}
                      onChange={e => setNlQuery(e.target.value)}
                   />
                   <button 
                      type="submit" 
                      disabled={isNlSearching || !nlQuery.trim()}
                      className="bg-gradient-to-r from-indigo-600 to-cyan-500 text-white px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 text-xs"
                   >
                      <Sparkles size={16}/> Search AI
                   </button>
                </form>

                {nlSearchResult && (
                   <div className="mt-6 p-6 bg-slate-800/90 rounded-2xl border border-slate-700 text-sm leading-relaxed whitespace-pre-wrap animate-fade-in text-slate-200">
                      {nlSearchResult}
                   </div>
                )}
             </div>

             <div className="glass-panel rounded-3xl shadow-sm border border-slate-800 p-6">
                <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2"><UserCheck size={20} className="text-cyan-400"/> Enterprise Team Directory ({talentDirectory.length})</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {talentDirectory.map(t => (
                      <div key={t.id} className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 hover:border-indigo-500/40 transition-all shadow-sm">
                         <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                               <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 text-white flex items-center justify-center font-black text-lg">
                                  {t.name.charAt(0)}
                               </div>
                               <div>
                                  <h4 className="font-black text-white leading-snug text-base">{t.name}</h4>
                                  <p className="text-xs font-bold text-cyan-400">{t.designation || 'Talent Specialist'} • {t.department || 'Engineering'}</p>
                               </div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${t.availability_status === 'Available' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'}`}>
                               {t.availability_status || 'Available'}
                            </span>
                         </div>

                         <div className="space-y-2 border-t border-slate-800 pt-4 text-xs font-medium text-slate-400">
                            <p><strong className="text-slate-200">Skills:</strong> {t.skills || 'General Engineering'}</p>
                            <p><strong className="text-slate-200">Capacity:</strong> {t.weekly_capacity_hours || 40}h / week</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {/* View 4: Analytics View */}
        {activeView === 'analytics' && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/60 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <BarChart size={22} className="text-indigo-400" /> Productivity Analytics & Performance Yield
                </h3>
                <p className="text-xs font-medium text-slate-400 mt-1">Real-time metrics on your mission completion performance, deadline compliance, and workload balance.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-panel p-6 rounded-2xl border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2"><Award size={16} className="text-cyan-400"/> Personal Completion Ratio</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#0f172a', color: '#fff' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Zap size={16} className="text-amber-400"/> Performance Scorecard</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Completion Rate</span>
                    <span className="text-3xl font-black text-emerald-400">{stats.completion_rate}%</span>
                  </div>
                  <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Assigned Deliverables</span>
                    <span className="text-3xl font-black text-cyan-400">{stats.total_tasks}</span>
                  </div>
                  <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Verified Submissions</span>
                    <span className="text-3xl font-black text-indigo-400">{stats.completed_tasks}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View 5: Reports View (RAG Knowledge Intelligence + Audit Logs) */}
        {(activeView === 'reports' || activeView === 'audit') && (
          <div className="space-y-8 animate-fade-in">
            <RAGKnowledgeView isLight={isLight} />

            <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <h3 className="text-lg font-black text-white flex items-center gap-2"><CheckCircle size={20} className="text-emerald-400" /> My Submission Audit Logs</h3>
                <div className="flex gap-2">
                  <select className="border border-slate-700 bg-slate-950 text-white rounded-lg px-3 py-1.5 text-xs font-bold" value={subFilter} onChange={e => setSubFilter(e.target.value)}>
                    <option value="All">All Submissions</option>
                    <option value="Submitted">Pending Review</option>
                    <option value="Reviewed">Approved & Certified</option>
                  </select>
                </div>
              </div>
              <div className="divide-y divide-slate-800">
                {filteredSubmissions.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <CheckCircle size={48} className="mx-auto text-slate-700 mb-4" />
                    <p className="font-bold text-slate-400">No submissions found matching the selected filter.</p>
                  </div>
                ) : (
                  filteredSubmissions.map(s => (
                    <div key={s.id} className="p-6 hover:bg-slate-900/60 transition-all flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-xs font-black text-white">{s.task_details?.title}</span>
                          {s.status === 'Reviewed' && <span className="text-[10px] px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-black rounded-full">APPROVED & CERTIFIED</span>}
                          {s.status === 'Submitted' && <span className="text-[10px] px-2.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 font-black rounded-full">PENDING AUDIT</span>}
                        </div>
                        <p className="text-xs text-slate-400 font-medium line-clamp-2">{s.content || "Deliverable submission attached"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleAIEvaluate(s.id)} className="p-2.5 bg-slate-900 text-amber-400 rounded-xl hover:bg-black border border-slate-800 transition-colors" title="AI Review Evaluation"><Sparkles size={16} /></button>
                        <button onClick={() => navigate(`/tasks/${s.task}`)} className="px-3.5 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 border border-slate-700 transition-all flex items-center gap-1">
                          View Detail <ExternalLink size={14}/>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* View 6: Settings View */}
        {(activeView === 'settings' || activeView === 'profile') && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="glass-panel p-8 rounded-3xl border border-indigo-500/30 relative overflow-hidden text-center">
              <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-cyan-400 rounded-2xl flex items-center justify-center text-white text-3xl font-black mb-6 shadow-lg mx-auto">
                {user?.name.charAt(0)}
              </div>
              <h3 className="text-2xl font-black text-white mb-1">{user?.name}</h3>
              <p className="text-cyan-400 font-black text-xs uppercase tracking-widest mb-6">Operational Talent Clearance</p>

              <div className="space-y-4 border-t border-slate-800 pt-6 text-left text-xs">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-400">Account Status</span>
                  <span className="font-black text-emerald-400 flex items-center gap-1"><CheckCircle size={14} /> ACTIVE CLEARANCE</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-400">Email Address</span>
                  <span className="font-black text-white">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-400">Security Role</span>
                  <span className="font-black text-cyan-400">{user?.role}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Workload Peak & Burnout Optimizer Modal */}
      <WorkloadOptimizerModal
        isOpen={showWorkloadModal}
        onClose={() => setShowWorkloadModal(false)}
      />

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
      `}} />
      <MissionAnalyst />
    </div>
  );
}

function max1(val) {
  return Math.max(1, val || 0);
}
