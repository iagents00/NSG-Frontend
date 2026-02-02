"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, FileText, CheckCircle2, TrendingUp, Activity, Download, ChevronRight, X, ChevronLeft, Sparkles, Loader2 } from "lucide-react";
import clsx from "clsx";
import BrandAtom from "@/components/ui/BrandAtom";
import { EducationContent, Message, AnalysisDocument } from "@/types/education";
import { useAppStore } from "@/store/useAppStore";
import { educationService } from "@/lib/education";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ContentChatProps {
    item: EducationContent;
    onBack: () => void;
}

export default function ContentChat({ item, onBack }: ContentChatProps) {
    const strategyPreferences = useAppStore(state => state.strategyPreferences);
    const isScripted = item.id === 'brian-tracy-fenix';
    const [mounted, setMounted] = useState(false);

    const [messages, setMessages] = useState<Message[]>(
        isScripted ? [] : [
            {
                id: '1',
                role: 'system',
                content: `Enlace establecido para "${item.title}". Para generar un informe de inteligencia personalizado${strategyPreferences?.entregable ? ` (formato ${strategyPreferences.entregable})` : ''}, solicito coordenadas: ¿Cuál es su desafío operativo actual referente a este objetivo?`,
                type: 'text'
            }
        ]
    );
    const [documents, setDocuments] = useState<AnalysisDocument[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<AnalysisDocument | null>(null);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [loadingText, setLoadingText] = useState("");
    const [scriptStep, setScriptStep] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (scrollContainerRef.current) {
            const { scrollHeight, clientHeight } = scrollContainerRef.current;
            scrollContainerRef.current.scrollTo({
                top: scrollHeight - clientHeight,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        setMounted(true);
        scrollToBottom();
    }, [messages, isTyping, loadingText]);

    // Initial Script Sequence
    useEffect(() => {
        if (isScripted && messages.length === 0) {
            // Step 0: Intro
            const msg1: Message = { id: 's1', role: 'system', content: "¡Hola! Soy NSG Education, tu guía personal para potenciar tu aprendizaje.", type: 'text' };
            setMessages([msg1]);

            // Wait 2s -> Context
            const timeoutId = setTimeout(() => {
                const msg2: Message = { id: 's2', role: 'system', content: "Como tu IA de Inteligencia Profesional, he procesado el video del Seminario Fénix de Brian Tracy (psicología del éxito y potencial humano) cruzándolo con tu perfil de Life Path 1 y tu objetivo de $1.2M en 3 meses.", type: 'text' };
                setMessages(prev => {
                    if (prev.some(m => m.id === 's2')) return prev;
                    return [...prev, msg2];
                });

                // Wait 3s -> Question 1
                setTimeout(() => {
                    const msg3: Message = { id: 's3', role: 'system', content: "Para guiarte mejor, ¿Cuál es la creencia limitante exacta que te impide cerrar el trato con Herve o Duke hoy mismo?", type: 'text' };
                    setMessages(prev => {
                        if (prev.some(m => m.id === 's3')) return prev;
                        return [...prev, msg3];
                    });
                    setScriptStep(1); // User turn
                }, 3000);
            }, 2000);

            return () => clearTimeout(timeoutId);
        }
    }, [isScripted]);

    const handleSend = async (text: string) => {
        if (!text.trim()) return;

        // User Message
        const newMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
        setMessages(prev => [...prev, newMsg]);
        setInput("");
        
        // SCRIPTED LOGIC
        if (isScripted) {
             setIsTyping(true);
             
             if (scriptStep === 1) {
                 // Response to Q1 -> Q2
                 setTimeout(() => {
                     setIsTyping(false);
                     setMessages(prev => [...prev, { id: 's4', role: 'system', content: "Basado en la 'Ley de Correspondencia', si tu mundo exterior es un espejo, ¿qué refleja hoy tu bloqueo de 'scroll' sobre tu liderazgo?", type: 'text' }]);
                     setScriptStep(2);
                 }, 1500);
             } else if (scriptStep === 2) {
                 // Response to Q2 -> Q3
                 setTimeout(() => {
                     setIsTyping(false);
                     setMessages(prev => [...prev, { id: 's5', role: 'system', content: "¿Estás dispuesto a pagar el precio de para que nazca el Iván del $1.2M?", type: 'text' }]);
                     setScriptStep(3);
                 }, 1500);
             } else if (scriptStep === 3) {
                 // Generate Report
                 setLoadingText("Generando tu respuesta personalizada...");
                 
                 setTimeout(() => setLoadingText("Analizando el video de Bryan Tracy a profundidad..."), 2500);
                 setTimeout(() => setLoadingText("Estructurando Plan Operativo NSG..."), 5000);

                 setTimeout(() => {
                     setIsTyping(false);
                     setLoadingText("");

                     const reportDoc: AnalysisDocument = {
                        id: 'report-fenix',
                        title: 'Reporte Ejecutivo: Seminario Fénix (Brian Tracy)',
                        date: new Date().toLocaleDateString(),
                        // Main Blue Section
                        summary: "El éxito en ventas es 80% psicológico. Tu Autoconcepto actúa como un termostato financiero: si te ves como un emprendedor de $30k, nunca retendrás $1.2M. Para NSG, esto significa que tu Oferta Irresistible no venderá por las características técnicas de la IA, sino por la transferencia de tu certeza absoluta (entusiasmo) al cliente. Tú eres la causa; el dinero es el efecto.",
                        // Body Section (Combined)
                        example: `**Verlo Claro (Esquema Pro):**\n\n- **Autoconcepto = Techo de Ingresos:** Tu negocio solo crecerá hasta donde crezca tu imagen propia.\n\n- **Ley de la Sustitución:** La mente solo sostiene un pensamiento a la vez. Sustituye miedo/duda por visión de cierre.\n\n- **Dieta Mental:** Eres lo que consumes. En tu bloque de 9-12 (Deep Work), prohibido el contenido "chatarra" (redes).\n\n**Ejemplos Claros:**\n\n- **Visualización Previa:** Antes de la sesión con Duke, dedica 2 min a "ver" el acuerdo firmado y la transición completada suavemente.\n\n- **Cancelación de Negatividad:** Si piensas "no van a pagar", di inmediatamente "¡Cancela!" y sustitúyelo por: "Nuestra tecnología transforma vidas y vale cada centavo".\n\n- **Actuar "Como Si":** Camina, habla y viste hoy como si ya hubieras cobrado el $1.2M. Eso ajusta tu termostato.`,
                        // Conclusion / Actionables
                        steps: [
                            "Ajuste de Termostato: Escribe tu meta de $1.2M en tiempo presente y léela cada mañana antes del bloque de Deep Work.",
                            "Protocolo Anti-Excusa: Si fallas en el Deep Work, no te justifiques. Aplica el castigo/corrección (Protocolo 24h) inmediatamente.",
                            "Mensajes de Poder: Envía los mensajes a tu equipo para asentar tu liderazgo hoy."
                        ],
                        kpi: "Mentalidad $1.2M"
                     };

                     const reportMsg: Message = { 
                        id: 's6', 
                        role: 'system', 
                        content: "He generado tu reporte de inteligencia estratégica.", 
                        type: 'report', 
                        reportData: reportDoc 
                    };
                    setMessages(prev => [...prev, reportMsg]);
                    setDocuments(prev => [reportDoc, ...prev]);
                    // setSelectedDoc(reportDoc); // Removed auto-open

                    // Follow up question
                    setTimeout(() => {
                        setMessages(prev => [...prev, { id: 's7', role: 'system', content: "¿Hay alguna duda que te frene o estamos listos para ejecutar?", type: 'text' }]);
                    }, 1500);

                    setScriptStep(4);
                }, 7000);
            } else if (scriptStep >= 4) {
                // Post-Report Q&A with 3s delay
                setLoadingText("Generando respuesta...");
                setTimeout(() => {
                    setIsTyping(false);
                    setLoadingText("");
                    let content = "";
                    if (scriptStep === 4) content = "Afirmaciones positivas en tiempo presente repetidas con emoción.";
                    if (scriptStep === 5) content = "El grado en que sientes que controlas tu propio destino (locus de control interno).";
                    if (scriptStep === 6) content = "Porque son vagos; un objetivo debe ser claro, medible y con fecha límite (como tus $1.2M en 90 días).";

                    if (content) {
                       setMessages(prev => [...prev, { id: `post-${scriptStep}`, role: 'system', content, type: 'text' }]);
                       setScriptStep(prev => prev + 1);
                    }
                }, 3000);
            }
            return;
       }

       // STANDARD LOGIC
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

   // Modal Content Wrapper (for Portal)
   const ModalContent = selectedDoc ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 md:p-4 lg:p-8 bg-slate-900/60 backdrop-blur-md animate-fade-in text-left">
            <div className="bg-white w-full max-w-4xl h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden relative animate-fade-in-up border border-white/20">
                {/* Modal Header */}
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10 shrink-0">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                            Análisis Estratégico AI
                        </p>
                        <h2 className="text-2xl font-display font-bold text-navy-900 tracking-tight">{selectedDoc.title}</h2>
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
                <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 bg-slate-50/50 scroll-smooth">
                    
                    {/* Abstract / Main Blue - Slate 900 */}
                    <section className="bg-slate-900 p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-900/20 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
                            Reporte Ejecutivo
                        </h3>
                        <p className="text-white/95 leading-relaxed text-lg md:text-xl font-medium relative z-10">
                            {selectedDoc.summary}
                        </p>
                    </section>

                    {/* Example / Body */}
                    <section>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                            <div className="w-8 h-[2px] bg-slate-900"></div>
                            Análisis Profundo
                        </h3>
                        <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-100 shadow-sm">
                            <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed">
                                <ReactMarkdown 
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        ul: ({children}) => <ul className="list-none space-y-4 my-4 pl-0">{children}</ul>,
                                        li: ({children}) => (
                                            <li className="flex gap-4 items-start relative pl-1 group/item">
                                                <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 group-hover/item:scale-125 transition-transform shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                                <span className="text-slate-700">{children}</span>
                                            </li>
                                        ),
                                        strong: ({children}) => <span className="font-bold text-slate-900">{children}</span>,
                                        p: ({children}) => <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>
                                    }}
                                >
                                    {selectedDoc.example}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </section>

                    {/* Execution Steps / Conclusion */}
                    <section>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-3">
                            <div className="w-8 h-[2px] bg-emerald-500"></div>
                            Protocolo de Acción
                        </h3>
                        <div className="grid gap-6">
                            {selectedDoc.steps.map((step, i) => (
                                <div key={i} className="relative pl-8 md:pl-0 group">
                                    {/* Vertical Line for connection (desktop) */}
                                    {i !== selectedDoc.steps.length - 1 && (
                                        <div className="hidden md:block absolute left-[2.25rem] top-16 bottom-[-24px] w-0.5 bg-slate-100 group-hover:bg-emerald-100 transition-colors"></div>
                                    )}
                                    
                                    <div className="flex flex-col md:flex-row gap-6 items-start">
                                        {/* Number Badge */}
                                        <div className="hidden md:flex flex-col items-center gap-2 shrink-0 w-20 pt-2">
                                             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PASO</div>
                                             <div className="text-3xl font-display font-bold text-emerald-500">0{i + 1}</div>
                                        </div>

                                        {/* Content Card */}
                                        <div className="flex-1 bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all w-full">
                                            <div className="md:hidden text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2">Paso 0{i + 1}</div>
                                            <p className="text-lg font-medium text-slate-800 leading-relaxed max-w-3xl">
                                                {step}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* KPI Footer */}
                    <div className="flex justify-center pt-8 pb-12">
                        <div className="inline-flex items-center gap-3 px-8 py-4 bg-navy-900 text-white rounded-full shadow-2xl hover:scale-105 transition-transform cursor-default">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                            <div className="flex flex-col leading-none">
                                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Impacto Proyectado</span>
                                <span className="font-bold text-lg tracking-wide">{selectedDoc.kpi}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
   ) : null;

   return (
       <div className="flex flex-col lg:flex-row h-full gap-4 md:gap-6">
           {/* Main Chat Area */}
           <div className="flex-1 flex flex-col h-full relative bg-white/50 rounded-3xl md:rounded-[2.5rem] overflow-hidden border border-white/60 shadow-inner backdrop-blur-md transition-all min-h-[50vh] lg:min-h-[500px]">
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
               <div 
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-auto scroll-smooth" 
                    style={{ scrollbarWidth: 'none' }}
                >
                    <div className="min-h-full flex flex-col justify-end p-4 md:p-8">
                        <div className="space-y-6 md:space-y-8 w-full">
                            {messages.map((msg, idx) => (
                                <div
                                    key={msg.id}
                                    className={clsx(
                                        "flex w-full animate-fade-in-up",
                                        msg.role === 'user' ? "justify-end" : "justify-start"
                                    )}
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
                                            {(() => {
                                                let displayContent = msg.content;
                                                if (msg.role === 'system' && typeof displayContent === 'string' && displayContent.trim().startsWith('{')) {
                                                    try {
                                                        const parsed = JSON.parse(displayContent);
                                                        displayContent = parsed.answer || parsed.response || parsed.output || parsed.text || displayContent;
                                                        // Secondary check for nested objects in 'answer'
                                                        if (displayContent && typeof displayContent === 'object') {
                                                            const obj = displayContent as any;
                                                            displayContent = obj.answer || obj.response || obj.text || JSON.stringify(obj);
                                                        }
                                                    } catch {}
                                                }
                                                return <p className="font-medium whitespace-pre-wrap">{displayContent}</p>;
                                            })()}

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
                            <div className="flex justify-start w-full animate-fade-in pl-14 items-center gap-3">
                                    <div className="bg-white/40 backdrop-blur-sm border border-white/30 px-5 py-4 rounded-full rounded-bl-none flex items-center gap-2 shadow-sm">
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                                    </div>
                                    {loadingText && (
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 animate-pulse">{loadingText}</span>
                                    )}
                            </div>
                            )}
                        </div>
                    </div>
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

            {/* Portal Rendering */}
            {mounted && typeof document !== "undefined" && createPortal(ModalContent, document.body)}
        </div>
    );
}
