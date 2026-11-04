# Feature: 000-commonpay-core

## Objective and problem
Migrado desde especificación SDD original en specs/000-commonpay-core.
# Especificación: 000 - CommonPay Core

**Estado:** Implementado ✅  
**Fecha:** 2026-07-03  
**Autor:** Pedro / Antigravity

---

## 1. Resumen y Contexto
- **Qué:** Motor financiero central de CommonPay para calcular el balance de gastos fijos y personales, reponer un fondo de fianza compartido hasta 450,00 € mediante aportaciones mensuales de 10,00 € por persona, guardar históricos de transferen

## Scope and constraints
- Proyecto: CommonPay (MamalotApp)
- Runner de pruebas: npm run test (Vitest)
- Entorno: Vanilla JS, Vite, Supabase / Vercel

## Specs
# Especificación: 000 - CommonPay Core

**Estado:** Implementado ✅  
**Fecha:** 2026-07-03  
**Autor:** Pedro / Antigravity

---

## 1. Resumen y Contexto
- **Qué:** Motor financiero central de CommonPay para calcular el balance de gastos fijos y personales, reponer un fondo de fianza compartido hasta 450,00 € mediante aportaciones mensuales de 10,00 € por persona, guardar históricos de transferencias y visualizar la evolución en un gráfico anual mediante Chart.js.
- **Por qué:** Automatizar el reparto equitativo del 50% en gastos comunes (hipoteca neta, comunidad), deducir gastos individuales y gestionar la persistencia de datos local (`LocalStorage`) para que la aplicación funcione instantáneamente sin dependencias de red.

---

## 2. Historias de Usuario
- **Como** Pedro (Administrador), **quiero** registrar los gastos mensuales y aportaciones de fianza **para** tener el desglose exacto de las transferencias requeridas para cada uno.
- **Como** Olga (Usuaria), **quiero** consultar el desglose mensual y la previsión anual **para** conocer mi cuota con total transparencia.

---

## 3. Requisitos Funcionales
1. **RF-1:** Cálculo exacto de transferencias mensuales aplicando reparto al 50% sobre gastos comunes.
2. **RF-2:** Deducción de gastos personales pagados individualmente.
3. **RF-3:** Reposición automática/manual de fianza hasta un límite estricto de 450,00 €.
4. **RF-4:** Gráfico interactivo anual con desglose por concepto.
5. **RF-5:** Exportación de reportes a PDF y Excel (XLSX).

---

## 4. Criterios de Aceptación (Medibles y Verificables)
- [x] **CA-1:** Cálculos matemáticos precisos con redondeo centesimal (sin problemas de punto flotante).
- [x] **CA-2:** Gestión de la fianza con tope estricto a 450,00 €.
- [x] **CA-3:** Panel de configuración interactivo para ajustar importes sin tocar código.
- [x] **CA-4:** Persistencia automática en `LocalStorage`.
- [x] **CA-5:** Gráfico anual con desglose por persona y conceptos comunes/personales.
- [x] **CA-6:** Descarga de informes mensuales en PDF y exportación completa del historial en Excel (XLSX).
- [x] **CA-7:** Soporte nativo de Modo Claro y Oscuro.

---

## 5. Casos Límite y Restricciones
- **Aritmética:** No usar división/multiplicación directa con flotantes sin convertir a céntimos enteros.
- **Non-Goals:** No procesar transacciones bancarias reales.


## Tasks
# Tareas de Implementación: 000 - CommonPay Core

**Estado:** Implementado ✅  
**Especificación Asociada:** [spec.md](./spec.md) | **Plan:** [plan.md](./plan.md)

---

## Fase 1: Motor Financiero y Pruebas Unitarias
- [x] **T-1.1:** Programar la función de redondeo centesimal seguro en `js/calculations.js`.
- [x] **T-1.2:** Implementar la función de desglose financiero mensual `calcularDesgloseMes()`.
- [x] **T-1.3:** Crear la suite de pruebas unitarias en `js/calculations.test.js` y validar que pasen 100%.

## Fase 2: Persistencia y Almacenamiento
- [x] **T-2.1:** Desarrollar el módulo de persistencia local `LocalStorage` en `js/storage.js`.
- [x] **T-2.2:** Implementar hidratación síncrona de `LocalStorage` al inicio en `js/app.js`.
- [x] **T-2.3:** Paralelizar peticiones a Supabase con `Promise.all` en `js/app.js`.

## Fase 3: Interfaz de Usuario, Gráficos y Exportación
- [x] **T-3.1:** Crear estructura HTML base en `index.html` con selectores y sidebar.
- [x] **T-3.2:** Diseñar los estilos Glassmorphism y temas Claro/Oscuro en `css/style.css`.
- [x] **T-3.3:** Configurar la inicialización del gráfico interactivo con Chart.js en `js/app.js`.
- [x] **T-3.4:** Implementar descarga de reportes PDF e históricos en Excel (XLSX).

## Fase 4: Puertas de Calidad y Convergencia
- [x] **T-4.1:** Ejecutar `npm run lint` y verificar 0 errores.
- [x] **T-4.2:** Ejecutar `npm run test` asegurando 100% de tests verdes.
- [x] **T-4.3:** Ejecutar `npm run build` para asegurar compilación limpia de Vite.
- [x] **T-4.4:** Registrar la feature como "Hecho" en `specs/README.md`.


## Log
- L1: Petición original e implementación histórica completada en SDD.
- L2 (2026-11-04): Migración a estándar ODD (Gentle Shell). Documento consolidado en odd/tasks/000-commonpay-core.md.
