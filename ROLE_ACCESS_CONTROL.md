# ✅ Control de Acceso por Roles - Implementación

## 📋 Resumen

Se ha implementado **control de acceso basado en roles** para restringir **P&L Financiero** y **M&A Pipeline** solo a usuarios con rol `admin`.

---

## 🔒 Cambios Implementados

### 1. **Restricción de Menú** (`data/context.ts`)

**Antes**: Ambos módulos visible en roles `admin` y `manager`  
**Ahora**: Solo visible para rol `admin`

```typescript
manager: {
    menu: [
        // P&L Financiero y M&A Pipeline REMOVIDOS
        // Ahora solo accesibles por admin
    ];
}
```

### 2. **Componente de Protección** (`components/RoleGuard.tsx`)

Creado componente reutilizable para proteger vistas:

```tsx
<RoleGuard allowedRoles={["admin"]}>
    <YourProtectedContent />
</RoleGuard>
```

**Características**:

-   ✅ Verifica rol actual del usuario
-   ✅ Muestra mensaje de "Acceso Restringido" si no autorizado
-   ✅ Indica qué rol tiene el usuario
-   ✅ Botón para volver al dashboard
-   ✅ UI profesional con glassmorphism

### 3. **Protección de Componentes**

Los siguientes componentes ahora están protegidos:

#### **Metrics.tsx** (P&L Financiero)

```tsx
export default function Metrics() {
    return (
        <RoleGuard allowedRoles={["admin"]}>
            {/* Contenido de métricas financieras */}
        </RoleGuard>
    );
}
```

#### **Strategy.tsx** (M&A Pipeline)

```tsx
export default function Strategy() {
    return (
        <RoleGuard allowedRoles={["admin"]}>
            {/* Contenido de pipeline M&A */}
        </RoleGuard>
    );
}
```

---

## 🎯 Comportamiento

### **Usuario con rol `admin`**

1. ✅ Ve "P&L Financiero" y "M&A Pipeline" en el menú lateral
2. ✅ Puede acceder a ambas vistas sin restricciones
3. ✅ Contenido completo visible

### **Usuario con otro rol** (manager, consultant, psychologist, patient)

1. ❌ NO ve "P&L Financiero" ni "M&A Pipeline" en el menú
2. ❌ Si intenta acceder directamente a la URL:
    - Se muestra pantalla de "Acceso Restringido"
    - Mensaje: "No tienes permisos para acceder a esta sección"
    - Indica su rol actual
    - Botón para volver al dashboard

---

## 📊 Pantalla de Acceso Restringido

Cuando un usuario no autorizado intenta acceder:

```
┌─────────────────────────────────────┐
│         [Icono Escudo Rojo]         │
│                                     │
│      Acceso Restringido             │
│                                     │
│  No tienes permisos para acceder    │
│  a esta sección. Esta funcionalidad │
│  solo está disponible para usuarios │
│  con rol de admin.                  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Tu rol actual: manager        │  │
│  └───────────────────────────────┘  │
│                                     │
│  [Volver al Dashboard]              │
└─────────────────────────────────────┘
```

---

## 🔧 Configuración de Roles

Los roles están definidos en `store/useAppStore.ts`:

```typescript
export type Role =
    | "consultant"
    | "psychologist"
    | "manager"
    | "patient"
    | "admin";
```

### Distribución de Acceso:

| Módulo             | admin | manager | consultant | psychologist | patient |
| ------------------ | ----- | ------- | ---------- | ------------ | ------- |
| **P&L Financiero** | ✅    | ❌      | ❌         | ❌           | ❌      |
| **M&A Pipeline**   | ✅    | ❌      | ❌         | ❌           | ❌      |
| NSG Intelligence   | ✅    | ✅      | ✅         | ✅           | ✅      |
| NSG Clarity        | ✅    | ✅      | ✅         | ✅           | ✅      |
| NSG News           | ✅    | ✅      | ✅         | ✅           | ✅      |
| NSG Horizon        | ✅    | ✅      | ✅         | ✅           | ❌      |
| Calendario         | ✅    | ✅      | ✅         | ✅           | ✅      |

---

## 🚀 Uso del RoleGuard

### Básico

```tsx
import RoleGuard from "@/components/RoleGuard";

<RoleGuard allowedRoles={["admin"]}>
    <SensitiveContent />
</RoleGuard>;
```

### Múltiples Roles

```tsx
<RoleGuard allowedRoles={["admin", "manager"]}>
    <ManagerContent />
</RoleGuard>
```

### Con Redirect Personalizado

```tsx
<RoleGuard allowedRoles={["admin"]} redirectTo="/unauthorized">
    <AdminOnly />
</RoleGuard>
```

---

## 🔐 Seguridad

### Frontend (Implementado) ✅

-   Menú oculta opciones no disponibles
-   RoleGuard protege componentes
-   Mensaje de error si acceso directo por URL

### Backend (Recomendado para producción) ⚠️

Aunque el frontend está protegido, para **seguridad completa** se recomienda:

1. **Proteger endpoints de API en el backend**

    ```javascript
    // NSG-Backend
    router.get("/metrics", auth_required, admin_required, getMetrics);
    router.get("/strategy", auth_required, admin_required, getStrategy);
    ```

2. **Verificar rol en cada request**
    - JWT debe incluir el rol del usuario
    - Backend valida el rol antes de retornar datos sensibles

---

## 📝 Archivos Modificados

### Creados:

-   ✅ `components/RoleGuard.tsx`

### Modificados:

-   ✅ `data/context.ts` - Menu del rol manager
-   ✅ `components/views/Metrics.tsx` - Protección agregada
-   ✅ `components/views/Strategy.tsx` - Protección agregada

---

## ✅ Testing

### Probar como admin:

1. Cambiar rol a `admin` en la UI
2. Verificar que "P&L Financiero" y "M&A Pipeline" aparecen en menú
3. Acceder a ambas vistas → ✅ Debe funcionar

### Probar como manager:

1. Cambiar rol a `manager` en la UI
2. Verificar que NO aparecen en menú
3. Intentar acceder vía URL directa → ❌ Debe mostrar "Acceso Restringido"

---

## 🎨 UI/UX

-   ✅ Pantalla de error profesional con glassmorphism
-   ✅ Mensaje claro sobre por qué no tiene acceso
-   ✅ Indicador visual del rol actual
-   ✅ Botón para volver al dashboard
-   ✅ Responsive y accesible

---

**Estado**: ✅ **COMPLETADO**  
**Fecha**: 2026-01-11  
**Protección**: Frontend ✅ | Backend ⚠️ (recomendado)
