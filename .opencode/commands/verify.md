# Comando: /verify

**Descripción:** Bucle autónomo de verificación local (Loop Engineering). Asegura que el estado de la base de código sea 100% verde antes de cualquier commit, PR o entrega.

## Pasos de Ejecución (Modo Build Autónomo)
1. **Ejecutar Formateador:**
   - Lanzar `npm run format` para estandarizar el estilo del código en HTML, CSS, JS y JSON.
2. **Ejecutar Linter:**
   - Lanzar `npm run lint`.
   - **Autocorrección:** Si el linter arroja advertencias o errores corregibles, el agente debe editarlos directamente en los archivos correspondientes.
3. **Ejecutar Tests:**
   - Lanzar `npm run test` para validar la integridad lógica.
   - **Autocorrección:** Si algún test unitario falla, el agente debe leer el log de error, corregir el código y volver a lanzar el comando `/verify`.
4. **Ejecutar Build:**
   - Lanzar `npm run build` para asegurar que el empaquetado de producción de Vite no arroje errores de importación o empaquetado.
5. **Criterios de Aceptación:**
   - El ciclo de verificación no se considera completado hasta que el linter, los tests y la compilación pasen simultáneamente con 0 errores.
   - Si tras 3 iteraciones el agente encuentra un bloqueo irresoluble o contradictorio, debe detenerse y presentar un informe detallado con alternativas de solución al usuario.
