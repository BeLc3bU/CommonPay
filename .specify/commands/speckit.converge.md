# Comando Spec Kit: /speckit.converge (alias: /speckit.verify)

**Propósito:** Bucle de convergencia y verificación de calidad. Asegura que la base de código sea 100% verde y cumpla todas las puertas de calidad antes de considerar completada una especificación.

## Protocolo de Ejecución:
1. **Paso 1 - Formateo de Código:**
   - Ejecutar `npm run format` para asegurar la consistencia de estilo en HTML, CSS, JS y JSON.
2. **Paso 2 - Análisis Estático (Linter):**
   - Ejecutar `npm run lint`.
   - **Autocorrección:** Si se detectan errores o advertencias corregibles, editarlos directamente.
3. **Paso 3 - Suite de Pruebas Unitarias:**
   - Ejecutar `npm run test`.
   - **Autocorrección:** Si alguna prueba unitaria falla, analizar el motivo, corregir la lógica y repetir.
4. **Paso 4 - Empaquetado y Compilación de Producción:**
   - Ejecutar `npm run build` con Vite para validar que no haya errores de importación, bundles rotos o dependencias no resueltas.
5. **Paso 5 - Cierre y Actualización Documental:**
   - Marcar todos los criterios en `specs/NNN-nombre-feature/checklist.md` y `specs/NNN-nombre-feature/spec.md`.
   - Actualizar el estado en `specs/README.md`.
   - Presentar al usuario un resumen con el resultado de la convergencia.
