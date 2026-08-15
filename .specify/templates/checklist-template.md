# Puertas de Calidad (Checklist): [NNN] - [Nombre de la Funcionalidad]

**Estado:** [Pendiente | En Progreso | Completado ✅]  
**Especificación Asociada:** [spec.md](./spec.md) | [plan.md](./plan.md)

---

## 1. Validación de Requisitos y Criterios de Aceptación
- [ ] Todos los criterios de aceptación en `spec.md` han sido verificados funcionalmente.
- [ ] Casos borde y valores límite contemplados.

---

## 2. Invariantes Arquitectónicos de CommonPay
- [ ] **Aritmética Centesimal:** No se usan flotantes en operaciones de dinero; se procesan céntimos enteros con `Math.round`.
- [ ] **Resiliencia LocalStorage:** Funciona sin errores si Supabase o la red están desconectados.
- [ ] **Seguridad & RLS:** No se exponen credenciales en el cliente y las escrituras validan el rol de usuario.
- [ ] **Diseño UI:** Mantiene la estética Glassmorphism, temas Claro/Oscuro y diseño responsivo.

---

## 3. Suite Automatizada de Calidad (Convergence Gate)
- [ ] `npm run lint` pasa con 0 errores.
- [ ] `npm run test` pasa al 100% de las pruebas unitarias.
- [ ] `npm run build` genera el bundle sin fallos de empaquetado.

---

## 4. Trazabilidad Documental
- [ ] `specs/README.md` actualizado con el nuevo estado.
- [ ] `specs/NNN-nombre/tasks.md` con todas las casillas marcadas.
- [ ] Decisiones arquitectónicas registradas en `.specify/memory/decisions.md` (si aplica).
