"use client";

import React, { useState } from "react";
import {
    Bell,
    Shield,
    Moon,
    Activity,
    Globe,
    ExternalLink,
    Lock,
} from "lucide-react";
import BrandAtom from "@/components/ui/BrandAtom";
import { useToast } from "@/components/ui/ToastProvider";
import clsx from "clsx";
import { useAppStore } from "@/store/useAppStore";
import api from "@/lib/api";
import { authService } from "@/lib/auth";

// Define integration and preference configs by role
const INTEGRATIONS_CONFIG = {
    telegram: {
        id: "telegram",
        name: "Telegram",
        description: "Bot de notificaciones inteligentes",
        roles: [
            "admin",
            "consultant",
            "psychologist",
            "manager",
            "patient",
            "user",
        ],
        soon: false,
        icon: (
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                <path d="M11.944 0C5.352 0 0 5.352 0 11.944c0 6.592 5.352 11.944 11.944 11.944c6.592 0 11.944-5.352 11.944-11.944C23.888 5.352 18.536 0 11.944 0zm5.66 8.16l-1.928 9.096c-.144.644-.528.804-1.068.5l-2.936-2.164l-1.416 1.364c-.156.156-.288.288-.588.288l.212-3.04l5.524-4.992c.24-.212-.052-.332-.372-.12l-6.828 4.3l-2.948-.92c-.64-.2-.652-.64.132-.948l11.524-4.44c.532-.2.996.12.804.976z" />
            </svg>
        ),
        color: "[#0088cc]",
    },
    calendar: {
        id: "calendar",
        name: "Google Calendar",
        description: "Sincronización de eventos y reuniones",
        roles: [
            "admin",
            "consultant",
            "psychologist",
            "manager",
            "patient",
            "user",
        ],
        soon: false,
        icon: (
            <svg viewBox="0 0 24 24" className="w-6 h-6">
                <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                />
                <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                />
                <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                />
                <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                />
            </svg>
        ),
        color: "blue-600",
    },
    fathom: {
        id: "fathom",
        name: "Fathom Analytics",
        description: "Análisis de reuniones con IA",
        roles: ["admin", "consultant", "manager"],
        soon: false,
        icon: (
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                <path d="M3 3v18h18V3H3zm16 16H5V5h14v14zm-2-10h-3V7h3v2zm-4 0H6V7h7v2zm4 3h-3v-2h3v2zm-4 0H6v-2h7v2zm4 3h-3v-2h3v2zm-4 0H6v-2h7v2z" />
            </svg>
        ),
        color: "purple-600",
    },
    slack: {
        id: "slack",
        name: "Slack",
        description: "Notificaciones en tiempo real",
        roles: ["admin", "consultant", "manager"],
        soon: true,
        icon: (
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                <path d="M6 15a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2h2v2m1 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2a2 2 0 0 1-2-2v-5m2-8a2 2 0 0 1-2-2a2 2 0 0 1 2-2a2 2 0 0 1 2 2v2H9m0 1a2 2 0 0 1 2 2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2a2 2 0 0 1 2-2h5m8 2a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2h-2v-2m-1 0a2 2 0 0 1-2 2a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2a2 2 0 0 1 2 2v5m-2 8a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2v-2h2m0-1a2 2 0 0 1-2-2a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2a2 2 0 0 1-2 2h-5z" />
            </svg>
        ),
        color: "pink-600",
    },
};

const PREFERENCES_CONFIG = {
    notifications: {
        id: "notifications",
        title: "Notificaciones Inteligentes",
        desc: "Recibe alertas basadas en contexto y prioridad",
        icon: Bell,
        color: "blue",
        roles: [
            "admin",
            "consultant",
            "psychologist",
            "manager",
            "patient",
            "user",
        ],
        soon: false,
    },
    privacy: {
        id: "privacy",
        title: "Modo Privacidad Avanzada",
        desc: "Ocultar datos sensibles en dashboard compartido",
        icon: Shield,
        color: "purple",
        roles: ["admin", "psychologist", "patient", "user"],
        soon: false,
    },
    darkMode: {
        id: "darkMode",
        title: "Modo Oscuro",
        desc: "Activar interfaz oscura para reducir fatiga visual",
        icon: Moon,
        color: "indigo",
        roles: [
            "admin",
            "consultant",
            "psychologist",
            "manager",
            "patient",
            "user",
        ],
        soon: false,
    },
    sync: {
        id: "sync",
        title: "Sincronización en Tiempo Real",
        desc: "Mantener datos sincronizados automáticamente",
        icon: Globe,
        color: "emerald",
        roles: ["admin", "consultant", "psychologist", "manager"],
        soon: false,
    },
    ai: {
        id: "ai",
        title: "Asistente IA Avanzado",
        desc: "Sugerencias predictivas y automatización inteligente",
        icon: BrandAtom,
        color: "amber",
        roles: ["admin", "consultant", "manager"],
        soon: true,
    },
};

export default function Settings() {
    const { showToast } = useToast();
    const { theme, setTheme, userId, currentRole } = useAppStore();

    // Integrations state
    const [telegramId, setTelegramId] = useState<number | null>(null);
    const [isCalendarConnected, setIsCalendarConnected] = useState(false);
    const [isCheckingCalendar, setIsCheckingCalendar] = useState(false);
    const [isFathomConnected, setIsFathomConnected] = useState(false);
    const [isCheckingFathom, setIsCheckingFathom] = useState(false);

    // Preferences state
    const [preferences, setPreferences] = useState({
        notifications: true,
        privacy: false,
        darkMode: theme === "dark",
        sync: true,
        ai: false,
    });

    React.useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await authService.verifySession();
                if (data?.user?.telegram_id) {
                    setTelegramId(data.user.telegram_id);
                }
            } catch (error) {
                console.error("Error fetching session:", error);
            }
        };
        fetchUser();

        // Check Google Calendar connection
        const checkCalendar = async () => {
            setIsCheckingCalendar(true);
            try {
                const res = await api.get("/google/calendar/events");
                if (res.status === 200) {
                    setIsCalendarConnected(true);
                }
            } catch (error) {
                console.error("Calendar check failed:", error);
                setIsCalendarConnected(false);
            } finally {
                setIsCheckingCalendar(false);
            }
        };
        checkCalendar();

        // Check Fathom connection
        const checkFathom = async () => {
            setIsCheckingFathom(true);
            try {
                const res = await api.get("/fathom/status");
                if (res.status === 200 && res.data?.connected) {
                    setIsFathomConnected(true);
                }
            } catch (error) {
                console.error("Fathom check failed:", error);
                setIsFathomConnected(false);
            } finally {
                setIsCheckingFathom(false);
            }
        };
        checkFathom();
    }, []);

    const handleConnectCalendar = async () => {
        if (isCalendarConnected) {
            if (!confirm("¿Desvincular Google Calendar?")) return;
            try {
                await api.delete("/google/calendar");
                setIsCalendarConnected(false);
                showToast("Google Calendar desconectado", "info");
            } catch (error) {
                console.error(error);
                showToast("Error al desconectar", "error");
            }
        } else {
            try {
                const res = await api.get("/google/auth");
                if (res.data?.url) window.open(res.data.url, "_blank");
            } catch (error) {
                console.error(error);
                showToast("Error al conectar", "error");
            }
        }
    };

    const handleConnectFathom = async () => {
        if (isFathomConnected) {
            if (!confirm("¿Desvincular Fathom Analytics?")) return;
            try {
                await api.delete("/fathom/token");
                setIsFathomConnected(false);
                showToast("Fathom Analytics desconectado", "info");
            } catch (error) {
                console.error(error);
                showToast("Error al desconectar Fathom", "error");
            }
        } else {
            showToast("Conecta Fathom desde la sección NSG Horizon", "info");
        }
    };

    const togglePreference = (prefId: string) => {
        if (prefId === "darkMode") {
            const newTheme = theme === "dark" ? "light" : "dark";
            setTheme(newTheme);
            setPreferences((prev) => ({
                ...prev,
                darkMode: newTheme === "dark",
            }));
            showToast(`Tema cambiado`, "success");
        } else {
            setPreferences((prev) => ({
                ...prev,
                [prefId]: !prev[prefId as keyof typeof prev],
            }));
            showToast("Preferencia actualizada", "info");
        }
    };

    const availableIntegrations = Object.values(INTEGRATIONS_CONFIG).filter(
        (int) => int.roles.includes(currentRole || "patient"),
    );

    const availablePreferences = Object.values(PREFERENCES_CONFIG).filter(
        (pref) => pref.roles.includes(currentRole || "patient"),
    );

    const getIntegrationStatus = (integrationId: string) => {
        switch (integrationId) {
            case "telegram":
                return {
                    connected: !!telegramId,
                    text: telegramId ? `ID: ${telegramId}` : "No conectado",
                    loading: false,
                };
            case "calendar":
                return {
                    connected: isCalendarConnected,
                    text: isCalendarConnected ? "Sincronizado" : "No conectado",
                    loading: isCheckingCalendar,
                };
            case "fathom":
                return {
                    connected: isFathomConnected,
                    text: isFathomConnected ? "Sincronizado" : "No conectado",
                    loading: isCheckingFathom,
                };
            default:
                return {
                    connected: false,
                    text: "No disponible",
                    loading: false,
                };
        }
    };

    const handleIntegrationAction = (integrationId: string) => {
        switch (integrationId) {
            case "telegram":
                if (!telegramId)
                    window.open(
                        `https://t.me/nsg_preguntasyrespuestas_bot?start=${userId}`,
                        "_blank",
                    );
                else showToast("Telegram ya conectado", "info");
                break;
            case "calendar":
                handleConnectCalendar();
                break;
            case "fathom":
                handleConnectFathom();
                break;
            default:
                showToast("Próximamente disponible", "info");
        }
    };

    return (
        <div className="w-full max-w-[1600px] mx-auto space-y-6 py-6 px-2 xs:px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden bg-linear-to-r from-navy-950 via-navy-900 to-navy-950 px-5 py-5 sm:px-8 sm:py-6 rounded-3xl border border-navy-800/50 shadow-xl">
                <div className="w-full relative z-20">
                    <h2 className="font-display font-bold text-2xl lg:text-3xl tracking-tight text-white">
                        Configuración del{" "}
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-500">
                            Sistema NSG
                        </span>
                        .
                    </h2>
                    <p className="text-slate-300 text-sm mt-2 max-w-3xl leading-relaxed">
                        Personaliza tu experiencia neuronal y gestiona
                        integraciones de protocolo.
                    </p>
                </div>
            </div>

            <div className="bg-white p-5 xs:p-6 sm:p-8 rounded-4xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                        <ExternalLink className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-display font-bold text-xl text-navy-950">
                            Integraciones
                        </h3>
                        <p className="text-slate-500 text-sm">
                            Conecta tu cuenta con plataformas externas
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableIntegrations.map((integration) => {
                        const status = getIntegrationStatus(integration.id);
                        return (
                            <IntegrationCard
                                key={integration.id}
                                name={integration.name}
                                description={integration.description}
                                icon={integration.icon}
                                color={integration.color}
                                connected={status.connected}
                                connectedText={status.text}
                                loading={status.loading}
                                soon={integration.soon}
                                onAction={() =>
                                    handleIntegrationAction(integration.id)
                                }
                            />
                        );
                    })}
                </div>
            </div>

            <div className="bg-white p-5 xs:p-6 sm:p-8 rounded-4xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
                        <Activity className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                        <h3 className="font-display font-bold text-xl text-navy-950">
                            Preferencias del Sistema
                        </h3>
                        <p className="text-slate-500 text-sm">
                            Ajusta el comportamiento de la aplicación
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {availablePreferences.map((pref) => (
                        <ToggleItem
                            key={pref.id}
                            icon={pref.icon}
                            title={pref.title}
                            desc={pref.desc}
                            color={pref.color as any}
                            active={
                                preferences[pref.id as keyof typeof preferences]
                            }
                            soon={pref.soon}
                            onClick={() => togglePreference(pref.id)}
                        />
                    ))}
                </div>
            </div>

            <div className="bg-linear-to-br from-slate-50 to-slate-100 p-6 rounded-3xl border border-slate-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                            Versión del Sistema
                        </p>
                        <p className="font-bold text-2xl text-navy-900">
                            v1.0.0-BETA
                        </p>
                    </div>
                    <div className="text-left sm:text-right">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                            Última Actualización
                        </p>
                        <p className="font-medium text-sm text-slate-700">
                            18 Enero 2026
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface ToggleItemProps {
    icon: React.ElementType;
    title: string;
    desc: string;
    color: "blue" | "purple" | "orange" | "indigo" | "emerald" | "amber";
    active: boolean;
    soon?: boolean;
    onClick?: () => void;
}

function ToggleItem({
    icon: Icon,
    title,
    desc,
    color,
    active,
    soon,
    onClick,
}: ToggleItemProps) {
    const styles: Record<string, { container: string; iconBox: string }> = {
        blue: {
            container: "hover:border-blue-300",
            iconBox:
                "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
        },
        purple: {
            container: "hover:border-purple-300",
            iconBox:
                "bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
        },
        orange: {
            container: "hover:border-orange-300",
            iconBox:
                "bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white",
        },
        indigo: {
            container: "hover:border-indigo-300",
            iconBox:
                "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white",
        },
        emerald: {
            container: "hover:border-emerald-300",
            iconBox:
                "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
        },
        amber: {
            container: "hover:border-amber-300",
            iconBox:
                "bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white",
        },
    };

    const currentStyle = styles[color] || styles.blue;

    return (
        <div
            className={clsx(
                "relative flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 transition-all group",
                soon
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer hover:shadow-md",
                currentStyle.container,
            )}
            onClick={soon ? undefined : onClick}
        >
            <div className="flex items-center gap-4 flex-1">
                <div
                    className={clsx(
                        "p-3 rounded-xl transition-all",
                        currentStyle.iconBox,
                    )}
                >
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <p className="font-bold text-navy-900 text-sm mb-0.5">
                        {title}
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        {desc}
                    </p>
                </div>
            </div>
            {!soon ? (
                <div
                    className={clsx(
                        "relative w-12 h-6 rounded-full transition-colors shrink-0 ml-3",
                        active ? "bg-emerald-500" : "bg-slate-300",
                    )}
                >
                    <div
                        className={clsx(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                            active ? "right-1" : "left-1",
                        )}
                    />
                </div>
            ) : (
                <Lock className="w-5 h-5 text-slate-400 ml-3" />
            )}
        </div>
    );
}

interface IntegrationCardProps {
    name: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    connected: boolean;
    connectedText?: string;
    loading?: boolean;
    soon?: boolean;
    onAction: () => void;
}

function IntegrationCard({
    name,
    description,
    icon,
    color,
    connected,
    connectedText,
    loading,
    soon,
    onAction,
}: IntegrationCardProps) {
    return (
        <div
            className={clsx(
                "relative p-4 rounded-2xl border transition-all group",
                soon
                    ? "opacity-60 cursor-not-allowed"
                    : "cursor-pointer hover:shadow-md",
                connected
                    ? "bg-blue-50/50 border-blue-200"
                    : "bg-slate-50 border-slate-200 hover:border-slate-300",
            )}
        >
            <div className="flex items-start gap-4 mb-4">
                <div
                    className={clsx(
                        "w-12 h-12 rounded-xl flex items-center justify-center bg-white",
                        connected && "shadow-md",
                    )}
                >
                    <div
                        className={clsx(
                            connected ? `text-${color}` : "text-slate-400",
                        )}
                    >
                        {icon}
                    </div>
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-navy-900 text-sm mb-1">
                        {name}
                    </h4>
                    <p className="text-[0.7rem] text-slate-500">
                        {description}
                    </p>
                </div>
            </div>
            <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-slate-500">Estado:</span>
                <span
                    className={clsx(
                        "font-bold",
                        connected ? "text-emerald-600" : "text-slate-400",
                    )}
                >
                    {connectedText ||
                        (connected ? "Conectado" : "No conectado")}
                </span>
            </div>
            <button
                onClick={soon ? undefined : onAction}
                disabled={loading || soon}
                className={clsx(
                    "w-full py-2 px-4 rounded-xl text-xs font-bold transition",
                    soon
                        ? "bg-slate-100 text-slate-400"
                        : connected
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : `bg-${color} text-white hover:opacity-90`,
                )}
            >
                {loading
                    ? "..."
                    : soon
                      ? "Próximamente"
                      : connected
                        ? "Desconectar"
                        : "Conectar"}
            </button>
        </div>
    );
}
