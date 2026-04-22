export type AuditResponses = Record<string, string | number | boolean | null>;

export interface BaseAudit {
  id: string; // UUID from database
  timestamp: string; // ISO String mapping to "Marca temporal"
  auditor: string; // "Auditor" or "¿Quién audita?"
  area: string; // Derived or explicit (e.g., "Cocina", "Salón")
  auditType: string; // e.g., "COCINA - AUDITORÍA GENERAL"
}

export interface RawAuditRecord extends BaseAudit {
  responses: AuditResponses; // The JSONB column data
}

export type ScoredStatus = "Cumple" | "Alerta" | "No cumple";
export type ScoredColor = "green" | "yellow" | "red";
export type ScoredCompliance = "Sí" | "Parcial" | "No";

export interface NormalizedAudit extends RawAuditRecord {
  score: number; // 0 to 100
  estado: ScoredStatus;
  color: ScoredColor;
  cumplimiento: ScoredCompliance;
}

// For frontend components that still use the flat structure:
// This interface allows backwards compatibility until fully migrated
export interface FlatAuditRecord extends Record<string, any> {
  timestamp: string;
  auditor: string;
  area: string;
  tipo: string; // Maps to auditType
}
