/**
 * CONFIGURACIÓN CENTRAL DEL SISTEMA DE ALERTAS
 * Anfiteatro Villa — Sistema de Auditorías
 *
 * Basado en documento: "ASIGNACIÓN DE RESPONSABLES - AUDITORÍAS ANFITEATRO"
 * Versión Final — Febrero 2025
 */

// ─── Correos de Destinatarios ────────────────────────────────────────────────
export const ALERT_RECIPIENTS = {
  wendy: "wenconcol@gmail.com",
  benito: "donbenito68@hotmail.com",
};

// ─── Umbrales de Desempeño ───────────────────────────────────────────────────
export const SCORE_THRESHOLDS = {
  cumple: 85,       // 85%+ = Cumple meta
  alerta: 75,       // 75-84% = En alerta
  // <75% = No cumple
};

export const RED_FLAG_MONTHS = 2; // Meses consecutivos bajo meta para bandera roja
export const NEGATIVE_RESPONSE_RATE = 0.5; // 50% de respuestas negativas = alerta

// ─── Frecuencias Esperadas de Auditoría ──────────────────────────────────────
// Fuente: Documento de asignación final (Febrero 2025)
export interface AuditFrequencyConfig {
  label: string;
  responsibles: string[];         // Auditores esperados (titular o backup)
  weeklyTarget?: number;          // Auditorías esperadas POR SEMANA
  monthlyTarget?: number;         // Auditorías esperadas POR MES (si es mensual)
  periodType: "weekly" | "monthly";
  notes?: string;
}

export const AUDIT_FREQUENCIES: Record<string, AuditFrequencyConfig> = {
  // ── Cavernas ──────────────────────────────────────────────────────────────
  "Cavernas": {
    label: "Cavernas (Tour + Apertura + Cierre)",
    responsibles: ["Raquel"],
    weeklyTarget: 6,              // 2 Tour + 2 Apertura + 2 Cierre
    periodType: "weekly",
    notes: "Raquel: 2 tours + 2 aperturas + 2 cierres por semana",
  },

  // ── Salón ─────────────────────────────────────────────────────────────────
  "Salón": {
    label: "Salón (Operación mínimo base)",
    responsibles: ["Capitán"],
    weeklyTarget: 3,              // 3 Operación/semana (mínimo base sin contar Servicio variable)
    periodType: "weekly",
    notes: "Capitán: 3 operaciones/semana. Servicio: 2/salonero/semana (variable según equipo)",
  },

  // ── Cocina ────────────────────────────────────────────────────────────────
  "Cocina": {
    label: "Cocina (General mínimo base)",
    responsibles: ["Michael"],
    weeklyTarget: 2,              // 2 General/semana (Individual varía por colaborador)
    periodType: "weekly",
    notes: "Michael: 2 generales + 2 por colaborador individual por semana",
  },

  // ── Inventarios ───────────────────────────────────────────────────────────
  "Inventarios": {
    label: "Inventarios",
    responsibles: ["Yeiruska"],
    weeklyTarget: 1,
    periodType: "weekly",
    notes: "Yeiruska: 1-2 auditorías semanales",
  },

  // ── Administración ────────────────────────────────────────────────────────
  "Administración": {
    label: "Administración (Planilla + Caja Sorpresa)",
    responsibles: ["Wendy"],
    weeklyTarget: 4,              // 1 Planilla + 3 Caja Sorpresa
    periodType: "weekly",
    notes: "Wendy: 1 planilla semanal + 3 cajas sorpresa/semana",
  },

  // ── Servicio al Cliente ───────────────────────────────────────────────────
  "Servicio al Cliente": {
    label: "Servicio al Cliente (Reservas + Eventos)",
    responsibles: ["Stephanie", "Mariela"],
    monthlyTarget: 2,             // 1 Reservas + 1 Eventos por mes
    periodType: "monthly",
    notes: "Mariela audita mensual: 1 Reservas + 1 Eventos",
  },
};

// ─── Respuestas que cuentan como NEGATIVAS ────────────────────────────────────
// El sistema buscará estas respuestas en el JSONB de responses
export const NEGATIVE_RESPONSE_VALUES = [
  "no",
  "no cumple",
  "incompleto",
  "mal",
  "deficiente",
  "no aplica",
  "false",
  "0",
  "❌",
  "×",
];

// ─── Respuestas que cuentan como POSITIVAS ────────────────────────────────────
export const POSITIVE_RESPONSE_VALUES = [
  "sí",
  "si",
  "cumple",
  "completo",
  "bien",
  "excelente",
  "true",
  "1",
  "✓",
  "✅",
];
