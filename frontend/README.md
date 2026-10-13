# BioLink · Frontend

Frontend en React (Vite) para BioLink. Consume la API REST del backend Spring Boot que está en la raíz del repo.

## Requisitos

- Node.js 18+ y npm
- El backend corriendo en `http://localhost:8080` (ver `application.properties` en la raíz del proyecto)

## Poner en marcha

```bash
cd frontend
npm install
npm run dev
```

Esto abre la app en `http://localhost:5173`. Las llamadas a `/api/**` se reenvían automáticamente al backend en el puerto 8080 (configurado en `vite.config.js`), así que no hace falta configurar CORS en el backend mientras se desarrolla.

## Qué hay hecho

- **Login** (`src/pages/Login`): réplica del diseño de `biolink-login.html`, ahora como componente controlado por React. Envía `POST /api/auth/login` con `{ username, password }` y guarda el JWT devuelto.
- **AuthContext** (`src/context/AuthContext.jsx`): guarda el token en `localStorage`, decodifica el JWT para saber `username` y `rol`, y expone `login()` / `logout()`. También cierra la sesión sola si no hay actividad del usuario (mouse/teclado/scroll) por `SESSION_IDLE_TIMEOUT_MS` (15 min por defecto, configurable en `src/config.js`), usando el hook `useIdleTimer` (`src/hooks/useIdleTimer.js`). Al expirar por inactividad redirige a `/login` mostrando un aviso.
- **ProtectedRoute** (`src/components/ProtectedRoute.jsx`): redirige a `/login` si no hay token.
- **Dashboard** (`src/pages/Dashboard`): placeholder protegido, muestra usuario/rol y botón de cerrar sesión.
- **Cliente API** (`src/api/client.js`): instancia de axios que agrega el header `Authorization: Bearer <token>` automáticamente a cada request.

## Seguridad de la sesión

Hay dos límites independientes para el JWT:

1. **Expiración absoluta**: 10 horas, fijada en el backend (`JwtUtil.EXPIRATION_TIME`). Pase lo que pase, el token deja de servir después de eso.
2. **Cierre por inactividad**: 15 minutos sin actividad en el navegador (configurable en `src/config.js`). Es puramente del lado del cliente — si quieren que también expire la sesión en el servidor por inactividad (no solo se borre el token local), habría que agregar un endpoint de refresh/revocación en el backend.

## Nota sobre el login

El formulario visualmente dice "Correo", pero el backend (`Usuario`) solo tiene `username`, no un campo de email. Por ahora el input manda su valor como `username` tal cual — si más adelante quieren login por correo de verdad, hay que agregar un campo `email` a la entidad `Usuario` en el backend.

## Próximos pasos sugeridos

1. Pantalla de registro de pacientes (`POST /api/pacientes`).
2. Listado y creación de órdenes médicas.
3. Registro de muestras con lectura/generación de código de barras.
4. Carga de resultados con validación visual de rango (ya calculada en el backend vía `ResultadoService`).
5. Mostrar/ocultar acciones según el rol (`recepcionista`, `bioanalista`, `admin`) usando el `rol` que ya viene en el JWT.
