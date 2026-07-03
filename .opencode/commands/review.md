# Comando: /review

**Descripción:** Realiza una revisión técnica minuciosa de calidad sobre el estado de la base de código.

## Pasos de Ejecución (Modo Plan/Build)
1. **Verificar Compilación y Tests:**
   - Lanzar el comando `/verify` para asegurar que las pruebas y lints pasen.
2. **Inspección de Archivos Huérfanos:**
   - Analizar el directorio de trabajo mediante `git status` o herramientas similares para confirmar que no se hayan creado archivos temporales, de respaldo u huérfanos fuera del ámbito del plan.
3. **Consistencia de la Arquitectura:**
   - Asegurar que la separación de capas (`js/calculations.js` para cálculos, `js/storage.js` para persistencia, `js/app.js` para UI) se haya mantenido y que no se hayan inyectado imports directos prohibidos.
4. **Verificación de Criterios de Aceptación:**
   - Comprobar que todos los criterios descritos en el archivo `spec.md` de la feature activa tengan su caja marcada (`[x]`).
5. **Auditoría de Documentación:**
   - Verificar que los cambios estén fielmente reflejados en el `walkthrough.md`, `ROADMAP.md` y en la memoria de sesiones en `spec/memory/state.md`.
