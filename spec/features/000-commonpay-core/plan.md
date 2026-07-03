# 000 · CommonPay Core — Plan

**Estado:** Implementado ✅

## Enfoque
Desarrollo de una arquitectura cliente monolítica sin backend inicial. Se estructuran tres ficheros de JavaScript para separar las responsabilidades de DOM/UI (`js/app.js`), cálculos de negocio (`js/calculations.js`) y almacenamiento local (`js/storage.js`). Las librerías complejas (Chart.js, html2pdf, xlsx) se importan mediante enlaces CDN desde servidores rápidos de JS.

## Implementación
1. **Lógica de negocio (`js/calculations.js`):** Implementar funciones de conversión y redondeo centesimal seguro (`round()`), y la función de cálculo mensual `calcularDesgloseMes()`.
2. **Persistencia local (`js/storage.js`):** Desarrollar la interfaz con `localStorage` y configurar la inicialización con valores por defecto.
3. **Controlador e Interfaz (`index.html` + `js/app.js`):** Construir la UI responsiva con CSS y ligar los eventos del DOM a las funciones de renderizado, exportación y cálculo.

## Decisiones
- **Uso de céntimos para cálculos:** Se decidió multiplicar por 100 y redondear con `Math.round` para prevenir las imprecisiones nativas de punto flotante de JS (ej: `0.1 + 0.2 === 0.30000000000000004`).
- **Persistencia en LocalStorage:** Se optó por almacenamiento nativo del navegador para habilitar un funcionamiento Offline total inmediato, sentando las bases para una migración híbrida a la nube posterior.

## Riesgos
- **Pérdida de datos en borrado de caché:** Mitigado posteriormente mediante la implementación de sincronización en Supabase.
