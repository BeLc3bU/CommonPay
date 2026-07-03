# Comando: /feature

**Descripción:** Inicia el desarrollo de una nueva funcionalidad en el proyecto siguiendo obligatoriamente la metodología Spec-Driven Development (SDD).

## Pasos de Ejecución (Modo Plan/Build)
1. **Specify (Especificación):**
   - Preguntar o leer los requerimientos de la feature.
   - Crear un subdirectorio en `spec/features/NNN-nombre-feature/` con el número correlativo correspondiente.
   - Escribir el archivo `spec.md` detallando qué hace, por qué y definiendo **criterios de aceptación medibles y verificables**.
2. **Plan (Planificación):**
   - Escribir `plan.md` en el subdirectorio de la feature, detallando el enfoque técnico, los archivos que se modificarán o crearán, decisiones de diseño y posibles riesgos de regresión.
3. **Tasks (Tareas):**
   - Desglosar el plan en una lista de tareas atómicas y marcar el progreso en `tasks.md`.
4. **Solicitar Aprobación:**
   - Detener la ejecución y solicitar al usuario que revise y apruebe la especificación y el plan. No tocar código hasta recibir su consentimiento.
5. **Implementación:**
   - Una vez aprobado, ejecutar las tareas una a una, marcando el progreso en `tasks.md`.
6. **Verificación:**
   - Ejecutar la verificación completa `/verify`.
   - Mover la feature a "Hecho" en `spec/constitution/roadmap.md`.
