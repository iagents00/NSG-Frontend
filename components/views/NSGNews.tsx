"use client";
import React, { useState, useRef } from 'react';
import { Zap, Mic, ArrowUp, Filter } from "lucide-react";
import { NewsCard } from "@/components/ui/NewsCard";
import { useChatStore } from "@/store/useChatStore";
import clsx from "clsx";
import { useToast } from "@/components/ui/ToastProvider";

export default function NSGNews() {
  const runNewsAnalysis = useChatStore((state) => state.runNewsAnalysis);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const recognitionRef = useRef<any>(null);
  const { showToast } = useToast();

  const handleAnalyze = (title: string, tag: string) => {
    runNewsAnalysis(title, tag);
  };

  const toggleListening = () => {
    if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
        return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = 'es-ES';
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => setIsListening(true);
        
        recognition.onresult = (e: any) => {
            const transcript = Array.from(e.results)
                .map((result: any) => result[0])
                .map((result: any) => result.transcript)
                .join('');
            setInput(transcript);
        };
        
        recognition.onerror = (e: any) => {
            console.error("Speech error", e);
            setIsListening(false);
            showToast("Error en reconocimiento de voz", "error");
        };

        recognition.onend = () => setIsListening(false);
        recognition.start();
    } else {
        showToast("Reconocimiento de voz no soportado", "error");
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto animate-fade-in-up h-full flex flex-col px-6 pt-6">
      {/* Pro Search Bar */}
      <div className="mb-8 relative z-20">
          <form onSubmit={(e) => { e.preventDefault(); console.log("Search submitted:", input); }} className="relative max-w-4xl mx-auto group">
              <div className="absolute inset-0 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none transform scale-95"></div>
              <div className="relative flex items-center bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl rounded-full transition-all duration-300 pr-2 pl-2 py-2 hover:bg-white hover:shadow-2xl hover:border-blue-200">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 bg-transparent border-none py-3 px-6 font-display font-medium text-navy-900 focus:ring-0 placeholder-slate-400 text-lg focus:outline-none ml-2 tracking-tight" 
                    placeholder="Explorar inteligencia de mercado..." 
                    autoComplete="off"
                  />
                  <div className="flex gap-2 items-center">
                    
                     {/* Filter Toggle (Integrated) */}
                     <button 
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className={clsx(
                           "w-10 h-10 rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer",
                           showFilters ? "bg-blue-50 text-blue-600" : "hover:bg-slate-100 text-slate-400 hover:text-blue-600"
                        )}
                        title="Filtros"
                     >
                        <Filter className="w-5 h-5" />
                     </button>

                     <div className="h-6 w-px bg-slate-200 mx-1"></div>

                     <button 
                        type="button" 
                        onClick={toggleListening}
                        className={clsx(
                            "w-10 h-10 rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer group/mic",
                            isListening ? "bg-red-50 text-red-600 animate-pulse ring-2 ring-red-100" : "hover:bg-slate-100 text-slate-400 hover:text-blue-600"
                        )}
                        title={isListening ? "Detener escucha" : "Activar comando de voz"}
                     >
                        <Mic className={clsx("w-5 h-5 transition-transform group-hover/mic:scale-110", isListening && "scale-110")} />
                     </button>
                      <button 
                        type="submit" 
                        className="group/btn relative w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 transform active:scale-95 cursor-pointer overflow-hidden bg-linear-to-br from-navy-900 to-blue-900 hover:shadow-blue-500/40 hover:scale-105 border border-slate-200"
                      >
                          <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 group-hover/btn:opacity-0 group-hover/btn:scale-50">
                             <ArrowUp className="w-6 h-6 text-slate-900 stroke-[3px]" />
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 scale-150 transition-all duration-300 group-hover/btn:opacity-100 group-hover/btn:scale-100">
                              <div className="w-8 h-8 relative shrink-0 atom-container pointer-events-none">
                                <div className="w-full h-full atom-breathe">
                                  <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                                    <circle cx="50" cy="50" r="42" stroke="white" strokeWidth="8" fill="none" className="morph-orbit orbit-1" style={{transformOrigin:'center', animation:'spin 3s linear infinite'}} />
                                    <circle cx="50" cy="50" r="42" stroke="white" strokeWidth="8" fill="none" className="morph-orbit orbit-2" style={{transform: 'rotate(60deg) scaleY(0.45)', transformOrigin:'center', animation:'spin 3s linear infinite reverse'}} />
                                    <circle cx="50" cy="50" r="16" fill="white" />
                                  </svg>
                                </div>
                              </div>
                          </div>
                      </button>
                  </div>
              </div>
          </form>
      </div>

      {/* Collapsible Tabs Row */}
      <div className={clsx(
            "overflow-hidden transition-all duration-500 ease-in-out w-full -mt-4 mb-6",
            showFilters ? "max-h-24 opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-4"
      )}>
        <div className="flex justify-center overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex gap-2 p-1.5 bg-slate-100/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-inner">
            {["Inteligencia Global", "Estrategia", "Tecnología", "Mercados", "Bioquímica", "Regulación"].map((tab, i) => (
              <button key={tab} className={clsx(
                  "px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap",
                  i === 0 ? "bg-white text-navy-900 shadow-sm" : "text-slate-500 hover:text-navy-900 hover:bg-white/50"
              )}>
                  {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero & Grid Layout - Full Width & Responsive */}
      <div className="flex-1 overflow-y-auto custom-scroll pb-40 space-y-12">
          
          {/* Featured Hero - Dynamic Width */}
          <div className="w-full relative group cursor-pointer">
              <div className="relative w-full h-[450px] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20 transition-all duration-700 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                  <div className="absolute inset-0 bg-linear-to-br from-blue-950 via-navy-900 to-black"></div>
                  <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"></div>
                  <div className="absolute inset-0 bg-linear-to-t from-navy-950 via-navy-900/40 to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 p-10 md:p-16 w-full lg:w-2/3">
                      <div className="overflow-hidden mb-4">
                        <span className="inline-block px-3 py-1 bg-blue-500/20 backdrop-blur-md border border-blue-400/30 text-blue-200 text-[0.65rem] font-bold uppercase tracking-[0.2em] rounded-lg animate-fade-in-up">
                            Alerta Estratégica • Prioridad Alta
                        </span>
                      </div>
                      <h2 className="text-4xl md:text-6xl font-display font-medium text-white mb-6 leading-tight tracking-tight">
                        Salto Cuántico: La Nueva Era de la <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-emerald-400 font-bold">Computación Biológica.</span>
                      </h2>
                      <p className="text-lg text-slate-300 font-medium leading-relaxed mb-8 max-w-2xl opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
                        Nuevos datos sugieren un aumento del 45% en la eficiencia del procesamiento cognitivo al utilizar bucles de bio-retroalimentación.
                      </p>
                      <button onClick={() => handleAnalyze("Quantum Bio-Computing", "Priority")} className="flex items-center gap-3 text-white font-bold bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 pl-8 pr-6 py-4 rounded-full transition-all group-hover:gap-5 group-hover:bg-white group-hover:text-navy-900">
                          Analizar Impacto <ArrowUp className="w-5 h-5 rotate-90" />
                      </button>
                  </div>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <NewsCard source="Capital de Riesgo" title="Modelos Generativos Q3" tag="Reporte" color="emerald" description="Inversiones récord en modelos de lenguaje específicos de dominio." time="2h" onAnalyze={handleAnalyze} />
            <NewsCard source="Vigilancia Regulatoria" title="Actualización Ley IA UE" tag="Legal" color="blue" description="Nuevos marcos de cumplimiento para empresas de salud digital en Europa." time="4h" onAnalyze={handleAnalyze} />
            <NewsCard source="TechCrunch" title="Interfaces Neuronales" tag="Innovación" color="purple" description="Avances en la latencia de respuesta para interfaces cerebro-computadora." time="5h" onAnalyze={handleAnalyze} />
            <NewsCard source="Harvard Business" title="Gestión de Crisis" tag="Liderazgo" color="orange" description="Estrategias de resiliencia ejecutiva en mercados volátiles." time="6h" onAnalyze={handleAnalyze} />
            <NewsCard source="BioHack Daily" title="Optimización del Sueño" tag="Bienestar" color="sky" description="Protocolos de luz roja y su impacto en la recuperación REM." time="8h" onAnalyze={handleAnalyze} />
            
            {/* Minimalist 'More' Card */}
            <div className="bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-300 flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-white hover:border-blue-300 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 mb-4 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <ArrowUp className="w-6 h-6 rotate-45" />
                </div>
                <p className="font-bold text-navy-900">Cargar Más</p>
                <p className="text-xs text-slate-400 mt-1">Acceder a Archivos</p>
            </div>
          </div>
      </div>
    </div>
  );
}
