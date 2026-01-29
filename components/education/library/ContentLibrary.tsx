import { useRef, useState } from "react";
import IngestInput from "./IngestInput";
import ContentGrid, { ContentGridRef } from "./ContentGrid";
import { Search, Filter, LayoutGrid, List } from "lucide-react";

import { EducationContent } from "@/types/education";
import ContentChat from "./ContentChat";

export default function ContentLibrary() {
    const [selectedItem, setSelectedItem] = useState<EducationContent | null>(
        null,
    );
    const gridRef = useRef<ContentGridRef>(null);

    const handleRefresh = () => {
        gridRef.current?.refresh();
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

    return (
        <div className="flex flex-col h-full gap-6 md:gap-8 p-4 md:p-6 bg-slate-50/30">
            {/* Header Area */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-navy-900 tracking-tight">
                            Biblioteca Inteligente
                        </h1>
                        <p className="text-slate-500 font-medium text-sm mt-1">
                            Sube contenido y obtén análisis basados en tu
                            estrategia.
                        </p>
                    </div>
                </div>

                {/* Hero Input */}
                <IngestInput onIngest={handleRefresh} />
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
                                className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all w-full md:w-64"
                            />
                        </div>
                        <button className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-navy-900 rounded-xl hover:border-slate-300 transition-all shadow-sm">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
                        <button className="p-1.5 bg-slate-900 text-white rounded-lg shadow-sm">
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-navy-900">
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <ContentGrid ref={gridRef} onSelect={setSelectedItem} />
            </div>
        </div>
    );
}
