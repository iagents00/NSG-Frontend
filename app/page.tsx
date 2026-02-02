"use client";

import { ArrowRight, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import BrandAtom from "@/components/ui/BrandAtom";
import AnimatedCounter from "@/components/ui/AnimatedCounter"; // Animated Counter Component

export default function LandingPage() {
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white overflow-x-hidden">
            {/* NAVIGATION */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-18">
                        {/* Logo */}
                        <div
                            className="flex items-center gap-2.5 cursor-pointer"
                            onClick={() => router.push("/")}
                        >
                            <span className="text-base sm:text-lg font-bold text-navy-950 tracking-tight">
                                BS Intelligence
                            </span>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-6">
                            <a
                                href="#features"
                                className="text-sm font-medium text-slate-600 hover:text-navy-950 transition-colors"
                            >
                                Funcionalidades
                            </a>
                            <a
                                href="#about"
                                className="text-sm font-medium text-slate-600 hover:text-navy-950 transition-colors"
                            >
                                Nosotros
                            </a>
                            <Link
                                href="/privacy"
                                className="text-sm font-medium text-slate-600 hover:text-navy-950 transition-colors"
                            >
                                Privacidad
                            </Link>
                            <Link
                                href="/auth/login"
                                className="px-5 py-2 text-sm font-medium text-slate-600 hover:text-navy-950 hover:bg-slate-50 rounded-full transition-all duration-300"
                            >
                                Iniciar Sesión
                            </Link>
                            <Link
                                href="/auth/register"
                                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-full shadow-lg shadow-blue-600/30 hover:bg-blue-500 hover:shadow-blue-600/50 hover:-translate-y-0.5 transition-all duration-300 ring-2 ring-transparent hover:ring-blue-200"
                            >
                                Empezar
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-slate-600 hover:text-navy-950"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <Menu className="w-5 h-5" />
                            )}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-2xl border-b border-slate-200/60 shadow-2xl p-6 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
                            <a
                                href="#features"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-base font-medium text-slate-600 hover:text-navy-950 py-1"
                            >
                                Funcionalidades
                            </a>
                            <a
                                href="#about"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-base font-medium text-slate-600 hover:text-navy-950 py-1"
                            >
                                Nosotros
                            </a>
                            <Link
                                href="/privacy"
                                className="text-base font-medium text-slate-600 hover:text-navy-950 py-1"
                            >
                                Privacidad
                            </Link>

                            <div className="h-px bg-slate-100 w-full my-2"></div>

                            <div className="flex flex-col gap-3">
                                <Link
                                    href="/auth/login"
                                    className="w-full text-center px-5 py-3 text-sm font-bold text-slate-600 hover:text-navy-950 hover:bg-slate-50 rounded-full transition-all duration-300 border border-transparent hover:border-slate-200"
                                >
                                    Iniciar Sesión
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="w-full text-center px-6 py-3.5 bg-blue-600 text-white text-sm font-bold rounded-full shadow-lg shadow-blue-600/30 hover:bg-blue-500 hover:shadow-blue-600/50 transition-all duration-300"
                                >
                                    Empezar
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* HERO SECTION */}
            <section className="relative pt-24 sm:pt-28 pb-12 sm:pb-16 px-4">
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                    <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px]"></div>
                </div>

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    {/* Animated Atom */}
                    <div className="flex justify-center mb-8">
                        <BrandAtom
                            variant="colored"
                            className="w-32 h-32 sm:w-40 sm:h-40"
                        />
                    </div>

                    {/* Headline */}
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">
                                NSG System OS • Enterprise
                            </span>
                        </div>

                        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-navy-950 leading-[1.1] max-w-4xl mx-auto">
                            Sistema personalizado
                            <br />
                            <span className="text-blue-600">
                                de inteligencia profesional.
                            </span>
                        </h1>

                        <div className="flex justify-center py-4">
                            <div className="border-l-4 border-blue-200 pl-6 text-left max-w-xl">
                                <p className="text-lg sm:text-xl text-slate-500 italic font-medium leading-relaxed">
                                    "Transformamos datos clínicos y corporativos
                                    en estrategias inteligentes."
                                </p>
                            </div>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                            <Link
                                href="/auth/register"
                                className="relative overflow-hidden w-full sm:w-auto px-8 py-3.5 bg-navy-950 text-white font-bold rounded-xl shadow-xl shadow-navy-900/20 hover:shadow-blue-900/40 flex items-center justify-center gap-2 group transition-all duration-300 hover:-translate-y-1"
                            >
                                <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
                                <span className="relative z-10 flex items-center gap-2">
                                    Empieza Hoy
                                    <ArrowRight className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Link>
                            <a
                                href="#features"
                                className="w-full sm:w-auto px-8 py-3.5 bg-white border-2 border-slate-200 text-navy-950 font-bold rounded-xl hover:border-slate-300 transition-all"
                            >
                                Más Información
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3 MAIN FEATURES */}
            <section id="features" className="py-12 sm:py-16 px-4 bg-slate-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl sm:text-4xl font-display font-bold text-navy-950 mb-2">
                            Qué hace BS Intelligence
                        </h2>
                        <p className="text-sm sm:text-base text-slate-600">
                            Tres herramientas poderosas para transformar tu
                            flujo de trabajo
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* NSG Copilot */}
                        <div className="group relative bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-[0_2px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.06)] transition-all duration-700 hover:-translate-y-1 overflow-hidden flex flex-col justify-between h-full">
                            <div className="absolute inset-0 bg-linear-to-b from-slate-50/0 via-slate-50/0 to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                            <div className="relative z-10">
                                <h3 className="text-4xl sm:text-5xl font-display font-medium text-slate-900 mb-6 tracking-tighter group-hover:text-blue-600 transition-colors duration-500">
                                    Copilot.
                                </h3>

                                <p className="text-lg text-slate-500 leading-relaxed font-normal max-w-sm">
                                    Protocolos diarios alineados con tu
                                    estrategia. Ejecución precisa, cada día.
                                </p>
                            </div>

                            <div className="relative z-10 mt-12 flex items-center gap-3">
                                <div className="h-px w-8 bg-slate-200 group-hover:bg-blue-300 transition-colors duration-500"></div>
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest group-hover:text-blue-500 transition-colors duration-500">
                                    Ejecución
                                </span>
                            </div>
                        </div>

                        {/* NSG Horizon */}
                        <div className="group relative bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-[0_2px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.06)] transition-all duration-700 hover:-translate-y-1 overflow-hidden flex flex-col justify-between h-full">
                            <div className="absolute inset-0 bg-linear-to-b from-slate-50/0 via-slate-50/0 to-cyan-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                            <div className="relative z-10">
                                <h3 className="text-4xl sm:text-5xl font-display font-medium text-slate-900 mb-6 tracking-tighter group-hover:text-cyan-600 transition-colors duration-500">
                                    Horizon.
                                </h3>

                                <p className="text-lg text-slate-500 leading-relaxed font-normal max-w-sm">
                                    Tu visión a futuro, estructurada por IA.
                                    Convierte conversaciones en planes.
                                </p>
                            </div>

                            <div className="relative z-10 mt-12 flex items-center gap-3">
                                <div className="h-px w-8 bg-slate-200 group-hover:bg-cyan-300 transition-colors duration-500"></div>
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest group-hover:text-cyan-500 transition-colors duration-500">
                                    Planificación
                                </span>
                            </div>
                        </div>

                        {/* BS Intelligence */}
                        <div className="group relative bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-[0_2px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.06)] transition-all duration-700 hover:-translate-y-1 overflow-hidden flex flex-col justify-between h-full">
                            <div className="absolute inset-0 bg-linear-to-b from-slate-50/0 via-slate-50/0 to-slate-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                            <div className="relative z-10">
                                <h3 className="text-4xl sm:text-5xl font-display font-medium text-slate-900 mb-6 tracking-tighter group-hover:text-slate-700 transition-colors duration-500">
                                    Intelligence.
                                </h3>

                                <p className="text-lg text-slate-500 leading-relaxed font-normal max-w-sm">
                                    Base de conocimiento activa 24/7. Respuestas
                                    estratégicas al instante.
                                </p>
                            </div>

                            <div className="relative z-10 mt-12 flex items-center gap-3">
                                <div className="h-px w-8 bg-slate-200 group-hover:bg-slate-400 transition-colors duration-500"></div>
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors duration-500">
                                    Conocimiento
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SUPER INTELLIGENCE HERO */}
            <section className="pt-32 pb-16 sm:pt-56 sm:pb-28 px-4 bg-white overflow-hidden flex justify-center items-center">
                <div className="relative select-none">
                    <span className="absolute -top-10 left-1 sm:-top-16 sm:left-2 text-3xl sm:text-5xl font-bold text-blue-600 tracking-tight animate-fade-in-up">
                        Super
                    </span>
                    <h2 className="text-[13vw] sm:text-[15vw] leading-[0.8] font-display font-bold text-deep-900 tracking-tighter hover:scale-105 transition-transform duration-700 cursor-default">
                        Intelligence
                    </h2>
                </div>
            </section>

            {/* ONBOARDING STEPS */}
            <section className="pb-24 pt-12 sm:pt-24 px-4 bg-white border-b border-slate-100">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-20 max-w-2xl mx-auto text-center md:text-left md:mx-0">
                        <h2 className="text-3xl sm:text-4xl font-display font-bold text-navy-950 tracking-tight mb-4">
                            Protocolo de Iniciación
                        </h2>
                        <p className="text-lg text-slate-500 font-normal leading-relaxed">
                            Configuración estratégica en tres pasos.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-10 left-0 w-full h-[2px] bg-slate-100 z-0"></div>

                        {/* Step 1 */}
                        <div className="relative z-10 group text-center md:text-left flex flex-col items-center md:items-start">
                            <div className="w-20 h-20 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-3xl font-bold text-navy-950 mb-8 shadow-sm group-hover:border-blue-600 group-hover:text-blue-600 transition-all duration-300">
                                01
                            </div>
                            <h3 className="text-xl font-bold text-navy-950 mb-3">
                                Regístrate Ahora
                            </h3>
                            <p className="text-slate-500 leading-relaxed mb-6 font-medium text-sm">
                                Crea tu cuenta para acceder al panel de control
                                y comenzar la configuración de tu entorno.
                            </p>
                            <Link
                                href="/auth/register"
                                className="inline-flex items-center justify-center px-6 py-2.5 bg-navy-950 text-white text-sm font-bold rounded-lg hover:bg-blue-600 transition-all duration-300 shadow-lg shadow-navy-950/20 hover:shadow-blue-600/20 hover:-translate-y-0.5"
                            >
                                Registrarse
                            </Link>
                        </div>

                        {/* Step 2 */}
                        <div className="relative z-10 group text-center md:text-left flex flex-col items-center md:items-start">
                            <div className="w-20 h-20 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-3xl font-bold text-navy-950 mb-8 shadow-sm group-hover:border-blue-600 group-hover:text-blue-600 transition-all duration-300">
                                02
                            </div>
                            <h3 className="text-xl font-bold text-navy-950 mb-3">
                                Conecta Telegram
                            </h3>
                            <div className="text-slate-500 leading-relaxed mb-6 font-medium text-sm space-y-2 w-full">
                                <p>
                                    Una vez dentro de la plataforma selecciona:
                                </p>
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs font-mono text-slate-600">
                                    Ajustes &gt; Integraciones &gt; Telegram:
                                    Conectar
                                </div>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative z-10 group text-center md:text-left flex flex-col items-center md:items-start">
                            <div className="w-20 h-20 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-3xl font-bold text-navy-950 mb-8 shadow-sm group-hover:border-blue-600 group-hover:text-blue-600 transition-all duration-300">
                                03
                            </div>
                            <h3 className="text-xl font-bold text-navy-950 mb-3">
                                Base de Conocimiento
                            </h3>
                            <p className="text-slate-500 leading-relaxed mb-2 font-medium text-sm">
                                El bot de Telegram te guiará para construir tu
                                perfil de conocimiento.
                            </p>
                            <p className="text-xs text-slate-400">
                                * Una vez enviado, NSG se personalizará
                                automáticamente para ti.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ABOUT US */}
            <section id="about" className="py-24 px-4 bg-slate-50/50">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-[0.2em] mb-6 block">
                        Manifiesto
                    </span>

                    <h2 className="text-4xl sm:text-5xl font-display font-medium text-navy-950 mb-8 tracking-tight leading-tight">
                        Construido por Estrategas,
                        <br />
                        para Tomadores de Decisiones.
                    </h2>

                    <p className="text-lg sm:text-xl text-slate-500 font-light leading-relaxed mb-16 max-w-2xl mx-auto">
                        BS Intelligence democratiza herramientas avanzadas de
                        inteligencia estratégica. Todo profesional merece acceso
                        a capacidades de IA de grado empresarial.
                    </p>

                    <div className="grid grid-cols-3 gap-8 border-t border-slate-200 pt-12">
                        <div className="relative">
                            <AnimatedCounter
                                end={1000}
                                suffix="+"
                                className="text-4xl sm:text-5xl font-display font-bold text-navy-950 mb-2 tracking-tight"
                            />
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                                Conversaciones
                            </div>
                            {/* Divider */}
                            <div className="absolute top-2 right-0 h-12 w-px bg-slate-200 hidden md:block"></div>
                        </div>
                        <div className="relative">
                            <AnimatedCounter
                                end={100}
                                suffix="+"
                                className="text-4xl sm:text-5xl font-display font-bold text-navy-950 mb-2 tracking-tight"
                            />
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                                Reseñas
                            </div>
                            {/* Divider */}
                            <div className="absolute top-2 right-0 h-12 w-px bg-slate-200 hidden md:block"></div>
                        </div>
                        <div className="relative">
                            <div className="text-4xl sm:text-5xl font-display font-bold text-navy-950 mb-2 tracking-tight">
                                24/7
                            </div>
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                                Soporte
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-48 px-4 bg-navy-950 border-t border-navy-900 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <span className="text-xs font-bold text-blue-500 uppercase tracking-[0.2em] mb-8 block">
                        Comienza Hoy
                    </span>

                    <h2 className="text-5xl sm:text-7xl font-display font-medium text-white mb-10 tracking-tight leading-tight">
                        ¿Listo para Transformar
                        <br />
                        tu Estrategia?
                    </h2>

                    <p className="text-xl sm:text-2xl text-slate-400 font-light leading-relaxed mb-16 max-w-2xl mx-auto">
                        Únete a los ejecutivos que ya están aprovechando la
                        inteligencia estratégica impulsada por IA.
                    </p>

                    <Link
                        href="/auth/register"
                        className="inline-flex items-center gap-3 px-10 py-5 bg-white text-navy-950 text-lg font-bold rounded-full hover:bg-slate-50 transition-all duration-300 shadow-[0_0_30px_-5px_rgba(255,255,255,0.15)] hover:shadow-[0_0_50px_-5px_rgba(255,255,255,0.3)] hover:-translate-y-1 group"
                    >
                        Comienza tu Prueba
                        <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-12 px-4 bg-[#050814]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 mb-12">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-xl font-display font-medium text-white tracking-tight">
                                    BS Intelligence
                                </span>
                            </div>
                            <p className="text-sm text-slate-400 font-light max-w-xs leading-relaxed">
                                Plataforma profesional de IA para inteligencia
                                estratégica. Transformando datos en decisiones.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-white mb-4 uppercase tracking-widest opacity-80">
                                Plataforma
                            </h4>
                            <div className="flex flex-col gap-3">
                                <a
                                    href="#features"
                                    className="text-sm text-slate-400 hover:text-white transition-colors duration-300"
                                >
                                    Funcionalidades
                                </a>
                                <Link
                                    href="/auth/login"
                                    className="text-sm text-slate-400 hover:text-white transition-colors duration-300"
                                >
                                    Iniciar Sesión
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="text-sm text-slate-400 hover:text-white transition-colors duration-300"
                                >
                                    Registrarse
                                </Link>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-white mb-4 uppercase tracking-widest opacity-80">
                                Legal
                            </h4>
                            <div className="flex flex-col gap-3">
                                <Link
                                    href="/privacy"
                                    className="text-sm text-slate-400 hover:text-white transition-colors duration-300"
                                >
                                    Política de Privacidad
                                </Link>
                                <Link
                                    href="/condiciones-del-servicio"
                                    className="text-sm text-slate-400 hover:text-white transition-colors duration-300"
                                >
                                    Términos
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-navy-900 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                        <p className="text-xs text-slate-500 font-light">
                            © 2024 BS Intelligence. Todos los derechos
                            reservados.
                        </p>
                        <div className="flex gap-6">
                            {/* Socials could go here if requested, leaving empty for now to maintain clean look */}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
