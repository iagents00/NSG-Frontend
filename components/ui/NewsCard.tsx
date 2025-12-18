import { ArrowRight, Clock } from "lucide-react";

interface NewsCardProps {
  source: string;
  title: string;
  tag: string;
  color: string; // "blue", "purple", etc.
  description: string;
  time: string;
  onAnalyze: (title: string, tag: string) => void;
}

export function NewsCard({ source, title, tag, color, description, time, onAnalyze }: NewsCardProps) {
  // Map color names to Tailwind classes dynamically or use a lookup object
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    sky: "bg-sky-50 text-sky-600 border-sky-100",
  };

  return (
    <div 
      onClick={() => onAnalyze(title, tag)}
      className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-card hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-2 duration-500 group hover:scale-[1.01] relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/50 transition-colors duration-500"></div>
      <div className="relative z-10">
        <div className="flex justify-between mb-4">
          <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">{source}</span>
          <span className={`text-[0.6rem] font-bold px-3 py-1 rounded-full border group-hover:scale-105 transition-transform ${colorMap[color] || colorMap['blue']}`}>
            {tag}
          </span>
        </div>
        <h4 className="font-display font-bold text-xl text-navy-900 mb-3 leading-tight group-hover:text-blue-700 transition">{title}</h4>
        <p className="text-sm text-slate-500 line-clamp-2 mb-6 leading-relaxed">{description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <Clock className="w-4 h-4" /> {time}
          </div>
          <div className="text-blue-600 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 transform translate-x-2 group-hover:translate-x-0 duration-300">
             Analizar <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
}