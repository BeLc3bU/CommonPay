# Especificación: 004 - Redondeo a la Baja del Alquiler de Inquilinos

**Estado:** Implementado ✅  
**Fecha:** 2026-10-20  
**Autor:** Antigravity (GitHub Spec Kit)

---

## 1. Resumen y Contexto
- **Qué:** Aplicar redondeo a la baja (a la decena inferior de euros, ej. de 471,24 € a 470,00 €) de forma sistemática y automática cada vez que se actualice o calcule el alquiler de los inquilinos (bien sea por subida periódica IRAV/IPC, o en el cálculo del desglose mensual).
- **Por qué:** Acuerdo con la inquilina en el que, a pesar de que el incremento legal/contractual del 2% sobre la cuota base de 462,00 € resulta en 471,24 €, se fija y redondea a la baja a 470,00 € (mediante `Math.floor(monto / 10) * 10`). Esta regla se aplica en el motor de cálculo y en la estimación del calendario de cara a futuras revisiones.

---

## 2. Historias de Usuario / Casos de Uso
- **Como** Pedro y Olga,
- **Quiero** que cuando se aplique la actualización o incremento porcentual del alquiler (IRAV), la cuota resultante se redondee a la baja (470 € en lugar de 471,24 €),
- **Para** que la inquilina pague una cuota redonda a la baja y las aportaciones a la hipoteca y cálculos de hipoteca neta reflejen exactamente esa cifra acordada.

---

## 3. Requisitos Funcionales y Criterios de Aceptación

### Criterios de Aceptación:
- [x] **CA-01:** En `js/calculations.js`, al calcular el alquiler actualizado por IRAV (`mesIndex >= mesAlquiler`), la cuota calculada con la tasa porcentual se redondea a la baja (`Math.floor(ingreso / 10) * 10`). Para 462,00 € con tasa del 2%, el resultado es exactamente 470,00 € (en lugar de 471,24 €).
- [x] **CA-02:** Los céntimos resultantes de `ingresoAlquilerCents` son 47000 céntimos, y la hipoteca neta individual/común se basa en este valor redondeado (716,81 - 470,00 = 246,81 €).
- [x] **CA-03:** En `js/app.js` (generación de alertas de Google Calendar / iCal), la estimación de `alquilerNuevo` para la revisión IRAV refleja también el redondeo a la baja con `Math.floor(... / 10) * 10`.
- [x] **CA-04:** La suite de pruebas unitarias (`npm test`) verifica que con la subida del 2% de 462 € el alquiler resultante sea 470 € y la hipoteca neta se calcule coherentemente.
