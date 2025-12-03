import { Role } from "@/store/useAppStore";
import { Cpu, Newspaper, Target, Sunrise, Briefcase, Calendar, BarChart2, Settings, Hexagon, Users, BookOpen, PieChart, Trello, FileSpreadsheet } from "lucide-react";

export const CONTEXT = {
    consultant: { 
        name: "Dr. Arriaga", 
        avatar: "DA", 
        roleDesc: "Senior Consultant", 
        menu: [
            { id: 'nsg_ios', label: 'NSG Intelligence', icon: Cpu, special: true },
            { id: 'nsg_news', label: 'NSG News', icon: Newspaper },
            { id: 'accountability', label: 'NSG Clarity', icon: Target },
            { id: 'nsg_horizon', label: 'NSG Horizon', icon: Sunrise },
            { id: 'portfolio', label: 'Cartera de Activos', icon: Briefcase },
            { id: 'calendar', label: 'Agenda Maestra', icon: Calendar },
            { id: 'reports', label: 'Inteligencia de Datos', icon: BarChart2 },
            { id: 'settings', label: 'Configuración', icon: Settings }
        ] 
    },
    psychologist: { 
        name: "Lic. Sofia", 
        avatar: "LS", 
        roleDesc: "Clinical Lead", 
        menu: [ 
            { id: 'nsg_ios', label: 'NSG Intelligence', icon: Cpu, special: true }, 
            { id: 'nsg_news', label: 'NSG News', icon: Newspaper }, 
            { id: 'accountability', label: 'NSG Clarity', icon: Target }, 
            { id: 'nsg_horizon', label: 'NSG Horizon', icon: Sunrise }, 
            { id: 'clinical_radar', label: 'Análisis Multiaxial', icon: Hexagon }, 
            { id: 'calendar', label: 'Agenda Maestra', icon: Calendar }, 
            { id: 'patients', label: 'Pacientes', icon: Users }, 
            { id: 'library', label: 'Biblioteca', icon: BookOpen } 
        ] 
    },
    sales: { // Mapped from 'directivo' in original HTML but user requested 'sales' role in store?
             // Original HTML had 'directivo'. User plan mentioned 'Sales' and 'Manager'.
             // I'll map 'sales' to a new config or 'directivo'.
             // Let's create a Sales config.
        name: "Director Comercial",
        avatar: "DC",
        roleDesc: "Sales Director",
        menu: [
            { id: 'nsg_ios', label: 'NSG Intelligence', icon: Cpu, special: true },
            { id: 'pipeline', label: 'Pipeline', icon: Trello },
            { id: 'leads', label: 'Leads', icon: Users },
            { id: 'calendar', label: 'Agenda', icon: Calendar }
        ]
    },
    manager: { // Directivo
        name: "Roberto V.", 
        avatar: "RV", 
        roleDesc: "CEO", 
        menu: [ 
            { id: 'nsg_ios', label: 'NSG Intelligence', icon: Cpu, special: true }, 
            { id: 'nsg_news', label: 'NSG News', icon: Newspaper }, 
            { id: 'accountability', label: 'NSG Clarity', icon: Target }, 
            { id: 'nsg_horizon', label: 'NSG Horizon', icon: Sunrise }, 
            { id: 'calendar', label: 'Agenda Maestra', icon: Calendar }, 
            { id: 'metrics', label: 'P&L Financiero', icon: PieChart }, 
            { id: 'strategy', label: 'M&A Pipeline', icon: Trello }, 
            { id: 'reports', label: 'Reportes Board', icon: FileSpreadsheet } 
        ] 
    },
    // Adding 'paciente' if needed, but store type didn't include it. 
    // Store type: 'consultant' | 'psychologist' | 'sales' | 'manager'.
};
