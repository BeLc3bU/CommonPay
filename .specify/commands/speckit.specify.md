# Comando Spec Kit: /speckit.specify

**Propósito:** Inicia la definición de una nueva funcionalidad creando su especificación formal en `specs/NNN-nombre-feature/spec.md` usando la plantilla estándar `.specify/templates/spec-template.md`.

## Protocolo de Ejecución:
1. **Identificar Número Correlativo:**
   - Consultar las carpetas existentes en `specs/` y determinar el siguiente identificador correlativo (ej. `001-nombre-feature`).
2. **Crear Directorio de Feature:**
   - Crear el directorio `specs/NNN-nombre-feature/`.
3. **Redactar `spec.md`:**
   - Copiar la estructura de `.specify/templates/spec-template.md`.
   - Definir con claridad el Qué y el Por Qué.
   - Detallar Historias de Usuario para Pedro (Editor) y Olga (Lectura).
   - Especificar Requisitos Funcionales numerados (RF-1, RF-2...).
   - Establecer Criterios de Aceptación medibles y verificables (CA-1, CA-2...).
   - Definir casos límite y límites fuera de alcance (Non-Goals).
4. **Presentar al Usuario:**
   - Mostrar el resumen de la especificación al usuario y sugerir ejecutar `/speckit.clarify` o `/speckit.plan`.
