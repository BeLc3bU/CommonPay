# Skill: Frontend Design & UI - CommonPay

Esta habilidad especifica las reglas de estilo y manipulación del DOM en el frontend del proyecto.

## Directrices de Diseño Visual
- **Glassmorphism:** Los contenedores y paneles de la UI deben seguir la línea visual actual. Usa fondos translúcidos, sombras y bordes con opacidad.
  ```css
  background: var(--bg-glass);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-glass);
  box-shadow: var(--shadow-glass);
  ```
- **Paleta de Colores Curada:** Usa variables CSS de estilo definidas en `css/style.css`. Evita colores planos genéricos.
- **Tipografía:** Tipografías de Google Fonts especificadas en el CSS, adaptadas con escala fluida.
- **Modo Claro / Oscuro:** Toda modificación visual debe probarse en ambos modos. La selección se realiza agregando la clase `light-theme` o `dark-theme` al `body`.

## Manipulación del DOM e Interacciones
- **Bindings en `js/app.js`:** Toda interacción de clics, navegación e inyección de HTML debe registrarse de forma organizada en `js/app.js`.
- **Prevenir Recargas de Página:** Las interacciones del usuario en formularios o botones deben capturarse mediante `event.preventDefault()` para mantener la experiencia de Single Page Application (SPA).
- **Responsive Design:** La aplicación debe visualizarse y operarse de forma óptima en pantallas móviles (desde 320px de ancho) y monitores de escritorio. Usa CSS grid y flexbox responsivo.
