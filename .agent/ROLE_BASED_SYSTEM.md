# Role-Based Dashboard System - Implementation Summary

## Overview
The BS Intelligence platform now has a complete role-based access control system where each user role (Consultant, Psychologist, Manager, Patient) has exclusive access to specific views and features.

## How It Works

### 1. **Landing Page → Role Selection** (`app/page.tsx`)
When users click on a role card (Paciente/Psicólogo/Directivo/Consultor), they are:
- Assigned that role in the global state (Zustand store)
- Redirected to `/dashboard`

### 2. **Dashboard Dispatcher** (`app/dashboard/page.tsx`)
The dispatcher:
- Checks if the user has a role assigned
- Redirects to the default view for that role (currently `nsg_ios` for all roles)
- Example: `/dashboard` → `/dashboard/nsg_ios`

### 3. **Dynamic View Router** (`app/dashboard/[view]/page.tsx`)
This is where the magic happens:
- Uses Next.js dynamic routing with `[view]` parameter
- Checks if the current role has access to the requested view
- Loads the appropriate component if access is granted
- Shows "Access Denied" message if the role doesn't have permission

## Role-Based View Access

### **Consultant** (Dr. Arriaga)
✅ Available Views:
- `nsg_ios` - BS Intelligence (Main System)
- `nsg_news` - NSG News
- `nsg_clarity` - NSG Clarity
- `nsg_horizon` - NSG Horizon
- `portfolio` - Cartera de Activos ⭐ *Exclusive to Consultant & Manager*
- `calendar` - Agenda Maestra
- `reports` - Inteligencia de Datos
- `settings` - Configuración

### **Psychologist** (Lic. Sofia)
✅ Available Views:
- `nsg_ios` - BS Intelligence (Main System)
- `nsg_news` - NSG News
- `nsg_clarity` - NSG Clarity
- `nsg_horizon` - NSG Horizon
- `clinical_radar` - Análisis Multiaxial ⭐ *Exclusive to Psychologist*
- `calendar` - Agenda Maestra
- `patients` - Pacientes ⭐ *Exclusive to Psychologist*
- `library` - Biblioteca

### **Manager** (Roberto V. - CEO)
✅ Available Views:
- `nsg_ios` - BS Intelligence (Main System)
- `nsg_news` - NSG News
- `nsg_clarity` - NSG Clarity
- `nsg_horizon` - NSG Horizon
- `calendar` - Agenda Maestra
- `metrics` - P&L Financiero ⭐ *Exclusive to Manager*
- `strategy` - M&A Pipeline ⭐ *Exclusive to Manager*
- `reports` - Reportes Board
- `portfolio` - Cartera de Activos ⭐ *Exclusive to Consultant & Manager*

### **Patient** (Paciente)
✅ Available Views:
- `nsg_ios` - BS Intelligence (Main System)
- `wellness` - Bienestar ⭐ *Exclusive to Patient*
- `calendar` - Agenda

## File Structure

```
app/
├── layout.tsx                    # Root layout with <html> & <body>
├── page.tsx                      # Landing page (role selection)
├── globals.css
└── dashboard/
    ├── layout.tsx                # Dashboard layout (Sidebar, TopNav, etc.)
    ├── page.tsx                  # Dispatcher (redirects to default view)
    └── [view]/
        └── page.tsx              # Dynamic view router with access control

components/
└── views/
    ├── NSGSystem.tsx             # nsg_ios
    ├── NSGNews.tsx               # nsg_news
    ├── NSGClarity.tsx            # nsg_clarity
    ├── NSGHorizon.tsx            # nsg_horizon
    ├── Portfolio.tsx             # portfolio (Consultant, Manager only)
    ├── ClinicalRadar.tsx         # clinical_radar (Psychologist only)
    ├── Patients.tsx              # patients (Psychologist only)
    ├── Metrics.tsx               # metrics (Manager only)
    ├── Strategy.tsx              # strategy (Manager only)
    ├── Wellness.tsx              # wellness (Patient only)
    ├── CalendarView.tsx          # calendar
    ├── Reports.tsx               # reports
    ├── Library.tsx               # library
    └── Settings.tsx              # settings

data/
└── context.ts                    # Role definitions and menu items

lib/
└── gemini/
    └── systemInstructions.ts     # AI personality per role
```

## Key Features

### ✅ **Role-Based Access Control**
Each role can only access specific views. Attempting to access a restricted view shows an "Access Denied" message.

### ✅ **Dynamic Routing**
Uses Next.js 15 dynamic routes with the `[view]` parameter for clean URLs:
- `/dashboard/nsg_ios`
- `/dashboard/portfolio`
- `/dashboard/clinical_radar`

### ✅ **Lazy Loading**
All view components are dynamically imported for optimal performance.

### ✅ **Type Safety**
Full TypeScript support with proper types for roles and views.

### ✅ **AI Personality per Role**
Each role has a customized AI assistant with appropriate tone and focus areas.

## How to Add a New View

1. **Create the component** in `components/views/YourView.tsx`
2. **Add to the Views map** in `app/dashboard/[view]/page.tsx`:
   ```tsx
   your_view: dynamic(() => import("@/components/views/YourView")),
   ```
3. **Add to role access** in `RoleViewAccess`:
   ```tsx
   consultant: [..., 'your_view'],
   ```
4. **Add to menu** in `data/context.ts`:
   ```tsx
   { id: 'your_view', label: 'Your View', icon: YourIcon }
   ```

## Testing the System

1. **Start the dev server**: `npm run dev`
2. **Open**: `http://localhost:3000`
3. **Select a role** (e.g., Psicólogo)
4. **Verify**: You're redirected to `/dashboard/nsg_ios`
5. **Try accessing exclusive views**:
   - ✅ `/dashboard/clinical_radar` - Should work for Psychologist
   - ❌ `/dashboard/portfolio` - Should show "Access Denied"

## Fixed Issues

✅ Fixed missing `<html>` and `<body>` tags in root layout
✅ Fixed role names from Spanish to English (consultant, psychologist, manager, patient)
✅ Fixed dynamic routing structure (`[view]` instead of `view/[view]`)
✅ Fixed typo in systemInstructions.ts (`patiet` → `patient`)
✅ Implemented role-based view access control
✅ Added DynamicIsland mode selector with dropdown

---

**Status**: ✅ All systems operational. The dashboard is now fully functional with role-based access control!
