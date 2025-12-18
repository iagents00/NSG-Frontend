'use client'; // Required for interactivity (onClick)

import Link from "next/link"
import { 
  ShieldCheck, 
  Check, 
  Briefcase, 
  ArrowRight, 
  Brain, 
  Building2, 
  HeartPulse 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

export default function LandingPage() {
  const router = useRouter();
  const { setRole } = useAppStore();

  // Logic for the profile selection buttons
  const selectProfile = (profile: string) => {
    console.log(`Profile selected: ${profile}`);
    // Redirect to Auth page with selected role
    router.push(`/auth/login?role=${profile}`);
  };

  return (
    /* VIEW 1: LANDING PAGE */
    <div id="view-landing" className="absolute inset-0 z-[60] flex flex-col min-h-[100dvh] bg-white custom-scroll w-full h-full">
        
        {/* BACKGROUND AMBIENCE */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/40 via-white to-white pointer-events-none"></div>
        <div className="fixed top-[-20%] right-[-10%] w-[90vw] h-[90vw] bg-indigo-50/30 rounded-full blur-[150px] pointer-events-none animate-pulse-slow"></div>

        {/* TOP LEFT BRAND MARK */}
        <div className="absolute top-6 left-6 md:top-8 md:left-10 z-50 flex items-center gap-4 opacity-100 cursor-default flex-nowrap min-w-max pointer-events-auto">
            <div className="w-10 h-10 relative shrink-0 atom-container">
                <div className="w-full h-full atom-breathe">
                    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-md">
                        <defs>
                            <linearGradient id="brandAtomGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#2563EB" />
                                <stop offset="100%" stopColor="#4F46E5" />
                            </linearGradient>
                        </defs>
                        <circle cx="50" cy="50" r="42" className="morph-orbit orbit-1 landing-orbit" stroke="url(#brandAtomGrad)" />
                        <circle cx="50" cy="50" r="42" className="morph-orbit orbit-2 landing-orbit" stroke="url(#brandAtomGrad)" style={{ transform: 'rotate(60deg) scaleY(0.45)' }} />
                        <circle cx="50" cy="50" r="42" className="morph-orbit orbit-3 landing-orbit" stroke="url(#brandAtomGrad)" style={{ transform: 'rotate(120deg) scaleY(0.45)' }} />
                        <circle cx="50" cy="50" r="10" fill="#3B82F6" className="filter drop-shadow-md" />
                        <circle cx="50" cy="50" r="4" fill="white" />
                    </svg>
                </div>
            </div>
            <div className="flex items-center shrink-0 h-10">
                <span className="text-base font-display font-bold text-navy-950 tracking-tight leading-none whitespace-nowrap drop-shadow-sm">NSG Intelligence</span>
            </div>
        </div>

        {/* MAIN CONTENT CONTAINER - Reduced top padding from pt-32 to pt-24 */}
        <div className="flex-1 flex flex-col items-center justify-start pt-14 lg:pt-20 pb-20 relative z-10 w-full max-w-5xl lg:max-w-6xl mx-auto px-6 lg:px-12 safe-bottom-scroll">
            
            {/* 1. IDENTITY SECTION */}
            <div className="w-full text-center flex flex-col items-center animate-fade-in-up">
                
                {/* LANDING ATOM - Significantly increased size */}
                <div className="w-56 h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 mb-8 lg:mb-10 relative atom-container">
                    <div className="absolute inset-0 bg-blue-600/5 blur-[100px] rounded-full scale-125 animate-pulse-slow"></div>
                    <div className="w-full h-full atom-breathe">
                        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-2xl">
                            <defs>
                                <linearGradient id="landingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#2563EB" />
                                    <stop offset="100%" stopColor="#6366f1" />
                                </linearGradient>
                                <radialGradient id="coreLanding" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor="#FFFFFF" />
                                    <stop offset="100%" stopColor="#3B82F6" />
                                </radialGradient>
                            </defs>
                            <circle cx="50" cy="50" r="45" className="morph-orbit orbit-1 landing-orbit" stroke="url(#landingGrad)" />
                            <circle cx="50" cy="50" r="45" className="morph-orbit orbit-2 landing-orbit" stroke="url(#landingGrad)" style={{ transform: 'rotate(60deg) scaleY(0.45)' }} />
                            <circle cx="50" cy="50" r="45" className="morph-orbit orbit-3 landing-orbit" stroke="url(#landingGrad)" style={{ transform: 'rotate(120deg) scaleY(0.45)' }} />
                            <circle cx="50" cy="50" r="10" fill="url(#coreLanding)" className="filter drop-shadow-lg" />
                            <circle cx="50" cy="50" r="3" fill="white" opacity="0.8" />
                        </svg>
                    </div>
                </div>

                {/* PRECISE COPY - Strengthened Title */}
                <div className="space-y-6 lg:space-y-6 max-w-3xl lg:max-w-4xl mx-auto">
                    <p className="text-[0.65rem] md:text-xs lg:text-xs font-bold text-slate-400 tracking-[0.3em] uppercase pl-1">NSG SYSTEM OS • Enterprise</p>
                    <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-navy-950 leading-[1.05] drop-shadow-sm">
                        Infraestructura cognitiva <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">de precisión.</span>
                    </h1>
                    <div className="relative pl-6 border-l-4 border-blue-100 text-left mx-auto max-w-md md:max-w-lg lg:max-w-xl mt-6 lg:mt-8">
                        <p className="text-lg md:text-xl lg:text-xl text-slate-600 font-medium leading-relaxed italic">
                            &quot;Transformamos datos clínicos y corporativos en estrategias inteligentes.&quot;
                        </p>
                    </div>
                </div>
                
                {/* CERTIFICATE */}
                <div className="mt-12 lg:mt-16 w-full max-w-lg lg:max-w-xl mx-auto transform transition-all hover:scale-[1.02] duration-500">
                    <div className="bg-white/95 backdrop-blur-xl border border-slate-200/80 p-1 rounded-2xl shadow-sovereign w-full text-left">
                        <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl p-5 sm:p-6 lg:p-8 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                            <div className="relative shrink-0">
                                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-navy-900 to-blue-900 flex items-center justify-center shadow-lg shadow-navy-900/20">
                                    <ShieldCheck className="w-7 h-7 lg:w-8 lg:h-8 text-white stroke-[1.5]" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[0.4rem] lg:text-[0.5rem] font-bold px-1.5 py-0.5 rounded-full border-2 border-white flex items-center gap-0.5 shadow-sm">
                                    <Check className="w-2 h-2" /> ISO
                                </div>
                            </div>
                            <div className="text-center sm:text-left flex-1">
                                <p className="text-[0.55rem] lg:text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 inline-block mb-1">Officially Verified</p>
                                <h3 className="text-sm lg:text-base text-navy-900 font-medium leading-tight mb-2">Verified by <span className="font-display font-bold text-navy-950">New Strategy Group</span></h3>
                                <div className="flex gap-6 justify-center sm:justify-start pt-3 border-t border-slate-100">
                                    <div className="text-center sm:text-left"><p className="text-lg lg:text-xl font-display font-bold text-blue-600 leading-none">1,000+</p><p className="text-[0.5rem] lg:text-[0.6rem] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Conversaciones</p></div>
                                    <div className="text-center sm:text-left border-l border-slate-100 pl-6"><p className="text-lg lg:text-xl font-display font-bold text-indigo-600 leading-none">100+</p><p className="text-[0.5rem] lg:text-[0.6rem] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Reseñas Positivas</p></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* 2. ROLE SELECTION */}
            <div className="w-full animate-fade-in-up mt-16 lg:mt-24" style={{ animationDelay: '0.15s' }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6 w-full">
                    {/* Consultor */}
                    <button onClick={() => selectProfile('consultant')} className="group bg-white p-6 lg:p-8 rounded-[2rem] text-left border border-slate-100 hover:border-blue-200 hover:shadow-precision transition-all duration-500 transform hover:-translate-y-1 cursor-pointer">
                        <div className="flex justify-between mb-5 lg:mb-6">
                            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-slate-50 text-navy-950 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:text-blue-600 group-hover:bg-blue-50">
                                <Briefcase className="w-6 h-6 lg:w-7 lg:h-7" />
                            </div>
                            <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 text-slate-300 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
                        </div>
                        <h3 className="font-display font-bold text-lg lg:text-xl text-navy-900">Consultor</h3>
                        <p className="text-xs lg:text-sm text-slate-500 mt-1 font-medium">Gestión de Activos & Data Strategy</p>
                    </button>

                    {/* Psicologo */}
                    <button onClick={() => selectProfile('psychologist')} className="group bg-white p-6 lg:p-8 rounded-[2rem] text-left border border-slate-100 hover:border-sky-200 hover:shadow-precision transition-all duration-500 transform hover:-translate-y-1 cursor-pointer">
                        <div className="flex justify-between mb-5 lg:mb-6">
                            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-slate-50 text-navy-950 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:text-sky-600 group-hover:bg-sky-50">
                                <Brain className="w-6 h-6 lg:w-7 lg:h-7" />
                            </div>
                            <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 text-slate-300 group-hover:text-sky-600 transition-transform group-hover:translate-x-1" />
                        </div>
                        <h3 className="font-display font-bold text-lg lg:text-xl text-navy-900">Psicólogo</h3>
                        <p className="text-xs lg:text-sm text-slate-500 mt-1 font-medium">Clínica & Análisis de Conducta</p>
                    </button>

                    {/* Directivo */}
                    <button onClick={() => selectProfile('manager')} className="group bg-white p-6 lg:p-8 rounded-[2rem] text-left border border-slate-100 hover:border-emerald-200 hover:shadow-precision transition-all duration-500 transform hover:-translate-y-1 cursor-pointer">
                        <div className="flex justify-between mb-5 lg:mb-6">
                            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-slate-50 text-navy-950 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:text-emerald-600 group-hover:bg-emerald-50">
                                <Building2 className="w-6 h-6 lg:w-7 lg:h-7" />
                            </div>
                            <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 text-slate-300 group-hover:text-emerald-600 transition-transform group-hover:translate-x-1" />
                        </div>
                        <h3 className="font-display font-bold text-lg lg:text-xl text-navy-900">CEO / Directivo</h3>
                        <p className="text-xs lg:text-sm text-slate-500 mt-1 font-medium">Inteligencia de Datos & KPIs</p>
                    </button>

                    {/* Paciente */}
                    <button onClick={() => selectProfile('patient')} className="group bg-white p-6 lg:p-8 rounded-[2rem] text-left border border-slate-100 hover:border-teal-200 hover:shadow-precision transition-all duration-500 transform hover:-translate-y-1 cursor-pointer">
                        <div className="flex justify-between mb-5 lg:mb-6">
                            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-slate-50 text-navy-950 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:text-teal-600 group-hover:bg-teal-50">
                                <HeartPulse className="w-6 h-6 lg:w-7 lg:h-7" />
                            </div>
                            <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 text-slate-300 group-hover:text-teal-600 transition-transform group-hover:translate-x-1" />
                        </div>
                        <h3 className="font-display font-bold text-lg lg:text-xl text-navy-900">Paciente</h3>
                        <p className="text-xs lg:text-sm text-slate-500 mt-1 font-medium">Bienestar Integral & Tracking</p>
                    </button>
                </div>
            </div>

             {/* FOOTER */}
            <div className="mt-20 lg:mt-24 w-full pt-10 pb-8 text-center flex flex-col items-center gap-6 border-t border-slate-100/50">
                <div><p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">&copy; 2024 NSG Intelligence. All rights reserved.</p></div>
                <div className="flex items-center gap-6 text-[0.7rem] font-bold text-slate-500">
                    <span className="hover:text-blue-600 cursor-pointer transition">Privacy Policy</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="hover:text-blue-600 cursor-pointer transition">Terms of Service</span>
                </div>
            </div>
        </div>
    </div>
  );
}
