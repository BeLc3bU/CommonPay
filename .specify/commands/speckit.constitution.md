# Comando Spec Kit: /speckit.constitution

**Propósito:** Consulta, valida o actualiza la Constitución del Proyecto (`.specify/memory/constitution.md`), que define los principios no negociables, stack tecnológico, invariantes y reglas del sistema.

## Protocolo de Ejecución:
1. **Lectura:** Leer `.specify/memory/constitution.md` para verificar los principios rectores.
2. **Validación de Invariantes:**
   - Asegurar que cualquier propuesta respete la aritmética centesimal obligatoria (`Math.round((val || 0) * 100)`).
   - Asegurar que se preserve el fallback de persistencia en `LocalStorage`.
   - Asegurar que se mantengan las políticas de seguridad RLS en Supabase.
   - Preservar la estética Glassmorphism y la arquitectura de scripts CDN / Vanilla JS.
3. **Actualización (si se solicita):**
   - Si el usuario solicita modificar un principio global, editar `.specify/memory/constitution.md`.
   - Registrar la justificación en `.specify/memory/decisions.md` (ADR).
