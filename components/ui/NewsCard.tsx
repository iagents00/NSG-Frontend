import { ArrowRight, Clock, ShieldCheck } from "lucide-react";

interface NewsCardProps {
  source: string;
  title: string;
  tag: string;
  color: string;
  description: string;
  time: string;
  onAnalyze: (title: string, tag: string) => void;
}

export function NewsCard({ source, title, tag, color, description, time, onAnalyze }: NewsCardProps) {
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
      onClick={() => onAnalyze(title, tag)}
      className="group relative bg-white rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden flex flex-col h-auto"
    >
      <div className={`w-1 h-full absolute left-0 top-0 z-20 ${accentColor[color] || accentColor['blue']} opacity-70`}></div>

      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between relative">
        <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-500">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg">
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.15em]">{source}</span>
            <div className="h-0.5 w-0.5 rounded-full bg-slate-200"></div>
            <span className={`text-[0.6rem] font-bold px-3 py-1 rounded-md border ${colorMap[color] || colorMap['blue']}`}>
              {tag}
            </span>
          </div>

          <h4 className="font-display font-bold text-xl md:text-2xl text-navy-900 mb-2 group-hover:text-blue-700 transition-colors leading-[1.3]">
            {title}
          </h4>

          <p className="text-slate-500 text-sm md:text-base leading-relaxed line-clamp-2 md:line-clamp-2 pr-12">
            {description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
          <div className="flex items-center gap-2 text-[0.65rem] font-bold text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{time}</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAnalyze(title, tag);
            }}
            className="px-5 py-2.5 bg-blue-50 text-blue-600 rounded-lg text-[0.65rem] font-bold uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all duration-300"
          >
            Análisis Estratégico
          </button>
        </div>
      </div>
    </div>
  );
}