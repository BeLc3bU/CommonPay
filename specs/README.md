# 🗺️ Especificaciones y Roadmap del Proyecto: CommonPay

Este directorio centraliza todas las especificaciones, planes técnicos, tareas y checklists de calidad gestionadas bajo la metodología **Spec-Driven Development (SDD)** de GitHub Spec Kit.

---

## 📌 Especificaciones Implementadas ✅
1. **[000 · CommonPay Core](./000-commonpay-core/spec.md)**
   - Motor financiero de cálculo, redondeo centesimal exacto, gráficos anuales (Chart.js), persistencia en `LocalStorage` y exportaciones (PDF/XLSX).
2. **001 · Persistencia en Nube y Autenticación**
   - Integración de Supabase Auth y políticas RLS con roles diferenciados (Pedro Editor, Olga Invitada).
3. **002 · Liquidación y Conciliación Día 15**
   - Módulo de conciliación bancaria para calcular sobrantes y déficits respecto al ahorro de fianza acumulado.
4. **003 · Alertas Contractuales y iCalendar**
   - Descarga de eventos `.ics` de recordatorios domésticos y regularizaciones por IPC/IRAV.
5. **004 · Previsión Anual Interactiva**
   - Vista dedicada con tabla mensual interactiva de los 12 meses del año para Olga y Pedro con tarjetas resumen y badges estacionales.

---

## 🔜 Próximas Especificaciones (Backlog)
- **005 · Parser de Extractos Bancarios**
  - Carga y análisis automático de extractos en PDF o Norma 43 para autocompletar importes de hipoteca, comunidad y suministros.
- **006 · Notificaciones por Telegram**
  - Envío automático de balances mensuales y confirmaciones al canal de la pareja mediante bot.
- **007 · Predicción de Suministros Variables**
  - Modelo predictivo para gas, agua y electricidad en base a históricos.
- **008 · Sub-fondos Planificadores**
  - Creación de sub-metas de ahorro doméstico (vacaciones, reformas) con la misma dinámica que la fianza.

---

## 🛠️ Flujo de Comandos de Spec Kit
Para trabajar con cualquier funcionalidad nueva:
- `/speckit.specify` — Crea `specs/NNN-nombre/spec.md`.
- `/speckit.clarify` — Desambigua casos borde y resuelve dudas.
- `/speckit.plan` — Genera el diseño técnico en `specs/NNN-nombre/plan.md`.
- `/speckit.checklist` — Genera las puertas de calidad en `specs/NNN-nombre/checklist.md`.
- `/speckit.tasks` — Genera el desglose de tareas en `specs/NNN-nombre/tasks.md`.
- `/speckit.implement` — Ejecuta las tareas paso a paso.
- `/speckit.converge` — Valida calidad total (`lint` + `test` + `build`).
