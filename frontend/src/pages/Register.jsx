import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { User, Mail, Lock, ArrowRight, ArrowLeft, Upload, Phone, Globe, Award, CheckCircle, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';
import ThemeToggle from '../components/ThemeToggle';

export default function Register() {
  const { login } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone_number: '', country: '',
    skills: '', experience: ''
  });

  const isLight = theme === 'light';

  const phoneValidationRules = {
    "India": 10,
    "United States": 10,
    "Canada": 10,
    "United Kingdom": 10,
    "China": 11,
    "Brazil": 11,
    "Japan": 10,
    "Germany": 10,
    "Australia": 9,
    "France": 9,
    "South Africa": 9
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateStep1 = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.password || !formData.phone_number.trim() || !formData.country) {
      toast.error('All primary identification fields are required');
      return false;
    }
    
    const numericPhone = formData.phone_number.replace(/\D/g, '');
    const requiredLength = phoneValidationRules[formData.country];
    
    if (requiredLength && numericPhone.length !== requiredLength) {
      toast.error(`${formData.country} phone numbers must be exactly ${requiredLength} digits long.`);
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passcode mismatch: Passwords do not match');
      return false;
    }
    if (formData.password.length < 8) {
      toast.error('Security Protocol: Password must be at least 8 characters');
      return false;
    }
    return true;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => setStep(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('email', formData.email);
      payload.append('password', formData.password);
      payload.append('phone_number', formData.phone_number);
      payload.append('country', formData.country);
      payload.append('skills', formData.skills);
      payload.append('experience', formData.experience);
      payload.append('role', 'User');
      
      if (resumeFile) {
        payload.append('resume', resumeFile);
      }

      await api.post('/auth/register/', payload, { headers: { 'Content-Type': 'multipart/form-data' }});
      toast.success('Account created successfully!');
      
      const res = await api.post('/auth/login/', { email: formData.email, password: formData.password });
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      await login(formData.email, formData.password);
    } catch (err) {
      if (err.response?.data) {
        const errors = err.response.data;
        Object.keys(errors).forEach(field => {
          const messages = errors[field];
          if (Array.isArray(messages)) {
            messages.forEach(msg => toast.error(`${field.replace('_', ' ')}: ${msg}`));
          } else {
            toast.error(messages);
          }
        });
      } else {
        toast.error('Registration failed. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden pt-20 transition-colors duration-300 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 cyber-grid-bg text-slate-100'}`}>
      {/* Top Header with Theme Switcher */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 border-b ${isLight ? 'bg-white/95 border-slate-200/80 shadow-xs' : 'bg-slate-900/90 backdrop-blur-md border-slate-800 shadow-md'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/20">
               <span className="text-white font-black text-xl leading-none">D</span>
            </div>
            <span className={`font-extrabold text-xl tracking-tight flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              DTMS <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-200/80 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">AI Enterprise</span>
            </span>
          </Link>

          <div className="flex gap-3 sm:gap-4 items-center">
            <ThemeToggle />
            <Link to="/login" className={`text-sm font-semibold transition-colors px-2 py-1 ${isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-300 hover:text-white'}`}>
              Sign In
            </Link>
            <Link to="/register" className="text-sm font-semibold bg-[#1a6eff] hover:bg-blue-700 text-white px-5 sm:px-6 py-2.5 rounded-full shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 transition-all active:scale-95">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Ambient Lighting Orbs */}
      {!isLight && (
        <>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
        </>
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md md:max-w-xl z-10">
        <h1 className="text-3xl sm:text-4xl font-black text-[#1a6eff] text-center tracking-tight mb-1">DTMS</h1>
        <h2 className={`text-center text-2xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>Create your account</h2>
        <p className={`mt-1 text-center text-sm font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Join the Digital Talent Management System</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md md:max-w-xl z-10">
        <div className={`py-8 px-4 sm:rounded-2xl sm:px-10 border transition-all duration-300 relative overflow-hidden ${isLight ? 'bg-white border-slate-200/90 shadow-xl' : 'glass-panel border-indigo-500/30 glow-indigo'}`}>
          
          {/* Progress Bar Header */}
          <div className="flex justify-between items-center mb-8 relative">
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 rounded-full z-0 ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}></div>
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#1a6eff] rounded-full z-0 transition-all duration-500`} style={{ width: step === 1 ? '50%' : '100%' }}></div>
            
            <div className={`relative z-10 w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm transition-all shadow-md ${step >= 1 ? 'bg-[#1a6eff] text-white shadow-blue-500/30' : isLight ? 'bg-slate-100 text-slate-400 border border-slate-300' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>1</div>
            <div className={`relative z-10 w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm transition-all shadow-md ${step >= 2 ? 'bg-[#1a6eff] text-white shadow-blue-500/30' : isLight ? 'bg-slate-100 text-slate-400 border border-slate-300' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>2</div>
          </div>

          <form onSubmit={step === 1 ? handleNext : handleSubmit} className="space-y-6">
            
            {/* STEP 1: Basic Authentication */}
            <div className={`transition-all duration-300 ${step === 1 ? 'block animate-fade-in' : 'hidden'}`}>
                <h3 className={`text-sm font-bold uppercase tracking-wider mb-6 pb-2 border-b flex items-center gap-2 ${isLight ? 'text-blue-600 border-slate-200' : 'text-indigo-300 border-slate-800/80'}`}>
                  <User size={18} className="text-[#1a6eff]" /> Primary Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Full Name</label>
                    <div className="relative">
                      <input name="name" type="text" required value={formData.name} onChange={handleChange} className={`block w-full rounded-lg p-3 text-sm font-medium outline-none transition-all ${isLight ? 'border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#1a6eff]' : 'border border-slate-700/80 bg-slate-900/90 text-white placeholder-slate-500'}`} placeholder="John Doe" />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Email Address</label>
                    <div className="relative">
                      <input name="email" type="email" required value={formData.email} onChange={handleChange} className={`block w-full rounded-lg p-3 text-sm font-medium outline-none transition-all ${isLight ? 'border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#1a6eff]' : 'border border-slate-700/80 bg-slate-900/90 text-white placeholder-slate-500'}`} placeholder="john@example.com" />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Password</label>
                    <div className="relative">
                      <input name="password" type={showPassword ? "text" : "password"} required value={formData.password} onChange={handleChange} className={`block w-full rounded-lg p-3 pr-10 text-sm font-medium outline-none transition-all ${isLight ? 'border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#1a6eff]' : 'border border-slate-700/80 bg-slate-900/90 text-white placeholder-slate-500'}`} placeholder="••••••••" />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" /> : <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Confirm Password</label>
                    <div className="relative">
                      <input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} required value={formData.confirmPassword} onChange={handleChange} className={`block w-full rounded-lg p-3 pr-10 text-sm font-medium outline-none transition-all ${isLight ? 'border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#1a6eff]' : 'border border-slate-700/80 bg-slate-900/90 text-white placeholder-slate-500'}`} placeholder="••••••••" />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" /> : <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Phone Number</label>
                    <div className="relative">
                      <input name="phone_number" type="tel" required value={formData.phone_number} onChange={handleChange} className={`block w-full rounded-lg p-3 text-sm font-medium outline-none transition-all ${isLight ? 'border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#1a6eff]' : 'border border-slate-700/80 bg-slate-900/90 text-white placeholder-slate-500'}`} placeholder="+1 (555) 000-0000" />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Country</label>
                    <div className="relative">
                      <select name="country" required value={formData.country} onChange={handleChange} className={`block w-full rounded-lg p-3 text-sm font-medium outline-none transition-all appearance-none ${isLight ? 'border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1a6eff]' : 'border border-slate-700/80 bg-slate-900 text-white'}`}>
                        <option value="" className={isLight ? "text-slate-400 bg-white" : "bg-slate-900 text-slate-400"}>Select Country</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                        <option value="India">India</option>
                        <option value="Japan">Japan</option>
                        <option value="China">China</option>
                        <option value="Brazil">Brazil</option>
                        <option value="South Africa">South Africa</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <button type="submit" className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg shadow-md text-sm font-semibold text-white bg-[#1a6eff] hover:bg-blue-700 focus:outline-none transition-all active:scale-95 cursor-pointer">
                    Next Step <ArrowRight size={18} />
                  </button>
                </div>
            </div>

            {/* STEP 2: Profile Details */}
            <div className={`transition-all duration-300 ${step === 2 ? 'block animate-fade-in' : 'hidden'}`}>
                <h3 className={`text-sm font-bold uppercase tracking-wider mb-6 pb-2 border-b flex items-center gap-2 ${isLight ? 'text-blue-600 border-slate-200' : 'text-indigo-300 border-slate-800/80'}`}>
                  <Award size={18} className="text-[#1a6eff]" /> Skills & Experience
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Core Skills</label>
                    <input name="skills" type="text" value={formData.skills} onChange={handleChange} className={`block w-full rounded-lg p-3 text-sm font-medium outline-none transition-all ${isLight ? 'border border-slate-300 bg-white text-slate-900 placeholder-slate-400' : 'border border-slate-700/80 bg-slate-900/90 text-white'}`} placeholder="React, Python, Project Management..." />
                  </div>
                  
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Work Experience</label>
                    <textarea name="experience" rows="3" value={formData.experience} onChange={handleChange} className={`block w-full rounded-lg p-3 text-sm font-medium outline-none transition-all ${isLight ? 'border border-slate-300 bg-white text-slate-900 placeholder-slate-400' : 'border border-slate-700/80 bg-slate-900/90 text-white'}`} placeholder="Describe your experience..." />
                  </div>

                  <div className={`p-4 rounded-xl border border-dashed ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-900/60 border-slate-700'}`}>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Resume Document (PDF/DOCX)</label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                       <label className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2.5 rounded-lg font-semibold cursor-pointer hover:bg-blue-100 transition-colors border border-blue-200/80 w-full sm:w-auto justify-center text-sm">
                          <Upload size={18}/>
                          <span className="truncate max-w-[200px]">{resumeFile ? resumeFile.name : 'Choose File'}</span>
                          <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={e => setResumeFile(e.target.files[0])} />
                       </label>
                       {resumeFile && <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckCircle size={16}/> Ready</span>}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button type="button" onClick={handleBack} className={`w-1/3 flex justify-center items-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-colors ${isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button type="submit" disabled={loading} className="w-2/3 flex justify-center items-center gap-2 py-3 px-4 rounded-lg shadow-md text-sm font-semibold text-white bg-[#1a6eff] hover:bg-blue-700 focus:outline-none transition-all active:scale-95 disabled:opacity-50">
                    {loading ? 'Creating...' : 'Register'}
                  </button>
                </div>
            </div>

          </form>
          
          {step === 1 && (
             <div className="mt-6 border-t pt-4 text-center text-sm font-medium text-slate-500 border-slate-200">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-[#1a6eff] hover:underline">Sign in here</Link>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
