"use client";

import { Link, UploadCloud, Youtube, FileText, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

export default function IngestInput() {
    const [url, setUrl] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className={clsx(
            "w-full bg-white rounded-3xl p-1.5 transition-all duration-500 ease-out border",
            isFocused 
                ? "shadow-[0_20px_40px_-10px_rgba(59,130,246,0.15)] border-blue-500/30 scale-[1.01]" 
                : "shadow-xl shadow-slate-200/50 border-white"
        )}>
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
                    placeholder="Pega un enlace de YouTube, TikTok o Instagram..."
                    className="w-full bg-transparent px-4 py-5 text-lg font-medium text-navy-900 placeholder:text-slate-400 focus:outline-none"
                />
                
                {/* Right Actions */}
                <div className="pr-2 flex items-center gap-2">
                     <div className="h-8 w-px bg-slate-200 mx-2"></div>
                     <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-blue-200 text-slate-600 hover:text-blue-600 rounded-xl transition-all shadow-sm hover:shadow-md font-bold text-xs uppercase tracking-wider group/btn">
                        <UploadCloud className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        Subir
                     </button>
                </div>
            </div>
            
            {/* Helper Text / Quick Actions */}
            <div className={clsx(
                "px-6 py-3 flex items-center gap-6 text-xs font-semibold text-slate-400 transition-all duration-300",
                isFocused ? "opacity-100 max-h-12" : "opacity-0 max-h-0 overflow-hidden"
            )}>
                <span>Admite:</span>
                <span className="flex items-center gap-1.5"><Youtube className="w-3.5 h-3.5 text-red-500" /> Video</span>
                <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-blue-500" /> PDF/Doc</span>
                <span className="flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5 text-purple-500" /> Imagen</span>
            </div>
        </div>
    )
}
