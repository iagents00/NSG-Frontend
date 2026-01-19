"use client";
import { useToast } from "@/components/ui/ToastProvider";
import RoleGuard from "@/components/RoleGuard";



const COLUMNS = [
  { title: "Scouting", count: 3, color: "blue", items: [{ name: "TechCorp SA", value: "$5M", tag: "SaaS B2B" }, { name: "LogiTrans", value: "$2M", tag: "Logística" }] },
  { title: "Due Diligence", count: 1, color: "orange", items: [{ name: "HealthPlus", value: "$12M", tag: "Salud" }] },
  { title: "Negociación", count: 2, color: "purple", items: [{ name: "FinTech One", value: "$8M", tag: "Finanzas" }] },
  { title: "Cerrado", count: 4, color: "emerald", items: [{ name: "AgroFuture", value: "$3M", tag: "Agro" }] },
];

export default function Strategy() {
  const { showToast } = useToast();

  const colorMap: Record<string, string> = {
    blue: "text-blue-600 bg-blue-50",
    orange: "text-orange-600 bg-orange-50",
    purple: "text-purple-600 bg-purple-50",
    emerald: "text-emerald-600 bg-emerald-50",
  };

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="h-full flex flex-col px-3 xs:px-4 sm:px-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 xs:gap-4 mb-5 xs:mb-6">
          <h3 className="font-display font-bold text-lg xs:text-xl sm:text-2xl text-navy-900">M&A Pipeline</h3>
          <button
            onClick={() => showToast('Formulario nuevo deal abierto', 'info')}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-blue-500 transition shadow-lg cursor-pointer min-h-[44px]"
          >
            + Nuevo Deal
          </button>
        </div>
        <div className="flex-1 overflow-x-auto pb-4 custom-scroll">
          <div className="flex gap-4 xs:gap-5 sm:gap-6 min-w-[280px] xs:min-w-[900px] h-full">
            {COLUMNS.map((col, idx) => (
              <div key={idx} className="w-full xs:w-64 sm:w-72 bg-slate-50/50 rounded-2xl xs:rounded-3xl sm:rounded-4xl p-3 xs:p-4 flex flex-col h-full border border-slate-100">
                <div className="flex justify-between items-center mb-3 xs:mb-4 px-1 xs:px-2">
                  <h4 className="font-bold text-navy-900 text-xs xs:text-sm">{col.title}</h4>
                  <span className={`text-[10px] xs:text-xs font-bold px-2 py-0.5 rounded-full ${colorMap[col.color]}`}>
                    {col.count}
                  </span>
                </div>
                <div className="flex-1 space-y-2.5 xs:space-y-3 overflow-y-auto custom-scroll pr-1">
                  {col.items.map((item, i) => (
                    <div key={i} className="bg-white p-3 xs:p-4 rounded-xl xs:rounded-2xl border border-slate-100 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-1 transition group min-h-[100px]">
                      <div className="flex justify-between mb-2">
                        <span className="text-[0.5rem] xs:text-[0.6rem] font-bold bg-slate-50 text-slate-500 px-1.5 xs:px-2 py-0.5 xs:py-1 rounded uppercase tracking-wider">
                          {item.tag}
                        </span>
                      </div>
                      <h4 className="font-bold text-navy-900 mb-1 text-sm xs:text-base">{item.name}</h4>
                      <p className="text-xs xs:text-sm text-slate-500 font-medium">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
