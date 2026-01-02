"use client";
import React, { useState, useEffect } from 'react';
import { Zap, ArrowUp, Clock, X } from "lucide-react";
import { NewsCard } from "@/components/ui/NewsCard";
import { useChatStore } from "@/store/useChatStore";
import clsx from "clsx";
import { useToast } from "@/components/ui/ToastProvider";
import api from "@/lib/api";

export default function NSGNews() {
  const runNewsAnalysis = useChatStore((state) => state.runNewsAnalysis);
  const [activeTab, setActiveTab] = useState<'intelligence' | 'archive'>('intelligence');
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dateString = yesterday.toLocaleDateString('en-CA');
        const response = await api.get(`/news/search?date=${dateString}`);
        setNews(response.data);
      } catch (error) {
        console.error("Error fetching news:", error);
        showToast("Error al cargar las noticias", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [showToast]);

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

  const handleAnalyze = (title: string, tag: string) => {
    runNewsAnalysis(title, tag);
    setSelectedNews(null);
  };

  return (
    <div className="max-w-[1400px] mx-auto animate-fade-in-up flex flex-col px-6 pt-6 gap-6 min-h-screen">

      {/* 1. Featured Hero */}
      <div className="w-full relative group cursor-pointer shrink-0">
        <div className="relative w-full h-[180px] rounded-[2rem] overflow-hidden shadow-xl border border-white/20 transition-all duration-700 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
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
      <div className="sticky top-0 z-50 bg-slate-50/80 backdrop-blur-xl py-3 -mx-6 px-6">
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
        <div className="max-w-4xl mx-auto w-full">
          {activeTab === 'intelligence' ? (
            /* --- TAB 1: Inteligencia de Mercado (Backend News) --- */
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex flex-col gap-6">
                {loading ? (
                  <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : news.length > 0 ? (
                  news.map((item) => (
                    <NewsCard
                      key={item._id}
                      source={item.source || "NSG Intelligence"}
                      title={item.title}
                      tag={item.tag || "General"}
                      color={item.color || "blue"}
                      description={item.description || (item.content ? item.content.substring(0, 300) + "..." : "No hay descripción disponible.")}
                      time={item.published_at ? new Date(item.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Reciente"}
                      onAnalyze={() => setSelectedNews(item)}
                    />
                  ))
                ) : (
                  <div className="p-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-8 h-8 text-blue-400" />
                    </div>
                    <h4 className="text-xl font-bold text-navy-900 mb-2">Buscando Actualizaciones</h4>
                    <p className="text-slate-500 max-w-sm mx-auto">
                      No se han encontrado registros en la base de datos para la fecha solicitada.
                    </p>
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

      {/* --- NEWS DETAIL MODAL --- */}
      {selectedNews && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12 animate-in fade-in duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedNews(null)}></div>
          <div className="relative bg-white w-full max-w-4xl h-full max-h-[85vh] rounded-[2.5rem] md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-6 md:p-10 pb-6 border-b border-slate-50 relative shrink-0">
              <div className="pr-16">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[0.65rem] font-bold text-blue-600 uppercase tracking-[0.2em] bg-blue-50 px-2.5 py-1 rounded-lg">
                    {selectedNews.source}
                  </span>
                  <div className="h-1 w-1 rounded-full bg-slate-200"></div>
                  <span className="text-[0.65rem] font-medium text-slate-400 uppercase tracking-widest">
                    Inteligencia NSG
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl lg:text-3xl font-display font-medium text-navy-900 leading-tight">
                  {selectedNews.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNews(null)}
                className="absolute top-6 right-6 w-10 min-h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors shrink-0 shadow-sm border border-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - Only this part scrolls */}
            <div className="flex-1 overflow-y-auto p-8 md:p-10 custom-scroll">
              <div className="max-w-2xl mx-auto">
                <p className="text-slate-600 text-base md:text-lg leading-[1.7] font-light">
                  {selectedNews.content || selectedNews.description}
                </p>
                <div className="h-12"></div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 md:p-8 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row gap-6 items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Actualizado recientemente</span>
              </div>
              <button
                onClick={() => handleAnalyze(selectedNews.title, selectedNews.tag)}
                className="w-full md:w-auto px-8 py-3.5 bg-blue-600 text-white rounded-xl text-[0.7rem] font-bold uppercase tracking-widest hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                Enviar a Análisis Estratégico
                <ArrowUp className="w-4 h-4 rotate-90" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}