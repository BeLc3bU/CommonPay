/**
 * API Serverless Function en Vercel para Keep-Alive de Supabase.
 * Realiza una consulta liviana a la base de datos de Supabase para evitar
 * que el proyecto gratuito se pause automáticamente por inactividad (tras 7 días).
 */
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(400).json({
      status: 'error',
      message: 'Las variables de entorno SUPABASE_URL y/o SUPABASE_ANON_KEY no están configuradas.'
    });
  }

  try {
    // Petición REST directa a la tabla configuracion (limit 1) para registrar actividad en Supabase
    const response = await fetch(`${supabaseUrl}/rest/v1/configuracion?select=id&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error en respuesta de Supabase: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return res.status(200).json({
      status: 'success',
      message: 'Ping de mantenimiento ejecutado con éxito. Supabase se mantendrá activo.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error durante el ping de Supabase:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
