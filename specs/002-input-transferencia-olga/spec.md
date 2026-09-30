# Especificación: 002 - Input de Transferencia Real de Olga y Cálculo Dinámico

**Estado:** Aprobado  
**Fecha:** 2026-09-30  
**Autor:** Antigravity (GitHub Spec Kit)

---

## 1. Resumen y Contexto
- **Qué:** Añadir un campo de entrada numérico en el bloque inferior de confirmación (junto al botón "Transferencia realizada") para ingresar el importe exacto transferido por Olga ese mes. En la tarjeta superior de Olga, mostrar de solo lectura el "Ingreso del mes" sincronizado en tiempo real, junto con el superávit/déficit de ese mes y el balance total acumulado.
- **Por qué:** El importe transferido por Olga puede fluctuar cada mes. Esta solución centraliza la acción de entrada en la zona de acción de transferencia, manteniendo la tarjeta de Olga como un cuadro de mando limpio y de solo lectura que refleja instantáneamente el impacto del ingreso.

---

## 2. Historias de Usuario / Casos de Uso
- **Como** Pedro (Editor),
- **Quiero** escribir en un campo junto al botón "Transferencia realizada" el dinero que Olga ha transferido realmente este mes,
- **Para** que la tarjeta superior de Olga actualice en tiempo real el ingreso del mes y el superávit/déficit resultante antes de confirmar el registro.

- **Como** Olga (Invitada / Solo Lectura),
- **Quiero** ver en mi tarjeta el desglose claro de mi cuota, el ingreso registrado del mes, el superávit o déficit del mes y mi saldo acumulado total,
- **Para** conocer con absoluta transparencia mis cuentas domésticas.

---

## 3. Requisitos Funcionales
1. **RF-01 (Input en Bloque de Acción Inferior):**
   - En la sección inferior de confirmación mensual (junto a los botones "PDF" y "Transferencia realizada"), se añade un campo de entrada numérico rotulado: `Ingreso Olga (€):` con valor sugerido inicial (por defecto el ingreso habitual configurado, ej. 550,00 €).
2. **RF-02 (Tarjeta Superior de Olga de Solo Lectura):**
   - La tarjeta de Olga NO tendrá campos editables; es de solo lectura.
   - Mostrará:
     - Cuota teórica calculada de gastos comunes/personales/extraordinarios.
     - **Ingreso del mes:** Valor sincronizado en vivo con lo que se escribe en el input inferior.
     - **Superávit / Déficit de este mes:** Calculado en tiempo real con respecto a la cuota teórica:
       $$\text{Superávit Mes} = \text{Ingreso del Mes} - \text{Cuota Teórica Olga}$$
       con su correspondiente color (verde si $\ge 0$, rojo si $< 0$).
     - **Balance Total Acumulado:** Badge con el saldo acumulado histórico de Olga.
3. **RF-03 (Acción "Transferencia Realizada"):**
   - Valida que el input contenga un número mayor a 0.
   - Aplica el superávit/déficit mensual al balance acumulado de Olga con precisión centesimal:
     $$\text{Nuevo Saldo} = \frac{\text{Céntimos Anteriores} + \text{Céntimos Superávit Mes}}{100}$$
   - Aporta automáticamente al fondo de fianza (hasta 20,00 € mensuales) si el fondo aún no ha alcanzado los 450,00 € (100%).
   - Registra en `historial_meses` el mes completado con `transferenciaOlga = valorInput`.
   - Bloquea el botón ("✓ Transferencia registrada") y deshabilita el input inferior para evitar alteraciones accidentales.
4. **RF-04 (Sincronización con Meses Completados):**
   - Al seleccionar un mes en el selector global:
     - Si el mes ya fue registrado: el input inferior muestra el importe que se guardó en dicho mes y queda deshabilitado (`disabled`). La tarjeta superior muestra el desglose histórico.
     - Si el mes no está registrado: el input se habilita para edición (si es Pedro) sugiriendo el valor habitual (550,00 €).
     - Si se elimina un mes del historial: el mes vuelve al estado no completado y el input se reactiva.
5. **RF-05 (Control de Roles):**
   - El input inferior solo está habilitado para edición si el usuario activo es Pedro (Editor).
   - Para Olga / Modo Lectura, el input estará deshabilitado.

---

## 4. Criterios de Aceptación (Medibles y Verificables)
- [ ] **CA-01:** Al escribir un importe en el input inferior (ej. 600,00 €), la tarjeta de Olga refleja inmediatamente "Ingreso del mes: 600,00 €" y recalcula el superávit del mes sin necesidad de recargar la página.
- [ ] **CA-02:** Si el ingreso es menor a la cuota teórica (ej. 400,00 € vs 434,43 €), la tarjeta de Olga muestra el déficit en rojo (ej. `-34,43 €`).
- [ ] **CA-03:** Al pulsar "Transferencia realizada", se guarda en la base de datos el valor del input en `transferenciaOlga` y el saldo acumulado de Olga se ajusta correctamente en céntimos.
- [ ] **CA-04:** La fianza suma automáticamente hasta 20,00 € si el acumulado actual es $< 450,00 €$.
- [ ] **CA-05:** Al navegar a un mes ya completado, el input inferior se muestra deshabilitado con el valor con el que se cerró ese mes.
- [ ] **CA-06:** Pasa la suite completa de calidad: 100% tests unitarios (`npm run test`), 0 errores de linter (`npm run lint`), y build limpio (`npm run build`).

---

## 5. Casos Límite y Restricciones
- Si el usuario introduce valores inválidos (vacío, negativo o texto) al pulsar el botón, se muestra alerta descriptiva en español y se detiene la acción.
- Admite tanto separador decimal coma (`,`) como punto (`.`).
