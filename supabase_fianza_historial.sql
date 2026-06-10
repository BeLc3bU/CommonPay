-- ========================================================
-- SCRIPT DE BASE DE DATOS PARA SUPABASE
-- CREACIÓN DE LA TABLA FIANZA_HISTORIAL Y POLÍTICAS RLS
-- ========================================================

-- 1. Crear la tabla de historial si no existe
CREATE TABLE IF NOT EXISTS "public"."fianza_historial" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "fecha" timestamptz DEFAULT now() NOT NULL,
  "concepto" text NOT NULL,
  "importe" numeric(10, 2) NOT NULL,
  "acumulado_despues" numeric(10, 2) NOT NULL
);

-- 2. Habilitar la seguridad a nivel de fila (RLS)
ALTER TABLE "public"."fianza_historial" ENABLE ROW LEVEL SECURITY;

-- 3. Crear política para permitir la lectura pública
-- Esto permite que cualquier visitante (incluso en modo de solo lectura) pueda ver la tabla
CREATE POLICY "Permitir lectura pública de fianza_historial" 
ON "public"."fianza_historial" 
FOR SELECT 
USING (true);

-- 4. Crear política para permitir la gestión completa a usuarios autenticados (editores)
CREATE POLICY "Permitir gestión de fianza_historial a editores" 
ON "public"."fianza_historial" 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
