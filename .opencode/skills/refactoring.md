# Skill: Refactoring & Architecture Integrity - CommonPay

Esta habilidad prescribe las buenas prácticas para evolucionar y desglosar el código fuente de forma limpia.

## Principio de Responsabilidad Única
- **Modularización del Monolito:** El archivo `js/app.js` debe dividirse gradualmente en controladores o vistas específicas de interfaz (ej: `js/views/dashboard.js`, `js/views/prevision.js`) para evitar archivos gigantes que saturen el contexto del agente de IA.
- **División de Capas:**
  - UI y eventos del DOM $\rightarrow$ `js/app.js` o vistas.
  - Lógica aritmética y de negocio $\rightarrow$ `js/calculations.js`.
  - Persistencia de datos $\rightarrow$ `js/storage.js`.

## Higiene de Contexto
- **Evitar Duplicidad:** No re-escribas funciones matemáticas en controladores de UI. Todo cálculo financiero debe consumir `window.CalculationsModule`.
- **Comentarios Limpios:** Conserva y mantén actualizados los comentarios JSDoc de las funciones principales para facilitar la auto-documentación y la comprensión del modelo de lenguaje.
- **Código Muerto:** Elimina variables, importaciones y bloques de código huérfanos que puedan generar ambigüedad en el razonamiento de la IA.
