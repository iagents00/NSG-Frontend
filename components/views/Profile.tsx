"use client";

import React, { useState } from "react";
import { User, Mail, Camera, X, FileUp, Key, Edit2 } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { useAppStore } from "@/store/useAppStore";
import { authService } from "@/lib/auth";
import api from "@/lib/api";

export default function Profile() {
    const { showToast } = useToast();
    const { userId, setUserId } = useAppStore();

    const [firstName, setFirstName] = useState<string | null>(null);
    const [lastName, setLastName] = useState<string | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [telegramId, setTelegramId] = useState<number | null>(null);
    const [role, setRole] = useState<string | null>(null);

    // Edit Modals
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);

    // Edit Forms
    const [editFirstName, setEditFirstName] = useState("");
    const [editLastName, setEditLastName] = useState("");
    const [editAddress, setEditAddress] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Loading states
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    // Individual Field Editing state
    const [editingField, setEditingField] = useState<
        "firstName" | "lastName" | "address" | null
    >(null);
    const [fieldValue, setFieldValue] = useState("");

    React.useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await authService.verifySession();
                if (data?.user) {
                    setFirstName(data.user.firstName);
                    setLastName(data.user.lastName);
                    setAddress(data.user.address);
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

    const getDisplayName = () => {
        if (firstName || lastName) {
            return `${firstName || ""} ${lastName || ""}`.trim();
        }
        return `user-nsg${userId?.substring(0, 6) || ""}`;
    };

    const handleUpdateField = async () => {
        if (!editingField) return;

        setIsUpdatingProfile(true);
        try {
            const response = await api.patch("/auth/update-profile", {
                [editingField]: fieldValue.trim(),
            });
            if (response.data.success) {
                if (editingField === "firstName")
                    setFirstName(fieldValue.trim());
                if (editingField === "lastName") setLastName(fieldValue.trim());
                if (editingField === "address") setAddress(fieldValue.trim());
                setEditingField(null);
                showToast("Campo actualizado correctamente", "success");
            }
        } catch (error) {
            console.error(error);
            showToast("Error al actualizar el campo", "error");
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleUpdateProfile = async () => {
        setIsUpdatingProfile(true);
        try {
            const response = await api.patch("/auth/update-profile", {
                firstName: editFirstName.trim(),
                lastName: editLastName.trim(),
                address: editAddress.trim(),
            });
            if (response.data.success) {
                setFirstName(editFirstName.trim());
                setLastName(editLastName.trim());
                setAddress(editAddress.trim());
                setIsEditingProfile(false);
                showToast("Perfil actualizado correctamente", "success");
            }
        } catch (error) {
            console.error(error);
            showToast("Error al actualizar perfil", "error");
        } finally {
            setIsUpdatingProfile(false);
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
        <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-fade-in-up pb-12 px-4 sm:px-6">
            {/* Header Banner */}
            <div className="relative overflow-hidden bg-linear-to-r from-navy-950 via-navy-900 to-navy-950 p-6 sm:p-8 rounded-4xl border border-navy-800/50 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                <div className="relative z-10">
                    <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight mb-2">
                        <span className="text-white">Gestión de </span>
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-cyan-400 to-emerald-400">
                            Mi Perfil
                        </span>
                    </h2>
                    <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
                        Administra tu identidad digital y configuración de
                        seguridad en el ecosistema NSG.
                    </p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Left Column: Fixed Info Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-4xl shadow-card border border-slate-200 overflow-hidden flex flex-col items-center p-8 relative">
                        <div className="absolute top-0 inset-x-0 h-32 bg-linear-to-b from-slate-50 to-white"></div>

                        <div className="relative mt-4 mb-6">
                            <div className="w-28 h-28 sm:w-32 sm:h-32 bg-linear-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-2xl shadow-blue-200 ring-4 ring-white relative overflow-hidden">
                                <span className="relative z-10">
                                    {firstName
                                        ? firstName
                                              .substring(0, 1)
                                              .toUpperCase()
                                        : "U"}
                                    {lastName
                                        ? lastName.substring(0, 1).toUpperCase()
                                        : "N"}
                                </span>
                            </div>
                            <button
                                onClick={() =>
                                    showToast(
                                        "Funcionalidad en desarrollo",
                                        "info",
                                    )
                                }
                                className="absolute bottom-1 right-1 bg-white p-2.5 rounded-full shadow-xl border border-slate-100 hover:bg-blue-50 transition transform hover:scale-110 cursor-pointer"
                            >
                                <Camera className="w-4 h-4 text-blue-600" />
                            </button>
                        </div>

                        <div className="text-center space-y-2 mb-6 px-4">
                            <div className="flex flex-col items-center justify-center gap-1">
                                <h3 className="font-bold text-xl sm:text-2xl text-navy-950 truncate max-w-full">
                                    {getDisplayName()}
                                </h3>
                                <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100/50">
                                    {role || "User"}
                                </span>
                            </div>
                        </div>

                        <div className="w-full pt-6 border-t border-slate-100 space-y-4">
                            <div className="flex items-center gap-4 p-3 bg-slate-50/50 rounded-2xl border border-slate-100/50 group hover:bg-white transition-all duration-300">
                                <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                    <Mail className="w-4 h-4 text-blue-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                                        Email de Contacto
                                    </p>
                                    <p className="text-xs font-bold text-navy-900 truncate">
                                        {email}
                                    </p>
                                </div>
                            </div>
                            {telegramId && (
                                <div className="flex items-center gap-4 p-3 bg-blue-50/30 rounded-2xl border border-blue-100/30 group hover:bg-white transition-all duration-300">
                                    <div className="p-2.5 bg-white rounded-xl shadow-sm border border-blue-100 group-hover:scale-110 transition-transform">
                                        <svg
                                            viewBox="0 0 24 24"
                                            className="w-4 h-4 fill-[#0088cc]"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path d="M11.944 0C5.352 0 0 5.352 0 11.944c0 6.592 5.352 11.944 11.944 11.944c6.592 0 11.944-5.352 11.944-11.944C23.888 5.352 18.536 0 11.944 0zm5.66 8.16l-1.928 9.096c-.144.644-.528.804-1.068.5l-2.936-2.164l-1.416 1.364c-.156.156-.288.288-.588.288l.212-3.04l5.524-4.992c.24-.212-.052-.332-.372-.12l-6.828 4.3l-2.948-.92c-.64-.2-.652-.64.132-.948l11.524-4.44c.532-.2.996.12.804.976z" />
                                        </svg>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[9px] font-black text-[#0088cc]/60 uppercase tracking-widest mb-0.5">
                                            Telegram ID
                                        </p>
                                        <p className="text-xs font-bold text-[#0088cc] truncate">
                                            @{telegramId}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Information & Security */}
                <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                    {/* General Information */}
                    <div className="bg-white rounded-4xl shadow-card border border-slate-200 overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                            <h4 className="font-bold text-navy-950 flex items-center gap-2">
                                <User className="w-4 h-4 text-blue-500" />
                                Información General
                            </h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 p-6 sm:p-8 pt-0">
                            <div
                                onClick={() => {
                                    setEditingField("firstName");
                                    setFieldValue(firstName || "");
                                }}
                                className="p-4 rounded-2xl bg-white border border-slate-200 group cursor-pointer hover:border-blue-400 hover:shadow-md transition-all duration-300 relative flex flex-col justify-between"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Nombre
                                    </p>
                                    <div className="p-1.5 bg-blue-50 rounded-lg text-blue-500 shadow-sm border border-blue-100 group-hover:scale-110 transition-transform">
                                        <Edit2 className="w-3 h-3" />
                                    </div>
                                </div>
                                <p
                                    className={`font-bold leading-tight ${!firstName ? "text-slate-300 italic font-medium" : "text-navy-900"}`}
                                >
                                    {firstName || "Pendiente"}
                                </p>
                            </div>

                            <div
                                onClick={() => {
                                    setEditingField("lastName");
                                    setFieldValue(lastName || "");
                                }}
                                className="p-4 rounded-2xl bg-white border border-slate-200 group cursor-pointer hover:border-blue-400 hover:shadow-md transition-all duration-300 relative flex flex-col justify-between"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Apellidos
                                    </p>
                                    <div className="p-1.5 bg-blue-50 rounded-lg text-blue-500 shadow-sm border border-blue-100 group-hover:scale-110 transition-transform">
                                        <Edit2 className="w-3 h-3" />
                                    </div>
                                </div>
                                <p
                                    className={`font-bold leading-tight ${!lastName ? "text-slate-300 italic font-medium" : "text-navy-900"}`}
                                >
                                    {lastName || "Pendiente"}
                                </p>
                            </div>

                            <div
                                onClick={() => {
                                    setEditingField("address");
                                    setFieldValue(address || "");
                                }}
                                className="p-4 rounded-2xl bg-white border border-slate-200 group cursor-pointer hover:border-blue-400 hover:shadow-md transition-all duration-300 relative flex flex-col justify-between"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Dirección
                                    </p>
                                    <div className="p-1.5 bg-blue-50 rounded-lg text-blue-500 shadow-sm border border-blue-100 group-hover:scale-110 transition-transform">
                                        <Edit2 className="w-3 h-3" />
                                    </div>
                                </div>
                                <p
                                    className={`font-bold truncate leading-tight ${!address ? "text-slate-300 italic font-medium" : "text-navy-900"}`}
                                >
                                    {address || "Pendiente"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="bg-white rounded-4xl shadow-card border border-blue-100 p-6 sm:p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-all duration-700"></div>
                        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-inner group-hover:scale-105 transition-transform duration-500">
                                    <Key className="w-7 h-7 text-blue-500" />
                                </div>
                                <div className="text-center sm:text-left">
                                    <h4 className="font-bold text-navy-900 text-lg">
                                        Seguridad de Acceso
                                    </h4>
                                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                                        Protege tu cuenta con una contraseña
                                        robusta.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() =>
                                    window.open(
                                        "/auth/forgot-password",
                                        "_blank",
                                    )
                                }
                                className="w-full sm:w-auto px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition transform hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-xl shadow-blue-200/50"
                            >
                                Reestablecer Contraseña
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Coming Soon Sections */}
            <div className="bg-white/40 backdrop-blur-md p-6 sm:p-8 rounded-4xl border border-slate-200 border-dashed relative opacity-70 flex flex-col sm:flex-row items-center justify-between gap-6 group hover:bg-white/80 transition-all duration-500">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shrink-0 group-hover:scale-105 transition-transform duration-500">
                        <FileUp className="w-7 h-7" />
                    </div>
                    <div className="text-center sm:text-left">
                        <h3 className="font-bold text-lg text-slate-600">
                            Carga de Documentos Estratégicos
                        </h3>
                        <p className="text-slate-400 text-sm mt-0.5">
                            Procesa reportes empresariales y PDFs complejos con
                            el sistema.
                        </p>
                    </div>
                </div>
                <div className="px-4 py-1.5 bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200">
                    Próximamente
                </div>
            </div>

            {/* Modal de Edición de Campo Individual */}
            {editingField && (
                <Modal
                    title={`Actualizar ${
                        editingField === "firstName"
                            ? "Nombre"
                            : editingField === "lastName"
                              ? "Apellidos"
                              : "Dirección"
                    }`}
                    onClose={() => setEditingField(null)}
                >
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                {editingField === "firstName"
                                    ? "Nombre"
                                    : editingField === "lastName"
                                      ? "Apellidos"
                                      : "Dirección Física"}
                            </label>
                            <input
                                type="text"
                                value={fieldValue}
                                onChange={(e) => setFieldValue(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                placeholder={`Ingresa tu ${
                                    editingField === "firstName"
                                        ? "nombre"
                                        : editingField === "lastName"
                                          ? "apellidos"
                                          : "dirección"
                                }`}
                                autoFocus
                            />
                        </div>
                        <div className="pt-2 flex gap-3">
                            <button
                                onClick={() => setEditingField(null)}
                                className="flex-1 py-3 text-slate-500 text-sm font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleUpdateField}
                                disabled={isUpdatingProfile}
                                className="flex-2 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 disabled:opacity-50"
                            >
                                {isUpdatingProfile
                                    ? "Guardando..."
                                    : "Guardar Cambios"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Modal de Edición de Perfil */}
            {isEditingProfile && (
                <Modal
                    title="Actualizar Perfil Profesional"
                    onClose={() => setIsEditingProfile(false)}
                >
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    value={editFirstName}
                                    onChange={(e) =>
                                        setEditFirstName(e.target.value)
                                    }
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                    placeholder="Nombre"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Apellidos
                                </label>
                                <input
                                    type="text"
                                    value={editLastName}
                                    onChange={(e) =>
                                        setEditLastName(e.target.value)
                                    }
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                    placeholder="Apellidos"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Direccion Física
                            </label>
                            <input
                                type="text"
                                value={editAddress}
                                onChange={(e) => setEditAddress(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                placeholder="Ciudad, País o Dirección"
                            />
                        </div>
                        <div className="pt-4 flex gap-3">
                            <button
                                onClick={() => setIsEditingProfile(false)}
                                className="flex-1 py-3 text-slate-500 text-sm font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleUpdateProfile}
                                disabled={isUpdatingProfile}
                                className="flex-2 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 disabled:opacity-50"
                            >
                                {isUpdatingProfile
                                    ? "Guardando..."
                                    : "Guardar Cambios"}
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
