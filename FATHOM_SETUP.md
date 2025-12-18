# Configuración de Fathom Analytics

Esta guía te ayudará a configurar la integración de Fathom Analytics en NSG Intelligence.

## 📋 Requisitos Previos

1. Una cuenta de Fathom Analytics ([Crear cuenta](https://usefathom.com))
2. Al menos un sitio web configurado en Fathom
3. Acceso a la configuración de OAuth en Fathom

## 🔧 Configuración del Backend

### 1. Crear Aplicación OAuth en Fathom

1. Inicia sesión en tu cuenta de Fathom Analytics
2. Ve a **Settings** → **API** → **OAuth Applications**
3. Haz clic en **Create New Application**
4. Completa los datos:
   - **Name**: NSG Intelligence
   - **Redirect URI**: `http://localhost:3000/fathom/callback` (desarrollo)
   - Para producción: `https://tu-dominio.com/fathom/callback`
5. Guarda la aplicación y copia:
   - **Client ID**
   - **Client Secret**

### 2. Configurar Variables de Entorno del Backend

Edita el archivo `.env` en `NSG-Backend/`:

```env
# Puerto del servidor
PORT=3000

# Base de datos MongoDB
MONGODB_URI=mongodb://localhost:27017/nsg_database

# JWT Secret
JWT_SECRET=tu_jwt_secret_key_seguro

# URLs de la aplicación
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# Fathom OAuth (REQUERIDO para conexión de usuarios)
FATHOM_CLIENT_ID=tu_client_id_aqui
FATHOM_CLIENT_SECRET=tu_client_secret_aqui

# Fathom API (OPCIONAL - solo para endpoints de admin)
FATHOM_API_KEY=tu_api_key_aqui
FATHOM_API_URL=https://api.usefathom.com/v1
```

**Importante**:

- `FATHOM_CLIENT_ID` y `FATHOM_CLIENT_SECRET` son **obligatorios** para que los usuarios puedan conectar sus cuentas
- `FATHOM_API_KEY` es opcional y solo se usa para endpoints de administrador

### 3. Reiniciar el Backend

```bash
cd NSG-Backend
npm run dev
```

## 🎨 Configuración del Frontend

### 1. Configurar Variables de Entorno

Crea o edita el archivo `.env.local` en `NSG-Frontend/`:

```env
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000

# Google Generative AI (Gemini)
GOOGLE_GENERATIVE_AI_API_KEY=tu_google_ai_api_key

# App Environment
NEXT_PUBLIC_APP_ENV=development
```

### 2. Reiniciar el Frontend

```bash
cd NSG-Frontend
npm run dev
```

## 🚀 Uso de la Integración

### Para Usuarios

1. **Acceder a Configuración**

   - Inicia sesión en NSG Intelligence
   - Ve a **Settings** (Configuración)
   - Busca la sección **Fathom Analytics**

2. **Conectar Cuenta**

   - Haz clic en **Conectar con Fathom**
   - Serás redirigido a Fathom para autorizar
   - Acepta los permisos solicitados
   - Serás redirigido de vuelta al dashboard

3. **Ver Estadísticas**
   - Una vez conectado, verás tus sitios disponibles
   - Selecciona un sitio para ver sus métricas
   - Las estadísticas se actualizan en tiempo real

### Métricas Disponibles

- **Visitantes Únicos**: Número de visitantes únicos
- **Visitas Totales**: Total de visitas al sitio
- **Páginas Vistas**: Número total de páginas vistas
- **Duración Promedio**: Tiempo promedio de sesión
- **Tasa de Rebote**: Porcentaje de visitantes que abandonan sin interactuar

### Períodos de Análisis

- **24 horas**: Últimas 24 horas
- **7 días**: Última semana
- **30 días**: Último mes
- **90 días**: Últimos 3 meses

## 🔒 Seguridad

### Tokens OAuth

- Los tokens de acceso se almacenan de forma segura en MongoDB
- Cada usuario tiene su propio token asociado a su cuenta
- Los tokens expiran automáticamente según la configuración de Fathom
- Los usuarios pueden desconectar su cuenta en cualquier momento

### Permisos

- La integración solo solicita permisos de **lectura** (`scope=read`)
- No se pueden modificar datos en Fathom desde NSG
- Cada usuario solo puede ver sus propios sitios

## 🛠️ Solución de Problemas

### Error: "No se encontró token de Fathom"

**Causa**: El usuario no ha conectado su cuenta o el token expiró.

**Solución**:

1. Ve a Settings
2. Haz clic en "Conectar con Fathom"
3. Autoriza la aplicación nuevamente

### Error: "Estado OAuth inválido o expirado"

**Causa**: El estado OAuth expiró (10 minutos de validez).

**Solución**:

1. Intenta conectar nuevamente
2. Completa el proceso de autorización más rápido

### Error: "Error 401: Unauthorized"

**Causa**: Token de acceso inválido o expirado.

**Solución**:

1. Desconecta tu cuenta en Settings
2. Vuelve a conectar para obtener un nuevo token

### No se muestran estadísticas

**Causa**: El sitio seleccionado no tiene datos para el período elegido.

**Solución**:

1. Verifica que el sitio tenga tráfico
2. Prueba con un período más amplio (30 o 90 días)
3. Verifica que el código de tracking de Fathom esté instalado en tu sitio

## 📊 Endpoints de API Disponibles

### OAuth

- `GET /fathom/connect` - Iniciar conexión OAuth
- `GET /fathom/callback` - Callback de OAuth (automático)
- `GET /fathom/connection/status` - Verificar estado de conexión
- `DELETE /fathom/connection` - Desconectar cuenta

### Datos de Usuario

- `GET /fathom/user/sites` - Obtener sitios del usuario
- `GET /fathom/user/sites/:siteId/stats` - Estadísticas de sitio
- `GET /fathom/user/sites/:siteId/dashboard?period=7d` - Dashboard resumido

### Admin (requiere API Key)

- `GET /fathom/admin/sites` - Todos los sitios (admin)
- `GET /fathom/admin/sites/:siteId/stats` - Estadísticas (admin)
- `POST /fathom/admin/sites/:siteId/events` - Crear evento (admin)

## 🔄 Actualización de Tokens

Los tokens OAuth de Fathom tienen una duración limitada. Cuando un token expira:

1. El sistema detecta automáticamente el error
2. Se muestra un mensaje al usuario
3. El usuario debe reconectar su cuenta

**Nota**: En futuras versiones se implementará la renovación automática de tokens usando el `refresh_token`.

## 📝 Notas Adicionales

- La integración respeta los límites de rate limiting de Fathom API
- Los datos se obtienen directamente de Fathom, no se almacenan en NSG
- La conexión es individual por usuario, no global
- Cada usuario puede conectar su propia cuenta de Fathom

## 🆘 Soporte

Si encuentras problemas:

1. Verifica que todas las variables de entorno estén configuradas
2. Revisa los logs del backend para errores específicos
3. Asegúrate de que MongoDB esté corriendo
4. Verifica que la URL de callback en Fathom coincida con tu configuración

## 🔗 Enlaces Útiles

- [Documentación de Fathom API](https://usefathom.com/api)
- [Fathom OAuth Guide](https://usefathom.com/docs/api/authentication)
- [NSG Intelligence Documentation](./README.md)
