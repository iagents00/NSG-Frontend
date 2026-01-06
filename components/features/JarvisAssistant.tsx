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
Responde ÚNICAMENTE con texto directo y elegante. Debes guiar al usuario a la acción, sin textos confusos. Usa puntuación perfecta (puntos y comas).
ESTÁ PROHIBIDO usar emojis, líneas de separación, markdown complejo o mencionar componentes de UI.
Sé extremadamente conciso. Tono 'Apple Pro': minimalista pero poderoso.`;

export default function JarvisAssistant() {
  // --- LOGIC STATES ---
  const [input, setInput] = useState('');
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING'>('IDLE');

  const [showNotification, setShowNotification] = useState(false);
  const [username, setUsername] = useState<string>("Ejecutivo");
  const { showToast } = useToast();

  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

  // --- VISUAL STATES ---
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
          }
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
      fallbackSpeak(plainText);
    }
  };

  // Ensure voices are loaded
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const fallbackSpeak = (text: string) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES'; // Strictly force Spanish locale
      
      const voices = window.speechSynthesis.getVoices();
      
      // Robust Spanish Voice Selection
      const preferredVoice = voices.find(v => v.lang === "es-ES" && v.name.includes("Google")) // 1. Google Direct
                          || voices.find(v => v.lang === "es-ES") // 2. Any Spain Spanish
                          || voices.find(v => v.lang.startsWith("es")); // 3. Any Spanish (LATAM etc)

      if (preferredVoice) {
          utterance.voice = preferredVoice;
      }
      
      // Lower pitch/rate for more "serious" tone if possible
      utterance.pitch = 0.9;
      utterance.rate = 1.0;

      utterance.onend = () => setStatus('IDLE');
      window.speechSynthesis.speak(utterance);
  };

  const handleAction = async (userQuery: string) => {
    if (!userQuery.trim()) return;

    if (navigator.vibrate) navigator.vibrate(10);

    setLastResponse("");
    setShowNotification(true);
    setIsProcessing(true);
    setStatus('THINKING');
    setInput('');

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userQuery }] }],
          systemInstruction: { parts: [{ text: `${BASE_SYSTEM_PROMPT} Te diriges al ejecutivo "${username}". IMPERATIVO: MENCIONA SIEMPRE el nombre "${username}" en tu respuesta de forma natural. RESPONDE SIEMPRE EN CASTELLANO (ESPAÑOL DE ESPAÑA). Tu voz es 'Puck'.` }] },
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
        speak(aiText);

        let displayed = "";
        const chunkSize = 5; 
        const delay = 10; 

        for (let i = 0; i < aiText.length; i += chunkSize) {
          const chunk = aiText.slice(i, i + chunkSize);
          displayed += chunk;
          setLastResponse(displayed);
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

  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const toggleListening = () => {
    if (status === 'LISTENING') {
      const recognition = recognitionRef.current;
      if (recognition) recognition.stop();
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'es-ES';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setStatus('LISTENING');
        setIsListening(true);
        setInput('');
      };

      recognition.onresult = (e: any) => {
        const transcript = Array.from(e.results)
          .map((result: any) => (result as any)[0])
          .map((result: any) => result.transcript)
          .join(' ');

        setInput(transcript);

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          recognition.stop();
        }, 1500);
      };

      recognition.onerror = (e: any) => {
        if (e.error === 'no-speech') return;
        if (e.error !== 'aborted') {
          setStatus('IDLE');
          setIsListening(false);
        }
      };

      recognition.onend = () => {
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
         "relative w-full h-[400px] group/desktop select-none antialiased text-slate-800 cursor-pointer transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1)",
         // Removed visual styles from here to allow children to overflow
      )}
      onClick={() => { if (!isActive) toggleListening(); }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ willChange: "transform" }}
    >
      
      {/* 1. VISUAL CONTAINER (Clipped Backgrounds & Borders) */}
      <div className={clsx(
         "absolute inset-0 rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-xl transition-all duration-500",
         isActive ? "shadow-[0_0_80px_rgba(59,130,246,0.15)] ring-2 ring-blue-500/20" : "group-hover/desktop:shadow-2xl group-hover/desktop:border-blue-200"
      )}>
          {/* Subtle Grid Pattern - Apple Style */}
          <div className="absolute inset-0 opacity-[0.03] transition-opacity duration-500 group-hover/desktop:opacity-[0.06]" 
               style={{ backgroundImage: 'radial-gradient(#0f172a 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

          {/* Vignette for depth (Light Mode) */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.8)_100%)]" />

          {/* THE PRO BORDER GLOW (Optimized for Light) */}
          <div className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
             <div className="absolute inset-0 rounded-3xl border border-blue-500/10 shadow-[0_0_60px_-10px_rgba(59,130,246,0.1)]" />
          </div>
      </div>

      {/* ==============================================
          PRO BRAND ATOM (Centered Top)
         ============================================== */}
      <div className={`relative flex flex-col items-center justify-center h-full z-20 transition-all duration-700 cubic-bezier(0.32, 0.72, 0, 1) 
                      ${isActive ? 'scale-[1.05]' : 'scale-100'}
                      ${showNotification ? 'opacity-20 blur-md scale-90 grayscale-[0.5]' : 'opacity-100'}`}
           onClick={(e) => { e.stopPropagation(); toggleListening(); }}
           style={{ willChange: "transform, opacity, filter" }}
      >
        {/* Apple Intelligence Multi-Ripple */}
        {isActive && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full border border-cyan-400/30 opacity-0 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-purple-400/30 opacity-0 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDelay: '0.6s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-pink-400/30 opacity-0 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDelay: '1.2s' }} />
            </div>
        )}

        {/* Siri Aura Glow */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] transition-all duration-700 
            ${isActive ? 'opacity-20 bg-linear-to-r from-cyan-500 via-blue-500 to-purple-600' : isHovered ? 'opacity-5 bg-blue-400' : 'opacity-0'}`} />

        <div className="w-56 h-56 flex items-center justify-center animate-atom-breathe relative">
          <svg viewBox="0 0 100 100" className={`w-full h-full overflow-visible transition-all duration-500 ${isActive ? 'drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]' : 'drop-shadow-none'}`}>
            <defs>
              <linearGradient id="proBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="siriMesh" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" /> 
                  <stop offset="50%" stopColor="#818cf8" /> 
                  <stop offset="100%" stopColor="#e879f9" /> 
              </linearGradient>
              <radialGradient id="activeGlass" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="white" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="white" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="glassSphere" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="white" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#1e293b" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#0B1121" stopOpacity="0.9" />
              </radialGradient>
            </defs>

            {/* Orbits */}
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

            {/* Electron */}
            {isActive && (
                <g style={{ transformOrigin: '50px 50px' }} className="animate-[spin_2s_linear_infinite]">
                   <circle cx="50" cy="8" r="3.5" fill="#22d3ee" className="drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                </g>
            )}

            {/* Core */}
            {isActive ? (
                <>
                    <circle cx="50" cy="50" r="14" fill="url(#siriMesh)" className="filter blur-sm opacity-80 animate-pulse-fast" />
                    <circle cx="50" cy="50" r="12" fill="url(#siriMesh)" />
                    <circle cx="50" cy="50" r="12" fill="url(#activeGlass)" className="mix-blend-overlay" />
                    <circle cx="50" cy="50" r="12" fill="none" stroke="white" strokeOpacity="0.8" strokeWidth="0.5" />
                </>
            ) : (
                <circle cx="50" cy="50" r="10" 
                        fill="url(#glassSphere)"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="0.5"
                        className={`transition-all duration-700 ease-out origin-center ${isHovered ? 'scale-110' : 'scale-100'}`}
                        style={{ transformBox: 'fill-box' }} />
            )}
          </svg>
        </div>

        {/* Labels */}
        <div className={`mt-12 transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) 
            ${isActive ? 'opacity-0 translate-y-8 scale-90' : 'opacity-100 group-hover/desktop:-translate-y-4'}`}>
            <div className="px-6 py-2 rounded-full bg-[#0B1121]/80 backdrop-blur-md border border-[#1e293b]/50 shadow-xl flex items-center gap-2 group-hover/desktop:border-[#3B82F6]/40 group-hover/desktop:shadow-[#3B82F6]/20 transition-all duration-500">
                <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${isHovered ? 'bg-[#60A5FA] animate-pulse' : 'bg-[#94A3B8]'}`} />
                <span className={`text-[10px] font-bold tracking-[0.2em] uppercase transition-colors duration-500 ${isHovered ? 'text-white' : 'text-[#94A3B8]'}`}>
                    {status === 'IDLE' ? 'Neural Engine' : 
                     status === 'LISTENING' ? 'Escuchando' :
                     status === 'THINKING' ? 'Procesando' :
                     status === 'SPEAKING' ? 'Respondiendo' : 'Activo'}
                </span>
            </div>
        </div>
      </div>

      {/* Response Card */}
      <AnimatePresence>
        {showNotification && (
          <motion.div 
             initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
             animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
             exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
             transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
             className="absolute top-6 bottom-28 left-1/2 -translate-x-1/2 w-full max-w-[440px] z-40 flex flex-col pointer-events-none"
          >
              <div 
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[#030712]/85 backdrop-blur-[50px] backdrop-saturate-200 border border-white/10 w-full h-full rounded-[24px] shadow-[0_20px_80px_-10px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden relative pointer-events-auto ring-1 ring-white/5"
              >
                  <div className="absolute inset-x-0 top-0 h-[200px] bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.1),transparent_70%)] pointer-events-none" />
                  <div className="h-[2px] w-full bg-linear-to-r from-transparent via-cyan-400 via-purple-500 to-transparent opacity-70" />

                  <div className="flex justify-between items-center px-8 py-4 border-b border-white/5 bg-white/[0.01] relative z-20 shrink-0">
                      <div className="flex items-center gap-3">
                         <div className="relative w-6 h-6 flex items-center justify-center">
                             <div className="absolute inset-0 bg-blue-500 rounded-full blur-[10px] opacity-20 animate-pulse" />
                             <Bot size={14} className="text-cyan-300 relative z-10" />
                         </div>
                         <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest pl-1">NSG Intelligence</span>
                      </div>
                      <button onClick={() => setShowNotification(false)} className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-500 hover:text-white">
                          <X size={16} />
                      </button>
                  </div>
                  
                  {/* Content - Scrollable Area */}
                  {/* Content - Scrollable Area */}
                  <div className="flex-1 overflow-y-auto custom-scroll p-6 relative z-30 scroll-smooth overscroll-contain">
                      <div className="prose prose-invert prose-sm active:prose-base transition-all max-w-none leading-relaxed font-normal tracking-wide text-slate-200 break-words marker:text-cyan-400/70">
                           <ReactMarkdown remarkPlugins={[remarkGfm]}>
                               {lastResponse || ''}
                           </ReactMarkdown>
                           {isProcessing && <span className="inline-block w-2.5 h-5 ml-1.5 bg-gradient-to-t from-cyan-400 via-blue-500 to-purple-500 animate-pulse align-sub rounded-full shadow-[0_0_15px_rgba(34,211,238,0.5)]" />}
                      </div>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-[#030712] to-transparent pointer-events-none z-20 opacity-90" />
              </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Bar */}
      <div className="absolute bottom-6 w-full px-8 flex justify-center z-50 pointer-events-none">
          <div 
             className={`pointer-events-auto transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${isActive || input.length > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
             onClick={(e) => e.stopPropagation()}
          >
              <div className="flex items-center gap-4 px-6 py-3 bg-[#0B1121]/90 backdrop-blur-xl rounded-full shadow-[0_4px_24px_-1px_rgba(0,0,0,0.3)] border border-white/10 min-w-[420px] max-w-2xl hover:border-white/20 transition-all group-input relative z-[60]">
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

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes atom-breathe {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
        }
        @keyframes pulse-fast {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.05); opacity: 0.6; }
        }
        @keyframes wave {
            0%, 100% { height: 40%; opacity: 0.5; }
            50% { height: 100%; opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-atom-breathe { animation: atom-breathe 4s ease-in-out infinite; }
        .animate-pulse-fast { animation: pulse-fast 2s ease-in-out infinite; }
        .animate-wave { animation: wave 1s ease-in-out infinite; }
      `}} />
    </div>
  );
};
