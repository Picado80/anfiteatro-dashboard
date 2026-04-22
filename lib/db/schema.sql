-- ESQUEMA DE BASE DE DATOS (ETAPA 1.2 & 2.2)
-- Para ser ejecutado en Supabase (PostgreSQL)

-- Activar extensión UUID si no está activa
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla principal de auditorías
CREATE TABLE audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    timestamp TIMESTAMPTZ NOT NULL,    -- "Marca temporal"
    auditor VARCHAR(255),              -- "¿Quién audita?" (puede ser null si no viene en el form)
    employee_name VARCHAR(255),        -- "Nombre del colaborador evaluado" (para equipos multi-persona)
    area VARCHAR(255) NOT NULL,        -- "Área", e.g., "Cocina", "Salón", "Cavernas"
    audit_type VARCHAR(255) NOT NULL,  -- e.g., "COCINA - AUDITORÍA GENERAL"
    responses JSONB NOT NULL DEFAULT '{}'::jsonb, -- Resto de respuestas (varían por formulario)
    raw_score NUMERIC(5,2),            -- Resultado numérico pre-calculado 0-100

    -- Constraints
    CONSTRAINT valid_score CHECK (raw_score IS NULL OR (raw_score >= 0 AND raw_score <= 100)),
    CONSTRAINT unique_audit UNIQUE(timestamp, auditor, area, audit_type)
);

-- Índices para audits
CREATE INDEX idx_audits_responses ON audits USING gin (responses);
CREATE INDEX idx_audits_timestamp ON audits(timestamp);
CREATE INDEX idx_audits_area ON audits(area);
CREATE INDEX idx_audits_auditor ON audits(auditor);
CREATE INDEX idx_audits_audit_type ON audits(audit_type);
CREATE INDEX idx_audits_employee_name ON audits(employee_name); -- Para filtrar por colaborador

-- COMENTARIOS/NOTAS SOBRE RLS (Row Level Security) - ETAPA 2.3
-- ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
-- (Aquí posteriormente se añadirán políticas para Wendy, Líderes y Benito)

-- Tabla de Líderes
CREATE TABLE leaders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'lider' -- 'admin', 'wendy', 'lider', 'benito'
);

-- Tabla de Áreas
CREATE TABLE areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    leader_id UUID REFERENCES leaders(id) ON DELETE SET NULL
);

-- Tabla de Compromisos Semanales
CREATE TABLE compromises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    leader_id UUID REFERENCES leaders(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    estimated_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'blocked'
    progress_notes TEXT,
    week_number INTEGER,
    year INTEGER
);

-- Índices para compromisos
CREATE INDEX idx_compromises_leader_id ON compromises(leader_id);
CREATE INDEX idx_compromises_status ON compromises(status);
CREATE INDEX idx_areas_leader_id ON areas(leader_id);
