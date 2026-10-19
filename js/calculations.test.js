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
    expect(CalculationsModule.calcularSuperavit).toBeTypeOf('function');
    expect(CalculationsModule.calcularDineroEsperadoCuenta).toBeTypeOf('function');
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
      expect(resultado.ingresoAlquiler).toBe(462.0);

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
      expect(resultadoNoviembre.ingresoAlquiler).toBe(508.2);
      // Individual = round(208.61 / 2) = 104.31
      expect(resultadoNoviembre.resumenComun.hipotecaNetaIndividual).toBe(104.31);
    });
  });

  describe('Función calcularSuperavit()', () => {
    it('debe calcular correctamente el superávit cuando el ingreso es superior a la cuota', () => {
      const { calcularSuperavit } = CalculationsModule;
      // Caso Olga: Ingreso habitual 550€, Cuota con IPC 538.21€ -> Superávit = +11.79€
      expect(calcularSuperavit(550.0, 538.21)).toBe(11.79);
      // Caso Mayo sin IPC: Ingreso 550€, Cuota 534.42€ -> Superávit = +15.58€
      expect(calcularSuperavit(550.0, 534.42)).toBe(15.58);
      // Caso con ingreso variable mayor: 600€ vs 434.43€ -> Superávit = +165.57€
      expect(calcularSuperavit(600.0, 434.43)).toBe(165.57);
    });

    it('debe devolver valor negativo o cero cuando no hay superávit con precisión centesimal', () => {
      const { calcularSuperavit } = CalculationsModule;
      expect(calcularSuperavit(550.0, 585.53)).toBe(-35.53);
      expect(calcularSuperavit(550.0, 550.0)).toBe(0);
      // Caso con ingreso variable menor (déficit): 400€ vs 434.43€ -> Déficit = -34.43€
      expect(calcularSuperavit(400.0, 434.43)).toBe(-34.43);
      // Caso con decimales irregulares: 523.47€ vs 538.21€ -> Déficit = -14.74€
      expect(calcularSuperavit(523.47, 538.21)).toBe(-14.74);
    });
  });

  describe('Función calcularDineroEsperadoCuenta()', () => {
    it('debe sumar exactamente la fianza repuesta y el superávit de Olga sin errores de flotante', () => {
      const { calcularDineroEsperadoCuenta } = CalculationsModule;
      // Ej: Fianza 450.00€ + Superávit Olga 115.57€ = 565.57€
      expect(calcularDineroEsperadoCuenta(450.0, 115.57)).toBe(565.57);
      // Ej: Fianza 180.00€ + Superávit Olga 62.75€ = 242.75€
      expect(calcularDineroEsperadoCuenta(180.0, 62.75)).toBe(242.75);
      // Ej: Fianza 0€ + Superávit Olga 115.57€ = 115.57€
      expect(calcularDineroEsperadoCuenta(0.0, 115.57)).toBe(115.57);
    });
  });

  describe('Exención de Fianza al 100% (450 €)', () => {
    const baseConfig = {
      gastosFijos: {
        cuotaHipoteca: 716.81,
        ingresoAlquiler: 462.0,
        comunidad: 39.38
      },
      gastosPersonales: {
        olga: { coche: 188.02, manutencion: 189.3 },
        pedro: {}
      },
      gastosExtraordinarios: [],
      fianza: {
        pointer: 'fianza',
        objetivo: 450.0,
        aportacionMensualPersona: 10.0,
        acumulado: 410.0,
        mesCompleto: 'auto'
      },
      alertas: {
        mesHipoteca: 9,
        mesManutencion: 5,
        mesAlquiler: 10,
        tasaManutencion: 2.0,
        tasaAlquiler: 2.0,
        cuotaHipotecaNueva: 716.81
      }
    };

    describe('Función calcularMesExencionFianza()', () => {
      it('debe determinar correctamente el primer mes de exención según el saldo acumulado', () => {
        const { calcularMesExencionFianza } = CalculationsModule;
        expect(calcularMesExencionFianza).toBeTypeOf('function');

        // Si ya está en 450 € o más, queda exento desde el primer mes (mes 0: Enero)
        expect(calcularMesExencionFianza(450.0, 450.0, 10.0)).toBe(0);
        expect(calcularMesExencionFianza(480.0, 450.0, 10.0)).toBe(0);

        // Si el acumulado es 410 € y se aportan 20 €/mes (10 € c/u):
        // Mes 0 (Ene): 410 + 20 = 430
        // Mes 1 (Feb): 430 + 20 = 450 (alcanza el 100%)
        // Mes 2 (Mar): exento (retorna 2)
        expect(calcularMesExencionFianza(410.0, 450.0, 10.0)).toBe(2);

        // Si el acumulado es 430 €:
        // Mes 0 (Ene): 430 + 20 = 450
        // Mes 1 (Feb): exento (retorna 1)
        expect(calcularMesExencionFianza(430.0, 450.0, 10.0)).toBe(1);

        // Si el acumulado es 0 €:
        // Necesita 22.5 meses -> no se exime en el año actual (retorna null o -1)
        expect(calcularMesExencionFianza(0.0, 450.0, 10.0)).toBeNull();
      });
    });

    describe('Integración con calcularDesgloseMes()', () => {
      it('debe incluir fianza si el saldo acumulado actual es inferior a 450 € (ej. 430 €) y eximirla al llegar a 450 €', () => {
        const { calcularDesgloseMes } = CalculationsModule;
        const configAuto = JSON.parse(JSON.stringify(baseConfig));
        configAuto.fianza.acumulado = 430.0;
        configAuto.fianza.mesCompleto = 'auto';

        // Con 430 € (aún no llega a 450 €), el mes actual debe incluir Fondo de Fianza (10 € c/u)
        const mesActual = calcularDesgloseMes(9, configAuto); // Octubre (index 9)
        const fianzaOlga = mesActual.desgloseOlga.conceptos.find((c) => c.tipo === 'fianza');
        const fianzaPedro = mesActual.desglosePedro.conceptos.find((c) => c.tipo === 'fianza');
        expect(fianzaOlga).toBeDefined();
        expect(fianzaOlga.valor).toBe(10.0);
        expect(fianzaPedro).toBeDefined();
        expect(fianzaPedro.valor).toBe(10.0);

        // Al alcanzar los 450 € (100%), queda exento
        configAuto.fianza.acumulado = 450.0;
        const mesExento = calcularDesgloseMes(9, configAuto);
        expect(mesExento.desgloseOlga.conceptos.some((c) => c.tipo === 'fianza')).toBe(false);
        expect(mesExento.desglosePedro.conceptos.some((c) => c.tipo === 'fianza')).toBe(false);
        expect(mesActual.desgloseOlga.total - mesExento.desgloseOlga.total).toBe(10.0);
        expect(mesActual.desglosePedro.total - mesExento.desglosePedro.total).toBe(10.0);
      });

      it('debe eximir todos los meses si el saldo acumulado actual ya es >= objetivo', () => {
        const { calcularDesgloseMes } = CalculationsModule;
        const configLleno = JSON.parse(JSON.stringify(baseConfig));
        configLleno.fianza.acumulado = 450.0;

        for (let m = 0; m < 12; m++) {
          const desg = calcularDesgloseMes(m, configLleno);
          expect(desg.desgloseOlga.conceptos.some((c) => c.tipo === 'fianza')).toBe(false);
          expect(desg.desglosePedro.conceptos.some((c) => c.tipo === 'fianza')).toBe(false);
        }
      });

      it('debe respetar el mesCompleto fijado manualmente en configuración', () => {
        const { calcularDesgloseMes } = CalculationsModule;
        const configManual = JSON.parse(JSON.stringify(baseConfig));
        configManual.fianza.mesCompleto = 4; // Mayo (mes 4) en adelante exento

        // Mes 3 (Abril) -> paga fianza
        const mes3 = calcularDesgloseMes(3, configManual);
        expect(mes3.desgloseOlga.conceptos.some((c) => c.tipo === 'fianza')).toBe(true);

        // Mes 4 (Mayo) -> exento
        const mes4 = calcularDesgloseMes(4, configManual);
        expect(mes4.desgloseOlga.conceptos.some((c) => c.tipo === 'fianza')).toBe(false);

        // Mes 5 (Junio) -> exento
        const mes5 = calcularDesgloseMes(5, configManual);
        expect(mes5.desgloseOlga.conceptos.some((c) => c.tipo === 'fianza')).toBe(false);
      });

      it('no debe eximir fianza en ningún mes si mesCompleto es "nunca"', () => {
        const { calcularDesgloseMes } = CalculationsModule;
        const configNunca = JSON.parse(JSON.stringify(baseConfig));
        configNunca.fianza.mesCompleto = 'nunca';

        const mes0 = calcularDesgloseMes(0, configNunca);
        const mes11 = calcularDesgloseMes(11, configNunca);
        expect(mes0.desgloseOlga.conceptos.some((c) => c.tipo === 'fianza')).toBe(true);
        expect(mes11.desgloseOlga.conceptos.some((c) => c.tipo === 'fianza')).toBe(true);
      });
    });
  });
});

