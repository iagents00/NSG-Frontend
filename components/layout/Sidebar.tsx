"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useUIStore } from "@/store/useUIStore";
import { CONTEXT, RoleType } from "@/data/context";
import {
    LogOut,
    Activity,
    X,
    User,
    Settings,
    ChevronDown,
    Lock,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "@/lib/auth";
import clsx from "clsx";
import BrandAtom from "@/components/ui/BrandAtom";
import LocationIndicator from "./LocationIndicator";

interface MenuItem {
    id: string;
    label: string;
    subtitle: string;
    icon: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    special?: boolean;
}

export default function Sidebar() {
    const { currentRole, setRole } = useAppStore();
    const { isSidebarOpen, toggleSidebar } = useUIStore();
    const pathname = usePathname();
    const router = useRouter();

    const [firstName, setFirstName] = useState<string | null>(null);
    const [lastName, setLastName] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const roleKey = (currentRole as RoleType) || "patient";
    const config = CONTEXT[roleKey] || CONTEXT.patient;

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await authService.verifySession();
                if (data?.user) {
                    setFirstName(data.user.firstName);
                    setLastName(data.user.lastName);
                    setUserId(data.user.id);
                    if (data.user.role) {
                        setRole(data.user.role as RoleType);
                    }
                }
            } catch (error) {
                console.error("Error fetching user session in Sidebar:", error);
            }
        };
        fetchUser();
    }, [setRole]);

    const getDisplayName = () => {
        if (firstName || lastName) {
            return `${firstName || ""} ${lastName || ""}`.trim();
        }
        return `user-bs${userId?.substring(0, 6) || ""}`;
    };

    // Generate avatar initials
    const getAvatarInitials = () => {
        if (firstName && lastName) {
            return (firstName[0] + lastName[0]).toUpperCase();
        }
        if (firstName) return firstName.substring(0, 2).toUpperCase();
        return "BS"; // User BS
    };

    // Get avatar color based on ID
    const getAvatarColor = () => {
        const colors = [
            "bg-blue-600",
            "bg-teal-600",
            "bg-emerald-600",
            "bg-green-600",
            "bg-orange-600",
            "bg-cyan-600",
        ];
        const seed = userId || "guest";
        const hash = seed
            .split("")
            .reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    // Group menu items
    const groupedMenu = (config?.menu as MenuItem[] | undefined)?.reduce(
        (
            acc: {
                intelligence: MenuItem | null;
                nsgModules: MenuItem[];
                other: MenuItem[];
            },
            item: MenuItem,
        ) => {
            if (item.id === "nsg_intelligence") {
                acc.intelligence = item;
            } else if (
                [
                    "nsg_copilot",
                    "nsg_horizon",
                    "nsg_news",
                    "nsg_education",
                ].includes(item.id)
            ) {
                acc.nsgModules.push(item);
            } else {
                acc.other.push(item);
            }
            return acc;
        },
        { intelligence: null, nsgModules: [], other: [] },
    ) || { intelligence: null, nsgModules: [], other: [] };

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={clsx(
                    "fixed inset-0 bg-navy-950/80 z-80 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
                    isSidebarOpen
                        ? "opacity-100 block"
                        : "opacity-0 hidden pointer-events-none",
                )}
                onClick={toggleSidebar}
            />

            {/* Main Sidebar Container */}
            <aside
                className={clsx(
                    "fixed lg:static inset-y-0 left-0 w-full xs:w-64 sm:w-72 bg-navy-950 flex flex-col text-slate-400 border-r border-navy-900 shadow-2xl z-90 transition-transform duration-300 ease-in-out transform h-full",
                    isSidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full lg:translate-x-0",
                )}
            >
                {/* HEADER */}
                <div className="h-16 xs:h-20 flex items-center px-4 xs:px-6 border-b border-navy-900 justify-between bg-navy-950/50 backdrop-blur-md sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-2 xs:gap-3">
                        <div className="w-6 h-6 xs:w-8 xs:h-8 relative shrink-0">
                            <BrandAtom
                                variant="colored"
                                className="w-full h-full"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-display font-bold text-white text-base xs:text-lg tracking-tight leading-none">
                                BS{" "}
                                <span className="font-normal text-blue-400">
                                    Intelligence
                                </span>
                            </span>
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">
                                {config?.roleDesc || "User"}
                            </span>
                        </div>
                    </div>

                    <button
                        className="lg:hidden p-2 text-slate-500 hover:text-white transition cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                        onClick={toggleSidebar}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* USER PROFILE with Dropdown */}
                <div className="px-4 xs:px-6 py-3 xs:py-4 shrink-0 relative">
                    <div
                        className="flex items-center gap-3 bg-white/5 p-2.5 rounded-xl border border-white/5 group transition-all hover:bg-white/10 cursor-pointer"
                        onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                        {/* Avatar with initials */}
                        <div
                            className={clsx(
                                "w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg border border-white/10 group-hover:scale-105 transition-transform",
                                getAvatarColor(),
                            )}
                        >
                            {getAvatarInitials()}
                        </div>
                        <div className="overflow-hidden flex-1">
                            <p className="text-xs font-bold text-white truncate leading-none mb-1">
                                {getDisplayName()}
                            </p>
                            <p className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest truncate">
                                {config?.roleDesc || "GUEST"}
                            </p>
                        </div>
                        <ChevronDown
                            className={clsx(
                                "w-4 h-4 text-slate-500 transition-transform",
                                showUserMenu && "rotate-180",
                            )}
                        />
                    </div>

                    {/* Dropdown Menu */}
                    {showUserMenu && (
                        <div className="absolute top-full left-6 right-6 mt-2 bg-navy-900 border border-navy-800 rounded-xl shadow-xl z-50 overflow-hidden">
                            <Link
                                href="/dashboard/profile"
                                className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition cursor-pointer"
                                onClick={() => setShowUserMenu(false)}
                            >
                                <User className="w-4 h-4" />
                                Mi Perfil
                            </Link>
                            <Link
                                href="/dashboard/settings"
                                className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition cursor-pointer border-t border-navy-800"
                                onClick={() => setShowUserMenu(false)}
                            >
                                <Settings className="w-4 h-4" />
                                Configuración
                            </Link>
                        </div>
                    )}
                </div>

                {/* MENU NAVIGATION with Groups */}
                <nav className="flex-1 px-4 space-y-4 overflow-y-auto sidebar-scroll pb-6">
                    {/* BS Intelligence - Special highlighting */}
                    {groupedMenu.intelligence && (
                        <div className="pt-2">
                            <Link
                                href={`/dashboard/${groupedMenu.intelligence.id}`}
                                onClick={() => {
                                    if (window.innerWidth < 1024)
                                        toggleSidebar();
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer group relative overflow-hidden bg-linear-to-r from-blue-600/20 to-blue-500/10 border border-blue-500/30 text-blue-200 hover:text-white hover:border-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                            >
                                <BrandAtom className="w-5 h-5 relative z-10" />
                                <span className="truncate flex-1 relative z-10 font-semibold">
                                    {groupedMenu.intelligence.label}
                                </span>
                                <div className="absolute inset-0 bg-linear-to-r from-blue-600/0 via-blue-500/10 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </Link>
                        </div>
                    )}

                    {/* NSG Modules Group */}
                    {groupedMenu.nsgModules.length > 0 && (
                        <div>
                            <div className="px-3 mb-2">
                                <p className="text-[0.65rem] font-black text-slate-600 uppercase tracking-widest">
                                    I Modules
                                </p>
                            </div>
                            <div className="space-y-0.5">
                                {groupedMenu.nsgModules.map(
                                    (item: MenuItem) => {
                                        const Icon = item.icon;
                                        const targetPath = `/dashboard/${item.id}`;
                                        const isActive =
                                            pathname === targetPath;
                                        const comingSoonSections = [
                                            "nsg_news",
                                            "clinical_radar",
                                            "patients",
                                            "library",
                                        ];
                                        // Admin puede acceder a todas las secciones
                                        const isComingSoon =
                                            currentRole !== "admin" &&
                                            comingSoonSections.includes(
                                                item.id,
                                            );

                                        return (
                                            <Link
                                                key={item.id}
                                                href={targetPath}
                                                onClick={() => {
                                                    if (
                                                        window.innerWidth < 1024
                                                    )
                                                        toggleSidebar();
                                                }}
                                                className={clsx(
                                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer group relative",
                                                    "focus:outline-none active:scale-[0.98]",
                                                    isActive
                                                        ? "text-white bg-white/10 border-l-4 border-blue-500 pl-3 shadow-[inset_0_0_10px_rgba(59,130,246,0.1)]"
                                                        : "text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1 border-l-4 border-transparent pl-3",
                                                )}
                                            >
                                                <Icon
                                                    className={clsx(
                                                        "w-4.5 h-4.5 transition-colors",
                                                        isActive
                                                            ? "text-blue-400"
                                                            : "text-slate-500 group-hover:text-blue-400",
                                                    )}
                                                />
                                                <span className="truncate flex-1">
                                                    {item.label}
                                                </span>
                                                {isComingSoon && (
                                                    <span className="text-[0.55rem] font-black px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 uppercase tracking-wider flex items-center gap-1">
                                                        <Lock className="w-2.5 h-2.5" />
                                                        Próximamente
                                                    </span>
                                                )}
                                            </Link>
                                        );
                                    },
                                )}
                            </div>
                        </div>
                    )}

                    {/* Other Items Group */}
                    {groupedMenu.other.length > 0 && (
                        <div>
                            <div className="px-3 mb-2">
                                <p className="text-[0.65rem] font-black text-slate-600 uppercase tracking-widest">
                                    Tools
                                </p>
                            </div>
                            <div className="space-y-0.5">
                                {groupedMenu.other.map((item: any) => {
                                    const Icon = item.icon;
                                    const targetPath = `/dashboard/${item.id}`;
                                    const isActive = pathname === targetPath;
                                    const comingSoonSections = [
                                        "nsg_news",
                                        "clinical_radar",
                                        "patients",
                                        "library",
                                    ];
                                    // Admin puede acceder a todas las secciones
                                    const isComingSoon =
                                        currentRole !== "admin" &&
                                        comingSoonSections.includes(item.id);

                                    return (
                                        <Link
                                            key={item.id}
                                            href={targetPath}
                                            onClick={() => {
                                                if (window.innerWidth < 1024)
                                                    toggleSidebar();
                                            }}
                                            className={clsx(
                                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer group relative",
                                                "focus:outline-none active:scale-[0.98]",
                                                isActive
                                                    ? "text-white bg-white/10 border-l-4 border-blue-500 pl-3 shadow-[inset_0_0_10px_rgba(59,130,246,0.1)]"
                                                    : "text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1 border-l-4 border-transparent pl-3",
                                            )}
                                        >
                                            <Icon
                                                className={clsx(
                                                    "w-4.5 h-4.5 transition-colors",
                                                    isActive
                                                        ? "text-blue-400"
                                                        : "text-slate-500 group-hover:text-blue-400",
                                                )}
                                            />
                                            <span className="truncate flex-1">
                                                {item.label}
                                            </span>
                                            {isComingSoon && (
                                                <span className="text-[0.55rem] font-black px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 uppercase tracking-wider flex items-center gap-1">
                                                    <Lock className="w-2.5 h-2.5" />
                                                    Próximamente
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </nav>

                {/* BOTTOM SECTION */}
                <div className="p-4 border-t border-navy-900 bg-navy-950 shrink-0 space-y-3">
                    <div className="space-y-1">
                        <div className="flex items-center justify-between px-2 py-1 text-[0.5rem] font-medium uppercase tracking-wider bg-emerald-500/5 rounded border border-emerald-500/10">
                            <span className="text-slate-500 flex items-center gap-1">
                                <Activity className="w-2 h-2 text-emerald-400" />{" "}
                                System
                            </span>
                            <span className="text-emerald-400 font-bold">
                                OPTIMAL
                            </span>
                        </div>
                        {/* Only show Location for admin users */}
                        {currentRole === "admin" && <LocationIndicator />}
                    </div>
                    <div className="border-t border-navy-800/50"></div>
                    <button
                        onClick={() => {
                            authService.logout();
                            router.push("/auth/login");
                        }}
                        className="flex items-center justify-center gap-2.5 text-xs font-bold text-slate-400 hover:text-red-400 transition-all w-full py-2.5 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20 group cursor-pointer uppercase tracking-wider"
                    >
                        <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Custom Scrollbar Styles */}
            <style jsx global>{`
                .sidebar-scroll::-webkit-scrollbar {
                    width: 6px;
                }
                .sidebar-scroll::-webkit-scrollbar-track {
                    background: rgba(15, 23, 42, 0.3);
                    border-radius: 10px;
                }
                .sidebar-scroll::-webkit-scrollbar-thumb {
                    background: rgba(100, 116, 139, 0.3);
                    border-radius: 10px;
                }
                .sidebar-scroll::-webkit-scrollbar-thumb:hover {
                    background: rgba(148, 163, 184, 0.5);
                }
                .sidebar-scroll {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(100, 116, 139, 0.3)
                        rgba(15, 23, 42, 0.3);
                }
            `}</style>
        </>
    );
}
