import { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { 
  CheckSquare, Clock, Award, TrendingUp, 
  Upload, Calendar, FileText, Download,
  Activity, Target, Zap, Sparkles, UserCheck,
  ShieldCheck, ArrowUpRight, Flame, FileSpreadsheet, Paperclip, X, CheckCircle2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

import ModernSidebar from '../components/ModernSidebar';
import ModernTopBar from '../components/ModernTopBar';
import StatsCard from '../components/StatsCard';
import WorkloadOptimizerModal from '../components/WorkloadOptimizerModal';
import FloatingRAGDrawer from '../components/FloatingRAGDrawer';

export default function UserDashboardNew() {
  const { user, logout } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [activeView, setActiveView] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [showWorkloadModal, setShowWorkloadModal] = useState(false);

  // Submission Form States
  const [selectedTask, setSelectedTask] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.first_name || user?.name || user?.username || '',
    email: user?.email || '',
    bio: user?.bio || 'Dedicated Digital Talent Specialist focused on mission execution and code quality.',
    phone_number: user?.phone_number || '',
    department: user?.department || 'Engineering',
    designation: user?.designation || 'Talent Specialist',
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await api.patch('auth/profile/', profileData);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const ts = new Date().getTime();
      const [tasksRes, subsRes] = await Promise.all([
        api.get(`tasks/tasks/?_cb=${ts}`),
        api.get(`tasks/submissions/?_cb=${ts}`),
      ]);
      
      setTasks(tasksRes.data);
      setSubmissions(subsRes.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const targetTaskId = selectedTask ? (typeof selectedTask === 'object' ? selectedTask.id : selectedTask) : null;

    if (!targetTaskId) {
      toast.error('Please select a target mission to submit your work');
      return;
    }

    if (!submissionText.trim()) {
      toast.error('Please provide submission details & work notes');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Uploading deliverable & updating task audit...');

    try {
      const formData = new FormData();
      formData.append('task', Number(targetTaskId));
      formData.append('content', submissionText);
      
      if (submissionFile) {
        formData.append('attachment', submissionFile);
      }

      await api.post('tasks/submissions/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.dismiss(toastId);
      toast.success('Deliverable uploaded & submitted successfully!');
      setSelectedTask(null);
      setSubmissionText('');
      setSubmissionFile(null);
      fetchData();
    } catch (err) {
      toast.dismiss(toastId);
      console.error('Submission error:', err.response?.data);
      toast.error(err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Failed to submit work deliverable');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getTaskStatus = (task) => {
    const submission = submissions.find(s => s.task === task.id);
    if (!submission) return { status: 'pending', color: 'amber', text: 'Action Required' };
    if (submission.status === 'Reviewed' || submission.status === 'approved') return { status: 'approved', color: 'emerald', text: 'Approved & Certified' };
    if (submission.status === 'rejected') return { status: 'rejected', color: 'rose', text: 'Needs Revision' };
    return { status: 'pending_review', color: 'cyan', text: 'Submitted & Under Audit' };
  };

  const assignedTasksCount = (tasks || []).length;
  const completedSubmissionsCount = (submissions || []).filter(s => s && (s.status === 'Reviewed' || s.status === 'approved')).length;
  const pendingTasksCount = (tasks || []).filter(t => t && !(submissions || []).some(s => s && s.task === t.id && (s.status === 'Reviewed' || s.status === 'approved'))).length;
  const successRate = assignedTasksCount > 0 ? Math.round((completedSubmissionsCount / assignedTasksCount) * 100) : 0;

  const activityData = [
    { name: 'Mon', tasks: Math.max(1, Math.round(assignedTasksCount * 0.3)) },
    { name: 'Tue', tasks: Math.max(2, Math.round(assignedTasksCount * 0.5)) },
    { name: 'Wed', tasks: Math.max(3, Math.round(assignedTasksCount * 0.7)) },
    { name: 'Thu', tasks: Math.max(4, Math.round(assignedTasksCount * 0.9)) },
    { name: 'Fri', tasks: assignedTasksCount },
  ];

  const pieData = [
    { name: 'Certified', value: completedSubmissionsCount, color: '#10b981' },
    { name: 'In Progress', value: pendingTasksCount, color: '#f59e0b' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-bold text-sm">Loading DTMS Talent Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans ${isDark ? 'bg-[#0b0f19] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Sidebar */}
      <ModernSidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        onLogout={handleLogout}
        userRole="user"
      />

      {/* Top Bar */}
      <ModernTopBar user={user} />

      {/* Main Content */}
      <main className="ml-64 mt-16 p-6 sm:p-8 transition-all">
        {activeView === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                  Talent Mission Workspace
                  <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-extrabold uppercase tracking-widest">
                    Verified User
                  </span>
                </h1>
                <p className="text-slate-400 text-sm mt-1 font-medium">
                  Welcome back, {user?.first_name || user?.username}! Track mission deadlines and submit deliverables.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowWorkloadModal(true)}
                  className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  <Flame size={16} /> Workload Optimizer
                </button>
              </div>
            </div>

            {/* AI Intelligence Directive Banner */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-600/40 text-white shadow-xl flex items-start gap-4">
              <div className="p-3 bg-cyan-500/20 rounded-2xl text-cyan-400 border border-cyan-500/30 mt-0.5">
                <Sparkles size={24} />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-1">🤖 AI Operational Briefing</h4>
                <p className="text-xs font-medium text-slate-200 leading-relaxed">
                  You have <strong className="text-amber-300 font-bold">{pendingTasksCount} pending missions</strong> requiring submission. Your overall deliverable success rate is <strong className="text-emerald-400 font-bold">{successRate}%</strong>.
                </p>
              </div>
            </div>

            {/* Stats Grid - Interactive Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div 
                onClick={() => setActiveView('my-tasks')}
                className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 hover:border-indigo-500/60 hover:bg-slate-900 transition-all shadow-xl cursor-pointer hover:scale-[1.02] group"
              >
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 group-hover:text-indigo-400 transition-colors">Assigned Missions</span>
                <p className="text-4xl font-black text-white mt-2">{assignedTasksCount}</p>
                <div className="flex items-center gap-1 mt-2 text-xs font-bold text-indigo-400">
                  <Target size={14} /> Click to view all missions
                </div>
              </div>

              <div 
                onClick={() => setActiveView('my-tasks')}
                className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 hover:border-emerald-500/60 hover:bg-slate-900 transition-all shadow-xl cursor-pointer hover:scale-[1.02] group"
              >
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 group-hover:text-emerald-400 transition-colors">Certified Complete</span>
                <p className="text-4xl font-black text-emerald-400 mt-2">{completedSubmissionsCount}</p>
                <div className="flex items-center gap-1 mt-2 text-xs font-bold text-emerald-400">
                  <Award size={14} /> Verified Submissions
                </div>
              </div>

              <div 
                onClick={() => setActiveView('my-tasks')}
                className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 hover:border-amber-500/60 hover:bg-slate-900 transition-all shadow-xl cursor-pointer hover:scale-[1.02] group"
              >
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 group-hover:text-amber-400 transition-colors">Pending Submissions</span>
                <p className="text-4xl font-black text-amber-400 mt-2">{pendingTasksCount}</p>
                <div className="flex items-center gap-1 mt-2 text-xs font-bold text-amber-400">
                  <Clock size={14} /> Click to submit work
                </div>
              </div>

              <div 
                onClick={() => setActiveView('my-tasks')}
                className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-900 transition-all shadow-xl cursor-pointer hover:scale-[1.02] group"
              >
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 group-hover:text-cyan-400 transition-colors">Success Rate</span>
                <p className="text-4xl font-black text-cyan-400 mt-2">{successRate}%</p>
                <div className="w-full bg-slate-950 rounded-full h-2 mt-3">
                  <div className="bg-cyan-400 h-2 rounded-full" style={{ width: `${successRate}%` }} />
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activity Chart */}
              <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl">
                <h3 className="text-base font-black text-white mb-4 flex items-center gap-2">
                  <Activity size={18} className="text-indigo-400" /> Weekly Mission Velocity
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#0f172a', color: '#fff' }} />
                      <Line type="monotone" dataKey="tasks" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4', r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Distribution */}
              <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl">
                <h3 className="text-base font-black text-white mb-4 flex items-center gap-2">
                  <Award size={18} className="text-cyan-400" /> Mission Status Distribution
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                        {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#0f172a', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Assigned Tasks Stream */}
            <div className="bg-slate-900/80 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <CheckSquare size={20} className="text-indigo-400" /> My Assigned Tasks
                </h3>
                <button
                  onClick={() => setActiveView('my-tasks')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all font-bold text-xs"
                >
                  View All Tasks
                </button>
              </div>
              <div className="p-4 divide-y divide-slate-800/60">
                {tasks.slice(0, 5).map((task) => {
                  const taskStatus = getTaskStatus(task);
                  return (
                    <div key={task.id} className="p-4 hover:bg-slate-800/40 rounded-2xl transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-bold text-white text-sm">{task.title}</h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-${taskStatus.color}-500/10 text-${taskStatus.color}-400 border border-${taskStatus.color}-500/30`}>
                            {taskStatus.text}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1">{task.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-amber-400">Due: {new Date(task.deadline).toLocaleDateString()}</span>
                        <button
                          onClick={() => {
                            setSelectedTask(task);
                            setActiveView('submissions');
                          }}
                          className="px-4 py-2 bg-[#5452f6] hover:bg-indigo-600 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1 cursor-pointer"
                        >
                          <Upload size={14} /> Submit Work
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* MY TASKS VIEW */}
        {activeView === 'my-tasks' && (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-black text-white">My Assigned Missions</h1>

            <div className="grid grid-cols-1 gap-4">
              {tasks.map((task) => {
                const taskStatus = getTaskStatus(task);
                return (
                  <div key={task.id} className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 hover:border-cyan-500/30 transition-all flex flex-col md:flex-row justify-between gap-6 items-start">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-black text-white">{task.title}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-${taskStatus.color}-500/10 text-${taskStatus.color}-400 border border-${taskStatus.color}-500/30`}>
                          {taskStatus.text}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-300 leading-relaxed">{task.description}</p>
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-400 pt-2 border-t border-slate-800">
                        <span className="text-amber-400"><Clock size={14} className="inline mr-1" /> Due: {new Date(task.deadline).toLocaleDateString()}</span>
                        {task.document && (
                          <a href={task.document} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1">
                            <FileText size={14} /> View SOP Brief
                          </a>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setActiveView('submissions');
                      }}
                      className="px-5 py-3 bg-[#5452f6] hover:bg-indigo-600 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
                    >
                      <Upload size={14} /> Submit Deliverable
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUBMISSIONS VIEW */}
        {activeView === 'submissions' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-black text-white flex items-center gap-3">
                <Upload size={28} className="text-cyan-400" /> Submit Deliverable Work
              </h1>
              <p className="text-slate-400 text-xs font-medium mt-1">
                Select your assigned mission, attach deliverables (PDF, Excel, Word, etc.), and record completion notes.
              </p>
            </div>

            {/* Submission Form Card */}
            <div className="bg-slate-900/80 p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Target Mission Select */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                    Target Mission / Assigned Task *
                  </label>
                  <select
                    required
                    value={selectedTask ? (typeof selectedTask === 'object' ? selectedTask.id : selectedTask) : ''}
                    onChange={(e) => {
                      const taskId = e.target.value;
                      const found = tasks.find(t => String(t.id) === String(taskId));
                      setSelectedTask(found || taskId);
                    }}
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-cyan-400 outline-none text-sm font-bold cursor-pointer"
                  >
                    <option value="">-- Select Target Mission from My Tasks --</option>
                    {tasks.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.title} (Due: {new Date(t.deadline).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Task Details Chip (if any) */}
                {selectedTask && typeof selectedTask === 'object' && (
                  <div className="p-4 bg-slate-950 rounded-2xl border border-indigo-500/30 text-xs space-y-1">
                    <span className="font-extrabold text-cyan-400 uppercase tracking-wider block">Selected Mission Brief:</span>
                    <p className="text-slate-200 font-medium">{selectedTask.description}</p>
                    <div className="text-[11px] font-bold text-amber-400 pt-1">
                      <Clock size={12} className="inline mr-1" /> Deadline: {new Date(selectedTask.deadline).toLocaleString()}
                    </div>
                  </div>
                )}

                {/* Deliverable Work Description / Notes */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                    Deliverable Description & Implementation Notes *
                  </label>
                  <textarea
                    required
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-cyan-400 outline-none text-sm font-medium placeholder-slate-500"
                    placeholder="Provide details about your completed work, results, code repository links, or execution summary..."
                  />
                </div>

                {/* File Attachment Drag & Drop Area */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                    Attach Deliverable File (PDF, Excel, Word, Text, Zip)
                  </label>

                  {!submissionFile ? (
                    <div className="relative border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 text-center transition-all bg-slate-950/60 hover:bg-slate-950 cursor-pointer group">
                      <input
                        type="file"
                        accept=".pdf,.xlsx,.xls,.csv,.docx,.doc,.txt,.zip,.png,.jpg,.jpeg"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setSubmissionFile(e.target.files[0]);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 group-hover:scale-110 transition-transform">
                          <Upload size={22} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-200">
                            Click to upload or drag & drop deliverable file
                          </p>
                          <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                            Supports PDF (.pdf), Excel (.xlsx, .csv), Word (.docx), TXT, and ZIP
                          </p>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-extrabold">PDF</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold">EXCEL / CSV</span>
                          <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-extrabold">WORD</span>
                          <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-extrabold">ZIP</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-950 rounded-2xl border border-cyan-500/40 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
                          {submissionFile.name.endsWith('.pdf') ? <FileText size={20} className="text-rose-400" /> :
                           submissionFile.name.match(/\.(xlsx|xls|csv)$/i) ? <FileSpreadsheet size={20} className="text-emerald-400" /> :
                           <FileText size={20} className="text-cyan-400" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white max-w-xs sm:max-w-md truncate">{submissionFile.name}</p>
                          <p className="text-[10px] font-semibold text-slate-400">
                            {(submissionFile.size / 1024 / 1024).toFixed(2)} MB • {submissionFile.type || 'Deliverable Document'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSubmissionFile(null)}
                        className="p-2 bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-xl transition-all cursor-pointer"
                        title="Remove attached file"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-4 border-t border-slate-800">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 text-white rounded-2xl font-black text-xs hover:opacity-95 shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Upload size={16} /> {isSubmitting ? 'Uploading Deliverable...' : 'Submit Deliverable Work'}
                  </button>
                </div>
              </form>
            </div>

            {/* Past Submissions Section */}
            <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <CheckSquare size={20} className="text-emerald-400" /> My Deliverable Submissions History ({submissions.length})
              </h2>

              {submissions.length === 0 ? (
                <p className="text-xs text-slate-500 font-medium py-4 text-center">No deliverables submitted yet.</p>
              ) : (
                <div className="space-y-3">
                  {submissions.map((sub) => {
                    const matchedTask = tasks.find(t => t.id === sub.task);
                    const taskTitle = matchedTask ? matchedTask.title : (sub.task_details?.title || `Task #${sub.task}`);
                    return (
                      <div key={sub.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-sm text-white">{taskTitle}</h4>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              sub.status === 'Reviewed' || sub.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                              sub.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                              'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            }`}>
                              {sub.status || 'Under Audit'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-2">{sub.content}</p>
                          {sub.submitted_at && (
                            <span className="text-[10px] text-slate-500 font-bold block">Submitted on: {new Date(sub.submitted_at).toLocaleString()}</span>
                          )}
                        </div>

                        {sub.attachment && (
                          <a
                            href={sub.attachment}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                          >
                            <Download size={14} /> Attached File
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ACHIEVEMENTS VIEW */}
        {activeView === 'achievements' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-3xl font-black text-white flex items-center gap-3">
                <Award size={28} className="text-amber-400" /> Talent Badges & Achievements
              </h1>
              <p className="text-slate-400 text-xs font-medium mt-1">Verified certifications, operational milestones, and skill achievements.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/80 p-6 rounded-3xl border border-amber-500/30 shadow-xl space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Award size={24} />
                </div>
                <h3 className="text-base font-black text-white">Master Mission Specialist</h3>
                <p className="text-xs text-slate-400">Completed and verified 5+ complex operational assignments with 100% audit pass rate.</p>
                <span className="inline-block text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">Gold Tier Badge</span>
              </div>

              <div className="bg-slate-900/80 p-6 rounded-3xl border border-cyan-500/30 shadow-xl space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                  <Zap size={24} />
                </div>
                <h3 className="text-base font-black text-white">SLA Fast Responder</h3>
                <p className="text-xs text-slate-400">Delivered deliverables average 24 hours ahead of target mission deadlines.</p>
                <span className="inline-block text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Speed Badge</span>
              </div>

              <div className="bg-slate-900/80 p-6 rounded-3xl border border-indigo-500/30 shadow-xl space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <Sparkles size={24} />
                </div>
                <h3 className="text-base font-black text-white">AI RAG Power User</h3>
                <p className="text-xs text-slate-400">Active utilization of the Talent Knowledge Assistant for QA and vector document queries.</p>
                <span className="inline-block text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">AI Badge</span>
              </div>
            </div>

            {/* Achievement Level Progress */}
            <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-black text-white">Level 4 Talent Certification</h3>
                  <p className="text-xs text-slate-400">Next milestone: Senior Operational Specialist Clearance</p>
                </div>
                <span className="text-lg font-black text-cyan-400">85% Complete</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3 p-0.5 border border-slate-800">
                <div className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-2 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>
          </div>
        )}

        {/* ACTIVITY VIEW */}
        {activeView === 'activity' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-3xl font-black text-white flex items-center gap-3">
                <Activity size={28} className="text-indigo-400" /> Activity Stream & Audit Trail
              </h1>
              <p className="text-slate-400 text-xs font-medium mt-1">Real-time operational log stream of your actions and submissions.</p>
            </div>

            <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
              {[
                { title: 'Submitted Work Deliverable', desc: 'Uploaded SOP code submission for mission verification.', time: '10m ago', icon: Upload },
                { title: 'Queried Talent RAG Assistant', desc: 'Indexed vector document query for project architecture.', time: '1h ago', icon: Sparkles },
                { title: 'Passed Mission Audit Certification', desc: 'Administrator verified deliverable as certified complete.', time: '1d ago', icon: CheckSquare },
                { title: 'Logged into DTMS Enterprise Console', desc: 'Secure JWT authentication session initialized.', time: '2d ago', icon: UserCheck },
              ].map((act, i) => {
                const Icon = act.icon;
                return (
                  <div key={i} className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-start gap-4 hover:border-slate-700 transition-all">
                    <div className="p-2.5 bg-indigo-500/20 text-cyan-400 rounded-xl mt-0.5">
                      <Icon size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-extrabold text-sm text-white">{act.title}</h4>
                        <span className="text-[10px] font-bold text-slate-500">{act.time}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{act.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PROFILE VIEW */}
        {activeView === 'profile' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div>
              <h1 className="text-3xl font-black text-white flex items-center gap-3">
                <UserCheck size={28} className="text-cyan-400" /> Talent User Profile
              </h1>
              <p className="text-slate-400 text-xs font-medium mt-1">Manage personal talent specifications, department, and contact info.</p>
            </div>

            <div className="bg-slate-900/80 p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
              <div className="flex items-center gap-5 pb-6 border-b border-slate-800">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg">
                  {(user?.first_name || user?.username || 'U').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">{user?.first_name || user?.username || 'Talent Member'}</h2>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                  <span className="inline-block mt-2 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Verified Talent Specialist
                  </span>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">Display Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-sm font-medium outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={profileData.email}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-950/50 border border-slate-800/50 text-slate-500 text-sm font-medium outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">Department</label>
                    <input
                      type="text"
                      value={profileData.department}
                      onChange={e => setProfileData({ ...profileData, department: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-sm font-medium outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">Designation</label>
                    <input
                      type="text"
                      value={profileData.designation}
                      onChange={e => setProfileData({ ...profileData, designation: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-sm font-medium outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">Bio & Professional Summary</label>
                  <textarea
                    rows={3}
                    value={profileData.bio}
                    onChange={e => setProfileData({ ...profileData, bio: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-sm font-medium outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-2xl font-black text-xs hover:opacity-95 shadow-lg transition-all cursor-pointer"
                  >
                    {isUpdatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <WorkloadOptimizerModal
        isOpen={showWorkloadModal}
        onClose={() => setShowWorkloadModal(false)}
      />

      {/* FLOATING RAG AI ASSISTANT DRAWER */}
      <FloatingRAGDrawer />
    </div>
  );
}
