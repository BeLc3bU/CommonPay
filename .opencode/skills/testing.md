# Skill: Testing & Quality Assurance - CommonPay

Esta habilidad detalla los procedimientos de control de calidad y pruebas automáticas del proyecto.

## Suite de Tests (Vitest)
- **Ejecución:** Las pruebas se ejecutan mediante `npm run test` (modo único) o `npm run test:watch` (modo interactivo).
- **Entorno JSDOM:** Todos los archivos de pruebas corren simulando el entorno de navegador (`jsdom`), por lo que objetos globales como `window`, `document` y `localStorage` están disponibles nativamente.
- **Ubicación:** Los archivos de pruebas deben situarse en la misma carpeta que el código bajo prueba y llevar la extensión `.test.js` o `.spec.js`.

## Directrices de Cobertura y Regresión
- **Lógica Financiera:** Todo cambio en `js/calculations.js` debe contar con cobertura de pruebas. El motor financiero en centavos y las regularizaciones por IPC/IRAV deben testearse exhaustivamente.
- **Validación:** Antes de entregar cualquier funcionalidad o corrección, la suite completa de pruebas debe pasar con éxito (0 fallos).
- **Simulaciones (Mocks):** Para probar lógica que consume recursos externos (como Supabase o endpoints API), realiza mocks de `fetch` o de la librería del cliente de Supabase para aislar el testeo.
