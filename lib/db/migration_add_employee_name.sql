-- MIGRACIÓN: Añadir columna employee_name a la tabla audits existente
-- Ejecutar esto en el SQL Editor de Supabase (https://supabase.com → SQL Editor)

-- 1. Añadir la columna (es nullable, no rompe datos existentes)
ALTER TABLE audits ADD COLUMN IF NOT EXISTS employee_name VARCHAR(255) DEFAULT NULL;

-- 2. Crear índice para búsquedas rápidas por colaborador
CREATE INDEX IF NOT EXISTS idx_audits_employee_name ON audits(employee_name);

-- 3. Verificar que la columna fue añadida correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'audits'
ORDER BY ordinal_position;
