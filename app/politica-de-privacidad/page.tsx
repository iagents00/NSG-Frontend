'use client';

import { ArrowLeft, ShieldCheck, Lock, Eye, FileText } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Volver al inicio</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-slate-900">NSG Security</span>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
                <header className="mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold tracking-wider uppercase mb-4 border border-blue-100">
                        <Lock className="w-3 h-3" />
                        Privacidad Primero
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
                        Política de <span className="text-blue-600">Privacidad</span>
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
                        En NSG Intelligence, la seguridad y privacidad de tus datos son nuestra máxima prioridad. 
                        Este documento explica cómo recopilamos, usamos y protegemos tu información.
                    </p>
                    <div className="mt-8 flex items-center gap-4 text-sm text-slate-400">
                        <span>Última actualización: 26 de Diciembre, 2024</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>Lectura de 5 min</span>
                    </div>
                </header>

                <div className="grid gap-12">
                    <section className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <Eye className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Recopilación de Información</h2>
                        </div>
                        <div className="space-y-4 text-slate-600 leading-relaxed text-sm md:text-base">
                            <p>
                                Recopilamos información que nos proporcionas directamente cuando utilizas nuestra plataforma, incluyendo:
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Información de contacto (nombre, correo electrónico).</li>
                                <li>Datos profesionales y de perfil para personalizar tu experiencia.</li>
                                <li>Contenido que subes o generas a través de nuestras herramientas de inteligencia.</li>
                                <li>Información técnica sobre tu dispositivo y cómo interactúas con nuestro servicio.</li>
                            </ul>
                        </div>
                    </section>

                    <section className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Uso y Protección de Datos</h2>
                        </div>
                        <div className="space-y-4 text-slate-600 leading-relaxed text-sm md:text-base">
                            <p>
                                Utilizamos tus datos para proporcionar, mantener y mejorar nuestros servicios de inteligencia. Implementamos medidas de seguridad de nivel empresarial, incluyendo:
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Encriptación AES-256 para datos en reposo y TLS para datos en tránsito.</li>
                                <li>Controles de acceso estrictos y autenticación multifactor.</li>
                                <li>Auditorías de seguridad periódicas para prevenir vulnerabilidades.</li>
                                <li>No vendemos ni alquilamos tus datos personales a terceros.</li>
                            </ul>
                        </div>
                    </section>

                    <section className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600">
                                <FileText className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Tus Derechos</h2>
                        </div>
                        <div className="space-y-4 text-slate-600 leading-relaxed text-sm md:text-base">
                            <p>
                                De acuerdo con las regulaciones de protección de datos (incluyendo el RGPD), tienes derecho a:
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Acceder a la información que tenemos sobre ti.</li>
                                <li>Solicitar la corrección o eliminación de tus datos personales.</li>
                                <li>Oponerte al procesamiento de tus datos en ciertas circunstancias.</li>
                                <li>Solicitar la portabilidad de tus datos en un formato estructurado.</li>
                            </ul>
                            <p className="mt-6 p-4 bg-slate-50 rounded-xl italic">
                                Para ejercer cualquiera de estos derechos, por favor contáctanos en <span className="text-blue-600 font-medium italic">privacy@nsgintelligence.com</span>
                            </p>
                        </div>
                    </section>
                </div>

                <footer className="mt-20 pt-10 border-t border-slate-200 text-center">
                    <p className="text-slate-400 text-sm">
                        &copy; 2024 NSG Intelligence. Todos los derechos reservados.
                    </p>
                </footer>
            </main>
        </div>
    );
}
