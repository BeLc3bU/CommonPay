# 🗺️ Roadmap de Desarrollo - CommonPay

Esta hoja de ruta detalla la estrategia de evolución técnica y de negocio de **CommonPay** a lo largo de las próximas sesiones de desarrollo.

---

## 📍 Estado Actual (Fase 1: Aplicación Core)
* [x] **Calculadora financiera responsiva** con desglose interactivo.
* [x] **Redondeo seguro en centavos** para evitar problemas de coma flotante.
* [x] **Fondo de fianza** con control de límite estricto a 450 € e incremento automático.
* [x] **Historial local** interactivo con opción de corrección de errores (eliminar fila).
* [x] **Gráfico interactivo anual** con desglose por persona mediante Chart.js.
* [x] **Exportación local** a ficheros de Excel (XLSX) y reportes de desglose a PDF.
* [x] **Panel de Configuración** editable interactivamente sin tocar código.
* [x] **Modo oscuro y claro** nativo guardado en sesión.

---

## 🚀 Fase 2: Persistencia en la Nube y Sincronización (Completada)
*Objetivo: Permitir el acceso web centralizado en Vercel, con sincronización de datos compartida y protección de permisos de edición.*

* [x] **Base de Datos Serverless (Supabase)**:
  * Migrar el motor de almacenamiento de LocalStorage a tablas relacionales (`configuracion`, `historial_transferencias`, `fianza_estado`) en Supabase.
  * Mantener LocalStorage como fallback automático asíncrono en local en caso de desconexión o desarrollo.
* [x] **Seguridad y Control de Edición (Pedro Editor, Olga Invitada)**:
  * Configurar políticas de seguridad de Row Level Security (RLS) en Supabase para permitir lectura pública anónima y escritura restringida únicamente a usuarios autenticados.
  * Implementar modal de autenticación segura (Supabase Auth) para Pedro e indicador de rol "Solo Lectura" vs "Editor".
* [x] **API Gateway en Vercel**:
  * Desplegar la aplicación en Vercel y crear un endpoint Serverless `/api/config.js` para entregar dinámicamente las claves de Supabase protegiendo las claves del código público.

---

## 💵 Fase 3: Conciliación Bancaria y Liquidación del Día 15 (Completada)
*Objetivo: Controlar el saldo real en la cuenta común al final del día 15 para salvaguardar el fondo de fianza acumulado y liquidar el saldo sobrante a favor de Pedro (manutención de Olga y otros conceptos) o reponer déficits.*

* [x] **Módulo de Liquidación**:
  * Pestaña dedicada en la barra lateral e interfaz responsiva con tarjeta resumen.
  * Captura del Saldo Real del Banco el día 15 ($S_R$).
  * Comparación contra el ahorro de la fianza acumulada de ese mes ($F_A$).
* [x] **Lógica de Aportación/Retiro (Pedro)**:
  * Cálculo de la diferencia $D = S_R - F_A$.
  * Mensaje dinámico con instrucciones en español para Pedro indicando si debe retirar un sobrante a su cuenta personal o aportar un déficit de su dinero propio.
* [x] **Persistencia en la Nube e Historial**:
  * Tabla SQL `conciliaciones` en Supabase con políticas RLS de lectura anónima y escritura de editor.
  * Persistencia asíncrona híbrida con LocalStorage `commonpay_conciliaciones`.
  * Historial interactivo de liquidaciones con badges de estado y opción de borrado seguro.

---

## 📅 Fase 4: Sincronización con Google Calendar / iCal (Completada)
*Objetivo: Exportar los días señalados del calendario doméstico a Google Calendar u otros clientes de calendario.*

* [x] **Corrección del selector de mes IRAV del Alquiler**:
  * Añadido el campo desplegable "Actualización Alquiler IRAV" en la sección de Regularizaciones y Alertas de Ajustes.
  * El mes seleccionado se guarda en la configuración y se utiliza tanto para el recálculo automático como para la generación de eventos de calendario.
* [x] **Exportación a iCalendar (.ics)**:
  * Botón "Descargar Calendario (.ics)" que genera y descarga un archivo `CommonPay_Calendario_2026.ics`.
  * El archivo contiene 6 eventos:
    * **Recurrente cada día 5**: Recordatorio de ingreso de Olga.
    * **Recurrente cada día 10**: Recordatorio del cobro de la Hipoteca.
    * **Recurrente cada día 15**: Recordatorio del ingreso de Alquiler y liquidación del balance.
    * **Puntual mes configurado (Hipoteca)**: Alerta de revisión de cuota variable.
    * **Puntual mes configurado (Manutención)**: Alerta de actualización por IPC.
    * **Puntual mes configurado (Alquiler)**: Alerta de actualización por IRAV.
  * Compatible con Google Calendar, Apple Calendar, Outlook y cualquier cliente iCal.
* [x] **Botones de enlace directo a Google Calendar**:
  * Tres botones que abren Google Calendar en nueva pestaña con el evento pre-rellenado (título, descripción, fecha y recurrencia mensual).

---

## 📊 Fase 5: Parser de Extractos Bancarios y Conciliación Inteligente (Mediano Plazo)
*Objetivo: Reducir la introducción manual de datos y digitalizar los desgloses mediante ficheros bancarios.*

* [ ] **Parser de Extractos**:
  * Permitir arrastrar extractos bancarios en PDF o ficheros de Norma 43 (formato de banca estándar en España).
  * Extraer automáticamente los importes reales de la Hipoteca, el ingreso de Alquiler y la Comunidad.
* [ ] **Conciliación Presupuestaria Avanzada**:
  * Comparar automáticamente los gastos calculados por la aplicación con los movimientos bancarios reales, detectando variaciones de céntimos o cobros extras de comunidad de forma automática.

---

## 🔔 Fase 5: Notificaciones y Canales Compartidos (Largo Plazo)
*Objetivo: Integrar las finanzas del hogar en los canales de comunicación cotidianos de la pareja.*

* [ ] **Integración con Telegram (Bot)**:
  * Enviar un mensaje automático al grupo de Telegram de la pareja el día 1 de cada mes con los montos exactos que debe transferir cada uno.
  * Notificar a la pareja en tiempo real en Telegram cuando uno de los dos pulse "Transferencia realizada" o cuando Pedro registre la liquidación.
* [ ] **Recordatorios Inteligentes**:
  * Notificación amigable si llega el día 10 del mes y la transferencia aún no ha sido marcada como completada.

---

## 🧠 Fase 6: Inteligencia de Ahorro y Predicciones (Futuro)
*Objetivo: Ofrecer análisis avanzados del comportamiento del gasto y previsiones financieras a largo plazo.*

* [ ] **Previsión de Suministros Variables**:
  * Permitir añadir gastos variables mensuales (luz, agua, gas) y realizar un modelo predictivo estacional de gasto para el año en curso.
* [ ] **Alertas de Desviación Anual**:
  * Comparativa entre el presupuesto extraordinario estimado (IBI, seguro) y el real pagado, proyectando el impacto sobre los ahorros mensuales.
* [ ] **Planificador de Proyectos**:
  * Crear sub-fondos de ahorro adicionales (ej. "Vacaciones" o "Reformas") que sigan el mismo comportamiento automático que el fondo de fianza.
