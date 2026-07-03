import { describe, it, expect, beforeAll } from 'vitest';

// Ejecutar el script calculations.js en el entorno jsdom
// Esto inyectará window.CalculationsModule
import './calculations.js';

describe('Cálculos Financieros (calculations.js)', () => {
  let CalculationsModule;

  beforeAll(() => {
    CalculationsModule = window.CalculationsModule;
  });

  it('debe estar cargado correctamente en el objeto window', () => {
    expect(CalculationsModule).toBeDefined();
    expect(CalculationsModule.round).toBeTypeOf('function');
    expect(CalculationsModule.calcularDesgloseMes).toBeTypeOf('function');
  });

  describe('Función round()', () => {
    it('debe redondear valores con punto flotante de forma segura', () => {
      const { round } = CalculationsModule;
      // Casos típicos de imprecisión en JS
      expect(0.1 + 0.2).not.toBe(0.3); // JS normal falla aquí
      expect(round(0.1 + 0.2)).toBe(0.3); // Nuestro round pasa

      expect(round(716.81 - 462.0)).toBe(254.81);
      expect(round(1.005)).toBe(1.01);
      expect(round(1.004)).toBe(1.0);
    });
  });

  describe('Función calcularDesgloseMes()', () => {
    const mockConfig = {
      gastosFijos: {
        cuotaHipoteca: 716.81,
        ingresoAlquiler: 462.0,
        comunidad: 39.38
      },
      gastosPersonales: {
        olga: {
          coche: 188.02,
          manutencion: 189.3
        },
        pedro: {}
      },
      gastosExtraordinarios: [
        {
          id: 'ibi',
          nombre: 'IBI',
          importeTotal: 306.63,
          meses: [0, 1, 2] // Ene, Feb, Mar
        },
        {
          id: 'seguro_hogar',
          nombre: 'Seguro Hogar',
          importeTotal: 108.2,
          meses: [3] // Abr
        }
      ],
      fianza: {
        pointer: 'fianza',
        objetivo: 450.0,
        aportacionMensualPersona: 10.0
      },
      alertas: {
        mesHipoteca: 8, // Septiembre
        mesManutencion: 5, // Junio
        mesAlquiler: 10, // Noviembre
        tasaManutencion: 2.0, // 2% IPC
        tasaAlquiler: 2.0, // 2% IRAV
        cuotaHipotecaNueva: 716.81
      }
    };

    it('debe calcular correctamente los desgloses en un mes sin gastos extraordinarios (ej. Mayo, index 4)', () => {
      const { calcularDesgloseMes } = CalculationsModule;
      const resultado = calcularDesgloseMes(4, mockConfig); // Mayo

      // Hipoteca Neta = 716.81 - 462.00 = 254.81
      expect(resultado.hipotecaNeta).toBe(254.81);

      // Resumen Comunes Individuales
      // Hipoteca Neta Individual = round(254.81 / 2) = 127.41 (en centavos: round(25481 / 2) = 12741)
      expect(resultado.resumenComun.hipotecaNetaIndividual).toBe(127.41);
      // Comunidad Individual = round(39.38 / 2) = 19.69 (en centavos: round(3938 / 2) = 1969)
      expect(resultado.resumenComun.comunidadIndividual).toBe(19.69);

      // Desglose Olga
      // Conceptos: Hipoteca Neta (127.41), Comunidad (19.69), Coche (188.02), Manutención (189.30), Fianza (10.00)
      // Total Olga = 127.41 + 19.69 + 188.02 + 189.30 + 10.00 = 534.42
      expect(resultado.desgloseOlga.total).toBe(534.42);

      // Desglose Pedro
      // Conceptos: Hipoteca Neta (127.41), Comunidad (19.69), Fianza (10.00)
      // Total Pedro = 127.41 + 19.69 + 10.00 = 157.10
      expect(resultado.desglosePedro.total).toBe(157.1);
    });

    it('debe incluir gastos extraordinarios cuando correspondan (ej. Enero, index 0)', () => {
      const { calcularDesgloseMes } = CalculationsModule;
      const resultado = calcularDesgloseMes(0, mockConfig); // Enero

      // IBI extraordinario: 306.63 total, repartido en 3 meses = 102.21 mensual total
      // Cuota individual IBI = round(102.21 / 2) = 51.11 (en centavos: round(10221 / 2) = 5111)
      const ibiOlga = resultado.desgloseOlga.conceptos.find((c) => c.nombre === 'IBI');
      expect(ibiOlga).toBeDefined();
      expect(ibiOlga.valor).toBe(51.11);

      // Total Olga debe incrementarse con el IBI (534.42 + 51.11 = 585.53)
      expect(resultado.desgloseOlga.total).toBe(585.53);
    });

    it('debe aplicar la regularización de la hipoteca en meses >= mesHipoteca (ej. Septiembre, index 8)', () => {
      const { calcularDesgloseMes } = CalculationsModule;

      const configModificada = JSON.parse(JSON.stringify(mockConfig));
      configModificada.alertas.cuotaHipotecaNueva = 800.0; // Sube la hipoteca en Septiembre
      configModificada.alertas.mesHipoteca = 8;

      const resultadoMayo = calcularDesgloseMes(4, configModificada); // Mayo (sin regularización)
      expect(resultadoMayo.hipotecaNeta).toBe(254.81);

      const resultadoSeptiembre = calcularDesgloseMes(8, configModificada); // Septiembre (con regularización)
      // Nueva Hipoteca Neta = 800.00 - 462.00 = 338.00
      expect(resultadoSeptiembre.hipotecaNeta).toBe(338.0);
      expect(resultadoSeptiembre.resumenComun.hipotecaNetaIndividual).toBe(169.0);
    });

    it('debe aplicar la regularización por IPC en la manutención de Olga en meses >= mesManutencion (ej. Junio, index 5)', () => {
      const { calcularDesgloseMes } = CalculationsModule;

      const configModificada = JSON.parse(JSON.stringify(mockConfig));
      configModificada.alertas.tasaManutencion = 5.0; // 5% de incremento
      configModificada.alertas.mesManutencion = 5; // Junio

      const resultadoMayo = calcularDesgloseMes(4, configModificada);
      const manutencionMayo = resultadoMayo.desgloseOlga.conceptos.find(
        (c) => c.nombre === 'Manutención'
      ).valor;
      expect(manutencionMayo).toBe(189.3); // Sin alterar

      const resultadoJunio = calcularDesgloseMes(5, configModificada);
      const manutencionJunio = resultadoJunio.desgloseOlga.conceptos.find(
        (c) => c.nombre === 'Manutención'
      ).valor;

      // Nueva Manutención = 189.30 * 1.05 = 198.765 -> round(198.77)
      expect(manutencionJunio).toBe(198.77);
    });

    it('debe aplicar la regularización por IRAV al alquiler en meses >= mesAlquiler (ej. Noviembre, index 10)', () => {
      const { calcularDesgloseMes } = CalculationsModule;

      const configModificada = JSON.parse(JSON.stringify(mockConfig));
      configModificada.alertas.tasaAlquiler = 10.0; // 10% de incremento al alquiler (462.00 * 1.10 = 508.20)
      configModificada.alertas.mesAlquiler = 10; // Noviembre

      const resultadoNoviembre = calcularDesgloseMes(10, configModificada);
      // Hipoteca = 716.81. Alquiler nuevo = 508.20. Hipoteca neta = 716.81 - 508.20 = 208.61.
      expect(resultadoNoviembre.hipotecaNeta).toBe(208.61);
      // Individual = round(208.61 / 2) = 104.31
      expect(resultadoNoviembre.resumenComun.hipotecaNetaIndividual).toBe(104.31);
    });
  });
});
