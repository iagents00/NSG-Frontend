# 🔐 Arquitectura de Seguridad - Variables de Entorno

## 📋 Resumen

Este proyecto está configurado para **NO exponer URLs sensibles en el cliente**. Todas las configuraciones están en el servidor y el cliente se comunica a través de API routes que actúan como proxy.

## 🏗️ Arquitectura

```
Cliente (Browser)
    ↓
    ↓ (llamada a /api/backend/*)
    ↓
Next.js API Route (Proxy)
    ↓
    ↓ (reenvía a API_URL)
    ↓
Backend VPS (https://api.nsgintelligence.com)
```

### ✅ Ventajas de esta arquitectura:

1. **URLs del backend NO están en el bundle del cliente**
2. **N8N URLs NO están en el bundle del cliente**
3. **API Keys solo están en el servidor**
4. **Mayor control sobre las peticiones**
5. **Posibilidad de agregar validación/logging adicional**

## 📝 Variables de Entorno

### Para Desarrollo Local (`.env.local` o `.env.development`):

```bash
APP_ENV=development
API_URL=http://localhost:4000
APP_URL=http://localhost:3000
N8N_WEBHOOK=https://personal-n8n.suwsiw.easypanel.host/webhook
```

### Para Producción (Vercel Environment Variables):

```bash
APP_ENV=production
API_URL=https://api.nsgintelligence.com
APP_URL=https://nsgintelligence.com
N8N_WEBHOOK=https://personal-n8n.suwsiw.easypanel.host/webhook
```

### Opcionales:

```bash
GEMINI_API_KEY=tu_api_key_aqui
GOOGLE_MAPS_API_KEY=tu_api_key_aqui
```

## 🚀 Configuración en Vercel

1. Ve a **Settings** → **Environment Variables**
2. Agrega las siguientes variables:

| Name          | Value                                                | Environments                     |
| ------------- | ---------------------------------------------------- | -------------------------------- |
| `APP_ENV`     | `production`                                         | Production, Preview, Development |
| `API_URL`     | `https://api.nsgintelligence.com`                    | Production, Preview, Development |
| `APP_URL`     | `https://nsgintelligence.com`                        | Production                       |
| `N8N_WEBHOOK` | `https://personal-n8n.suwsiw.easypanel.host/webhook` | Production, Preview, Development |

### Opcional (si se usa):

| Name             | Value          | Environments                     |
| ---------------- | -------------- | -------------------------------- |
| `GEMINI_API_KEY` | `[tu-api-key]` | Production, Preview, Development |

## ⚠️ Importante

### ❌ NO usar `NEXT_PUBLIC_` para:

- URLs de APIs
- URLs de N8N
- API Keys
- Cualquier información sensible

### ✅ Solo usar `NEXT_PUBLIC_` para:

- Feature flags públicos
- URLs públicas que deben estar en el cliente
- IDs de tracking/analytics públicos

## 🔍 Cómo funciona

1. **Cliente** (`lib/api.ts`):
    - Hace llamadas a `/api/backend/*`
    - NO conoce la URL real del backend
2. **Proxy** (`app/api/backend/[...path]/route.ts`):
    - Recibe peticiones del cliente
    - Lee `API_URL` de las variables de entorno del servidor
    - Reenvía la petición al backend real
    - Devuelve la respuesta al cliente

3. **Backend** (VPS):
    - Recibe peticiones solo del servidor Next.js
    - Responde normalmente

## 📚 Archivos Clave

- `lib/config.ts` - Configuración del servidor (NO importar en cliente)
- `lib/api.ts` - Cliente HTTP que llama a `/api/backend/*`
- `app/api/backend/[...path]/route.ts` - Proxy que reenvía al backend real

## 🧪 Testing Local

Para probar localmente con el backend del VPS:

```bash
# En .env.local
APP_ENV=production
API_URL=https://api.nsgintelligence.com
APP_URL=http://localhost:3000
N8N_WEBHOOK=https://personal-n8n.suwsiw.easypanel.host/webhook
```

Para probar con backend local:

```bash
# En .env.local
APP_ENV=development
API_URL=http://localhost:4000
APP_URL=http://localhost:3000
N8N_WEBHOOK=https://personal-n8n.suwsiw.easypanel.host/webhook
```

## 🔒 Seguridad

- ✅ Las URLs del backend NO están en el bundle del cliente
- ✅ Las API Keys NO están expuestas al navegador
- ✅ Los webhooks de N8N NO están expuestos al navegador
- ✅ Solo el servidor conoce las URLs reales
- ✅ El cliente solo conoce las rutas relativas (`/api/backend/*`)

---

**Última actualización**: 2026-02-03
