import { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Search, Filter, Clock, CheckCircle, AlertCircle, PlusCircle, Trash2, Calendar, Edit, Save, X, LayoutDashboard, Users, Settings, Menu, Sparkles, Upload, ExternalLink, Bot, UserCheck, Award, Zap, BookOpen, Mic, Layers, Activity, Flame, DollarSign, Bell, FileText, CheckSquare, LogOut } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, CartesianGrid } from 'recharts';
import VoiceTaskModal from '../components/VoiceTaskModal';
import AITaskBreakdownModal from '../components/AITaskBreakdownModal';
import WorkloadOptimizerModal from '../components/WorkloadOptimizerModal';
import GanttRoadmapView from '../components/GanttRoadmapView';
import EnterpriseROIDashboard from '../components/EnterpriseROIDashboard';
import ThemeToggle from '../components/ThemeToggle';
import RAGKnowledgeView from '../components/RAGKnowledgeView';

export default function AdminDashboard() {
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
  const [activeView, setActiveView] = useState('center'); // center, roi, gantt, talent, members, audit, profile
  const [users, setUsers] = useState([]);
  const [talentDirectory, setTalentDirectory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Task & Filter States
  const [searchTaskTerm, setSearchTaskTerm] = useState('');
  const [searchSubTerm, setSearchSubTerm] = useState('');
  const [subFilter, setSubFilter] = useState('All');

  const [newTask, setNewTask] = useState({ title: '', description: '', deadline: '', assigned_users: [] });
  const [taskAttachment, setTaskAttachment] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  // AI Power Package States
  const [matchingRecommendations, setMatchingRecommendations] = useState([]);
  const [isMatchingLoading, setIsMatchingLoading] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  const [showWorkloadModal, setShowWorkloadModal] = useState(false);
  const [predictiveMap, setPredictiveMap] = useState({});

  // Natural Language Talent Search States
  const [nlQuery, setNlQuery] = useState('');
  const [nlSearchResult, setNlSearchResult] = useState('');
  const [isNlSearching, setIsNlSearching] = useState(false);

  const minDateTime = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16);

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

  const handleRunTaskMatching = async () => {
    setIsMatchingLoading(true);
    setShowMatchModal(true);
    try {
      const res = await api.post('tasks/matching/recommend/', {
        title: newTask.title || 'Task Assignment',
        description: newTask.description,
        required_skills: newTask.description || newTask.title
      });
      setMatchingRecommendations(res.data.recommendations || []);
      toast.success("AI Task Matching Engine calculation complete!");
    } catch (err) {
      toast.error("Failed to compute AI candidate matching");
    } finally {
      setIsMatchingLoading(false);
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

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (newTask.assigned_users.length === 0) {
      toast.error("You must assign the task to at least one user.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append('title', newTask.title);
      formData.append('description', newTask.description);
      formData.append('deadline', newTask.deadline);

      newTask.assigned_users.forEach(uid => {
        formData.append('assigned_users', uid);
      });

      if (taskAttachment) {
        formData.append('attachment', taskAttachment);
      }

      await api.post('tasks/tasks/', formData);
      
      const calLink = generateCalendarLink({ title: newTask.title, description: newTask.description, deadline: newTask.deadline });
      
      toast.success((t) => (
        <span>
          Mission assigned! 
          <a href={calLink} target="_blank" rel="noreferrer" className="ml-2 text-indigo-600 underline font-black">Sync Calendar</a>
        </span>
      ), { duration: 6000 });

      setNewTask({ title: '', description: '', deadline: '', assigned_users: [] });
      setTaskAttachment(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to assign task');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this task?")) return;
    const toastId = toast.loading('Deleting task...');
    try {
      await api.delete(`tasks/tasks/${id}/`);
      toast.dismiss(toastId);
      toast.success('Task deleted successfully!');
      fetchData();
    } catch (err) {
      toast.dismiss(toastId);
      toast.error('Failed to delete task');
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/tasks/tasks/${editingTask.id}/`, editingTask);
      toast.success('Task assignments successfully updated!');
      setEditingTask(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to update task.');
    }
  };

  const handleReview = async (id, status) => {
    try {
      await api.put(`tasks/submissions/${id}/review/`, { status });
      toast.success(`Submission marked as ${status}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update submission');
    }
  };

  const handleAIEvaluate = async (id) => {
    const toastId = toast.loading('Mission Intelligence is analyzing context...');
    try {
      const res = await api.post(`tasks/submissions/${id}/evaluate/`);
      toast.dismiss(toastId);
      const aiData = res.data.ai_evaluation;
      alert(`🤖 Mission Intelligence Feedback:\n\nScore: ${aiData.score}/100\nRecommended Action: ${aiData.recommended_status}\n\nFeedback:\n${aiData.feedback}`);
      toast.success('Analysis complete');
    } catch (err) {
      toast.dismiss(toastId);
      toast.error('AI Intelligence assessment failed.');
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => t.title.toLowerCase().includes(searchTaskTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTaskTerm.toLowerCase()));
  }, [tasks, searchTaskTerm]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(s => {
      if (s.status === 'Pending') return false;
      const matchesSearch = s.user_details?.name.toLowerCase().includes(searchSubTerm.toLowerCase()) ||
        s.task_details?.title.toLowerCase().includes(searchSubTerm.toLowerCase());
      const matchesFilter = subFilter === 'All' || s.status === subFilter;
      return matchesSearch && matchesFilter;
    });
  }, [submissions, searchSubTerm, subFilter]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const generateCalendarLink = (task) => {
    const start = new Date(task.deadline).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const end = new Date(new Date(task.deadline).getTime() + 3600000).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const details = encodeURIComponent(`Mission Assigned: ${task.title}\n\nDescription: ${task.description}\n\nReview Mission at: http://localhost:5173/dashboard`);
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("[DTMS MISSION] " + task.title)}&dates=${start}/${end}&details=${details}&location=DTMS+Digital+Portal&sf=true&output=xml`;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
      {/* High-Tech Enterprise Sidebar */}
      <aside className={`w-72 flex flex-col hidden lg:flex z-20 transition-colors duration-300 border-r ${isLight ? 'bg-white border-slate-200/90 text-slate-800 shadow-xs' : 'bg-slate-900 border-slate-800 text-slate-100 shadow-2xl'}`}>
        {/* Brand Header */}
        <div className={`p-6 border-b ${isLight ? 'border-slate-100' : 'border-slate-800/80'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/25 border border-blue-400/30">
              <span className="text-white font-black text-2xl leading-none">D</span>
            </div>
            <div>
              <span className={`text-xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                DTMS <span className="text-blue-600">AI</span>
              </span>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full inline-block mt-0.5 border border-blue-200/60">
                Enterprise OS
              </p>
            </div>
          </div>
        </div>

        {/* User Identity Card */}
        <div className="px-4 pt-5 pb-3">
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${isLight ? 'bg-slate-50 border-slate-200/80 shadow-xs' : 'bg-slate-950/80 border-slate-800 shadow-inner'}`}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center text-base shadow-sm">
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
                    Admin Clearance
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
              activeView === 'team' || activeView === 'members' || activeView === 'talent'
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
              activeView === 'analytics' || activeView === 'roi'
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

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto w-full mx-auto">

        {/* Mobile Header Navbar */}
        <div className="mb-6 flex justify-between items-center lg:hidden bg-slate-900 p-4 rounded-xl shadow-lg border border-slate-800">
          <div className="flex items-center gap-3">
            <button className="text-slate-400 hover:text-indigo-400"><Menu size={24} /></button>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <div className="w-6 h-6 bg-indigo-500 rounded flex items-center justify-center text-xs">D</div> DTMS
            </h2>
          </div>
          <button onClick={logout} className="text-rose-400 font-bold text-sm bg-rose-500/10 px-4 py-2 rounded-lg border border-rose-500/20">Logout</button>
        </div>

        <div className="mb-8 animate-fade-in flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{user?.name.split(' ')[0]}</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Manage enterprise workforce, intelligent task allocations & AI talent matching.</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <p className="text-sm font-bold text-slate-500 bg-white px-4 py-2 rounded-full shadow-xs border border-slate-200 inline-flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-500" /> System Online
            </p>
          </div>
        </div>

        {/* AI Performance Insights Callout Banner */}
        {stats.ai_insights && (
          <div className="mb-8 p-4 bg-gradient-to-r from-indigo-900 to-purple-900 text-white rounded-2xl shadow-lg border border-indigo-700/50 flex items-start gap-4 animate-fade-in">
             <div className="p-2 bg-indigo-500/30 rounded-xl text-amber-300 mt-0.5"><Sparkles size={22}/></div>
             <div className="flex-1">
                <h4 className="text-xs font-black uppercase tracking-widest text-indigo-300 mb-1">🤖 AI Workforce Intelligence Directive</h4>
                <p className="text-sm font-medium leading-relaxed text-slate-100">{stats.ai_insights}</p>
             </div>
          </div>
        )}

        {activeView === 'center' && (
          <>
            {/* Global Statistics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-200 transition-colors group">
                <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2 group-hover:text-indigo-500 transition-colors">Total Broadcasts</h3>
                <p className="text-4xl font-black text-slate-800">{stats.total_tasks}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-200 transition-colors group">
                <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2 group-hover:text-emerald-500 transition-colors">Approved Submissions</h3>
                <p className="text-4xl font-black text-emerald-600">{stats.completed_tasks}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-amber-200 transition-colors group">
                <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2 group-hover:text-amber-500 transition-colors">Pending Review</h3>
                <p className="text-4xl font-black text-amber-500">{stats.pending_tasks}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden text-white bg-gradient-to-br from-indigo-600 to-indigo-800">
                <h3 className="text-indigo-200 text-xs font-black uppercase tracking-widest mb-2">Workforce Utilization</h3>
                <p className="text-4xl font-black">{stats.workforce_utilization_rate || 0}%</p>
                <div className="w-full bg-indigo-950/50 rounded-full h-2 mt-2">
                   <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${Math.min(100, stats.workforce_utilization_rate || 0)}%` }}></div>
                </div>
              </div>
            </div>

            {/* Graphical Analytics Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <h3 className="text-sm font-bold text-slate-800 mb-6">Task Completion (%)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.task_completion_data}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="completedPercentage" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Skill Distribution Analytics */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2"><Award size={16} className="text-indigo-600"/> Skill Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.skill_distribution_data || []} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                      <YAxis dataKey="skill" type="category" fontSize={11} tickLine={false} axisLine={false} width={80} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <h3 className="text-sm font-bold text-slate-800 mb-6">Submission Audit Breakdown</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.submission_status_data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {(stats.submission_status_data || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Task Creator with AI Matching Integration */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 mb-8 max-w-7xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><PlusCircle size={20} /></div>
                  <h3 className="text-xl font-black text-slate-800">Assign New Task</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button 
                    type="button"
                    onClick={() => setShowWorkloadModal(true)}
                    className="flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 font-bold px-3 py-2 rounded-xl text-xs hover:bg-amber-100 transition-all"
                  >
                    <Flame size={14} /> 🔥 Peak Optimizer
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowVoiceModal(true)}
                    className="flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 font-bold px-3 py-2 rounded-xl text-xs hover:bg-rose-100 transition-all"
                  >
                    <Mic size={14} /> 🎙️ Voice Dictation
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowBreakdownModal(true)}
                    className="flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-200 font-bold px-3 py-2 rounded-xl text-xs hover:bg-purple-100 transition-all"
                  >
                    <Layers size={14} /> ✨ AI Sub-tasks
                  </button>
                  <button 
                    type="button" 
                    onClick={handleRunTaskMatching}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md hover:opacity-95 transition-all active:scale-95"
                  >
                    <Sparkles size={14} /> 🤖 AI Auto-Recommend
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Task Title</label>
                  <input type="text" placeholder="e.g., React & Django REST API Development" required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow font-medium" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
                </div>
                <div className="md:col-span-6">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Detailed Description & Required Skills</label>
                  <input type="text" placeholder="e.g. Build backend API endpoints with PostgreSQL and React UI..." required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow font-medium" value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deadline</label>
                  <input type="datetime-local" required min={minDateTime} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow text-sm text-slate-600 font-bold" value={newTask.deadline} onChange={e => setNewTask({ ...newTask, deadline: e.target.value })} />
                </div>

                <div className="md:col-span-8">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assign To Specific Users</label>
                  <div className="border border-slate-200 rounded-xl bg-slate-50 p-3 flex flex-col gap-1.5 min-h-[48px] max-h-[160px] overflow-y-auto">
                    {users.filter(u => u.role === 'User').length === 0 && <span className="text-xs text-slate-400 p-1">No talent available to assign.</span>}
                    {users.filter(u => u.role === 'User').map(u => (
                      <label key={u.id} className={`flex items-center gap-3 text-xs border-b border-slate-100 last:border-0 pb-1.5 pt-0.5 cursor-pointer transition-colors ${newTask.assigned_users.includes(u.id) ? 'text-indigo-700 font-bold' : 'text-slate-600'}`}>
                        <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          checked={newTask.assigned_users.includes(u.id)}
                          onChange={(e) => {
                            if (e.target.checked) setNewTask({ ...newTask, assigned_users: [...newTask.assigned_users, u.id] });
                            else setNewTask({ ...newTask, assigned_users: newTask.assigned_users.filter(id => id !== u.id) });
                          }} />
                        <span className="flex-1">{u.name} <span className="opacity-50 font-normal ml-2">({u.email})</span></span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Attachment</label>
                  <div className="border border-slate-200 rounded-xl bg-slate-50 relative cursor-pointer hover:bg-slate-100 flex items-center justify-center h-[48px] text-slate-500 transition-colors">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setTaskAttachment(e.target.files[0])} title="Attach Context File" />
                    <Upload size={20} className={taskAttachment ? "text-indigo-600" : ""} />
                    {taskAttachment && <span className="ml-2 text-xs font-bold text-indigo-600 truncate max-w-[60px]">{taskAttachment.name}</span>}
                  </div>
                </div>

                <div className="md:col-span-2 flex flex-col justify-end pt-5">
                  <button type="submit" className="w-full h-[48px] bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
                    Deploy <PlusCircle size={18} />
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col min-h-[600px] h-full">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><Calendar size={20} className="text-indigo-500" /> Active Broadcasts</h3>
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" placeholder="Search tasks..." className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg w-full sm:w-48 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium" value={searchTaskTerm} onChange={e => setSearchTaskTerm(e.target.value)} />
                </div>
              </div>
              <ul className="overflow-y-auto flex-1 divide-y divide-slate-100 p-2">
                {filteredTasks.map(t => {
                  const pred = predictiveMap[t.id];
                  return (
                    <li key={t.id} className="p-4 hover:bg-slate-50 rounded-xl transition-colors group select-none">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                             <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer">{t.title}</h4>
                             {pred && (
                               <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${
                                  pred.completion_probability >= 80 ? 'bg-emerald-100 text-emerald-800' :
                                  pred.completion_probability >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                               }`}>
                                  <Activity size={10}/> {pred.completion_probability}% On-Time ({pred.risk_level})
                               </span>
                             )}
                          </div>
                          <p className="text-xs font-semibold text-slate-500 mb-2 truncate max-w-md">{t.description}</p>
                          <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                            <span>Due: {new Date(t.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(t.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span>• Assigned to {t.assigned_users?.length || 0} user(s)</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingTask({ ...t, deadline: t.deadline.slice(0, 16), assigned_users: t.assigned_users || [] })} className="p-2 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"><Edit size={18} /></button>
                          <button onClick={() => handleDeleteTask(t.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

          </>
        )}

        {/* Enterprise ROI & Financial Impact View */}
        {activeView === 'roi' && <EnterpriseROIDashboard />}

        {/* Interactive Gantt Roadmap & SLA View */}
        {activeView === 'gantt' && <GanttRoadmapView tasks={tasks} submissions={submissions} />}

        {/* Talent Directory & NL Search View */}
        {activeView === 'talent' && (
          <div className="space-y-6 animate-fade-in">
             {/* Natural Language Talent Search Box */}
             <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-3xl text-white shadow-xl border border-slate-800">
                <div className="flex items-center gap-3 mb-3">
                   <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400"><Bot size={24}/></div>
                   <div>
                      <h3 className="text-xl font-black">Natural Language Talent Search (RAG Engine)</h3>
                      <p className="text-xs text-slate-400">Query your workforce knowledge base in plain English.</p>
                   </div>
                </div>

                <form onSubmit={handleRunNlSearch} className="flex gap-3 mt-4">
                   <input 
                      type="text" 
                      placeholder="e.g. Find developers experienced in Django and React who are currently available"
                      className="flex-1 bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 px-5 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                      value={nlQuery}
                      onChange={e => setNlQuery(e.target.value)}
                   />
                   <button 
                      type="submit" 
                      disabled={isNlSearching || !nlQuery.trim()}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                   >
                      <Sparkles size={18}/> Search AI
                   </button>
                </form>

                {nlSearchResult && (
                   <div className="mt-6 p-6 bg-slate-800/90 rounded-2xl border border-slate-700 text-sm leading-relaxed whitespace-pre-wrap animate-fade-in">
                      {nlSearchResult}
                   </div>
                )}
             </div>

             {/* Talent Cards Grid */}
             <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2"><UserCheck size={20} className="text-indigo-600"/> Enterprise Talent Directory ({talentDirectory.length})</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {talentDirectory.map(t => (
                      <div key={t.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 hover:border-indigo-300 transition-all shadow-sm">
                         <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                               <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg">
                                  {t.name.charAt(0)}
                               </div>
                               <div>
                                  <h4 className="font-black text-slate-900 leading-snug">{t.name}</h4>
                                  <p className="text-xs font-bold text-indigo-600">{t.designation || 'Talent Specialist'} • {t.department || 'Engineering'}</p>
                               </div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${t.availability_status === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                               {t.availability_status || 'Available'}
                            </span>
                         </div>

                         <div className="space-y-3 border-t border-slate-200/60 pt-4 text-xs font-medium">
                            <p className="text-slate-600"><strong>Skills:</strong> {t.skills || 'General Engineering'}</p>
                            <p className="text-slate-600"><strong>Capacity:</strong> {t.weekly_capacity_hours || 40}h / week</p>
                            {t.experience && <p className="text-slate-500 line-clamp-2"><strong>Exp:</strong> {t.experience}</p>}
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {activeView === 'members' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><Users size={20} className="text-blue-500" /> Team Members</h3>
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">{users.length} Total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest font-black border-b border-slate-100">
                    <th className="px-6 py-4">Identity</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Department & Status</th>
                    <th className="px-6 py-4">Phone / Region</th>
                    <th className="px-6 py-4">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">{u.name.charAt(0)}</div>
                          <div>
                            <p className="text-sm font-black text-slate-900 leading-none mb-1">{u.name}</p>
                            <p className="text-xs text-slate-400 font-medium">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${u.role === 'Admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>{u.role}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-slate-800">{u.designation || 'Specialist'} ({u.department || 'Engineering'})</p>
                        <span className="text-[10px] text-emerald-600 font-black">{u.availability_status || 'Available'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-slate-700">{u.phone_number}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{u.country}</p>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-400">{u.date_joined ? new Date(u.date_joined).toLocaleDateString() : 'Active'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === 'audit' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><CheckCircle size={20} className="text-emerald-500" /> Audit Logs</h3>
              <div className="flex gap-2">
                <select className="border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold bg-white" value={subFilter} onChange={e => setSubFilter(e.target.value)}>
                  <option value="All">All Events</option>
                  <option value="Submitted">New Submissions</option>
                  <option value="Reviewed">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
            <div className="divide-y divide-slate-50">
              {filteredSubmissions.length === 0 ? (
                <div className="p-12 text-center">
                  <CheckCircle size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-400 font-bold">No submissions found matching the selected filter.</p>
                </div>
              ) : (
                filteredSubmissions.map(s => (
                  <div key={s.id} className="p-6 hover:bg-slate-50 transition-all flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-black text-slate-900">{s.user_details?.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">• Submitted Task:</span>
                        <span className="text-xs font-bold text-indigo-600">{s.task_details?.title}</span>
                        {s.status === 'Reviewed' && <span className="text-[10px] px-2 py-1 bg-emerald-100 text-emerald-700 font-black rounded-full">APPROVED</span>}
                        {s.status === 'Rejected' && <span className="text-[10px] px-2 py-1 bg-red-100 text-red-700 font-black rounded-full">REJECTED</span>}
                        {s.status === 'Submitted' && <span className="text-[10px] px-2 py-1 bg-amber-100 text-amber-700 font-black rounded-full">PENDING</span>}
                      </div>
                      <p className="text-sm text-slate-500 font-medium line-clamp-1">{s.content || "Code/Text submission"}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button onClick={() => handleAIEvaluate(s.id)} className="p-2 bg-slate-900 text-amber-300 rounded-lg hover:bg-black transition-colors" title="AI Review"><Sparkles size={16} /></button>
                      {s.status !== 'Reviewed' && (
                        <button onClick={() => handleReview(s.id, 'Reviewed')} className="px-3 py-2 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 shadow-sm transition-all flex items-center gap-1">
                          <CheckCircle size={14} /> Approve
                        </button>
                      )}
                      {s.status !== 'Rejected' && (
                        <button onClick={() => handleReview(s.id, 'Rejected')} className="px-3 py-2 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 shadow-sm transition-all flex items-center gap-1">
                          <X size={14} /> Reject
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Reports View: RAG Model Knowledge Intelligence */}
        {(activeView === 'reports' || activeView === 'audit') && (
          <RAGKnowledgeView isLight={isLight} />
        )}

        {/* Tasks View: Admin Task Assignment & Document Upload */}
        {activeView === 'tasks' && (
          <div className="space-y-8 animate-fade-in">
            {/* Task Creation & Document Assignment Card */}
            <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className={`text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>Assign New Task & Document Directive</h2>
                  <p className={`text-xs mt-1 font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Admin assigns tasks, document attachments, and completion deadlines to employees.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowBreakdownModal(true)} className="px-3.5 py-2 bg-purple-500/10 text-purple-600 border border-purple-500/30 rounded-xl text-xs font-bold hover:bg-purple-500/20 transition-all flex items-center gap-1.5 cursor-pointer">
                    <Sparkles size={14} /> AI Subtask Decomposer
                  </button>
                  <button onClick={() => setShowVoiceModal(true)} className="px-3.5 py-2 bg-cyan-500/10 text-cyan-600 border border-cyan-500/30 rounded-xl text-xs font-bold hover:bg-cyan-500/20 transition-all flex items-center gap-1.5 cursor-pointer">
                    <Mic size={14} /> Voice Dictation
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Task Title</label>
                    <input type="text" required value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} className={`block w-full p-3 rounded-xl text-xs font-semibold outline-none ${isLight ? 'bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600' : 'bg-slate-950 border border-slate-800 text-white'}`} placeholder="e.g. Implement JWT Authentication" />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Completion Deadline</label>
                    <input type="datetime-local" required min={minDateTime} value={newTask.deadline} onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })} className={`block w-full p-3 rounded-xl text-xs font-semibold outline-none ${isLight ? 'bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600' : 'bg-slate-950 border border-slate-800 text-white'}`} />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Task Directives & Description</label>
                  <textarea rows="3" required value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} className={`block w-full p-3 rounded-xl text-xs font-semibold outline-none ${isLight ? 'bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600' : 'bg-slate-950 border border-slate-800 text-white'}`} placeholder="Detail task objectives, required deliverables, and evaluation criteria..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Document Attachment Upload */}
                  <div className={`p-4 rounded-xl border border-dashed ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800'}`}>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Attach Document (PDF/DOCX)</label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2.5 rounded-lg font-bold cursor-pointer hover:bg-blue-100 transition-colors border border-blue-200 text-xs">
                        <Upload size={16} />
                        <span className="truncate max-w-[180px]">{taskAttachment ? taskAttachment.name : 'Select File'}</span>
                        <input type="file" className="hidden" accept=".pdf,.docx,.doc,.txt" onChange={(e) => setTaskAttachment(e.target.files[0])} />
                      </label>
                      {taskAttachment && <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckCircle size={14} /> Attached</span>}
                    </div>
                  </div>

                  {/* Assign Team Members */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className={`block text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Assign Users</label>
                      <button type="button" onClick={handleAIMatchUsers} className="text-[11px] font-black text-purple-600 hover:underline flex items-center gap-1">
                        <Sparkles size={12} /> 🎯 AI Match Engine
                      </button>
                    </div>
                    <select multiple value={newTask.assigned_users} onChange={(e) => setNewTask({ ...newTask, assigned_users: Array.from(e.target.selectedOptions, option => option.value) })} className={`block w-full p-2.5 rounded-xl text-xs font-semibold outline-none h-24 ${isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-slate-950 border border-slate-800 text-white'}`}>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1">Hold Ctrl / Cmd to select multiple employees.</p>
                  </div>
                </div>

                <button type="submit" className="w-full py-3.5 px-4 rounded-xl shadow-lg text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 shadow-blue-500/25 transition-all active:scale-95 cursor-pointer">
                  🚀 Assign Task & Dispatch Directives
                </button>
              </form>
            </div>

            {/* Task Management Table */}
            <div className={`p-6 rounded-3xl border shadow-xl ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <h3 className={`text-lg font-black mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>Active Task Registry ({tasks.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b text-[10px] font-black uppercase tracking-wider ${isLight ? 'border-slate-200 text-slate-400' : 'border-slate-800 text-slate-500'}`}>
                      <th className="py-3 px-4">Task Details</th>
                      <th className="py-3 px-4">Assigned To</th>
                      <th className="py-3 px-4">Deadline</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-medium">
                    {tasks.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{t.title}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-xs">{t.description}</p>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-blue-600 dark:text-cyan-400">
                          {t.assigned_users_names?.join(', ') || 'Unassigned'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-semibold">
                          {new Date(t.deadline).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : t.status === 'SUBMITTED' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button onClick={() => handleDeleteTask(t.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Team View: Team Directory, AI Match Engine & Off Peak Optimizer */}
        {(activeView === 'team' || activeView === 'members' || activeView === 'talent') && (
          <div className="space-y-8 animate-fade-in">
            {/* High-Tech AI Feature Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-3xl border shadow-lg ${isLight ? 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200' : 'bg-slate-900 border-purple-500/30'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-purple-600 text-white rounded-2xl shadow-md"><Sparkles size={22} /></div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">🎯 AI Candidate Match Engine</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Vector skill matrix & capacity match score</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">Evaluates employee skill vectors, past completion records, and available hours to auto-suggest optimal assignees.</p>
                <button onClick={handleAIMatchUsers} className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer">
                  Launch AI Candidate Match
                </button>
              </div>

              <div className={`p-6 rounded-3xl border shadow-lg ${isLight ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200' : 'bg-slate-900 border-amber-500/30'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-amber-500 text-white rounded-2xl shadow-md"><Flame size={22} /></div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">⚡ Off Peak Workload Optimizer</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Burnout prevention & capacity re-balancing</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">Monitors 24-hour capacity heatmaps and re-allocates task peaks to off-peak slots automatically.</p>
                <button onClick={() => setShowWorkloadModal(true)} className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer">
                  Open Workload Optimizer
                </button>
              </div>
            </div>

            {/* Team Directory List */}
            <div className={`p-6 rounded-3xl border shadow-xl ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <h3 className={`text-lg font-black mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>Enterprise Team Directory ({users.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {users.map(u => (
                  <div key={u.id} className={`p-4 rounded-2xl border transition-all ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className={`text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>{u.name}</h4>
                        <p className="text-xs text-blue-600 dark:text-cyan-400 font-semibold">{u.role} Clearance</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{u.email}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics View */}
        {activeView === 'analytics' && (
          <EnterpriseROIDashboard isLight={isLight} />
        )}

        {/* Settings View */}
        {(activeView === 'settings' || activeView === 'profile') && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className={`p-8 rounded-3xl border shadow-xl ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black mb-6 shadow-lg shadow-blue-500/30">
                {user?.name?.charAt(0)}
              </div>
              <h3 className={`text-2xl font-black mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>{user?.name}</h3>
              <p className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-6">System Security Administrator</p>

              <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                <div className="flex justify-between">
                  <span className="text-sm font-bold text-slate-400">Account Clearance Status</span>
                  <span className="text-sm font-black text-emerald-500 flex items-center gap-1"><CheckCircle size={14} /> ACTIVE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-bold text-slate-400">Primary Email</span>
                  <span className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{user?.email}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* AI Task Matching Modal */}
      {showMatchModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
           <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white"><Sparkles size={22}/></div>
                    <div>
                       <h3 className="text-xl font-black text-slate-900">AI Candidate Matching Engine</h3>
                       <p className="text-xs text-slate-500">Task: {newTask.title || "New Task Assignment"}</p>
                    </div>
                 </div>
                 <button onClick={() => setShowMatchModal(false)} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full">
                    <X size={20}/>
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                 {isMatchingLoading ? (
                    <div className="py-12 text-center">
                       <div className="animate-spin h-10 w-10 border-b-2 border-indigo-600 rounded-full mx-auto mb-4"></div>
                       <p className="font-bold text-slate-700">Evaluating candidate skills, capacity & experience...</p>
                    </div>
                 ) : matchingRecommendations.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No candidate recommendations available.</p>
                 ) : (
                    matchingRecommendations.map((rec, i) => (
                       <div key={rec.user_id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex-1">
                             <div className="flex items-center gap-3 mb-1">
                                <span className={`px-3 py-1 rounded-full text-xs font-black text-white ${rec.match_score >= 80 ? 'bg-emerald-600' : rec.match_score >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}>
                                   {rec.match_score}% Match Score
                                </span>
                                <h4 className="font-black text-slate-900">{rec.name}</h4>
                             </div>
                             <p className="text-xs text-indigo-600 font-bold mb-2">{rec.designation} • {rec.department}</p>
                             <ul className="text-xs text-slate-600 space-y-1">
                                {rec.rationales.map((r, idx) => (
                                   <li key={idx}>{r}</li>
                                ))}
                             </ul>
                          </div>

                          <button 
                             onClick={() => {
                                if (!newTask.assigned_users.includes(rec.user_id)) {
                                   setNewTask({ ...newTask, assigned_users: [...newTask.assigned_users, rec.user_id] });
                                   toast.success(`Assigned ${rec.name} to task!`);
                                } else {
                                   toast.error(`${rec.name} is already assigned.`);
                                }
                             }}
                             className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all ${newTask.assigned_users.includes(rec.user_id) ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                          >
                             {newTask.assigned_users.includes(rec.user_id) ? '✓ Assigned' : '+ Assign Candidate'}
                          </button>
                       </div>
                    ))
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900">Modify Task</h3>
              <button onClick={() => setEditingTask(null)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Task Title</label>
                <input type="text" required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                  value={editingTask.title} onChange={e => setEditingTask({ ...editingTask, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                <textarea required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium min-h-[100px]"
                  value={editingTask.description} onChange={e => setEditingTask({ ...editingTask, description: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setEditingTask(null)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md transition-all flex items-center gap-2">
                  <Save size={16} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Voice-to-Task Modal */}
      <VoiceTaskModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onTaskParsed={(parsed) => {
          setNewTask(prev => ({
            ...prev,
            title: parsed.title || prev.title,
            description: parsed.description || prev.description
          }));
        }}
      />

      {/* AI Sub-task Breakdown Modal */}
      <AITaskBreakdownModal
        isOpen={showBreakdownModal}
        onClose={() => setShowBreakdownModal(false)}
        onAddMilestoneToTask={(milestone) => {
          setNewTask(prev => ({
            ...prev,
            title: milestone.title,
            description: `${milestone.description} [Est: ${milestone.estimated_hours}h | Skills: ${milestone.required_skills}]`
          }));
          setShowBreakdownModal(false);
        }}
      />

      {/* Workload Peak & Burnout Optimizer Modal */}
      <WorkloadOptimizerModal
        isOpen={showWorkloadModal}
        onClose={() => setShowWorkloadModal(false)}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}} />
    </div>
  );
}


