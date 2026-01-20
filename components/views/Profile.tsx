"use client";

import React, { useState } from "react";
import {
    User,
    Mail,
    Edit2,
    Camera,
    CheckCircle2,
    X,
    FileUp,
    Shield,
    Key,
} from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { useAppStore } from "@/store/useAppStore";
import { authService } from "@/lib/auth";
import api from "@/lib/api";

export default function Profile() {
    const { showToast } = useToast();
    const { userId, setUserId } = useAppStore();

    const [username, setUsername] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [telegramId, setTelegramId] = useState<number | null>(null);
    const [role, setRole] = useState<string | null>(null);

    // Edit Modals
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);

    // Edit Forms
    const [newUsername, setNewUsername] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Loading states
    const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    React.useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await authService.verifySession();
                if (data?.user) {
                    setUsername(data.user.username);
                    setEmail(data.user.email);
                    setRole(data.user.role);
                    setUserId(data.user.id);
                    if (data.user.telegram_id) {
                        setTelegramId(data.user.telegram_id);
                    }
                }
            } catch (err) {
                console.error("Error fetching user session:", err);
            }
        };
        fetchUser();
    }, [setUserId]);

    const handleUpdateUsername = async () => {
        if (!newUsername.trim()) {
            showToast("Por favor ingresa un nombre de usuario", "error");
            return;
        }

        setIsUpdatingUsername(true);
        try {
            const response = await api.patch("/auth/update-username", {
                username: newUsername,
            });
            if (response.data.success) {
                setUsername(newUsername);
                setIsEditingUsername(false);
                setNewUsername("");
                showToast("Nombre de usuario actualizado", "success");
            }
        } catch (error) {
            console.error(error);
            showToast("Error al actualizar nombre de usuario", "error");
        } finally {
            setIsUpdatingUsername(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            showToast("Por favor completa todos los campos", "error");
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast("Las contraseñas no coinciden", "error");
            return;
        }

        if (newPassword.length < 6) {
            showToast(
                "La contraseña debe tener al menos 6 caracteres",
                "error",
            );
            return;
        }

        setIsUpdatingPassword(true);
        try {
            const response = await api.patch("/auth/change-password", {
                currentPassword,
                newPassword,
            });

            if (response.data.success) {
                setIsEditingPassword(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                showToast("Contraseña actualizada correctamente", "success");
            }
        } catch (error) {
            console.error(error);
            showToast("Error al cambiar contraseña", "error");
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-4 xs:space-y-6 sm:space-y-8 animate-fade-in-up pb-10 px-2 xs:px-4 sm:px-6">
            {/* Dark Header Banner - Clarity Style */}
            <div className="relative overflow-hidden bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 px-4 xs:px-6 py-5 sm:px-8 sm:py-6 rounded-2xl border border-navy-800/50 shadow-xl">
                <div className="relative z-10">
                    <h2 className="font-display font-bold text-xl xs:text-2xl lg:text-3xl tracking-tight">
                        <span className="text-white">Gestión de </span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                            Mi Perfil
                        </span>
                        <span className="text-white">.</span>
                    </h2>
                    <p className="text-slate-300 text-xs xs:text-sm mt-2 max-w-3xl leading-relaxed">
                        Administra tu información personal, credenciales de
                        acceso y configuración de cuenta. Panel de usuario
                        ejecutándose.
                    </p>
                </div>
            </div>

            {/* Profile Card */}
            <div className="bg-white p-5 sm:p-8 rounded-2xl xs:rounded-3xl shadow-card border border-slate-200">
                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-center gap-5 xs:gap-6 sm:gap-8 mb-6 xs:mb-8 sm:mb-10 p-4 xs:p-5 sm:p-6 bg-slate-50/50 rounded-2xl xs:rounded-3xl border border-slate-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-100/30 rounded-full blur-3xl -mr-24 -mt-24 opacity-60"></div>
                    <div className="relative">
                        <div className="w-24 h-24 xs:w-28 xs:h-28 sm:w-32 sm:h-32 bg-linear-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-xl shadow-blue-200 relative overflow-hidden">
                            <span className="relative z-10">
                                {username
                                    ? username.substring(0, 2).toUpperCase()
                                    : "US"}
                            </span>
                        </div>
                        <button
                            onClick={() =>
                                showToast("Funcionalidad en desarrollo", "info")
                            }
                            className="absolute -bottom-1 -right-1 bg-white p-2 rounded-full shadow-lg border border-slate-200 hover:bg-blue-50 transition cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
                        >
                            <Camera className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                    </div>
                    <div className="text-center sm:text-left relative z-10 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h3 className="font-bold text-2xl text-navy-950">
                                {username || "Usuario Activo"}
                            </h3>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase w-fit mx-auto sm:mx-0">
                                <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                                Verificado
                            </span>
                        </div>
                        <p className="text-slate-500 mb-3 text-sm">
                            {email || "usuario@nsg.com"}
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                            <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold uppercase">
                                Role: {role || "User"}
                            </span>
                            <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-lg text-[10px] font-bold">
                                ID: {userId || "N/A"}
                            </span>
                            {telegramId && (
                                <span className="px-2.5 py-1 bg-[#0088cc]/10 text-[#0088cc] rounded-lg text-[10px] font-bold flex items-center gap-1">
                                    Telegram: {telegramId}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Information Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField
                        icon={User}
                        label="Nombre de Usuario"
                        value={username || "No configurado"}
                        editable
                        onEdit={() => {
                            setNewUsername(username || "");
                            setIsEditingUsername(true);
                        }}
                    />
                    <InfoField
                        icon={Mail}
                        label="Email"
                        value={email || "No configurado"}
                        editable={false}
                    />
                    <InfoField
                        icon={Shield}
                        label="Rol"
                        value={role || "user"}
                        badge
                    />
                    <InfoField
                        icon={Key}
                        label="Contraseña"
                        value="••••••••"
                        editable
                        onEdit={() => setIsEditingPassword(true)}
                    />
                </div>
            </div>

            {/* Coming Soon Sections */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-card border border-slate-200 relative opacity-60 pointer-events-none">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-200 rounded-2xl text-slate-400 shrink-0">
                        <FileUp className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-display font-bold text-lg text-slate-400">
                            Carga de Documentos Estratégicos
                        </h3>
                        <p className="text-slate-400 text-xs">
                            Procesa reportes y PDFs (Próximamente)
                        </p>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isEditingUsername && (
                <Modal
                    title="Editar Nombre de Usuario"
                    onClose={() => {
                        setIsEditingUsername(false);
                        setNewUsername("");
                    }}
                >
                    <div className="space-y-4">
                        <input
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none"
                            placeholder="Nuevo nombre"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={handleUpdateUsername}
                                disabled={isUpdatingUsername}
                                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold"
                            >
                                {isUpdatingUsername
                                    ? "Actualizando..."
                                    : "Guardar"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {isEditingPassword && (
                <Modal
                    title="Cambiar Contraseña"
                    onClose={() => {
                        setIsEditingPassword(false);
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                    }}
                >
                    <div className="space-y-4">
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none"
                            placeholder="Contraseña Actual"
                        />
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none"
                            placeholder="Nueva Contraseña"
                        />
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none"
                            placeholder="Confirmar"
                        />
                        <button
                            onClick={handleChangePassword}
                            disabled={isUpdatingPassword}
                            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold"
                        >
                            {isUpdatingPassword ? "Actualizando..." : "Cambiar"}
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}

function InfoField({ icon: Icon, label, value, editable, badge, onEdit }: any) {
    return (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-500 uppercase">
                        {label}
                    </span>
                </div>
                {editable && (
                    <button
                        onClick={onEdit}
                        className="p-1 hover:bg-white rounded transition"
                    >
                        <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                )}
            </div>
            <p
                className={`font-semibold text-navy-900 ${badge ? "uppercase text-sm" : ""}`}
            >
                {value}
            </p>
        </div>
    );
}

function Modal({ title, children, onClose }: any) {
    return (
        <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display font-bold text-2xl text-navy-900">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-xl transition"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
