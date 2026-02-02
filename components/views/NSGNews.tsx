"use client";

import { useState, useEffect } from "react";
import { Newspaper, Zap, Search, Sparkles } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import api from "@/lib/api";
import clsx from "clsx";
import ComingSoon from "@/components/ComingSoon";
import { NewsCard } from "@/components/ui/NewsCard";
import { useUIStore } from "@/store/useUIStore";
import { Banner } from "@/components/ui/Banner";

interface NewsItem {
    _id: string;
    title: string;
    content: string;
    date: string;
    link?: string;
    categories: string[];
    tag: string;
    source: string;
    color: string;
    analysis?: string;
    createdAt: string;
}

export default function INews() {
    const { currentRole } = useAppStore();
    const { openAI, setAIMode } = useUIStore();
    const [activeTab, setActiveTab] = useState<"market" | "archive">("market");
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            try {
                const endpoint =
                    activeTab === "archive"
                        ? "/news/search?type=analyzed"
                        : "/news/search";
                const response = await api.get(endpoint);
                setNews(response.data);
            } catch (error) {
                console.error("Error fetching news:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [activeTab]);

    const handleAnalyze = async (id: string) => {
        setAnalyzingId(id);
        try {
            // Trigger backend process
            await api.post(`/news/analyze/${id}`);

            // Open AI Modal in research mode to show the analysis "progress" in UI
            setAIMode("research");
            openAI();
        } catch (error) {
            console.error("Error analyzing news:", error);
        } finally {
            setAnalyzingId(null);
        }
    };

    const hasAccess = [
        "admin",
        "psychologist",
        "consultant",
        "manager",
    ].includes(currentRole || "");

    if (!hasAccess && currentRole !== "patient") {
        return (
            <ComingSoon
                title="I News"
                subtitle="Sistema de Inteligencia de Noticias Globales en desarrollo"
                estimatedDate="Q2 2026"
            />
        );
    }

    return (
        <div className="flex-1 overflow-y-auto custom-scroll safe-bottom-scroll scroll-smooth w-full animate-fade-in-up flex flex-col items-center bg-slate-50/10">
            <div className="w-full px-2 xs:px-4 lg:px-12 py-8 max-w-[1700px]">
                {/* 1. HERO BANNER - Dashboard Optimized Style */}
                <Banner
                    badge="Hyper-Intelligence Feed"
                    title="I Hyper-News"
                    description="Inteligencia de mercado curada algorítmicamente para acelerar tus objetivos estratégicos."
                />

                {/* Sub-header Controls */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-white/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-slate-200/60 shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-2 shadow-sm">
                            <Zap className="w-3.5 h-3.5 fill-blue-600" />
                            Precision Filter Active
                        </span>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/50 shadow-sm w-full md:w-auto">
                        <button
                            onClick={() => setActiveTab("market")}
                            className={clsx(
                                "flex-1 md:flex-none px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                                activeTab === "market"
                                    ? "bg-white text-navy-950 shadow-sm"
                                    : "text-slate-500 hover:text-navy-950 hover:bg-white/50",
                            )}
                        >
                            Inteligencia
                        </button>
                        <button
                            onClick={() => setActiveTab("archive")}
                            className={clsx(
                                "flex-1 md:flex-none px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                                activeTab === "archive"
                                    ? "bg-white text-navy-950 shadow-sm"
                                    : "text-slate-500 hover:text-navy-950 hover:bg-white/50",
                            )}
                        >
                            Archivo
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-10 relative max-w-xl group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar noticias o tendencias estratégicas..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-3xl shadow-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all outline-none text-slate-800 font-medium"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-400">
                        K
                    </div>
                </div>

                {/* News Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                            <Sparkles className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">
                            Decodificando Frecuencias Globales...
                        </p>
                    </div>
                ) : news.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {news.map((item) => (
                            <NewsCard
                                key={item._id}
                                source={item.source || "NSG"}
                                title={item.title}
                                tag={item.tag || item.categories[0] || "Global"}
                                color={item.color || "blue"}
                                description={item.content}
                                time={new Date(
                                    item.createdAt,
                                ).toLocaleDateString("es-ES", {
                                    day: "numeric",
                                    month: "short",
                                })}
                                isAnalyzed={!!item.analysis}
                                onAnalyze={() => handleAnalyze(item._id)}
                                isAnalyzing={analyzingId === item._id}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[3rem] p-24 border-2 border-dashed border-slate-100 flex flex-col items-center text-center max-w-3xl mx-auto shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 border border-slate-100">
                            <Newspaper className="w-10 h-10 text-slate-200" />
                        </div>
                        <h3 className="text-2xl font-bold text-navy-950 mb-2 font-display">
                            Feed Silencioso
                        </h3>
                        <p className="text-slate-500 max-w-sm">
                            No se han detectado nuevas señales en este canal.
                            Vuelve pronto para nuevos insights estratégicos.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
