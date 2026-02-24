"use client";

import { Check, ArrowRight, Zap, Shield, Crown, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { billingService, SubscriptionStatus } from "@/lib/billing";
import { useToast } from "@/components/ui/ToastProvider";
import { motion } from "framer-motion";
import clsx from "clsx";
import Link from "next/link";

const PLANS = [
    {
        id: "free",
        name: "Explorer",
        description: "Para mentes curiosas que inician su camino estratégico.",
        price: "0",
        features: [
            "3 Análisis Estratégicos al mes",
            "Archivos hasta 5MB",
            "Soporte por email (48h)",
            "Acceso a Bóveda Básica",
        ],
        buttonText: "Actual",
        highlight: false,
        icon: Zap,
    },
    {
        id: "price_estratega_monthly", // Placeholder para ID de Stripe
        name: "Estratega",
        description:
            "El estándar de oro para profesionales de alto rendimiento.",
        price: "27",
        features: [
            "Análisis Estratégicos Ilimitados",
            "Archivos hasta 50MB",
            "Transcripción de Videos (2h/mes)",
            "Soporte Prioritario (24h)",
            "Personalización de Arquitectura",
        ],
        buttonText: "Elegir Plan",
        highlight: true,
        icon: Shield,
    },
    {
        id: "enterprise",
        name: "Enterprise",
        description: "Inteligencia colectiva para equipos y organizaciones.",
        price: "Custom",
        features: [
            "Todo lo del Plan Estratega",
            "Espacios Compartidos",
            "Análisis Multi-Documento",
            "API de Grado Empresarial",
            "Account Manager Dedicado",
        ],
        buttonText: "Contactar",
        highlight: false,
        icon: Crown,
    },
];

export default function BillingPage() {
    const { showToast } = useToast();
    const [loading, setLoading] = useState<string | null>(null);
    const [status, setStatus] = useState<SubscriptionStatus | null>(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const data = await billingService.getSubscriptionStatus();
                setStatus(data);
            } catch (error) {
                console.error("Error fetching subscription status:", error);
            }
        };
        fetchStatus();
    }, []);

    const handleSubscribe = async (planId: string) => {
        if (planId === "free" || planId === "enterprise") {
            showToast(
                "Por favor, contacta con soporte para este plan.",
                "info",
            );
            return;
        }

        try {
            setLoading(planId);
            const { url } = await billingService.createCheckoutSession(planId);
            window.location.href = url;
        } catch (error: any) {
            showToast(error.message || "Error al iniciar el pago", "error");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-white pt-24 pb-20 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs font-black text-blue-600 uppercase tracking-[0.3em]"
                    >
                        Planes & Precios
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-display font-black text-navy-950 tracking-tight"
                    >
                        Eleva tu{" "}
                        <span className="text-blue-600">Inteligencia.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 text-lg max-w-2xl mx-auto font-medium"
                    >
                        Elige la arquitectura que mejor se adapte a tu flujo de
                        toma de decisiones.
                    </motion.p>
                </div>

                {/* Grid */}
                <div className="grid md:grid-cols-3 gap-8 items-stretch">
                    {PLANS.map((plan, idx) => {
                        const isCurrent =
                            status?.plan === plan.id ||
                            (plan.id === "free" && !status?.plan);
                        const Icon = plan.icon;

                        return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * idx }}
                                className={clsx(
                                    "relative flex flex-col p-8 rounded-[2.5rem] border transition-all duration-500",
                                    plan.highlight
                                        ? "bg-navy-950 text-white border-navy-900 shadow-2xl shadow-blue-900/20"
                                        : "bg-white text-navy-950 border-slate-100 shadow-xl shadow-slate-200/20",
                                )}
                            >
                                {plan.highlight && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-blue-600/30">
                                        Recomendado
                                    </div>
                                )}

                                <div className="mb-8">
                                    <div
                                        className={clsx(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center mb-6",
                                            plan.highlight
                                                ? "bg-blue-600/10 text-blue-400"
                                                : "bg-blue-50 text-blue-600",
                                        )}
                                    >
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-2xl font-black tracking-tight mb-2">
                                        {plan.name}
                                    </h3>
                                    <p
                                        className={clsx(
                                            "text-sm font-medium mb-6 h-10",
                                            plan.highlight
                                                ? "text-slate-400"
                                                : "text-slate-500",
                                        )}
                                    >
                                        {plan.description}
                                    </p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black tracking-tighter">
                                            {plan.price === "Custom"
                                                ? plan.price
                                                : `$${plan.price}`}
                                        </span>
                                        {plan.price !== "Custom" && (
                                            <span
                                                className={clsx(
                                                    "text-sm font-bold",
                                                    plan.highlight
                                                        ? "text-slate-500"
                                                        : "text-slate-400",
                                                )}
                                            >
                                                /mes
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 mb-10 flex-1">
                                    {plan.features.map((feature, fIdx) => (
                                        <div
                                            key={fIdx}
                                            className="flex items-center gap-3"
                                        >
                                            <div
                                                className={clsx(
                                                    "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                                                    plan.highlight
                                                        ? "bg-blue-600/20"
                                                        : "bg-blue-50",
                                                )}
                                            >
                                                <Check
                                                    className={clsx(
                                                        "w-3 h-3",
                                                        plan.highlight
                                                            ? "text-blue-400"
                                                            : "text-blue-600",
                                                    )}
                                                />
                                            </div>
                                            <span
                                                className={clsx(
                                                    "text-sm font-medium",
                                                    plan.highlight
                                                        ? "text-slate-300"
                                                        : "text-slate-600",
                                                )}
                                            >
                                                {feature}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handleSubscribe(plan.id)}
                                    disabled={
                                        loading !== null ||
                                        (plan.id === "free" && isCurrent)
                                    }
                                    className={clsx(
                                        "w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2",
                                        plan.highlight
                                            ? "bg-white text-navy-950 hover:bg-blue-50 hover:shadow-lg hover:shadow-blue-200/20"
                                            : "bg-navy-950 text-white hover:bg-blue-600",
                                    )}
                                >
                                    {loading === plan.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            {isCurrent
                                                ? "Plan Actual"
                                                : plan.buttonText}
                                            {!isCurrent && (
                                                <ArrowRight className="w-4 h-4 ml-1" />
                                            )}
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Footer Section */}
                <div className="mt-20 p-8 md:p-12 bg-slate-50 rounded-[3rem] border border-slate-100 flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1 space-y-2 text-center md:text-left">
                        <h4 className="text-xl font-bold text-navy-950">
                            ¿Necesitas algo a medida?
                        </h4>
                        <p className="text-slate-500 font-medium text-sm">
                            Ofrecemos soluciones personalizadas para
                            corporaciones y laboratorios clínicos.
                        </p>
                    </div>
                    <Link
                        href="mailto:soporte@example.com"
                        className="px-8 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-xs uppercase tracking-widest text-navy-950 hover:border-blue-300 hover:text-blue-600 transition-all"
                    >
                        Hablar con Ventas
                    </Link>
                </div>
            </div>
        </div>
    );
}
