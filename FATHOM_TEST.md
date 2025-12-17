# 🧪 Prueba Rápida de Fathom Integration

## ✅ Checklist de Verificación

### 1. Backend Configurado

- [ ] Variables de entorno configuradas en `NSG-Backend/.env`:
  ```env
  FATHOM_CLIENT_ID=tu_client_id
  FATHOM_CLIENT_SECRET=tu_client_secret
  APP_URL=http://localhost:3000
  FRONTEND_URL=http://localhost:3000
  ```
- [ ] Backend corriendo en `http://localhost:3000`
- [ ] MongoDB corriendo y conectado

### 2. Frontend Configurado

- [ ] Variables de entorno configuradas en `NSG-Frontend/.env.local`:
  ```env
  NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
  ```
- [ ] Frontend corriendo en `http://localhost:3000`

### 3. Fathom OAuth App Configurada

- [ ] Aplicación OAuth creada en Fathom
- [ ] Redirect URI configurado: `http://localhost:3000/fathom/callback`
- [ ] Client ID y Secret copiados al `.env` del backend

---

## 🚀 Pasos de Prueba

### Paso 1: Iniciar Sesión

1. Abre el navegador en `http://localhost:3000`
2. Selecciona un rol (Consultor, Psicólogo, etc.)
3. Inicia sesión con tus credenciales
4. Deberías ser redirigido al dashboard

**Verificación:**

- ✅ Token JWT guardado en localStorage
- ✅ Dashboard cargado correctamente

---

### Paso 2: Acceder a Settings

1. En el dashboard, busca el menú lateral
2. Haz clic en **Settings** (Configuración)
3. Desplázate hasta la sección **Fathom Analytics**

**Verificación:**

- ✅ Sección de Fathom visible
- ✅ Botón "Conectar con Fathom" presente
- ✅ Estado muestra "No conectado"

---

### Paso 3: Conectar Cuenta de Fathom

1. Haz clic en **Conectar con Fathom**
2. Serás redirigido a Fathom Analytics
3. Inicia sesión en Fathom (si no lo has hecho)
4. Autoriza la aplicación NSG Intelligence
5. Serás redirigido de vuelta al dashboard

**Verificación:**

- ✅ Redirección a Fathom exitosa
- ✅ Página de autorización de Fathom mostrada
- ✅ Redirección de vuelta al dashboard
- ✅ Toast de éxito: "¡Cuenta de Fathom conectada exitosamente!"
- ✅ Estado cambia a "Conectado"

**Consola del Backend (deberías ver):**

```
POST /fathom/connect
Redirecting to Fathom OAuth...
GET /fathom/callback?code=...&state=...
Token saved for user: [userId]
```

---

### Paso 4: Ver Sitios

1. Después de conectar, deberías ver un selector de sitios
2. Selecciona uno de tus sitios de Fathom

**Verificación:**

- ✅ Lista de sitios cargada
- ✅ Selector muestra tus sitios
- ✅ Puedes cambiar entre sitios

---

### Paso 5: Ver Estadísticas

1. Con un sitio seleccionado, las estadísticas deberían cargarse automáticamente
2. Verifica que se muestren:
   - Visitantes Únicos
   - Visitas Totales
   - Páginas Vistas
   - Duración Promedio

**Verificación:**

- ✅ Estadísticas cargadas
- ✅ Números mostrados correctamente
- ✅ Tarjetas de métricas visibles

---

### Paso 6: Cambiar Período

1. Prueba cambiar el período de análisis:
   - 24 horas
   - 7 días
   - 30 días
   - 90 días

**Verificación:**

- ✅ Estadísticas se actualizan al cambiar período
- ✅ Números cambian según el período seleccionado

---

### Paso 7: Desconectar Cuenta

1. Haz clic en **Desconectar Cuenta**
2. Confirma la acción

**Verificación:**

- ✅ Toast de confirmación: "Cuenta de Fathom desconectada"
- ✅ Estado vuelve a "No conectado"
- ✅ Estadísticas desaparecen
- ✅ Botón "Conectar con Fathom" visible nuevamente

---

## 🐛 Solución de Problemas

### Error: "No se puede conectar al backend"

**Síntomas:**

- Error de red en la consola del navegador
- No se redirige a Fathom

**Solución:**

1. Verifica que el backend esté corriendo: `http://localhost:3000`
2. Verifica `NEXT_PUBLIC_BACKEND_URL` en `.env.local`
3. Revisa la consola del backend para errores

---

### Error: "Estado OAuth inválido o expirado"

**Síntomas:**

- Redirección a dashboard con error
- Mensaje: "Error conectando con Fathom"

**Solución:**

1. El estado OAuth expira en 10 minutos
2. Intenta conectar nuevamente
3. Completa el proceso más rápido

---

### Error: "No se encontró token de Fathom"

**Síntomas:**

- No se cargan los sitios
- Error 500 en la consola

**Solución:**

1. Verifica que la conexión se completó correctamente
2. Revisa MongoDB para ver si el token se guardó:
   ```javascript
   db.fathomtokens.find();
   ```
3. Intenta desconectar y reconectar

---

### No se muestran estadísticas

**Síntomas:**

- Sitios cargados correctamente
- Pero no hay datos de estadísticas

**Solución:**

1. Verifica que el sitio tenga tráfico en Fathom
2. Prueba con un período más amplio (30 o 90 días)
3. Revisa la consola del navegador para errores de API

---

## 🔍 Verificación de Datos en MongoDB

### Ver Estados OAuth (temporales)

```javascript
use nsg_database
db.oauthstates.find().pretty()
```

**Nota:** Estos estados expiran en 10 minutos y se eliminan automáticamente.

### Ver Tokens de Fathom

```javascript
db.fathomtokens.find().pretty();
```

**Deberías ver:**

```json
{
  "_id": ObjectId("..."),
  "userId": ObjectId("..."),
  "accessToken": "fathom_access_token_...",
  "refreshToken": "fathom_refresh_token_...",
  "tokenType": "Bearer",
  "scope": "read",
  "connectedAt": ISODate("..."),
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

---

## 📊 Endpoints de Prueba Manual

### 1. Verificar Estado de Conexión

```bash
curl -X GET http://localhost:3000/fathom/connection/status \
  -H "Authorization: tu_jwt_token_aqui"
```

**Respuesta esperada:**

```json
{
  "success": true,
  "connected": true
}
```

### 2. Obtener Sitios

```bash
curl -X GET http://localhost:3000/fathom/user/sites \
  -H "Authorization: tu_jwt_token_aqui"
```

**Respuesta esperada:**

```json
{
  "success": true,
  "data": [
    {
      "id": "SITE_ID",
      "name": "Mi Sitio Web",
      "sharing": "none",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 3. Obtener Estadísticas

```bash
curl -X GET "http://localhost:3000/fathom/user/sites/SITE_ID/dashboard?period=7d" \
  -H "Authorization: tu_jwt_token_aqui"
```

**Respuesta esperada:**

```json
{
  "success": true,
  "period": "7d",
  "data": {
    "visits": 1234,
    "uniques": 567,
    "pageviews": 2345,
    "avg_duration": 120,
    "bounce_rate": 0.45
  }
}
```

---

## ✅ Checklist Final

Después de completar todas las pruebas:

- [ ] Conexión OAuth funciona correctamente
- [ ] Sitios se cargan sin errores
- [ ] Estadísticas se muestran correctamente
- [ ] Cambio de período funciona
- [ ] Desconexión funciona correctamente
- [ ] Tokens se guardan en MongoDB
- [ ] No hay errores en la consola del navegador
- [ ] No hay errores en la consola del backend

---

## 🎉 ¡Integración Completa!

Si todos los pasos funcionan correctamente, la integración de Fathom Analytics está lista para usar en producción.

**Próximos pasos:**

1. Configurar variables de entorno de producción
2. Actualizar Redirect URI en Fathom para producción
3. Implementar renovación automática de tokens (opcional)
4. Agregar más visualizaciones de datos (gráficos, etc.)
