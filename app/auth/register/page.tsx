"use client";

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import BrandAtom from "@/components/ui/BrandAtom";
import { Lock, ChevronLeft, User, Mail, ArrowRight } from "lucide-react";
import Link from 'next/link';
import { authService } from '@/lib/auth';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role');
  const [isAnimating, setIsAnimating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError("Por favor completa todos los campos requeridos.");
      return;
    }

    setIsAnimating(true);
    setError(null);

    const registrationData = {
      username: formData.name,
      email: formData.email.toLowerCase(),
      password: formData.password,
    };

    try {
      const response = await authService.register(registrationData);

      if (response && response.token) {
        localStorage.setItem('nsg-token', response.token);
        // If we have a token, we can go straight to dashboard
        router.push("/dashboard");
      } else {
        // Otherwise go to login
        router.push(`/auth/login?role=${role || 'manager'}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al registrarse. Intenta nuevamente.");
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
            <BrandAtom className="w-12 h-12 mb-2" variant="colored" />

            <div className="space-y-1">
              <h1 className="font-display font-medium text-slate-900 text-2xl tracking-tight">
                Crear Cuenta
              </h1>
              <p className="text-slate-500 text-sm font-medium">
                Únete a NSG Intelligence
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

              {/* Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Nombre de Usuario</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    placeholder="Ej. Juan Pérez"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Correo Profesional</label>
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
                  <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Contraseña</label>
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
                  <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Confirmar</label>
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

              <div className="flex items-center justify-between pt-4">
                <Link
                  href={`/auth/login?role=${role || 'clinic_owner'}`}
                  className="text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors flex items-center gap-1 pl-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Volver
                </Link>
                <button
                  type="submit"
                  disabled={isAnimating}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 px-6 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isAnimating ? "Creando..." : "Registrarse"}
                  {!isAnimating && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </form>

            {/* Terms */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400">
                Al registrarte, aceptas nuestros <span className="text-blue-600 cursor-pointer hover:underline">Términos</span> y <span className="text-blue-600 cursor-pointer hover:underline">Privacidad</span>.
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
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">Cargando...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
