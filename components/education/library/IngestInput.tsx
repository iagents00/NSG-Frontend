"use client";

import { Youtube, FileText, Mic, ArrowRight, Search, X } from "lucide-react";
import { useState, useRef } from "react";
import clsx from "clsx";

interface IngestInputProps {
    onIngest?: (data: {
        url: string;
        document: File | null;
        audio: File | null;
    }) => void;
}

export default function IngestInput({ onIngest }: IngestInputProps) {
    const [url, setUrl] = useState("");
    const [document, setDocument] = useState<File | null>(null);
    const [audio, setAudio] = useState<File | null>(null);
    const [isFocused, setIsFocused] = useState(false);

    const docInputRef = useRef<HTMLInputElement>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);

    // Basic URL validation regex
    const isValidUrl = (string: string) => {
        try {
            const newUrl = new URL(string);
            return newUrl.protocol === "http:" || newUrl.protocol === "https:";
        } catch {
            return false;
        }
    };

    const handleIngest = () => {
        const urlToProcess = url.trim();
        const hasValidUrl = urlToProcess ? isValidUrl(urlToProcess) : false;

        // Validation: Must have at least one valid source
        if (!hasValidUrl && !document && !audio) return;

        // If there's a URL but it's invalid, and no files, don't proceed
        if (urlToProcess && !hasValidUrl && !document && !audio) return;

        onIngest?.({
            url: hasValidUrl ? urlToProcess : "",
            document,
            audio,
        });

        // Reset state after ingest
        setUrl("");
        setDocument(null);
        setAudio(null);
    };

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: "doc" | "audio",
    ) => {
        const file = e.target.files?.[0] || null;
        if (type === "doc") setDocument(file);
        else setAudio(file);

        // Reset input value so same file can be selected again if removed
        e.target.value = "";
    };

    const hasAnyInput =
        (url.trim() && isValidUrl(url.trim())) || document || audio;

    return (
        <div className="w-full flex flex-col gap-4 group/ingest">
            {/* Input Container */}
            <div
                className={clsx(
                    "w-full bg-white rounded-[2rem] p-2 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] border relative",
                    isFocused
                        ? "shadow-[0_20px_60px_-15px_rgba(30,58,138,0.1)] border-navy-900/10 scale-[1.005]"
                        : "shadow-sm border-slate-100",
                )}
            >
                <div className="relative flex flex-col bg-slate-50/40 rounded-[1.6rem] overflow-hidden transition-colors duration-300 group-focus-within:bg-white">
                    {/* Selected Files Preview (Appears if files are selected) */}
                    {(document || audio) && (
                        <div className="px-6 pt-4 flex flex-wrap gap-2 animate-fade-in">
                            {document && (
                                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-100">
                                    <FileText className="w-3.5 h-3.5" />
                                    <span className="truncate max-w-[150px]">
                                        {document.name}
                                    </span>
                                    <button
                                        onClick={() => setDocument(null)}
                                        className="hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                            {audio && (
                                <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-xs font-bold border border-amber-100">
                                    <Mic className="w-3.5 h-3.5" />
                                    <span className="truncate max-w-[150px]">
                                        {audio.name}
                                    </span>
                                    <button
                                        onClick={() => setAudio(null)}
                                        className="hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="relative flex items-center w-full">
                        {/* Icon Indicator */}
                        <div className="pl-6 text-slate-400 group-focus-within:text-navy-900 transition-all duration-300 group-focus-within:scale-110">
                            <Search className="w-5 h-5" />
                        </div>

                        <input
                            type="text"
                            value={url}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Enter" && handleIngest()
                            }
                            placeholder="Pega un enlace de YouTube, Instagram, TikTok o URL válida..."
                            className="flex-1 w-full min-w-0 bg-transparent px-5 py-5 text-[17px] font-medium text-navy-950 placeholder:text-slate-400 focus:outline-none"
                        />

                        {/* Right Actions */}
                        <div className="pr-2 flex items-center gap-2">
                            <button
                                onClick={handleIngest}
                                disabled={!hasAnyInput}
                                className={clsx(
                                    "flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-500 font-bold text-sm shadow-lg cursor-pointer group/btn overflow-hidden relative",
                                    hasAnyInput
                                        ? "bg-navy-950 text-white shadow-navy-900/20 hover:scale-105 active:scale-95 translate-x-0"
                                        : "bg-slate-100 text-slate-400 shadow-none translate-x-1 opacity-50",
                                )}
                            >
                                <span className="relative z-10">Procesar</span>
                                <ArrowRight className="w-4 h-4 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Floating Glow (Subtle) */}
                {isFocused && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/5 via-navy-500/5 to-amber-500/5 blur-2xl -z-10 rounded-[2rem] animate-pulse" />
                )}
            </div>

            {/* Hidden Inputs */}
            <input
                type="file"
                ref={docInputRef}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => handleFileChange(e, "doc")}
            />
            <input
                type="file"
                ref={audioInputRef}
                className="hidden"
                accept="audio/*"
                onChange={(e) => handleFileChange(e, "audio")}
            />

            {/* Formats / Selectors */}
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 px-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] mr-2">
                    Límites: 1 URL · 1 DOC · 1 AUDIO
                </span>

                <button
                    onClick={() => setUrl("")}
                    className={clsx(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border",
                        url && isValidUrl(url)
                            ? "bg-red-50 border-red-100 text-red-600"
                            : "bg-slate-50 border-slate-100 text-slate-500 opacity-60",
                    )}
                >
                    <Youtube className="w-3.5 h-3.5" />
                    Video URL
                </button>

                <button
                    onClick={() => docInputRef.current?.click()}
                    className={clsx(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border cursor-pointer",
                        document
                            ? "bg-blue-600 border-blue-700 text-white shadow-sm"
                            : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-white hover:border-slate-200",
                    )}
                >
                    <FileText className="w-3.5 h-3.5" />
                    {document ? "Doc Listo" : "Documento"}
                </button>

                <button
                    onClick={() => audioInputRef.current?.click()}
                    className={clsx(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border cursor-pointer",
                        audio
                            ? "bg-amber-500 border-amber-600 text-white shadow-sm"
                            : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-white hover:border-slate-200",
                    )}
                >
                    <Mic className="w-3.5 h-3.5" />
                    {audio ? "Audio Listo" : "Audio"}
                </button>

                <div className="h-4 w-px bg-slate-100 hidden md:block" />

                <div className="text-[11px] font-bold text-slate-400 italic">
                    {hasAnyInput
                        ? "Recurso detectado ✅"
                        : "Esperando entrada..."}
                </div>
            </div>
        </div>
    );
}
