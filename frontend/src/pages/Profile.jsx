import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, User, Mail, Award, Edit3, Save, Phone, FileText, Download, Upload, ExternalLink, Briefcase, CheckCircle, Globe, ShieldCheck, Sparkles } from 'lucide-react';

export default function Profile() {
  const { user: authUser, checkAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: '', email: '', role: '', bio: '', skills: '', phone_number: '', country: '', experience: '', resume: null,
    department: 'Engineering', designation: 'Talent Specialist', availability_status: 'Available', weekly_capacity_hours: 40,
    education: '', certifications: ''
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile/');
      setProfile({
        name: res.data.name || '',
        email: res.data.email || '',
        role: res.data.role || '',
        bio: res.data.bio || '',
        skills: res.data.skills || '',
        phone_number: res.data.phone_number || '',
        country: res.data.country || '',
        experience: res.data.experience || '',
        resume: res.data.resume || null,
        department: res.data.department || 'Engineering',
        designation: res.data.designation || 'Talent Specialist',
        availability_status: res.data.availability_status || 'Available',
        weekly_capacity_hours: res.data.weekly_capacity_hours || 40,
        education: res.data.education || '',
        certifications: res.data.certifications || ''
      });
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', profile.name);
      formData.append('bio', profile.bio);
      formData.append('skills', profile.skills);
      formData.append('phone_number', profile.phone_number);
      formData.append('country', profile.country);
      formData.append('experience', profile.experience);
      formData.append('department', profile.department);
      formData.append('designation', profile.designation);
      formData.append('availability_status', profile.availability_status);
      formData.append('weekly_capacity_hours', profile.weekly_capacity_hours);
      formData.append('education', profile.education);
      formData.append('certifications', profile.certifications);
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }

      await api.patch('/auth/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Professional Identity Clearance Updated');
      setIsEditing(false);
      fetchProfile();
      await checkAuth(); // Refresh global auth state
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  const exportCSV = () => {
    const csvContent = [
      ["Name", "Email", "Role", "Department", "Designation", "Availability", "Capacity (h/wk)", "Skills", "Experience", "Bio"],
      [profile.name, profile.email, profile.role, profile.department, profile.designation, profile.availability_status, profile.weekly_capacity_hours, `"${profile.skills}"`, `"${profile.experience}"`, `"${profile.bio}"`]
    ].map(e => e.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${profile.name.replace(/\s+/g, '_')}_Profile.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Export downloaded!');
  };

  const exportPDF = () => {
    window.print();
    toast.success('PDF Export generated!');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="animate-spin h-10 w-10 border-b-2 border-cyan-400 rounded-full"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 cyber-grid-bg p-6 md:p-12 font-sans overflow-x-hidden text-slate-100 print:bg-white print:text-slate-900 print:p-0">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation & Controls */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 font-bold transition-colors text-sm">
             <ArrowLeft size={18} /> Return to Command Dashboard
          </button>
          <div className="flex gap-3">
             <button onClick={exportCSV} className="bg-emerald-500/10 text-emerald-400 px-4 py-2 font-bold rounded-xl border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors flex items-center gap-2 text-xs shadow-sm">
               <Download size={16}/> Export CSV
             </button>
             <button onClick={exportPDF} className="bg-indigo-500/10 text-indigo-400 px-4 py-2 font-bold rounded-xl border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors flex items-center gap-2 text-xs shadow-sm">
               <Download size={16}/> Export PDF
             </button>
          </div>
        </div>

        {/* Profile Card Architecture */}
        <div className="glass-panel rounded-3xl shadow-2xl overflow-hidden border border-indigo-500/30 glow-indigo print:shadow-none print:border-none print:rounded-none">
           <div className="h-44 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 relative print:hidden border-b border-indigo-500/20">
              <div className="absolute -bottom-16 left-8 sm:left-12">
                 <div className="w-32 h-32 bg-slate-900 rounded-2xl p-2 shadow-2xl border border-indigo-500/40 glow-indigo">
                    <div className="w-full h-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 rounded-xl flex items-center justify-center text-4xl font-black text-white">
                       {profile.name.charAt(0).toUpperCase()}
                    </div>
                 </div>
              </div>
           </div>

           <div className="pt-20 px-8 sm:px-12 pb-12 print:pt-4">
              <div className="flex justify-between items-start mb-8 border-b border-slate-800/80 pb-8">
                 <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-white mb-1 tracking-tight">{profile.name}</h1>
                    <p className="text-cyan-400 font-bold text-xs tracking-wide mb-3 uppercase flex items-center gap-1.5"><ShieldCheck size={14}/> {profile.designation} • {profile.department}</p>
                    <div className="flex flex-col gap-2 mt-2 text-slate-400 text-xs font-medium">
                       <p className="flex items-center gap-2.5"><Mail size={16} className="text-indigo-400"/> {profile.email}</p>
                       <div className="flex flex-wrap items-center gap-6">
                          <p className="flex items-center gap-2.5"><Phone size={16} className="text-indigo-400"/> {profile.phone_number || 'No phone number'}</p>
                          <p className="flex items-center gap-2"><Globe size={16} className="text-indigo-400"/> {profile.country || 'No country given'}</p>
                       </div>
                    </div>
                 </div>
                 <div className="flex flex-col items-end gap-3">
                   <div className="flex gap-2">
                     <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase border ${profile.role === 'Admin' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
                        {profile.role}
                     </span>
                     <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase border ${profile.availability_status === 'Available' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : profile.availability_status === 'Occupied' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                        {profile.availability_status}
                     </span>
                   </div>
                   {profile.resume && !isEditing && (
                     <a href={profile.resume} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-cyan-400 font-bold bg-indigo-500/10 px-4 py-2 rounded-xl hover:bg-indigo-500/20 transition-colors border border-indigo-500/30 text-xs print:hidden">
                       <FileText size={16}/> View Clearance Document
                     </a>
                   )}
                 </div>
              </div>

              {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-8">
                      <div>
                         <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2 mb-3"><User size={16}/> Professional Biography</h3>
                         <p className="text-slate-300 font-medium leading-relaxed bg-slate-900/80 p-6 rounded-2xl border border-slate-800 text-sm print:bg-white print:text-slate-900 print:border-transparent print:p-0">{profile.bio || "No biography provided yet."}</p>
                      </div>
                      <div>
                         <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2 mb-3"><Award size={16}/> Core Skills & Education Matrix</h3>
                         {profile.skills ? (
                           <div className="flex flex-wrap gap-2 mb-4">
                             {profile.skills.split(',').map((skill, i) => (
                               <span key={i} className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-cyan-400 font-bold text-xs rounded-lg">{skill.trim()}</span>
                             ))}
                           </div>
                         ) : <p className="text-slate-500 italic mb-4 text-xs">No skills listed.</p>}
                         {profile.education && (
                           <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-xs font-medium text-slate-300">
                             <strong className="block text-white mb-1">Education Background:</strong>
                             {profile.education}
                           </div>
                         )}
                      </div>
                   </div>
                   
                   <div className="space-y-8">
                      <div>
                         <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2 mb-3"><Briefcase size={16}/> Work History & Certifications</h3>
                         <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 print:bg-white print:text-slate-900 print:border-transparent print:p-0">
                           {profile.experience ? (
                             <p className="text-slate-300 font-medium text-sm leading-relaxed whitespace-pre-wrap mb-4">{profile.experience}</p>
                           ) : (
                             <p className="text-slate-500 italic mb-4 text-xs">No experience data provided.</p>
                           )}
                           {profile.certifications && (
                             <div className="border-t border-slate-800 pt-3 text-xs font-medium text-slate-300">
                               <strong className="block text-white mb-1">Certifications:</strong>
                               {profile.certifications}
                             </div>
                           )}
                         </div>
                      </div>
                   </div>

                   <div className="md:col-span-2 flex justify-end mt-4 print:hidden">
                      <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-cyan-500/20 transition-all text-xs shadow-md active:scale-95">
                         <Edit3 size={18}/> Update System Identity Clearance
                      </button>
                   </div>
                </div>
              ) : (
                <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in bg-slate-900/90 p-6 rounded-3xl border border-indigo-500/30">
                   <div className="md:col-span-2 flex justify-between items-center mb-2 border-b border-slate-800 pb-4">
                     <h3 className="text-lg font-black text-white flex items-center gap-2"><Edit3 size={20} className="text-cyan-400"/> Edit Professional Identity Clearance</h3>
                   </div>
                   
                   <div>
                     <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Full Name</label>
                     <input type="text" required className="w-full p-3.5 rounded-xl border border-slate-700 focus:ring-2 focus:ring-cyan-400 outline-none font-medium bg-slate-950 text-white text-sm" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Department</label>
                     <input type="text" className="w-full p-3.5 rounded-xl border border-slate-700 focus:ring-2 focus:ring-cyan-400 outline-none font-medium bg-slate-950 text-white text-sm" value={profile.department} onChange={e => setProfile({...profile, department: e.target.value})} placeholder="Engineering, Design, Marketing..." />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Designation / Title</label>
                     <input type="text" className="w-full p-3.5 rounded-xl border border-slate-700 focus:ring-2 focus:ring-cyan-400 outline-none font-medium bg-slate-950 text-white text-sm" value={profile.designation} onChange={e => setProfile({...profile, designation: e.target.value})} placeholder="Senior Full Stack Engineer..." />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Availability Status</label>
                     <select className="w-full p-3.5 rounded-xl border border-slate-700 focus:ring-2 focus:ring-cyan-400 outline-none font-medium bg-slate-950 text-white text-sm" value={profile.availability_status} onChange={e => setProfile({...profile, availability_status: e.target.value})}>
                       <option value="Available">Available for Tasks</option>
                       <option value="Occupied">Occupied / High Workload</option>
                       <option value="On Leave">On Leave</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Weekly Capacity (Hours)</label>
                     <input type="number" min="10" max="80" className="w-full p-3.5 rounded-xl border border-slate-700 focus:ring-2 focus:ring-cyan-400 outline-none font-medium bg-slate-950 text-white text-sm" value={profile.weekly_capacity_hours} onChange={e => setProfile({...profile, weekly_capacity_hours: e.target.value})} />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Phone Number</label>
                     <input type="text" className="w-full p-3.5 rounded-xl border border-slate-700 focus:ring-2 focus:ring-cyan-400 outline-none font-medium bg-slate-950 text-white text-sm" value={profile.phone_number} onChange={e => setProfile({...profile, phone_number: e.target.value})} placeholder="+1 (555) 000-0000" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Country</label>
                     <input type="text" className="w-full p-3.5 rounded-xl border border-slate-700 focus:ring-2 focus:ring-cyan-400 outline-none font-medium bg-slate-950 text-white text-sm" value={profile.country} onChange={e => setProfile({...profile, country: e.target.value})} placeholder="United States" />
                   </div>
                   
                   <div className="md:col-span-2">
                     <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Biography</label>
                     <textarea rows="2" className="w-full p-3.5 rounded-xl border border-slate-700 focus:ring-2 focus:ring-cyan-400 outline-none font-medium bg-slate-950 text-white text-sm" value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} placeholder="Tell us about your professional background..." />
                   </div>

                   <div className="md:col-span-2">
                     <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Professional Experience</label>
                     <textarea rows="3" className="w-full p-3.5 rounded-xl border border-slate-700 focus:ring-2 focus:ring-cyan-400 outline-none font-medium bg-slate-950 text-white text-sm" value={profile.experience} onChange={e => setProfile({...profile, experience: e.target.value})} placeholder="List your previous roles, achievements, and responsibilities..." />
                   </div>

                   <div>
                     <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Education</label>
                     <textarea rows="2" className="w-full p-3.5 rounded-xl border border-slate-700 focus:ring-2 focus:ring-cyan-400 outline-none font-medium bg-slate-950 text-white text-sm" value={profile.education} onChange={e => setProfile({...profile, education: e.target.value})} placeholder="Degree, University, Graduation Year..." />
                   </div>

                   <div>
                     <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Certifications</label>
                     <textarea rows="2" className="w-full p-3.5 rounded-xl border border-slate-700 focus:ring-2 focus:ring-cyan-400 outline-none font-medium bg-slate-950 text-white text-sm" value={profile.certifications} onChange={e => setProfile({...profile, certifications: e.target.value})} placeholder="AWS Certified, PMP, Scum Master..." />
                   </div>

                   <div className="md:col-span-2">
                     <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Technical Skills <span className="text-slate-500 font-normal">(Comma separated)</span></label>
                     <input type="text" className="w-full p-3.5 rounded-xl border border-slate-700 focus:ring-2 focus:ring-cyan-400 outline-none font-medium bg-slate-950 text-white text-sm" value={profile.skills} onChange={e => setProfile({...profile, skills: e.target.value})} placeholder="e.g. React, Django, UI Design, Marketing" />
                   </div>

                   <div className="md:col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
                     <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Resume / CV Upload (PDF, DOCX)</label>
                     <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 bg-indigo-500/10 text-cyan-400 px-4 py-3 rounded-lg font-bold cursor-pointer hover:bg-indigo-500/20 transition-colors border border-indigo-500/30 w-full sm:w-auto text-xs">
                           <Upload size={18}/>
                           <span className="truncate max-w-[200px]">{resumeFile ? resumeFile.name : 'Select File To Upload'}</span>
                           <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={e => setResumeFile(e.target.files[0])} />
                        </label>
                        {profile.resume && !resumeFile && <span className="text-xs font-medium text-emerald-400 flex items-center gap-1"><CheckCircle size={14}/> Active Clearance Document on file</span>}
                     </div>
                   </div>

                   <div className="md:col-span-2 flex gap-3 justify-end mt-4 pt-4 border-t border-slate-800">
                     <button type="button" onClick={() => { setIsEditing(false); setResumeFile(null); }} className="px-6 py-3 text-slate-400 font-bold hover:bg-slate-800 rounded-xl transition-colors text-xs">Cancel</button>
                     <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold rounded-xl hover:shadow-cyan-500/20 transition-all text-xs">
                         <Save size={18}/> Commit Clearance Changes
                     </button>
                   </div>
                </form>
               )}
            </div>
         </div>
      </div>

      
      {/* Print CSS hiding non-essential UI */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @media print {
          body * { visibility: hidden; }
          .max-w-4xl, .max-w-4xl * { visibility: visible; }
          .max-w-4xl { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; }
          .print\\:hidden { display: none !important; }
        }
      `}} />
    </div>
  );
}
