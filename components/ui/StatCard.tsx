import { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  colorClass: string; // e.g., "text-blue-600"
  bgClass: string;    // e.g., "bg-white"
  borderClass?: string; // Optional for the red alert card
}

export function StatCard({ title, value, icon: Icon, colorClass, bgClass, borderClass }: StatCardProps) {
  return (
      <div className={clsx(
        bgClass, 
        borderClass || "border border-slate-100",
        "p-8 rounded-[2.5rem] shadow-card flex flex-col justify-between h-48 transition-all duration-500 hover:shadow-xl cursor-default hover:scale-[1.02] group"
      )}>
        <div className="flex justify-between">
          <p className="text-[0.65rem] font-bold uppercase tracking-widest opacity-60 text-slate-500">{title}</p>
          <Icon className="w-6 h-6 opacity-50 group-hover:scale-110 transition-transform duration-300 text-slate-400" />
        </div>
        <p className={clsx("text-4xl font-display font-extrabold", colorClass)}>
          {value}
        </p>
      </div>
    );
}