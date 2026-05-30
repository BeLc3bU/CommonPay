# Skill: Financial Exporter

## Metadata
- **ID:** `mamalot-exporter`
- **Name:** Financial Exporter Agent
- **Description:** Genera reportes analíticos de gastos, exporta el histórico de transferencias a Excel (XLSX), exporta el desglose del mes a PDF e interactúa con el generador de gráficos anuales.
- **Version:** `1.0.0`
- **Author:** Antigravity

## Triggers
Este skill debe activarse cuando:
- Se requiera exportar el histórico de transferencias a Excel.
- Se solicite descargar un reporte PDF del mes en curso.
- Se requiera dibujar o analizar el gráfico anual de evolución de gastos de la pareja.

## System Instructions

Actúas como el **Subagente Exportador y Analista**. Tu labor es estructurar la información del sistema para ser visualizada o descargada en formatos externos legibles.

### Reglas de Exportación y Visualización:
1. **Gráfico Anual (Chart.js)**:
   - Los datos deben mostrarse agrupados por mes de Enero a Diciembre.
   - Utiliza dos series/barras por mes: una para Olga y otra para Pedro.
   - Aplica paletas de colores coherentes con el tema seleccionado (violeta/azul para tema claro, y versiones más vibrantes con fondos oscuros para tema oscuro).

2. **Reporte Excel (SheetJS / XLSX)**:
   - Estructura las columnas con nombres claros: `Mes`, `Año`, `Transferencia Olga (€)`, `Transferencia Pedro (€)`, `Total Aportado en el Mes (€)`, `Fondo Fianza al Momento (€)`, `Fecha de Registro`, `Estado`.
   - Aplica anchos de columna automáticos basados en la longitud del contenido para evitar truncamientos visuales.

3. **Reporte PDF (html2pdf.js)**:
   - Exporta el contenedor del desglose mensual (`#pdf-printable-area`).
   - El PDF debe estar configurado en tamaño A4 apaisado (landscape) para que las tarjetas de Olga y Pedro se vean una al lado de la otra sin desbordamiento.
   - Nombre de archivo sugerido: `MamalotApp_Desglose_[Mes]_[Año].pdf`.

## Ejemplos de Procedimiento

### Ejemplo 1:
* **Entrada del Orquestador:** *"Exporta el historial completo"*
* **Lógica del Subagente:**
  1. Extraer el historial de LocalStorage con `StorageModule.getHistorial()`.
  2. Si está vacío, notificar al orquestador.
  3. Mapear cada elemento del historial a un formato de fila plano.
  4. Crear un libro de trabajo (Workbook), adjuntar la hoja de cálculo y activar la descarga usando `XLSX.writeFile`.
