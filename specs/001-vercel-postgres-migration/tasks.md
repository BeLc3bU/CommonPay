# Tareas de Implementación: 001 - Vercel Postgres Migration

**Especificación:** `specs/001-vercel-postgres-migration/spec.md`  
**Plan:** `specs/001-vercel-postgres-migration/plan.md`

---

## Desglose de Tareas

- [x] **TASK-01:** Instalar dependencia `@vercel/postgres` en `package.json`.
- [x] **TASK-02:** Implementar función serverless `/api/auth.js` (login de Pedro, verificación y generación de token HMAC).
- [x] **TASK-03:** Implementar función serverless `/api/data.js` (DDL automático para tablas `configuracion`, `historial_meses`, `fianza_historial`, `conciliaciones` y endpoints CRUD).
- [x] **TASK-04:** Adaptar `js/storage.js` para consumir `/api/data` y `/api/auth`, manteniendo la API pública y el fallback a `LocalStorage`.
- [x] **TASK-05:** Actualizar `index.html` retirando el script CDN de Supabase y eliminar `api/ping.js` y el cron en `vercel.json`.
- [x] **TASK-06:** Ejecutar suite de pruebas unitarias (`npm run test`), linter (`npm run lint`) y build (`npm run build`).
- [x] **TASK-07:** Realizar commit y push de la migración a GitHub para despliegue automático en Vercel.
