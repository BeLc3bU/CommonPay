# Comando Spec Kit: /speckit.clarify

**Propósito:** Proceso interactivo de clarificación y desambiguación de requisitos antes de proceder al diseño técnico. Identifica dudas, lagunas funcionales, casos límite y restricciones ocultas.

## Protocolo de Ejecución:
1. **Analizar la Especificación Activa:**
   - Leer el archivo `specs/NNN-nombre-feature/spec.md` correspondiente.
2. **Identificar Ambigüedades:**
   - Buscar posibles vacíos en:
     - Reglas de redondeo o cálculo financiero.
     - Comportamiento ante desconexión o fallos de Supabase.
     - Permisos de edición de Pedro vs. solo lectura de Olga.
     - Comportamiento en dispositivos móviles / viewport reducido.
3. **Formular Preguntas Dirigidas:**
   - Presentar al usuario un conjunto conciso y estructurado de preguntas de opción múltiple o respuestas directas para resolver las dudas detectadas.
4. **Actualizar Especificación:**
   - Una vez recibidas las respuestas, actualizar `specs/NNN-nombre-feature/spec.md` reflejando los acuerdos.
