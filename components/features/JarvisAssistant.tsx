"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
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

// --- CONFIGURATION ---
const SYSTEM_PROMPT = `Eres JARVIS. Tu personalidad es culta, sarcástica y eficiente. 
Tus respuestas deben ser brillantes y breves. Te diriges al usuario como "Señor".`;

export default function JarvisAssistant() {
  const [input, setInput] = useState('');
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING'>('IDLE');
  const [showNotification, setShowNotification] = useState(false);
  const { showToast } = useToast();
  
  // Use a ref for the API key to prevent it from being exposed in source control if possible, 
  // or pull from env vars. For now, we'll keep the logic structure but use an env var.
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""; 

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
      if (!apiKey) {
        showToast("Falta la API Key de Gemini", "error");
        setStatus('IDLE');
        return;
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `British elegance, dry wit: ${text}` }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Charon" } } }
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
        const wavBlob = pcmToWav(pcmData, 24000); // 24kHz is typical for Gemini Audio
        const audio = new Audio(URL.createObjectURL(wavBlob));
        audio.onended = () => setStatus('IDLE');
        await audio.play();
      } else { 
        setStatus('IDLE'); 
      }
    } catch (e) { 
      console.error(e);
      setStatus('IDLE'); 
    }
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

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userQuery }] }],
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          tools: [{ google_search: {} }]
        })
      });
      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Protocolo de error activo, señor.";
      
      setLastResponse(aiText);
      setShowNotification(true);
      setIsProcessing(false);
      speak(aiText);
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
      setStatus('IDLE');
    }
  };

  const toggleListening = () => {
    if (status === 'LISTENING') return;
    
    // Type checking for SpeechRecognition
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
          console.error("Speech Error:", e);
          setStatus('IDLE');
          setIsListening(false);
          showToast("Error de reconocimiento de voz", "error");
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

  return (
    // Adapted container to fit in NSG Clarity (removed min-h-screen, added height/radius)
    <div className="relative w-full h-[500px] mb-8 bg-[#010409] rounded-[2.5rem] text-cyan-400 font-sans p-4 md:p-8 flex flex-col items-center justify-center overflow-hidden border border-navy-800 shadow-2xl group">
      
      {/* BACKGROUND EFFECTS */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15)_0%,transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* NOTIFICATION LAYER */}
      <div className={clsx(
          "absolute top-24 left-1/2 -translate-x-1/2 w-full max-w-md z-50 transition-all duration-500 transform",
          showNotification ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'
      )}>
        <div className="bg-black/80 backdrop-blur-2xl border border-cyan-500/30 rounded-2xl p-4 shadow-[0_0_40px_rgba(6,182,212,0.2)] flex items-start gap-4">
          <div className="bg-cyan-500/20 p-2 rounded-xl shrink-0">
            <Bell size={18} className="text-cyan-400 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-cyan-600 mb-1 flex justify-between items-center">
              <span>J.A.R.V.I.S. • Transmisión</span>
              <button onClick={() => setShowNotification(false)} className="hover:text-white transition"><X size={12} /></button>
            </h4>
            <p className="text-sm text-white/90 leading-relaxed font-light max-h-32 overflow-y-auto custom-scroll pr-1">
              {lastResponse}
            </p>
          </div>
        </div>
      </div>

      {/* HEADER */}
      <div className="absolute top-8 left-0 w-full px-8 md:px-12 flex justify-between items-center z-20">
        <div className="flex items-center gap-3">
          <Cpu size={16} className="text-cyan-800" />
          <span className="text-[10px] tracking-[0.6em] text-cyan-800 font-bold">PROTOCOLO MARK.VIII</span>
        </div>
        <div className="flex gap-4">
            <button onClick={() => setIsMuted(!isMuted)} className="p-2 text-cyan-800 hover:text-cyan-400 transition-colors">
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
        </div>
      </div>

      {/* REACTOR CORE */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-12 mt-4">
        
        {/* Core Button / Visualizer */}
        <button 
          onClick={toggleListening}
          className="relative group focus:outline-none cursor-pointer"
        >
          {/* Outer Segmented Ring */}
          <div className="absolute -inset-16 border border-cyan-500/5 rounded-full pointer-events-none"></div>
          
          {/* Rotating Segments */}
          <div className="absolute -inset-10 border-t-2 border-b-2 border-cyan-500/20 rounded-full animate-[spin_10s_linear_infinite] pointer-events-none"></div>
          <div className="absolute -inset-10 border-l-2 border-r-2 border-cyan-400/10 rounded-full animate-[spin_15s_linear_infinite_reverse] pointer-events-none"></div>

          {/* Glow */}
          <div className={clsx(
              "absolute -inset-4 rounded-full transition-all duration-700 blur-xl opacity-0 pointer-events-none",
              status === 'LISTENING' && "opacity-100 bg-siri-gradient animate-siri-glow scale-125"
          )}></div>

          {/* Core Body */}
          <div className={clsx(
            "relative w-56 h-56 md:w-64 md:h-64 rounded-full bg-slate-950 flex items-center justify-center transition-all duration-500 border-2 overflow-hidden",
            status === 'IDLE' ? 'border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.1)]' : 
            status === 'LISTENING' ? 'border-white/40 scale-105' :
            status === 'THINKING' ? 'border-cyan-400/50 shadow-[0_0_50px_rgba(6,182,212,0.3)]' :
            'border-cyan-400 shadow-[0_0_60px_rgba(6,182,212,0.4)]'
          )}>
            
            {/* Thinking Spinner */}
            {status === 'THINKING' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-16 h-16 text-cyan-400 animate-spin" />
                <div className="absolute w-40 h-40 border border-dashed border-cyan-500/30 rounded-full animate-[spin_3s_linear_infinite]"></div>
              </div>
            )}

            {/* Speaking Pulse */}
            {status === 'SPEAKING' && [1, 2, 3].map(i => (
              <div key={i} className="absolute inset-0 border-2 border-cyan-400/30 rounded-full animate-core-wave" style={{ animationDelay: `${i * 0.4}s` }}></div>
            ))}

            {/* Listening Waveform Mesh */}
            {status === 'LISTENING' && (
              <div className="absolute inset-0 opacity-40 bg-siri-gradient animate-[spin_2s_linear_infinite]"></div>
            )}

            {/* Inner Mechanical Core */}
            <div className={clsx(
                "relative w-28 h-28 md:w-32 md:h-32 rounded-full border border-cyan-500/40 flex items-center justify-center bg-black transition-transform duration-500 z-10",
                status === 'LISTENING' ? 'scale-90 bg-white' : 'scale-100'
            )}>
              <div className={clsx(
                  "w-10 h-10 rounded-full transition-all duration-500 blur-[4px]",
                  status === 'LISTENING' ? 'bg-indigo-500' : 'bg-cyan-500'
              )}></div>
              <div className="absolute inset-4 border border-dashed border-cyan-500/20 rounded-full"></div>
            </div>
          </div>
        </button>

        {/* Info Text */}
        <div className="text-center">
          <h2 className={clsx(
              "text-xl sm:text-2xl font-light tracking-[0.4em] transition-all duration-500",
              status === 'IDLE' ? 'text-white/20' : 'text-white'
          )}>
            {status === 'LISTENING' ? 'IDENTIFICANDO VOZ...' : 
             status === 'THINKING' ? 'PROCESANDO DATOS' : 
             status === 'SPEAKING' ? 'TRANSMITIENDO' : 'SISTEMA EN ESPERA'}
          </h2>
          <p className="mt-4 text-[10px] tracking-widest text-cyan-800 uppercase font-mono">Haga clic en el núcleo para hablar</p>
        </div>
      </div>

      {/* INPUT ALTERNATIVO */}
      <div className="absolute bottom-12 w-full max-w-sm px-4 opacity-10 hover:opacity-100 transition-opacity duration-500 z-20">
        <div className="relative flex items-center bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-2 gap-2">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAction(input)}
            placeholder="Introducir comando manual..."
            className="flex-1 bg-transparent border-none text-white text-xs focus:ring-0 placeholder:text-cyan-900/40 focus:outline-none px-2"
          />
          <Zap size={14} className="mr-2 text-cyan-900" />
        </div>
      </div>

      {/* COORDENADAS STARK */}
      <div className="absolute bottom-6 w-full px-8 md:px-12 flex justify-between items-center opacity-20 text-[9px] font-mono tracking-[0.2em] text-cyan-500 pointer-events-none">
        <span className="hidden sm:inline">STARK_INDUSTRIES_SECURE_LINK</span>
        <div className="flex gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <span>MALIBU: 34.0259° N</span>
          <span>REACTOR: ESTABLE</span>
        </div>
      </div>

      {/* Internal Styles for unique animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes core-wave {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes siri-glow {
          0% { filter: blur(20px) hue-rotate(0deg); opacity: 0.5; }
          50% { filter: blur(35px) hue-rotate(180deg); opacity: 0.8; }
          100% { filter: blur(20px) hue-rotate(360deg); opacity: 0.5; }
        }
        .animate-core-wave {
          animation: core-wave 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-siri-glow {
          animation: siri-glow 3s linear infinite;
        }
        .bg-siri-gradient {
          background: conic-gradient(from 0deg, #5eead4, #3b82f6, #8b5cf6, #ec4899, #5eead4);
        }
      `}} />
    </div>
  );
}
