"use client";

import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";
import IngestInput from "./IngestInput";
import ContentGrid from "./ContentGrid";
import { Search, Filter, LayoutGrid, List } from "lucide-react";

import { EducationContent } from "@/types/education";
import ContentChat from "./ContentChat";

export default function ContentLibrary() {
    const [selectedItem, setSelectedItem] = useState<EducationContent | null>(null);

    // If item selected, show Chat Interface for that content
    if (selectedItem) {
        return <ContentChat item={selectedItem} onBack={() => setSelectedItem(null)} />;
    }

    return (
        <div className="flex flex-col h-full gap-6 md:gap-8 p-4 md:p-6">
            {/* Header Area */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
                     <h1 className="text-2xl md:text-3xl font-display font-bold text-navy-900 tracking-tight">Biblioteca de Conocimiento</h1>
                     <button className="bg-navy-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-navy-800 transition-all shadow-lg shadow-navy-900/20 active:scale-95">
                        Importar Archivo
                     </button>
                </div>
                
                {/* Hero Input */}
                <IngestInput />
            </div>

            {/* Filters & Grid */}
            <div className="flex-1 flex flex-col gap-4">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
                     <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative group flex-1 md:flex-none">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Buscar en tu biblioteca..." 
                                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all w-full md:w-64"
                            />
                        </div>
                        <button className="p-2 text-slate-400 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors">
                            <Filter className="w-4 h-4" />
                        </button>
                     </div>
                     <div className="flex items-center bg-slate-100 p-1 rounded-lg">
                        <button className="p-1.5 bg-white shadow-sm rounded-md text-navy-900">
                             <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-navy-900">
                             <List className="w-4 h-4" />
                        </button>
                     </div>
                 </div>

                 <ContentGrid onSelect={setSelectedItem} />
            </div>
        </div>
    )
}
