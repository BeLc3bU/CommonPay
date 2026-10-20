# 🗺️ Especificaciones y Roadmap del Proyecto: CommonPay

Este directorio centraliza todas las especificaciones, planes técnicos, tareas y checklists de calidad gestionadas bajo la metodología **Spec-Driven Development (SDD)** de GitHub Spec Kit.

---

## 📌 Especificaciones Activas e Implementadas
1. **[000 · CommonPay Core](./000-commonpay-core/spec.md)** ✅
   - Motor financiero de cálculo, redondeo centesimal exacto, gráficos anuales (Chart.js), persistencia en `LocalStorage` y exportaciones (PDF/XLSX).
2. **[001 · Migración de Persistencia a Vercel Postgres](./001-vercel-postgres-migration/spec.md)** ✅
   - Migración desde Supabase a Vercel Postgres (Serverless Neon) para eliminar pausas por inactividad, con autenticación serverless y persistencia híbrida.
3. **[002 · Input de Transferencia Real de Olga y Cálculo Dinámico](./002-input-transferencia-olga/spec.md)** ✅
   - Entrada editable del importe real transferido por Olga cada mes con cálculo en vivo de superávit/déficit y registro exacto en el historial.
4. **[003 · Exención de Fondo de Fianza al 100% (450 €)](./003-fianza-tope-450/spec.md)** ✅
5. **[004 · Redondeo a la Baja del Alquiler de Inquilinos](./004-redondeo-alquiler-inquilinos/spec.md)** ✅
   - Exención automática e híbrida de los 10 € mensuales de Olga y Pedro una vez el fondo alcanza el tope de 450 €, con ajuste en Dashboard y Previsión Anual.

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
