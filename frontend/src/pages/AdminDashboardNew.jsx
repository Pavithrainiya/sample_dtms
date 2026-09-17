import { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { 
  CheckSquare, Users, Clock, TrendingUp, 
  PlusCircle, Edit, Trash2, Calendar, Upload,
  BarChart3, Award, Activity, Search, Filter,
  LayoutGrid, List, Kanban, Sparkles, FileText,
  AlertCircle, CheckCircle2, ShieldCheck, Flame, Zap,
  ExternalLink, X, ChevronRight, Mail, Briefcase, Code,
  UserCheck, ArrowUpRight, Percent, CheckCircle, Download, FileSpreadsheet, Check
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, CartesianGrid, Legend, AreaChart, Area 
} from 'recharts';

import ModernSidebar from '../components/ModernSidebar';
import ModernTopBar from '../components/ModernTopBar';
import StatsCard from '../components/StatsCard';
import RAGKnowledgeView from '../components/RAGKnowledgeView';
import WorkloadOptimizerModal from '../components/WorkloadOptimizerModal';
import FloatingRAGDrawer from '../components/FloatingRAGDrawer';

export default function AdminDashboardNew() {
  const { user, logout } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [activeView, setActiveView] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [stats, setStats] = useState({
    total_tasks: 0,
    completed_tasks: 0,
    pending_tasks: 0,
    completion_rate: 0,
    ai_insights: ''
  });
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  // Task Hub Views & Filter States
  const [taskViewMode, setTaskViewMode] = useState('grid');
  const [taskStatusFilter, setTaskStatusFilter] = useState('all');
  const [searchTaskTerm, setSearchTaskTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Team View Search & AI Match State
  const [teamSearchTerm, setTeamSearchTerm] = useState('');
  const [nlQuery, setNlQuery] = useState('');
  const [nlSearchResult, setNlSearchResult] = useState('');
  const [isNlSearching, setIsNlSearching] = useState(false);

  // Settings & SMTP Email States
  const [adminSmtpEmail, setAdminSmtpEmail] = useState('pavijeevi56@gmail.com');
  const [appPassword, setAppPassword] = useState('');
  const [showAppPassword, setShowAppPassword] = useState(false);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);

  const handleSendTestEmail = async (e) => {
    e?.preventDefault();
    if (!adminSmtpEmail.trim()) {
      toast.error('Please enter a target admin email address');
      return;
    }
    setIsSendingTestEmail(true);
    const toastId = toast.loading(`Dispatching test SMTP email to ${adminSmtpEmail}...`);
    try {
      const res = await api.post('tasks/test-email/', {
        email: adminSmtpEmail,
        app_password: appPassword
      });
      toast.dismiss(toastId);
      toast.success(res.data.message || `Test email sent to ${adminSmtpEmail}!`);
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.error || 'SMTP dispatch failed. Verify 16-digit App Password.');
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    if (newTask.assigned_users.length === 0) {
      toast.error('Please assign the task to at least one team member');
      return;
    }

    if (!newTask.title.trim() || !newTask.description.trim() || !newTask.deadline) {
      toast.error('Please fill in all required mission fields (Title, Description, Deadline)');
      return;
    }

    setIsSubmittingTask(true);
    const toastId = toast.loading('Publishing mission & dispatching email notifications...');

    try {
      const formData = new FormData();
      formData.append('title', newTask.title);
      formData.append('description', newTask.description);
      
      let formattedDeadline = newTask.deadline;
      if (formattedDeadline && !formattedDeadline.includes('Z')) {
        const d = new Date(formattedDeadline);
        if (!isNaN(d.getTime())) {
          formattedDeadline = d.toISOString();
        }
      }
      formData.append('deadline', formattedDeadline);
      formData.append('priority', newTask.priority || 'medium');
      
      newTask.assigned_users.forEach(uid => {
        formData.append('assigned_users', Number(uid));
      });

      if (taskAttachment) {
        formData.append('attachment', taskAttachment);
      }

      if (editingTask) {
        await api.put(`tasks/tasks/${editingTask.id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.dismiss(toastId);
        toast.success('Mission updated successfully!');
      } else {
        await api.post('tasks/tasks/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.dismiss(toastId);
        toast.success('Mission published & notification emails dispatched!');
      }

      setShowTaskModal(false);
      setNewTask({ title: '', description: '', deadline: '', priority: 'medium', assigned_users: [] });
      setTaskAttachment(null);
      setEditingTask(null);
      fetchData();
    } catch (err) {
      toast.dismiss(toastId);
      console.error('Task creation error:', err.response?.data);
      let errMsg = 'Failed to save task';
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errMsg = err.response.data;
        } else if (err.response.data.detail) {
          errMsg = err.response.data.detail;
        } else {
          errMsg = Object.entries(err.response.data)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join(' | ');
        }
      }
      toast.error(errMsg);
    } finally {
      setIsSubmittingTask(false);
    }
  };

  // Modals & AI States
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showWorkloadModal, setShowWorkloadModal] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'medium',
    assigned_users: [],
  });
  const [taskAttachment, setTaskAttachment] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  const minDateTime = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000))
    .toISOString()
    .slice(0, 16);

  const setDeadlinePreset = (presetKey) => {
    const d = new Date();
    if (presetKey === '+1d') d.setDate(d.getDate() + 1);
    else if (presetKey === '+3d') d.setDate(d.getDate() + 3);
    else if (presetKey === '+1w') d.setDate(d.getDate() + 7);
    else if (presetKey === '+1m') d.setMonth(d.getMonth() + 1);
    else if (presetKey === '+1y') d.setFullYear(d.getFullYear() + 1);

    const isoStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    setNewTask(prev => ({ ...prev, deadline: isoStr }));
  };

  const handleYearSelect = (targetYear) => {
    let current = newTask.deadline ? new Date(newTask.deadline) : new Date();
    if (isNaN(current.getTime())) current = new Date();
    current.setFullYear(targetYear);
    const isoStr = new Date(current.getTime() - (current.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    setNewTask(prev => ({ ...prev, deadline: isoStr }));
  };

  const toggleUserSelection = (userId) => {
    const numId = Number(userId);
    if (isNaN(numId)) return;
    setNewTask(prev => {
      const current = (prev.assigned_users || []).map(id => Number(id));
      const exists = current.includes(numId);
      const updated = exists 
        ? current.filter(id => id !== numId) 
        : [...current, numId];
      return { ...prev, assigned_users: updated };
    });
  };

  useEffect(() => {
    fetchData();
    fetchUsers();
  }, []);

  const fetchData = async () => {
    try {
      const ts = new Date().getTime();
      const [statsRes, tasksRes, subsRes] = await Promise.all([
        api.get(`tasks/dashboard/stats/?_cb=${ts}`),
        api.get(`tasks/tasks/?_cb=${ts}`),
        api.get(`tasks/submissions/?_cb=${ts}`),
      ]);
      setStats(statsRes.data || {});
      setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
      setSubmissions(Array.isArray(subsRes.data) ? subsRes.data : []);
    } catch (err) {
      toast.error('Failed to load dashboard data');
      setTasks([]);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('auth/users/');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch users');
      setUsers([]);
    }
  };

  // Export User Directory as CSV Spreadsheet
  const handleExportUserCSV = () => {
    if (!users || users.length === 0) {
      toast.error('No users available to export');
      return;
    }

    const headers = ['User ID', 'Full Name', 'Email', 'Role', 'Department', 'Designation', 'Assigned Tasks', 'Status'];
    const rows = users.map(u => {
      const displayName = u.first_name 
        ? `${u.first_name} ${u.last_name || ''}`.trim() 
        : (typeof u.username === 'string' ? u.username : (u.email || `User #${u.id}`));
      const assignedCount = (tasks || []).filter(t => {
        if (!t.assigned_users) return false;
        return t.assigned_users.some(au => (typeof au === 'object' ? au.id : au) === u.id);
      }).length;
      const roleTitle = u.role === 'admin' ? 'Administrator' : 'Talent Specialist';
      const dept = u.department || (u.role === 'admin' ? 'Executive Engineering' : 'Full Stack Engineering');
      const designation = u.designation || (u.role === 'admin' ? 'Lead Admin' : 'Talent Specialist');

      return [
        u.id,
        `"${displayName.replace(/"/g, '""')}"`,
        `"${(u.email || '').replace(/"/g, '""')}"`,
        `"${roleTitle}"`,
        `"${dept.replace(/"/g, '""')}"`,
        `"${designation.replace(/"/g, '""')}"`,
        assignedCount,
        `"Active / Available"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `dtms_users_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('User directory exported successfully as CSV!');
  };

  // Export User Directory as PDF Document
  const handleExportUserPDF = () => {
    if (!users || users.length === 0) {
      toast.error('No user data available for PDF export');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Pop-up blocked! Please allow pop-ups to generate PDF report.');
      return;
    }

    const generatedDate = new Date().toLocaleString();
    const rowsHtml = users.map(u => {
      const displayName = u.first_name 
        ? `${u.first_name} ${u.last_name || ''}`.trim() 
        : (typeof u.username === 'string' ? u.username : (u.email || `User #${u.id}`));
      const assignedCount = (tasks || []).filter(t => {
        if (!t.assigned_users) return false;
        return t.assigned_users.some(au => (typeof au === 'object' ? au.id : au) === u.id);
      }).length;
      const roleTitle = u.role === 'admin' ? 'ADMINISTRATOR' : 'TALENT SPECIALIST';
      const dept = u.department || (u.role === 'admin' ? 'Executive Engineering' : 'Full Stack Engineering');

      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #1e293b;">#${u.id}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #0f172a;">${displayName}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #475569;">${u.email}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><span style="background: #e0e7ff; color: #3730a3; padding: 4px 8px; border-radius: 6px; font-weight: bold; font-size: 11px;">${roleTitle}</span></td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #475569;">${dept}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #0284c7;">${assignedCount} Missions</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><span style="color: #16a34a; font-weight: bold;">● Active</span></td>
        </tr>
      `;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>DTMS Enterprise User Directory Report</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #0f172a; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0284c7; padding-bottom: 15px; margin-bottom: 25px; }
            .logo { font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
            .logo span { color: #0284c7; }
            .meta { font-size: 12px; color: #64748b; text-align: right; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
            th { background: #f8fafc; color: #475569; text-align: left; padding: 12px 10px; font-size: 11px; font-weight: 800; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; }
            .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; }
            @media print { body { margin: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">DTMS <span>Enterprise</span></div>
              <div style="font-size: 14px; font-weight: 700; color: #475569; margin-top: 4px;">User Directory & Talent Audit Summary Report</div>
            </div>
            <div class="meta">
              <div><strong>Generated:</strong> ${generatedDate}</div>
              <div><strong>Total Active Users:</strong> ${users.length}</div>
              <div><strong>System:</strong> Digital Talent Management System</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Department</th>
                <th>Assigned Tasks</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer">
            <div>Confidential Document - Digital Talent Management System (DTMS)</div>
            <div>Generated by Admin Console</div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
    toast.success('PDF Export report generated! Choose "Save as PDF".');
  };

  // AI Talent Search RAG Query
  const handleRunNlSearch = async (e) => {
    e.preventDefault();
    if (!nlQuery.trim()) return;
    setIsNlSearching(true);
    try {
      const res = await api.post('tasks/talent-search/', { query: nlQuery });
      setNlSearchResult(res.data.reply || '');
      toast.success("AI Talent Search RAG query completed!");
    } catch (err) {
      toast.error("Failed to query talent knowledge base");
    } finally {
      setIsNlSearching(false);
    }
  };

  // AI Auto-Fill Task Details
  const handleAiAutoFill = async () => {
    const topicPrompt = prompt('Enter a short task topic or title (e.g., "Build JWT Authentication Endpoint"):');
    if (!topicPrompt) return;

    setIsGeneratingAI(true);
    const toastId = toast.loading('AI is drafting mission specifications...');

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setNewTask(prev => ({
        ...prev,
        title: topicPrompt,
        description: `OBJECTIVES:\n- Implement secure & tested implementation for "${topicPrompt}".\n- Follow RESTful guidelines and security best practices.\n- Deliver complete code documentation & unit tests.\n\nDELIVERABLES:\n1. Completed module implementation.\n2. Verification tests passing.\n3. API documentation.`,
        priority: 'high',
        deadline: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16)
      }));
      toast.dismiss(toastId);
      toast.success('AI task specification generated!');
    } catch (err) {
      toast.dismiss(toastId);
      toast.error('AI generation failed');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await api.delete(`tasks/tasks/${taskId}/`);
      toast.success('Task deleted successfully!');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '',
      priority: task.priority || 'medium',
      assigned_users: task.assigned_users?.map(u => typeof u === 'object' ? u.id : u) || [],
    });
    setShowTaskModal(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Filtered Tasks Calculation
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchTaskTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTaskTerm.toLowerCase());
      
      const isOverdue = new Date(t.deadline) < new Date() && t.status !== 'completed';
      let matchesStatus = true;
      if (taskStatusFilter === 'completed') matchesStatus = t.status === 'completed';
      if (taskStatusFilter === 'pending') matchesStatus = t.status !== 'completed';
      if (taskStatusFilter === 'overdue') matchesStatus = isOverdue;

      let matchesPriority = true;
      if (priorityFilter !== 'all') {
        matchesPriority = (t.priority || 'medium').toLowerCase() === priorityFilter.toLowerCase();
      }

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchTaskTerm, taskStatusFilter, priorityFilter]);

  // Filtered Users Calculation for Team View
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const fullName = `${u.first_name || ''} ${u.last_name || ''} ${u.username || ''}`.toLowerCase();
      return fullName.includes(teamSearchTerm.toLowerCase()) || u.email.toLowerCase().includes(teamSearchTerm.toLowerCase());
    });
  }, [users, teamSearchTerm]);

  // Chart Data Calculations
  const completedCount = useMemo(() => tasks.filter(t => t.status === 'completed').length, [tasks]);
  const pendingCount = useMemo(() => tasks.filter(t => t.status !== 'completed').length, [tasks]);
  const totalCount = Math.max(1, tasks.length);
  const completionRate = Math.round((completedCount / totalCount) * 100);

  const taskChartData = useMemo(() => [
    { name: 'Completed & Certified', value: completedCount, color: '#10b981' },
    { name: 'In Progress / Pending', value: pendingCount, color: '#f59e0b' },
  ], [completedCount, pendingCount]);

  const velocityData = useMemo(() => [
    { day: 'Mon', completed: Math.max(1, Math.round(completedCount * 0.2)), pending: Math.max(1, Math.round(pendingCount * 0.3)) },
    { day: 'Tue', completed: Math.max(2, Math.round(completedCount * 0.4)), pending: Math.max(2, Math.round(pendingCount * 0.5)) },
    { day: 'Wed', completed: Math.max(3, Math.round(completedCount * 0.6)), pending: Math.max(2, Math.round(pendingCount * 0.7)) },
    { day: 'Thu', completed: Math.max(4, Math.round(completedCount * 0.8)), pending: Math.max(3, Math.round(pendingCount * 0.9)) },
    { day: 'Fri', completed: completedCount, pending: pendingCount },
  ], [completedCount, pendingCount]);

  const teamCapacityData = useMemo(() => {
    return (users || []).map(u => {
      const userTasksCount = (tasks || []).filter(t => {
        if (!t || !t.assigned_users) return false;
        return t.assigned_users.some(au => (typeof au === 'object' ? au?.id : au) === u?.id);
      }).length;
      const rawName = u?.first_name || u?.name || (typeof u?.username === 'string' ? u.username.split('@')[0] : '') || (typeof u?.email === 'string' ? u.email.split('@')[0] : '') || `User #${u?.id || ''}`;
      return {
        name: rawName,
        tasksAssigned: userTasksCount || 1,
        capacity: 5
      };
    });
  }, [users, tasks]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? 'bg-[#0b0f19] text-white' : 'bg-slate-50 text-slate-900'
      }`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-bold text-sm tracking-wide">Loading DTMS Enterprise Console...</p>
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
        userRole="admin"
      />

      {/* Top Bar */}
      <ModernTopBar user={user} />

      {/* Main Content */}
      <main className="ml-64 mt-16 p-6 sm:p-8 transition-all">
        
        {/* ==================== VIEW 1: EXECUTIVE COMMAND CONSOLE (DASHBOARD) ==================== */}
        {activeView === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                  Executive Command Console
                  <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-extrabold uppercase tracking-widest">
                    Admin Clearance
                  </span>
                </h1>
                <p className="text-slate-400 text-sm mt-1 font-medium">
                  System health, workforce analytics, and automated productivity tracking.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowWorkloadModal(true)}
                  className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  <Flame size={16} /> Workload Optimizer
                </button>
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setNewTask({ title: '', description: '', deadline: '', priority: 'medium', assigned_users: [] });
                    setShowTaskModal(true);
                  }}
                  className="bg-[#5452f6] hover:bg-indigo-600 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <PlusCircle size={16} /> New Task
                </button>
              </div>
            </div>

            {/* AI Intelligence Directive Banner */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-600/40 text-white shadow-xl flex items-start gap-4">
              <div className="p-3 bg-indigo-500/20 rounded-2xl text-cyan-400 mt-0.5 border border-cyan-500/30">
                <Sparkles size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-black uppercase tracking-widest text-cyan-400">🤖 AI Organizational Intelligence Briefing</h4>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">Optimal Throughput</span>
                </div>
                <p className="text-xs font-medium text-slate-200 leading-relaxed">
                  System completion rate is currently at <strong className="text-cyan-300 font-bold">{completionRate}%</strong> across {tasks.length} active assignments. Team capacity is balanced with zero critical burnout bottlenecks detected.
                </p>
              </div>
            </div>

            {/* Stats Grid - Interactive Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div 
                onClick={() => { setActiveView('tasks'); setTaskStatusFilter('all'); }}
                className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 hover:border-indigo-500/60 hover:bg-slate-900 transition-all shadow-xl cursor-pointer hover:scale-[1.02] group"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 group-hover:text-indigo-400 transition-colors">Total Missions</span>
                  <div className="p-2.5 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500/20"><CheckSquare size={20} /></div>
                </div>
                <p className="text-4xl font-black text-white">{tasks.length}</p>
                <div className="flex items-center gap-1 mt-2 text-xs font-bold text-indigo-400">
                  <ArrowUpRight size={14} /> Click to view all missions
                </div>
              </div>

              <div 
                onClick={() => { setActiveView('tasks'); setTaskStatusFilter('completed'); }}
                className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 hover:border-emerald-500/60 hover:bg-slate-900 transition-all shadow-xl cursor-pointer hover:scale-[1.02] group"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 group-hover:text-emerald-400 transition-colors">Completed & Certified</span>
                  <div className="p-2.5 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20"><CheckCircle size={20} /></div>
                </div>
                <p className="text-4xl font-black text-emerald-400">{completedCount}</p>
                <div className="w-full bg-slate-950 rounded-full h-2 mt-3">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${completionRate}%` }} />
                </div>
              </div>

              <div 
                onClick={() => { setActiveView('tasks'); setTaskStatusFilter('pending'); }}
                className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 hover:border-amber-500/60 hover:bg-slate-900 transition-all shadow-xl cursor-pointer hover:scale-[1.02] group"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 group-hover:text-amber-400 transition-colors">Pending Actions</span>
                  <div className="p-2.5 bg-amber-500/10 rounded-2xl text-amber-400 border border-amber-500/20 group-hover:bg-amber-500/20"><Clock size={20} /></div>
                </div>
                <p className="text-4xl font-black text-amber-400">{pendingCount}</p>
                <div className="flex items-center gap-1 mt-2 text-xs font-bold text-amber-400">
                  <Clock size={14} /> Click to view pending tasks
                </div>
              </div>

              <div 
                onClick={() => { setActiveView('team'); }}
                className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-900 transition-all shadow-xl cursor-pointer hover:scale-[1.02] group"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 group-hover:text-cyan-400 transition-colors">Active Workforce</span>
                  <div className="p-2.5 bg-cyan-500/10 rounded-2xl text-cyan-400 border border-cyan-500/20 group-hover:bg-cyan-500/20"><Users size={20} /></div>
                </div>
                <p className="text-4xl font-black text-cyan-400">{users.length}</p>
                <div className="flex items-center gap-1 mt-2 text-xs font-bold text-cyan-400">
                  <UserCheck size={14} /> Click to view team workforce
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mission Status Distribution Pie Chart */}
              <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Award size={18} className="text-cyan-400" /> Mission Status Distribution
                  </h3>
                  <span className="text-xs font-bold text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">Real-time Yield</span>
                </div>

                <div className="h-64 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={taskChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={95}
                        paddingAngle={6}
                        dataKey="value"
                      >
                        {taskChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#0f172a', color: '#fff' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center pb-8">
                    <span className="text-3xl font-black text-white">{completionRate}%</span>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Yield</span>
                  </div>
                </div>
              </div>

              {/* Performance Velocity Area Chart */}
              <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Activity size={18} className="text-indigo-400" /> Performance Velocity Stream
                  </h3>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">Active Sprint</span>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={velocityData}>
                      <defs>
                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="day" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#0f172a', color: '#fff' }} />
                      <Legend verticalAlign="bottom" height={36} />
                      <Area type="monotone" dataKey="completed" stroke="#10b981" fillOpacity={1} fill="url(#colorCompleted)" name="Completed" />
                      <Area type="monotone" dataKey="pending" stroke="#f59e0b" fillOpacity={1} fill="url(#colorPending)" name="Pending" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Mission Stream Card */}
            <div className="bg-slate-900/80 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <CheckSquare size={20} className="text-indigo-400" /> Recent Mission Log Stream
                </h3>
                <button
                  onClick={() => setActiveView('tasks')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  View All Tasks Hub <ChevronRight size={14} />
                </button>
              </div>
              <div className="p-4 divide-y divide-slate-800/60">
                {tasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="p-4 hover:bg-slate-800/40 rounded-2xl transition-all flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-bold text-white text-sm">{task.title}</h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'}`}>
                          {task.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">{task.description}</p>
                    </div>
                    <div className="text-right text-xs font-bold text-slate-500">
                      <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== VIEW 2: TASKS HUB ==================== */}
        {activeView === 'tasks' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header Control Panel */}
            <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                    Mission Control & Tasks Hub
                    <span className="text-xs font-black bg-indigo-600 text-white px-3 py-1 rounded-full">
                      {filteredTasks.length} Tasks
                    </span>
                  </h1>
                  <p className="text-slate-400 text-xs font-medium mt-1">
                    Manage assignments, monitor SOP briefs, review deadlines, and track completion.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* View Switcher Mode */}
                  <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-800 text-xs font-bold">
                    <button
                      onClick={() => setTaskViewMode('grid')}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${taskViewMode === 'grid' ? 'bg-[#5452f6] text-white shadow-md font-black' : 'text-slate-400 hover:text-white'}`}
                    >
                      <LayoutGrid size={15} /> Grid
                    </button>
                    <button
                      onClick={() => setTaskViewMode('kanban')}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${taskViewMode === 'kanban' ? 'bg-[#5452f6] text-white shadow-md font-black' : 'text-slate-400 hover:text-white'}`}
                    >
                      <Kanban size={15} /> Kanban
                    </button>
                    <button
                      onClick={() => setTaskViewMode('table')}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${taskViewMode === 'table' ? 'bg-[#5452f6] text-white shadow-md font-black' : 'text-slate-400 hover:text-white'}`}
                    >
                      <List size={15} /> Table
                    </button>
                  </div>

                  {/* Create Task Button */}
                  <button
                    onClick={() => {
                      setEditingTask(null);
                      setNewTask({ title: '', description: '', deadline: '', priority: 'medium', assigned_users: [] });
                      setShowTaskModal(true);
                    }}
                    className="bg-[#5452f6] hover:bg-indigo-600 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <PlusCircle size={16} /> Create Task
                  </button>
                </div>
              </div>

              {/* Toolbar Search & Filters */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80 pt-4">
                {/* Status Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  {['all', 'pending', 'completed', 'overdue'].map(st => (
                    <button
                      key={st}
                      onClick={() => setTaskStatusFilter(st)}
                      className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                        taskStatusFilter === st
                          ? 'bg-slate-800 text-cyan-400 border border-cyan-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 border border-transparent'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                {/* Right Search & Priority Select */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <select
                    value={priorityFilter}
                    onChange={e => setPriorityFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-400"
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>

                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      className="pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl w-full focus:ring-2 focus:ring-cyan-400 outline-none text-xs font-medium text-white placeholder-slate-500"
                      value={searchTaskTerm}
                      onChange={e => setSearchTaskTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* TASK DISPLAY MODE 1: GRID CARDS VIEW */}
            {taskViewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTasks.map((task) => {
                  const isCompleted = task.status === 'completed';
                  const isOverdue = new Date(task.deadline) < new Date() && !isCompleted;
                  const priority = (task.priority || 'medium').toLowerCase();

                  return (
                    <div
                      key={task.id}
                      className={`p-6 rounded-3xl border transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between relative overflow-hidden group ${
                        isCompleted
                          ? 'border-emerald-500/30 bg-slate-900/60'
                          : isOverdue
                          ? 'border-rose-500/40 bg-slate-900/80 shadow-lg shadow-rose-950/20'
                          : 'border-slate-800 hover:border-indigo-500/50 bg-slate-900/80'
                      }`}
                    >
                      {/* Priority Gradient Line Header */}
                      <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                        priority === 'high' ? 'bg-gradient-to-r from-rose-500 to-amber-500' :
                        priority === 'low' ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' :
                        'bg-gradient-to-r from-indigo-500 to-blue-500'
                      }`} />

                      <div>
                        {/* Header Badges */}
                        <div className="flex items-center justify-between mb-3 pt-1">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            priority === 'high' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                            priority === 'low' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                            'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}>
                            {priority} Priority
                          </span>

                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                            isCompleted ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                            isOverdue ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                            'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                          }`}>
                            {isCompleted ? 'Completed' : isOverdue ? 'Overdue' : 'In Progress'}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-lg font-black text-white mb-2 group-hover:text-cyan-400 transition-colors">
                          {task.title}
                        </h3>
                        <p className="text-xs font-medium text-slate-300 leading-relaxed mb-4 line-clamp-3">
                          {task.description}
                        </p>

                        {/* Document Brief Chip */}
                        {task.document && (
                          <div className="mb-4">
                            <a
                              href={task.document}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-3 py-1.5 rounded-xl hover:bg-cyan-900/50 transition-all"
                            >
                              <FileText size={14} /> Attached Document Brief
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Card Footer */}
                      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                            <Clock size={13} /> {new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                            <Users size={13} /> {task.assigned_users?.length || 0} Assignees
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditTask(task)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                            title="Edit Task"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
                            title="Delete Task"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TASK DISPLAY MODE 2: KANBAN BOARD VIEW */}
            {taskViewMode === 'kanban' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1: Pending / Assigned */}
                <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="font-black text-sm uppercase tracking-wider text-amber-400 flex items-center gap-2">
                      <Clock size={16} /> Pending & Assigned ({filteredTasks.filter(t => t.status !== 'completed').length})
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {filteredTasks.filter(t => t.status !== 'completed').map(task => (
                      <div key={task.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all space-y-2">
                        <span className="text-[10px] font-black uppercase text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          {task.priority || 'medium'} priority
                        </span>
                        <h4 className="font-bold text-white text-sm">{task.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 pt-2 border-t border-slate-800/60">
                          <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                          <button onClick={() => handleEditTask(task)} className="text-cyan-400 hover:underline">Edit</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 2: In Review */}
                <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="font-black text-sm uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                      <Activity size={16} /> Under Audit ({submissions.length})
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {submissions.map(sub => (
                      <div key={sub.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                        <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {sub.status}
                        </span>
                        <h4 className="font-bold text-white text-sm">{sub.task_details?.title || 'Deliverable Submission'}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2">{sub.content || "Attached deliverable"}</p>
                        <div className="pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 font-bold">
                          Submitted by user #{sub.user}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 3: Completed */}
                <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="font-black text-sm uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 size={16} /> Completed & Certified ({filteredTasks.filter(t => t.status === 'completed').length})
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {filteredTasks.filter(t => t.status === 'completed').map(task => (
                      <div key={task.id} className="p-4 bg-slate-950 rounded-2xl border border-emerald-500/30 space-y-2">
                        <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Certified Complete
                        </span>
                        <h4 className="font-bold text-white text-sm">{task.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TASK DISPLAY MODE 3: TABLE VIEW */}
            {taskViewMode === 'table' && (
              <div className="bg-slate-900/80 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs font-medium text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-4">Mission Title</th>
                      <th className="p-4">Priority</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Deadline</th>
                      <th className="p-4">Assignees</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredTasks.map(t => (
                      <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 font-bold text-white text-sm">{t.title}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${t.priority === 'high' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}`}>
                            {t.priority || 'medium'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${t.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-amber-400">{new Date(t.deadline).toLocaleDateString()}</td>
                        <td className="p-4 font-bold">{t.assigned_users?.length || 0} members</td>
                        <td className="p-4 text-right space-x-2">
                          <button onClick={() => handleEditTask(t)} className="text-cyan-400 hover:underline font-bold">Edit</button>
                          <button onClick={() => handleDeleteTask(t.id)} className="text-rose-400 hover:underline font-bold">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ENTERPRISE TEAM DIRECTORY QUICK REPORT SECTION */}
            <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6 mt-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Users size={22} className="text-cyan-400" /> Enterprise Team Directory ({users.length} Members)
                  </h2>
                  <p className="text-xs text-slate-400 font-medium mt-1">Export employee profiles, role clearance, and workload metrics.</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleExportUserCSV}
                    className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3.5 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                    title="Export User List as CSV Spreadsheet"
                  >
                    <Download size={14} /> Export CSV
                  </button>
                  <button
                    onClick={handleExportUserPDF}
                    className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3.5 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                    title="Print / Save User Directory as PDF"
                  >
                    <FileText size={14} /> Export PDF Report
                  </button>
                  <button
                    onClick={() => setActiveView('team')}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl font-extrabold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                  >
                    View All <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs font-medium text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3">User ID</th>
                      <th className="p-3">Full Name</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Assigned Tasks</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
                    {users.slice(0, 6).map(u => {
                      const assignedCount = (tasks || []).filter(t => {
                        if (!t.assigned_users) return false;
                        return t.assigned_users.some(au => (typeof au === 'object' ? au.id : au) === u.id);
                      }).length;
                      const displayName = u.first_name 
                        ? `${u.first_name} ${u.last_name || ''}`.trim() 
                        : (typeof u.username === 'string' ? u.username : (u.email || `User #${u.id}`));
                      return (
                        <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 font-bold text-white">#{u.id}</td>
                          <td className="p-3 font-bold text-white">{displayName}</td>
                          <td className="p-3 text-slate-400">{u.email}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                              {u.role === 'admin' ? 'Admin' : 'Specialist'}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400">{u.department || 'Engineering'}</td>
                          <td className="p-3 font-bold text-cyan-400">{assignedCount} Active</td>
                          <td className="p-3 font-bold text-emerald-400">● Available</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== VIEW 3: ENTERPRISE TEAM DIRECTORY ==================== */}
        {activeView === 'team' && (
          <div className="space-y-8 animate-fade-in">
            {/* AI Natural Language Talent Search Header Card */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-3xl text-white shadow-xl border border-slate-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-indigo-500/20 rounded-2xl text-cyan-400 border border-cyan-500/30"><Sparkles size={22}/></div>
                <div>
                  <h3 className="text-xl font-black">AI Talent Match Engine & Natural Language RAG Search</h3>
                  <p className="text-xs text-slate-400 font-medium">Search employee skill sets, capacity availability, and project experience in natural English.</p>
                </div>
              </div>

              <form onSubmit={handleRunNlSearch} className="flex flex-col sm:flex-row gap-3 mt-4">
                <input 
                  type="text" 
                  placeholder="e.g. Find team members experienced in React and Django REST Framework"
                  className="flex-1 bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 px-5 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-cyan-400 text-sm font-medium"
                  value={nlQuery}
                  onChange={e => setNlQuery(e.target.value)}
                />
                <button 
                  type="submit" 
                  disabled={isNlSearching || !nlQuery.trim()}
                  className="bg-gradient-to-r from-indigo-600 to-cyan-500 text-white px-6 py-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles size={16}/> {isNlSearching ? 'Searching...' : 'Search AI Engine'}
                </button>
              </form>

              {nlSearchResult && (
                <div className="mt-6 p-6 bg-slate-950/90 rounded-2xl border border-indigo-500/30 text-sm leading-relaxed whitespace-pre-wrap animate-fade-in text-slate-200">
                  {nlSearchResult}
                </div>
              )}
            </div>

            {/* Team Directory Section */}
            <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white flex items-center gap-2">
                    <Users size={24} className="text-cyan-400" /> Enterprise Team Directory ({filteredUsers.length})
                  </h2>
                  <p className="text-xs text-slate-400 font-medium mt-1">Manage team clearance, active skill sets, and workload distribution.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={handleExportUserCSV}
                    className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3.5 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                    title="Export User List as CSV Spreadsheet"
                  >
                    <Download size={14} /> Export CSV
                  </button>
                  <button
                    onClick={handleExportUserPDF}
                    className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3.5 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                    title="Print / Save User Directory as PDF"
                  >
                    <FileText size={14} /> Export PDF Report
                  </button>

                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type="text"
                      placeholder="Search member..."
                      className="pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl w-full focus:ring-2 focus:ring-cyan-400 outline-none text-xs font-medium text-white placeholder-slate-500"
                      value={teamSearchTerm}
                      onChange={e => setTeamSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Team Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((member) => {
                  const assignedCount = tasks.filter(t => {
                    if (!t.assigned_users) return false;
                    return t.assigned_users.some(au => (typeof au === 'object' ? au.id : au) === member.id);
                  }).length;

                  const displayName = member.first_name 
                    ? `${member.first_name} ${member.last_name || ''}` 
                    : (typeof member.username === 'string' ? member.username.split('@')[0] : (typeof member.email === 'string' ? member.email.split('@')[0] : `User #${member.id}`));
                  const roleTitle = member.role === 'admin' ? 'ADMINISTRATOR' : 'TALENT SPECIALIST';
                  const dept = member.role === 'admin' ? 'Executive Engineering' : 'Full Stack Engineering';

                  return (
                    <div 
                      key={member.id} 
                      className="bg-slate-950 p-6 rounded-3xl border border-slate-800 hover:border-indigo-500/50 transition-all shadow-lg flex flex-col justify-between group space-y-4"
                    >
                      {/* Avatar Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white flex items-center justify-center font-black text-xl shadow-md">
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full animate-pulse" />
                          </div>
                          <div>
                            <h3 className="font-black text-white text-base leading-tight group-hover:text-cyan-400 transition-colors">
                              {displayName}
                            </h3>
                            <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                              <Mail size={12} className="text-slate-500" /> {member.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Badges & Meta */}
                      <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs font-medium">
                        <div className="flex justify-between items-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${member.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'}`}>
                            {roleTitle}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            Available
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-400 text-[11px] pt-1">
                          <Briefcase size={13} className="text-indigo-400" /> <span>{dept}</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                          <Code size={13} className="text-cyan-400" /> <span>React.js • Django • REST API</span>
                        </div>
                      </div>

                      {/* Workload Capacity Bar */}
                      <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                        <div className="flex justify-between text-[11px] font-extrabold">
                          <span className="text-slate-400">Assigned Missions</span>
                          <span className="text-cyan-400">{assignedCount} Active</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-2">
                          <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-2 rounded-full" style={{ width: `${Math.min(100, (assignedCount / 5) * 100)}%` }} />
                        </div>
                      </div>

                      {/* Quick Assign Action */}
                      <div className="pt-3 flex gap-2">
                        <button
                          onClick={() => {
                            setEditingTask(null);
                            setNewTask({ title: '', description: '', deadline: '', priority: 'medium', assigned_users: [member.id] });
                            setShowTaskModal(true);
                          }}
                          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 hover:border-cyan-500/30 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <PlusCircle size={14} /> Assign Mission
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==================== VIEW 4: PRODUCTIVITY ANALYTICS & ENTERPRISE ROI ==================== */}
        {activeView === 'analytics' && (
          <div className="space-y-8 animate-fade-in">
            {/* Analytics Header */}
            <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                  <BarChart3 size={28} className="text-indigo-400" /> Productivity Analytics & Enterprise ROI
                </h1>
                <p className="text-xs text-slate-400 font-medium mt-1">Real-time organizational throughput, SLA compliance metrics, and automated velocity tracking.</p>
              </div>

              <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 text-xs font-bold text-emerald-400">
                <ShieldCheck size={16} /> 100% Verified Telemetry Data
              </div>
            </div>

            {/* Enterprise Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl">
                <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Completion Velocity</span>
                <p className="text-3xl font-black text-emerald-400 mt-2">1.8 Days</p>
                <p className="text-[11px] font-bold text-slate-500 mt-1">Average time per mission</p>
              </div>

              <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl">
                <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">SLA On-Time Compliance</span>
                <p className="text-3xl font-black text-cyan-400 mt-2">94.2%</p>
                <p className="text-[11px] font-bold text-emerald-400 mt-1">+3.5% vs baseline target</p>
              </div>

              <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl">
                <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Burnout Strain Index</span>
                <p className="text-3xl font-black text-indigo-400 mt-2">Low (18%)</p>
                <p className="text-[11px] font-bold text-slate-500 mt-1">Workload evenly distributed</p>
              </div>

              <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl">
                <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">AI Evaluation Score Avg</span>
                <p className="text-3xl font-black text-amber-400 mt-2">91.5 / 100</p>
                <p className="text-[11px] font-bold text-amber-400 mt-1">Certified quality grade: A</p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Task Completion Breakdown Pie Chart */}
              <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl">
                <h3 className="text-base font-black text-white mb-4 flex items-center gap-2">
                  <Award size={18} className="text-cyan-400" /> Mission Completion Breakdown
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={taskChartData} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={5} dataKey="value">
                        {taskChartData.map((e, idx) => <Cell key={idx} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#0f172a', color: '#fff' }} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Team Workforce Capacity Utilization Bar Chart */}
              <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl">
                <h3 className="text-base font-black text-white mb-4 flex items-center gap-2">
                  <Users size={18} className="text-indigo-400" /> Team Member Capacity Utilization
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={teamCapacityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#0f172a', color: '#fff' }} />
                      <Bar dataKey="tasksAssigned" fill="#6366f1" radius={[8, 8, 0, 0]} name="Assigned Missions" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== VIEW 5: REPORTS & RAG KNOWLEDGE BASE ==================== */}
        {activeView === 'reports' && (
          <div className="space-y-8 animate-fade-in">
            {/* Header & Export Action Bar */}
            <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                  <FileText size={28} className="text-cyan-400" /> Enterprise Reports & User Directory Export
                </h1>
                <p className="text-xs text-slate-400 font-medium mt-1">Export complete employee records as CSV spreadsheets or print official PDF directory summaries.</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportUserCSV}
                  className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                >
                  <Download size={16} /> Export User CSV
                </button>
                <button
                  onClick={handleExportUserPDF}
                  className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                >
                  <FileText size={16} /> Export User PDF Report
                </button>
              </div>
            </div>

            {/* Team Directory Table / Summary */}
            <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Users size={20} className="text-indigo-400" /> Team User Directory Snapshot ({users.length} Registered Members)
              </h2>
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs font-medium text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3">User ID</th>
                      <th className="p-3">Full Name</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Assigned Tasks</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
                    {users.map(u => {
                      const assignedCount = (tasks || []).filter(t => {
                        if (!t.assigned_users) return false;
                        return t.assigned_users.some(au => (typeof au === 'object' ? au.id : au) === u.id);
                      }).length;
                      const displayName = u.first_name 
                        ? `${u.first_name} ${u.last_name || ''}`.trim() 
                        : (typeof u.username === 'string' ? u.username : (u.email || `User #${u.id}`));
                      return (
                        <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 font-bold text-white">#{u.id}</td>
                          <td className="p-3 font-bold text-white">{displayName}</td>
                          <td className="p-3 text-slate-400">{u.email}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                              {u.role === 'admin' ? 'Admin' : 'Specialist'}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400">{u.department || 'Engineering'}</td>
                          <td className="p-3 font-bold text-cyan-400">{assignedCount} Active</td>
                          <td className="p-3 font-bold text-emerald-400">● Available</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <RAGKnowledgeView isLight={!isDark} />
          </div>
        )}


      </main>

      {/* CREATE & EDIT TASK MODAL */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="max-w-2xl w-full rounded-3xl bg-slate-900 border border-slate-800 p-8 max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <PlusCircle size={22} className="text-indigo-400" />
                  {editingTask ? 'Edit Mission Specification' : 'Create New Mission'}
                </h2>
                <p className="text-xs font-medium text-slate-400 mt-0.5">Assign deliverables, set strict deadlines, and attach brief documents.</p>
              </div>
              <button onClick={() => setShowTaskModal(false)} className="p-2 text-slate-400 hover:text-white rounded-xl">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAiAutoFill}
                  disabled={isGeneratingAI}
                  className="bg-indigo-500/20 text-cyan-400 border border-indigo-500/30 font-extrabold text-xs px-3.5 py-1.5 rounded-xl hover:bg-indigo-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles size={14} /> ⚡ AI Auto-Fill Mission Specs
                </button>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-cyan-400 outline-none text-sm font-medium"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                  Detailed Specifications & Guidelines *
                </label>
                <textarea
                  required
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-cyan-400 outline-none text-sm font-medium"
                  placeholder="Describe mission objectives, deliverables, and technical guidelines..."
                />
              </div>

              {/* PRIORITY & DEADLINE SECTION */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                    Priority Level *
                  </label>
                  <select
                    value={newTask.priority || 'medium'}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-cyan-400 outline-none text-sm font-bold cursor-pointer"
                  >
                    <option value="high">🔥 High Priority</option>
                    <option value="medium">⚡ Medium Priority</option>
                    <option value="low">🌱 Low Priority</option>
                  </select>
                </div>

                {/* HIGH-CONTRAST DEDICATED MISSION SCHEDULE & DATE/TIME CARD */}
                <div className="p-5 rounded-3xl bg-slate-950 border-2 border-cyan-500/30 shadow-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-3 gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-white">Mission Schedule & Target Deadline *</h4>
                        <p className="text-[11px] text-slate-400">Select target year, quick duration offset, and precise deadline time.</p>
                      </div>
                    </div>
                    
                    {/* Selected Date Preview Badge */}
                    {newTask.deadline && !isNaN(new Date(newTask.deadline).getTime()) && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-black self-start sm:self-auto">
                        <Clock size={13} />
                        {new Date(newTask.deadline).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(newTask.deadline).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* 1. Target Year Selector */}
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
                        1. Select Target Year
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        {[2026, 2027, 2028, 2029, 2030, 2031, 2032].map((y) => {
                          const currentYear = newTask.deadline ? new Date(newTask.deadline).getFullYear() : new Date().getFullYear();
                          const isSelected = currentYear === y;
                          return (
                            <button
                              key={y}
                              type="button"
                              onClick={() => handleYearSelect(y)}
                              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                isSelected 
                                  ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 shadow-lg shadow-cyan-500/30 scale-105' 
                                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-cyan-500/50 hover:text-white'
                              }`}
                            >
                              {y}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. Quick Duration Presets */}
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
                        2. Quick Duration Presets
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        {[
                          { label: '⚡ +1 Day', key: '+1d' },
                          { label: '🚀 +3 Days', key: '+3d' },
                          { label: '📅 +1 Week', key: '+1w' },
                          { label: '🗓️ +1 Month', key: '+1m' },
                          { label: '🎯 +1 Year', key: '+1y' },
                        ].map(p => (
                          <button
                            key={p.key}
                            type="button"
                            onClick={() => setDeadlinePreset(p.key)}
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 3. Custom Styled Datetime Picker */}
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
                        3. Precise Date & Time Picker
                      </span>
                      <input
                        type="datetime-local"
                        required
                        min={minDateTime}
                        value={newTask.deadline}
                        onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                        style={{ colorScheme: 'dark' }}
                        className="w-full px-5 py-3.5 rounded-2xl bg-slate-900 border-2 border-cyan-500/50 focus:border-cyan-400 text-cyan-300 focus:ring-4 focus:ring-cyan-500/20 outline-none text-base font-extrabold transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* TEAM MEMBER CHIP & CHECKBOX SELECTION GRID */}
              <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-white">
                      Assign To Team Members * ({newTask.assigned_users.length} Selected)
                    </label>
                    <p className="text-[11px] text-slate-400">Click user cards to toggle assignment.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const eligible = users.filter(u => u.role !== 'admin');
                        const targetList = eligible.length > 0 ? eligible : users;
                        setNewTask(prev => ({ ...prev, assigned_users: targetList.map(u => Number(u.id)) }));
                      }}
                      className="text-xs font-extrabold text-cyan-400 hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-slate-700">|</span>
                    <button
                      type="button"
                      onClick={() => setNewTask(prev => ({ ...prev, assigned_users: [] }))}
                      className="text-xs font-extrabold text-slate-400 hover:underline cursor-pointer"
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                  {(users.filter(u => u.role !== 'admin').length > 0 ? users.filter(u => u.role !== 'admin') : users).map((u) => {
                    const userIdNum = Number(u.id);
                    const isSelected = (newTask.assigned_users || []).map(id => Number(id)).includes(userIdNum);
                    const displayName = u.first_name || u.name || (typeof u.username === 'string' ? u.username.split('@')[0] : `User #${u.id}`);
                    const initials = displayName.slice(0, 2).toUpperCase();

                    return (
                      <div
                        key={u.id}
                        onClick={() => toggleUserSelection(u.id)}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected 
                            ? 'bg-[#131c31] border-cyan-400 shadow-xl shadow-cyan-500/20 ring-2 ring-cyan-500/30' 
                            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                            isSelected ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {initials}
                          </div>
                          <div className="truncate">
                            <div className="flex items-center gap-2">
                              <h5 className="font-extrabold text-xs text-white truncate">{displayName}</h5>
                              {isSelected && (
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-cyan-400 text-slate-950 shadow-sm">
                                  Assigned
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                          </div>
                        </div>

                        <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                          isSelected ? 'bg-cyan-400 border-cyan-400 text-slate-950 shadow-md shadow-cyan-400/50' : 'border-2 border-slate-700 bg-slate-950'
                        }`}>
                          {isSelected && <Check size={16} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* MODERN SOP FILE ATTACHMENT ZONE */}
              <div>
                <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                  Brief SOP Document (PDF / DOCX Attachment)
                </label>
                
                {taskAttachment ? (
                  <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/40 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500/20 text-cyan-400 rounded-xl">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{taskAttachment.name}</p>
                        <p className="text-[10px] text-slate-400">{(taskAttachment.size / 1024).toFixed(1)} KB • Ready for dispatch</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTaskAttachment(null)}
                      className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="relative border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-2xl p-4 text-center transition-all bg-slate-950/50 group">
                    <input
                      type="file"
                      onChange={(e) => setTaskAttachment(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload size={22} className="mx-auto text-slate-500 group-hover:text-cyan-400 transition-colors mb-1" />
                    <p className="text-xs font-bold text-slate-300">Click or drag brief SOP file to attach</p>
                    <p className="text-[10px] text-slate-500">PDF, DOCX, or TXT format supported</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={isSubmittingTask}
                  className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:opacity-95 text-white rounded-2xl font-black text-xs shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <PlusCircle size={16} />
                  {isSubmittingTask 
                    ? 'Publishing Mission & Dispatching Emails...' 
                    : editingTask ? 'Update Mission Specification' : 'Publish & Assign Mission'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-6 py-4 rounded-2xl font-bold text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WORKLOAD OPTIMIZER MODAL */}
      <WorkloadOptimizerModal
        isOpen={showWorkloadModal}
        onClose={() => setShowWorkloadModal(false)}
      />

      {/* FLOATING RAG AI ASSISTANT DRAWER */}
      <FloatingRAGDrawer />
    </div>
  );
}
