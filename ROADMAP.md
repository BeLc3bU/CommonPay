# 🗺️ Roadmap de Desarrollo - CommonPay

Esta hoja de ruta detalla la estrategia de evolución técnica y de negocio de **CommonPay** a lo largo de las próximas sesiones de desarrollo como expareja copropietaria.

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

## 📊 Fase 3: Conciliación Bancaria Inteligente (Mediano Plazo)
*Objetivo: Reducir la introducción manual de datos y digitalizar los desgloses mediante ficheros bancarios.*

* [ ] **Módulo Parser de Extractos Bancarios**:
  * Permitir arrastrar extractos bancarios en PDF o ficheros de Norma 43 (formato de banca estándar en España).
  * Extraer automáticamente los importes reales de la Hipoteca, el ingreso de Alquiler y la Comunidad.
* [ ] **Conciliación Presupuestaria**:
  * Comparar automáticamente los gastos calculados por la aplicación con los movimientos bancarios reales, detectando variaciones de céntimos o cobros extras de comunidad.

---

## 🔔 Fase 4: Notificaciones y Canales Compartidos (Largo Plazo)
*Objetivo: Integrar las finanzas del hogar en los canales de comunicación cotidianos de la pareja.*

* [ ] **Integración con Telegram (Bot)**:
  * Enviar un mensaje automático al grupo de Telegram de la pareja el día 1 de cada mes con los montos exactos que debe transferir cada uno.
  * Notificar a la pareja en tiempo real en Telegram cuando uno de los dos pulse "Transferencia realizada".
* [ ] **Recordatorios Inteligentes**:
  * Notificación amigable si llega el día 10 del mes y la transferencia aún no ha sido marcada como completada.

---

## 🧠 Fase 5: Inteligencia de Ahorro y Predicciones (Futuro)
*Objetivo: Ofrecer análisis avanzados del comportamiento del gasto y previsiones financieras a largo plazo.*

* [ ] **Previsión de Suministros Variables**:
  * Permitir añadir gastos variables mensuales (luz, agua, gas) y realizar un modelo predictivo estacional de gasto para el año en curso.
* [ ] **Alertas de Desviación Anual**:
  * Comparativa entre el presupuesto extraordinario estimado (IBI, seguro) y el real pagado, proyectando el impacto sobre los ahorros mensuales.
* [ ] **Planificador de Proyectos**:
  * Crear sub-fondos de ahorro adicionales (ej. "Vacaciones" o "Reformas") que sigan el mismo comportamiento automático que el fondo de fianza.
