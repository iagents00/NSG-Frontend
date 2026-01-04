# Integración Frontend - Fathom Analytics

## Descripción

Esta integración permite a los usuarios conectar su cuenta de Fathom Analytics ingresando su Access Token. El token se guarda de forma segura en el backend (MongoDB) y **NO se almacena en el frontend** (ni en localStorage ni en ningún otro lugar del navegador).

---

## Componentes Modificados

### 1. **FathomTokenModal** (`components/features/FathomTokenModal.tsx`)

Modal que permite al usuario ingresar su Access Token de Fathom.

#### Cambios Realizados:

-   ✅ Eliminada la verificación con la API de Fathom
-   ✅ Ahora guarda el token directamente en el backend
-   ✅ Obtiene el JWT del usuario desde localStorage
-   ✅ Hace POST a `http://localhost:3000/fathom/token`

#### Flujo:

```typescript
1. Usuario ingresa token
2. Modal obtiene JWT de localStorage
3. Envía token al backend con JWT en headers
4. Backend guarda token en MongoDB
5. Modal cierra y notifica éxito
```

---

### 2. **NSGHorizon** (`components/views/NSGHorizon.tsx`)

Vista principal que muestra el estado de conexión con Fathom.

#### Cambios Realizados:

-   ✅ Eliminado uso de localStorage para el token
-   ✅ Verifica estado de conexión desde el backend
-   ✅ Desconexión ahora elimina el token del backend
-   ✅ No muestra el token real en la UI

#### Estados:

**Conectado:**

```typescript
{
  isConnected: true,
  fathomToken: '***' // Placeholder, no el token real
}
```

**Desconectado:**

```typescript
{
  isConnected: false,
  fathomToken: null
}
```

---

## Endpoints Utilizados

### 1. Guardar Token

```typescript
POST http://localhost:3000/fathom/token
Headers: {
  'Authorization': <jwt_token>,
  'Content-Type': 'application/json'
}
Body: {
  fathom_access_token: string
}
```

### 2. Verificar Estado

```typescript
GET http://localhost:3000/fathom/status
Headers: {
  'Authorization': <jwt_token>
}

Response: {
  success: true,
  connected: boolean
}
```

### 3. Desconectar

```typescript
DELETE http://localhost:3000/fathom/token
Headers: {
  'Authorization': <jwt_token>
}
```

---

## Flujo Completo de Usuario

### Conectar Fathom

1. Usuario hace clic en "Conectar Fathom"
2. Se abre el modal `FathomTokenModal`
3. Usuario ingresa su Access Token
4. Usuario hace clic en "Conectar"
5. Modal:
    - Obtiene JWT de `localStorage.getItem('nsg-token')`
    - Envía token al backend
    - Muestra loading mientras procesa
6. Backend:
    - Valida JWT
    - Guarda token en campo `fathom_access_token` del usuario
    - Retorna éxito
7. Frontend:
    - Cierra modal
    - Actualiza estado a conectado
    - Muestra toast de éxito
    - **NO guarda el token en el frontend**

### Verificar Estado (al cargar página)

1. Componente se monta
2. Obtiene JWT de localStorage
3. Hace GET a `/fathom/status`
4. Backend verifica si usuario tiene token guardado
5. Frontend actualiza estado según respuesta

### Desconectar

1. Usuario hace clic en botón de desconectar (ícono de basura)
2. Frontend hace DELETE a `/fathom/token`
3. Backend elimina token del usuario
4. Frontend actualiza estado a desconectado

---

## Seguridad

### ✅ Buenas Prácticas Implementadas:

1. **Token NO almacenado en frontend**

    - No se guarda en localStorage
    - No se guarda en sessionStorage
    - No se guarda en cookies del frontend
    - Solo se muestra un placeholder `'***'`

2. **Autenticación JWT**

    - Todas las peticiones requieren JWT válido
    - JWT se obtiene de localStorage (del login)
    - Backend valida JWT antes de cualquier operación

3. **HTTPS en Producción**

    - En producción, cambiar URL a HTTPS
    - Actualizar en `FathomTokenModal.tsx` y `NSGHorizon.tsx`

4. **No exposición del token**
    - UI muestra "Fathom Analytics" en lugar del token
    - Token solo existe en el backend

---

## Variables de Entorno (Producción)

Para producción, debes actualizar las URLs hardcodeadas:

### Archivos a modificar:

**1. `FathomTokenModal.tsx`**

```typescript
// Línea 45 - Cambiar:
const response = await fetch('http://localhost:3000/fathom/token', {
// Por:
const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/fathom/token', {
```

**2. `NSGHorizon.tsx`**

```typescript
// Línea 78 - Cambiar:
const response = await fetch('http://localhost:3000/fathom/status', {
// Por:
const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/fathom/status', {

// Línea 107 - Cambiar:
const response = await fetch('http://localhost:3000/fathom/token', {
// Por:
const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/fathom/token', {
```

**3. Crear `.env.local`**

```env
NEXT_PUBLIC_API_URL=https://tu-backend.com
```

---

## Manejo de Errores

### Errores Comunes:

1. **"No estás autenticado"**

    - Causa: No hay JWT en localStorage
    - Solución: Usuario debe iniciar sesión

2. **"Error guardando el token"**

    - Causa: Backend rechazó el token (vacío, inválido, etc.)
    - Solución: Verificar que el token sea correcto

3. **"Error desconectando Fathom"**
    - Causa: Problema de red o backend
    - Solución: Reintentar

---

## Testing

### Probar Conexión:

1. Iniciar sesión en la aplicación
2. Ir a NSG Horizon
3. Hacer clic en "Conectar Fathom"
4. Ingresar un token de prueba
5. Verificar que:
    - Modal se cierra
    - Aparece mensaje "Fathom conectado exitosamente"
    - UI muestra "Conectado - Fathom Analytics"
    - Botón de desconectar aparece

### Probar Desconexión:

1. Con Fathom conectado
2. Hacer clic en ícono de basura
3. Verificar que:
    - Aparece mensaje "Fathom desconectado"
    - UI vuelve a mostrar botón "Conectar Fathom"

### Probar Persistencia:

1. Conectar Fathom
2. Recargar página
3. Verificar que:
    - Estado de conexión se mantiene
    - UI muestra "Conectado"

---

## Próximos Pasos

Una vez conectado, podrías agregar:

1. **Obtener Grabaciones**: Endpoint para listar grabaciones de Fathom
2. **Mostrar Estadísticas**: Visualizar analytics en el dashboard
3. **Sincronización Automática**: Importar grabaciones automáticamente
4. **Validación del Token**: Verificar que el token sea válido con Fathom API

---

## Notas Importantes

⚠️ **El token nunca se almacena en el frontend**

-   Esto es una medida de seguridad
-   El token solo existe en MongoDB
-   El frontend solo sabe si está "conectado" o no

⚠️ **JWT es necesario**

-   Sin JWT, no se puede guardar/obtener el token
-   El usuario debe estar autenticado

⚠️ **URLs hardcodeadas**

-   Actualmente apuntan a `localhost:3000`
-   Cambiar para producción usando variables de entorno
