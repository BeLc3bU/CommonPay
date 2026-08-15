# Plan Técnico: [NNN] - [Nombre de la Funcionalidad]

**Estado:** [Borrador | En Revisión | Aprobado | Implementado]  
**Especificación Asociada:** [spec.md](./spec.md)

---

## 1. Enfoque Arquitectónico y Estrategia
- **Resumen:** [Explicación técnica de la solución adoptada y decisiones de diseño]
- **Patrones de Diseño:** [Separación de capas: DOM/UI, Lógica matemática en céntimos, Persistencia híbrida]

---

## 2. Impacto en Archivos y Módulos
| Archivo | Acción | Descripción del Cambio |
| :--- | :--- | :--- |
| `js/calculations.js` | [Modificar / Crear / Ninguna] | [Añadir funciones de cálculo] |
| `js/storage.js` | [Modificar / Crear / Ninguna] | [Manejo de persistencia Supabase / LocalStorage] |
| `js/app.js` | [Modificar / Crear / Ninguna] | [Eventos del DOM y renderizado UI] |
| `css/style.css` | [Modificar / Crear / Ninguna] | [Estilos Glassmorphism o componentes nuevos] |
| `index.html` | [Modificar / Crear / Ninguna] | [Estructura semántica HTML] |

---

## 3. Modelo de Datos y Contratos de Interfaz
- **Estructura de Datos / JSON:**
  ```json
  {
    "ejemplo_campo": "valor"
  }
  ```
- **Esquema SQL / Supabase (si aplica):**
  ```sql
  -- Tablas o políticas RLS nuevas/modificadas
  ```

---

## 4. Estrategia de Pruebas Unitarias
- **Archivo de Test:** `js/calculations.test.js` (o nuevo test contiguo).
- **Casos de Prueba:**
  1. [Caso normal / flujo feliz]
  2. [Casos de redondeo y aritmética centesimal]
  3. [Casos borde o valores inválidos]

---

## 5. Riesgos Técnicos y Mitigaciones
- **Riesgo:** [Descripción del riesgo de regresión o compatibilidad]
  - **Mitigación:** [Cómo se previene o gestiona]
