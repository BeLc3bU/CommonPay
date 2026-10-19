/**
 * Módulo de Cálculos Financieros para CommonPay
 */

/**
 * Redondea de manera segura un número a 2 decimales para evitar problemas de precisión de punto flotante.
 */
function round(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Determina el primer mes (0: Enero, 11: Diciembre) a partir del cual el Fondo de Fianza está completo (100%)
 * y por tanto exento de aportar.
 * @param {number} acumulado - Saldo acumulado al inicio del año (o actual)
 * @param {number} objetivo - Importe objetivo (ej. 450.00)
 * @param {number} aportacionPersona - Aportación mensual por persona (ej. 10.00)
 * @returns {number|null} Índice del primer mes exento (0..11) o null si no se alcanza en los 12 meses.
 */
function calcularMesExencionFianza(acumulado, objetivo, aportacionPersona) {
  const toCentavos = (val) => Math.round((val || 0) * 100);
  const objetivoCents = toCentavos(objetivo !== undefined ? objetivo : 450.0);
  let saldoCents = toCentavos(acumulado !== undefined ? acumulado : 410.0);
  const aporteMensualTotalCents =
    toCentavos(aportacionPersona !== undefined ? aportacionPersona : 10.0) * 2;

  if (saldoCents >= objetivoCents) {
    return 0; // Exento desde Enero
  }

  if (aporteMensualTotalCents <= 0) {
    return null;
  }

  for (let m = 0; m < 12; m++) {
    saldoCents += aporteMensualTotalCents;
    if (saldoCents >= objetivoCents) {
      return m + 1 < 12 ? m + 1 : null;
    }
  }

  return null;
}

/**
 * Calcula el desglose detallado de los gastos comunes, personales y extraordinarios para un mes dado.
 * @param {number} mesIndex - Índice del mes (0: Enero, 11: Diciembre)
 * @param {Object} config - Configuración de gastos
 * @returns {Object} Desglose financiero del mes
 */
function calcularDesgloseMes(mesIndex, config) {
  const { gastosFijos, gastosPersonales, gastosExtraordinarios, fianza } = config;

  // Funciones de utilidad internas para cálculos en céntimos
  const toCentavos = (val) => Math.round((val || 0) * 100);
  const toEuros = (cents) => cents / 100;

  // Cargar configuración de alertas y regularizaciones
  const alertas = config.alertas || {
    mesHipoteca: 9,
    mesManutencion: 5,
    mesAlquiler: 10,
    tasaManutencion: 2.0,
    tasaAlquiler: 2.0,
    cuotaHipotecaNueva: 777.37
  };

  // 1. Gastos Fijos (con regularizaciones dinámicas según el mes)
  const cuotaHipotecaBase =
    mesIndex >= parseInt(alertas.mesHipoteca)
      ? alertas.cuotaHipotecaNueva !== undefined
        ? alertas.cuotaHipotecaNueva
        : gastosFijos.cuotaHipoteca
      : gastosFijos.cuotaHipoteca;

  let ingresoAlquilerBase = gastosFijos.ingresoAlquiler || 0;
  if (mesIndex >= parseInt(alertas.mesAlquiler)) {
    const tasaAlq = alertas.tasaAlquiler !== undefined ? parseFloat(alertas.tasaAlquiler) : 2.0;
    ingresoAlquilerBase = ingresoAlquilerBase * (1 + tasaAlq / 100);
  }

  const cuotaHipotecaCents = toCentavos(cuotaHipotecaBase);
  const ingresoAlquilerCents = toCentavos(ingresoAlquilerBase);
  const comunidadCents = toCentavos(gastosFijos.comunidad);

  const hipotecaNetaCents = cuotaHipotecaCents - ingresoAlquilerCents;
  const hipotecaNetaIndividualCents = Math.round(hipotecaNetaCents / 2);
  const comunidadIndividualCents = Math.round(comunidadCents / 2);

  // 2. Ahorro Fianza (evaluar exención al 100%)
  let fianzaExenta = false;
  const fianzaConfig = fianza || {};
  const mesCompletoConfig = fianzaConfig.mesCompleto;

  if (
    mesCompletoConfig !== undefined &&
    mesCompletoConfig !== null &&
    mesCompletoConfig !== 'auto'
  ) {
    if (mesCompletoConfig === 'nunca' || mesCompletoConfig === -1) {
      fianzaExenta = false;
    } else {
      const mesNum = parseInt(mesCompletoConfig, 10);
      if (!isNaN(mesNum) && mesNum >= 0) {
        fianzaExenta = mesIndex >= mesNum;
      }
    }
  } else if (fianzaConfig.acumulado !== undefined) {
    // Modo automático: exento únicamente si el saldo acumulado actual ya alcanzó el objetivo (ej. 450 €)
    const fianzaAcumulada = fianzaConfig.acumulado;
    const fianzaObjetivo = fianzaConfig.objetivo !== undefined ? fianzaConfig.objetivo : 450.0;
    fianzaExenta = fianzaAcumulada >= fianzaObjetivo;
  }

  const fianzaIndividualCents = fianzaExenta ? 0 : toCentavos(fianzaConfig.aportacionMensualPersona);

  // 3. Gastos Extraordinarios aplicables a este mes
  const extraordinariosOlga = [];
  const extraordinariosPedro = [];

  if (Array.isArray(gastosExtraordinarios)) {
    gastosExtraordinarios.forEach((ext) => {
      if (ext.meses.includes(mesIndex)) {
        const numMeses = ext.meses.length;
        const importeTotalCents = toCentavos(ext.importeTotal);

        // Se reparte el importe extraordinario en los meses correspondientes y luego a la mitad por persona
        const importeMensualTotalCents = Math.round(importeTotalCents / numMeses);
        const cuotaIndividualCents = Math.round(importeMensualTotalCents / 2);

        extraordinariosOlga.push({
          nombre: ext.nombre,
          valor: toEuros(cuotaIndividualCents)
        });
        extraordinariosPedro.push({
          nombre: ext.nombre,
          valor: toEuros(cuotaIndividualCents)
        });
      }
    });
  }

  // 4. Gastos Personales (con regularización por IPC para la manutención)
  const cocheOlgaCents = toCentavos(gastosPersonales.olga.coche);

  let manutencionOlgaBase = gastosPersonales.olga.manutencion || 0;
  if (mesIndex >= parseInt(alertas.mesManutencion)) {
    const tasaIPC =
      alertas.tasaManutencion !== undefined ? parseFloat(alertas.tasaManutencion) : 2.0;
    manutencionOlgaBase = manutencionOlgaBase * (1 + tasaIPC / 100);
  }
  const manutencionOlgaCents = toCentavos(manutencionOlgaBase);

  // 5. Construcción del Desglose de Olga
  const conceptosOlga = [
    { nombre: 'Hipoteca Neta (50%)', valor: toEuros(hipotecaNetaIndividualCents), tipo: 'comun' },
    { nombre: 'Comunidad (50%)', valor: toEuros(comunidadIndividualCents), tipo: 'comun' },
    { nombre: 'Gastos Coche', valor: toEuros(cocheOlgaCents), tipo: 'personal' },
    { nombre: 'Manutención', valor: toEuros(manutencionOlgaCents), tipo: 'personal' }
  ];

  if (!fianzaExenta) {
    conceptosOlga.push({
      nombre: 'Fondo de Fianza',
      valor: toEuros(fianzaIndividualCents),
      tipo: 'fianza'
    });
  }

  // Añadir extraordinarios de Olga
  extraordinariosOlga.forEach((ext) => {
    conceptosOlga.push({ nombre: ext.nombre, valor: ext.valor, tipo: 'extraordinario' });
  });

  // Calcular total de Olga sumando en céntimos
  const totalOlgaCents = conceptosOlga.reduce((sum, item) => sum + toCentavos(item.valor), 0);

  // 6. Construcción del Desglose de Pedro
  const conceptosPedro = [
    { nombre: 'Hipoteca Neta (50%)', valor: toEuros(hipotecaNetaIndividualCents), tipo: 'comun' },
    { nombre: 'Comunidad (50%)', valor: toEuros(comunidadIndividualCents), tipo: 'comun' }
  ];

  if (!fianzaExenta) {
    conceptosPedro.push({
      nombre: 'Fondo de Fianza',
      valor: toEuros(fianzaIndividualCents),
      tipo: 'fianza'
    });
  }

  // Añadir extraordinarios de Pedro
  extraordinariosPedro.forEach((ext) => {
    conceptosPedro.push({ nombre: ext.nombre, valor: ext.valor, tipo: 'extraordinario' });
  });

  // Agregar cualquier gasto personal de Pedro si existiera en la configuración
  const personalPedroKeys = Object.keys(gastosPersonales.pedro || {});
  personalPedroKeys.forEach((key) => {
    const valor = gastosPersonales.pedro[key] || 0;
    if (valor > 0) {
      conceptosPedro.push({
        nombre: key.charAt(0).toUpperCase() + key.slice(1),
        valor: valor,
        tipo: 'personal'
      });
    }
  });

  // Calcular total de Pedro sumando en céntimos
  const totalPedroCents = conceptosPedro.reduce((sum, item) => sum + toCentavos(item.valor), 0);

  return {
    hipotecaNeta: toEuros(hipotecaNetaCents),
    cuotaHipotecaBase: toEuros(cuotaHipotecaCents),
    ingresoAlquiler: toEuros(ingresoAlquilerCents),
    fianzaExenta: fianzaExenta,
    desgloseOlga: {
      conceptos: conceptosOlga,
      total: toEuros(totalOlgaCents)
    },
    desglosePedro: {
      conceptos: conceptosPedro,
      total: toEuros(totalPedroCents)
    },
    resumenComun: {
      hipotecaNetaIndividual: toEuros(hipotecaNetaIndividualCents),
      comunidadIndividual: toEuros(comunidadIndividualCents)
    }
  };
}

/**
 * Calcula la diferencia o superávit entre un ingreso real y una cuota calculada.
 * @param {number} ingreso - Importe efectivamente ingresado
 * @param {number} cuota - Cuota calculada correspondiente
 * @returns {number} Diferencia en euros redondeada a 2 decimales
 */
function calcularSuperavit(ingreso, cuota) {
  const toCentavos = (val) => Math.round((val || 0) * 100);
  const toEuros = (cents) => cents / 100;
  const difCents = toCentavos(ingreso) - toCentavos(cuota);
  return toEuros(difCents);
}

/**
 * Calcula el saldo total que debería haber en la cuenta común (Fianza repuesta + Superávit de Olga).
 * @param {number} fianza - Fianza repuesta/acumulada
 * @param {number} superavit - Superávit acumulado de Olga
 * @returns {number} Saldo total esperado redondeado a 2 decimales
 */
function calcularDineroEsperadoCuenta(fianza, superavit) {
  const toCentavos = (val) => Math.round((val || 0) * 100);
  const toEuros = (cents) => cents / 100;
  return toEuros(toCentavos(fianza) + toCentavos(superavit));
}

// Exportamos en el objeto window
window.CalculationsModule = {
  round,
  calcularMesExencionFianza,
  calcularDesgloseMes,
  calcularSuperavit,
  calcularDineroEsperadoCuenta
};
