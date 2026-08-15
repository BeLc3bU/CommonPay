# Plan Técnico: 000 - CommonPay Core

**Estado:** Implementado ✅  
**Especificación Asociada:** [spec.md](./spec.md)

---

## 1. Enfoque Arquitectónico y Estrategia
- **Resumen:** Arquitectura cliente modular en JavaScript Vanilla estructurada en tres ficheros: DOM/UI (`js/app.js`), cálculos de negocio (`js/calculations.js`) y almacenamiento local (`js/storage.js`). Las librerías complejas (Chart.js, html2pdf, xlsx) se importan mediante enlaces CDN.
- **Patrón:** Separación estricta entre motor matemático puro y renderizado DOM.

---

## 2. Impacto en Archivos y Módulos
| Archivo | Acción | Descripción del Cambio |
| :--- | :--- | :--- |
| `js/calculations.js` | Crear | Funciones de conversión centesimal y cálculo mensual (`calcularDesgloseMes`) |
| `js/calculations.test.js` | Crear | Pruebas unitarias completas con Vitest |
| `js/storage.js` | Crear | Módulo de persistencia local en `LocalStorage` |
| `js/app.js` | Crear | Orquestador de eventos, gráficos y renderizado DOM |
| `css/style.css` | Crear | Diseño Glassmorphism y temas Claro/Oscuro |
| `index.html` | Crear | Markup semántico, estructura visual e importación CDN |

---

## 3. Modelo de Datos
- **Configuración:**
  ```json
  {
    "hipoteca_base": 716.81,
    "alquiler_base": 462.00,
    "comunidad_base": 39.38,
    "ibi_cuota": 306.63,
    "seguro_cuota": 108.20,
    "gastos_olga": 0.00,
    "gastos_pedro": 0.00
  }
  ```

---

## 4. Estrategia de Pruebas Unitarias
- `js/calculations.test.js`: Valida redondeo centesimal, desglose mensual para cada mes y límite de fianza a 450,00 €.

---

## 5. Riesgos Técnicos y Mitigaciones
- **Pérdida de datos en borrado de caché:** Mitigado mediante la sincronización remota en Supabase.
