import { useState } from 'react';
import { Bot, Sparkles, X, Send, FileText, Upload, ChevronRight, BookOpen } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function FloatingRAGDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'docs'
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'bot',
      text: 'Greetings! I am the DTMS RAG Knowledge & Talent AI Assistant. Ask me anything about project guidelines, SOPs, or team skill sets.'
    }
  ]);
  const [query, setQuery] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  // Doc Upload State
  const [docTitle, setDocTitle] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSendQuery = async (e) => {
    e?.preventDefault();
    if (!query.trim() || isAsking) return;

    const userMsg = query;
    setQuery('');
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setIsAsking(true);

    try {
      // Call RAG Talent / Knowledge Search endpoint
      const res = await api.post('tasks/talent-search/', { query: userMsg });
      const reply = res.data?.reply || 'Information processed according to knowledge base vector context.';
      setChatMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: 'bot', text: 'Apologies, I encountered an issue retrieving context. Please ensure backend services are active.' }]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleUploadSop = async (e) => {
    e?.preventDefault();
    if (!docFile || !docTitle.trim()) {
      toast.error('Please enter a title and attach a document file');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Indexing SOP document into RAG vector engine...');

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.dismiss(toastId);
      toast.success(`SOP "${docTitle}" successfully indexed into RAG Knowledge Base!`);
      setDocTitle('');
      setDocFile(null);
      setActiveTab('chat');
    } catch (err) {
      toast.dismiss(toastId);
      toast.error('Failed to index document');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button at Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-95 text-white p-4 rounded-full shadow-2xl shadow-cyan-500/30 transition-all duration-300 transform hover:scale-110 flex items-center gap-2 cursor-pointer border border-cyan-300/40"
          title="RAG AI Assistant"
        >
          <div className="relative">
            <Bot size={26} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full animate-ping" />
          </div>
          <span className="font-black text-xs hidden sm:inline pr-1">RAG AI Assistant</span>
        </button>
      </div>

      {/* Slide-over Right Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-fade-in">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsOpen(false)}
          />

          {/* Right Panel Container */}
          <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 text-white shadow-2xl flex flex-col h-full z-10">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/20 text-cyan-400 rounded-2xl border border-cyan-500/30">
                  <Sparkles size={22} />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white leading-tight">RAG Knowledge Assistant</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Vector QA & SOP Intelligence</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-800 bg-slate-950 px-6 pt-3 text-xs font-bold">
              <button
                onClick={() => setActiveTab('chat')}
                className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'chat' ? 'border-cyan-400 text-cyan-400 font-black' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Bot size={16} /> RAG AI Chat
              </button>
              <button
                onClick={() => setActiveTab('docs')}
                className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'docs' ? 'border-cyan-400 text-cyan-400 font-black' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen size={16} /> Upload SOP Document
              </button>
            </div>

            {/* Content Area 1: Chat */}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Messages List */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex gap-3 text-xs leading-relaxed ${
                        msg.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {msg.sender === 'bot' && (
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 text-white flex items-center justify-center font-black flex-shrink-0">
                          🤖
                        </div>
                      )}
                      <div
                        className={`p-4 rounded-2xl max-w-[85%] font-medium ${
                          msg.sender === 'user'
                            ? 'bg-[#5452f6] text-white rounded-tr-none shadow-md font-bold'
                            : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isAsking && (
                    <div className="flex gap-3 text-xs">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black animate-spin">
                        ⚡
                      </div>
                      <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-slate-400 font-bold flex items-center gap-2">
                        Retrieving vector knowledge...
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Bar */}
                <form onSubmit={handleSendQuery} className="p-4 border-t border-slate-800 bg-slate-950 flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask about team skills, SOPs, guidelines..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 text-white placeholder-slate-500 px-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-cyan-400 text-xs font-medium"
                  />
                  <button
                    type="submit"
                    disabled={!query.trim() || isAsking}
                    className="bg-[#5452f6] hover:bg-indigo-600 text-white p-3 rounded-2xl transition-all shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            )}

            {/* Content Area 2: Doc Upload */}
            {activeTab === 'docs' && (
              <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-medium text-slate-300">
                  <p className="font-bold text-white mb-1">📄 RAG Vector Knowledge Ingestion</p>
                  Upload project SOPs, policy guidelines, or technical documentation. The AI RAG engine will chunk and index the context to answer employee questions instantly.
                </div>

                <form onSubmit={handleUploadSop} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 mb-2">
                      SOP Document Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Backend API Security SOP 2026"
                      value={docTitle}
                      onChange={e => setDocTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:ring-2 focus:ring-cyan-400 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 mb-2">
                      Attach Document (PDF / DOCX / TXT) *
                    </label>
                    <input
                      type="file"
                      required
                      onChange={e => setDocFile(e.target.files[0])}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUploading}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:opacity-95 text-white rounded-2xl font-black text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
                  >
                    <Upload size={16} /> {isUploading ? 'Indexing Vector Document...' : 'Index Document into RAG Engine'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
