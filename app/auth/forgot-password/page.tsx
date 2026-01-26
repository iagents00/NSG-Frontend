"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import BrandAtom from "@/components/ui/BrandAtom";
import clsx from "clsx";
import { Lock, Mail, ChevronLeft, ShieldCheck, Send } from "lucide-react";
import api from "@/lib/api";
import { AxiosError } from "axios";
import { useToast } from "@/components/ui/ToastProvider";
import confetti from "canvas-confetti";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const { showToast } = useToast();

    const [step, setStep] = useState(1); // 1: Email, 2: Code & New Password, 3: Success
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSendCode = async () => {
        if (!email) {
            setError("Por favor ingresa tu email.");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            await api.post("/auth/forgot-password-email", {
                email: email.toLowerCase(),
            });

            showToast("Código enviado a tu correo", "success");
            setStep(2);
        } catch (err: unknown) {
            const errorObj = err as AxiosError<{ message: string }>;
            console.error("Error en handleSendCode:", errorObj);
            const errorMessage =
                errorObj.response?.data?.message ||
                "Error al enviar el código. Verifica tu email y conexión.";
            setError(errorMessage);
            showToast(errorMessage, "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!code || !newPassword) {
            setError("Completa todos los campos.");
            return;
        }
        if (newPassword.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            await api.post("/auth/reset-password", {
                email: email.toLowerCase(),
                code,
                newPassword,
            });
            setStep(3);
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            showToast("Contraseña actualizada exitosamente", "success");
        } catch (err: unknown) {
            const errorObj = err as AxiosError<{ message: string }>;
            console.error("Error en handleResetPassword:", errorObj);
            const errorMessage =
                errorObj.response?.data?.message ||
                "Código inválido o expirado.";
            setError(errorMessage);
            showToast(errorMessage, "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-100 blur-[120px] rounded-full mix-blend-multiply opacity-50" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-rose-100 blur-[120px] rounded-full mix-blend-multiply opacity-50" />
            </div>

            <div className="relative w-full max-w-[448px]">
                <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-4xl shadow-xl shadow-slate-200/50 p-8 md:p-10">
                    {/* Progress Dots */}
                    <div className="flex justify-center gap-2 mb-8">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={clsx(
                                    "h-1.5 transition-all duration-500 rounded-full",
                                    step === s
                                        ? "w-8 bg-blue-600"
                                        : "w-1.5 bg-slate-200",
                                )}
                            ></div>
                        ))}
                    </div>

                    {step === 1 && (
                        <div className="animate-fade-in">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600 shadow-inner">
                                    <ShieldCheck className="w-8 h-8" />
                                </div>
                                <h2 className="font-display font-bold text-2xl text-slate-900 mb-2">
                                    Recuperar Acceso
                                </h2>
                                <p className="text-slate-500 text-sm">
                                    Ingresa tu email para recibir un código de
                                    seguridad.
                                </p>
                            </div>

                            {error && (
                                <div className="mb-6 p-3 bg-rose-50 border border-rose-100 text-rose-600 text-[13px] font-medium rounded-xl text-center">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                        Email Registrado
                                    </label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            autoComplete="email"
                                            className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                            placeholder="ejemplo@nsg.com"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleSendCode}
                                    disabled={isLoading || !email}
                                    className="w-full bg-navy-900 text-white font-bold py-4 rounded-2xl shadow-xl shadow-navy-900/10 hover:bg-blue-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {isLoading ? (
                                        "Validando sistema..."
                                    ) : (
                                        <>
                                            Enviar Código{" "}
                                            <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-fade-in">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600 shadow-inner overflow-hidden relative">
                                    <Lock className="w-8 h-8" />
                                    <div className="absolute inset-0 bg-blue-400/10 animate-pulse"></div>
                                </div>
                                <h2 className="font-display font-bold text-2xl text-slate-900 mb-2">
                                    Protocolo de Verificación
                                </h2>
                                <p className="text-slate-500 text-sm">
                                    Hemos enviado un código a tu correo
                                    electrónico.
                                </p>
                            </div>

                            {error && (
                                <div className="mb-6 p-3 bg-rose-50 border border-rose-100 text-rose-600 text-[13px] font-medium rounded-xl text-center">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                        Código de 6 dígitos
                                    </label>
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) =>
                                            setCode(e.target.value)
                                        }
                                        maxLength={6}
                                        autoComplete="one-time-code"
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-4 text-center text-2xl font-black tracking-[0.5em] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-navy-950"
                                        placeholder="000000"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                        Nueva Contraseña
                                    </label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) =>
                                                setNewPassword(e.target.value)
                                            }
                                            autoComplete="new-password"
                                            className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleResetPassword}
                                    disabled={
                                        isLoading || !code || !newPassword
                                    }
                                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {isLoading
                                        ? "Firmando Protocolo..."
                                        : "Actualizar Contraseña"}
                                </button>

                                <button
                                    onClick={() => setStep(1)}
                                    className="w-full text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-slate-600 transition-colors"
                                >
                                    Solicitar nuevo código
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center animate-fade-in py-6">
                            <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-emerald-500 shadow-xl shadow-emerald-500/10">
                                <BrandAtom
                                    className="w-10 h-10"
                                    variant="colored"
                                />
                            </div>
                            <h2 className="font-display font-bold text-2xl text-slate-900 mb-2">
                                ¡Sincronización Exitosa!
                            </h2>
                            <p className="text-slate-500 text-sm mb-10">
                                Tu contraseña ha sido actualizada. Ya puedes
                                acceder a tu Command Center.
                            </p>

                            <button
                                onClick={() => router.push("/auth/login")}
                                className="w-full bg-navy-900 text-white font-bold py-4 rounded-2xl shadow-xl shadow-navy-900/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                            >
                                Ir al Inicio de Sesión{" "}
                                <ChevronLeft className="w-4 h-4 rotate-180" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
