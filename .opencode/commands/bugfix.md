# Comando: /bugfix

**Descripción:** Resuelve un error o comportamiento inesperado reportado en la aplicación de forma estructurada y segura.

## Pasos de Ejecución (Modo Build)
1. **Investigar:**
   - Analizar el comportamiento erróneo reportado y localizar los archivos afectados en la base de código.
   - Si es posible, reproducir el error en el entorno local.
2. **Crear Test de Regresión:**
   - Escribir una prueba unitaria en el archivo `.test.js` correspondiente que falle precisamente debido al bug reportado.
   - Ejecutar `npm run test` para asegurar que el test efectivamente falla.
3. **Corregir:**
   - Modificar la base de código para corregir el bug, respetando siempre las convenciones de redondeo centesimal y arquitectura de CommonPay.
4. **Verificar Corrección:**
   - Ejecutar `npm run test` y comprobar que todos los tests (incluido el nuevo de regresión) pasan satisfactoriamente.
5. **Calidad y Estilo:**
   - Ejecutar `npm run lint` y `npm run format` para asegurar la calidad y consistencia del código modificado.
6. **Reportar:**
   - Explicar al usuario la causa raíz del bug, el cambio realizado y los tests que validan la corrección.
