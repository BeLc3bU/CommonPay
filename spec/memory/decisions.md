# Registro de Decisiones de Arquitectura (ADR) - CommonPay

Este archivo registra las decisiones técnicas y de diseño importantes del proyecto, su justificación y sus implicaciones.

---

## ADR 001: Redondeo Financiero en Céntimos Enteros
- **Fecha:** 2026-07-03
- **Estatus:** Aceptado ✅
- **Contexto:** JavaScript posee imprecisiones nativas al trabajar con números de coma flotante de base binaria (ej. `0.1 + 0.2 === 0.30000000000000004`), lo cual es inaceptable para el motor financiero que calcula desgloses de hipoteca y transferencias mensuales entre Olga y Pedro.
- **Decisión:** Toda la lógica de cálculo en `js/calculations.js` opera multiplicando importes en euros por `100` para convertirlos a céntimos (números enteros), realiza las operaciones matemáticas con enteros y luego realiza un redondeo exacto con `Math.round()` antes de dividir entre `100` y devolver euros de nuevo.
- **Consecuencias:** Se eliminan de raíz las discrepancias de decimales en la interfaz de usuario y las exportaciones a PDF/Excel.

---

## ADR 002: Persistencia Híbrida local / en la nube
- **Fecha:** 2026-07-03
- **Estatus:** Aceptado ✅
- **Contexto:** Se requiere que la aplicación pueda funcionar offline en local pero a su vez sincronice datos en tiempo real entre múltiples dispositivos con control de privilegios (Pedro puede editar, Olga solo lee).
- **Decisión:** Usar Supabase como almacenamiento prioritario en la nube y persistencia en `LocalStorage` como respaldo automático. Si las variables de entorno de Supabase fallan o la red está desconectada, la app lee y escribe en `LocalStorage` de forma transparente y sin lanzar excepciones críticas en el navegador.
- **Consecuencias:** Alta disponibilidad y resiliencia offline.

---

## ADR 003: Arnés de Node.js no intrusivo en el Cliente
- **Fecha:** 2026-07-03
- **Estatus:** Aceptado ✅
- **Contexto:** Queremos introducir herramientas de validación automáticas (linter, tests, compilador) para los agentes de IA, pero la app en producción está construida con scripts sencillos del lado del cliente y CDNs. Reestructurar toda la app a módulos ES puros (bundler obligatorio) requeriría un esfuerzo destructivo que comprometería la ejecución local directa de `index.html`.
- **Decisión:** Configurar `package.json` con Vite y Vitest configurando un entorno de pruebas con `jsdom`. El archivo `js/calculations.js` y `js/storage.js` se importan y ejecutan directamente sobre `jsdom` en Vitest, permitiendo probarlos sin alterar las exportaciones que usan en producción (exposición en `window`).
- **Consecuencias:** La app sigue funcionando con doble clic en `index.html` sin obligar a usar un servidor de producción de Node.js, pero los agentes de IA ganan un entorno robusto de validación local.
