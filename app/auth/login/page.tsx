"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { CONTEXT, RoleType } from "@/data/context";
import BrandAtom from "@/components/ui/BrandAtom";
import clsx from "clsx";
import Link from "next/link";
import { Lock, ChevronLeft } from "lucide-react";
import { authService } from '@/lib/auth';
import { translateAuthError } from '@/lib/error-translator';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const setRole = useAppStore((state) => state.setRole);
    const setUserId = useAppStore((state) => state.setUserId);

    const [selectedRole, setSelectedRole] = useState<RoleType>('manager');
    const [isAnimating, setIsAnimating] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const roleParam = searchParams.get('role') as RoleType | null;
        if (roleParam && CONTEXT[roleParam]) {
            setSelectedRole(roleParam);
        }
    }, [searchParams]);

    const handleBack = () => {
        router.push('/');
    };

    const getLocation = async (): Promise<any> => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve(undefined);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

                    // Reverse geocoding to get city and country
                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`
                        );
                        const data = await response.json();

                        resolve({
                            latitude: lat,
                            longitude: lng,
                            timezone,
                            city: data.address?.city || data.address?.town || data.address?.village || data.address?.state,
                            country: data.address?.country
                        });
                    } catch (error) {
                        console.error("Error getting location name", error);
                        resolve({
                            latitude: lat,
                            longitude: lng,
                            timezone
                        });
                    }
                },
                (error) => {
                    console.error("Error getting location", error);
                    resolve(undefined);
                }
            );
        });
    };

    const handleLogin = async () => {
        if (!email || !password) {
            setError("Por favor ingresa usuario y contraseña.");
            return;
        }

        setIsAnimating(true);
        setError(null);

        try {
            // Get location (don't fail if denied/error)
            const location = await getLocation();

            const data = await authService.login({
                email: email.toLowerCase(),
                password,
                location
            });

            if (data.token) {
                localStorage.setItem('nsg-token', data.token);
            }

            // Save real user ID from backend response
            if ((data.user as any)?.id) {
                setUserId((data.user as any).id);
            }

            if ((data.user as any)?.role) {
                setRole((data.user as any).role as RoleType);
            } else {
                setRole(selectedRole);
            }
            router.push("/dashboard");
        } catch (err: unknown) {
            const error = err as any;
            setError(translateAuthError(error.response?.data?.message || error.message) || "Credenciales inválidas. Intenta nuevamente.");
        } finally {
            setIsAnimating(false);
        }
    };


    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-100 blur-[120px] rounded-full mix-blend-multiply opacity-50" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-100 blur-[120px] rounded-full mix-blend-multiply opacity-50" />
            </div>

            <div className="relative w-full max-w-[448px]">
                {/* Card Container */}
                <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-[28px] shadow-xl shadow-slate-200/50 p-8 md:p-10 overflow-hidden relative">
                    {/* Header Section */}
                    <div className="flex flex-col items-center text-center mb-6">
                        <BrandAtom className="w-12 h-12 mb-2" variant="colored" />

                        <div className="space-y-1">
                            <h1 className="font-display font-medium text-slate-900 text-2xl tracking-tight">
                                Bienvenido
                            </h1>
                            <p className="text-slate-500 text-sm font-medium">
                                Ingresa tus credenciales para continuar
                            </p>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    {/* Login Form */}
                    <div className="w-full relative">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleLogin();
                            }}
                            className="space-y-6"
                        >
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Usuario / Email</label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors flex items-center justify-center font-bold text-[10px]">@</div>
                                        <input
                                            type="text"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                setError(null);
                                            }}
                                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                            placeholder="Ingresa tu usuario o email"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Contraseña</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                setError(null);
                                            }}
                                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                            placeholder="Ingresa tu contraseña"
                                        />
                                    </div>
                                    <div className="flex justify-end pt-1">
                                        <Link
                                            href="/auth/forgot-password"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                router.push('/auth/forgot-password');
                                            }}
                                            className="text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest cursor-pointer"
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors flex items-center gap-1 pl-1 cursor-pointer"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Atrás
                                </button>
                                <button
                                    type="submit"
                                    disabled={isAnimating}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 px-6 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {isAnimating ? "Verificando..." : "Acceder"}
                                </button>
                            </div>

                            {/* Register Link */}
                            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center text-sm">
                                <span className="text-slate-500 mr-1">¿No tienes cuenta?</span>
                                <Link
                                    href={`/auth/register?role=${selectedRole || 'manager'}`}
                                    className="text-blue-600 font-semibold hover:text-blue-700 transition-colors cursor-pointer"
                                >
                                    Registrarse
                                </Link>
                            </div>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center space-y-2">
                        <div className="flex justify-center gap-6 text-xs text-slate-400 font-medium">
                            <span className="hover:text-slate-600 cursor-pointer transition-colors">Ayuda</span>
                            <span className="hover:text-slate-600 cursor-pointer transition-colors">Privacidad</span>
                            <span className="hover:text-slate-600 cursor-pointer transition-colors">Términos</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">Cargando...</div>}>
            <LoginContent />
        </Suspense>
    );
}