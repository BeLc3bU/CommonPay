# Tareas de Implementación: 004 - Redondeo a la Baja del Alquiler de Inquilinos

**Especificación:** `specs/004-redondeo-alquiler-inquilinos/spec.md`  
**Plan:** `specs/004-redondeo-alquiler-inquilinos/plan.md`  
**Orquestador:** Antigravity (GitHub Spec Kit)

---

## Tareas

- [x] `[TASK-001]` Modificar `js/calculations.js` para aplicar `Math.floor(... / 10) * 10` sobre el cálculo del incremento del alquiler.
- [x] `[TASK-002]` Modificar `js/app.js` en la estimación del calendario de alerta de actualización IRAV para redondear a la baja (`Math.floor(... / 10) * 10`).
- [x] `[TASK-003]` Actualizar las pruebas en `js/calculations.test.js` para validar que 462 € con 2% resulte en 470 € exactos.
- [x] `[TASK-004]` Ejecutar suite de pruebas (`npm test`) y verificar convergencia (`npm run lint`, `npm run build`).
- [x] `[TASK-005]` Actualizar `specs/README.md` registrando la especificación 004 como implementada.
- [ ] `[TASK-006]` Commit y push a GitHub (`origin/main`) para despliegue automático en Vercel.
