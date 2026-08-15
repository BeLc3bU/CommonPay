# Comando Spec Kit: /speckit.tasks

**Propósito:** Desglosa el plan técnico en una lista de tareas atómicas, ordenadas por dependencias y ejecutables paso a paso en `specs/NNN-nombre-feature/tasks.md` usando la plantilla `.specify/templates/tasks-template.md`.

## Protocolo de Ejecución:
1. **Analizar Plan:**
   - Leer `specs/NNN-nombre-feature/plan.md`.
2. **Estructurar por Fases:**
   - **Fase 1:** Pruebas unitarias (TDD / Vitest).
   - **Fase 2:** Lógica de negocio y persistencia (`js/calculations.js`, `js/storage.js`).
   - **Fase 3:** Interfaz de usuario y DOM (`index.html`, `css/style.css`, `js/app.js`).
   - **Fase 4:** Verificación y Cierre (Lint, Tests, Build, Convergence).
3. **Detallar Tareas Atómicas:**
   - Cada tarea debe tener un identificador claro (`T-1.1`, `T-1.2`...), una acción concreta y criterios de completitud.
4. **Guardar Archivo:**
   - Escribir `specs/NNN-nombre-feature/tasks.md`.
5. **Solicitar Aprobación:**
   - Presentar el plan y tareas al usuario antes de iniciar la implementación (`/speckit.implement`).
