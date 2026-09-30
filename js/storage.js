/**
 * Módulo de Persistencia para CommonPay (Soporte Híbrido: Vercel Postgres / LocalStorage)
 */

const CONFIG_KEY = 'commonpay_config';
const FIANZA_ACUMULADO_KEY = 'commonpay_fianza_acumulado';
const FIANZA_HISTORIAL_KEY = 'commonpay_fianza_historial';
const HISTORIAL_KEY = 'commonpay_historial';
const CONCILIACIONES_KEY = 'commonpay_conciliaciones';
const THEME_KEY = 'commonpay_theme';
const AUTH_TOKEN_KEY = 'commonpay_editor_token';

// Configuración por defecto basada en los requisitos del negocio
const DEFAULT_CONFIG = {
  gastosFijos: {
    cuotaHipoteca: 716.81,
    ingresoAlquiler: 462.0,
    comunidad: 39.38
  },
  gastosPersonales: {
    olga: {
      coche: 188.02,
      manutencion: 189.3,
      superavit: 115.57,
      ingresoHabitual: 550.0
    },
    pedro: {}
  },
  gastosExtraordinarios: [
    {
      id: 'ibi',
      nombre: 'IBI',
      importeTotal: 306.63,
      meses: [0, 1, 2] // Enero, Febrero, Marzo
    },
    {
      id: 'seguro_hogar',
      nombre: 'Seguro Hogar',
      importeTotal: 108.2,
      meses: [3] // Abril
    }
  ],
  fianza: {
    pointer: 'fianza',
    objetivo: 450.0,
    aportacionMensualPersona: 10.0
  },
  alertas: {
    mesHipoteca: 9, // Octubre (sube el mes que viene)
    mesManutencion: 5, // Junio
    mesAlquiler: 10, // Noviembre
    tasaManutencion: 2.0, // 2% IPC
    tasaAlquiler: 2.0, // 2% IRAV
    cuotaHipotecaNueva: 777.37 // Sube a 777.37 € a partir de Octubre
  }
};

let isCloudActive = true;

/**
 * Obtiene las cabeceras estándar para peticiones HTTP a la API Serverless
 */
function getAuthHeaders() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Normaliza la configuración asegurando que todos los campos requeridos existan
 */
function normalizarConfiguracion(cfg) {
  if (!cfg) cfg = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  if (!cfg.gastosPersonales) cfg.gastosPersonales = {};
  if (!cfg.gastosPersonales.olga) cfg.gastosPersonales.olga = {};
  if (
    cfg.gastosPersonales.olga.superavit === undefined ||
    cfg.gastosPersonales.olga.superavit === 0.0 ||
    cfg.gastosPersonales.olga.superavit === 62.75
  ) {
    cfg.gastosPersonales.olga.superavit = 115.57;
  }
  if (cfg.gastosPersonales.olga.ingresoHabitual === undefined) {
    cfg.gastosPersonales.olga.ingresoHabitual = 550.0;
  }
  if (!cfg.alertas) cfg.alertas = JSON.parse(JSON.stringify(DEFAULT_CONFIG.alertas));
  if (cfg.alertas.cuotaHipotecaNueva === undefined || cfg.alertas.cuotaHipotecaNueva === 716.81) {
    cfg.alertas.cuotaHipotecaNueva = 777.37;
  }
  if (cfg.alertas.mesHipoteca === undefined || cfg.alertas.mesHipoteca === 8) {
    cfg.alertas.mesHipoteca = 9;
  }
  return cfg;
}

/**
 * Inicializa la persistencia conectando con la API serverless de Vercel.
 * Mantiene el nombre inicializarSupabase por compatibilidad de interfaz con app.js.
 */
async function inicializarPersistencia() {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const headers = getAuthHeaders();
    const response = await fetch('/api/auth?action=check', { headers });

    if (response.ok) {
      const data = await response.json();
      if (token && !data.isEditor) {
        // Token inválido o expirado en el servidor
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
      isCloudActive = true;
      console.info('Conexión con Vercel Postgres establecida correctamente.');
    } else {
      console.warn('API de Vercel no disponible. Activando modo LocalStorage.');
      isCloudActive = false;
    }
  } catch (error) {
    console.warn('Modo offline detectado. Usando LocalStorage:', error.message);
    isCloudActive = false;
  }
}

const inicializarSupabase = inicializarPersistencia;

/**
 * Verifica si hay una sesión activa de usuario editor.
 */
async function obtenerUsuarioActivo() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) return null;

  try {
    const response = await fetch('/api/auth?action=check', {
      headers: getAuthHeaders()
    });

    if (response.ok) {
      const data = await response.json();
      if (data.isEditor && data.user) {
        return data.user;
      }
      localStorage.removeItem(AUTH_TOKEN_KEY);
      return null;
    }
  } catch (_e) {
    // Si estamos offline pero el token parece estructuralmente válido y reciente (<30 días)
    const partes = token.split('_');
    if (partes.length === 3 && partes[0] === 'cp') {
      const ts = parseInt(partes[1], 10);
      if (!isNaN(ts) && Date.now() - ts < 30 * 24 * 60 * 60 * 1000) {
        return { email: 'pedro@commonpay.local', role: 'editor' };
      }
    }
  }
  return null;
}

/**
 * Inicia sesión como editor con contraseña.
 */
async function login(email, password) {
  try {
    const response = await fetch('/api/auth?action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Contraseña incorrecta.');
    }

    if (data.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
    }

    return data.user || { email: email || 'pedro@commonpay.local', role: 'editor' };
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    throw error;
  }
}

/**
 * Cierra la sesión activa de editor.
 */
async function logout() {
  try {
    await fetch('/api/auth?action=logout', {
      method: 'POST',
      headers: getAuthHeaders()
    });
  } catch (_e) {
    // Ignorar errores de red al cerrar sesión
  } finally {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

// -------------------------------------------------------------
// CONFIGURACIÓN
// -------------------------------------------------------------

/**
 * Carga la configuración desde Vercel Postgres o LocalStorage.
 */
async function getConfiguration() {
  if (isCloudActive) {
    try {
      const res = await fetch('/api/data?resource=config');
      if (res.ok) {
        const cloudConfig = await res.json();
        if (cloudConfig) {
          const normalizada = normalizarConfiguracion(cloudConfig);
          localStorage.setItem(CONFIG_KEY, JSON.stringify(normalizada));
          return normalizada;
        } else {
          // Si aún no hay configuración en la nube, inicializar con la por defecto si somos editores
          const user = await obtenerUsuarioActivo();
          if (user) {
            await saveConfiguration(DEFAULT_CONFIG);
          }
          return normalizarConfiguracion(JSON.parse(JSON.stringify(DEFAULT_CONFIG)));
        }
      }
    } catch (err) {
      console.warn('Error al leer configuración de Vercel Postgres. Usando LocalStorage:', err);
    }
  }

  // Fallback LocalStorage
  const localData = localStorage.getItem(CONFIG_KEY);
  if (!localData) {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(DEFAULT_CONFIG));
    return normalizarConfiguracion(JSON.parse(JSON.stringify(DEFAULT_CONFIG)));
  }
  try {
    return normalizarConfiguracion(JSON.parse(localData));
  } catch (_e) {
    return normalizarConfiguracion(JSON.parse(JSON.stringify(DEFAULT_CONFIG)));
  }
}

/**
 * Guarda la configuración en la nube y sincroniza con LocalStorage.
 */
async function saveConfiguration(config) {
  const normalizada = normalizarConfiguracion(config);
  localStorage.setItem(CONFIG_KEY, JSON.stringify(normalizada));

  if (isCloudActive) {
    try {
      const res = await fetch('/api/data?resource=config', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(normalizada)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Error al guardar configuración en el servidor.');
      }
    } catch (err) {
      console.error('Error al sincronizar configuración con la nube:', err);
      throw err;
    }
  }
}

/**
 * Restablece la configuración a los valores iniciales por defecto.
 */
async function resetConfiguration() {
  await saveConfiguration(DEFAULT_CONFIG);
  return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
}

// -------------------------------------------------------------
// FIANZA ACUMULADO
// -------------------------------------------------------------

/**
 * Obtiene el acumulado actual de fianza desde Vercel Postgres o LocalStorage.
 */
async function getFianzaAcumulado() {
  if (isCloudActive) {
    try {
      const res = await fetch('/api/data?resource=fianza_acumulado');
      if (res.ok) {
        const data = await res.json();
        if (data && data.acumulado !== undefined) {
          const val = parseFloat(data.acumulado);
          localStorage.setItem(FIANZA_ACUMULADO_KEY, val.toString());
          return val;
        }
      }
    } catch (err) {
      console.warn('Error al leer acumulado de fianza de la nube. Usando LocalStorage:', err);
    }
  }

  // Fallback LocalStorage
  const localData = localStorage.getItem(FIANZA_ACUMULADO_KEY);
  if (localData === null || parseFloat(localData) === 0.0) {
    localStorage.setItem(FIANZA_ACUMULADO_KEY, '410.00');
    return 410.0;
  }
  const valor = parseFloat(localData);
  return isNaN(valor) ? 410.0 : valor;
}

/**
 * Guarda el acumulado de fianza en la nube y en LocalStorage.
 */
async function saveFianzaAcumulado(valor) {
  const valorRedondeado = Math.round((valor + Number.EPSILON) * 100) / 100;
  localStorage.setItem(FIANZA_ACUMULADO_KEY, valorRedondeado.toString());

  if (isCloudActive) {
    try {
      const res = await fetch('/api/data?resource=fianza_acumulado', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ acumulado: valorRedondeado })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Error al guardar acumulado de fianza en la nube.');
      }
    } catch (err) {
      console.error('Error al guardar fianza en la nube:', err);
      throw err;
    }
  }
}

// -------------------------------------------------------------
// HISTORIAL DE TRANSFERENCIAS MENSUALES
// -------------------------------------------------------------

/**
 * Obtiene el historial de transferencias mensuales.
 */
async function getHistorial() {
  if (isCloudActive) {
    try {
      const res = await fetch('/api/data?resource=historial');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          localStorage.setItem(HISTORIAL_KEY, JSON.stringify(data));
          return data;
        }
      }
    } catch (err) {
      console.warn('Error al leer historial de meses de la nube. Usando LocalStorage:', err);
    }
  }

  // Fallback LocalStorage
  const localData = localStorage.getItem(HISTORIAL_KEY);
  if (!localData) {
    localStorage.setItem(HISTORIAL_KEY, JSON.stringify([]));
    return [];
  }
  try {
    return JSON.parse(localData);
  } catch (_e) {
    return [];
  }
}

/**
 * Añade una transferencia mensual completada al historial.
 */
async function addTransferenciaAlHistorial(transferencia) {
  const historial = await getHistorial();
  const existe = historial.some(
    (t) => t.mesIndex === transferencia.mesIndex && t.anio === transferencia.anio
  );

  if (existe) {
    return false; // Ya registrado
  }

  if (isCloudActive) {
    try {
      const res = await fetch('/api/data?resource=historial', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(transferencia)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Error al registrar transferencia en la nube.');
      }

      const resData = await res.json();
      if (resData.id) transferencia.id = resData.id;
    } catch (err) {
      console.error('Error al guardar mes en la nube:', err);
      throw err;
    }
  }

  // Fallback LocalStorage
  historial.push(transferencia);
  localStorage.setItem(HISTORIAL_KEY, JSON.stringify(historial));
  return true;
}

/**
 * Elimina una transferencia del historial por mes y año.
 */
async function deleteTransferenciaDelHistorial(mesIndex, anio) {
  if (isCloudActive) {
    try {
      const res = await fetch(
        `/api/data?resource=historial&mesIndex=${encodeURIComponent(mesIndex)}&anio=${encodeURIComponent(anio)}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders()
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Error al eliminar transferencia de la nube.');
      }
    } catch (err) {
      console.error('Error al eliminar mes en la nube:', err);
      throw err;
    }
  }

  // Fallback LocalStorage
  let historial = await getHistorial();
  historial = historial.filter((t) => !(t.mesIndex === mesIndex && t.anio === anio));
  localStorage.setItem(HISTORIAL_KEY, JSON.stringify(historial));
}

// -------------------------------------------------------------
// HISTORIAL DE MOVIMIENTOS DE FIANZA
// -------------------------------------------------------------

/**
 * Obtiene la lista de movimientos registrados en el fondo de fianza.
 */
async function getFianzaHistorial() {
  if (isCloudActive) {
    try {
      const res = await fetch('/api/data?resource=fianza');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          localStorage.setItem(FIANZA_HISTORIAL_KEY, JSON.stringify(data));
          return data;
        }
      }
    } catch (err) {
      console.warn('Error al leer movimientos de fianza de la nube. Usando LocalStorage:', err);
    }
  }

  // Fallback LocalStorage
  const localData = localStorage.getItem(FIANZA_HISTORIAL_KEY);
  if (!localData) {
    localStorage.setItem(FIANZA_HISTORIAL_KEY, JSON.stringify([]));
    return [];
  }
  try {
    return JSON.parse(localData);
  } catch (_e) {
    return [];
  }
}

/**
 * Añade un movimiento (ingreso o retiro) al fondo de fianza.
 */
async function addMovimientoFianza(concepto, importe, acumuladoDespues) {
  const nuevoMovimiento = {
    id:
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 9),
    fecha: new Date().toISOString(),
    tipo: importe >= 0 ? 'ingreso' : 'retiro',
    concepto,
    importe,
    balanceResultante: acumuladoDespues,
    acumuladoDespues
  };

  if (isCloudActive) {
    try {
      const res = await fetch('/api/data?resource=fianza', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(nuevoMovimiento)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Error al guardar movimiento de fianza en la nube.');
      }

      const resData = await res.json();
      if (resData.id) {
        nuevoMovimiento.id = resData.id;
      }
    } catch (err) {
      console.error('Error al guardar movimiento de fianza en la nube:', err);
      throw err;
    }
  }

  // Fallback LocalStorage
  const historial = await getFianzaHistorial();
  historial.unshift(nuevoMovimiento);
  localStorage.setItem(FIANZA_HISTORIAL_KEY, JSON.stringify(historial));
  return nuevoMovimiento;
}

/**
 * Elimina un movimiento del fondo de fianza por ID.
 */
async function deleteMovimientoFianza(id) {
  if (isCloudActive) {
    try {
      const res = await fetch(`/api/data?resource=fianza&id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Error al eliminar movimiento de fianza en la nube.');
      }
    } catch (err) {
      console.error('Error al eliminar movimiento de fianza en la nube:', err);
      throw err;
    }
  }

  // Fallback LocalStorage
  let historial = await getFianzaHistorial();
  historial = historial.filter((m) => m.id !== id);
  localStorage.setItem(FIANZA_HISTORIAL_KEY, JSON.stringify(historial));
}

// -------------------------------------------------------------
// HISTORIAL DE CONCILIACIONES / LIQUIDACIÓN DÍA 15
// -------------------------------------------------------------

/**
 * Obtiene el historial de conciliaciones.
 */
async function getConciliaciones() {
  if (isCloudActive) {
    try {
      const res = await fetch('/api/data?resource=conciliaciones');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          localStorage.setItem(CONCILIACIONES_KEY, JSON.stringify(data));
          return data;
        }
      }
    } catch (err) {
      console.warn('Error al leer conciliaciones de la nube. Usando LocalStorage:', err);
    }
  }

  // Fallback LocalStorage
  const localData = localStorage.getItem(CONCILIACIONES_KEY);
  if (!localData) {
    localStorage.setItem(CONCILIACIONES_KEY, JSON.stringify([]));
    return [];
  }
  try {
    return JSON.parse(localData);
  } catch (_e) {
    return [];
  }
}

/**
 * Añade una conciliación al historial.
 */
async function addConciliacion(conciliacion) {
  const lista = await getConciliaciones();
  const existe = lista.some(
    (c) => c.mesIndex === conciliacion.mesIndex && c.anio === conciliacion.anio
  );

  if (existe) {
    return false; // Ya registrado
  }

  if (isCloudActive) {
    try {
      const res = await fetch('/api/data?resource=conciliaciones', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(conciliacion)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Error al registrar conciliación en la nube.');
      }

      const resData = await res.json();
      if (resData.id) conciliacion.id = resData.id;
    } catch (err) {
      console.error('Error al registrar conciliación en la nube:', err);
      throw err;
    }
  }

  // Fallback LocalStorage
  conciliacion.id =
    conciliacion.id ||
    (typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 9));
  conciliacion.fecha = conciliacion.fecha || new Date().toISOString();
  lista.unshift(conciliacion);
  localStorage.setItem(CONCILIACIONES_KEY, JSON.stringify(lista));
  return true;
}

/**
 * Elimina una conciliación por ID o por mes y año.
 */
async function deleteConciliacion(id, mesIndex, anio) {
  if (isCloudActive) {
    try {
      let url = '/api/data?resource=conciliaciones';
      if (id) {
        url += `&id=${encodeURIComponent(id)}`;
      } else if (mesIndex !== undefined && anio !== undefined) {
        url += `&mesIndex=${encodeURIComponent(mesIndex)}&anio=${encodeURIComponent(anio)}`;
      }

      const res = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Error al eliminar conciliación en la nube.');
      }
    } catch (err) {
      console.error('Error al eliminar conciliación en la nube:', err);
      throw err;
    }
  }

  // Fallback LocalStorage
  let lista = await getConciliaciones();
  lista = lista.filter((c) => {
    if (id && c.id === id) return false;
    if (c.mesIndex === mesIndex && c.anio === anio) return false;
    return true;
  });
  localStorage.setItem(CONCILIACIONES_KEY, JSON.stringify(lista));
}

// -------------------------------------------------------------
// TEMA VISUAL (LIGHT / DARK)
// -------------------------------------------------------------

/**
 * Obtiene el tema guardado localmente ('light' o 'dark').
 */
function getTheme() {
  return localStorage.getItem(THEME_KEY) || 'light';
}

/**
 * Guarda el tema preferido localmente.
 */
function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

// Exportamos las funciones en el objeto window
window.StorageModule = {
  inicializarPersistencia,
  inicializarSupabase,
  obtenerUsuarioActivo,
  login,
  logout,
  getConfiguration,
  saveConfiguration,
  resetConfiguration,
  getFianzaAcumulado,
  saveFianzaAcumulado,
  getHistorial,
  addTransferenciaAlHistorial,
  deleteTransferenciaDelHistorial,
  getConciliaciones,
  addConciliacion,
  deleteConciliacion,
  getFianzaHistorial,
  addMovimientoFianza,
  deleteMovimientoFianza,
  getTheme,
  saveTheme
};
