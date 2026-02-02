"use client";

import React from "react";
import clsx from "clsx";

interface BannerProps {
    badge: string;
    title: string;
    titleSuffix?: string;
    description: string | React.ReactNode;
    onClick?: () => void;
    className?: string;
    glowColor?: string; // Default is blue-600
}

export const Banner: React.FC<BannerProps> = ({
    badge,
    title,
    titleSuffix,
    description,
    onClick,
    className,
    glowColor = "bg-blue-600/10",
}) => {
    return (
        <div
            onClick={onClick}
            className={clsx(
                "relative overflow-hidden bg-[#050814] px-8 py-8 sm:px-12 sm:py-12 rounded-[2.5rem] border border-white/5 shadow-2xl transition-all duration-700 hover:shadow-blue-500/10 mb-6 shrink-0",
                onClick && "cursor-pointer group",
                className,
            )}
        >
            {/* Background glow flare */}
            <div
                className={clsx(
                    "absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] blur-[100px] rounded-full pointer-events-none opacity-60",
                    glowColor,
                )}
            ></div>

            <div className="relative z-10 flex flex-col items-start">
                {/* Styled Badge Box */}
                <div className="flex items-center gap-2.5 mb-5 px-4 py-1.5 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full shadow-inner transition-all group-hover:border-blue-500/30">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.9)] animate-pulse"></div>
                    <span className="text-[9px] font-bold tracking-[0.2em] text-blue-400 uppercase font-mono">
                        {badge}
                    </span>
                </div>

                <h2 className="font-display font-medium text-3xl lg:text-4xl tracking-tighter mb-5 text-white">
                    {title}{" "}
                    {titleSuffix && (
                        <span className="text-slate-600 font-extralight opacity-70 ml-2">
                            {titleSuffix}
                        </span>
                    )}
                </h2>

                {/* Description with Vertical Line */}
                <div className="relative pl-6 border-l-2 border-white/10 max-w-3xl group-hover:border-blue-500/40 transition-all duration-1000">
                    <div className="text-slate-400 text-base sm:text-lg leading-relaxed font-light">
                        {description}
                    </div>
                </div>
            </div>
        </div>
    );
};
