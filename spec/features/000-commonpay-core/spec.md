# 000 · CommonPay Core

**Estado:** Implementado ✅

## Qué hace
Implementa el motor financiero central de CommonPay para calcular el balance de gastos fijos y personales, reponer un fondo de fianza compartido hasta 450,00 € mediante aportaciones mensuales de 10,00 € por persona, guardar históricos de transferencias realizadas y visualizar la evolución en un gráfico anual mediante Chart.js.

## Por qué
Es la base lógica del proyecto que automatiza el reparto equitativo del 50% en gastos comunes (hipoteca neta, comunidad), deduce los gastos individuales y gestiona de forma robusta la persistencia local de datos (`LocalStorage`) para que la aplicación funcione instantáneamente sin dependencias de red.

## Criterios de Aceptación
- [x] Cálculos matemáticos precisos con redondeo centesimal (sin problemas de punto flotante).
- [x] Gestión de la fianza con tope estricto a 450,00 € (los aportes manuales o automáticos no deben sobrepasar este límite).
- [x] Panel de configuración interactivo para ajustar importes sin tocar código.
- [x] Persistencia automática en LocalStorage para configuraciones, históricos y fianza.
- [x] Gráfico anual con desglose por persona y conceptos comunes/personales.
- [x] Descarga de informes mensuales en PDF y exportación completa del historial en Excel (XLSX).
- [x] Soporte nativo de Modo Claro y Oscuro.
