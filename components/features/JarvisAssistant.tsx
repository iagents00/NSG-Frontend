"use client";

import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX,
  Cpu,
  Zap,
  Loader2,
  Bell,
  X
} from 'lucide-react';
import clsx from 'clsx';
import { useToast } from "@/components/ui/ToastProvider";
import { authService } from "@/lib/auth"; // Import authService
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown

// --- CONFIGURATION ---
const BASE_SYSTEM_PROMPT = `Eres NSG. Tu personalidad es culta, profesional y eficiente. 
Tus respuestas deben ser brillantes y breves.`;

export default function NsgAssistant() {
  const [input, setInput] = useState('');
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING'>('IDLE');

  const [showNotification, setShowNotification] = useState(false);
  const [username, setUsername] = useState<string>("Usuario"); // Default to Usuario
  const { showToast } = useToast();
  
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""; 

  // Fetch Username Effect
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authService.verifySession();
        if (data?.user?.username) {
          setUsername(data.user.username);
        }
      } catch (error) {
        console.error("Failed to fetch user info for Jarvis", error);
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

    /* 
     INFORMATION TO REINCORPORATE PREMIUM VOICE:
     1. Uncomment the block below (from 'try {' to the closing brace before fallback).
     2. Ensure your Google Cloud Project has 'Gemini API' enabled and sufficient quota.
     3. The model 'gemini-1.5-flash' with voice 'Aoede' (or 'Charon') provides the premium experience.
    */
    
    /* 
    // --- PREMIUM VOICE (GEMINI TTS) START ---
    try {
      if (!apiKey) {
        showToast("Falta la API Key de Gemini", "error");
        setStatus('IDLE');
        return;
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: text }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } } } // Aoede: Deep, confident (1.5 variant)
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
        return; // Exit if premium voice works
      } else { 
        // Silently switch to fallback without throwing logic error
        console.warn("Gemini TTS returned no audio, switching to fallback.");
        // Fallthrough to fallback
      }
    } catch (e) { 
      console.warn("TTS API connection failed:", e);
      // Fallthrough to fallback
    }
    // --- PREMIUM VOICE END ---
    */

    // Fallback: Browser Native TTS
    // Strip markdown characters for cleaner speech (removes **, *, #, `, etc.)
    const cleanText = text.replace(/[*#_`~]/g, ''); 
    fallbackSpeak(cleanText);
  };

  const fallbackSpeak = (text: string) => {
      // Toast removed as per user request (fallback is now default)
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      
      // Improved logic: Prefer "Google Español" (usually best free), then Microsoft (can be good), then any ES.
      const preferredVoice = voices.find(v => v.name.includes("Google Español")) ||
                             voices.find(v => v.lang === "es-ES" && v.name.includes("Google")) ||
                             voices.find(v => v.name.includes("Microsoft Alvaro")) || // Often better
                             voices.find(v => v.name.includes("Microsoft Elena")) ||
                             voices.find(v => v.lang.includes("es"));

      if (preferredVoice) utterance.voice = preferredVoice;
      
      utterance.rate = 1.05; // Slightly faster helps reduce robotic drag
      utterance.pitch = 1.0; 
      utterance.volume = 1.0;
      utterance.lang = "es-ES";
      utterance.onend = () => setStatus('IDLE');
      window.speechSynthesis.speak(utterance);
  };

  const handleAction = async (userQuery: string) => {
    if (!userQuery.trim()) return;
    setLastResponse(null);
    setShowNotification(false);
    setIsProcessing(true);
    setStatus('THINKING');

    try {
        if (!apiKey) {
            showToast("Clave API de Gemini no configurada", "error");
            setIsProcessing(false);
            setStatus('IDLE');
            return;
        }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userQuery }] }],
          systemInstruction: { parts: [{ text: `${BASE_SYSTEM_PROMPT} Te diriges al usuario como "${username}".` }] }
        })
      });
      const data = await response.json();
      
      if (data.error) {
        console.error("Gemini API Error:", data.error);
        const errorMessage = `Error del sistema: ${data.error.message || "Fallo desconocido"}`;
        setLastResponse(errorMessage);
        setShowNotification(true);
        setIsProcessing(false);
        speak("Se ha detectado un error en el sistema.");
        return;
      }

      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!aiText) {
          console.error("No content in response:", data);
          setLastResponse("Protocolo de error: Respuesta vacía del servidor.");
          setShowNotification(true);
          setIsProcessing(false);
          speak("No he recibido datos.");
          return;
      }
      
      setLastResponse(aiText);
      setShowNotification(true);
      setIsProcessing(false);
      speak(aiText);
    } catch (e) {
      console.error(e);
      setLastResponse("Error crítico de conexión.");
      setShowNotification(true);
      setIsProcessing(false);
      setStatus('IDLE');
    }
  };

  const toggleListening = () => {
    if (status === 'LISTENING') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
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
          if (e.error === 'no-speech' || e.error === 'aborted') {
            console.warn("Speech recognition stopped (silence or aborted).");
            setStatus('IDLE');
            setIsListening(false);
            return;
          }
          console.error("Speech Error:", e);
          setStatus('IDLE');
          setIsListening(false);
          showToast(`Error de voz: ${e.error || 'Desconocido'}`, "error");
      };
      recognition.onend = () => { 
        if (status !== 'THINKING' && status !== 'SPEAKING') setStatus('IDLE'); 
        setIsListening(false); 
      };
      
      recognition.start();
    } else {
        showToast("Tu navegador no soporta reconocimiento de voz.", "error");
    }
  };

  // Border Gradient Logic: Active on Listening or Speaking or Thinking
  const isSystemActive = status !== 'IDLE';

  return (
    <div className="relative w-full h-[500px] min-h-[500px] shrink-0 mb-8 z-40 group select-none">
      
      {/* === EXTERNAL NEON HALO (UNCLIPPED - BLUE TECH) === */}
      {/* This layer sits behind the main container and is allowed to spill out */}
      <div className={clsx(
          "absolute inset-0 z-0 pointer-events-none transition-opacity duration-500",
          isSystemActive ? "opacity-100" : "opacity-0" // Hidden when idle, appears when active
      )}>
          {/* TIER 0: Proximity Border Flash (Tight & Intense) */}
          <div className={clsx(
               "absolute -inset-[30px] rounded-[50px] bg-blue-100 mix-blend-overlay",
               "blur-[30px] opacity-0 transition-opacity duration-200",
               isSystemActive && "opacity-100 animate-pulse"
          )}></div>

          {/* TIER 1: Massive Core Impulse (Cyan Tech) */}
          <div className={clsx(
               "absolute -inset-[100px] rounded-[100px] bg-cyan-500",
               "blur-[100px] opacity-100 transition-opacity duration-300 mix-blend-screen", // Constant opacity base
               isSystemActive && "opacity-80 animate-[pulse_1s_cubic-bezier(0.4,0,0.6,1)_infinite]"
          )}></div>
          
          {/* TIER 2: Atmospheric Flood (Deep Blue) */}
          <div className={clsx(
               "absolute -inset-[300px] rounded-[300px] bg-blue-600",
               "blur-[150px] opacity-40 transition-opacity duration-500 mix-blend-screen",
               isSystemActive && "opacity-50 animate-[pulse_2s_ease-in-out_infinite]"
          )}></div>
      </div>
      
      {/* === FRONT-FACING LENS GLARE (OVERLAY) === */}
      {/* This layer sits ON TOP of the reactor (z-50) to create a blinding light bleeding over the UI */}
      <div className={clsx(
          "absolute inset-0 z-50 pointer-events-none transition-opacity duration-300 mix-blend-screen",
          isSystemActive ? "opacity-60" : "opacity-0"
      )}>
           <div className="absolute inset-[-50px] bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.3)_0%,transparent_70%)] blur-[40px] animate-pulse"></div>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-emerald-400/20 blur-[80px] rounded-full"></div>
      </div>

      {/* === MAIN CONTAINER === */}
      <div 
        className={clsx(
          "absolute inset-0 rounded-[32px] overflow-hidden transition-all duration-700",
          "bg-gradient-to-b from-[#0f172a] to-[#020617]", // Deep Slate/Navy gradient
          "border border-white/10 shadow-2xl shadow-black/50"
        )}
      >
        
        <div 
            className={clsx(
                "absolute inset-0 pointer-events-none transition-opacity duration-1000 z-0",
                isSystemActive ? "opacity-100" : "opacity-0" // Hidden when idle
            )}
        >

            {/* 2. Center-to-Border Branding Light (Blue Burst) */}
            <div className={clsx(
                "absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.8)_0%,rgba(79,70,229,0.5)_50%,transparent_80%)]", // Blue to Indigo
                "opacity-0 transition-opacity duration-300 mix-blend-screen",
                isSystemActive && "opacity-100 animate-[pulse_1.5s_ease-in-out_infinite]"
            )}></div>

            {/* 3. Moving Multi-Color Gradient Border (Blue Tech - Thinner inner visible) */}
            <div className={clsx(
                "absolute -inset-[10px] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(37,99,235,1)_60deg,rgba(79,70,229,1)_120deg,rgba(37,99,235,1)_180deg,transparent_360deg)]", // Blue/Indigo Conic
                "opacity-100 animate-[spin_1s_linear_infinite] shadow-[0_0_100px_rgba(37,99,235,1)] mix-blend-plus-lighter will-change-transform",
                 status === 'SPEAKING' ? "duration-500" : "duration-[1s]" 
            )}></div>
            
            {/* 4. Illuminated Glow Behind Border (Blue Intensity) */}
            <div className={clsx(
                "absolute -inset-[20px] rounded-[40px] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(37,99,235,0.8)_60deg,rgba(79,70,229,0.8)_120deg,rgba(37,99,235,0.8)_180deg,transparent_360deg)]", // Blue/Indigo Conic
                "blur-xl opacity-100 animate-[spin_1s_linear_infinite] transition-opacity duration-500 will-change-transform", // Reduced blur for perf
                status === 'SPEAKING' ? "duration-500" : "duration-[1s]"
            )}></div>
            
            {/* 4. Inner Mask (Apple Premium Glass Effect - Refined) */}
            {/* Added subtle specular gradient at top for physical glass look */}
            <div className="absolute inset-[6px] bg-black/90 backdrop-blur-3xl rounded-[28px] z-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),inset_0_-1px_1px_rgba(0,0,0,0.5)] border border-white/5 ring-1 ring-white/5 ring-inset">
                {/* Specular Top Reflection */}
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/5 to-transparent rounded-t-[28px] pointer-events-none opacity-50"></div>
            </div>
            
            {/* 5. Cinematic Grain Overlay (Anti-Banding Texture) */}
            <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.03] mix-blend-overlay" 
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
            </div>
        </div>


        {/* === BACKGROUND LAYERS (Siri Aurora Effect) === */}
        {/* The "Liquid Aurora Surge" Interface Layer */}
        <div className={clsx(
            "absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000", 
            isSystemActive ? "opacity-100" : "opacity-0"
        )}>
           
           {/* 1. Dynamic Pro Siri Aura (Apple Intelligence Style) */}
           {/* Fluid iridescent mesh gradients with additive blending */}
           <div className="absolute inset-0 overflow-hidden z-10 opacity-80 mix-blend-plus-lighter pointer-events-none">
               
               {/* Orb 1: Deep Indigo/Blue Base (Anchor) */}
               <div className={clsx(
                   "absolute bottom-[-10%] left-[10%] w-[90%] h-[90%] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.8),rgba(79,70,229,0.4),transparent)] blur-[60px]",
                   "animate-[aurora-float-1_12s_infinite_ease-in-out]", 
                   isSystemActive && "opacity-100" 
               )} />
               
               {/* Orb 2: Vibrant Fuschia/Pink Accent (The "Siri" Spark) */}
               <div className={clsx(
                   "absolute top-[0%] right-[0%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(236,72,153,0.8),rgba(168,85,247,0.5),transparent)] blur-[70px]",
                   "animate-[aurora-float-2_9s_infinite_ease-in-out]",
                   isSystemActive && "opacity-90"
               )} />

               {/* Orb 3: Bright Cyan/Teal Highlight (Energy) */}
               <div className={clsx(
                   "absolute top-[30%] left-[30%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.9),rgba(56,189,248,0.5),transparent)] blur-[50px]",
                   "animate-[aurora-float-3_7s_infinite_ease-in-out]",
                   isSystemActive && "opacity-100"
               )} />
           </div>

           {/* 2. Atmospheric Bleed */}
           <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-emerald-500/10 blur-[100px] animate-[slow-breathe_8s_ease-in-out_infinite]" />
            
            {/* 3. Premium Particle Dust (NEON SPARKS - Brand Colors) */}
            <div className="absolute inset-0 opacity-100 mix-blend-screen z-20">
                 <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 bg-blue-300 rounded-full blur-[0.5px] animate-float-slow shadow-[0_0_10px_rgb(147,197,253)]" />
                 <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-indigo-300 rounded-full blur-[0.5px] animate-float-medium shadow-[0_0_10px_rgb(165,180,252)]" />
                 <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-blue-400 rounded-full blur-[0.5px] animate-float-fast shadow-[0_0_10px_rgb(96,165,250)]" />
            </div>
         </div>

         {/* Base Background (Always visible) */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)] z-0 pointer-events-none"></div>


         {/* === HEADS UP DISPLAY (HUD) === */}
         {/* Top Left: Identity */}
         {/* Top Left: Identity (Refined Typography) */}
         <div className="absolute top-8 left-8 z-30 flex items-center gap-4">
           <div className={clsx(
             "w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-500 shadow-sm",
             isSystemActive ? "bg-blue-500/10 border-blue-400/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]" : "bg-white/5 border-white/10"
           )}>
              <Cpu size={14} className={isSystemActive ? "text-blue-400 animate-pulse" : "text-slate-500"} />
           </div>
           <div className="flex flex-col justify-center h-full space-y-0.5">
             <span className="text-[10px] font-bold tracking-[0.25em] text-white/90">NSG SYSTEM</span>
             <div className="flex items-center gap-2">
                 <span className="text-[8px] font-mono text-blue-500/80 uppercase tracking-widest">v2.4.0</span>
                 <span className={clsx("w-1 h-1 rounded-full", isSystemActive ? "bg-indigo-400 animate-pulse" : "bg-slate-600")}></span>
                 <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">{isSystemActive ? 'ONLINE' : 'STANDBY'}</span>
             </div>
           </div>
         </div>

        {/* Top Right: Controls */}
        <div className="absolute top-8 right-8 z-30 flex gap-2">
           <button 
              onClick={() => setIsMuted(!isMuted)}
              className="p-2.5 rounded-full bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
           >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
           </button>
        </div>


        {/* === CENTER: REACTOR ARC CENTRAL INTERACTIVO (Technologic Style) === */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pb-12">
            
            {/* Core Button / Visualizer */}
            <button 
              onClick={toggleListening}
              className="relative group focus:outline-none cursor-pointer"
            >
              {/* Outer Segmented Ring */}
              <div className="absolute -inset-12 border border-blue-500/5 rounded-full"></div>
              
              {/* Rotating Segments (Technologic Circles) - Speed Up */}
              <div className="absolute -inset-8 border-t-[1px] border-b-[1px] border-blue-500/20 rounded-full animate-[spin_5s_linear_infinite]"></div>
              <div className="absolute -inset-8 border-l-[1px] border-r-[1px] border-blue-400/10 rounded-full animate-[spin_8s_linear_infinite_reverse]"></div>

              {/* Siri/Apple Listen Glow */}
              <div className={clsx(
                  "absolute -inset-4 rounded-full transition-all duration-700 blur-xl opacity-0",
                  status === 'LISTENING' && "opacity-80 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-pulse scale-110"
              )}>
              </div>

              {/* Core Body */}
              <div className={clsx(
                  "relative w-40 h-40 md:w-48 md:h-48 rounded-full bg-slate-950 flex items-center justify-center transition-all duration-500 border border-blue-500/30 overflow-hidden shadow-2xl",
                  status === 'IDLE' ? "border-blue-500/20 shadow-[0_0_20px_rgba(37,99,235,0.1)]" : 
                  status === 'LISTENING' ? "border-white/40 scale-105 shadow-[0_0_40px_rgba(37,99,235,0.2)]" :
                  status === 'THINKING' ? "border-blue-400/50 shadow-[0_0_30px_rgba(37,99,235,0.2)]" :
                  "border-blue-400 shadow-[0_0_40px_rgba(37,99,235,0.3)]"
              )}>
                
                {/* Thinking Spinner Layers */}
                {status === 'THINKING' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
                    <div className="absolute w-24 h-24 border border-dashed border-blue-500/30 rounded-full animate-[spin_3s_linear_infinite]"></div>
                  </div>
                )}

                {/* Speaking Pulse Waves */}
                {status === 'SPEAKING' && [1, 2, 3].map(i => (
                  <div key={i} className="absolute inset-0 border-2 border-blue-400/30 rounded-full animate-[shockwave_2s_infinite]" style={{ animationDelay: `${i * 0.4}s` }}></div>
                ))}

                {/* Siri Waveform Mesh (Listening only) */}
                {status === 'LISTENING' && (
                  <div className="absolute inset-0 opacity-40 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-[spin_2s_linear_infinite]"></div>
                )}

                {/* Inner Mechanical Core */}
                <div className={clsx(
                    "relative w-20 h-20 md:w-24 md:h-24 rounded-full border border-blue-500/30 flex items-center justify-center bg-black transition-transform duration-500 shadow-inner",
                    status === 'LISTENING' ? "scale-90 bg-white" : "scale-100"
                )}>
                  <div className={clsx(
                      "w-8 h-8 rounded-full transition-all duration-500 blur-[2px]",
                      status === 'LISTENING' ? "bg-indigo-500" : "bg-blue-500"
                  )}></div>
                  <div className="absolute inset-2 border border-dashed border-blue-500/20 rounded-full"></div>
                </div>
              </div>
            </button>

            {/* Info Text */}
            <div className="mt-8 text-center z-30 space-y-2">
              <h2 className={clsx(
                  "text-lg font-light tracking-[0.3em] transition-all duration-500",
                  status === 'IDLE' ? "text-white/30" : "text-white"
              )}>
                {status === 'LISTENING' ? 'IDENTIFICANDO VOZ...' : 
                 status === 'THINKING' ? 'PROCESANDO DATOS' : 
                 status === 'SPEAKING' ? 'TRANSMITIENDO' : 'SISTEMA EN ESPERA'}
              </h2>
              <p className="text-[9px] tracking-[0.2em] text-blue-500/60 uppercase font-mono">Haga clic en el núcleo para hablar</p>
            </div>
        </div>


        {/* === INPUT FIELD (Bottom Dock) === */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-sm z-30">
            <div className={clsx(
                "relative group flex items-center gap-3 px-5 py-3 rounded-full transition-all duration-500",
                "bg-white/5 backdrop-blur-md border border-white/5",
                "hover:bg-white/10 hover:border-white/10 focus-within:bg-[#0B1121]/80 focus-within:border-white/20 focus-within:shadow-[0_0_30px_rgba(37,99,235,0.1)]"
            )}>
                 <Zap size={14} className="text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                 <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAction(input)}
                    placeholder="Ingresar comando..."
                    className="flex-1 bg-transparent border-none text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none font-medium tracking-wide"
                 />
            </div>
        </div>

        {/* === RESPONSE NOTIFICATION (Overlay) === */}
        <div className={clsx(
            "absolute top-24 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-40 transition-all duration-500 ease-out",
            showNotification ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
        )}>
           <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl shadow-black relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-white to-emerald-500 opacity-50"></div>
              
              <div className="flex justify-between items-start mb-3 relative z-10">
                 <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Respuesta del Sistema</span>
                 </div>
                 <button onClick={() => setShowNotification(false)} className="text-slate-500 hover:text-white transition-colors"><X size={14} /></button>
              </div>
              <div className="text-sm text-slate-200 leading-relaxed font-light custom-scroll max-h-40 overflow-y-auto relative z-10">
                 <ReactMarkdown 
                    components={{
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                        strong: ({node, ...props}) => <strong className="text-white font-bold text-shadow-sm" {...props} />
                    }}
                 >
                    {lastResponse || ''}
                 </ReactMarkdown>
              </div>
           </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        /* Apple Pro Fluid Animations */
        @keyframes aurora-float-1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -20px) scale(1.1); }
            66% { transform: translate(-20px, 10px) scale(0.95); }
        }
        @keyframes aurora-float-2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-40px, 30px) scale(1.2); }
        }
        @keyframes aurora-float-3 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(20px, 40px) scale(0.9); }
            66% { transform: translate(-30px, -20px) scale(1.1); }
        }
        
        .animate-aurora-float-1 { animation: aurora-float-1 12s infinite cubic-bezier(0.4, 0, 0.2, 1); }
        .animate-aurora-float-2 { animation: aurora-float-2 9s infinite cubic-bezier(0.4, 0, 0.2, 1); }
        .animate-aurora-float-3 { animation: aurora-float-3 7s infinite cubic-bezier(0.4, 0, 0.2, 1); }

        @keyframes music-bars {
            0%, 100% { height: 8px; opacity: 0.5; }
            50% { height: 20px; opacity: 1; }
        }
        @keyframes shockwave {
            0% { transform: scale(1); opacity: 0.8; border-width: 1px; }
            100% { transform: scale(2.5); opacity: 0; border-width: 0px; }
        }
        @keyframes liquid-shimmer {
          0%, 100% { filter: blur(1.5px) brightness(1); }
          50% { filter: blur(2.5px) brightness(1.3); }
        }
        
        /* Utility Classes */
        .animate-aurora-surge {
          animation: aurora-surge 4s cubic-bezier(0.16, 1, 0.3, 1) infinite alternate;
        }
        .animate-aurora-surge-delay {
          animation: aurora-surge-delay 4s cubic-bezier(0.16, 1, 0.3, 1) infinite alternate;
        }
        .animate-soft-bloom {
          animation: soft-bloom 3s cubic-bezier(0.25, 0.1, 0.25, 1) infinite alternate;
        }
        .animate-slow-breathe {
          animation: slow-breathe 8s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 4s linear infinite; /* Faster */
        }
        .animate-float-medium {
            animation: float-medium 5s linear infinite; /* Faster */
        }
        .animate-float-fast {
            animation: float-fast 3s linear infinite; /* Faster */
        }
      `}} />
    </div>
  );
}
