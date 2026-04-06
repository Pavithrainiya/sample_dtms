import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, Bot, User, MessageSquare } from 'lucide-react';
import api from '../api/axios';

const MissionAnalyst = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState([
        { role: 'bot', content: 'Greeting Talent. I am your Mission Intelligence Analyst. How can I assist with your current objectives?' }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        const userMsg = { role: 'user', content: query };
        setMessages(prev => [...prev, userMsg]);
        setQuery('');
        setIsTyping(true);

        try {
            const res = await api.post('/tasks/mission-intelligence/analyst/', { message: query });
            setMessages(prev => [...prev, { role: 'bot', content: res.data.reply }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'bot', content: '❌ Communication error. Mission Intelligence link unstable.' }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Header */}
                    <div className="bg-slate-900 p-4 flex items-center justify-between text-white">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-indigo-500 rounded-lg"><Sparkles size={16}/></div>
                            <span className="font-bold text-sm tracking-tight text-white mb-0">Mission Intelligence</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-slate-800 p-1 rounded-md transition-colors text-white">
                            <X size={18}/>
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div ref={scrollRef} className="h-96 overflow-y-auto p-4 space-y-4 bg-slate-50">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-2 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`p-2 rounded-lg shrink-0 ${m.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-white shadow-sm text-slate-400'}`}>
                                        {m.role === 'user' ? <User size={14}/> : <Bot size={14}/>}
                                    </div>
                                    <div className={`p-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white shadow-sm text-slate-700 rounded-tl-none border border-slate-100'}`}>
                                        {m.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white shadow-sm border border-slate-100 p-3 rounded-2xl rounded-tl-none flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-4 border-t border-slate-100 bg-white flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Ask about your missions..." 
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button type="submit" disabled={!query.trim() || isTyping} className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50">
                            <Send size={18}/>
                        </button>
                    </form>
                </div>
            )}

            {/* Bubble Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className={`flex items-center gap-2 p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 ${isOpen ? 'bg-slate-900 rotate-90' : 'bg-indigo-600'}`}
            >
                {isOpen ? <X className="text-white" size={24}/> : (
                    <>
                        <Sparkles className="text-white" size={24}/>
                        {!isOpen && <span className="text-white font-bold text-sm pr-2">Mission Intelligence</span>}
                    </>
                )}
            </button>
        </div>
    );
};

export default MissionAnalyst;
