"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Loader2,
  X,
  Mic,
  Send,
  Bot,
  Wifi, 
  Battery, 
  Volume2, 
  Search, 
  Cpu
} from 'lucide-react';
import clsx from 'clsx';
import { useToast } from "@/components/ui/ToastProvider";
import { authService } from "@/lib/auth";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';

// --- CONFIGURATION ---
const BASE_SYSTEM_PROMPT = `Eres NSG Intelligence. Tu personalidad es sofisticada, estratégica y ejecutiva. 
Tus respuestas deben ser brillantes, concisas y orientadas a la acción, usando formato markdown (negritas, listas, etc.) para mayor claridad.
Usas un tono 'Apple Pro': minimalista pero poderoso.`;

export default function JarvisAssistant() {
  // --- LOGIC STATES ---
  const [input, setInput] = useState('');
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING'>('IDLE');
  
  const [showNotification, setShowNotification] = useState(false);
  const [username, setUsername] = useState<string>("Executive");
  const { showToast } = useToast();
  
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null); 
  const containerRef = useRef(null);
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""; 

  // --- VISUAL STATES (From new design) ---
  const isActive = status !== 'IDLE';
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authService.verifySession();
        if (data?.user?.username) {
          setUsername(data.user.username);
        }
      } catch (error) {
        console.error("Failed to fetch user info for Intelligence Core", error);
      }
    };
    fetchUser();
  }, []);

  // --- AUDIO UTILS ---
  const pcmToWav = (pcmData: Int16Array, sampleRate: number) => {
    const buffer = new ArrayBuffer(44 + pcmData.length * 2);
    const view = new DataView(buffer);
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
    };
    writeString(0, 'RIFF');
    view.setUint32(4, 32 + pcmData.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, pcmData.length * 2, true);
    for (let i = 0; i < pcmData.length; i++) view.setInt16(44 + i * 2, pcmData[i], true);
    return new Blob([buffer], { type: 'audio/wav' });
  };

  const speak = async (text: string) => {
    if (isMuted) return;
    setStatus('SPEAKING');
    try {
      const plainText = text.replace(/[*_#`]/g, '');
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: plainText }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } } }
          }
        })
      });
      const result = await response.json();
      const audioData = result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData) {
        const binaryString = atob(audioData);
        const pcmData = new Int16Array(binaryString.length / 2);
        for (let i = 0; i < pcmData.length; i++) {
          pcmData[i] = (binaryString.charCodeAt(i * 2 + 1) << 8) | binaryString.charCodeAt(i * 2);
        }
        const wavBlob = pcmToWav(pcmData, 24000); 
        const audio = new Audio(URL.createObjectURL(wavBlob));
        audio.onended = () => setStatus('IDLE');
        await audio.play();
      } else { 
        fallbackSpeak(plainText);
      }
    } catch (e) { 
      fallbackSpeak(text);
    }
  };

  const fallbackSpeak = (text: string) => {
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang === "es-ES" && v.name.includes("Google")) || voices[0];
      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.onend = () => setStatus('IDLE');
      window.speechSynthesis.speak(utterance);
  };

  const handleAction = async (userQuery: string) => {
    if (!userQuery.trim()) return;
    setLastResponse(null);
    setShowNotification(false);
    setIsProcessing(true);
    setStatus('THINKING');
    setInput(''); 

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userQuery }] }],
          systemInstruction: { parts: [{ text: `${BASE_SYSTEM_PROMPT} Te diriges al ejecutivo "${username}".` }] }
        })
      });
      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!aiText) throw new Error("Empty Response");
      
      setLastResponse(aiText);
      setShowNotification(true);
      setIsProcessing(false);
      speak(aiText);
    } catch (e) {
      console.error(e);
      setLastResponse("Protocol Failure. Connection terminated.");
      setShowNotification(true);
      setIsProcessing(false);
      setStatus('IDLE');
    }
  };

  const toggleListening = () => {
    if (status === 'LISTENING') return; // Avoid double triggering
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition; 
      recognition.lang = 'es-ES';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => { setStatus('LISTENING'); setIsListening(true); };
      recognition.onresult = (e: any) => { 
        const transcript = e.results[0][0].transcript;
        handleAction(transcript); 
        setIsListening(false); 
      };
      recognition.onerror = (e: any) => {
          console.error("Speech Error:", e.error);
          setStatus('IDLE');
          setIsListening(false);
      };
      recognition.onend = () => { 
        // Only reset if we didn't transition to thinking/speaking
        if (status === 'LISTENING') setStatus('IDLE'); 
        setIsListening(false); 
      };
      recognition.start();
    } else {
        showToast("Speech Module Unavailable", "error");
        // Fallback or just set listening to false
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 overflow-hidden select-none antialiased text-slate-200">
      
      {/* PC/Laptop Mockup Container */}
      <div 
        ref={containerRef}
        className="relative w-full max-w-[1000px] aspect-[16/10] bg-[#020617] rounded-[24px] 
                   shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.1)] 
                   border-[1px] border-[#0f172a] overflow-hidden group/laptop 
                   transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]
                   hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.1)]"
      >
        
        {/* Screen Bezel */}
        <div className="absolute top-0 left-0 w-full h-9 bg-[#0B1121]/80 backdrop-blur-xl border-b border-[#1e293b]/50 z-50 flex items-center justify-between px-6">
            <div className="flex gap-5 items-center">
                <span className="font-bold text-[#f1f5f9] text-sm hover:text-white cursor-default transition-colors"></span>
                {['File', 'Edit', 'View', 'Window', 'Help'].map((item) => (
                  <span key={item} className="text-xs font-medium text-[#94A3B8] hover:text-[#e2e8f0] cursor-default transition-colors duration-300">{item}</span>
                ))}
            </div>
            <div className="flex gap-4 items-center text-[#64748B]">
                <Search size={14} className="hover:text-[#94A3B8] transition-colors" />
                <Wifi size={14} />
                <Volume2 size={14} />
                <Battery size={16} />
                <span className="text-xs font-medium ml-1 text-[#94A3B8]">Tue 9:41 AM</span>
            </div>
        </div>

        {/* MAIN DESKTOP CONTENT AREA */}
        <div 
          className={`absolute inset-0 top-9 bg-[#020617] z-0 flex items-center justify-center cursor-pointer overflow-hidden group/desktop
                      transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]
                      ${isActive ? 'scale-[1.00]' : 'active:scale-[0.995]'}`}
          onClick={() => { if(!isActive) toggleListening(); }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.2] transition-all duration-1000 group-hover/desktop:opacity-[0.3]" 
               style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

          {/* Vignette */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.8)_100%)]" />

          {/* ==============================================
              THE PRO BORDER GLOW
             ============================================== */}
          <div className={`absolute inset-0 z-10 pointer-events-none transition-all duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)] ${isActive ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-[-20px] rounded-[30px] opacity-30 blur-[40px]">
                 <div className="w-full h-full bg-pro-blue-flow animate-flow-slow" />
            </div>
            <div className="absolute inset-[-10px] rounded-[30px] opacity-60 blur-[15px]">
                 <div className="w-full h-full bg-pro-blue-flow animate-flow-medium" />
            </div>
            <div className="absolute inset-[0px] rounded-[24px] p-[3px]" 
                 style={{ 
                    maskImage: 'linear-gradient(white, white), linear-gradient(white, white)', 
                    maskClip: 'content-box, border-box', 
                    maskComposite: 'exclude' 
                 }}>
                 <div className="absolute inset-[-50%] w-[200%] h-[200%] top-[-50%] left-[-50%] bg-pro-blue-flow animate-flow-fast" />
            </div>
            <div className="absolute inset-[1px] rounded-[23px] border border-white/10 z-20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" />
          </div>

          {/* ==============================================
              PRO BRAND ATOM
             ============================================== */}
          <div className={`relative -mt-24 z-20 transition-all duration-1000 cubic-bezier(0.25, 1, 0.5, 1) 
                          ${isActive ? 'scale-150' : isHovered ? 'scale-105' : 'scale-100'}`}
              onClick={(e) => { e.stopPropagation(); toggleListening(); }}
          >
            
            {/* INNER WAVES (Sonar Effect) */}
            {isActive && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-[#60A5FA]/30 bg-[#3B82F6]/10 animate-ripple-1 opacity-0" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-[#3B82F6]/20 bg-[#2563EB]/5 animate-ripple-2 opacity-0" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-[#60A5FA]/10 bg-transparent animate-ripple-3 opacity-0" />
                </div>
            )}

            {/* Core Glow */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[64px] transition-all duration-1000 
                ${isActive ? 'opacity-40 scale-125 bg-[#3B82F6]' : isHovered ? 'opacity-15 scale-100 bg-[#60A5FA]' : 'opacity-0 scale-50'}`} />

            <div className="w-64 h-64 flex items-center justify-center animate-atom-breathe">
                <svg viewBox="0 0 100 100" className={`w-full h-full overflow-visible transition-all duration-700 
                                                      ${isActive ? 'drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]' : 'drop-shadow-lg'}`}>
                    <defs>
                        <linearGradient id="proBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#60A5FA" />
                            <stop offset="50%" stopColor="#3B82F6" />
                            <stop offset="100%" stopColor="#2563EB" />
                        </linearGradient>

                        <linearGradient id="idleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#94A3B8" />
                            <stop offset="100%" stopColor="#475569" />
                        </linearGradient>

                        <linearGradient id="hoverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#60A5FA" />
                            <stop offset="100%" stopColor="#3B82F6" />
                        </linearGradient>
                    </defs>

                    {/* Orbit Group */}
                    <g className={`origin-center ${isActive ? 'animate-spin-slow' : 'animate-spin-ultra-slow'}`} style={{ transformBox: 'fill-box' }}>
                        {[0, 60, 120].map((angle, i) => (
                             <circle 
                                key={i}
                                cx="50" cy="50" r="42" 
                                fill="none" 
                                strokeWidth={isActive ? 1.5 : 1}
                                stroke={`url(#${isActive ? 'proBlueGrad' : isHovered ? 'hoverGrad' : 'idleGrad'})`}
                                className="transition-all duration-1000 origin-center ease-out"
                                style={{ 
                                    transform: isActive ? `rotate(${angle}deg) scale(1)` : `rotate(${angle}deg) scaleY(0.45)`,
                                    opacity: isActive ? 0.9 : 0.6
                                }} 
                            />
                        ))}
                    </g>
                    
                    {/* FIXED ELECTRON ORBIT - CLOCKWISE 
                        - Now uses 'animate-electron-orbit-clockwise'
                        - Enhanced shadow for 'Soft Apple Touch'
                    */}
                    {isActive && (
                        <g style={{ transformOrigin: '50px 50px' }} className="animate-electron-orbit-clockwise">
                           {/* Soft diffuse glow layer behind electron */}
                           <circle cx="50" cy="8" r="6" fill="#60A5FA" className="opacity-30 blur-[4px]" />
                           {/* Sharp core electron */}
                           <circle cx="50" cy="8" r="3.5" fill="#60A5FA" className="drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                        </g>
                    )}

                    {/* CORE */}
                    {isActive ? (
                        <>
                            {/* Blue Radiant Core */}
                            <circle cx="50" cy="50" r="14" fill="url(#proBlueGrad)" className="animate-pulse-fast filter blur-[4px] opacity-90" />
                            <circle cx="50" cy="50" r="8" fill="white" className="filter drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]" />
                        </>
                    ) : (
                        <>
                            {/* Clean Pro Idle Core */}
                            <circle cx="50" cy="50" r="10" fill={isHovered ? "#2563EB" : "#0B1121"} 
                                    className="transition-colors duration-700 shadow-inner stroke-[#1e293b] stroke-1" />
                            <circle cx="50" cy="50" r="4" fill={isHovered ? "white" : "#94A3B8"} 
                                    className="transition-colors duration-700" />
                        </>
                    )}
                </svg>
            </div>
            
            {/* LABEL */}
            <div className={`absolute -bottom-16 w-full flex justify-center transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) 
                ${isActive ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 group-hover/desktop:-translate-y-3'}`}>
                <div className="px-5 py-2 rounded-full bg-[#0B1121]/80 backdrop-blur-md border border-[#1e293b]/50 shadow-lg flex items-center gap-2 group-hover/desktop:border-[#3B82F6]/30 group-hover/desktop:shadow-[#3B82F6]/10 transition-all duration-500">
                    <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${isHovered ? 'bg-[#60A5FA] animate-pulse' : 'bg-[#94A3B8]'}`} />
                    <span className={`text-[10px] font-bold tracking-[0.2em] uppercase transition-colors duration-500 ${isHovered ? 'text-[#e2e8f0]' : 'text-[#94A3B8]'}`}>
                        {isActive ? status : 'Neural Engine'}
                    </span>
                </div>
            </div>

          </div>
        </div>

        {/* Floating Controls (INPUT BAR ADAPTATION) */}
        <div className="absolute bottom-12 w-full px-8 flex justify-center z-50 pointer-events-none">
            <div className={`pointer-events-auto transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) ${isActive ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-90'}`}>
                <div className="flex items-center gap-4 px-6 py-3 bg-[#0B1121]/90 backdrop-blur-2xl rounded-full shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.1)] border border-white/10 min-w-[300px]">
                    <div className="relative">
                        <div className={clsx("w-2.5 h-2.5 rounded-full animate-pulse", status === 'LISTENING' ? "bg-red-500" : "bg-gradient-to-tr from-[#60A5FA] to-[#2563EB]")} />
                    </div>
                    
                    <input 
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAction(input)}
                        placeholder={status === 'Listening' ? "Listening..." : "Ask NSG Intelligence..."}
                        className="bg-transparent border-none text-[15px] font-medium text-[#f8fafc] placeholder:text-slate-500 focus:outline-none w-full tracking-tight antialiased"
                    />
                    
                    <button onClick={() => handleAction(input)} disabled={!input.trim()} className="text-blue-400 hover:text-white transition-colors disabled:opacity-30">
                        <Send size={16} />
                    </button>
                    
                    {/* Audio Wave (Only when listening/speaking) */}
                    {(status === 'LISTENING' || status === 'SPEAKING' || status === 'THINKING') && (
                        <div className="flex gap-1 h-4 items-center pl-2 opacity-80 border-l border-white/10 ml-2">
                            {[1,2,3,4].map((i) => (
                                <div key={i} className="w-1 bg-[#3B82F6] rounded-full animate-wave" style={{ animationDelay: `${i * 0.15}s` }} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
        
        {/* === RESPONSE CARD (Dark Mode) === */}
        <AnimatePresence>
        {showNotification && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-x-0 bottom-32 z-40 flex justify-center px-8"
            >
                <motion.div 
                    initial={{ scale: 0.95, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.95, y: 10, opacity: 0 }}
                    className="bg-[#0f172a]/90 backdrop-blur-3xl backdrop-saturate-150 border border-white/10 w-full max-w-2xl max-h-[400px] rounded-[24px] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden relative"
                >
                    <div className="h-[2px] w-full bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-pink-500/50" />

                    <div className="flex justify-between items-center px-6 py-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                           <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                              <Bot size={14} className="text-blue-400" />
                           </div>
                           <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">NSG Insight</span>
                        </div>
                        <button onClick={() => setShowNotification(false)} className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                            <X size={16} />
                        </button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto custom-scroll text-slate-300 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        <div className="prose prose-invert prose-sm max-w-none">
                             <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                 {lastResponse || ''}
                             </ReactMarkdown>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )}
        </AnimatePresence>

      </div>

      {/* External Base Stand */}
      <div className="w-[200px] h-[60px] bg-gradient-to-b from-[#1e293b] to-[#020617] mt-[-2px] z-[-1] rounded-b-[24px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] relative border-t border-[#1e293b]">
         <div className="absolute top-0 w-full h-2 bg-black/30 blur-[4px]" />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spin-ultra-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* New Clockwise Linear Animation (0 -> 360) */
        @keyframes spin-linear-clockwise {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes atom-breathe {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        @keyframes pulse-fast {
            0%, 100% { transform: scale(1); opacity: 0.9; }
            50% { transform: scale(1.1); opacity: 0.7; }
        }
        @keyframes flow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        @keyframes wave {
            0%, 100% { height: 40%; opacity: 0.5; }
            50% { height: 100%; opacity: 1; }
        }
        @keyframes ripple {
           0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.6; }
           100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
        }
        
        .animate-spin-slow { animation: spin-slow 10s linear infinite; }
        .animate-spin-ultra-slow { animation: spin-ultra-slow 60s linear infinite; }
        
        /* Updated Class: Clockwise Orbit */
        .animate-electron-orbit-clockwise { animation: spin-linear-clockwise 8s linear infinite; }
        
        .animate-atom-breathe { animation: atom-breathe 4s ease-in-out infinite; }
        .animate-pulse-fast { animation: pulse-fast 2s ease-in-out infinite; }
        .animate-wave { animation: wave 1s ease-in-out infinite; }
        
        .animate-flow-slow { animation: flow 8s ease-in-out infinite; }
        .animate-flow-medium { animation: flow 5s ease-in-out infinite; }
        .animate-flow-fast { animation: flow 3s ease-in-out infinite; }

        .animate-ripple-1 { animation: ripple 3s linear infinite; }
        .animate-ripple-2 { animation: ripple 3s linear infinite 1s; }
        .animate-ripple-3 { animation: ripple 3s linear infinite 2s; }
        
        .bg-pro-blue-flow {
          background: linear-gradient(
            90deg,
            #60A5FA 0%,
            #3B82F6 25%,
            #2563EB 50%,
            #3B82F6 75%,
            #60A5FA 100%
          );
          background-size: 200% 100%;
        }
      `}} />
    </div>
  );
}
