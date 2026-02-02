'use client';

import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-slate-200 bg-white">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 text-slate-600 hover:text-navy-950 transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back to Home</span>
                    </button>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 py-12">
                {/* Hero */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-6">
                        <Shield className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-4xl font-display font-bold text-navy-950 mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-slate-600">
                        Last updated: January 19, 2024
                    </p>
                </div>

                {/* Placeholder Content */}
                <div className="prose prose-slate max-w-none">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8">
                        <p className="text-sm text-blue-900 font-medium mb-2">
                            📝 This is a placeholder page
                        </p>
                        <p className="text-sm text-blue-700">
                            The official Privacy Policy content will be added here. This page serves as a temporary placeholder.
                        </p>
                    </div>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-navy-950 mb-4">Overview</h2>
                        <p className="text-slate-700 leading-relaxed">
                            BS Intelligence ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-navy-950 mb-4">Information We Collect</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            We collect information that you provide directly to us, including:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-700">
                            <li>Account information (name, email, password)</li>
                            <li>Profile information</li>
                            <li>Usage data and analytics</li>
                            <li>Communications with our platform</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-navy-950 mb-4">How We Use Your Information</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            We use the information we collect to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-700">
                            <li>Provide, maintain, and improve our services</li>
                            <li>Process transactions and send related information</li>
                            <li>Send technical notices and support messages</li>
                            <li>Respond to your comments and questions</li>
                            <li>Monitor and analyze trends and usage</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-navy-950 mb-4">Data Security</h2>
                        <p className="text-slate-700 leading-relaxed">
                            We implement appropriate technical and organizational measures to protect your personal information against unauthorized or unlawful processing, accidental loss, destruction, or damage.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-navy-950 mb-4">Contact Us</h2>
                        <p className="text-slate-700 leading-relaxed">
                            If you have any questions about this Privacy Policy, please contact us at:
                        </p>
                        <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm font-medium text-navy-950">Email: privacy@nsg-intelligence.com</p>
                        </div>
                    </section>
                </div>

                {/* Footer CTA */}
                <div className="mt-12 pt-8 border-t border-slate-200 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-navy-900 text-white font-bold rounded-xl hover:bg-blue-600 transition-all"
                    >
                        Return to Home
                    </Link>
                </div>
            </main>
        </div>
    );
}
