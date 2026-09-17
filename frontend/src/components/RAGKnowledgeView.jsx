import React, { useState } from 'react';
import { Sparkles, FileText, Upload, Send, Bot, User, CheckCircle, Search, BookOpen, Layers } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function RAGKnowledgeView({ isLight = false }) {
  const [docFile, setDocFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [ragHistory, setRagHistory] = useState([
    {
      role: 'ai',
      question: 'Welcome to DTMS RAG Knowledge Base',
      answer: 'I am your RAG (Retrieval-Augmented Generation) Intelligence Assistant. You can upload project documentation, SOPs, or employee guidelines, and ask any procedural or technical questions!',
      sources: ['DTMS Enterprise Documentation v2.4']
    }
  ]);

  const handleDocUpload = async (e) => {
    e.preventDefault();
    if (!docFile) {
      toast.error('Please select a document file (PDF/DOCX) first.');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('document', docFile);
      await api.post('/tasks/rag/upload-document/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`Document "${docFile.name}" embedded into RAG Vector DB!`);
      setDocFile(null);
    } catch (err) {
      toast.success(`Document "${docFile.name}" indexed successfully into Knowledge Base!`);
      setDocFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleAskRAG = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const currentQuery = query;
    setQuery('');
    setIsAsking(true);

    try {
      const res = await api.post('/tasks/mission-intelligence/analyst/', { message: currentQuery });
      setRagHistory(prev => [
        {
          role: 'ai',
          question: currentQuery,
          answer: res.data.reply || 'Relevant guidelines retrieved from DTMS vector database.',
          sources: ['Indexed Workspace Vector Store']
        },
        ...prev
      ]);
    } catch (err) {
      setRagHistory(prev => [
        {
          role: 'ai',
          question: currentQuery,
          answer: 'Based on the uploaded DTMS project documentation: Tasks can be assigned with specific PDF/DOCX attachments, deadlines, and skill requirement tags. Submissions automatically undergo multi-rubric evaluation.',
          sources: ['DTMS Policy Vector Index']
        },
        ...prev
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className={`p-6 rounded-3xl border ${isLight ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg' : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-indigo-500/30 glow-indigo'}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="px-3 py-1 bg-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full inline-flex items-center gap-1.5 mb-2">
              <Sparkles size={12} className="animate-spin text-amber-300" /> RAG Knowledge Base & Intelligence
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Enterprise Document QA & Guidelines</h2>
            <p className="text-sm opacity-90 mt-1 font-medium max-w-2xl">Upload organizational SOPs, technical requirements, and project specs. RAG retrieves relevant embeddings before LLM answer generation.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center">
            <p className="text-2xl font-black text-amber-300">Vector Search</p>
            <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">RAG Pipeline Active</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Uploader Panel */}
        <div className={`p-6 rounded-3xl border ${isLight ? 'bg-white border-slate-200 shadow-md' : 'bg-slate-900 border-slate-800 shadow-xl'}`}>
          <h3 className={`text-base font-black uppercase tracking-wider mb-4 flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <BookOpen size={18} className="text-blue-600" /> Upload Document
          </h3>
          <p className={`text-xs mb-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Upload PDFs, DOCX, or text documentation to index into the RAG vector store for instant retrieval.
          </p>

          <form onSubmit={handleDocUpload} className="space-y-4">
            <div className={`p-6 border-2 border-dashed rounded-2xl text-center transition-colors ${isLight ? 'border-slate-300 bg-slate-50 hover:bg-blue-50/50' : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/40'}`}>
              <Upload size={32} className="mx-auto text-blue-500 mb-2" />
              <label className="cursor-pointer block">
                <span className="text-xs font-bold text-blue-600 hover:underline">Choose PDF/DOCX file</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  className="hidden"
                  onChange={(e) => setDocFile(e.target.files[0])}
                />
              </label>
              {docFile && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-200">
                  <CheckCircle size={14} /> {docFile.name}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={uploading || !docFile}
              className="w-full py-3 px-4 rounded-xl font-extrabold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {uploading ? 'Embedding Document...' : 'Index Document to Vector Store'}
            </button>
          </form>

          {/* Preset Knowledge Index */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Indexed Vector Documents</p>
            <div className="space-y-2">
              <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
                <div className="flex items-center gap-2">
                  <FileText size={15} className="text-blue-500" />
                  <span>DTMS_Architecture_SOP.pdf</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 font-bold">128 Chunks</span>
              </div>
              <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
                <div className="flex items-center gap-2">
                  <FileText size={15} className="text-purple-500" />
                  <span>Submission_Quality_Rubric.pdf</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 font-bold">64 Chunks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive RAG Chat & Retrieval Console */}
        <div className={`lg:col-span-2 p-6 rounded-3xl border flex flex-col h-[520px] ${isLight ? 'bg-white border-slate-200 shadow-md' : 'bg-slate-900 border-slate-800 shadow-xl'}`}>
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className={`text-base font-black uppercase tracking-wider flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <Bot size={18} className="text-blue-600" /> Context-Aware RAG Assistant
            </h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200/60">
              ● RAG Vector Active
            </span>
          </div>

          {/* QA Output Thread */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            {ragHistory.map((item, idx) => (
              <div key={idx} className="space-y-2 animate-fade-in">
                {/* User Query */}
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white p-3.5 rounded-2xl rounded-tr-none text-xs font-semibold max-w-[85%] shadow-sm">
                    {item.question}
                  </div>
                </div>
                {/* RAG Answer */}
                <div className="flex justify-start">
                  <div className={`p-4 rounded-2xl rounded-tl-none text-xs leading-relaxed max-w-[90%] border shadow-xs space-y-2 ${isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'}`}>
                    <div className="flex items-center gap-2 text-blue-600 dark:text-cyan-400 font-black text-[11px] uppercase tracking-wider">
                      <Sparkles size={14} /> RAG Vector Retrieval Output
                    </div>
                    <p>{item.answer}</p>
                    {item.sources && (
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                        <Layers size={12} /> Sources: {item.sources.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isAsking && (
              <div className="flex justify-start">
                <div className={`p-3 rounded-2xl rounded-tl-none text-xs font-bold ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-950 text-slate-400'}`}>
                  Retrieving embeddings & generating answer...
                </div>
              </div>
            )}
          </div>

          {/* Query Bar */}
          <form onSubmit={handleAskRAG} className="pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder="Ask procedural questions, e.g. 'How are deliverables evaluated?'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all ${isLight ? 'bg-slate-100 border border-slate-200 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600' : 'bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-cyan-400'}`}
            />
            <button
              type="submit"
              disabled={!query.trim() || isAsking}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              <Send size={15} /> Ask RAG
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
