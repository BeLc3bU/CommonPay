# Skill: Backend, Serverless & DB - CommonPay

Esta habilidad regula el desarrollo de funciones en la nube (Vercel) y la gestión de la base de datos (Supabase).

## APIs en Vercel (`api/`)
- **Node.js Runtime:** Los endpoints de la carpeta `api/` se ejecutan como funciones serverless en Vercel bajo Node.js.
- **Seguridad en Entornos:** El archivo `api/config.js` actúa como API Gateway para distribuir de manera segura las claves de Supabase. **Nunca** almacenes las claves en texto plano en la aplicación.
- **Mantenimiento (Keep-Alive):** El endpoint `/api/ping.js` se ejecuta automáticamente mediante crons de Vercel configurados en `vercel.json` para evitar que la base de datos gratuita de Supabase se pause por inactividad.

## Supabase y Seguridad RLS
- **Esquema SQL:** Las tablas relacionales en Supabase (`configuracion`, `historial_transferencias`, `fianza_estado`, `conciliaciones`, `fianza_historial`) deben coincidir exactamente con el esquema relacional documentado.
- **Row Level Security (RLS):** Asegurar siempre que toda tabla posea políticas de RLS activadas:
  - Lectura pública anónima (`SELECT` permitida a todos).
  - Escritura, edición y borrado (`INSERT`, `UPDATE`, `DELETE`) restringidos exclusivamente a usuarios autenticados (Pedro como editor).
- **Mapeos de Datos:** Usa siempre las utilidades de mapeo en `js/storage.js` para convertir datos entre el formato `snake_case` de PostgreSQL y `camelCase` de JavaScript.
