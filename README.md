# 🪙 CommonPay - Gestión Financiera Inteligente

CommonPay es una aplicación web responsiva e interactiva diseñada para la gestión financiera copropietaria de una expareja (Olga y Pedro). Permite calcular de forma completamente automática la transferencia mensual correspondiente a cada persona en base al mes seleccionado, gestionar un fondo de fianza común, almacenar el histórico de pagos, ver estadísticas anuales, emitir reportes y emitir alertas visuales de regularización contractual (hipoteca variable en septiembre, manutención por IPC en junio y alquiler por IRAV). Además, genera un calendario de pagos anual estructurado para Olga.

---

## ✨ Características Principales

* **Dashboard Mensual**: Selector del mes en curso con recálculo dinámico automático de transferencias y desgloses de conceptos.
* **Fondo de Fianza**: Barra de progreso interactiva para reponer una meta de **450,00 €** (aportaciones mensuales automáticas de 20,00 € o aportes extraordinarios manuales) con control para no superar el límite.
* **Liquidación del Día 15**: Módulo de conciliación bancaria para comparar el saldo real de la cuenta común con la fianza acumulada ($F_A$). Calcula sobrantes (que Pedro retira para cubrir gastos, incluyendo la manutención de Olga) o déficits a aportar para proteger la fianza.
* **Estadísticas Anuales**: Gráfico interactivo anual de evolución de gastos construido con **Chart.js**.
* **Historial Completo**: Registro ordenado de meses completados con posibilidad de deshacer transferencias.
* **Ajustes Editables**: Panel para configurar importes de hipoteca, comunidad, alquiler, gastos extraordinarios (IBI, seguro) y gastos personales sin tocar código.
* **Exportación Profesional**: Descarga de reportes mensuales en **PDF** (usando `html2pdf.js`) y descarga de históricos en **Excel (XLSX)** (usando `SheetJS`).
* **Diseño Premium**: Interfaz responsive y estética de tipo Glassmorphism con soporte nativo de **Modo Oscuro** / **Claro** y acceso restringido de solo lectura para invitados.

---

## 📂 Estructura del Código

El proyecto está diseñado bajo una arquitectura modular y ligera sin backend:

```
c:\Proyectos\MamalotApp\
├── index.html          # Interfaz de usuario (HTML5 con CDNs)
├── css/
│   └── style.css       # Estilos CSS (Glassmorphism, temas Claro/Oscuro)
├── js/
│   ├── app.js          # Controlador principal (UI, gráficos y exportaciones)
│   ├── calculations.js # Lógica de cálculo financiero (Cálculos en céntimos)
│   └── storage.js      # Persistencia local (LocalStorage de ajustes e historial)
├── .skills/            # Definición de Habilidades de Agentes (skills.sh)
│   ├── orchestrator/
│   │   └── SKILL.md    # Agente Orquestador (Coordinador)
│   ├── calculator/
│   │   └── SKILL.md    # Subagente Calculadora (Fórmulas matemáticas)
│   ├── configurator/
│   │   └── SKILL.md    # Subagente Configurador (Ajustes de datos)
│   └── exporter/
│       └── SKILL.md    # Subagente Exportador (Generador de PDF/Excel)
├── README.md           # Documentación general del proyecto (este archivo)
└── ROADMAP.md          # Planificación y hoja de ruta de la aplicación
```

---

## 🛠️ Instrucciones de Instalación, Configuración y Despliegue

La aplicación está diseñada con un **motor de persistencia híbrido**:
1. **Modo Local (LocalStorage)**: Si se abre el archivo `index.html` de forma local, funciona de manera autónoma sin necesidad de backend o configuración de red.
2. **Modo Nube (Supabase + Vercel)**: Si se despliega en Vercel con las variables de entorno de Supabase configuradas, sincroniza los datos en tiempo real con políticas de control de acceso.

### 1. Ejecución Local Directa
1. Abre la carpeta `c:\Proyectos\MamalotApp`.
2. Haz doble clic sobre [index.html](file:///c:/Proyectos/MamalotApp/index.html) para abrirlo directamente en el navegador.

### 2. Despliegue en la Nube (Vercel + Supabase)

#### Paso A: Inicializar base de datos en Supabase
1. Crea un proyecto gratuito en [Supabase](https://supabase.com/).
2. Ve al panel de **SQL Editor** de Supabase y ejecuta las consultas de inicialización que se detallan en el manual de entrega [walkthrough.md](file:///C:/Users/Usuario/.gemini/antigravity-ide/brain/301c2226-73ee-4d88-9da3-8ed84868b0af/walkthrough.md) para estructurar las tablas (`configuracion`, `historial_transferencias`, `fianza_estado` y `conciliaciones`) y activar Row Level Security (RLS).
3. En la sección **Auth -> Users** de Supabase, añade un usuario para Pedro (con su correo y contraseña). Desactiva los registros públicos en la configuración de autenticación de Supabase para evitar registros externos.

#### Paso B: Desplegar en Vercel
1. Conecta el repositorio de la aplicación en [Vercel](https://vercel.com/).
2. En los ajustes de Vercel (Project Settings -> Environment Variables), añade las siguientes variables:
   - `SUPABASE_URL`: La URL del endpoint de tu proyecto Supabase (encontrada en Settings -> API).
   - `SUPABASE_ANON_KEY`: La clave pública anónima de tu proyecto Supabase.
3. Despliega la aplicación. Vercel configurará automáticamente el enrutamiento a partir de [vercel.json](file:///c:/Proyectos/MamalotApp/vercel.json) y activará el endpoint de seguridad `/api/config` a partir de `api/config.js` para inicializar el cliente JS en el navegador de manera segura.

---

## 📊 Lógica Financiera y Redondeo Centesimal

Para evitar las imprecisiones aritméticas características del punto flotante en JavaScript (como por ejemplo que `716.81 - 462.00` resulte en `254.80999999999995`), toda la lógica implementada en [calculations.js](file:///c:/Proyectos/MamalotApp/js/calculations.js) procesa los importes monetarios multiplicándolos primero por **100** para trabajar con números enteros (**céntimos de euro**). 

Los resultados finales se redondean al entero más cercano y se dividen de nuevo por **100** para retornar el valor exacto en euros:

$$\text{Importe exacto} = \frac{\text{Math.round}(\text{Importe flotante} \times 100)}{100}$$

### Fórmulas del Negocio:
* **Hipoteca Neta**: Cuota Hipoteca ($716,81 \text{ €}$) - Alquiler ($462,00 \text{ €}$) = $254,81 \text{ €}$. Aportación individual (50%) = $127,41 \text{ €}$.
* **Comunidad**: Comunidad ($39,38 \text{ €}$). Aportación individual (50%) = $19,69 \text{ €}$.
* **Gastos Extraordinarios**:
  * **IBI**: $306,63 \text{ €}$ repartido en 3 meses (Ene, Feb, Mar). Aportación individual mensual = $51,11 \text{ €}$.
  * **Seguro Hogar**: $108,20 \text{ €}$ cargado solo en Abril. Aportación individual mensual = $54,10 \text{ €}$.

---

## 🤖 Arquitectura de Agentes Inteligentes (skills.sh)

La aplicación incorpora una especificación para entornos de desarrollo asistidos por Inteligencia Artificial utilizando el estándar abierto de **skills.sh**. Las habilidades estructuradas dentro de la carpeta `.skills/` permiten que asistentes inteligentes compatibles carguen de manera óptima las instrucciones y system prompts necesarios para operar o realizar tareas de mantenimiento sobre el proyecto.

* **Agente Orquestador ([SKILL.md](file:///c:/Proyectos/MamalotApp/.skills/orchestrator/SKILL.md))**: Recibe las intenciones del usuario en lenguaje natural y las delega al subagente especialista adecuado.
* **Subagente Calculadora ([SKILL.md](file:///c:/Proyectos/MamalotApp/.skills/calculator/SKILL.md))**: Procesa las consultas matemáticas de transferencias mensuales y estimaciones financieras.
* **Subagente Configurador ([SKILL.md](file:///c:/Proyectos/MamalotApp/.skills/configurator/SKILL.md))**: Valida y guarda las modificaciones de cuotas y objetivos en `LocalStorage`.
* **Subagente Exportador ([SKILL.md](file:///c:/Proyectos/MamalotApp/.skills/exporter/SKILL.md))**: Estructura la información del historial y desgloses para generar descargas en formato Excel o PDF.
