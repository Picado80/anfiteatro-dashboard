// Audit scoring logic based on PLAN_DASHBOARD_LOOKER_STUDIO specifications

export interface AuditRecord {
  timestamp: string;
  auditor: string;
  area: string;
  tipo: string;
  [key: string]: any;
}

export interface ScoredAudit extends AuditRecord {
  score: number;
  cumplimiento: string;
  estado: "Cumple" | "No cumple" | "Alerta";
  color: "green" | "yellow" | "red";
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
    .filter(([key, value]) => key !== "timestamp" && key !== "auditor")
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
 * Main scoring function - routes to appropriate scorer
 */
export function scoreAudit(record: AuditRecord): ScoredAudit {
  const area = record.area?.toLowerCase() || "";
  const tipo = record.tipo?.toLowerCase() || "";

  let score = 0;

  if (area.includes("caverna")) {
    score = scoreCarverasAudit(record);
  } else if (area.includes("salón") || area.includes("salon")) {
    score = scoreSalonAudit(record);
  } else if (area.includes("cocina")) {
    score = scoreCocinaAudit(record);
  } else if (area.includes("inventario")) {
    score = scoreInventariosAudit(record);
  } else if (area.includes("admin")) {
    score = scoreAdministracionAudit(record);
  }

  // Determine status based on thresholds
  const areaThreshold = THRESHOLDS[area as keyof typeof THRESHOLDS] || THRESHOLDS.administracion;

  let estado: "Cumple" | "No cumple" | "Alerta" = "No cumple";
  let color: "green" | "yellow" | "red" = "red";
  let cumplimiento = "No";

  if (score >= areaThreshold.meta) {
    estado = "Cumple";
    color = "green";
    cumplimiento = "Sí";
  } else if (score >= areaThreshold.alerta) {
    estado = "Alerta";
    color = "yellow";
    cumplimiento = "Parcial";
  }

  return {
    ...record,
    score: Math.round(score),
    cumplimiento,
    estado,
    color,
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
