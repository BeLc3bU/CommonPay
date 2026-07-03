# 🤖 AGENTS.md - Arnés de Desarrollo de IA para CommonPay

Este documento actúa como la guía técnica de referencia, system prompt persistente y marco normativo para cualquier agente inteligente que desarrolle, depure o mantenga el proyecto **CommonPay**.

---

## 🪙 Descripción del Proyecto
**CommonPay** es una aplicación PWA para la gestión de finanzas domésticas y fondo de fianza compartido entre Olga y Pedro. Permite calcular de forma automática la transferencia mensual basada en el mes en curso, gestionar la liquidación de la cuenta el día 15, prever gastos anuales y generar alertas de actualización contractual por IPC o IRAV. 

Posee persistencia híbrida en local (`LocalStorage`) y nube (`Supabase`), con control de accesos estricto (Pedro Editor, Olga Solo Lectura).

---

## 🛠️ Stack Tecnológico
- **Lenguaje:** JavaScript estándar (ES6, Vanilla JS).
- **Framework / Runtime:** Ninguno en el cliente (Vanilla JS plano). Node.js 20+ para entorno de desarrollo y funciones backend.
- **Base de Datos:** Supabase (PostgreSQL) con políticas de Row Level Security (RLS).
- **ORM / Cliente de DB:** `@supabase/supabase-js` (REST y suscripciones).
- **Autenticación:** Supabase Auth (correo y contraseña).
- **Testing:** Vitest para pruebas unitarias.
- **Build / Servidor local:** Vite (para desarrollo, tests y empaquetamiento).
- **Lint / Formateador:** ESLint y Prettier.
- **Despliegue:** Vercel (funciones Serverless Node.js).
- **Librerías de Cliente (CDNs en `index.html`):** Chart.js (v4), SheetJS (xlsx), html2pdf.js, Lucide Icons.

---

## 💻 Comandos del Proyecto
- `npm run dev` — Inicia el entorno local de desarrollo con Vite.
- `npm run test` — Corre las pruebas unitarias usando Vitest.
- `npm run test:watch` — Corre las pruebas en modo observador.
- `npm run lint` — Ejecuta ESLint para analizar errores de código y estilo.
- `npm run format` — Formatea el código con Prettier.
- `npm run build` — Compila y empaqueta la aplicación en la carpeta `dist/`.

---

## 📂 Arquitectura del Proyecto
```
CommonPay-main/
├── .opencode/           # Arnés de agentes y configuraciones avanzadas
│   ├── skills/          # Habilidades específicas del dominio
│   └── commands/        # Comandos personalizados (/feature, /verify...)
├── api/                 # Endpoints Serverless (Vercel Node.js Functions)
│   ├── config.js        # Distribuidor seguro de claves de Supabase
│   └── ping.js          # Mantenimiento y keep-alive de base de datos
├── css/                 # Hojas de estilo
│   └── style.css        # Diseño UI (Glassmorphism, temas)
├── doc/                 # Documentación histórica del curso y templates
├── js/                  # Lógica de la aplicación
│   ├── app.js           # Orquestador del DOM y flujo de UI
│   ├── calculations.js  # Motor financiero (operaciones centesimales)
│   └── storage.js       # Capa de persistencia (Supabase / LocalStorage)
├── spec/                # Espec. y Planes (Spec-Driven Development)
│   ├── constitution/    # Constitución estable del proyecto
│   ├── features/        # Carpetas de features individuales (spec + plan + tasks)
│   └── memory/          # Memoria persistente de sesiones y decisiones
├── index.html           # Interfaz de usuario PWA y enlaces CDN
├── sw.js                # Service Worker para funcionamiento offline
├── manifest.json        # Archivo de configuración de la PWA
└── vercel.json          # Configuración de enrutamiento y crons de Vercel
```

---

## 📏 Convenciones del Código

### 1. Naming
- **Variables y Funciones:** `camelCase` en JavaScript.
- **Clases y Componentes:** `PascalCase` si los hubiera.
- **Base de Datos / SQL:** `snake_case` para tablas, columnas y funciones de Supabase.
- **Archivos:** `kebab-case` para assets y especificaciones; `camelCase` para scripts de JS si se integran como librerías (ej: `calculations.js`).

### 2. Estructura y Organización
- Toda lógica matemática y de cálculo de negocio **debe** residir en `js/calculations.js`.
- La interacción con bases de datos o `LocalStorage` **debe** canalizarse en `js/storage.js`.
- El manejo directo del DOM y eventos de usuario resides en `js/app.js`.

### 3. Aritmética Financiera (Obligatorio)
- **Nunca** operes con números flotantes directamente para sumas/restas de euros.
- **Siempre** multiplica los importes por `100` para trabajar con céntimos en enteros, realiza la operación, aplica `Math.round` al total y divide de nuevo entre `100` para retornar el resultado.
  ```javascript
  const toCentavos = (val) => Math.round((val || 0) * 100);
  const toEuros = (cents) => cents / 100;
  ```

### 4. Manejo de Errores e Indicadores
- En llamadas de Supabase, maneja siempre bloques `try-catch` y haz fallback inmediato y silencioso a `LocalStorage`.
- Muestra mensajes de error claros en español en el DOM para el usuario en caso de fallos de red.

### 5. Logging y Seguridad
- Evita el uso de `console.log` en producción. Usa `console.warn` o `console.error` exclusivamente para fallos de base de datos.
- **Nunca** almacenes claves, contraseñas o datos de conexión a Supabase en el código cliente. Deben consumirse del endpoint seguro `/api/config`.

### 6. Pruebas Unitarias
- Los tests para la lógica de cálculo deben residir en archivos `*.test.js` o `*.spec.js` contiguos al archivo bajo prueba (ej: `js/calculations.test.js`).

---

## 🚫 Restricciones y Prohibiciones
- **No instales dependencias** npm no autorizadas de forma explícita.
- **No expongas claves de Supabase** en archivos del repositorio; usa `.env.local` exclusivamente.
- **No alteres el diseño CSS** de Glassmorphism ni quites soporte para el Modo Oscuro/Claro nativo.
- **No modifiques `js/calculations.js`** sin ejecutar antes y después las pruebas unitarias con `npm run test`.
- **No rompas la compatibilidad LocalStorage**. Si Supabase falla, la app debe seguir operando en local sin errores de script.

---

## 🔄 Flujo de Trabajo
1. **Planificación (Plan Mode):** Antes de cualquier tarea de desarrollo no trivial, escribe o actualiza el archivo de especificación en `spec/features/` y espera la aprobación del usuario.
2. **Desglose de Tareas:** Crea un checklist detallado en `tasks.md` de la feature antes de programar.
3. **Iteración Autónoma (Loop Engineering):** Implementa los cambios y valida inmediatamente mediante el linter, los tests y la compilación.
4. **Verificación:** Todo cambio debe estar documentado en `walkthrough.md` antes de entregarse.
5. **Comandos de OpenCode:** Utiliza siempre los flujos de comandos `/feature`, `/bugfix`, `/verify`, `/review` definidos en `.opencode/commands/`.

---

## 🏆 Ciclo de Validación Obligatorio
Antes de dar cualquier tarea por finalizada, el agente **debe** validar satisfactoriamente:
1. `npm run lint` — Sin errores ni advertencias de estilo.
2. `npm run test` — 100% de los tests unitarios pasados.
3. `npm run build` — Proceso de compilación/empaquetado sin errores de empaquetado.
