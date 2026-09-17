import { Search, Bell, User, ChevronDown, Check, Clock, Mail, Sparkles, CheckCheck } from 'lucide-react';
import { useContext, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';

export default function ModernTopBar({ user, showSearch = true }) {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');

  // Notification Bell States
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'SMTP Dispatch Configured',
      message: 'Automated email copy set for pavijeevi56@gmail.com',
      time: '10m ago',
      type: 'email',
      read: false,
    },
    {
      id: 2,
      title: 'AI RAG Engine Ready',
      message: 'Talent Knowledge Base is active for instant QA queries',
      time: '1h ago',
      type: 'ai',
      read: false,
    },
    {
      id: 3,
      title: 'Mission Dispatch Alert',
      message: '3 operational tasks currently pending audit certification',
      time: '2h ago',
      type: 'system',
      read: false,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header 
      className={`fixed top-0 left-64 right-0 h-16 z-30 border-b backdrop-blur-md transition-colors ${
        isDark 
          ? 'bg-slate-900/95 border-slate-800' 
          : 'bg-white/95 border-slate-200'
      }`}
    >
      <div className="h-full px-6 flex items-center justify-between">
        {/* Search Bar */}
        {showSearch && (
          <div className="flex-1 max-w-xl">
            <div className={`relative ${
              isDark ? 'bg-slate-800/80 border border-slate-700/60' : 'bg-slate-100 border border-slate-200'
            } rounded-xl`}>
              <Search 
                size={18} 
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              />
              <input
                type="text"
                placeholder="Search tasks, users, or projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 bg-transparent border-none outline-none text-xs font-medium ${
                  isDark 
                    ? 'text-slate-200 placeholder-slate-500' 
                    : 'text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-4 ml-4 relative">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications Button & Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2.5 rounded-xl transition-all cursor-pointer ${
                isDark 
                  ? 'hover:bg-slate-800 text-slate-300 hover:text-white' 
                  : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 border-2 border-slate-900 rounded-full animate-pulse" />
              )}
            </button>

            {/* Interactive Notification Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-50 p-5 space-y-4 animate-fade-in text-white">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell size={18} className="text-cyan-400" />
                    <h4 className="font-black text-sm">System Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full">
                        {unreadCount} New
                      </span>
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-[11px] font-extrabold text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck size={14} /> Mark all read
                    </button>
                  )}
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {notifications.map(n => (
                    <div 
                      key={n.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                        n.read ? 'bg-slate-950/40 border-slate-800/60 opacity-70' : 'bg-slate-950 border-indigo-500/30'
                      }`}
                    >
                      <div className="p-2 bg-indigo-500/20 text-cyan-400 rounded-xl mt-0.5">
                        {n.type === 'email' ? <Mail size={16} /> : n.type === 'ai' ? <Sparkles size={16} /> : <Clock size={16} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-0.5">
                          <h5 className="font-bold text-xs text-white">{n.title}</h5>
                          <span className="text-[10px] text-slate-500 font-semibold">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">{n.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div 
            className={`flex items-center gap-3 px-3 py-1.5 rounded-xl cursor-pointer transition-colors ${
              isDark 
                ? 'hover:bg-slate-800' 
                : 'hover:bg-slate-100'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-white ${
              isDark 
                ? 'bg-gradient-to-tr from-indigo-600 to-cyan-400 shadow-md' 
                : 'bg-gradient-to-tr from-indigo-600 to-cyan-500 shadow-md'
            }`}>
              {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <p className={`text-xs font-black ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                {user?.first_name || user?.username || 'User'}
              </p>
              <p className={`text-[10px] font-extrabold uppercase ${
                isDark ? 'text-cyan-400' : 'text-indigo-600'
              }`}>
                {user?.role === 'admin' || user?.role === 'Admin' ? 'Administrator' : 'Team Member'}
              </p>
            </div>
            <ChevronDown size={14} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
          </div>
        </div>
      </div>
    </header>
  );
}
