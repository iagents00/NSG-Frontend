"use client";
import React, { useState, useEffect } from 'react';
import { Zap, ArrowUp, Clock, X, Sparkles, Loader2, Search, RefreshCw } from "lucide-react";
import { NewsCard } from "@/components/ui/NewsCard";
import { useChatStore } from "@/store/useChatStore";
import clsx from "clsx";
import { useToast } from "@/components/ui/ToastProvider";
import api from "@/lib/api";

export default function NSGNews() {
  const runNewsAnalysis = useChatStore((state) => state.runNewsAnalysis);
  const [activeTab, setActiveTab] = useState<'intelligence' | 'archive'>('intelligence');
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false); // Changed to false by default as requested to only load on action, but we will use it in useEffect
  const [hasInitialFetch, setHasInitialFetch] = useState(false);
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [modalTab, setModalTab] = useState<'content' | 'analysis'>('content');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { showToast } = useToast();

  // Fetch news on mount to ensure persistence
  useEffect(() => {
    const fetchOnMount = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/news/search`);
        if (response.data && response.data.length > 0) {
          setNews(response.data);
        }
      } catch (error) {
        console.error("Mount Fetch Error:", error);
      } finally {
        setLoading(false);
        setHasInitialFetch(true);
      }
    };

    fetchOnMount();
  }, []); // Empty array ensures this only runs once on mount
  // BLOQUEO DE SCROLL DE FONDO
  useEffect(() => {
    if (selectedNews) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedNews]);

  const handleAnalyze = async (item: any) => {
    if (isAnalyzing) return;
    
    setIsAnalyzing(true);
    try {
      showToast("Solicitando análisis estratégico...", "info");
      
      const response = await api.post(`/news/analyze/${item._id}`);
      
      // The response is just a notification message
      const notification = typeof response.data === 'string' 
        ? response.data 
        : (response.data.message || "Análisis solicitado correctamente");

      showToast(notification, "success");
      setModalTab('analysis'); // Still switch to show the 'pending' state
      
    } catch (error: any) {
      console.error("Analysis Error:", error);
      showToast(error.response?.data?.message || "Error al solicitar el análisis", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateNews = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setLoading(true); // Also set background loading for safety
    
    try {
      // Simulate premium generation process (shorter for better feel)
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const response = await api.get(`/news/search`);
      
      if (response.data) {
        setNews(response.data);
        if (response.data.length > 0) {
          showToast("Inteligencia de mercado actualizada", "success");
        } else {
          showToast("No se encontraron registros recientes", "info");
        }
      }
    } catch (error) {
      console.error("Gen Error:", error);
      showToast("Error en la conexión neuronal", "error");
    } finally {
      setIsGenerating(false);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="max-w-[1400px] mx-auto animate-fade-in-up flex flex-col gap-6 min-h-screen">

      {/* 1. Featured Hero */}
      <div className="w-full relative group cursor-pointer shrink-0">
        <div className="relative w-full h-[180px] rounded-4xl overflow-hidden shadow-xl border border-white/20 transition-all duration-700 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          <div className="absolute inset-0 bg-linear-to-br from-blue-950 via-navy-900 to-black"></div>
          <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center"></div>
          <div className="absolute inset-0 bg-linear-to-t from-navy-950 via-navy-900/20 to-transparent"></div>

          <div className="absolute inset-0 flex flex-col justify-center p-8 md:px-12">
            <div className="overflow-hidden mb-2">
              <span className="inline-block px-2.5 py-1 bg-blue-500/20 backdrop-blur-md border border-blue-400/30 text-blue-200 text-[0.55rem] font-bold uppercase tracking-[0.2em] rounded-md">
                Alerta Estratégica • Prioridad Alta
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-medium text-white mb-3 leading-tight tracking-tight">
              La Nueva Era de la <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-emerald-400 font-bold">Computación Biológica.</span>
            </h2>
            <button onClick={() => runNewsAnalysis("Quantum Bio-Computing", "Priority")} className="w-fit flex items-center gap-2 text-white text-xs font-bold bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 pl-5 pr-3 py-2 rounded-full transition-all group-hover:bg-white group-hover:text-navy-900">
              Analizar Impacto <ArrowUp className="w-3.5 h-3.5 rotate-90" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Tabs - STICKY TOP */}
      <div className="sticky top-0 z-50 bg-slate-50/80 backdrop-blur-xl py-3 -mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10">
        <div className="flex justify-center">
          <div className="flex p-1 bg-slate-200/50 backdrop-blur-md rounded-xl border border-slate-200/60 shadow-inner gap-0.5">
            <button
              onClick={() => setActiveTab('intelligence')}
              className={clsx(
                "px-6 py-2 rounded-lg text-xs font-bold transition-all duration-300",
                activeTab === 'intelligence'
                  ? "bg-white text-navy-900 shadow-sm ring-1 ring-black/5"
                  : "text-slate-500 hover:text-navy-900 hover:bg-white/40"
              )}
            >
              Inteligencia de Mercado
            </button>
            <button
              onClick={() => setActiveTab('archive')}
              className={clsx(
                "px-6 py-2 rounded-lg text-xs font-bold transition-all duration-300",
                activeTab === 'archive'
                  ? "bg-white text-navy-900 shadow-sm ring-1 ring-black/5"
                  : "text-slate-500 hover:text-navy-900 hover:bg-white/40"
              )}
            >
              Archivo Global
            </button>
          </div>
        </div>
      </div>

      {/* 3. Content Area - Natural Scroll */}
      <div className="pb-40">
        <div className="w-full">
          {activeTab === 'intelligence' ? (
            /* --- TAB 1: Inteligencia de Mercado (Backend News) --- */
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* PREMIUM GENERATE BUTTON */}
              <div className="flex justify-center pt-4">
                <button 
                  onClick={handleGenerateNews}
                  disabled={isGenerating || loading}
                  className="group relative px-10 py-5 bg-navy-900 rounded-4xl overflow-hidden transition-all duration-500 hover:scale-[1.03] active:scale-95 shadow-2xl hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-blue-600/20 via-purple-600/20 to-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <div className="absolute -inset-1 bg-linear-to-r from-blue-600 via-purple-500 to-emerald-500 opacity-20 blur-xl group-hover:opacity-40 transition-opacity"></div>
                  
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 group-hover:rotate-12 transition-transform duration-500">
                      <Sparkles className="w-5 h-5 text-blue-400 fill-blue-400 group-hover:text-white group-hover:fill-white transition-colors" />
                    </div>
                    <div className="flex flex-col items-start pr-4">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-0.5">Analizador IA</span>
                      <span className="text-lg font-display font-medium text-white">Generar Inteligencia Avanzada</span>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <ArrowUp className="w-5 h-5 text-white/40 group-hover:text-white transition-colors rotate-90" />
                  </div>
                </button>
              </div>

              <div className="flex flex-col gap-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-3xl border-2 border-blue-500/20 animate-pulse"></div>
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin absolute top-4 left-4" />
                    </div>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">Consultando Red Neural...</p>
                  </div>
                ) : news.length > 0 ? (
                  news.map((item) => (
                    <NewsCard
                      key={item._id}
                      source={item.categories?.[0] || item.source || "NSG Intelligence"}
                      title={item.title}
                      tag={item.categories?.[1] || item.tag || "General"}
                      color={item.color || "blue"}
                      description={item.content ? item.content.substring(0, 300) + "..." : "No hay descripción disponible."}
                      time={item.date || "Reciente"}
                      onAnalyze={() => setSelectedNews(item)}
                    />
                  ))
                ) : (
                  <div className="p-20 bg-white rounded-4xl border border-slate-100 text-center shadow-sm relative overflow-hidden group/empty">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -mr-32 -mt-32"></div>
                    <div className="relative z-10">
                      <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 group-hover/empty:scale-110 group-hover/empty:bg-blue-50 transition-all duration-500">
                        <Zap className="w-10 h-10 text-slate-300 group-hover/empty:text-blue-500 transition-colors" />
                      </div>
                      <h4 className="text-2xl font-display font-medium text-navy-900 mb-3">Tu Inteligencia está lista</h4>
                      <p className="text-slate-500 max-w-sm mx-auto font-medium">
                        Haz clic en el botón superior para sincronizar las últimas tendencias y análisis del mercado global.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* --- TAB 2: Archivo Global (Static News) --- */
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex flex-col gap-6">
                <NewsCard source="Capital de Riesgo" title="Modelos Generativos Q3" tag="Reporte" color="emerald" description="Inversiones récord en modelos de lenguaje específicos de dominio." time="2h" onAnalyze={(t, tg) => setSelectedNews({ title: t, tag: tg, source: "Capital de Riesgo", description: "Inversiones récord en modelos de lenguaje específicos de dominio." })} />
                <NewsCard source="Vigilancia Regulatoria" title="Actualización Ley IA UE" tag="Legal" color="blue" description="Nuevos marcos de cumplimiento para empresas de salud digital en Europa." time="4h" onAnalyze={(t, tg) => setSelectedNews({ title: t, tag: tg, source: "Vigilancia Regulatoria", description: "Nuevos marcos de cumplimiento para empresas de salud digital en Europa." })} />

                <div className="bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-300 flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-white hover:border-blue-300 hover:shadow-lg transition-all group">
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 mb-4 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <ArrowUp className="w-6 h-6 rotate-45" />
                  </div>
                  <p className="font-bold text-navy-900">Cargar Más</p>
                  <p className="text-xs text-slate-400 mt-1">Acceder a Archivos</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* --- NEWS DETAIL MODAL --- */}
      {selectedNews && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6 md:p-12 animate-in fade-in duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedNews(null)}></div>
          <div className="relative bg-white w-full max-w-4xl h-full max-h-[85vh] rounded-4xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-6 md:p-10 pb-6 border-b border-slate-50 relative shrink-0">
              <div className="pr-16">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {(selectedNews.categories || []).map((cat: string, idx: number) => (
                    <span key={idx} className="text-[0.6rem] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">
                      {cat}
                    </span>
                  ))}
                  <div className="h-1 w-1 rounded-full bg-slate-200 ml-1"></div>
                  <span className="text-[0.65rem] font-medium text-slate-400 uppercase tracking-widest">
                    Inteligencia NSG
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl lg:text-3xl font-display font-medium text-navy-900 leading-tight">
                  {selectedNews.title}
                </h3>
              </div>

              {/* MODAL TABS */}
              <div className="flex items-center gap-1 mt-6 bg-slate-100 p-1 rounded-2xl w-fit">
                <button
                  onClick={() => setModalTab('content')}
                  className={clsx(
                    "px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
                    modalTab === 'content'
                      ? "bg-white text-navy-900 shadow-sm"
                      : "text-slate-500 hover:text-navy-900"
                  )}
                >
                  Contenido
                </button>
                <button
                  onClick={() => setModalTab('analysis')}
                  className={clsx(
                    "px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-2",
                    modalTab === 'analysis'
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-blue-600"
                  )}
                >
                  <Sparkles className={clsx("w-3.5 h-3.5", modalTab === 'analysis' ? "text-blue-500" : "text-slate-400")} />
                  Análisis Estratégico
                </button>
              </div>

              <button
                onClick={() => setSelectedNews(null)}
                className="absolute top-6 right-6 w-10 min-h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors shrink-0 shadow-sm border border-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - Only this part scrolls */}
            <div className="flex-1 overflow-y-auto p-8 md:p-10 custom-scroll bg-white">
              <div className="max-w-3xl mx-auto">
                {modalTab === 'content' ? (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {selectedNews.cntentHTML ? (
                      <div 
                        className="prose prose-slate max-w-none prose-img:rounded-3xl prose-a:text-blue-600"
                        dangerouslySetInnerHTML={{ __html: selectedNews.cntentHTML }} 
                      />
                    ) : (
                      <p className="text-slate-600 text-base md:text-lg leading-[1.7] font-light whitespace-pre-wrap">
                        {selectedNews.content}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 h-full">
                    {selectedNews.analysis ? (
                      <div className="p-8 md:p-12 bg-blue-50/30 rounded-4xl border border-blue-100/50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                          <Zap className="w-24 h-24 text-blue-600" />
                        </div>
                        
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20">
                            <Sparkles className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-blue-950 uppercase tracking-[0.2em]">Inteligencia Estratégica</h4>
                            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-0.5">Generado por NSG AI Neural</p>
                          </div>
                        </div>

                        <div 
                          className="prose prose-slate max-w-none 
                            text-slate-700 leading-relaxed text-lg
                            prose-h3:relative prose-h3:pl-6 prose-h3:text-blue-900 prose-h3:font-display prose-h3:font-bold prose-h3:text-xl prose-h3:mt-12 prose-h3:mb-6
                            prose-h3:after:content-[':'] prose-h3:after:text-blue-400
                            prose-h3:before:absolute prose-h3:before:left-0 prose-h3:before:top-1/2 prose-h3:before:-translate-y-1/2 prose-h3:before:w-1.5 prose-h3:before:h-1.5 prose-h3:before:rounded-full prose-h3:before:bg-blue-500 prose-h3:before:shadow-[0_0_10px_rgba(59,130,246,0.5)]
                            prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-6
                            prose-ul:my-8 prose-ul:space-y-3 prose-ul:list-none prose-ul:pl-0
                            prose-li:relative prose-li:pl-8 prose-li:text-slate-600 prose-li:text-base
                            prose-li:before:absolute prose-li:before:left-0 prose-li:before:top-[0.6em] prose-li:before:w-5 prose-li:before:h-5 prose-li:before:bg-blue-50 prose-li:before:rounded-lg prose-li:before:flex prose-li:before:items-center prose-li:before:justify-center prose-li:before:content-['✓'] prose-li:before:text-[10px] prose-li:before:font-bold prose-li:before:text-blue-600 prose-li:before:border prose-li:before:border-blue-100"
                          dangerouslySetInnerHTML={{ __html: selectedNews.analysis }}
                        />
                        
                        <div className="mt-12 pt-8 border-t border-blue-100/50 flex items-center gap-4">
                          <div className="flex -space-x-2">
                            {[1,2,3].map(i => (
                              <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                                <img src={`https://i.pravatar.cc/150?u=${i+10}`} alt="avatar" />
                              </div>
                            ))}
                          </div>
                          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Analistas NSG han validado este reporte</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-12 md:p-20 bg-slate-50 rounded-4xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center animate-pulse-slow">
                        <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center shadow-sm border border-slate-100 mb-6 group-hover:scale-110 transition-transform duration-500">
                          <Loader2 className="w-10 h-10 text-slate-300 animate-spin-slow" />
                        </div>
                        <h4 className="text-xl font-display font-medium text-navy-900 mb-2">Análisis en Espera</h4>
                        <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                          La inteligencia para esta noticia aún no ha sido sintetizada. Solicite el análisis estratégico usando el botón inferior.
                        </p>
                        <div className="mt-8 flex gap-2">
                          <div className="w-1 h-1 rounded-full bg-blue-300"></div>
                          <div className="w-1 h-1 rounded-full bg-blue-100"></div>
                          <div className="w-1 h-1 rounded-full bg-blue-50"></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="h-12"></div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 md:p-8 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row gap-6 items-center justify-between shrink-0">
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Clock className="w-3 h-3" />
                  <span>Publicado: {selectedNews.date}</span>
                </div>
                {selectedNews.link && (
                  <a 
                    href={selectedNews.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold text-blue-500 hover:text-blue-700 underline"
                  >
                    Ver fuente original
                  </a>
                )}
              </div>
              <button
                onClick={() => handleAnalyze(selectedNews)}
                disabled={isAnalyzing || !!selectedNews.analysis}
                className="w-full md:w-auto px-8 py-3.5 bg-blue-600 text-white rounded-xl text-[0.7rem] font-bold uppercase tracking-widest hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-800"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Procesando...
                  </>
                ) : selectedNews.analysis ? (
                  <>
                    Análisis Completado
                    <div className="w-4 h-4 rounded-full bg-blue-400 flex items-center justify-center">
                      <Zap className="w-2.5 h-2.5 text-white fill-white" />
                    </div>
                  </>
                ) : (
                  <>
                    Enviar a Análisis Estratégico
                    <ArrowUp className="w-4 h-4 rotate-90" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- PREMIUM GENERATION OVERLAY --- */}
      {isGenerating && (
        <div className="fixed inset-0 z-200 flex flex-col items-center justify-center bg-navy-950/90 backdrop-blur-2xl animate-in fade-in duration-700">
          <div className="relative w-full max-w-lg px-8 flex flex-col items-center">
            {/* Pulsating background layers */}
            <div className="absolute inset-0 bg-blue-600/20 blur-[120px] animate-pulse"></div>
            <div className="absolute inset-0 bg-emerald-600/10 blur-[100px] animate-pulse delay-700"></div>

            {/* Central Visual Component */}
            <div className="relative mb-12">
              <div className="w-32 h-32 rounded-4xl bg-navy-900 border border-white/10 flex items-center justify-center relative overflow-hidden group shadow-2xl">
                <div className="absolute inset-0 bg-linear-to-tr from-blue-600/20 to-purple-600/20"></div>
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin-slow" />
                <div className="absolute inset-0 animate-shimmer bg-linear-to-r from-transparent via-white/5 to-transparent"></div>
              </div>
              
              {/* Floating micro-elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500/20 backdrop-blur-xl rounded-xl border border-white/20 flex items-center justify-center animate-bounce">
                <Sparkles className="w-4 h-4 text-blue-300" />
              </div>
              <div className="absolute -bottom-2 -left-6 w-10 h-10 bg-emerald-500/20 backdrop-blur-xl rounded-xl border border-white/20 flex items-center justify-center animate-pulse delay-300">
                <RefreshCw className="w-5 h-5 text-emerald-300 animate-spin-slow" />
              </div>
            </div>

            {/* Text Information */}
            <div className="text-center space-y-4 relative z-10">
              <h3 className="text-2xl font-display font-medium text-white tracking-tight">
                Escaneando <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-emerald-400 font-bold">Horizonte Global</span>
              </h3>
              <div className="flex flex-col gap-2">
                <p className="text-blue-100/60 text-sm font-medium tracking-widest uppercase">
                  Sintetizando inteligencia estratégica...
                </p>
                <div className="flex justify-center gap-1.5 mt-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-200"></div>
                </div>
              </div>
            </div>

            {/* Progress bar at bottom */}
            <div className="mt-16 w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-linear-to-r from-blue-600 via-purple-500 to-emerald-500 animate-progress w-full transform origin-left"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}