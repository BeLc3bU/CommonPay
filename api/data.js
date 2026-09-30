import { neon } from '@neondatabase/serverless';
import { verificarPeticionEditor } from './auth.js';

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_PRISMA_URL;

let dbInitialized = false;

function getDbClient() {
  if (!connectionString) return null;
  return neon(connectionString);
}

/**
 * Crea las tablas necesarias si aún no existen en la base de datos
 */
async function asegurarTablas(sql) {
  if (dbInitialized) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS configuracion (
        id VARCHAR(50) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS historial_meses (
        id SERIAL PRIMARY KEY,
        mes_index INT NOT NULL,
        mes_nombre VARCHAR(50) NOT NULL,
        anio INT NOT NULL,
        fecha_completado TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        transferencia_olga NUMERIC(10,2) NOT NULL,
        transferencia_pedro NUMERIC(10,2) NOT NULL,
        fianza_al_momento NUMERIC(10,2) NOT NULL,
        desglose JSONB
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS fianza_historial (
        id SERIAL PRIMARY KEY,
        fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        tipo VARCHAR(50) NOT NULL,
        concepto VARCHAR(255) NOT NULL,
        importe NUMERIC(10,2) NOT NULL,
        balance_resultante NUMERIC(10,2) NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS conciliaciones (
        id SERIAL PRIMARY KEY,
        mes_index INT NOT NULL,
        mes_nombre VARCHAR(50) NOT NULL,
        anio INT NOT NULL,
        saldo_real NUMERIC(10,2) NOT NULL,
        fianza_acumulada NUMERIC(10,2) NOT NULL,
        diferencia NUMERIC(10,2) NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS fianza_estado (
        id INT PRIMARY KEY,
        acumulado NUMERIC(10,2) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    dbInitialized = true;
  } catch (error) {
    console.error('Error al inicializar tablas en Postgres:', error);
  }
}

function parseBody(req) {
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  return body || {};
}

/**
 * Handler Serverless para /api/data
 */
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  const sql = getDbClient();
  if (!sql) {
    return res.status(503).json({
      error: 'Base de datos Vercel Postgres no configurada en variables de entorno.'
    });
  }

  await asegurarTablas(sql);

  const resource = req.query.resource || '';
  const method = req.method;

  try {
    // -------------------------------------------------------------
    // 1. RECURSO: CONFIGURACIÓN
    // -------------------------------------------------------------
    if (resource === 'config') {
      if (method === 'GET') {
        const rows = await sql`SELECT data FROM configuracion WHERE id = 'current' LIMIT 1;`;
        return res.status(200).json(rows.length > 0 ? rows[0].data : null);
      }

      if (method === 'POST') {
        if (!verificarPeticionEditor(req)) {
          return res.status(403).json({ error: 'Acceso no autorizado. Se requiere rol Editor.' });
        }
        const body = parseBody(req);
        await sql`
          INSERT INTO configuracion (id, data, updated_at)
          VALUES ('current', ${JSON.stringify(body)}, NOW())
          ON CONFLICT (id) DO UPDATE
          SET data = EXCLUDED.data, updated_at = NOW();
        `;
        return res.status(200).json({ success: true });
      }
    }

    // -------------------------------------------------------------
    // 2. RECURSO: HISTORIAL DE MESES
    // -------------------------------------------------------------
    if (resource === 'historial') {
      if (method === 'GET') {
        const rows = await sql`
          SELECT id, mes_index, mes_nombre, anio, fecha_completado,
                 transferencia_olga, transferencia_pedro, fianza_al_momento, desglose
          FROM historial_meses
          ORDER BY anio ASC, mes_index ASC;
        `;
        const mapped = rows.map((r) => ({
          id: r.id,
          mesIndex: r.mes_index,
          mesNombre: r.mes_nombre,
          anio: r.anio,
          fechaCompletado: r.fecha_completado,
          transferenciaOlga: parseFloat(r.transferencia_olga),
          transferenciaPedro: parseFloat(r.transferencia_pedro),
          fianzaAlMomento: parseFloat(r.fianza_al_momento),
          desglose: r.desglose
        }));
        return res.status(200).json(mapped);
      }

      if (method === 'POST') {
        if (!verificarPeticionEditor(req)) {
          return res.status(403).json({ error: 'Acceso no autorizado. Se requiere rol Editor.' });
        }
        const b = parseBody(req);
        const rows = await sql`
          INSERT INTO historial_meses (
            mes_index, mes_nombre, anio, fecha_completado,
            transferencia_olga, transferencia_pedro, fianza_al_momento, desglose
          ) VALUES (
            ${b.mesIndex}, ${b.mesNombre}, ${b.anio}, ${b.fechaCompletado || new Date().toISOString()},
            ${b.transferenciaOlga}, ${b.transferenciaPedro}, ${b.fianzaAlMomento}, ${JSON.stringify(b.desglose || {})}
          ) RETURNING id;
        `;
        return res.status(200).json({ success: true, id: rows[0]?.id });
      }

      if (method === 'DELETE') {
        if (!verificarPeticionEditor(req)) {
          return res.status(403).json({ error: 'Acceso no autorizado. Se requiere rol Editor.' });
        }
        if (req.query.mesIndex !== undefined && req.query.anio !== undefined) {
          const mesIndex = parseInt(req.query.mesIndex, 10);
          const anio = parseInt(req.query.anio, 10);
          await sql`DELETE FROM historial_meses WHERE mes_index = ${mesIndex} AND anio = ${anio};`;
          return res.status(200).json({ success: true });
        }
        const id = parseInt(req.query.id, 10);
        if (!id) return res.status(400).json({ error: 'ID o mesIndex/anio requerido.' });
        await sql`DELETE FROM historial_meses WHERE id = ${id};`;
        return res.status(200).json({ success: true });
      }
    }

    // -------------------------------------------------------------
    // 3. RECURSO: HISTORIAL DE FIANZA
    // -------------------------------------------------------------
    if (resource === 'fianza') {
      if (method === 'GET') {
        const rows = await sql`
          SELECT id, fecha, tipo, concepto, importe, balance_resultante
          FROM fianza_historial
          ORDER BY fecha DESC, id DESC;
        `;
        const mapped = rows.map((r) => ({
          id: r.id,
          fecha: r.fecha,
          tipo: r.tipo,
          concepto: r.concepto,
          importe: parseFloat(r.importe),
          balanceResultante: parseFloat(r.balance_resultante),
          acumuladoDespues: parseFloat(r.balance_resultante)
        }));
        return res.status(200).json(mapped);
      }

      if (method === 'POST') {
        if (!verificarPeticionEditor(req)) {
          return res.status(403).json({ error: 'Acceso no autorizado. Se requiere rol Editor.' });
        }
        const b = parseBody(req);
        const balance =
          b.acumuladoDespues !== undefined
            ? b.acumuladoDespues
            : b.balanceResultante !== undefined
              ? b.balanceResultante
              : 0;
        const tipo = b.tipo || (b.importe >= 0 ? 'ingreso' : 'retiro');
        const rows = await sql`
          INSERT INTO fianza_historial (fecha, tipo, concepto, importe, balance_resultante)
          VALUES (
            ${b.fecha || new Date().toISOString()}, ${tipo}, ${b.concepto},
            ${b.importe}, ${balance}
          ) RETURNING id;
        `;
        return res.status(200).json({ success: true, id: rows[0]?.id });
      }

      if (method === 'DELETE') {
        if (!verificarPeticionEditor(req)) {
          return res.status(403).json({ error: 'Acceso no autorizado. Se requiere rol Editor.' });
        }
        const id = parseInt(req.query.id, 10);
        if (!id) return res.status(400).json({ error: 'ID inválido.' });
        await sql`DELETE FROM fianza_historial WHERE id = ${id};`;
        return res.status(200).json({ success: true });
      }
    }

    // -------------------------------------------------------------
    // 4. RECURSO: ESTADO/ACUMULADO DE FIANZA
    // -------------------------------------------------------------
    if (resource === 'fianza_acumulado') {
      if (method === 'GET') {
        const rows = await sql`SELECT acumulado FROM fianza_estado WHERE id = 1 LIMIT 1;`;
        const acumulado = rows.length > 0 ? parseFloat(rows[0].acumulado) : 410.0;
        return res.status(200).json({ acumulado });
      }

      if (method === 'POST') {
        if (!verificarPeticionEditor(req)) {
          return res.status(403).json({ error: 'Acceso no autorizado. Se requiere rol Editor.' });
        }
        const b = parseBody(req);
        const valor = parseFloat(b.acumulado);
        await sql`
          INSERT INTO fianza_estado (id, acumulado, updated_at)
          VALUES (1, ${valor}, NOW())
          ON CONFLICT (id) DO UPDATE
          SET acumulado = EXCLUDED.acumulado, updated_at = NOW();
        `;
        return res.status(200).json({ success: true, acumulado: valor });
      }
    }

    // -------------------------------------------------------------
    // 5. RECURSO: CONCILIACIONES (LIQUIDACIÓN DÍA 15)
    // -------------------------------------------------------------
    if (resource === 'conciliaciones') {
      if (method === 'GET') {
        const rows = await sql`
          SELECT id, mes_index, mes_nombre, anio, saldo_real, fianza_acumulada, diferencia, tipo, fecha
          FROM conciliaciones
          ORDER BY anio DESC, mes_index DESC;
        `;
        const mapped = rows.map((r) => ({
          id: r.id,
          mesIndex: r.mes_index,
          mesNombre: r.mes_nombre,
          anio: r.anio,
          saldoReal: parseFloat(r.saldo_real),
          fianzaAcumulada: parseFloat(r.fianza_acumulada),
          diferencia: parseFloat(r.diferencia),
          tipo: r.tipo,
          fecha: r.fecha
        }));
        return res.status(200).json(mapped);
      }

      if (method === 'POST') {
        if (!verificarPeticionEditor(req)) {
          return res.status(403).json({ error: 'Acceso no autorizado. Se requiere rol Editor.' });
        }
        const b = parseBody(req);
        const rows = await sql`
          INSERT INTO conciliaciones (
            mes_index, mes_nombre, anio, saldo_real, fianza_acumulada, diferencia, tipo, fecha
          ) VALUES (
            ${b.mesIndex}, ${b.mesNombre}, ${b.anio}, ${b.saldoReal},
            ${b.fianzaAcumulada}, ${b.diferencia}, ${b.tipo}, ${b.fecha || new Date().toISOString()}
          ) RETURNING id;
        `;
        return res.status(200).json({ success: true, id: rows[0]?.id });
      }

      if (method === 'DELETE') {
        if (!verificarPeticionEditor(req)) {
          return res.status(403).json({ error: 'Acceso no autorizado. Se requiere rol Editor.' });
        }
        if (req.query.mesIndex !== undefined && req.query.anio !== undefined) {
          const mesIndex = parseInt(req.query.mesIndex, 10);
          const anio = parseInt(req.query.anio, 10);
          await sql`DELETE FROM conciliaciones WHERE mes_index = ${mesIndex} AND anio = ${anio};`;
          return res.status(200).json({ success: true });
        }
        const id = parseInt(req.query.id, 10);
        if (!id) return res.status(400).json({ error: 'ID o mesIndex/anio requerido.' });
        await sql`DELETE FROM conciliaciones WHERE id = ${id};`;
        return res.status(200).json({ success: true });
      }
    }

    return res.status(400).json({ error: 'Recurso desconocido.' });
  } catch (error) {
    console.error(`Error en /api/data [${resource}]:`, error);
    return res.status(500).json({ error: error.message });
  }
}
