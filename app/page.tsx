'use client';

import { ArrowRight, Target, Zap, Shield, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import BrandAtom from '@/components/ui/BrandAtom';

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
                        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => router.push('/')}>
                            <BrandAtom className="w-7 h-7 sm:w-8 sm:h-8" />
                            <span className="text-base sm:text-lg font-bold text-navy-950 tracking-tight">NSG Intelligence</span>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-6">
                            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-navy-950 transition-colors">Features</a>
                            <a href="#about" className="text-sm font-medium text-slate-600 hover:text-navy-950 transition-colors">About Us</a>
                            <Link href="/privacy" className="text-sm font-medium text-slate-600 hover:text-navy-950 transition-colors">Privacy</Link>
                            <Link href="/auth/login" className="text-sm font-medium text-slate-600 hover:text-navy-950 transition-colors">Login</Link>
                            <Link href="/auth/register" className="px-4 py-2 bg-navy-900 text-white text-sm font-bold rounded-xl hover:bg-blue-600 transition-all shadow-lg">
                                Get Started
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-slate-600 hover:text-navy-950"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 border-t border-slate-200/60">
                            <div className="flex flex-col gap-3">
                                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-slate-600 hover:text-navy-950 px-2">Features</a>
                                <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-slate-600 hover:text-navy-950 px-2">About Us</a>
                                <Link href="/privacy" className="text-sm font-medium text-slate-600 hover:text-navy-950 px-2">Privacy</Link>
                                <Link href="/auth/login" className="text-sm font-medium text-slate-600 hover:text-navy-950 px-2">Login</Link>
                                <Link href="/auth/register" className="px-4 py-2 bg-navy-900 text-white text-sm font-bold rounded-xl text-center">Get Started</Link>
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
                    {/* 3D Static Atom */}
                    <div className="flex justify-center mb-6">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                            <svg viewBox="0 0 100 100" className="w-full h-full" style={{ filter: 'drop-shadow(0 10px 30px rgba(59, 130, 246, 0.3))' }}>
                                <defs>
                                    <linearGradient id="orbit-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop offset="50%" stopColor="#60a5fa" />
                                        <stop offset="100%" stopColor="#2563eb" />
                                    </linearGradient>
                                    <linearGradient id="orbit-gradient-2" x1="100%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#4f46e5" />
                                        <stop offset="50%" stopColor="#6366f1" />
                                        <stop offset="100%" stopColor="#4338ca" />
                                    </linearGradient>
                                    <linearGradient id="orbit-gradient-3" x1="0%" y1="100%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#2563eb" />
                                        <stop offset="50%" stopColor="#3b82f6" />
                                        <stop offset="100%" stopColor="#1d4ed8" />
                                    </linearGradient>
                                    <radialGradient id="core-gradient" cx="50%" cy="40%">
                                        <stop offset="0%" stopColor="#ffffff" />
                                        <stop offset="40%" stopColor="#93c5fd" />
                                        <stop offset="100%" stopColor="#3b82f6" />
                                    </radialGradient>
                                </defs>

                                {/* Orbital rings with 3D effect */}
                                <ellipse cx="50" cy="50" rx="42" ry="42" fill="none" stroke="url(#orbit-gradient-1)" strokeWidth="2" opacity="0.8" />
                                <ellipse cx="50" cy="50" rx="42" ry="18" fill="none" stroke="url(#orbit-gradient-2)" strokeWidth="2" opacity="0.8" transform="rotate(60 50 50)" />
                                <ellipse cx="50" cy="50" rx="42" ry="18" fill="none" stroke="url(#orbit-gradient-3)" strokeWidth="2" opacity="0.8" transform="rotate(120 50 50)" />

                                {/* Core with 3D effect */}
                                <circle cx="50" cy="50" r="11" fill="url(#core-gradient)" style={{ filter: 'drop-shadow(0 2px 8px rgba(59, 130, 246, 0.6))' }} />
                                <circle cx="50" cy="47" r="4" fill="white" opacity="0.9" />
                            </svg>
                        </div>
                    </div>

                    {/* Headline */}
                    <div className="space-y-5">
                        <div className="inline-block px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full">
                            <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Neural Strategic Gateway</span>
                        </div>

                        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-navy-950 leading-tight">
                            Transform Data Into
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                Strategic Intelligence
                            </span>
                        </h1>

                        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
                            Professional AI-powered platform that converts complex data into actionable insights for modern executives.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                            <Link href="/auth/register" className="w-full sm:w-auto px-7 py-3 bg-navy-900 text-white font-bold rounded-xl hover:bg-blue-600 transition-all shadow-lg flex items-center justify-center gap-2 group">
                                Get Started Free
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <a href="#features" className="w-full sm:w-auto px-7 py-3 bg-white border-2 border-slate-200 text-navy-950 font-bold rounded-xl hover:border-slate-300 transition-all">
                                Learn More
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
                            What NSG Does
                        </h2>
                        <p className="text-sm sm:text-base text-slate-600">
                            Three powerful tools to transform your workflow
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-5">
                        {/* NSG Clarity */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all">
                            <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                                <Target className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-navy-950 mb-2">NSG Clarity</h3>
                            <p className="text-sm text-slate-600 leading-relaxed mb-3">
                                Daily execution protocols that align your tasks with strategic goals. Track progress and manage workflows effectively.
                            </p>
                            <div className="text-xs text-blue-600 font-semibold">Daily Protocols • Progress Tracking</div>
                        </div>

                        {/* NSG Horizon */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-200 hover:shadow-lg transition-all">
                            <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
                                <Zap className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-navy-950 mb-2">NSG Horizon</h3>
                            <p className="text-sm text-slate-600 leading-relaxed mb-3">
                                AI-powered meeting analysis that converts conversations into actionable roadmaps with strategic insights.
                            </p>
                            <div className="text-xs text-emerald-600 font-semibold">AI Analysis • Action Plans</div>
                        </div>

                        {/* NSG Intelligence */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-lg transition-all">
                            <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
                                <Shield className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-navy-950 mb-2">NSG Intelligence</h3>
                            <p className="text-sm text-slate-600 leading-relaxed mb-3">
                                Your AI assistant for strategic queries. Get instant answers and access your knowledge base 24/7.
                            </p>
                            <div className="text-xs text-indigo-600 font-semibold">AI Assistant • Knowledge Base</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ABOUT US */}
            <section id="about" className="py-12 sm:py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-block px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full mb-4">
                        <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">About NSG</span>
                    </div>

                    <h2 className="text-2xl sm:text-4xl font-display font-bold text-navy-950 mb-4">
                        Built by Strategists, for Decision Makers
                    </h2>

                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
                        NSG Intelligence democratizes advanced strategic intelligence tools. We believe every professional deserves access to enterprise-grade AI capabilities.
                    </p>

                    <div className="grid grid-cols-3 gap-6 mt-8">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600 mb-1">1,000+</div>
                            <div className="text-xs text-slate-500 uppercase">Conversations</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-emerald-600 mb-1">100+</div>
                            <div className="text-xs text-slate-500 uppercase">Reviews</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-indigo-600 mb-1">24/7</div>
                            <div className="text-xs text-slate-500 uppercase">Support</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-12 sm:py-16 px-4 bg-gradient-to-r from-navy-950 to-navy-900">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-2xl sm:text-4xl font-display font-bold text-white mb-3">
                        Ready to Transform Your Strategy?
                    </h2>
                    <p className="text-sm sm:text-base text-slate-300 mb-6">
                        Join executives leveraging AI-powered intelligence for better decisions.
                    </p>
                    <Link href="/auth/register" className="inline-flex items-center gap-2 px-7 py-3 bg-white text-navy-950 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-xl group">
                        Start Your Free Trial
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-8 px-4 border-t border-slate-200">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-6 mb-6">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2 mb-3">
                                <BrandAtom className="w-6 h-6" />
                                <span className="text-base font-bold text-navy-950">NSG Intelligence</span>
                            </div>
                            <p className="text-xs text-slate-600">
                                Professional AI platform for strategic intelligence.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-navy-950 mb-2 uppercase">Platform</h4>
                            <div className="flex flex-col gap-2">
                                <a href="#features" className="text-xs text-slate-600 hover:text-navy-950">Features</a>
                                <Link href="/auth/login" className="text-xs text-slate-600 hover:text-navy-950">Login</Link>
                                <Link href="/auth/register" className="text-xs text-slate-600 hover:text-navy-950">Register</Link>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-navy-950 mb-2 uppercase">Legal</h4>
                            <div className="flex flex-col gap-2">
                                <Link href="/privacy" className="text-xs text-slate-600 hover:text-navy-950">Privacy Policy</Link>
                                <Link href="/condiciones-del-servicio" className="text-xs text-slate-600 hover:text-navy-950">Terms</Link>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 text-center">
                        <p className="text-xs text-slate-500">© 2024 NSG Intelligence. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
