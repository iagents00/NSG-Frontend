# Configuración de Variables de Entorno - NSG Frontend

## 📝 Instrucciones de Configuración

Para que el frontend funcione correctamente con el backend y los servicios externos, sigue estos pasos:

### 1. Crear archivo `.env.local`

Crea un archivo llamado `.env.local` en la raíz del directorio `NSG-Frontend`. **Nota**: No uses `.env.production` o `.env.development` a menos que sea estrictamente necesario; `.env.local` es el estándar para el desarrollo local y el proxy se encarga del resto.

```env
# ============================================
# API BACKEND (Proxy)
# ============================================
# El frontend usa un proxy interno para omitir problemas de CORS y ocultar la URL real
# Local
NEXT_PUBLIC_API_URL=http://localhost:4000

# Producción (Ejemplo)
# NEXT_PUBLIC_API_URL=https://your-api.com

# ============================================
# IA & SERVICIOS (Server-side)
# ============================================
# Estas variables solo son accesibles desde el servidor de Next.js
GOOGLE_GENERATIVE_AI_API_KEY=tu_key_de_gemini
MONGODB_URI=tu_uri_de_mongodb_atlas
```

## 🔑 Variables Requeridas

### 1. **NEXT_PUBLIC_API_URL**

- **Requerido**: Sí
- **Propósito**: Indica al frontend dónde está el backend.
- **Nota**: Se utiliza el prefijo `NEXT_PUBLIC_` porque es necesario para la configuración inicial de Axios en el cliente, pero las peticiones sensibles pasan por el proxy de Next.js.

### 2. **GOOGLE_GENERATIVE_AI_API_KEY**

- **Requerido**: Sí (para funcionalidades de IA directas)
- **Propósito**: Acceso a los modelos de Gemini 1.5.

## ⚠️ Notas de Seguridad

1. JAMÁS subas el archivo `.env.local` al repositorio.
2. **Proxy de Seguridad**: La arquitectura utiliza una ruta API (`app/api/backend`) para centralizar las peticiones al backend, permitiendo añadir logs y validaciones extra sin exponer la IP del backend al navegador.

---

**Última actualización**: 2026-02-12 | Billing & Docker Integration Update
