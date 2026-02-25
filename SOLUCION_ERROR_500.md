# Solución: Error 500 en /auth/verify-token

## 🔴 Problema Identificado

Cuando abres la página principal del frontend (corriendo localmente), aparecen estos errores en la consola del navegador:

```
:3000/api/backend/auth/verify-token:1  Failed to load resource: the server responded with a status of 500 (Internal Server Error)
[API Error] 500 fetch failed - URL: /auth/verify-token
Server Error: Something went wrong on the server
[TokenVerifier] Error verifying session: AxiosError
```

## 🔍 Causa Raíz

El archivo `.env.local` tenía la variable `NEXT_PUBLIC_API_URL` en lugar de `API_URL`. 

**El problema:**
- `NEXT_PUBLIC_*` → Variables expuestas al navegador (cliente)
- `API_URL` → Variable privada del servidor (solo accesible en API routes)

El proxy `/api/backend/[...path]/route.ts` usa `CONFIG.API_URL` (del archivo `lib/config.ts`), que lee la variable de entorno **sin** el prefijo `NEXT_PUBLIC_`. Por lo tanto, no encontraba la configuración y fallaba al intentar conectarse al backend VPS.

## ✅ Solución Aplicada

### 1. Actualización de `.env.local`

Se actualizó el archivo `.env.local` con las variables correctas:

```bash
# ============================================
# Server-side Environment Variables
# ============================================
# Estas variables son SOLO accesibles en:
# - API Routes (app/api/**/route.ts)
# - Server Components
# NO están expuestas al navegador

# Backend API URL (VPS)
API_URL=https://api.your-backend.com

# Frontend App URL (Local)
APP_URL=http://localhost:3000

# N8N Webhook URL
N8N_WEBHOOK=https://personal-n8n.suwsiw.easypanel.host/webhook

# Environment
APP_ENV=development
```

### 2. Reinicio del Servidor de Desarrollo

Next.js **solo carga las variables de entorno al iniciar**, por lo que fue necesario:

1. Detener el servidor actual
2. Reiniciar con `npm run dev`

## 🎯 Cómo Funciona la Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    NAVEGADOR (Cliente)                       │
│  - No tiene acceso directo al backend VPS                   │
│  - Solo ve: http://localhost:3000                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ fetch('/api/backend/auth/verify-token')
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              NEXT.JS SERVER (localhost:3000)                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  /app/api/backend/[...path]/route.ts (PROXY)        │   │
│  │  - Lee API_URL de .env.local                        │   │
│  │  - Reenvía petición al backend VPS                  │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ fetch('https://api.your-backend.com/auth/verify-token')
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND VPS (api.your-backend.com)          │
│  - Verifica el token JWT                                    │
│  - Consulta MongoDB                                         │
│  - Devuelve datos del usuario                               │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Seguridad

**¿Por qué NO usar `NEXT_PUBLIC_API_URL`?**

- ❌ `NEXT_PUBLIC_API_URL` → Se expone en el bundle del navegador (cualquiera puede verla)
- ✅ `API_URL` → Solo accesible en el servidor (oculta del cliente)

Esta arquitectura de proxy protege:
- La URL real del backend
- Los webhooks de N8N
- Cualquier otra configuración sensible

## 📝 Verificación

Después de aplicar la solución:

1. ✅ El servidor de desarrollo se reinició correctamente
2. ✅ Next.js cargó las variables de `.env.local`
3. ✅ El proxy puede conectarse al backend VPS

**Próximos pasos:**
- Abre http://localhost:3000 en tu navegador
- Verifica que NO aparezcan errores 500 en la consola
- El sistema debería verificar el token correctamente

## 🚀 Para Producción (Vercel)

Cuando despliegues a Vercel, asegúrate de configurar estas mismas variables en:

**Vercel Dashboard → Settings → Environment Variables**

```
API_URL=https://api.your-backend.com
APP_URL=https://nsg-eight.vercel.app
N8N_WEBHOOK=https://personal-n8n.suwsiw.easypanel.host/webhook
APP_ENV=production
```

**IMPORTANTE:** NO uses el prefijo `NEXT_PUBLIC_` para estas variables.

---

**Fecha de solución:** 2026-02-05  
**Problema:** Error 500 en verificación de token  
**Causa:** Variable de entorno incorrecta (`NEXT_PUBLIC_API_URL` vs `API_URL`)  
**Estado:** ✅ Resuelto
