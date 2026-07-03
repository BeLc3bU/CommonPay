# Roadmap del Proyecto - CommonPay

Estado de las funcionalidades de CommonPay organizadas según los principios del Spec-Driven Development (SDD).

## Hecho ✅
1. **000 · CommonPay Core** — Calculadora de transferencias, lógica de redondeo exacto en céntimos y persistencia híbrida.
2. **001 · Persistencia en Nube y Autenticación** — Integración de Supabase Auth y RLS con políticas diferenciadas (Pedro Editor, Olga Invitada).
3. **002 · Liquidación y Conciliación Día 15** — Módulo de conciliación bancaria para calcular sobrantes y déficits respecto al ahorro de fianza.
4. **003 · Alertas Contractuales y iCalendar** — Descarga de eventos `.ics` de recordatorios domésticos y regularizaciones por IPC/IRAV.
5. **004 · Previsión Anual Interactiva** — Nueva vista en el menú con la tabla interactiva de los 12 meses para Olga y Pedro y tarjetas resumen.

## Siguiente 🔜
- **005 · Parser de Extractos Bancarios** — Carga y análisis automático de extractos en PDF o Norma 43 para autocompletar importes de hipoteca, comunidad y suministros.

## Backlog / Ideas 💡
- **Notificaciones por Telegram** — Envío automático de balances mensuales y confirmaciones al canal de la pareja mediante un bot.
- **Predicción de Suministros Variables** — Modelo predictivo para gas, agua y electricidad en base a históricos.
- **Sub-fondos Planificadores** — Creación de sub-metas de ahorro doméstico (ej. vacaciones, reformas) con la misma dinámica que la fianza.
