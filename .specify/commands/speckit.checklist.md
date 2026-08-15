# Comando Spec Kit: /speckit.checklist

**Propósito:** Genera la lista de control y puertas de calidad (Quality Gates) en `specs/NNN-nombre-feature/checklist.md` usando la plantilla `.specify/templates/checklist-template.md`.

## Protocolo de Ejecución:
1. **Lectura de Especificación y Plan:**
   - Leer `specs/NNN-nombre-feature/spec.md` y `specs/NNN-nombre-feature/plan.md`.
2. **Generar Puertas de Calidad:**
   - Criterios de Aceptación funcionales de la feature.
   - Invariantes arquitectónicos de CommonPay (aritmética centesimal, resiliencia LocalStorage, seguridad RLS, estética Glassmorphism).
   - Pruebas automatizadas requeridas (Linter 0 errores, Vitest 100% tests, Build Vite limpio).
   - Trazabilidad y actualización documental.
3. **Guardar Archivo:**
   - Escribir `specs/NNN-nombre-feature/checklist.md`.
