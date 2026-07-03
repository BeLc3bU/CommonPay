# Misión - CommonPay

Esta es la constitución fundamental de la aplicación, definiendo su propósito y alcance técnico.

## Qué construimos
**CommonPay** es una aplicación PWA responsiva e interactiva diseñada para la conciliación, cálculo y liquidación de los gastos compartidos del hogar y el fondo de fianza de Olga y Pedro.

La aplicación consta de las siguientes piezas principales:
1. **Dashboard Mensual:** Panel interactivo para seleccionar el mes y computar de manera automática el balance mensual de transferencias.
2. **Previsión Anual:** Tabla e informe interactivo para simular y consultar los desgloses y totales del año completo por persona.
3. **Módulo de Liquidación del Día 15:** Sistema de conciliación bancaria para comparar el saldo real de la cuenta común con el acumulado de fianza y calcular sobrantes o déficits.
4. **Fondo de Fianza:** Sistema de ahorro conjunto interactivo con límite estricto de 450,00 €.
5. **Configuración Dinámica:** Panel editable para configurar importes fijos y extraordinarios (IBI, Seguro) sin programar.

## Para quién
- **Pedro:** Usuario editor/administrador, con privilegios de escritura en Supabase para registrar históricos, fianza y liquidaciones.
- **Olga:** Usuaria visitante con privilegios de solo lectura nativos, para consultar desgloses, previsiones anuales e históricos.

## Principios
- **Precisión Aritmética Absoluta:** Todos los cálculos monetarios deben realizarse en céntimos enteros para evitar la imprecisión de coma flotante de JavaScript.
- **Resiliencia y Offline-First:** La aplicación debe ser instalable como PWA y funcionar autónomamente de forma local con `LocalStorage` si la conexión o Supabase fallan.
- **Seguridad por RLS:** Las operaciones de escritura remota están blindadas mediante políticas RLS en Supabase, permitiendo el acceso público anónimo solo para lectura.

## Qué NO es
- **Pasarela de Pago:** No realiza transferencias bancarias reales ni se conecta a pasarelas como Stripe. Es únicamente un libro de registro y conciliación financiera.
- **Aplicación Multitenant:** Está diseñada y acotada específicamente para el flujo doméstico y las reglas de negocio del hogar de Olga y Pedro.
