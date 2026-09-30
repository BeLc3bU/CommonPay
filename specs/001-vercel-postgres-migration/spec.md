# Especificación: 001 - Migración de Persistencia a Vercel Postgres

**Estado:** Aprobado  
**Fecha:** 2026-09-30  
**Autor:** Pedro Ubeda / Antigravity

---

## 1. Resumen y Contexto
- **Qué:** Migrar el backend de persistencia y autenticación de Supabase a **Vercel Postgres (Serverless)** integrado nativamente con Serverless Functions en `/api/`.
- **Por qué:** El nivel gratuito de Supabase desactiva automáticamente los proyectos por inactividad tras 7 días sin peticiones directas, bloqueando el uso de la aplicación a menos que se reactive manualmente desde la consola. Vercel Postgres (impulsado por Neon) escala a cero para ahorrar recursos pero **nunca se pausa ni requiere reactivación manual**, garantizando disponibilidad 24/7 sin coste adicional.

---

## 2. Historias de Usuario / Casos de Uso
- **Como** Pedro (Editor),
  - **Quiero** que la base de datos esté siempre disponible y activa aunque pasen semanas o meses sin registrar movimientos,
  - **Para** no encontrarme la aplicación inoperativa ni tener que entrar a paneles externos a reactivar servicios.
- **Como** Pedro (Editor),
  - **Quiero** autenticarme de forma transparente desde el modal de acceso editor con contraseña,
  - **Para** poder registrar meses completados, gestionar la fianza y liquidar el día 15 con permisos exclusivos de escritura.
- **Como** Olga (Lectora),
  - **Quiero** abrir la aplicación y consultar inmediatamente los desgloses, previsiones anuales e históricos en la nube,
  - **Para** ver las finanzas del hogar sin necesidad de introducir contraseñas.

---

## 3. Requisitos Funcionales
1. **RF-1 (Disponibilidad Perpetua):** La base de datos debe operar sobre Vercel Postgres, asegurando que las consultas despierten automáticamente sin intervención manual.
2. **RF-2 (Inicialización Automática de Esquema):** El backend debe crear automáticamente las tablas necesarias (`configuracion`, `historial_meses`, `fianza_historial`, `conciliaciones`) si no existen en la primera conexión.
3. **RF-3 (Control de Accesos Editor / Lectura):**
   - Lecturas (`GET`): Abiertas para que Olga consulte sin autenticarse.
   - Escrituras (`POST`, `PUT`, `DELETE`): Protegidas requiriendo un token de sesión de Pedro Editor.
4. **RF-4 (Persistencia Híbrida y Resiliencia Offline):** Si falla la red o Vercel Postgres no responde, el cliente `storage.js` debe recurrir a `LocalStorage` de forma silenciosa y transparente.
5. **RF-5 (Desacoplamiento de Supabase):** Retirar el cliente `@supabase/supabase-js` de `index.html` y eliminar el cron keep-alive de `api/ping.js`.

---

## 4. Criterios de Aceptación (Medibles y Verificables)
- [ ] **CA-1:** Lectura de configuración, historial de meses, fianza y conciliaciones desde Vercel Postgres funcionando sin errores.
- [ ] **CA-2:** Escritura y guardado de datos restringido a la sesión de Editor.
- [ ] **CA-3:** Autenticación de Pedro funcionando con la contraseña configurada (`EDITOR_PASSWORD`).
- [ ] **CA-4:** Cero llamadas a Supabase y eliminación del script CDN de Supabase en `index.html`.
- [ ] **CA-5:** Degradación elegante a `LocalStorage` si la red está desconectada.
- [ ] **CA-6:** Puerta de calidad superada: `npm run lint` (0 errores), `npm run test` (100% pasando), `npm run build` (compilación limpia).

---

## 5. Casos Límite y Restricciones
- **Cold Starts:** Al ser serverless, la primera llamada tras inactividad prolongada puede demorar ~300-600ms; el cliente debe manejar el estado de carga sin bloquear la interfaz.
- **Límites de Hobby Plan:** Las consultas se agrupan en endpoints eficientes para minimizar conexiones.
- **Non-Goals:** No se implementará registro de nuevos usuarios ni recuperación de contraseña por email (la app es monohogar exclusiva para Pedro y Olga).
