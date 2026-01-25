import { Cpu, Newspaper, Target, Sunrise, Briefcase, Calendar, BarChart2, Settings, Hexagon, Users, BookOpen, PieChart, Trello, FileSpreadsheet, HeartPulse, Crown, User, Shield, GraduationCap } from "lucide-react";

export const CONTEXT = {
    admin: {
        name: "Administrador",
        avatar: "AD",
        roleDesc: "System Admin",
        menu: [
            { id: 'nsg_intelligence', label: 'NSG Intelligence', subtitle: 'Sistema Central de Inteligencia', icon: Cpu, special: true },
            { id: 'nsg_clarity', label: 'NSG Clarity', subtitle: 'Claridad en tus Objetivos', icon: Target },
            { id: 'nsg_horizon', label: 'NSG Horizon', subtitle: 'Planificación y Proyección', icon: Sunrise },
            { id: 'nsg_education', label: 'NSG Education', subtitle: 'Estrategia y Aprendizaje', icon: GraduationCap },
            { id: 'nsg_news', label: 'NSG News', subtitle: 'Actualidad y Análisis Global', icon: Newspaper },

            // Clinic Modules
            { id: 'clinical_radar', label: 'Análisis Multiaxial', subtitle: 'Evaluación Clínica Integral', icon: Hexagon },
            { id: 'patients', label: 'Pacientes', subtitle: 'Gestión de Expedientes', icon: Users },

            // Manager Modules
            { id: 'metrics', label: 'P&L Financiero', subtitle: 'Métricas de Rendimiento', icon: PieChart },
            { id: 'strategy', label: 'M&A Pipeline', subtitle: 'Oportunidades de Negocio', icon: Trello },

            // Common / Util
            { id: 'calendar', label: 'Agenda Maestra', subtitle: 'Cronograma de Actividades', icon: Calendar },
            { id: 'library', label: 'Biblioteca', subtitle: 'Recursos y Documentación', icon: BookOpen },
            { id: 'user-management', label: 'Gestión de Usuarios', subtitle: 'Administrar Roles y Permisos', icon: Shield },
            { id: 'profile', label: 'Mi Perfil', subtitle: 'Información Personal', icon: User },
            { id: 'settings', label: 'Configuración', subtitle: 'Preferencias del Sistema', icon: Settings }
        ]
    },
    consultant: {
        name: "Dr. Arriaga",
        avatar: "DA",
        roleDesc: "Senior Consultant",
        menu: [
            { id: 'nsg_intelligence', label: 'NSG Intelligence', subtitle: 'Sistema Central de Inteligencia', icon: Cpu, special: true },
            { id: 'nsg_clarity', label: 'NSG Clarity', subtitle: 'Claridad en tus Objetivos', icon: Target },
            { id: 'nsg_horizon', label: 'NSG Horizon', subtitle: 'Planificación y Proyección', icon: Sunrise },
            { id: 'nsg_education', label: 'NSG Education', subtitle: 'Estrategia y Aprendizaje', icon: GraduationCap },
            { id: 'nsg_news', label: 'NSG News', subtitle: 'Actualidad y Análisis Global', icon: Newspaper },

            { id: 'calendar', label: 'Agenda Maestra', subtitle: 'Cronograma de Actividades', icon: Calendar },
            { id: 'reports', label: 'Inteligencia de Datos', subtitle: 'Análisis y Reportes', icon: BarChart2 },
            { id: 'profile', label: 'Mi Perfil', subtitle: 'Información Personal', icon: User },
            { id: 'settings', label: 'Configuración', subtitle: 'Preferencias del Sistema', icon: Settings }
        ]
    },
    psychologist: {
        name: "Lic. Sofia",
        avatar: "LS",
        roleDesc: "Clinical Lead",
        menu: [
            { id: 'nsg_intelligence', label: 'NSG Intelligence', subtitle: 'Sistema Central de Inteligencia', icon: Cpu, special: true },
            { id: 'nsg_clarity', label: 'NSG Clarity', subtitle: 'Claridad en tus Objetivos', icon: Target },
            { id: 'nsg_horizon', label: 'NSG Horizon', subtitle: 'Planificación y Proyección', icon: Sunrise },
            { id: 'nsg_education', label: 'NSG Education', subtitle: 'Estrategia y Aprendizaje', icon: GraduationCap },
            { id: 'nsg_news', label: 'NSG News', subtitle: 'Actualidad y Análisis Global', icon: Newspaper },
            { id: 'clinical_radar', label: 'Análisis Multiaxial', subtitle: 'Evaluación Clínica Integral', icon: Hexagon },
            { id: 'calendar', label: 'Agenda Maestra', subtitle: 'Cronograma de Actividades', icon: Calendar },
            { id: 'patients', label: 'Pacientes', subtitle: 'Gestión de Expedientes', icon: Users },
            { id: 'library', label: 'Biblioteca', subtitle: 'Recursos y Documentación', icon: BookOpen },
            { id: 'profile', label: 'Mi Perfil', subtitle: 'Información Personal', icon: User },
            { id: 'settings', label: 'Configuración', subtitle: 'Preferencias del Sistema', icon: Settings }

        ]
    },
    manager: {
        name: "Roberto V.",
        avatar: "RV",
        roleDesc: "CEO",
        menu: [
            { id: 'nsg_intelligence', label: 'NSG Intelligence', subtitle: 'Sistema Central de Inteligencia', icon: Cpu, special: true },
            { id: 'nsg_clarity', label: 'NSG Clarity', subtitle: 'Claridad en tus Objetivos', icon: Target },
            { id: 'nsg_horizon', label: 'NSG Horizon', subtitle: 'Planificación y Proyección', icon: Sunrise },
            { id: 'nsg_education', label: 'NSG Education', subtitle: 'Estrategia y Aprendizaje', icon: GraduationCap },
            { id: 'nsg_news', label: 'NSG News', subtitle: 'Actualidad y Análisis Global', icon: Newspaper },
            { id: 'calendar', label: 'Agenda Maestra', subtitle: 'Cronograma de Actividades', icon: Calendar },
            { id: 'reports', label: 'Reportes Board', subtitle: 'Informes Ejecutivos', icon: FileSpreadsheet },
            { id: 'profile', label: 'Mi Perfil', subtitle: 'Información Personal', icon: User },
            { id: 'settings', label: 'Configuración', subtitle: 'Preferencias del Sistema', icon: Settings }

        ]
    },
    user: {
        name: "Usuario",
        avatar: "US",
        roleDesc: "User",
        menu: [
            { id: 'nsg_intelligence', label: 'NSG Intelligence', subtitle: 'Sistema Central de Inteligencia', icon: Cpu, special: true },
            { id: 'nsg_clarity', label: 'NSG Clarity', subtitle: 'Claridad en tus Objetivos', icon: Target },
            { id: 'calendar', label: 'Agenda', subtitle: 'Citas y Recordatorios', icon: Calendar },
            { id: 'profile', label: 'Mi Perfil', subtitle: 'Información Personal', icon: User },
            { id: 'settings', label: 'Configuración', subtitle: 'Preferencias del Sistema', icon: Settings }
        ]
    },
    patient: {
        name: "Paciente",
        avatar: "PA",
        roleDesc: "Patient",
        menu: [
            { id: 'nsg_intelligence', label: 'NSG Intelligence', subtitle: 'Sistema Central de Inteligencia', icon: Cpu, special: true },
            { id: 'nsg_clarity', label: 'NSG Clarity', subtitle: 'Claridad en tus Objetivos', icon: Target },
            { id: 'nsg_horizon', label: 'NSG Horizon', subtitle: 'Planificación y Proyección', icon: Sunrise },
            { id: 'nsg_education', label: 'NSG Education', subtitle: 'Estrategia y Aprendizaje', icon: GraduationCap },
            { id: 'nsg_news', label: 'NSG News', subtitle: 'Actualidad y Análisis Global', icon: Newspaper },
            { id: 'wellness', label: 'Bienestar', subtitle: 'Salud y Balance Integral', icon: HeartPulse },
            { id: 'calendar', label: 'Agenda', subtitle: 'Citas y Recordatorios', icon: Calendar },
            { id: 'profile', label: 'Mi Perfil', subtitle: 'Información Personal', icon: User },
            { id: 'settings', label: 'Configuración', subtitle: 'Preferencias del Sistema', icon: Settings }

        ]
    }
};

export type RoleType = keyof typeof CONTEXT;
