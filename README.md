# 🪙 CommonPay - Gestión Financiera Inteligente

CommonPay es una aplicación web responsiva e interactiva diseñada para la gestión financiera compartida entre Olga y Pedro. Permite calcular de forma completamente automática la transferencia mensual correspondiente a cada persona en base al mes seleccionado, gestionar un fondo de fianza común, almacenar el histórico de pagos, consultar la **previsión anual interactiva** de pagos por persona, ver estadísticas anuales y emitir alertas visuales de regularización contractual (hipoteca variable, manutención por IPC y alquiler por IRAV).

---

## ✨ Características Principales

* **Dashboard Mensual**: Selector del mes en curso con recálculo dinámico automático de transferencias y desgloses de conceptos.
* **Previsión Anual**: Vista dedicada con tabla mensual interactiva de los 12 meses del año para Olga y Pedro. Incluye tarjetas de resumen, highlight del mes actual, badges de alertas estacionales (Rev. Hipoteca, IPC Manutención, Rev. Alquiler IRAV) y totales anuales por concepto.
* **Fondo de Fianza**: Barra de progreso interactiva para reponer una meta de **450,00 €** (aportaciones mensuales automáticas de 20,00 € o aportes extraordinarios manuales) con control para no superar el límite.
* **Liquidación del Día 15**: Módulo de conciliación bancaria para comparar el saldo real de la cuenta común con la fianza acumulada ($F_A$). Calcula sobrantes (que Pedro retira para cubrir gastos, incluyendo la manutención de Olga) o déficits a aportar para proteger la fianza.
* **Estadísticas Anuales**: Gráfico interactivo anual de evolución de gastos construido con **Chart.js**.
* **Historial Completo**: Registro ordenado de meses completados con posibilidad de deshacer transferencias.
* **Ajustes Editables**: Panel para configurar importes de hipoteca, comunidad, alquiler, gastos extraordinarios (IBI, seguro) y gastos personales sin tocar código.
* **Exportación Profesional**: Descarga de reportes mensuales en **PDF** (usando `html2pdf.js`) y descarga de históricos en **Excel (XLSX)** (usando `SheetJS`).
* **Diseño Premium**: Interfaz responsive y estética de tipo Glassmorphism con soporte nativo de **Modo Oscuro** / **Claro** y acceso restringido de solo lectura para invitados.

---

## 📂 Estructura del Código

El proyecto está diseñado bajo una arquitectura modular y ligera:

```
CommonPay-main/
├── .opencode/           # Arnés de OpenCode (skills y comandos del agente)
├── api/                 # Endpoints Serverless (Vercel Node.js Functions)
├── css/
│   └── style.css        # Estilos CSS (Glassmorphism, temas Claro/Oscuro)
├── js/
│   ├── app.js           # Controlador principal (DOM, UI, gráficos y exportaciones)
│   ├── calculations.js  # Lógica de cálculo financiero (Cálculos en céntimos)
│   ├── calculations.test.js # Suite de pruebas unitarias locales
│   └── storage.js       # Persistencia local / remota (Supabase y LocalStorage)
├── spec/                # Spec-Driven Development (SDD)
│   ├── constitution/    # Misión, Tech Stack y Roadmap estables
│   └── memory/          # Memoria persistente e historial de sesiones
├── index.html           # Interfaz de usuario (HTML5 con CDNs)
├── package.json         # Configuración del entorno de automatización (Vite/Vitest)
├── README.md            # Documentación general del proyecto (este archivo)
└── ROADMAP.md           # Hoja de ruta para consulta rápida
```

---

## 🛠️ Instrucciones de Instalación, Configuración y Despliegue

La aplicación está diseñada con un **motor de persistencia híbrido**:
1. **Modo Local (LocalStorage)**: Si se abre el archivo `index.html` de forma local, funciona de manera autónoma sin necesidad de backend o configuración de red.
2. **Modo Nube (Supabase + Vercel)**: Si se despliega en Vercel con las variables de entorno de Supabase configuradas, sincroniza los datos en tiempo real con políticas de control de acceso.

### 1. Ejecución y Desarrollo Local
Para inicializar el entorno de desarrollo y validación automática del proyecto:
1. Clona el repositorio y abre la carpeta.
2. Instala las dependencias de desarrollo de Node.js:
   ```bash
   npm install
   ```
3. Ejecuta los comandos de desarrollo locales:
   - `npm run dev` — Servidor de desarrollo local con Vite.
   - `npm run test` — Ejecución de las pruebas unitarias con Vitest.
   - `npm run lint` — Inspección de calidad del código con ESLint.
   - `npm run format` — Formateo automático de archivos con Prettier.
   - `npm run build` — Compilación de producción en la carpeta `dist/`.

### 2. Despliegue en la Nube (Vercel + Supabase)

#### Paso A: Inicializar base de datos en Supabase
1. Crea un proyecto en [Supabase](https://supabase.com/).
2. Ejecuta el archivo SQL de inicialización [supabase_fianza_historial.sql](file:///c:/Users/pubes/Desktop/Proyectos/CommonPay-main/supabase_fianza_historial.sql) en el SQL Editor de Supabase para estructurar las tablas y activar Row Level Security (RLS).
3. Añade un usuario en **Auth -> Users** de Supabase para Pedro (Editor). Olga podrá leer sin iniciar sesión.

#### Paso B: Desplegar en Vercel
1. Conecta el repositorio de la aplicación en [Vercel](https://vercel.com/).
2. Agrega las variables de entorno en Vercel (Settings -> Environment Variables):
   - `SUPABASE_URL`: Endpoint de tu proyecto Supabase.
   - `SUPABASE_ANON_KEY`: Clave pública anónima de Supabase.
3. Despliega la aplicación. Vercel activará automáticamente el cron de keep-alive en `/api/ping` según [vercel.json](file:///c:/Users/pubes/Desktop/Proyectos/CommonPay-main/vercel.json).

---

## 📊 Lógica Financiera y Redondeo Centesimal

Para evitar las imprecisiones aritméticas características del punto flotante en JavaScript (como por ejemplo que `716.81 - 462.00` resulte en `254.80999999999995`), toda la lógica implementada en [calculations.js](file:///c:/Users/pubes/Desktop/Proyectos/CommonPay-main/js/calculations.js) procesa los importes monetarios multiplicándolos primero por **100** para trabajar con números enteros (**céntimos de euro**). 

Los resultados finales se redondean al entero más cercano y se dividen de nuevo por **100** para retornar el valor exacto en euros:

$$\text{Importe exacto} = \frac{\text{Math.round}(\text{Importe flotante} \times 100)}{100}$$

### Fórmulas del Negocio:
* **Hipoteca Neta**: Cuota Hipoteca ($716,81 \text{ €}$) - Alquiler ($462,00 \text{ €}$) = $254,81 \text{ €}$. Aportación individual (50%) = $127,41 \text{ €}$.
* **Comunidad**: Comunidad ($39,38 \text{ €}$). Aportación individual (50%) = $19,69 \text{ €}$.
* **Gastos Extraordinarios**:
  * **IBI**: $306,63 \text{ €}$ repartido en 3 meses (Ene, Feb, Mar). Aportación individual mensual = $51,11 \text{ €}$.
  * **Seguro Hogar**: $108,20 \text{ €}$ cargado solo en Abril. Aportación individual mensual = $54,10 \text{ €}$.

---

## 🤖 Desarrollo AI-First (OpenCode & SDD)

Este repositorio está diseñado bajo el paradigma **AI-First**, permitiendo su evolución mediante agentes inteligentes autónomos.

- **Arnés de IA ([AGENTS.md](file:///c:/Users/pubes/Desktop/Proyectos/CommonPay-main/AGENTS.md)):** System prompt persistente con el stack, comandos y convenciones del código.
- **Estructura `.opencode/`:** Aloja las directrices de dominio (`skills/`) y automatización de comandos de agentes (`commands/` como `/verify`, `/bugfix`, `/feature`).
- **Spec-Driven Development (`spec/`):** La verdad del proyecto se define en especificaciones y planes de diseño antes de programar cualquier línea de código.
- **Persistencia de Memoria (`spec/memory/`):** Almacena el historial de sesiones y decisiones técnicas importantes (ADRs).

