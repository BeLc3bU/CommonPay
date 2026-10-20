# Lista de Control de Calidad: 004 - Redondeo a la Baja del Alquiler de Inquilinos

**Especificación:** `specs/004-redondeo-alquiler-inquilinos/spec.md`  
**Plan:** `specs/004-redondeo-alquiler-inquilinos/plan.md`  
**Inspector:** Antigravity (GitHub Spec Kit)

---

## 1. Gobernanza y Puertas de Calidad
- [x] **Separación de Autoridad:** Requerimiento solicitado explícitamente por el usuario.
- [x] **TDD / Pruebas unitarias:** Tests actualizados y añadidos en `js/calculations.test.js`.
- [x] **Lógica Financiera:** Conservación de operaciones en céntimos enteros con `toCentavos` / `toEuros`.
- [x] **Convergencia:** `npm run test` (22/22 pasadas), `npm run lint` (0 errores) y `npm run build` completados con éxito.
- [ ] **Despliegue:** `git push origin main` y verificación de Vercel.
