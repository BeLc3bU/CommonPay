# Comando Spec Kit: /speckit.plan

**Propósito:** Genera el diseño técnico, arquitectura y blueprint detallado de la funcionalidad en `specs/NNN-nombre-feature/plan.md` a partir de la especificación validada, usando la plantilla `.specify/templates/plan-template.md`.

## Protocolo de Ejecución:
1. **Lectura de Requisitos:**
   - Leer `specs/NNN-nombre-feature/spec.md` y la Constitución en `.specify/memory/constitution.md`.
2. **Definición de Arquitectura:**
   - Detallar el enfoque técnico asegurando el respeto a la separación de responsabilidades:
     - Lógica matemática en `js/calculations.js`.
     - Persistencia en `js/storage.js`.
     - Controlador y DOM en `js/app.js`.
     - Estilos en `css/style.css`.
     - Estructura en `index.html`.
3. **Mapeo de Datos:**
   - Especificar estructuras JSON, campos de base de datos Supabase y almacenamiento `LocalStorage`.
4. **Plan de Pruebas Unitarias:**
   - Detallar los casos de prueba a implementar en `js/calculations.test.js` o archivo `.test.js` asociado.
5. **Evaluación de Riesgos:**
   - Identificar posibles riesgos de regresión y cómo serán mitigados.
6. **Guardar Archivo:**
   - Escribir `specs/NNN-nombre-feature/plan.md`.
