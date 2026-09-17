import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Users, LayoutDashboard, ShieldCheck, Sparkles, Cpu, Zap, Activity } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

export default function LandingPage() {
  const { theme } = useContext(ThemeContext);
  const isLight = theme === 'light';

  return (
    <div
      className={`min-h-screen font-sans relative overflow-hidden transition-colors duration-300 ${
        isLight
          ? 'bg-slate-50 text-slate-900 selection:bg-blue-500 selection:text-white'
          : 'bg-slate-950 cyber-grid-bg text-slate-100 selection:bg-cyan-500 selection:text-slate-950'
      }`}
    >
      {/* Background Ambient Orbs for Dark Mode */}
      {!isLight && (
        <>
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
          <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
        </>
      )}

      {/* Navigation Bar with Theme Switcher */}
      <nav
        className={`fixed w-full z-50 transition-colors duration-300 border-b ${
          isLight
            ? 'bg-white/95 border-slate-200/80 shadow-xs'
            : 'bg-slate-900/90 backdrop-blur-md border-slate-800 shadow-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/20">
              <span className="text-white font-black text-xl leading-none">D</span>
            </div>
            <span
              className={`font-extrabold text-xl tracking-tight flex items-center gap-2 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              DTMS{' '}
              <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-200/80 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                AI Enterprise
              </span>
            </span>
          </div>

          <div className="flex gap-3 sm:gap-4 items-center">
            <ThemeToggle />
            <Link
              to="/login"
              className={`text-sm font-semibold transition-colors px-2 py-1 ${
                isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-300 hover:text-white'
              }`}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold bg-[#1a6eff] hover:bg-blue-700 text-white px-5 sm:px-6 py-2.5 rounded-full shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 transition-all active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative z-10">
        <div className="animate-fade-in-up space-y-6">
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-2 ${
              isLight
                ? 'bg-blue-50 border border-blue-200/80 text-blue-700 shadow-xs'
                : 'glass-panel border border-indigo-500/30 text-cyan-400 glow-cyan'
            }`}
          >
            <Sparkles size={14} className={isLight ? 'text-blue-600 animate-spin' : 'text-cyan-400 animate-spin'} /> Autonomous Talent & Workforce Intelligence System
          </div>

          <h1
            className={`text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-tight max-w-5xl mx-auto ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            Orchestrate Workforce Talent with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500">
              AI Intelligence
            </span>
          </h1>

          <p
            className={`text-base sm:text-xl max-w-3xl mx-auto leading-relaxed font-medium ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            Empower your enterprise with voice-to-task dictation, multi-rubric submission grading, vector skill matching, workload burnout optimization & executive financial ROI tracking.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex justify-center items-center gap-2.5 bg-[#1a6eff] hover:bg-blue-700 text-white text-base font-semibold px-8 py-3.5 rounded-full shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all active:scale-95"
            >
              Get Started <ArrowRight size={20} />
            </Link>
            <Link
              to="/login"
              className={`inline-flex justify-center items-center gap-2.5 text-base font-semibold px-8 py-3.5 rounded-full border transition-all active:scale-95 ${
                isLight
                  ? 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100 hover:border-slate-400 shadow-sm'
                  : 'glass-panel text-slate-200 border-slate-700 hover:border-blue-400/50 hover:bg-slate-900'
              }`}
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div
            className={`p-5 rounded-2xl border text-center transition-all ${
              isLight
                ? 'bg-white border-slate-200/80 shadow-md'
                : 'glass-panel border-indigo-500/20'
            }`}
          >
            <p className="text-3xl font-black text-blue-600">99.4%</p>
            <p className={`text-xs font-bold uppercase mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Allocation Precision
            </p>
          </div>
          <div
            className={`p-5 rounded-2xl border text-center transition-all ${
              isLight
                ? 'bg-white border-slate-200/80 shadow-md'
                : 'glass-panel border-indigo-500/20'
            }`}
          >
            <p className="text-3xl font-black text-indigo-600">+38%</p>
            <p className={`text-xs font-bold uppercase mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Velocity Improvement
            </p>
          </div>
          <div
            className={`p-5 rounded-2xl border text-center transition-all ${
              isLight
                ? 'bg-white border-slate-200/80 shadow-md'
                : 'glass-panel border-indigo-500/20'
            }`}
          >
            <p className="text-3xl font-black text-purple-600">24/7</p>
            <p className={`text-xs font-bold uppercase mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Mission Intelligence
            </p>
          </div>
          <div
            className={`p-5 rounded-2xl border text-center transition-all ${
              isLight
                ? 'bg-white border-slate-200/80 shadow-md'
                : 'glass-panel border-indigo-500/20'
            }`}
          >
            <p className="text-3xl font-black text-emerald-600">S-Tier</p>
            <p className={`text-xs font-bold uppercase mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Rubric Grading
            </p>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div
            className={`p-8 rounded-3xl border transition-all group ${
              isLight
                ? 'bg-white border-slate-200/90 shadow-lg hover:shadow-xl hover:border-blue-300'
                : 'glass-panel border-slate-800 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10'
            }`}
          >
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 border border-blue-200/60 group-hover:scale-110 transition-transform">
              <Cpu size={24} />
            </div>
            <h3 className={`text-xl font-black mb-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              AI Task Decomposer & Dictation
            </h3>
            <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Speak or input project goals; Gemini AI parses speech into structured tasks and milestone breakdown packages.
            </p>
          </div>

          <div
            className={`p-8 rounded-3xl border transition-all group ${
              isLight
                ? 'bg-white border-slate-200/90 shadow-lg hover:shadow-xl hover:border-blue-300'
                : 'glass-panel border-slate-800 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/10'
            }`}
          >
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 border border-indigo-200/60 group-hover:scale-110 transition-transform">
              <Activity size={24} />
            </div>
            <h3 className={`text-xl font-black mb-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Vector Match & Workload Heatmap
            </h3>
            <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Match optimal talent profiles based on skill matrices, prevent burnout with 24-hour capacity heatmaps & re-balancers.
            </p>
          </div>

          <div
            className={`p-8 rounded-3xl border transition-all group ${
              isLight
                ? 'bg-white border-slate-200/90 shadow-lg hover:shadow-xl hover:border-blue-300'
                : 'glass-panel border-slate-800 hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-500/10'
            }`}
          >
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 border border-purple-200/60 group-hover:scale-110 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <h3 className={`text-xl font-black mb-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Multi-Rubric Evaluation & ROI
            </h3>
            <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Automate quality assessment across Completeness & Code Quality while tracking financial ROI and total hours saved.
            </p>
          </div>
        </div>
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `,
        }}
      />
    </div>
  );
}
