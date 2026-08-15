# Comando Spec Kit: /speckit.implement

**Propósito:** Ejecuta de manera autónoma y secuencial las tareas definidas en `specs/NNN-nombre-feature/tasks.md`, actualizando el progreso y validando cada cambio.

## Protocolo de Ejecución:
1. **Verificar Aprobación:**
   - Confirmar que `spec.md`, `plan.md` y `tasks.md` están aprobados por el usuario.
2. **Ejecución Paso a Paso:**
   - Tomar la primera tarea pendiente (`[ ]`) en `specs/NNN-nombre-feature/tasks.md`.
   - Implementar los cambios mínimos necesarios para completarla.
   - Si la tarea incluye tests, ejecutar `npm run test` para verificar que la prueba pase.
   - Marcar la tarea como completada (`[x]`).
   - Repetir hasta completar todas las tareas de las fases 1, 2 y 3.
3. **Pase a Convergencia:**
   - Una vez finalizada la implementación, invocar automáticamente `/speckit.converge` para ejecutar la puerta de calidad global.
