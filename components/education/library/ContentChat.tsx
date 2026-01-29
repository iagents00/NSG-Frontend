"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, ArrowRight, FileText, CheckCircle2, TrendingUp, Activity, Download, ChevronRight, X, ChevronLeft } from "lucide-react";
import clsx from "clsx";
import BrandAtom from "@/components/ui/BrandAtom";
import { EducationContent, Message, AnalysisDocument } from "@/types/education";
import { useAppStore } from "@/store/useAppStore";
import { educationService } from "@/lib/education";

interface ContentChatProps {
    item: EducationContent;
    onBack: () => void;
}

export default function ContentChat({ item, onBack }: ContentChatProps) {
    const strategyPreferences = useAppStore(state => state.strategyPreferences);

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'system',
            content: `Enlace establecido para "${item.title}". Para generar un informe de inteligencia personalizado${strategyPreferences?.entregable ? ` (formato ${strategyPreferences.entregable})` : ''}, solicito coordenadas: ¿Cuál es su desafío operativo actual referente a este objetivo?`,
            type: 'text'
        }
    ]);
    const [documents, setDocuments] = useState<AnalysisDocument[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<AnalysisDocument | null>(null);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async (text: string) => {
        if (!text.trim()) return;

        // User Message
        const newMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
        setMessages(prev => [...prev, newMsg]);
        setInput("");
        setIsTyping(true);

        try {
            const responseMsg = await educationService.contentChat(item.id, text, messages, strategyPreferences);
            
            setIsTyping(false);
            setMessages(prev => [...prev, responseMsg]);

            if (responseMsg.type === 'report' && responseMsg.reportData) {
                 setDocuments(prev => [responseMsg.reportData!, ...prev]);
                 if (documents.length === 0) {
                     setSelectedDoc(responseMsg.reportData!);
                 }
            }
        } catch (error) {
             console.error("Chat Error", error);
             setIsTyping(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-full gap-4 md:gap-6">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full relative bg-white/50 rounded-3xl md:rounded-[2.5rem] overflow-hidden border border-white/60 shadow-inner backdrop-blur-md transition-all min-h-[500px]">
                {/* Header */}
                <div className="flex items-center gap-3 md:gap-4 p-4 md:p-6 px-4 md:px-8 border-b border-white/20 bg-white/40">
                    <button 
                        onClick={onBack}
                        className="p-2.5 rounded-full text-slate-500 hover:text-navy-900 hover:bg-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-navy-900 leading-tight">{item.title}</h2>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                            <Activity className="w-3 h-3 text-emerald-500" />
                            Protocolo Diplomático Activo
                        </p>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
                    {messages.map((msg, idx) => (
                        <div
                            key={msg.id}
                            className={clsx(
                                "flex w-full animate-fade-in-up",
                                msg.role === 'user' ? "justify-end" : "justify-start"
                            )}
                            style={{ animationDelay: `${idx * 0.1}s` }}
                        >
                            {/* Avatar for System */}
                            {msg.role === 'system' && (
                                <div className="w-8 h-8 mr-4 mt-1 shrink-0 rounded-full overflow-hidden shadow-sm">
                                    <BrandAtom className="w-full h-full" />
                                </div>
                            )}

                            <div className="max-w-[90%] md:max-w-[85%] flex flex-col gap-2">
                                <div className={clsx(
                                    "p-6 text-[15px] leading-relaxed relative group transition-all duration-300 shadow-sm",
                                    msg.role === 'user' 
                                        ? "bg-slate-900 text-white rounded-[1.5rem] rounded-tr-md shadow-slate-900/10" 
                                        : "bg-white/80 backdrop-blur-xl border border-white/60 text-slate-700 rounded-[1.5rem] rounded-tl-md"
                                )}>
                                    <p className="font-medium">{msg.content}</p>

                                    {/* Options Buttons */}
                                    {msg.role === 'system' && msg.type === 'options' && msg.options && (
                                        <div className="mt-5 flex flex-wrap gap-2.5">
                                            {msg.options.map((opt, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleSend(opt)}
                                                    className="px-5 py-2.5 bg-white border border-slate-200/60 hover:border-slate-300 hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-sm font-semibold rounded-xl transition-all hover:-translate-y-0.5 shadow-sm cursor-pointer"
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* REPORT CARD IN CHAT (Mini Preview) */}
                                {msg.role === 'system' && msg.type === 'report' && msg.reportData && (
                                    <div 
                                        onClick={() => setSelectedDoc(msg.reportData!)}
                                        className="mt-2 w-full max-w-sm animate-fade-in-up cursor-pointer group hover:scale-[1.02] transition-transform duration-300"
                                    >
                                        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xl overflow-hidden relative">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Documento Generado</p>
                                                    <p className="text-sm font-bold text-navy-900 leading-tight group-hover:text-blue-600 transition-colors">Ver Análisis Completo</p>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-slate-300 ml-auto group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                       <div className="flex justify-start w-full animate-fade-in pl-14">
                            <div className="bg-white/40 backdrop-blur-sm border border-white/30 px-5 py-4 rounded-full rounded-bl-none flex items-center gap-2 shadow-sm">
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                            </div>
                       </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 md:p-8 pt-2 md:pt-4 bg-gradient-to-t from-white/60 via-white/30 to-transparent">
                    <div className="relative flex items-center gap-2 bg-white/80 backdrop-blur-xl rounded-full p-2 pl-6 pr-2 border border-white/50 transition-all shadow-lg shadow-slate-200/20 focus-within:shadow-xl focus-within:border-blue-200 focus-within:ring-4 focus-within:ring-blue-500/5">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                            placeholder="Ingrese coordenadas o solicite análisis..."
                            className="w-full bg-transparent py-3 text-navy-900 placeholder:text-slate-500 focus:outline-none font-medium text-base"
                        />
                        <button 
                            onClick={() => handleSend(input)}
                            disabled={!input.trim()}
                            className="p-3 bg-slate-900 text-white rounded-full hover:bg-black transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-slate-900/20 cursor-pointer"
                        >
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* LATERAL SIDEBAR (Analysis Uploads) */}
            <div className="w-full lg:w-80 h-48 lg:h-full flex flex-col bg-white/60 backdrop-blur-2xl rounded-3xl md:rounded-[2.5rem] border border-white/60 shadow-lg relative overflow-hidden shrink-0">
                <div className="p-6 border-b border-slate-100/50">
                    <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider flex items-center gap-2">
                        Expedientes de Inteligencia
                    </h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {documents.length === 0 ? (
                        <div className="text-center mt-20 px-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                                <FileText className="w-6 h-6" />
                            </div>
                            <p className="text-sm text-slate-500 font-medium">Sin expedientes generados.</p>
                            <p className="text-xs text-slate-400 mt-1">Interactúe con el enlace para generar inteligencia.</p>
                        </div>
                    ) : (
                        documents.map((doc) => (
                            <div 
                                key={doc.id}
                                onClick={() => setSelectedDoc(doc)}
                                className={clsx(
                                    "p-4 rounded-2xl border transition-all cursor-pointer group hover:scale-[1.02] active:scale-98",
                                    selectedDoc?.id === doc.id 
                                        ? "bg-white border-blue-200 shadow-lg shadow-blue-500/5 ring-1 ring-blue-500/20" 
                                        : "bg-white/50 border-white/50 hover:bg-white hover:border-slate-200 hover:shadow-md"
                                )}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className={clsx(
                                        "p-2 rounded-lg transition-colors",
                                        selectedDoc?.id === doc.id ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50"
                                    )}>
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400">{doc.date}</span>
                                </div>
                                <h4 className="text-sm font-bold text-navy-900 leading-tight mb-1 line-clamp-2 group-hover:text-blue-700 transition-colors">
                                    {doc.title}
                                </h4>
                                <p className="text-xs text-slate-500 line-clamp-2">{doc.summary}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* DOCUMENT VIEWER MODAL (Overlay) */}
            {selectedDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 lg:p-8 bg-slate-900/40 backdrop-blur-sm animate-fade-in text-left">
                    <div className="bg-white w-full max-w-4xl h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden relative animate-fade-in-up">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div>
                                <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    Análisis Generado por IA
                                </p>
                                <h2 className="text-2xl font-display font-bold text-navy-900">{selectedDoc.title}</h2>
                            </div>
                            <div className="flex gap-3">
                                <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all cursor-pointer">
                                    <Download className="w-6 h-6" />
                                </button>
                                <button 
                                    onClick={() => setSelectedDoc(null)}
                                    className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all cursor-pointer"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-10 space-y-10 bg-slate-50/50">
                            
                            {/* Abstract */}
                            <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                                    Abstract
                                </h3>
                                <p className="text-slate-600 leading-relaxed text-lg">
                                    {selectedDoc.summary}
                                </p>
                            </section>

                            {/* Example */}
                            <section className="bg-emerald-50/50 p-8 rounded-3xl border border-emerald-100/50">
                                <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                                    Ejemplo Práctico
                                </h3>
                                <p className="text-emerald-900/80 leading-relaxed text-lg font-medium">
                                    {selectedDoc.example}
                                </p>
                            </section>

                            {/* Execution Steps */}
                            <section>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2 pl-2">
                                    <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                                    Pasos de Ejecución
                                </h3>
                                <div className="grid gap-4">
                                    {selectedDoc.steps.map((step, i) => (
                                        <div key={i} className="flex gap-6 p-6 bg-white rounded-3xl border border-slate-200/60 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:border-blue-200 transition-colors group">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 font-display font-bold text-xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                {i + 1}
                                            </div>
                                            <div className="pt-2">
                                                <p className="text-lg font-medium text-slate-800 leading-snug">{step}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* KPI Footer */}
                            <div className="flex justify-center pt-8 pb-4">
                                <div className="inline-flex items-center gap-3 px-6 py-3 bg-navy-900 text-white rounded-full shadow-xl">
                                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                                    <span className="font-bold tracking-wide">{selectedDoc.kpi}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
