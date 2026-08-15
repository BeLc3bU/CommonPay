# Puertas de Calidad (Checklist): 000 - CommonPay Core

**Estado:** Completado ✅  
**Especificación Asociada:** [spec.md](./spec.md) | [plan.md](./plan.md)

---

## 1. Validación de Requisitos y Criterios de Aceptación
- [x] Todos los criterios de aceptación en `spec.md` (CA-1 a CA-7) verificados y validados.
- [x] Aportaciones de fianza limitadas a 450,00 €.

---

## 2. Invariantes Arquitectónicos de CommonPay
- [x] **Aritmética Centesimal:** Funciones en `js/calculations.js` operan en céntimos enteros con `Math.round`.
- [x] **Resiliencia LocalStorage:** Funciona inmediatamente offline sin depender de Supabase.
- [x] **Diseño UI:** Interfaz Glassmorphism, temas Claro/Oscuro y 100% responsiva en móviles.

---

## 3. Suite Automatizada de Calidad (Convergence Gate)
- [x] `npm run lint` pasa con 0 errores.
- [x] `npm run test` pasa al 100% (7/7 tests).
- [x] `npm run build` genera el bundle de producción de Vite limpiamente.

---

## 4. Trazabilidad Documental
- [x] `specs/README.md` actualizado con estado Implementado.
- [x] `specs/000-commonpay-core/tasks.md` completado.
