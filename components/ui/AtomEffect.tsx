import React from 'react';
import clsx from 'clsx';

interface AtomEffectProps {
  className?: string;
}

export default function AtomEffect({ className }: AtomEffectProps) {
  return (
      <div className={clsx("relative atom-container", className)}>
        {/* Glow Background */}
        <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full scale-150"></div>
        
        {/* Spinning Atom */}
        <div className="w-full h-full animate-spin-process">
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-md">
            <defs>
              <linearGradient id="processGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#60A5FA" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="42" className="morph-orbit" stroke="url(#processGrad)" strokeWidth="2" fill="none" />
            <circle cx="50" cy="50" r="42" className="morph-orbit" stroke="url(#processGrad)" strokeWidth="2" fill="none" style={{ transform: 'rotate(60deg) scaleY(0.45)' }} />
            <circle cx="50" cy="50" r="42" className="morph-orbit" stroke="url(#processGrad)" strokeWidth="2" fill="none" style={{ transform: 'rotate(120deg) scaleY(0.45)' }} />
            <circle cx="50" cy="50" r="8" fill="#3B82F6" />
          </svg>
        </div>
      </div>
  );
}
