import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Sparkles, X, Volume2, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function VoiceTaskModal({ isOpen, onClose, onTaskParsed }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(prev => prev + ' ' + currentTranscript);
      };

      rec.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) {
      toast.error("Web Speech Dictation is not supported in this browser environment. You can type your speech transcript manually below!");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognition.start();
      setIsListening(true);
      toast.success("Listening... Speak your task requirements now!");
    }
  };

  const handleParseTranscript = async () => {
    if (!transcript.trim()) {
      toast.error("Please dictate or type a task transcript first!");
      return;
    }

    setIsParsing(true);
    try {
      const res = await api.post('tasks/parse-voice/', { speech_text: transcript });
      toast.success("AI Voice-to-Task parsing complete!");
      onTaskParsed(res.data);
      onClose();
    } catch (err) {
      toast.error("Failed to parse voice transcript with AI.");
    } finally {
      setIsParsing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-100 relative">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-r from-rose-500 to-indigo-600 rounded-xl text-white shadow-md">
              <Mic size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Voice-to-Task AI Dictation</h3>
              <p className="text-xs text-slate-500">Dictate mission instructions using speech AI</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Animated Microphone Pulse Center */}
          <div className="flex flex-col items-center justify-center py-6 bg-slate-50 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={toggleListening}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all shadow-xl active:scale-95 ${
                isListening ? 'bg-rose-500 animate-pulse ring-8 ring-rose-200' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isListening ? <MicOff size={32} /> : <Mic size={32} />}
            </button>
            <p className="mt-3 text-xs font-bold text-slate-600">
              {isListening ? "🔴 Listening... Click to stop" : "Tap mic to start speech dictation"}
            </p>
          </div>

          {/* Transcript Box */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Spoken Transcript & Prompt</label>
            <textarea
              rows="4"
              className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
              placeholder="e.g. Assign a task to Arun to build the user authentication REST API endpoints by next Friday..."
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isParsing || !transcript.trim()}
              onClick={handleParseTranscript}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-95 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles size={16} />
              {isParsing ? "AI Extracting Parameters..." : "Parse & Auto-Fill Task"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
