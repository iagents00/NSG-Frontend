"use client";

import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";
import IngestInput from "./IngestInput";
import ContentGrid from "./ContentGrid";
import { Search, Filter, LayoutGrid, List, Loader2 } from "lucide-react";

import { EducationContent } from "@/types/education";
import ContentChat from "./ContentChat";
import { Banner } from "@/components/ui/Banner";

export default function ContentLibrary() {
    const [selectedItem, setSelectedItem] = useState<EducationContent | null>(
        null,
    );
    const [isProcessing, setIsProcessing] = useState(false);
    const [extraItems, setExtraItems] = useState<EducationContent[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    const handleIngest = (url: string) => {
        if (url.trim() === "https://www.youtube.com/watch?v=Fbt7qNMMdas") {
            setIsProcessing(true);
            setTimeout(() => {
                setIsProcessing(false);
                const newItem: EducationContent = {
                    id: "brian-tracy-fenix",
                    title: "Seminario Fénix (Brian Tracy)",
                    type: "video",
                    status: "ready",
                    thumbnailUrl:
                        "https://i.ytimg.com/vi/Fbt7qNMMdas/mqdefault.jpg",
                    createdAt: "Hace 1 min",
                    summary:
                        "Psicología del éxito y desbloqueo del potencial humano.",
                };

                // Add to library AND open it
                setExtraItems((prev) => [newItem, ...prev]);
                setSelectedItem(newItem);
            }, 3000);
        }
    };

    // If item selected, show Chat Interface for that content
    if (selectedItem) {
        return (
            <ContentChat
                item={selectedItem}
                onBack={() => setSelectedItem(null)}
            />
        );
    }

    if (isProcessing) {
        return (
            <div className="flex flex-col h-full items-center justify-center p-8 animate-fade-in">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin relative z-10" />
                </div>
                <h2 className="mt-8 text-xl font-display font-bold text-navy-900 tracking-tight">
                    Generando Campo de Inteligencia...
                </h2>
                <p className="mt-2 text-slate-500 font-medium">
                    Decodificando Seminario Fénix y Cruzando con Perfil #1
                </p>
                <div className="mt-6 w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-600 rounded-full animate-[progress_3s_ease-in-out_forwards]"
                        style={{ width: "0%" }}
                    ></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full gap-5 md:gap-8 p-6 md:p-8">
            {/* 1. HERO BANNER - Dashboard Optimized Style */}
            <Banner
                badge="Base de Conocimiento"
                title="NSG Education"
                description="Gestión de Archivos Clasificados y Recursos Estratégicos. Decodifica información compleja y conviértela en inteligencia accionable para tu perfil estratégico."
            />

            {/* Filters & Grid */}
            <div className="flex-1 flex flex-col gap-0 overflow-hidden">
                {/* Control Header */}
                <div className="flex items-center justify-between pb-4 shrink-0">
                    <h3 className="text-sm font-bold text-navy-900 uppercase tracking-widest flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4 text-slate-400" />
                        Archivos Recientes
                    </h3>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-lg transition-all duration-300 flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${showFilters ? "bg-slate-100 text-navy-900" : "text-slate-400 hover:text-navy-900 hover:bg-slate-50"}`}
                    >
                        <Filter className="w-3.5 h-3.5" />
                        {showFilters ? "Ocultar Filtros" : "Filtrar"}
                    </button>
                </div>

                {/* Collapsible Filters */}
                <div
                    className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${showFilters ? "max-h-24 opacity-100 mb-6" : "max-h-0 opacity-0 mb-0"}`}
                >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 shrink-0 pb-2 border-b border-slate-100">
                        {/* iOS Segmented Control Style Tabs */}
                        <div className="flex p-1 bg-slate-100/80 backdrop-blur-sm rounded-xl">
                            {["Todo", "Videos", "Documentos", "Enlaces"].map(
                                (tab, i) => (
                                    <button
                                        key={tab}
                                        className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 ${i === 0 ? "bg-white text-navy-900 shadow-sm" : "text-slate-500 hover:text-navy-900"}`}
                                    >
                                        {tab}
                                    </button>
                                ),
                            )}
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative group flex-1 md:flex-none">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-navy-900 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    className="pl-9 pr-4 py-1.5 bg-slate-50 border border-transparent focus:bg-white focus:border-slate-200 rounded-lg text-xs font-medium focus:outline-none transition-all w-full md:w-48 placeholder:text-slate-400 text-navy-900"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-2">
                    <ContentGrid
                        onSelect={setSelectedItem}
                        extraItems={extraItems}
                    />
                </div>
            </div>
        </div>
    );
}
