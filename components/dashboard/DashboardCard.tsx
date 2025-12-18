"use client";

import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  children?: ReactNode;
  className?: string;
  glassmorphism?: boolean;
  neonBorder?: boolean;
}

export default function DashboardCard({
  title,
  subtitle,
  icon: Icon,
  iconColor = "text-blue-600",
  iconBg = "bg-blue-50",
  children,
  className = "",
  glassmorphism = false,
  neonBorder = false,
}: DashboardCardProps) {
  const baseClasses = glassmorphism
    ? "bg-white/60 backdrop-blur-xl border border-white/40 shadow-glass"
    : "bg-white border border-slate-100 shadow-sm";

  const borderClasses = neonBorder
    ? "ring-1 ring-blue-500/20 border-blue-200 shadow-glow"
    : "";

  return (
    <div
      className={`rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 will-change-transform ${baseClasses} ${borderClasses} ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-display font-bold text-lg text-navy-900 mb-1">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={`w-12 h-12 ${iconBg} ${iconColor} rounded-xl flex items-center justify-center shrink-0 ml-4 transition-transform hover:scale-110 will-change-transform`}
          >
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* Content */}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
