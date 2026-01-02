"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Loader2,
  X,
  Mic,
  Send,
  Bot
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

  // --- HELPERS ---
  // --- HELPERS ---
  const cleanTextForSpeech = (text: string) => {
    return text
      .replace(/\*/g, '')        // Remove all asterisks
      .replace(/#/g, '')         // Remove hashtags
      .replace(/[`~>]/g, '')     // Remove code/quote markers
      .replace(/_/g, '')         // Remove underscores
      .replace(/-/g, '')         // Remove separate hyphens completely
      .replace(/\.{2,}/g, '.')   // Normalize multiple dots to single period
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links [text](url) -> text
      .replace(/^\s*[-+]\s+/gm, '') // List bullets
      .replace(/\n+/g, '. ')     // All newlines to pauses
      .replace(/\s+/g, ' ')      // Collapse multiple spaces
      .trim();
  };

  const speak = async (text: string) => {
    if (isMuted) return;
    setStatus('SPEAKING');
    
    // Clean immediately
    const plainText = cleanTextForSpeech(text);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: plainText }] }],
          systemInstruction: { parts: [{ text: `${BASE_SYSTEM_PROMPT} Te diriges al ejecutivo "${username}". RESPONDE SIEMPRE EN CASTELLANO (ESPAÑOL DE ESPAÑA). Sé extremadamente conciso. Habla fluido, sin mencionar signos de puntuación.` }] },
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } } }
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
          ]
        })
      });

      if (!response.ok) throw new Error("Audio Generation Failed");

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
      // Ensure fallback also receives CLEAN text
      fallbackSpeak(plainText);
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
    
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(10);
    
    setLastResponse(""); 
    setShowNotification(true); 
    setIsProcessing(true);
    setStatus('THINKING');
    setInput(''); 

    try {
      // Use Standard Endpoint for Reliability
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userQuery }] }],
          systemInstruction: { parts: [{ text: `${BASE_SYSTEM_PROMPT} Te diriges al ejecutivo "${username}". RESPONDE SIEMPRE EN CASTELLANO (ESPAÑOL DE ESPAÑA). Tu voz es 'Puck'.` }] },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
          ]
        })
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      setIsProcessing(false);

      if (aiText) {
          // Speak immediately
          speak(aiText);
          
          // Simulate Streaming for Visuals (Typewriter Effect)
          let displayed = "";
          const chunkSize = 5; // chars per tick
          const delay = 10; // ms per tick
          
          for (let i = 0; i < aiText.length; i += chunkSize) {
              const chunk = aiText.slice(i, i + chunkSize);
              displayed += chunk;
              setLastResponse(displayed);
              // Small delay to simulate typing
              await new Promise(r => setTimeout(r, delay));
          }
      } else {
          throw new Error("Empty Response");
      }

    } catch (e: any) {
      console.error(e);
      let errorMessage = "Protocol Failure. Connection terminated.";
      
      if (e.message.includes("429")) {
          errorMessage = "System Overload. Neural capacity exceeded. Please retry in a moment.";
      } else if (e.message.includes("503") || e.message.includes("500")) {
          errorMessage = "Server unreachable. Retrying downlink...";
      }

      setLastResponse(errorMessage);
      setIsProcessing(false);
      setStatus('IDLE');
    }
  };

  // --- VOICE CAPTURE LOGIC ---
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const toggleListening = () => {
    if (status === 'LISTENING') {
        // Manual stop
        const recognition = recognitionRef.current;
        if (recognition) recognition.stop();
        return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition; 
      recognition.lang = 'es-ES';
      recognition.continuous = true; // Changed to TRUE to capture full phrases
      recognition.interimResults = true;

      recognition.onstart = () => { 
          setStatus('LISTENING'); 
          setIsListening(true); 
          setInput(''); // Clear previous
      };
      
      recognition.onresult = (e: any) => { 
        const transcript = Array.from(e.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join(' ');
        
        // Show real-time feedback
        setInput(transcript);

        // --- SILENCE DETECTION LOGIC ---
        // Clear existing timer on every new word
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

        // Set a new timer: if user is silent for 1.5 seconds, assume they are done
        silenceTimerRef.current = setTimeout(() => {
            recognition.stop(); // This will trigger onend
        }, 1500); 
      };

      recognition.onerror = (e: any) => {
          if (e.error === 'no-speech') {
              // Ignore simple silence
              return;
          }
          
          console.error("Speech Error:", e.error);
          
          if (e.error === 'network') {
               showToast("Error de conexión. Verifique su internet.", "error");
          } else if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
               showToast("Acceso al micrófono denegado.", "error");
          } else if (e.error === 'aborted') {
               // Ignore user aborts
               return;
          } else {
               // Generic error
               showToast(`Error de voz: ${e.error}`, "error");
          }

          // Reset state for critical errors
          if (e.error !== 'no-speech' && e.error !== 'aborted') {
            setStatus('IDLE');
            setIsListening(false);
          }
      };

      recognition.onend = () => { 
        // When recognition stops (either manual or silence timer), send the input if valid.
        // We need to check the current 'input' state, but state might be stale in callback closure.
        // Using ref or getting the latest value is safer, but 'input' state update might be enough if we rely on inputRef or similar.
        // However, we passed 'transcript' to setInput. 
        // Let's rely on checking the input directly from the ref manually or just using the stored transcript in a Ref if needed.
        // Simplified: trigger action if we have input.
        
        // Note: We need to access the LATEST 'input'. Since closures trap 'input', we should use the inputRef we already have attached to the DOM element!
        // But inputRef.current.value is reliable.
        const msg = inputRef.current?.value || "";
        
        if (msg.trim().length > 1) {
             handleAction(msg);
             setIsListening(false);
        } else {
             setStatus('IDLE');
             setIsListening(false);
        }
      };
      
      recognition.start();

    } else {
        showToast("Speech Module Unavailable", "error");
    }
  };

  return (
    <div 
      className={clsx(
         "relative w-full h-[400px] bg-white rounded-3xl overflow-hidden group/desktop shadow-xl border border-slate-200 select-none antialiased text-slate-800 cursor-pointer transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1)",
         isActive ? "shadow-[0_0_80px_rgba(59,130,246,0.15)] ring-2 ring-blue-500/20" : "hover:shadow-2xl hover:border-blue-200"
      )}
      onClick={() => { if(!isActive) toggleListening(); }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ willChange: "transform, box-shadow" }}
    >
      
      {/* Subtle Grid Pattern - Apple Style */}
      <div className="absolute inset-0 opacity-[0.03] transition-opacity duration-500 group-hover/desktop:opacity-[0.06]" 
           style={{ backgroundImage: 'radial-gradient(#0f172a 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      {/* Vignette for depth (Light Mode) */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.8)_100%)]" />

      {/* ==============================================
          THE PRO BORDER GLOW (Optimized for Light)
         ============================================== */}
      <div className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
         <div className="absolute inset-0 rounded-3xl border border-blue-500/10 shadow-[0_0_60px_-10px_rgba(59,130,246,0.1)]" />
      </div>

      {/* ==============================================
          PRO BRAND ATOM (Centered Top)
         ============================================== */}
      <div className={`relative flex flex-col items-center justify-center h-full z-20 transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) 
                      ${isActive ? 'scale-[1.05]' : 'scale-100'}`}
           onClick={(e) => { e.stopPropagation(); toggleListening(); }}
           style={{ willChange: "transform" }}
      >
        
        {/* INNER WAVES (Siri/Apple Intelligence Multi-Ripple) */}
        {isActive && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
                {/* Cyan Layer */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full border border-cyan-400/30 opacity-0 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
                {/* Purple Layer */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-purple-400/30 opacity-0 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDelay: '0.6s' }} />
                {/* Pink Layer */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-pink-400/30 opacity-0 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDelay: '1.2s' }} />
            </div>
        )}

        {/* Core Glow - Siri Aura */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] transition-all duration-700 
            ${isActive ? 'opacity-30 bg-linear-to-r from-cyan-500 via-blue-500 to-purple-600' : isHovered ? 'opacity-5 bg-blue-400' : 'opacity-0'}`} />

        <div className="w-56 h-56 flex items-center justify-center animate-atom-breathe relative">
            <svg viewBox="0 0 100 100" className={`w-full h-full overflow-visible transition-all duration-500 ${isActive ? 'drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]' : 'drop-shadow-none'}`}>
                <defs>
                    <linearGradient id="proBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#2563EB" />
                        <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                    
                    {/* Siri/Apple Intelligence Mesh */}
                    <linearGradient id="siriMesh" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22d3ee" /> {/* Cyan */}
                        <stop offset="50%" stopColor="#818cf8" /> {/* Indigo */}
                        <stop offset="100%" stopColor="#e879f9" /> {/* Pink */}
                    </linearGradient>
                    
                    {/* Active Glass Highlight Overlay */}
                    <radialGradient id="activeGlass" cx="30%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="white" stopOpacity="0.9" />
                        <stop offset="50%" stopColor="white" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* Orbit Group */}
                <g className={`origin-center ${isActive ? 'animate-[spin_4s_linear_infinite]' : 'animate-[spin_12s_linear_infinite]'}`} style={{ transformBox: 'fill-box' }}>
                    {[0, 60, 120].map((angle, i) => (
                         <circle 
                            key={i}
                            cx="50" cy="50" r="42" 
                            fill="none" 
                            strokeWidth={isActive ? 1.5 : 0.8}
                            stroke={isActive ? "url(#siriMesh)" : "url(#proBlueGrad)"}
                            className="transition-all duration-500 origin-center ease-out"
                            style={{ 
                                transform: isActive ? `rotate(${angle}deg) scale(1)` : `rotate(${angle}deg) scaleY(0.45)`,
                                opacity: isActive ? 1 : 0.5
                            }} 
                        />
                    ))}
                </g>
                
                {/* FIXED ELECTRON ORBIT - CLOCKWISE */}
                {isActive && (
                    <g style={{ transformOrigin: '50px 50px' }} className="animate-[spin_2s_linear_infinite]">
                       <circle cx="50" cy="8" r="3.5" fill="#22d3ee" className="drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                    </g>
                )}

                {/* CORE */}
                {isActive ? (
                    <>
                        {/* Siri Active Core - Preserving Atom Shape but with Siri Colors */}
                        
                        {/* 1. Underlying Glow */}
                        <circle cx="50" cy="50" r="14" fill="url(#siriMesh)" className="filter blur-sm opacity-80 animate-pulse-fast" />
                        
                        {/* 2. Main Sphere Body */}
                        <circle cx="50" cy="50" r="12" fill="url(#siriMesh)" />
                        
                        {/* 3. Glass Reflection Overlay (Preserves the look) */}
                        <circle cx="50" cy="50" r="12" fill="url(#activeGlass)" className="mix-blend-overlay" />
                        
                        {/* 4. White Specular Highlight */}
                        <circle cx="50" cy="50" r="12" fill="none" stroke="white" strokeOpacity="0.8" strokeWidth="0.5" />
                    </>
                ) : (
                    <>
                        {/* Clean Pro Idle Core - Apple Glass Material */}
                        <defs>
                            <radialGradient id="glassSphere" cx="30%" cy="30%" r="70%">
                                <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                                <stop offset="50%" stopColor="#94a3b8" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#475569" stopOpacity="0.6" />
                            </radialGradient>
                            <filter id="glassShadow" x="-50%" y="-50%" width="200%" height="200%">
                                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.15"/>
                            </filter>
                        </defs>
                        
                        <circle cx="50" cy="50" r="10" 
                                fill="url(#glassSphere)"
                                stroke="rgba(255,255,255,0.5)"
                                strokeWidth="0.5"
                                filter="url(#glassShadow)"
                                className={`transition-all duration-700 ease-out origin-center ${isHovered ? 'scale-110' : 'scale-100'}`}
                                style={{ transformBox: 'fill-box' }} />
                    </>
                )}
            </svg>
        </div>
        
        {/* LABEL */}
        <div className={`mt-12 transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) 
            ${isActive ? 'opacity-0 translate-y-8 scale-90' : 'opacity-100 group-hover/desktop:-translate-y-4'}`}>
            <div className="px-6 py-2 rounded-full bg-[#0B1121]/80 backdrop-blur-md border border-[#1e293b]/50 shadow-xl flex items-center gap-2 group-hover/desktop:border-[#3B82F6]/40 group-hover/desktop:shadow-[#3B82F6]/20 transition-all duration-500">
                <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${isHovered ? 'bg-[#60A5FA] animate-pulse' : 'bg-[#94A3B8]'}`} />
                <span className={`text-[10px] font-bold tracking-[0.2em] uppercase transition-colors duration-500 ${isHovered ? 'text-white' : 'text-[#94A3B8]'}`}>
                    {isActive ? status : 'Neural Engine'}
                </span>
            </div>
        </div>

      </div>

      {/* === RESPONSE CARD (Dark Mode) - REPOSITIONED ABOVE INPUT === */}
      <AnimatePresence>
      {showNotification && (
          <motion.div 
             initial={{ opacity: 0, y: 30, scale: 0.9, filter: "blur(12px)" }}
             animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
             exit={{ opacity: 0, y: 10, scale: 0.95, filter: "blur(5px)" }}
             transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
             className="absolute inset-x-0 bottom-36 z-40 flex justify-center px-6 pointer-events-none"
          >
              <div 
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[#030712]/80 backdrop-blur-[60px] backdrop-saturate-150 border border-white/10 border-t-white/20 w-full max-w-3xl max-h-[400px] min-h-[150px] rounded-[32px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden relative pointer-events-auto ring-1 ring-white/5"
              >
                  {/* Internal Spotlight Glow */}
                  <div className="absolute inset-x-0 top-0 h-[200px] bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_70%)] pointer-events-none" />
                  
                  {/* Apple Intelligence Gradient Line */}
                  <div className="h-[2px] w-full bg-linear-to-r from-transparent via-cyan-400 via-purple-500 to-transparent opacity-70" />

                  {/* Header */}
                  <div className="flex justify-between items-center px-8 py-4 border-b border-white/5 bg-white/[0.01] relative z-20 shrink-0">
                      <div className="flex items-center gap-3">
                         {/* Animated Icon Glow */}
                         <div className="relative w-6 h-6 flex items-center justify-center">
                             <div className="absolute inset-0 bg-blue-500 rounded-full blur-[10px] opacity-20 animate-pulse" />
                             <Bot size={14} className="text-cyan-300 relative z-10" />
                         </div>
                         <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest pl-1 font-sans">NSG Intelligence</span>
                      </div>
                      <button onClick={() => setShowNotification(false)} className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-500 hover:text-white group">
                          <X size={16} className="group-hover:rotate-90 transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1)" />
                      </button>
                  </div>
                  
                  {/* Content - Scrollable Area */}
                  <div className="flex-1 overflow-y-auto custom-scroll p-8 relative z-30 scroll-smooth overscroll-contain">
                      <div className="prose prose-invert prose-base max-w-none leading-loose font-normal tracking-[0.01em] text-[rgba(255,255,255,0.92)] break-words marker:text-cyan-400/70">
                           <ReactMarkdown remarkPlugins={[remarkGfm]}>
                               {lastResponse || ''}
                           </ReactMarkdown>
                           {/* Apple Intelligence Cursor (Multi-color) */}
                           {isProcessing && <span className="inline-block w-2.5 h-5 ml-1.5 bg-gradient-to-t from-cyan-400 via-blue-500 to-purple-500 animate-pulse align-sub rounded-full shadow-[0_0_15px_rgba(34,211,238,0.5)]" />}
                      </div>
                  </div>
                  
                  {/* Bottom Fade Mask */}
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-[#030712] to-transparent pointer-events-none z-20 opacity-90" />
              </div>
          </motion.div>
      )}
      </AnimatePresence>

      <div className="absolute bottom-6 w-full px-8 flex justify-center z-50 pointer-events-none">
          <div 
             className={`pointer-events-auto transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${isActive || input.length > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
             onClick={(e) => e.stopPropagation()}
          >
              <div className="flex items-center gap-4 px-6 py-3 bg-[#0B1121]/80 backdrop-blur-xl rounded-full shadow-[0_4px_24px_-1px_rgba(0,0,0,0.3)] border border-white/10 min-w-[420px] max-w-2xl hover:border-white/20 transition-all group-input">
                  <div className="relative flex-shrink-0">
                      <div className={clsx("w-2 h-2 rounded-full transition-all duration-300", 
                          status === 'LISTENING' ? "bg-red-500 animate-pulse scale-125" : 
                          status === 'THINKING' ? "bg-amber-400 animate-bounce" :
                          "bg-blue-500"
                      )} />
                  </div>
                  
                  <input 
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAction(input)}
                      placeholder={status === 'LISTENING' ? "Escuchando..." : "Pregunta a NSG Intelligence..."}
                      className="bg-transparent border-none text-[14px] font-medium text-slate-200 placeholder:text-slate-500 focus:outline-none w-full tracking-wide selection:bg-blue-500/30"
                  />
                  
                  <button onClick={() => handleAction(input)} disabled={!input.trim()} className="text-blue-500/80 hover:text-blue-400 transition-colors disabled:opacity-0 p-1">
                      <Send size={15} />
                  </button>
                  
                  {/* Audio Wave Mini */}
                  {(status === 'LISTENING' || status === 'SPEAKING') && (
                      <div className="flex gap-0.5 h-3 items-center pl-2 border-l border-white/10 ml-1">
                          {[1,2,3].map((i) => (
                              <div key={i} className="w-0.5 bg-blue-500 rounded-full animate-wave" style={{ animationDelay: `${i * 0.1}s` }} />
                          ))}
                      </div>
                  )}
              </div>
          </div>
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
