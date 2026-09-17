import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const { login } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success('Clearance granted! Welcome back.');
    } catch (err) {
      if (err.response?.data?.detail) {
        toast.error(err.response.data.detail);
      } else {
        toast.error('Invalid credentials or security failure.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isLight = theme === 'light';

  return (
    <div
      className={`min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden transition-colors duration-300 ${
        isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 cyber-grid-bg text-slate-100'
      }`}
    >
      {/* Top Header with Theme Switcher */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 border-b ${
          isLight
            ? 'bg-white/95 border-slate-200/80 shadow-xs'
            : 'bg-slate-900/90 backdrop-blur-md border-slate-800 shadow-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3">
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
          </Link>

          <div className="flex gap-3 sm:gap-4 items-center">
            <ThemeToggle />
            <Link
              to="/login"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors px-2 py-1"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold bg-[#1a6eff] hover:bg-blue-700 text-white px-5 sm:px-6 py-2 rounded-full shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 transition-all active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Ambient Orbs for dark mode */}
      {!isLight && (
        <>
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
        </>
      )}

      {/* Center Sign In Card matching exact user reference screenshot */}
      <div
        className={`max-w-md w-full space-y-6 p-8 sm:p-10 rounded-2xl transition-all duration-300 relative z-10 mt-16 ${
          isLight
            ? 'bg-white border border-slate-200/90 shadow-xl'
            : 'glass-panel border border-indigo-500/30 glow-indigo'
        }`}
      >
        <div>
          {/* DTMS Header Logo Matching Screenshot */}
          <h1 className="text-3xl sm:text-4xl font-black text-[#1a6eff] text-center tracking-tight mb-1">
            DTMS
          </h1>
          <h2
            className={`text-xl sm:text-2xl font-bold text-center tracking-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            Sign in to your account
          </h2>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                className={`block text-sm font-semibold mb-1.5 ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}
              >
                Email address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  className={`block w-full rounded-lg p-3 text-sm font-medium outline-none transition-all ${
                    isLight
                      ? 'border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#1a6eff] focus:border-[#1a6eff]'
                      : 'border border-slate-700/80 bg-slate-900/90 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400'
                  }`}
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label
                className={`block text-sm font-semibold mb-1.5 ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className={`block w-full rounded-lg p-3 pr-10 text-sm font-medium outline-none transition-all ${
                    isLight
                      ? 'border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#1a6eff] focus:border-[#1a6eff]'
                      : 'border border-slate-700/80 bg-slate-900/90 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400'
                  }`}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 rounded-lg shadow-md text-sm font-semibold text-white bg-[#1a6eff] hover:bg-blue-700 hover:shadow-blue-500/25 focus:outline-none transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center text-sm font-medium text-slate-500 pt-2">
            <span>Don't have an account? </span>
            <Link
              to="/register"
              className="font-semibold text-[#1a6eff] hover:underline"
            >
              Register here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
