import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Clock, Calendar, CheckCircle, Upload, FileText, FileVideo, Video, Star, Trash2, ShieldCheck, Sparkles } from 'lucide-react';

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [task, setTask] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Submission Form State
  const [content, setContent] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const fetchTaskDetails = async () => {
    try {
      const [tasksRes, subsRes] = await Promise.all([
        api.get('/tasks/tasks/'),
        api.get('/tasks/submissions/')
      ]);
      const targetTask = tasksRes.data.find(t => t.id === parseInt(id));
      if (!targetTask) {
        toast.error('Task not found.');
        navigate('/dashboard');
        return;
      }
      setTask(targetTask);
      
      const targetSub = subsRes.data.find(s => s.task === parseInt(id) && s.user_details.email === user.email);
      if (targetSub) {
        setSubmission(targetSub);
        setContent(targetSub.content || '');
      }
    } catch (err) {
      toast.error('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content && !attachment) {
      toast.error('Please provide a message or attach a file.');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('task', task.id);
      formData.append('content', content);
      if (attachment) formData.append('attachment', attachment);
      formData.append('status', 'Submitted');

      if (submission) {
        // Update existing submission
        await api.patch(`/tasks/submissions/${submission.id}/`, formData, {
           headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Submission updated successfully!');
      } else {
        // Create new submission
        await api.post('/tasks/submissions/', formData, {
           headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Task submitted for review!');
      }
      fetchTaskDetails();
    } catch (err) {
      toast.error('Failed to submit task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmission = async () => {
    if (!window.confirm("Are you sure you want to retract your submission?")) return;
    try {
      await api.delete(`/tasks/submissions/${submission.id}/`);
      toast.success('Submission redacted successfully.');
      setSubmission(null);
      setContent('');
      setAttachment(null);
    } catch (err) {
      toast.error('Failed to retract submission');
    }
  };

  const renderMediaPreview = (url) => {
    if (!url) return null;
    
    const fileName = url.split('/').pop();
    const extension = fileName.split('.').pop().toLowerCase();
    
    const isVideo = ['mp4', 'webm', 'ogg', 'avi', 'mov'].includes(extension);
    const isImage = ['jpeg', 'jpg', 'png', 'gif', 'bmp', 'svg'].includes(extension);
    const isPdf = extension === 'pdf';
    const isZip = ['zip', 'rar', '7z', 'tar', 'gz'].includes(extension);
    const isExcel = ['xls', 'xlsx', 'csv'].includes(extension);
    const isWord = ['doc', 'docx'].includes(extension);
    const isPowerPoint = ['ppt', 'pptx'].includes(extension);
    const isText = ['txt', 'md', 'json', 'xml'].includes(extension);

    return (
      <div className="mt-4 border border-slate-700/80 rounded-2xl overflow-hidden bg-slate-900 relative">
        {isVideo ? (
          <video src={url} controls className="w-full max-h-[400px] object-cover bg-black" />
        ) : isImage ? (
          <img src={url} alt="Attachment" className="w-full max-h-[400px] object-contain bg-slate-950" />
        ) : isPdf ? (
          <iframe src={url} className="w-full h-[500px]" title="PDF Preview" />
        ) : (
           <div className="p-8 flex flex-col items-center justify-center text-slate-400">
              {isZip && <div className="text-6xl mb-4">📦</div>}
              {isExcel && <div className="text-6xl mb-4">📊</div>}
              {isWord && <div className="text-6xl mb-4">📄</div>}
              {isPowerPoint && <div className="text-6xl mb-4">📽️</div>}
              {isText && <div className="text-6xl mb-4">📝</div>}
              {!isZip && !isExcel && !isWord && !isPowerPoint && !isText && <FileText size={48} className="mb-4 text-cyan-400"/>}
              
              <p className="font-bold text-lg text-white mb-2">
                {isZip && 'Compressed Archive'}
                {isExcel && 'Excel Spreadsheet'}
                {isWord && 'Word Document'}
                {isPowerPoint && 'PowerPoint Presentation'}
                {isText && 'Text Document'}
                {!isZip && !isExcel && !isWord && !isPowerPoint && !isText && 'Document Attached'}
              </p>
              <p className="text-xs text-slate-400 mb-4 font-medium">{fileName}</p>
              <a href={url} download className="bg-gradient-to-r from-indigo-600 to-cyan-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2">
                <Upload size={18}/> Download File
              </a>
           </div>
        )}
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="animate-spin h-10 w-10 border-b-2 border-cyan-400 rounded-full"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 cyber-grid-bg p-4 sm:p-8 font-sans text-slate-100">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 font-bold transition-colors mb-6 text-sm">
           <ArrowLeft size={18} /> Back to Command Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
           {/* Task Context Details */}
           <div className="lg:col-span-2 space-y-6">
              <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-xl border border-indigo-500/30 glow-indigo relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 via-purple-500 to-cyan-400"></div>
                 <h1 className="text-3xl font-black text-white mb-4 tracking-tight">{task.title}</h1>
                 
                 <div className="flex flex-wrap gap-4 mb-6">
                   <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-700/80 text-xs font-bold text-slate-300">
                      <Clock size={16} className="text-amber-400"/>
                      Due: {new Date(task.deadline).toLocaleString()}
                   </div>
                   <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-700/80 text-xs font-bold text-slate-300">
                      <Calendar size={16} className="text-cyan-400"/>
                      Assigned: {new Date(task.created_at).toLocaleDateString()}
                   </div>
                 </div>

                 <div className="prose prose-invert max-w-none mb-8">
                    <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Sparkles size={14}/> Mission Briefing Context</h3>
                    <p className="text-slate-300 font-medium leading-relaxed whitespace-pre-wrap text-sm">{task.description}</p>
                 </div>

                 {task.attachment && (
                   <div className="mt-8 border-t border-slate-800/80 pt-6">
                     <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><FileVideo size={16}/> Provided Reference Artifacts</h3>
                     {renderMediaPreview(task.attachment)}
                   </div>
                 )}
              </div>
           </div>

           {/* Submission Engine */}
           <div className="lg:col-span-1">
              <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-2xl border border-indigo-500/30 sticky top-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-white flex items-center gap-2"><Upload size={20} className="text-cyan-400"/> Submission Vault</h3>
                  {submission && (
                     <span className={`px-2.5 py-1 text-[10px] uppercase tracking-widest font-black rounded-full border ${submission.status === 'Reviewed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
                        {submission.status}
                     </span>
                  )}
                </div>

                {submission?.status === 'Reviewed' ? (
                  <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-6 shadow-xl text-white animate-fade-in">
                     <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                           <CheckCircle size={32} className="text-white"/>
                        </div>
                        <h4 className="font-black text-2xl mb-2">Mission Certified!</h4>
                        <p className="text-emerald-100 font-medium text-xs leading-relaxed">
                          Your submission has been audited and certified by Global Administrators. 
                          This achievement has been recorded in your identity profile.
                        </p>
                        <div className="mt-6 w-full flex justify-center">
                           <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/20 flex items-center gap-2">
                              <Star size={16} className="text-amber-300"/>
                              <span className="font-bold text-[10px] uppercase tracking-widest">S-Tier Evaluation</span>
                           </div>
                        </div>
                     </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Message Context</label>
                      <textarea rows="4" className="w-full bg-slate-900 border border-slate-700/80 p-4 rounded-xl focus:ring-2 focus:ring-cyan-400 outline-none font-medium text-slate-200 placeholder-slate-600 text-sm transition-colors" 
                                placeholder="Describe your solution..." value={content} onChange={e => setContent(e.target.value)} />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Deliverable Artifact</label>
                      <div className="relative">
                         <input 
                           type="file" 
                           onChange={e => setAttachment(e.target.files[0])} 
                           className="hidden" 
                           id="file-upload"
                           accept=".zip,.rar,.7z,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.gif,.mp4,.avi,.mov,.csv"
                         />
                         <label htmlFor="file-upload" className="flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-slate-800 border border-slate-700/80 border-dashed p-4 rounded-xl cursor-pointer transition-colors font-bold text-xs text-cyan-400">
                            <Upload size={18}/> {attachment ? attachment.name : (submission?.attachment ? 'Update Existing File' : 'Select File to Upload')}
                         </label>
                      </div>
                      {attachment && (
                        <div className="mt-2 p-3 bg-slate-900 rounded-xl border border-slate-700">
                          <p className="text-[10px] font-bold text-slate-400 mb-1">Selected File:</p>
                          <p className="text-xs text-white font-medium truncate">{attachment.name}</p>
                          <p className="text-[10px] text-slate-500 mt-1">Size: {(attachment.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      )}
                      {submission?.attachment && !attachment && (
                        <p className="mt-2 text-[10px] text-emerald-400 flex items-center gap-1 font-bold"><CheckCircle size={12}/> Previously attached artifact active</p>
                      )}
                    </div>

                    <button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white font-black py-3.5 rounded-xl hover:shadow-cyan-500/20 shadow-md transition-all active:scale-95 disabled:opacity-50 text-xs">
                       {submitting ? 'Transmitting...' : (submission ? 'Update Submission' : 'Deploy Deliverable Artifact')}
                    </button>

                    {submission && (
                       <button type="button" onClick={handleDeleteSubmission} className="w-full mt-2 text-rose-400 hover:text-rose-300 font-bold text-xs py-2 px-4 flex items-center justify-center gap-2">
                          <Trash2 size={16}/> Retract Submission
                       </button>
                    )}
                  </form>
                )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
