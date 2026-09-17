import { 
  LayoutDashboard, Users, CheckSquare, BarChart3, Settings, 
  LogOut, Briefcase, Award, Activity, FileText, Upload, 
  ShieldCheck, UserCheck, Sparkles 
} from 'lucide-react';
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';

export default function ModernSidebar({ activeView, setActiveView, onLogout, userRole }) {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const isDark = theme === 'dark';

  // Determine effective role: explicit prop > context user role > fallback 'user'
  const detectedRole = (user?.role || '').toLowerCase();
  const effectiveRole = userRole || (detectedRole === 'admin' ? 'admin' : 'user');
  const isAdmin = effectiveRole === 'admin';

  const adminMenuItems = [
    { id: 'dashboard', label: 'Admin Console', icon: LayoutDashboard },
    { id: 'tasks', label: 'Mission Hub', icon: CheckSquare },
    { id: 'team', label: 'Team Directory', icon: Users },
    { id: 'analytics', label: 'Analytics & ROI', icon: BarChart3 },
    { id: 'reports', label: 'Reports & Export', icon: FileText },
  ];

  const userMenuItems = [
    { id: 'profile', label: 'User Profile', icon: UserCheck },
    { id: 'dashboard', label: 'Talent Dashboard', icon: LayoutDashboard },
    { id: 'my-tasks', label: 'My Missions', icon: CheckSquare },
    { id: 'submissions', label: 'Submissions & Upload', icon: Upload },
    { id: 'achievements', label: 'Badges & Level', icon: Award },
    { id: 'activity', label: 'Audit Activity', icon: Activity },
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen w-64 z-40 transition-all duration-300 border-r flex flex-col justify-between ${
        isDark 
          ? 'bg-[#0f172a] border-slate-800' 
          : 'bg-white border-slate-200'
      }`}
    >
      <div>
        {/* Logo & Portal Branding Section */}
        <div className={`p-4 border-b flex flex-col items-start gap-2 ${
          isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black shadow-md ${
                isAdmin 
                  ? 'bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white' 
                  : 'bg-gradient-to-tr from-cyan-500 via-teal-500 to-indigo-600 text-slate-950'
              }`}>
                {isAdmin ? <ShieldCheck size={20} /> : <UserCheck size={20} />}
              </div>
              <div>
                <span className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  DTMS {isAdmin ? 'Admin' : 'Talent'}
                </span>
                <span className="block text-[10px] font-bold text-slate-400 -mt-1">
                  Enterprise v2.4
                </span>
              </div>
            </div>
          </div>

          {/* Role Pill Badge */}
          <div className="mt-1 w-full">
            <span className={`w-full text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border flex items-center justify-center gap-1.5 shadow-sm ${
              isAdmin 
                ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' 
                : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
            }`}>
              <Sparkles size={12} /> {isAdmin ? 'ADMINISTRATOR CONSOLE' : 'TALENT WORKSPACE'}
            </span>
          </div>
        </div>

        {/* Section Label */}
        <div className="px-5 pt-4 pb-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            {isAdmin ? 'Management Modules' : 'Talent Navigation'}
          </p>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-bold text-xs cursor-pointer ${
                  isActive
                    ? isAdmin
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30 font-black'
                      : 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/30 font-black'
                    : isDark
                      ? 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon 
                  size={18} 
                  className={isActive ? (isAdmin ? 'text-cyan-300' : 'text-amber-300') : 'group-hover:scale-110 transition-transform'}
                />
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Info Card & Logout Button */}
      <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-950/40">
        <div className="flex items-center gap-3 px-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white ${
            isAdmin ? 'bg-indigo-600' : 'bg-cyan-600'
          }`}>
            {(user?.first_name || user?.username || 'U').slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 truncate">
            <p className="text-xs font-bold text-white truncate">{user?.first_name || user?.username || 'User'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email || 'authenticated'}</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            isDark
              ? 'text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30'
              : 'text-slate-600 hover:bg-rose-50 hover:text-rose-600 border border-slate-200'
          }`}
        >
          <LogOut size={16} />
          <span>Logout Session</span>
        </button>
      </div>
    </aside>
  );
}
