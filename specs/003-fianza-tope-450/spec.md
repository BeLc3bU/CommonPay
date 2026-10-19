# Especificación: 003 - Exención de Aportación al Fondo de Fianza al 100% (450 €)

**Estado:** Implementado ✅  
**Fecha:** 2026-10-19  
**Autor:** Antigravity (GitHub Spec Kit)

---

## 1. Resumen y Contexto
- **Qué:** Eximir de forma automática o configurable la aportación mensual de 10,00 € de Olga y 10,00 € de Pedro (20,00 € en total) al Fondo de Fianza cuando este alcance su objetivo del 100% (450,00 €). En los meses donde se cumpla la condición, se eliminará el concepto de Fianza del desglose mensual del Dashboard y de la Previsión Anual (mostrando 0,00 € sin sumarlo al total).
- **Por qué:** Una vez que el fondo de seguridad de 450,00 € está completamente repuesto, continuar cobrando 10,00 € a cada miembro distorsiona la cuota mensual real, el superávit de Olga y la previsión anual de gastos comunes.

---

## 2. Historias de Usuario / Casos de Uso
- **Como** Pedro (Editor) y Olga (Lectura),
- **Quiero** que cuando el fondo de fianza alcance los 450,00 € (100%), la aplicación deje de incluir los 10,00 € de aportación mensual en nuestras cuotas individuales,
- **Para** pagar únicamente los gastos reales (hipoteca neta, comunidad, gastos personales y extraordinarios) sin seguir acumulando fianza innecesariamente.

- **Como** Pedro (Editor),
- **Quiero** disponer en la pestaña de Configuración / Ajustes de una opción para controlar el "Mes Fianza Completa (100%)", con modo automático (calculado a partir del saldo acumulado) o selector manual de mes,
- **Para** tener flexibilidad total si el saldo se completa antes de tiempo o si se desea forzar el mes de finalización.

---

## 3. Requisitos Funcionales

1. **RF-01 (Motor de Cálculo - `js/calculations.js`):**
   - La función `calcularDesgloseMes(mesIndex, config)` debe determinar si en el mes consultado (`mesIndex`) la fianza ya ha alcanzado el 100% (450,00 €).
   - Se evaluará mediante el modo híbrido:
     - Si `config.fianza.mesCompleto` está fijado manualmente (0 a 11): para cualquier `mesIndex >= config.fianza.mesCompleto`, la aportación a fianza es 0,00 €.
     - Si está en modo automático (`'auto'`, `-1` o no definido): se calcula en qué mes el saldo acumulado proyectado alcanza o supera `config.fianza.objetivo` (450,00 €). A partir de dicho mes inclusive (o del mes siguiente si en ese mes se aportó la diferencia final), la cuota de fianza pasa a ser 0,00 €.
     - Si el saldo acumulado actual ya es $\ge 450,00\ \text{€}$, la aportación es 0,00 € para todos los meses activos.
   - En los meses donde la fianza esté completa:
     - No se añade el objeto `{ nombre: 'Fondo de Fianza', valor: ..., tipo: 'fianza' }` a `conceptosOlga` ni a `conceptosPedro`.
     - El total de Olga y Pedro se calcula sin esos 10,00 €.

2. **RF-02 (Dashboard Mes Actual - `js/app.js`):**
   - Al seleccionar un mes en el Dashboard:
     - Si en ese mes la fianza está exenta (100%), no aparece la fila "Fondo de Fianza" en el desglose de Olga ni en el de Pedro.
     - Los totales superiores de Olga y Pedro reflejan la cuota exacta descontando los 10,00 €.
     - El cálculo del superávit de Olga (`calcularSuperavit`) toma como base la cuota real reducida.
     - Al pulsar "Transferencia realizada" (`completarMesActual`), no se intenta realizar aportación alguna a la fianza y se notifica que el fondo ya está al 100%.

3. **RF-03 (Previsión Anual y Estadísticas):**
   - En la tabla de Previsión Anual (Desktop) y tarjetas móviles:
     - En los meses donde la fianza ya esté al 100%, la columna de Fianza muestra `0,00 €` con un badge o indicador visual sutil (`Meta 100%`), y el total del mes no suma dicha aportación.
     - En los meses previos (donde aún se está ahorrando), muestra los `10,00 €` habituales.
     - Los totales anuales de Olga y Pedro reflejan la suma real exacta.
   - En el gráfico anual (`Chart.js`) y estadísticas resumen:
     - Las barras y métricas anuales se adaptan automáticamente a los meses con y sin aportación de fianza.

4. **RF-04 (Panel de Ajustes / Configuración):**
   - En la sección "Ahorro de Fianza" de `config-view`, se añade el selector:
     - **Mes Fianza Completa (100%):** Opciones: "Automático (según saldo acumulado)", "Enero", "Febrero", ..., "Diciembre", "No eximir este año".
   - Al guardar ajustes, el valor se almacena en `appConfig.fianza.mesCompleto` y persiste en `LocalStorage` y `Vercel Postgres`.

---

## 4. Criterios de Aceptación (Medibles y Verificables)
- [ ] **CA-01:** Con saldo acumulado de fianza de 450,00 €, `calcularDesgloseMes` devuelve los desgloses de Olga y Pedro sin el concepto "Fondo de Fianza" y con 10,00 € menos en el total respectivo.
- [ ] **CA-02:** Con saldo acumulado de 410,00 € y aportación de 20,00 €/mes (10 € c/u), en Enero (mes 0) y Febrero (mes 1) se aporta fianza (alcanzando 450 €), y a partir de Marzo (mes 2) la fianza es 0,00 € y se omite del Dashboard.
- [ ] **CA-03:** En la vista de Previsión Anual, los meses posteriores a alcanzar los 450,00 € muestran `0,00 €` en la columna Fianza y sus totales mensuales y anuales no incluyen los 10,00 €.
- [ ] **CA-04:** En el panel de Ajustes, el usuario puede fijar manualmente el mes de fianza completa o dejarlo en "Automático", persistiendo la configuración tras recargar.
- [ ] **CA-05:** La suite completa de calidad pasa al 100%: `npm run test` (incluyendo nuevos tests de fianza al 100%), `npm run lint` (0 errores) y `npm run build` limpio.

---

## 5. Casos Límite y Restricciones
- Si la fianza se reduce por una retirada manual por debajo de 450,00 €, el sistema reactiva automáticamente la aportación de 10,00 € mensual en modo automático.
- No se rompe la retrocompatibilidad con registros históricos de transferencias ya guardadas.
- Todas las operaciones monetarias se realizan estrictamente en céntimos con redondeo centesimal.
