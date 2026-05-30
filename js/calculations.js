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
    mesHipoteca: 8,
    mesManutencion: 5,
    mesAlquiler: 10,
    tasaManutencion: 2.0,
    tasaAlquiler: 2.0,
    cuotaHipotecaNueva: gastosFijos.cuotaHipoteca
  };

  // 1. Gastos Fijos (con regularizaciones dinámicas según el mes)
  const cuotaHipotecaBase = (mesIndex >= parseInt(alertas.mesHipoteca))
    ? (alertas.cuotaHipotecaNueva !== undefined ? alertas.cuotaHipotecaNueva : gastosFijos.cuotaHipoteca)
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

  // 2. Ahorro Fianza
  const fianzaIndividualCents = toCentavos(fianza.aportacionMensualPersona);

  // 3. Gastos Extraordinarios aplicables a este mes
  const extraordinariosOlga = [];
  const extraordinariosPedro = [];

  if (Array.isArray(gastosExtraordinarios)) {
    gastosExtraordinarios.forEach(ext => {
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
    const tasaIPC = alertas.tasaManutencion !== undefined ? parseFloat(alertas.tasaManutencion) : 2.0;
    manutencionOlgaBase = manutencionOlgaBase * (1 + tasaIPC / 100);
  }
  const manutencionOlgaCents = toCentavos(manutencionOlgaBase);

  // 5. Construcción del Desglose de Olga
  const conceptosOlga = [
    { nombre: 'Hipoteca Neta (50%)', valor: toEuros(hipotecaNetaIndividualCents), tipo: 'comun' },
    { nombre: 'Comunidad (50%)', valor: toEuros(comunidadIndividualCents), tipo: 'comun' },
    { nombre: 'Gastos Coche', valor: toEuros(cocheOlgaCents), tipo: 'personal' },
    { nombre: 'Manutención', valor: toEuros(manutencionOlgaCents), tipo: 'personal' },
    { nombre: 'Fondo de Fianza', valor: toEuros(fianzaIndividualCents), tipo: 'fianza' }
  ];

  // Añadir extraordinarios de Olga
  extraordinariosOlga.forEach(ext => {
    conceptosOlga.push({ nombre: ext.nombre, valor: ext.valor, tipo: 'extraordinario' });
  });

  // Calcular total de Olga sumando en céntimos
  const totalOlgaCents = conceptosOlga.reduce((sum, item) => sum + toCentavos(item.valor), 0);

  // 6. Construcción del Desglose de Pedro
  const conceptosPedro = [
    { nombre: 'Hipoteca Neta (50%)', valor: toEuros(hipotecaNetaIndividualCents), tipo: 'comun' },
    { nombre: 'Comunidad (50%)', valor: toEuros(comunidadIndividualCents), tipo: 'comun' },
    { nombre: 'Fondo de Fianza', valor: toEuros(fianzaIndividualCents), tipo: 'fianza' }
  ];

  // Añadir extraordinarios de Pedro
  extraordinariosPedro.forEach(ext => {
    conceptosPedro.push({ nombre: ext.nombre, valor: ext.valor, tipo: 'extraordinario' });
  });

  // Agregar cualquier gasto personal de Pedro si existiera en la configuración
  const personalPedroKeys = Object.keys(gastosPersonales.pedro || {});
  personalPedroKeys.forEach(key => {
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

// Exportamos en el objeto window
window.CalculationsModule = {
  round,
  calcularDesgloseMes
};
