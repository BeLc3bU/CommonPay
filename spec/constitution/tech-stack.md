# Especificación del Tech Stack y Convenciones - CommonPay

Este documento detalla las decisiones tecnológicas estables del proyecto y las directrices técnicas del código.

## Tecnologías
- **Lenguaje:** JavaScript (ES6 Vanilla).
- **Entorno de Desarrollo:** Node.js 20+ con npm y Vite para el servidor de desarrollo rápido local.
- **Base de Datos y Persistencia:** Supabase (base de datos en la nube) con fallback en LocalStorage.
- **Suite de Pruebas:** Vitest (con jsdom).
- **Linter & Formatter:** ESLint y Prettier.
- **CDNs Utilizadas (index.html):**
  - `@supabase/supabase-js@2` (Base de datos remota)
  - `chart.js` (Gráfico interactivo)
  - `xlsx.full.min.js` (Exportación Excel)
  - `html2pdf.bundle.min.js` (Exportación PDF)
  - `lucide` (Iconografía)

## Archivos y Módulos Clave
- [index.html](file:///c:/Users/pubes/Desktop/Proyectos/CommonPay-main/index.html) — Interfaz de usuario PWA y enlaces CDN.
- [js/app.js](file:///c:/Users/pubes/Desktop/Proyectos/CommonPay-main/js/app.js) — Controlador del DOM, eventos de UI y rendering.
- [js/calculations.js](file:///c:/Users/pubes/Desktop/Proyectos/CommonPay-main/js/calculations.js) — Motor de cálculos matemáticos con redondeo centesimal.
- [js/storage.js](file:///c:/Users/pubes/Desktop/Proyectos/CommonPay-main/js/storage.js) — Capa de persistencia híbrida (Supabase/LocalStorage) y autenticación.
- [css/style.css](file:///c:/Users/pubes/Desktop/Proyectos/CommonPay-main/css/style.css) — Estilos visuales de Glassmorphism y variables de color.

## Comandos del Entorno
- `npm run dev` — Servidor de desarrollo Vite en local.
- `npm run test` — Ejecución de la suite de pruebas unitarias.
- `npm run lint` — Inspección estática del código con ESLint.
- `npm run format` — Formateo automático de código con Prettier.

## Modelo de Datos (Esquema SQL y Mapeos)
Las tablas de base de datos en Supabase mapean a JS bajo las siguientes reglas:
- **`configuracion`** (ID: 1): Almacena la configuración JSON de gastos.
- **`historial_transferencias`**: Registra meses completados. Columnas:
  - `mes_index` / `anio` (Llave primaria compuesta)
  - `transferencia_olga` / `transferencia_pedro`
  - `fianza_al_momento`
  - `desglose` (Objeto JSON completo)
- **`fianza_estado`** (ID: 1): `acumulado` (numérico) de la fianza.
- **`conciliaciones`**: Registro de liquidaciones bancarias del día 15.
- **`fianza_historial`**: Registro de movimientos de fianza (aportes ordinarios y extraordinarios).

## Convenciones Visuales y Estilos
- **Glassmorphism:** Estética premium con fondos translúcidos, bordes finos con opacidad y sombras suaves.
  ```css
  background: var(--bg-glass);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-glass);
  ```
- **Modo Oscuro/Claro:** Implementado a través de clases en el elemento `body` (`light-theme` / `dark-theme`) mediante CSS Variables.

## Límites Duros y Restricciones
- **No importar paquetes en runtime que no sean cargables por CDN** en `index.html` para no romper el entorno SPA.
- **Aritmética Financiera:** Todos los importes monetarios deben operarse en céntimos y redondearse antes de la conversión final a Euros.
- **No saltarse RLS:** Las escrituras a Supabase deben estar validadas por rol en la base de datos.
