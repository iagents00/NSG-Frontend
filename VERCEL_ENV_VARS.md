# Variables de Entorno para Vercel

## ✅ Configuración COMPLETA y SEGURA

Copia y pega estas variables en **Vercel → Settings → Environment Variables**:

### Variables REQUERIDAS:

```bash
APP_ENV=production
API_URL=https://your-api-domain.com
APP_URL=https://nsg-eight.vercel.app
N8N_WEBHOOK=https://personal-n8n.suwsiw.easypanel.host/webhook
MONGODB_URI=mongodb+srv://iagentsnsg_db_user:Nc0lLH0zK6LEFJQP@cluster0.pgbmwuy.mongodb.net/Database?appName=Cluster0
```

### Variables OPCIONALES (solo si las usas):

```bash
# Solo si usas Gemini AI para análisis
GEMINI_API_KEY=tu_api_key_de_gemini

# Solo si usas Google Maps
GOOGLE_MAPS_API_KEY=tu_api_key_de_google_maps
```

---

## 📝 Instrucciones en Vercel:

1. Ve a tu proyecto en Vercel Dashboard
2. Click en **Settings** → **Environment Variables**
3. Para cada variable:
    - **Name**: nombre de la variable (ej: `APP_ENV`)
    - **Value**: valor correspondiente
    - **Environments**: Selecciona: ✅ Production, ✅ Preview, ✅ Development

---

## 🔒 IMPORTANTE - Seguridad

- ✅ **NO uses prefijo `NEXT_PUBLIC_`** - Estas variables SON privadas
- ✅ Las URLs del backend NO estarán expuestas en el navegador
- ✅ Los webhooks de N8N NO estarán expuestos en el navegador
- ✅ Todo se maneja de forma segura en el servidor

---

## 📊 Tabla de Variables:

| Variable              | Valor                                                | Production  | Preview          | Development |
| --------------------- | ---------------------------------------------------- | ----------- | ---------------- | ----------- |
| `APP_ENV`             | `production`                                         | ✅          | ✅               | ✅          |
| `API_URL`             | `https://your-api-domain.com`                        | ✅          | ✅               | ✅          |
| `APP_URL`             | `https://nsg-eight.vercel.app`                       | ✅          | (URL de preview) | (localhost) |
| `N8N_WEBHOOK`         | `https://personal-n8n.suwsiw.easypanel.host/webhook` | ✅          | ✅               | ✅          |
| `MONGODB_URI`         | `mongodb+srv://...`                                  | ✅          | ✅               | ✅          |
| `GEMINI_API_KEY`      | `[tu-key]`                                           | ⚠️ Opcional | ⚠️ Opcional      | ⚠️ Opcional |
| `GOOGLE_MAPS_API_KEY` | `[tu-key]`                                           | ⚠️ Opcional | ⚠️ Opcional      | ⚠️ Opcional |

---

## ✅ Verificación

Después de configurar las variables en Vercel:

1. Haz un nuevo deploy (o re-deploy)
2. Verifica que la aplicación se conecte correctamente al backend
3. Abre las DevTools del navegador
4. Revisa que NO aparezcan las URLs reales en el código del cliente

---

**Última actualización**: 2026-02-03
