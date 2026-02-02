"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BrandAtom from "@/components/ui/BrandAtom";
import { Lock, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import { authService } from "@/lib/auth";
import { translateAuthError } from "@/lib/error-translator";

function RegisterContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get("role");
    const [isAnimating, setIsAnimating] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null);
    };

    const getLocation = async (): Promise<any> => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve(undefined);
                return;
            }

            // Set a fallback timeout to avoid blocking the UI
            const timeoutId = setTimeout(() => {
                console.log("Proceeding without location (UX fallback)");
                resolve(undefined);
            }, 12000); // 12 seconds manual fallback

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    clearTimeout(timeoutId);
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const timezone =
                        Intl.DateTimeFormat().resolvedOptions().timeZone;

                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
                        );
                        const data = await response.json();

                        resolve({
                            latitude: lat,
                            longitude: lng,
                            timezone,
                            city:
                                data.address?.city ||
                                data.address?.town ||
                                data.address?.village ||
                                data.address?.state,
                            country: data.address?.country,
                        });
                    } catch (error) {
                        console.error("Error getting location name", error);
                        resolve({
                            latitude: lat,
                            longitude: lng,
                            timezone,
                        });
                    }
                },
                (error) => {
                    clearTimeout(timeoutId);
                    // Don't log as error if it's just a timeout or denied
                    if (error.code === 3) {
                        // TIMEOUT
                        console.log(
                            "Geolocation timed out after user approval or system delay",
                        );
                    } else if (error.code === 1) {
                        // PERMISSION_DENIED
                        console.log("Location access denied by user");
                    } else {
                        console.warn("Location info:", error.message);
                    }
                    resolve(undefined);
                },
                {
                    enableHighAccuracy: false,
                    timeout: 15000, // 15 seconds browser timeout
                    maximumAge: 600000, // 10 minutes cache
                },
            );
        });
    };

    const handleRegister = async () => {
        if (!formData.email || !formData.password) {
            setError("Por favor completa todos los campos requeridos.");
            return;
        }

        // Normalize before validation
        const normalizedEmailCheck = formData.email.toLowerCase().trim();

        // Strict Email Validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(normalizedEmailCheck)) {
            setError("Por favor ingresa una dirección de correo válida.");
            return;
        }

        // Typo Check for Common Domains
        const domain = normalizedEmailCheck.split("@")[1];
        const domainTypos: { [key: string]: string } = {
            // Gmail
            "gmil.com": "gmail.com",
            "gnail.com": "gmail.com",
            "gmai.com": "gmail.com",
            "gamill.com": "gmail.com", // Requested specific
            "gmal.com": "gmail.com",
            "gmaill.com": "gmail.com",
            "gail.com": "gmail.com",
            "gmial.com": "gmail.com",

            // Hotmail
            "hotmil.com": "hotmail.com",
            "hotmal.com": "hotmail.com",
            "hotmai.com": "hotmail.com",
            "hotmaill.com": "hotmail.com",

            // Outlook
            "outlok.com": "outlook.com",
            "outook.com": "outlook.com",
            "outllok.com": "outlook.com",

            // Yahoo
            "yhoo.com": "yahoo.com",
            "yahooo.com": "yahoo.com",

            // iCloud
            "iclud.com": "icloud.com",
            "icoud.com": "icloud.com",
        };

        if (domain && domainTypos[domain]) {
            setError(
                `¿Quisiste decir @${domainTypos[domain]}? Verifica tu correo.`,
            );
            return;
        }

        setIsAnimating(true);
        setError(null);

        const location = await getLocation();

        const registrationData = {
            email: normalizedEmailCheck,
            password: formData.password,
            // SECURITY: role removed - backend assigns "user" by default
            location,
        };

        try {
            const response = await authService.register(registrationData);

            if (response && response.token) {
                localStorage.setItem("nsg-token", response.token);
                // If we have a token, we can go straight to dashboard
                router.push("/dashboard");
            } else {
                // Otherwise go to login
                router.push("/auth/login");
            }
        } catch (err: any) {
            setError(
                translateAuthError(
                    err.response?.data?.message || err.message,
                ) || "Error al registrarse. Intenta nuevamente.",
            );
        } finally {
            setIsAnimating(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-100 blur-[120px] rounded-full mix-blend-multiply opacity-50" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-100 blur-[120px] rounded-full mix-blend-multiply opacity-50" />
            </div>

            <div className="relative w-full max-w-[448px]">
                {/* Card Container */}
                <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-[28px] shadow-xl shadow-slate-200/50 p-8 md:p-10 overflow-hidden relative">
                    {/* Header Section */}
                    <div className="flex flex-col items-center text-center mb-6">
                        <BrandAtom
                            className="w-12 h-12 mb-2"
                            variant="colored"
                        />

                        <div className="space-y-1">
                            <h1 className="font-display font-medium text-slate-900 text-2xl tracking-tight">
                                Crear Cuenta
                            </h1>
                            <p className="text-slate-500 text-sm font-medium">
                                Únete a BS Intelligence
                            </p>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    {/* Register Form */}
                    <div className="w-full relative">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleRegister();
                            }}
                            className="space-y-5"
                        >
                            {/* Email */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">
                                    Correo Profesional
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                        placeholder="usuario@empresa.com"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">
                                        Contraseña
                                    </label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2" hidden>
                                    <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">
                                        Confirmar
                                    </label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={isAnimating}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 px-6 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {isAnimating ? "Creando..." : "Registrarse"}
                                    {!isAnimating && (
                                        <ArrowRight className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Login Link */}
                        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center text-sm">
                            <span className="text-slate-500 mr-1">
                                ¿Ya tienes cuenta?
                            </span>
                            <Link
                                href="/auth/login"
                                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors cursor-pointer"
                            >
                                Iniciar Sesión
                            </Link>
                        </div>

                        {/* Terms */}
                        <div className="mt-6 text-center">
                            <p className="text-xs text-slate-400">
                                Al registrarte, aceptas nuestros{" "}
                                <span className="text-blue-600 cursor-pointer hover:underline">
                                    Términos
                                </span>{" "}
                                y{" "}
                                <span className="text-blue-600 cursor-pointer hover:underline">
                                    Privacidad
                                </span>
                                .
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">
                    Cargando...
                </div>
            }
        >
            <RegisterContent />
        </Suspense>
    );
}
