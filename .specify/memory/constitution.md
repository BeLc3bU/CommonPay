# 📜 Constitución del Proyecto: CommonPay (GitHub Spec Kit)

Este documento constituye la norma suprema, marco arquitectónico e invariantes inviolables para el desarrollo y mantenimiento de **CommonPay** bajo la metodología **Spec-Driven Development (SDD)** de GitHub Spec Kit.

---

## 1. Misión y Propósito
**CommonPay** es una aplicación PWA responsiva e interactiva diseñada para la conciliación, cálculo y liquidación de los gastos compartidos del hogar y el fondo de fianza entre Olga y Pedro.

### Componentes Clave:
1. **Dashboard Mensual:** Panel interactivo para seleccionar el mes en curso y computar de manera automática el balance mensual de transferencias.
2. **Previsión Anual:** Tabla e informe interactivo para simular y consultar los desgloses y totales del año completo (12 meses) por persona.
3. **Módulo de Liquidación del Día 15:** Sistema de conciliación bancaria para comparar el saldo real de la cuenta común con el acumulado de fianza y calcular sobrantes o déficits.
4. **Fondo de Fianza:** Sistema de ahorro conjunto interactivo con límite estricto de 450,00 €.
5. **Configuración Dinámica:** Panel editable para configurar importes fijos y extraordinarios (IBI, Seguro) sin tocar código.

### Roles y Perfiles de Usuario:
- **Pedro (Editor / Administrador):** Privilegios de escritura autenticada en Supabase para registrar históricos, fianza y liquidaciones.
- **Olga (Invitada / Solo Lectura):** Privilegios de solo lectura nativos, para consultar desgloses, previsiones anuales e históricos.

### Qué NO es:
- **No es una pasarela de pago:** No ejecuta transferencias bancarias reales ni se conecta a APIs de cobro (Stripe, etc.). Es exclusivamente un libro de registro y conciliación financiera.
- **No es multitenant:** Está diseñada y acotada específicamente para las reglas del hogar de Olga y Pedro.

---

## 2. Stack Tecnológico y Arquitectura
- **Lenguaje:** JavaScript estándar (ES6, Vanilla JS).
- **Framework de Cliente:** Ninguno (Vanilla JS plano en el navegador).
- **Servidor y Funciones Backend:** Node.js 20+ en Serverless Functions de Vercel (`api/config.js`, `api/ping.js`).
- **Base de Datos y Auth:** Supabase (PostgreSQL) con políticas de Row Level Security (RLS) estrictas y autenticación vía email/contraseña.
- **Persistencia Híbrida:** Supabase como fuente primaria en la nube con fallback inmediato, silencioso y transparente en `LocalStorage`.
- **Testing:** Vitest con entorno `jsdom`.
- **Servidor Local / Build:** Vite.
- **Linter & Formateador:** ESLint y Prettier.
- **Librerías de Cliente (CDNs en `index.html`):** Chart.js (v4), SheetJS (xlsx), html2pdf.js, Lucide Icons.

---

## 3. Invariantes y Reglas No Negociables

### A. Aritmética Financiera Centesimal (Obligatorio)
- **Prohibición de números flotantes directos:** Las sumas, restas y repartos monetarios en JavaScript con números decimales provocan errores de coma flotante.
- **Regla:** Todos los importes en euros se multiplican por `100` para operar con céntimos enteros, se redondean con `Math.round()`, y se dividen de nuevo entre `100` antes de devolver el resultado.
  ```javascript
  const toCentavos = (val) => Math.round((val || 0) * 100);
  const toEuros = (cents) => cents / 100;
  ```
- Toda función de cálculo matemático de negocio **debe** residir en `js/calculations.js`.

### B. Resiliencia y Fallback Offline
- La aplicación debe ser capaz de abrirse y funcionar plenamente en modo local (`LocalStorage`) incluso si Supabase falla o no hay conexión de red.
- En llamadas de red a Supabase, usar siempre bloques `try-catch` con degradación elegante a `LocalStorage`.

### C. Seguridad y RLS
- Las variables de entorno y claves maestras nunca se exponen en el cliente. Se consumen mediante el endpoint seguro `/api/config`.
- Las tablas en Supabase tienen políticas RLS: lectura pública anónima y escritura reservada al usuario autenticado (Pedro).

### D. Experiencia de Usuario y Diseño
- Mantener la estética **Glassmorphism** (translucidez, `backdrop-filter`, bordes sutiles con opacidad) y el soporte dual para **Modo Claro / Modo Oscuro**.
- Interfaz completamente responsiva para smartphones y pantallas de escritorio.

---

## 4. Ciclo de Trabajo Spec Kit (Spec-Driven Development)
Todo cambio funcional o técnico sigue el flujo canónico de GitHub Spec Kit:
1. **`/speckit.constitution`** — Consulta o actualización de los principios rectores.
2. **`/speckit.specify`** — Creación de la especificación funcional en `specs/NNN-nombre/spec.md`.
3. **`/speckit.clarify`** — Aclaración interactiva de dudas, ambigüedades o casos límite.
4. **`/speckit.plan`** — Elaboración del diseño técnico y blueprint en `specs/NNN-nombre/plan.md`.
5. **`/speckit.checklist`** — Creación de puertas de calidad y checklist en `specs/NNN-nombre/checklist.md`.
6. **`/speckit.tasks`** — Desglose en tareas atómicas y dependencias en `specs/NNN-nombre/tasks.md`.
7. **`/speckit.implement`** — Ejecución paso a paso de las tareas.
8. **`/speckit.converge`** — Validación completa y cierre de calidad (tests, linter, build y documentación).

---

## 5. Puerta de Calidad Obligatoria (Convergence Gate)
Ninguna tarea o spec se da por finalizada sin superar:
1. `npm run lint` (0 errores).
2. `npm run test` (100% pruebas unitarias pasando).
3. `npm run build` (Compilación limpia con Vite).
