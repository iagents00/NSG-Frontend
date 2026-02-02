'use client';

import { ArrowLeft, Gavel, Scale, FileCheck, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Volver al inicio</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                            <Scale className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-slate-900">NSG Legal</span>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
                <header className="mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold tracking-wider uppercase mb-4 border border-indigo-100">
                        <Gavel className="w-3 h-3" />
                        Acuerdo Legal
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
                        Condiciones del <span className="text-indigo-600">Servicio</span>
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
                        Bienvenido a BS Intelligence. Al utilizar nuestra plataforma, aceptas cumplir con los siguientes términos y condiciones. Por favor, léelos cuidadosamente.
                    </p>
                    <div className="mt-8 flex items-center gap-4 text-sm text-slate-400">
                        <span>Última actualización: 26 de Diciembre, 2024</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>Lectura de 7 min</span>
                    </div>
                </header>

                <div className="grid gap-12">
                    <section className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <FileCheck className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">1. Aceptación de los Términos</h2>
                        </div>
                        <div className="space-y-4 text-slate-600 leading-relaxed text-sm md:text-base">
                            <p>
                                Al acceder o utilizar los servicios de BS Intelligence, confirmas que has leído, entendido y aceptado estar vinculado por este Acuerdo de Términos de Servicio. Si no estás de acuerdo con alguna parte, no podrás acceder a la plataforma.
                            </p>
                        </div>
                    </section>

                    <section className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">2. Uso de la Plataforma</h2>
                        </div>
                        <div className="space-y-4 text-slate-600 leading-relaxed text-sm md:text-base">
                            <p>
                                BS Intelligence te otorga una licencia limitada, no exclusiva e intransferible para usar el servicio de acuerdo con estos términos. Te comprometes a:
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>No utilizar la plataforma para fines ilegales o no autorizados.</li>
                                <li>No intentar descompilar o realizar ingeniería inversa de nuestro software.</li>
                                <li>Proporcionar información precisa y mantener la seguridad de tu cuenta.</li>
                                <li>Ser responsable de todas las actividades realizadas bajo tus credenciales.</li>
                            </ul>
                        </div>
                    </section>

                    <section className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600">
                                <Scale className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">3. Propiedad Intelectual</h2>
                        </div>
                        <div className="space-y-4 text-slate-600 leading-relaxed text-sm md:text-base">
                            <p>
                                Todo el contenido, características y funcionalidad de la plataforma (incluyendo diseño, código, algoritmos y logotipos) son propiedad exclusiva de BS Intelligence y están protegidos por leyes internacionales de derechos de autor y propiedad intelectual.
                            </p>
                            <p>
                                Tus datos y el contenido que subas siguen siendo de tu propiedad, pero nos otorgas una licencia necesaria exclusivamente para operar y mejorar los servicios que te proporcionamos.
                            </p>
                        </div>
                    </section>

                    <section className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
                                <Gavel className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">4. Limitación de Responsabilidad</h2>
                        </div>
                        <div className="space-y-4 text-slate-600 leading-relaxed text-sm md:text-base">
                            <p>
                                BS Intelligence se proporciona &quot;tal cual&quot; sin garantías explícitas o implícitas. No seremos responsables de ningún daño indirecto, incidental o consecuente derivado del uso o la imposibilidad de usar el servicio.
                            </p>
                        </div>
                    </section>
                </div>

                <footer className="mt-20 pt-10 border-t border-slate-200 text-center">
                    <p className="text-slate-400 text-sm">
                        &copy; 2024 BS Intelligence. Todos los derechos reservados.
                    </p>
                </footer>
            </main>
        </div>
    );
}
