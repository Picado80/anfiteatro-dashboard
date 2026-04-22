-- ESQUEMA DE BASE DE DATOS (ETAPA 1.2 & 2.2)
-- Para ser ejecutado en Supabase (PostgreSQL)

-- Activar extensión UUID si no está activa
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla principal de auditorías
CREATE TABLE audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    timestamp TIMESTAMPTZ NOT NULL,   -- "Marca temporal"
    auditor VARCHAR(255) NOT NULL,    -- "¿Quién audita?"
    area VARCHAR(255) NOT NULL,       -- "Área", e.g., "Cocina", "Salón"
    audit_type VARCHAR(255) NOT NULL, -- e.g., "COCINA - AUDITORÍA GENERAL"
    responses JSONB NOT NULL DEFAULT '{}'::jsonb, -- Resto de respuestas (varían por formulario)
    raw_score NUMERIC(5,2),           -- (Opcional) Resultado numérico pre-calculado 0-100 si se desea persistir
    
    -- Índices para mejorar velocidad de las vistas del dashboard (ETAPA 3, 4, 6)
    CONSTRAINT valid_score CHECK (raw_score IS NULL OR (raw_score >= 0 AND raw_score <= 100))
);

-- Índices jsonb para filtrado dinámico profundo si llega a ser necesario
CREATE INDEX idx_audits_responses ON audits USING gin (responses);

-- Índices convencionales para filtrados por fecha, área y auditor
CREATE INDEX idx_audits_timestamp ON audits(timestamp);
CREATE INDEX idx_audits_area ON audits(area);
CREATE INDEX idx_audits_auditor ON audits(auditor);
CREATE INDEX idx_audits_audit_type ON audits(audit_type);

-- COMENTARIOS/NOTAS SOBRE RLS (Row Level Security) - ETAPA 2.3
-- ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
-- (Aquí posteriormente se añadirán políticas para Wendy, Líderes y Benito)
