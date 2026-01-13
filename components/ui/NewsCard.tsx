import { ArrowRight, Clock, Sparkles } from "lucide-react";

interface NewsCardProps {
  source: string;
  title: string;
  tag: string;
  color: string;
  description: string;
  time: string;
  isAnalyzed?: boolean;
  onAnalyze: () => void;
}

export function NewsCard({ source, title, tag, color, description, time, isAnalyzed, onAnalyze }: NewsCardProps) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    sky: "bg-sky-50 text-sky-600 border-sky-100",
  };

  const accentColor: Record<string, string> = {
    blue: "bg-blue-600",
    purple: "bg-purple-600",
    emerald: "bg-emerald-600",
    orange: "bg-orange-600",
    sky: "bg-sky-600",
  };

  return (
    <div
      onClick={onAnalyze}
      className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-500 cursor-pointer overflow-hidden flex flex-col"
    >
      <div className={`w-1 h-full absolute left-0 top-0 z-20 ${accentColor[color] || accentColor['blue']} opacity-50`}></div>

      <div className="p-4 md:p-5 flex flex-col relative">
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">{source}</span>
            <div className="h-0.5 w-0.5 rounded-full bg-slate-200"></div>
            <span className={`text-[0.55rem] font-bold px-2 py-0.5 rounded-md border ${colorMap[color] || colorMap['blue']}`}>
              {tag}
            </span>
          </div>
          
          {isAnalyzed && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full animate-in fade-in zoom-in-95 duration-500">
              <Sparkles className="w-3 h-3 text-emerald-600 fill-emerald-600" />
              <span className="text-[0.6rem] font-bold text-emerald-700 uppercase tracking-wider">Analizado</span>
            </div>
          )}
        </div>

        <h4 className="font-display font-bold text-lg md:text-xl text-navy-900 mb-2 group-hover:text-blue-700 transition-colors leading-snug">
          {title}
        </h4>

        <p className="text-slate-500 text-xs md:text-sm leading-relaxed line-clamp-2 pr-10">
          {description}
        </p>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
          <div className="flex items-center gap-2 text-[0.6rem] font-bold text-slate-400">
            <Clock className="w-3 h-3" />
            <span>{time}</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAnalyze();
            }}
            className={`px-4 py-1.5 rounded-lg text-[0.6rem] font-bold uppercase tracking-widest transition-all duration-300 ${
              isAnalyzed 
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20" 
                : "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
            }`}
          >
            {isAnalyzed ? "Ver Análisis" : "Solicitar Análisis"}
          </button>
        </div>
      </div>
    </div>
  );
}
