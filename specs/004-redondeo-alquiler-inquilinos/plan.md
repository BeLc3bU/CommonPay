# Plan Técnico: 004 - Redondeo a la Baja del Alquiler de Inquilinos

**Especificación:** `specs/004-redondeo-alquiler-inquilinos/spec.md`  
**Arquitecto:** Antigravity (GitHub Spec Kit)

---

## 1. Arquitectura de Cambios

### Componentes Involucrados:
1. **`js/calculations.js`:**
   - En `calcularDesgloseMes(mesIndex, config)`:
     ```javascript
     let ingresoAlquilerBase = gastosFijos.ingresoAlquiler || 0;
     if (mesIndex >= parseInt(alertas.mesAlquiler)) {
       const tasaAlq = alertas.tasaAlquiler !== undefined ? parseFloat(alertas.tasaAlquiler) : 2.0;
       ingresoAlquilerBase = Math.floor(ingresoAlquilerBase * (1 + tasaAlq / 100));
     }
     ```
2. **`js/app.js`:**
   - En `exportarCalendarioIcs()`:
     ```javascript
     const alquilerNuevo = Math.floor(
       (appConfig.gastosFijos?.ingresoAlquiler || 0) * (1 + (alertas.tasaAlquiler || 2) / 100)
     );
     ```
3. **`js/calculations.test.js`:**
   - Actualizar y añadir pruebas unitarias comprobando el redondeo a la baja:
     - 462 € * 1.02 = 471.24 -> redondeado a la baja = 470.00 €.
     - 462 € * 1.10 = 508.20 -> redondeado a la baja = 508.00 €.
4. **Validación:**
   - Ejecutar `npm run lint` y `npm run test` para asegurar convergencia total.
