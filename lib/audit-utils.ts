import { ScoredAudit } from "./audit-scoring";

/**
 * Group audits by area
 */
export function groupByArea(audits: ScoredAudit[]): Record<string, ScoredAudit[]> {
  return audits.reduce(
    (acc, audit) => {
      const area = audit.area || "Unknown";
      if (!acc[area]) acc[area] = [];
      acc[area].push(audit);
      return acc;
    },
    {} as Record<string, ScoredAudit[]>
  );
}

/**
 * Calculate area summary statistics
 */
export function calculateAreaSummary(
  audits: ScoredAudit[]
): Record<string, { avgScore: number; cumpleCount: number; alertaCount: number; total: number }> {
  const byArea = groupByArea(audits);
  const summary: Record<string, any> = {};

  Object.entries(byArea).forEach(([area, records]) => {
    const avgScore = records.length > 0 ? Math.round(records.reduce((a, b) => a + b.score, 0) / records.length) : 0;
    const cumpleCount = records.filter((r) => r.estado === "Cumple").length;
    const alertaCount = records.filter((r) => r.estado === "Alerta").length;

    summary[area] = {
      avgScore,
      cumpleCount,
      alertaCount,
      total: records.length,
    };
  });

  return summary;
}

/**
 * Filter audits by date range
 */
export function filterByDateRange(audits: ScoredAudit[], startDate: Date, endDate: Date): ScoredAudit[] {
  return audits.filter((audit) => {
    const auditDate = new Date(audit.timestamp);
    return auditDate >= startDate && auditDate <= endDate;
  });
}

/**
 * Get audits from the last N days
 */
export function getLastNDays(audits: ScoredAudit[], days: number): ScoredAudit[] {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  return filterByDateRange(audits, startDate, endDate);
}

/**
 * Group audits by auditor/person
 */
export function groupByAuditor(audits: ScoredAudit[]): Record<string, ScoredAudit[]> {
  return audits.reduce(
    (acc, audit) => {
      const auditor = audit.auditor || "Unknown";
      if (!acc[auditor]) acc[auditor] = [];
      acc[auditor].push(audit);
      return acc;
    },
    {} as Record<string, ScoredAudit[]>
  );
}

/**
 * Get audits by area and tipo
 */
export function filterByAreaAndTipo(audits: ScoredAudit[], area: string, tipo?: string): ScoredAudit[] {
  return audits.filter((audit) => {
    const areaMatch = audit.area?.toLowerCase() === area.toLowerCase();
    if (!tipo) return areaMatch;
    return areaMatch && audit.tipo?.toLowerCase() === tipo.toLowerCase();
  });
}

/**
 * Calculate compliance percentage for a set of audits
 */
export function calculateCompliance(audits: ScoredAudit[]): number {
  if (audits.length === 0) return 0;
  const cumple = audits.filter((a) => a.estado === "Cumple").length;
  return Math.round((cumple / audits.length) * 100);
}

/**
 * Get all unique auditors
 */
export function getAuditors(audits: ScoredAudit[]): string[] {
  const auditors = new Set<string>();
  audits.forEach((audit) => {
    if (audit.auditor) auditors.add(audit.auditor);
  });
  return Array.from(auditors).sort();
}

/**
 * Get all unique areas
 */
export function getAreas(audits: ScoredAudit[]): string[] {
  const areas = new Set<string>();
  audits.forEach((audit) => {
    if (audit.area) areas.add(audit.area);
  });
  return Array.from(areas).sort();
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-CR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Get color based on compliance status
 */
export function getStatusColor(estado: string): string {
  switch (estado) {
    case "Cumple":
      return "green";
    case "Alerta":
      return "yellow";
    case "No cumple":
      return "red";
    default:
      return "gray";
  }
}
