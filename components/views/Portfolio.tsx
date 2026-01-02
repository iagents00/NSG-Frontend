"use client";

export default function Portfolio() {
  return (
    <div className="h-full flex flex-col animate-fade-in-up pb-10">
      <h3 className="font-display font-bold text-2xl text-navy-900 mb-6">Cartera de Activos</h3>
      <div className="bg-white rounded-[2rem] shadow-card border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
              <tr>
                <th className="p-6">Activo</th>
                <th className="p-6">Sector</th>
                <th className="p-6">Participación</th>
                <th className="p-6">Valor Actual</th>
                <th className="p-6">Rendimiento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <PortfolioRow name="TechGlobal" sector="Tecnología" share="15%" val="$1.2M" perf="+12%" />
              <PortfolioRow name="GreenEnergy" sector="Energía" share="25%" val="$800k" perf="+5%" />
              <PortfolioRow name="UrbanReal" sector="Inmobiliario" share="100%" val="$2.2M" perf="+8%" />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface PortfolioRowProps {
  name: string;
  sector: string;
  share: string;
  val: string;
  perf: string;
}

function PortfolioRow({ name, sector, share, val, perf }: PortfolioRowProps) {
  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition group">
      <td className="p-6 font-bold text-navy-900">{name}</td>
      <td className="p-6 text-slate-500">{sector}</td>
      <td className="p-6 text-slate-500">{share}</td>
      <td className="p-6 font-bold text-navy-900">{val}</td>
      <td className="p-6 font-bold text-emerald-500">{perf}</td>
    </tr>
  );
}
