# Skill: Security & Data Protection - CommonPay

Esta habilidad define los principios de seguridad de la aplicación para proteger la privacidad financiera de Olga y Pedro.

## Políticas de Autenticación y Autorización
- **Control de Roles:**
  - **Editor (Pedro):** Requiere inicio de sesión explícito con email y contraseña para habilitar escrituras en Supabase.
  - **Invitado (Olga):** Modo por defecto si no hay sesión activa. Acceso en modo de solo lectura sobre el Dashboard, Histórico y Previsión Anual.
- **Acceso Restringido:** Las llamadas de modificación (`saveConfiguration`, `addTransferenciaAlHistorial`, etc.) en `js/storage.js` deben validar la sesión de usuario y, en su defecto, impedir la edición arrojando excepciones descriptivas.

## Gestión de Credenciales y Variables
- **Claves en la Nube:** Las variables `SUPABASE_URL` y `SUPABASE_ANON_KEY` se almacenan exclusivamente en los ajustes de Vercel o en `.env.local` para desarrollo. **Nunca** se integran directamente en el código del repositorio.
- **Validación del Lado del Servidor:** La base de datos Supabase debe auditarse periódicamente para verificar que la Row Level Security (RLS) esté activa y que no se expongan operaciones de inserción/borrado de forma anónima.
