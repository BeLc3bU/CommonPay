/**
 * API Serverless Function en Vercel
 * Devuelve la URL y la Anon Key de Supabase configuradas en las variables de entorno de Vercel.
 */
export default function handler(req, res) {
  // Evitar almacenamiento en caché para garantizar que siempre lea valores actualizados si cambian
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

  return res.status(200).json({
    supabaseUrl,
    supabaseAnonKey
  });
}
