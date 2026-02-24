"use client";

import { EducationContent } from "@/types/education";
import {
    FileText,
    Video,
    Image as ImageIcon,
    Calendar,
    ChevronRight,
    Trash2,
    CheckCircle2,
    Clock,
} from "lucide-react";
import clsx from "clsx";
import ReactMarkdown from "react-markdown";

interface ContentGridProps {
    onSelect: (item: EducationContent) => void;
    onDelete: (id: string) => void;
    extraItems: EducationContent[];
}

export default function ContentGrid({
    onSelect,
    onDelete,
    extraItems,
}: ContentGridProps) {
    if (extraItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
                <div className="w-20 h-20 bg-slate-50/50 rounded-[32px] flex items-center justify-center mb-6 border border-slate-100">
                    <FileText className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-display font-bold text-navy-900">
                    Bóveda de Conocimiento Vacía
                </h3>
                <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2 font-medium">
                    Aún no has integrado recursos a tu cerebro estratégico.
                    Envía uno para comenzar el análisis.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {extraItems.map((item) => (
                <div
                    key={item.id}
                    onClick={() => onSelect(item)}
                    className="group relative bg-white rounded-[32px] border border-slate-100 p-6 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:border-blue-100/50 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col h-full active:scale-[0.98]"
                >
                    {/* Background Accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-blue-50/20 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

                    {/* Header */}
                    <div className="flex items-start justify-between mb-6 relative z-10">
                        <div
                            className={clsx(
                                "p-4 rounded-2xl transition-all duration-300 shadow-sm",
                                item.type === "video"
                                    ? "bg-amber-50 text-amber-600 group-hover:bg-amber-100"
                                    : item.type === "image"
                                      ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100"
                                      : "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
                            )}
                        >
                            {item.type === "video" ? (
                                <Video className="w-6 h-6" />
                            ) : item.type === "image" ? (
                                <ImageIcon className="w-6 h-6" />
                            ) : (
                                <FileText className="w-6 h-6" />
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <div
                                className={clsx(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all duration-300",
                                    item.status === "ready"
                                        ? "bg-emerald-50/50 text-emerald-600 border-emerald-100/50"
                                        : "bg-amber-50/50 text-amber-600 border-amber-100/50",
                                )}
                            >
                                {item.status === "ready" ? (
                                    <>
                                        <CheckCircle2 className="w-3 h-3" />
                                        <span>Completado</span>
                                    </>
                                ) : (
                                    <>
                                        <Clock className="w-3 h-3 animate-pulse" />
                                        <span>En Proceso</span>
                                    </>
                                )}
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(item.id);
                                }}
                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-3 relative z-10">
                        <div className="font-display font-semibold text-navy-950 group-hover:text-blue-600 transition-colors text-lg tracking-tight leading-snug line-clamp-2 prose prose-p:my-0 prose-strong:text-inherit">
                            <ReactMarkdown>{item.title}</ReactMarkdown>
                        </div>
                        <div className="text-sm text-slate-500 line-clamp-3 leading-relaxed font-medium prose prose-p:my-0 prose-strong:text-slate-700">
                            <ReactMarkdown>
                                {item.summary ||
                                    "Analizando el contenido estratégico del recurso..."}
                            </ReactMarkdown>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-5 border-t border-slate-50 flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                <Calendar className="w-3 h-3" />
                            </div>
                            {item.createdAt
                                ? new Date(item.createdAt).toLocaleDateString(
                                      "es-ES",
                                      {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric",
                                      },
                                  )
                                : "Sin fecha"}
                        </div>
                        <div className="flex items-center gap-1 text-blue-600 font-bold text-[10px] uppercase tracking-wider opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                            Consultar
                            <ChevronRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
