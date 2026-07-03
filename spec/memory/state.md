# Estado de Memoria del Proyecto - CommonPay

Este documento actúa como el "cerebro" o la memoria a largo plazo para las inteligencias artificiales que asistan al proyecto. Debe ser actualizado al finalizar cada sesión de desarrollo.

## Última Sesión de Desarrollo (2026-07-03)
- **Actividad:** Conversión del proyecto a arquitectura AI-First.
- **Cambios Realizados:**
  - Creación del arnés `AGENTS.md` en la raíz.
  - Inicialización del entorno Node.js con `package.json` configurando Vite, Vitest, ESLint y Prettier.
  - Implementación de pruebas unitarias en `js/calculations.test.js` para blindar el motor financiero.
  - Creación de la estructura del Spec-Driven Development en `spec/` con su Constitución (`mission.md`, `tech-stack.md`, `roadmap.md`) y la feature base retrospectiva `000-commonpay-core`.
  - Estructuración de la memoria persistente y las habilidades de OpenCode.
  - Actualización de `README.md` (corrigiendo rutas de desarrollo e integrando la sección AI-First) y simplificación de `ROADMAP.md` para redirigir al roadmap oficial único en `spec/constitution/roadmap.md`.
- **Estado Actual:** 100% de los tests pasando, linter configurado y estructura SDD lista.

## Decisiones Técnicas Registradas
- **Node.js en local:** Introducción de Node/npm únicamente como arnés de desarrollo y validación automática. El cliente en producción se despliega de forma limpia y estática en Vercel.
- **Vitest con jsdom:** Configurado para simular APIs del navegador como `localStorage` y `window`, permitiendo testear de forma nativa los archivos de la app sin rehacer su arquitectura a módulos ES obligatorios en cliente.

## Tareas Pendientes / Próximos Pasos
- [ ] Implementar la Fase 5 del Roadmap (`005-parser-extractos`).
- [ ] Seguir estrictamente el flujo SDD: Specify -> Plan -> Tasks -> Implement -> Verify para toda nueva funcionalidad.
- [ ] Ejecutar el comando `/verify` antes de cada entrega o cierre de sesión.
