// Audit scoring logic based on PLAN_DASHBOARD_LOOKER_STUDIO specifications

// NOTE: This module is marked for DEPRECATION.
// Scoring logic has been moved to lib/metrics/calculations.ts to properly handle
// variable dynamic configurations as identified in ETAPA 1.2
import { calculateComplianceScore, determineStatus } from "./metrics/calculations";
import { RawAuditRecord, NormalizedAudit } from "./types/audit";

// We now bridge to NormalizedAudit to keep backward compatibility
export interface AuditRecord extends RawAuditRecord {}

export interface ScoredAudit extends NormalizedAudit {
  // Aliases for compatibility
  tipo?: string; 
}

// Score thresholds by area
const THRESHOLDS = {
  cavernas: { meta: 90, alerta: 80 },
  salon: { meta: 85, alerta: 75 },
  cocina: { meta: 85, alerta: 75 },
  inventarios: { meta: 96, alerta: 95 },
  administracion: { meta: 100, alerta: 95 },
};

/**
 * Calculate score for Cavernas audits (Tour, Apertura/Cierre)
 * 7 items on 1-5 scale → average score 0-100%
 */
function scoreCarverasAudit(record: AuditRecord): number {
  const ratingColumns = [
    "Saludó cálidamente",
    "Explicó seguridad",
    "Demuestra conocimiento",
    "Ritmo apropiado",
    "Respondió preguntas",
    "Ambiente seguro",
    "Cierre profesional",
  ];

  const ratings = ratingColumns
    .map((col) => parseInt(record[col]) || 0)
    .filter((r) => r > 0);

  if (ratings.length === 0) return 0;
  const average = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  return (average / 5) * 100;
}

/**
 * Calculate score for Salón audits (Servicio, Operación)
 * Multiple rating scales and yes/no questions
 */
function scoreSalonAudit(record: AuditRecord): number {
  // For Servicio: 8 items on 1-5 scale
  // For Operación: Apertura/Cierre/Limpieza percentages

  if (record.tipo === "Servicio") {
    const ratingColumns = [
      "Presentación",
      "Conocimiento menú",
      "Atención cliente",
      "Eficiencia",
      "Resolución problemas",
      "Comunicación",
      "Limpieza",
      "Profesionalismo",
    ];

    const ratings = ratingColumns
      .map((col) => parseInt(record[col]) || 0)
      .filter((r) => r > 0);

    if (ratings.length === 0) return 0;
    const average = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    return (average / 5) * 100;
  }

  // For Operación: aggregate percentage scores
  if (record.tipo === "Operación") {
    const pcts = [
      parseInt(record["Índice Apertura %"]) || 0,
      parseInt(record["Índice Cierre %"]) || 0,
      parseInt(record["Índice Limpieza %"]) || 0,
    ].filter((p) => p > 0);

    return pcts.length > 0 ? pcts.reduce((a, b) => a + b, 0) / pcts.length : 0;
  }

  return 0;
}

/**
 * Calculate score for Cocina audits (General, Individual)
 * Yes/No questions converted to percentage
 */
function scoreCocinaAudit(record: AuditRecord): number {
  const yesNoFields = Object.entries(record)
    .filter(([key]) => key !== "timestamp" && key !== "auditor")
    .map(([_, value]) => (value === "Sí" || value === "Sí." ? 1 : value === "No" ? 0 : null))
    .filter((val) => val !== null);

  if (yesNoFields.length === 0) return 0;
  const score = (yesNoFields.filter((v) => v === 1).length / yesNoFields.length) * 100;
  return score;
}

/**
 * Calculate score for Inventarios (Precisión %)
 */
function scoreInventariosAudit(record: AuditRecord): number {
  const precision = parseFloat(record["Precisión %"]) || 0;
  return Math.min(100, Math.max(0, precision));
}

/**
 * Calculate score for Administración (Caja, Planilla, Pagos)
 */
function scoreAdministracionAudit(record: AuditRecord): number {
  // For Caja: check if difference is 0
  if (record.tipo === "Caja Sorpresa") {
    const diferencia = parseFloat(record["Diferencia"]) || 0;
    return diferencia === 0 ? 100 : Math.max(0, 100 - Math.abs(diferencia));
  }

  // For Planilla: yes/no questions
  if (record.tipo === "Planilla") {
    const yesNoFields = Object.entries(record)
      .filter(([key]) => !["timestamp", "auditor", "tipo"].includes(key))
      .map(([_, value]) => (value === "Sí" || value === "Sí." ? 1 : 0))
      .filter((val) => val !== null);

    if (yesNoFields.length === 0) return 0;
    return (yesNoFields.filter((v) => v === 1).length / yesNoFields.length) * 100;
  }

  // For Pagos/Proveedores: cumplimiento percentage
  return parseFloat(record["Cumplimiento %"]) || 0;
}

/**
 * Main scoring function - routes to dynamic scorer in calculations.ts
 * @deprecated Use lib/metrics/calculations.ts directly for new components
 */
export function scoreAudit(record: AuditRecord): ScoredAudit {
  const area = record.area || "";
  const auditType = record.auditType || "";

  const score = calculateComplianceScore(record.responses || {}, auditType);
  const { estado, color, cumplimiento } = determineStatus(score, area);

  return {
    ...record,
    tipo: auditType, // Add back for compatibility with older frontend components
    score: Math.round(score),
    cumplimiento,
    estado: estado,
    color: color,
  };
}

/**
 * Calculate week number from date
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Extract date from Google Forms timestamp
 */
export function extractDate(timestamp: string): Date {
  return new Date(timestamp);
}
