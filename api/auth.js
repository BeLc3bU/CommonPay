import crypto from 'crypto';

const SECRET_KEY =
  process.env.SESSION_SECRET || process.env.EDITOR_PASSWORD || 'commonpay-secret-key-editor-2026';

const DEFAULT_EDITOR_PASSWORD = process.env.EDITOR_PASSWORD || 'pedro123';
const TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 días

/**
 * Genera un token firmado con HMAC SHA-256
 */
export function generarTokenEditor() {
  const timestamp = Date.now().toString();
  const hmac = crypto.createHmac('sha256', SECRET_KEY).update(`editor:${timestamp}`).digest('hex');
  return `cp_${timestamp}_${hmac}`;
}

/**
 * Valida si un token es válido y no ha expirado
 */
export function esTokenValido(token) {
  if (!token || typeof token !== 'string') return false;
  const partes = token.split('_');
  if (partes.length !== 3 || partes[0] !== 'cp') return false;

  const timestamp = parseInt(partes[1], 10);
  const hmacRecibido = partes[2];

  if (isNaN(timestamp) || Date.now() - timestamp > TOKEN_MAX_AGE_MS) {
    return false; // Expirado o timestamp inválido
  }

  const hmacEsperado = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(`editor:${timestamp}`)
    .digest('hex');

  // Comparación en tiempo constante para evitar ataques de temporización
  try {
    return crypto.timingSafeEqual(Buffer.from(hmacRecibido), Buffer.from(hmacEsperado));
  } catch {
    return false;
  }
}

/**
 * Verifica si la petición HTTP proviene de un Editor autenticado
 */
export function verificarPeticionEditor(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';
  return esTokenValido(token);
}

/**
 * Handler Serverless para /api/auth
 */
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  const action = req.query.action || 'check';

  // 1. INICIAR SESIÓN (LOGIN)
  if (req.method === 'POST' && action === 'login') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const password = body && body.password ? body.password.toString().trim() : '';

    if (!password) {
      return res.status(400).json({ error: 'Debes introducir una contraseña.' });
    }

    const passwordValida = password === DEFAULT_EDITOR_PASSWORD;

    if (!passwordValida) {
      return res.status(401).json({ error: 'Contraseña incorrecta.' });
    }

    const token = generarTokenEditor();
    return res.status(200).json({
      success: true,
      token,
      user: {
        email: body.email || 'pedro@commonpay.local',
        role: 'editor'
      }
    });
  }

  // 2. VERIFICAR SESIÓN (CHECK)
  if (req.method === 'GET' && action === 'check') {
    const isEditor = verificarPeticionEditor(req);
    return res.status(200).json({
      isEditor,
      user: isEditor ? { email: 'pedro@commonpay.local', role: 'editor' } : null
    });
  }

  // 3. CERRAR SESIÓN (LOGOUT)
  if (req.method === 'POST' && action === 'logout') {
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Método o acción no permitida.' });
}
