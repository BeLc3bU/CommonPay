# Tareas de Implementación: 002 - Input de Transferencia Real de Olga

**Especificación:** `specs/002-input-transferencia-olga/spec.md`  
**Plan:** `specs/002-input-transferencia-olga/plan.md`

---

## Desglose de Tareas

- [x] **TASK-01:** Añadir el campo de entrada `<input id="input-ingreso-olga">` con su etiqueta y estilos Glassmorphism en `index.html` dentro de la barra de confirmación mensual.
- [x] **TASK-02:** Actualizar `js/app.js` para capturar `inputIngresoOlga`, escuchar el evento `'input'` y recalcular en vivo el "Ingreso del mes" y el superávit/déficit en la tarjeta superior de Olga y el dinero esperado en cuenta.
- [x] **TASK-03:** Actualizar `actualizarInterfaz()` en `js/app.js` para cargar el importe histórico en meses completados (deshabilitando el input) y el valor sugerido en meses pendientes.
- [x] **TASK-04:** Adaptar `completarMesActual()` en `js/app.js` para leer el valor del input, validar $>0$, aplicar el ajuste al acumulado de Olga, aportar a la fianza y registrar en el historial.
- [x] **TASK-05:** Añadir pruebas unitarias en `js/calculations.test.js` para validar escenarios dinámicos de superávit y déficit con entradas variables.
- [x] **TASK-06:** Ejecutar suite de pruebas unitarias (`npm run test`), linter (`npm run lint`) y build (`npm run build`).
- [x] **TASK-07:** Realizar commit y push de la feature a GitHub.
