/**
 * Módulo de Persistencia para CommonPay (Soporte Híbrido: Supabase / LocalStorage)
 */

const CONFIG_KEY = 'commonpay_config';
const FIANZA_ACUMULADO_KEY = 'commonpay_fianza_acumulado';
const FIANZA_HISTORIAL_KEY = 'commonpay_fianza_historial';
const HISTORIAL_KEY = 'commonpay_historial';
const THEME_KEY = 'commonpay_theme';

// Configuración por defecto basada en los requisitos del negocio
const DEFAULT_CONFIG = {
  gastosFijos: {
    cuotaHipoteca: 716.81,
    ingresoAlquiler: 462.00,
    comunidad: 39.38
  },
  gastosPersonales: {
    olga: {
      coche: 188.02,
      manutencion: 189.30
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
      importeTotal: 108.20,
      meses: [3] // Abril
    }
  ],
  fianza: {
    pointer: 'fianza',
    objetivo: 450.00,
    aportacionMensualPersona: 10.00
  },
  alertas: {
    mesHipoteca: 8,              // Septiembre
    mesManutencion: 5,           // Junio
    mesAlquiler: 10,             // Noviembre
    tasaManutencion: 2.0,        // 2% IPC
    tasaAlquiler: 2.0,           // 2% IRAV
    cuotaHipotecaNueva: 716.81   // Sin variación por defecto
  }
};

let supabaseClient = null;
let isSupabaseActive = false;

/**
 * Inicializa el cliente de Supabase haciendo fetch al endpoint Serverless /api/config.
 * Si las credenciales no existen o fallan, cae de forma transparente a LocalStorage.
 */
async function inicializarSupabase() {
  try {
    const response = await fetch('/api/config');
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const config = await response.json();
    
    if (config.supabaseUrl && config.supabaseAnonKey) {
      // Validar si la API de Supabase se ha cargado en el navegador (CDN en index.html)
      if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
        isSupabaseActive = true;
        console.log("Supabase inicializado correctamente.");
      } else {
        console.warn("Librería de Supabase no cargada en el DOM. Usando LocalStorage.");
      }
    } else {
      console.log("No se detectó configuración de Supabase. Usando LocalStorage (Modo Local).");
    }
  } catch (error) {
    console.error("Error al inicializar Supabase. Cayendo en LocalStorage:", error);
    isSupabaseActive = false;
  }
}

/**
 * Verifica si hay una sesión activa de usuario en Supabase.
 */
async function obtenerUsuarioActivo() {
  if (!isSupabaseActive) return null;
  try {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error) return null;
    return user;
  } catch (e) {
    return null;
  }
}

/**
 * Inicia sesión con email y contraseña.
 */
async function login(email, password) {
  if (!isSupabaseActive) {
    throw new Error("La base de datos en la nube no está configurada.");
  }
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

/**
 * Cierra la sesión activa en Supabase.
 */
async function logout() {
  if (!isSupabaseActive) return;
  const { error } = await supabaseClient.auth.signOut();
  if (error) throw error;
}

// --- UTILERÍAS DE MAPEO PARA LA BASE DE DATOS ---
function mapearAJs(dbRow) {
  return {
    mesIndex: dbRow.mes_index,
    mesNombre: dbRow.mes_nombre,
    anio: dbRow.anio,
    fechaCompletado: dbRow.fecha_completado,
    transferenciaOlga: parseFloat(dbRow.transferencia_olga),
    transferenciaPedro: parseFloat(dbRow.transferencia_pedro),
    fianzaAlMomento: parseFloat(dbRow.fianza_al_momento),
    desglose: dbRow.desglose
  };
}

function mapearADb(jsRow) {
  return {
    mes_index: jsRow.mesIndex,
    mes_nombre: jsRow.mesNombre,
    anio: jsRow.anio,
    fecha_completado: jsRow.fechaCompletado,
    transferencia_olga: jsRow.transferenciaOlga,
    transferencia_pedro: jsRow.transferenciaPedro,
    fianza_al_momento: jsRow.fianzaAlMomento,
    desglose: jsRow.desglose
  };
}

// --- FUNCIONES DE ALMACENAMIENTO DE DATOS ---

/**
 * Carga la configuración desde la nube (Supabase) o LocalStorage.
 */
async function getConfiguration() {
  if (isSupabaseActive) {
    try {
      const { data, error } = await supabaseClient
        .from('configuracion')
        .select('data')
        .eq('id', 1)
        .maybeSingle();

      if (error) throw error;

      if (data && data.data) {
        return data.data;
      } else {
        // Si no hay configuración remota creada, guardar la por defecto (si somos editores)
        const user = await obtenerUsuarioActivo();
        if (user) {
          await saveConfiguration(DEFAULT_CONFIG);
        }
        return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
      }
    } catch (err) {
      console.error("Error al obtener configuración de Supabase. Leyendo LocalStorage:", err);
    }
  }

  // Fallback LocalStorage
  const data = localStorage.getItem(CONFIG_KEY);
  if (!data) {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(DEFAULT_CONFIG));
    return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  }
}

/**
 * Guarda la configuración en la nube (Supabase) o LocalStorage.
 */
async function saveConfiguration(config) {
  if (isSupabaseActive) {
    try {
      const user = await obtenerUsuarioActivo();
      if (!user) {
        throw new Error("No tienes permisos de edición. Inicia sesión primero.");
      }
      
      const { error } = await supabaseClient
        .from('configuracion')
        .upsert({ id: 1, data: config, updated_at: new Date().toISOString() });

      if (error) throw error;
      return;
    } catch (err) {
      console.error("Error al guardar configuración en Supabase. Guardando en LocalStorage:", err);
      throw err;
    }
  }

  // Fallback LocalStorage
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

/**
 * Restablece la configuración a los valores por defecto.
 */
async function resetConfiguration() {
  await saveConfiguration(DEFAULT_CONFIG);
  return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
}

/**
 * Obtiene el acumulado de fianza desde Supabase o LocalStorage.
 */
async function getFianzaAcumulado() {
  if (isSupabaseActive) {
    try {
      const { data, error } = await supabaseClient
        .from('fianza_estado')
        .select('acumulado')
        .eq('id', 1)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        return parseFloat(data.acumulado);
      } else {
        const user = await obtenerUsuarioActivo();
        if (user) {
          await saveFianzaAcumulado(0.00);
        }
        return 0.00;
      }
    } catch (err) {
      console.error("Error al leer fianza de Supabase. Usando LocalStorage:", err);
    }
  }

  // Fallback LocalStorage
  const data = localStorage.getItem(FIANZA_ACUMULADO_KEY);
  if (data === null) {
    localStorage.setItem(FIANZA_ACUMULADO_KEY, '0');
    return 0.00;
  }
  const valor = parseFloat(data);
  return isNaN(valor) ? 0.00 : valor;
}

/**
 * Guarda el acumulado de fianza en la nube o LocalStorage.
 */
async function saveFianzaAcumulado(valor) {
  const valorRedondeado = Math.round((valor + Number.EPSILON) * 100) / 100;

  if (isSupabaseActive) {
    try {
      const user = await obtenerUsuarioActivo();
      if (!user) {
        throw new Error("No tienes permisos de edición. Inicia sesión primero.");
      }
      
      const { error } = await supabaseClient
        .from('fianza_estado')
        .upsert({ id: 1, acumulado: valorRedondeado, updated_at: new Date().toISOString() });

      if (error) throw error;
      return;
    } catch (err) {
      console.error("Error al guardar fianza en Supabase:", err);
      throw err;
    }
  }

  // Fallback LocalStorage
  localStorage.setItem(FIANZA_ACUMULADO_KEY, valorRedondeado.toString());
}

/**
 * Obtiene el historial de transferencias desde Supabase o LocalStorage.
 */
async function getHistorial() {
  if (isSupabaseActive) {
    try {
      const { data, error } = await supabaseClient
        .from('historial_transferencias')
        .select('*')
        .order('mes_index', { ascending: true });

      if (error) throw error;
      return (data || []).map(mapearAJs);
    } catch (err) {
      console.error("Error al leer historial de Supabase. Usando LocalStorage:", err);
    }
  }

  // Fallback LocalStorage
  const data = localStorage.getItem(HISTORIAL_KEY);
  if (!data) {
    localStorage.setItem(HISTORIAL_KEY, JSON.stringify([]));
    return [];
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

/**
 * Guarda el historial completo en LocalStorage (Solo se usa de fallback en local).
 */
function saveHistorialLocal(historial) {
  localStorage.setItem(HISTORIAL_KEY, JSON.stringify(historial));
}

/**
 * Añade una transferencia al historial.
 */
async function addTransferenciaAlHistorial(transferencia) {
  const historial = await getHistorial();
  const existe = historial.some(
    t => t.mesIndex === transferencia.mesIndex && t.anio === transferencia.anio
  );
  
  if (existe) {
    return false; // Ya registrado
  }

  if (isSupabaseActive) {
    try {
      const user = await obtenerUsuarioActivo();
      if (!user) {
        throw new Error("No tienes permisos de edición. Inicia sesión primero.");
      }
      
      const dbRow = mapearADb(transferencia);
      const { error } = await supabaseClient
        .from('historial_transferencias')
        .insert(dbRow);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Error al añadir transferencia en Supabase:", err);
      throw err;
    }
  }

  // Fallback LocalStorage
  historial.push(transferencia);
  saveHistorialLocal(historial);
  return true;
}

/**
 * Elimina una transferencia del historial por mes y año.
 */
async function deleteTransferenciaDelHistorial(mesIndex, anio) {
  if (isSupabaseActive) {
    try {
      const user = await obtenerUsuarioActivo();
      if (!user) {
        throw new Error("No tienes permisos de edición. Inicia sesión primero.");
      }
      
      const { error } = await supabaseClient
        .from('historial_transferencias')
        .delete()
        .eq('mes_index', mesIndex)
        .eq('anio', anio);

      if (error) throw error;
      return;
    } catch (err) {
      console.error("Error al eliminar transferencia en Supabase:", err);
      throw err;
    }
  }

  // Fallback LocalStorage
  let historial = await getHistorial();
  historial = historial.filter(t => !(t.mesIndex === mesIndex && t.anio === anio));
  saveHistorialLocal(historial);
}

const CONCILIACIONES_KEY = 'commonpay_conciliaciones';

// --- UTILERÍAS DE MAPEO PARA CONCILIACIONES ---
function mapearConciliacionAJs(dbRow) {
  return {
    id: dbRow.id,
    mesIndex: dbRow.mes_index,
    mesNombre: dbRow.mes_nombre,
    anio: dbRow.anio,
    saldoReal: parseFloat(dbRow.saldo_real),
    fianzaAcumulada: parseFloat(dbRow.fianza_acumulada),
    diferencia: parseFloat(dbRow.diferencia),
    tipo: dbRow.tipo,
    fecha: dbRow.fecha
  };
}

function mapearConciliacionADb(jsRow) {
  return {
    mes_index: jsRow.mesIndex,
    mes_nombre: jsRow.mesNombre,
    anio: jsRow.anio,
    saldo_real: jsRow.saldoReal,
    fianza_acumulada: jsRow.fianzaAcumulada,
    diferencia: jsRow.diferencia,
    tipo: jsRow.tipo,
    fecha: jsRow.fecha || new Date().toISOString()
  };
}

/**
 * Obtiene el historial de conciliaciones/liquidaciones desde Supabase o LocalStorage.
 */
async function getConciliaciones() {
  if (isSupabaseActive) {
    try {
      const { data, error } = await supabaseClient
        .from('conciliaciones')
        .select('*')
        .order('anio', { ascending: false })
        .order('mes_index', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapearConciliacionAJs);
    } catch (err) {
      console.error("Error al leer conciliaciones de Supabase. Usando LocalStorage:", err);
    }
  }

  // Fallback LocalStorage
  const data = localStorage.getItem(CONCILIACIONES_KEY);
  if (!data) {
    localStorage.setItem(CONCILIACIONES_KEY, JSON.stringify([]));
    return [];
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

/**
 * Añade una conciliación al historial.
 */
async function addConciliacion(conciliacion) {
  const lista = await getConciliaciones();
  const existe = lista.some(
    c => c.mesIndex === conciliacion.mesIndex && c.anio === conciliacion.anio
  );

  if (existe) {
    return false; // Ya registrado
  }

  if (isSupabaseActive) {
    try {
      const user = await obtenerUsuarioActivo();
      if (!user) {
        throw new Error("No tienes permisos de edición. Inicia sesión primero.");
      }

      const dbRow = mapearConciliacionADb(conciliacion);
      const { error } = await supabaseClient
        .from('conciliaciones')
        .insert(dbRow);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Error al añadir conciliación en Supabase:", err);
      throw err;
    }
  }

  // Fallback LocalStorage
  conciliacion.id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
  conciliacion.fecha = conciliacion.fecha || new Date().toISOString();
  lista.push(conciliacion);
  localStorage.setItem(CONCILIACIONES_KEY, JSON.stringify(lista));
  return true;
}

/**
 * Elimina una conciliación por ID en Supabase, o por mes y año en LocalStorage.
 */
async function deleteConciliacion(id, mesIndex, anio) {
  if (isSupabaseActive) {
    try {
      const user = await obtenerUsuarioActivo();
      if (!user) {
        throw new Error("No tienes permisos de edición. Inicia sesión primero.");
      }

      const { error } = await supabaseClient
        .from('conciliaciones')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return;
    } catch (err) {
      console.error("Error al eliminar conciliación en Supabase:", err);
      throw err;
    }
  }

  // Fallback LocalStorage
  let lista = await getConciliaciones();
  lista = lista.filter(c => !(c.mesIndex === mesIndex && c.anio === anio));
  localStorage.setItem(CONCILIACIONES_KEY, JSON.stringify(lista));
}

// --- HISTORIAL DE FIANZA ---

function mapearMovimientoFianzaAJs(dbRow) {
  return {
    id: dbRow.id,
    fecha: dbRow.fecha,
    concepto: dbRow.concepto,
    importe: parseFloat(dbRow.importe),
    acumuladoDespues: parseFloat(dbRow.acumulado_despues)
  };
}

function mapearMovimientoFianzaADb(jsRow) {
  return {
    fecha: jsRow.fecha || new Date().toISOString(),
    concepto: jsRow.concepto,
    importe: jsRow.importe,
    acumulado_despues: jsRow.acumuladoDespues
  };
}

/**
 * Obtiene el historial de movimientos de fianza.
 */
async function getFianzaHistorial() {
  if (isSupabaseActive) {
    try {
      const { data, error } = await supabaseClient
        .from('fianza_historial')
        .select('*')
        .order('fecha', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapearMovimientoFianzaAJs);
    } catch (err) {
      console.error("Error al leer historial de fianza de Supabase. Usando LocalStorage:", err);
    }
  }

  // Fallback LocalStorage
  const data = localStorage.getItem(FIANZA_HISTORIAL_KEY);
  if (!data) {
    localStorage.setItem(FIANZA_HISTORIAL_KEY, JSON.stringify([]));
    return [];
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

/**
 * Añade un movimiento al historial de fianza.
 */
async function addMovimientoFianza(concepto, importe, acumuladoDespues) {
  const nuevoMovimiento = {
    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
    fecha: new Date().toISOString(),
    concepto,
    importe,
    acumuladoDespues
  };

  if (isSupabaseActive) {
    try {
      const user = await obtenerUsuarioActivo();
      if (!user) {
        throw new Error("No tienes permisos de edición. Inicia sesión primero.");
      }
      
      const dbRow = mapearMovimientoFianzaADb(nuevoMovimiento);
      const { error } = await supabaseClient
        .from('fianza_historial')
        .insert(dbRow);

      if (error) throw error;
      return nuevoMovimiento;
    } catch (err) {
      console.error("Error al añadir movimiento de fianza en Supabase:", err);
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
 * Elimina un movimiento del historial de fianza.
 */
async function deleteMovimientoFianza(id) {
  if (isSupabaseActive) {
    try {
      const user = await obtenerUsuarioActivo();
      if (!user) {
        throw new Error("No tienes permisos de edición. Inicia sesión primero.");
      }

      const { error } = await supabaseClient
        .from('fianza_historial')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return;
    } catch (err) {
      console.error("Error al eliminar movimiento de fianza en Supabase:", err);
      throw err;
    }
  }

  // Fallback LocalStorage
  let historial = await getFianzaHistorial();
  historial = historial.filter(m => m.id !== id);
  localStorage.setItem(FIANZA_HISTORIAL_KEY, JSON.stringify(historial));
}

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
