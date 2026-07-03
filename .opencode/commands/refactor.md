# Comando: /refactor

**Descripción:** Realiza cambios en la estructura del código para mejorar su mantenibilidad, legibilidad u organización sin alterar su comportamiento externo.

## Pasos de Ejecución (Modo Plan/Build)
1. **Analizar Dependencias:**
   - Identificar qué módulos consumen la sección de código a refactorizar.
2. **Elaborar Plan de Refactorización:**
   - Escribir un plan detallado en `spec/memory/decisions.md` o en la feature correspondiente justificando por qué es necesario el cambio y qué archivos se alterarán.
   - Solicitar confirmación del usuario si el cambio afecta la arquitectura de carpetas.
3. **Ejecutar Cambios:**
   - Realizar la refactorización de forma incremental y ordenada.
4. **Verificar Regresiones:**
   - Ejecutar la suite de tests unitarios de inmediato (`npm run test`). Si algún test falla, revertir el cambio e investigar la causa.
5. **Formatear y Limpiar:**
   - Pasar el linter y formateador (`npm run lint` y `npm run format`).
   - Confirmar que no quedan variables declaradas sin usar o archivos huérfanos.
