import React from 'react';
import clsx from 'clsx';

interface BrandAtomProps {
  className?: string;
  variant?: 'white' | 'colored';
}

export default function BrandAtom({ className, variant = 'white' }: BrandAtomProps) {
    const isColored = variant === 'colored';
    const gradientId = isColored ? "brandAtomColorGrad" : "brandAtomWhiteGrad";
    const orbitClass = isColored ? "landing-orbit" : "sidebar-orbit";

  return (
      <div className={clsx("relative atom-container", className)}>
         <div className="w-full h-full atom-breathe">
            <svg viewBox="0 0 100 100" className={clsx("w-full h-full overflow-visible", isColored ? "drop-shadow-md" : "")}>
               <defs>
                   {isColored ? (
                        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#2563EB" />
                            <stop offset="100%" stopColor="#4F46E5" />
                        </linearGradient>
                   ) : (
                        <linearGradient id={gradientId} x1="0" y1="0" x2="100" y2="100">
                            <stop offset="0" stopColor="#60A5FA"/>
                            <stop offset="1" stopColor="#FFFFFF"/>
                        </linearGradient>
                   )}
               </defs>
               
               {/* Smooth Spinning Group */}
               <g className="origin-center animate-[spin_12s_linear_infinite]" style={{ transformBox: 'fill-box' }}>
                   <circle cx="50" cy="50" r="42" className={clsx("morph-orbit", orbitClass)} stroke={`url(#${gradientId})`} style={{ transform: 'rotate(0deg) scaleY(0.45)' }} />
                   <circle cx="50" cy="50" r="42" className={clsx("morph-orbit", orbitClass)} stroke={`url(#${gradientId})`} style={{ transform: 'rotate(60deg) scaleY(0.45)' }} />
                   <circle cx="50" cy="50" r="42" className={clsx("morph-orbit", orbitClass)} stroke={`url(#${gradientId})`} style={{ transform: 'rotate(120deg) scaleY(0.45)' }} />
               </g>
               
               {isColored ? (
                   <>
                       <circle cx="50" cy="50" r="10" fill="#3B82F6" className="filter drop-shadow-md" />
                       <circle cx="50" cy="50" r="4" fill="white" />
                   </>
               ) : (
                   <circle cx="50" cy="50" r="10" fill="#FFFFFF"/>
               )}
            </svg>
         </div>
      </div>
  );
}
