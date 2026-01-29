"use client";

import {
    Link,
    UploadCloud,
    Youtube,
    FileText,
    Image as ImageIcon,
    Loader2,
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { educationService } from "@/lib/education";

export default function IngestInput({ onIngest }: { onIngest?: () => void }) {
    const [url, setUrl] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [isIngesting, setIsIngesting] = useState(false);

    const handleSubmit = async () => {
        if (!url.trim() || isIngesting) return;

        setIsIngesting(true);
        try {
            // Detect type based on URL
            let contentType: string = "video";
            if (url.includes("youtube.com") || url.includes("youtu.be"))
                contentType = "youtube";
            else if (url.includes("tiktok.com")) contentType = "tiktok";
            else if (url.includes("instagram.com")) contentType = "instagram";
            else if (url.endsWith(".pdf")) contentType = "pdf";

            await educationService.ingestContent(url, contentType);
            setUrl("");
            onIngest?.(); // Refresh list
        } catch (error) {
            console.error("Error ingesting content:", error);
            alert("No se pudo procesar el enlace. Intenta de nuevo.");
        } finally {
            setIsIngesting(false);
        }
    };

    return (
        <div
            className={clsx(
                "w-full bg-white rounded-3xl p-1.5 transition-all duration-500 ease-out border",
                isFocused
                    ? "shadow-[0_20px_40px_-10px_rgba(59,130,246,0.15)] border-blue-500/30 scale-[1.01]"
                    : "shadow-xl shadow-slate-200/50 border-white",
            )}
        >
            <div className="relative flex items-center bg-slate-50/50 rounded-[1.2rem] overflow-hidden group">
                <div className="pl-6 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Link className="w-5 h-5" />
                </div>
                <input
                    type="text"
                    value={url}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder="Pega un enlace de YouTube, TikTok o Instagram..."
                    disabled={isIngesting}
                    className="flex-1 w-full min-w-0 bg-transparent px-4 py-5 text-lg font-medium text-navy-900 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
                />

                {/* Right Actions */}
                <div className="pr-2 flex items-center gap-2">
                    <div className="h-8 w-px bg-slate-200 mx-2"></div>
                    <button
                        onClick={handleSubmit}
                        disabled={isIngesting || !url.trim()}
                        className="flex items-center gap-2 px-3 sm:px-6 py-2.5 bg-navy-900 text-white hover:bg-navy-800 disabled:bg-slate-200 disabled:text-slate-400 rounded-xl transition-all shadow-sm hover:shadow-md font-bold text-xs uppercase tracking-wider group/btn"
                    >
                        {isIngesting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <UploadCloud className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        )}
                        <span className="hidden sm:inline">
                            {isIngesting ? "Procesando..." : "Analizar"}
                        </span>
                    </button>
                </div>
            </div>

            {/* Helper Text / Quick Actions */}
            <div
                className={clsx(
                    "px-6 py-3 flex items-center gap-6 text-xs font-semibold text-slate-400 transition-all duration-300",
                    isFocused
                        ? "opacity-100 max-h-12"
                        : "opacity-0 max-h-0 overflow-hidden",
                )}
            >
                <span>Admite:</span>
                <span className="flex items-center gap-1.5">
                    <Youtube className="w-3.5 h-3.5 text-red-500" /> Video
                </span>
                <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-500" /> PDF/Doc
                </span>
                <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-purple-500" /> Imagen
                </span>
            </div>
        </div>
    );
}
