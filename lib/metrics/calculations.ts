import { AuditResponses, ScoredStatus, ScoredColor, ScoredCompliance } from "../types/audit";

// Thresholds for the areas (can be expanded later)
export const THRESHOLDS = {
  cavernas: { meta: 90, alerta: 80 },
  salon: { meta: 85, alerta: 75 },
  cocina: { meta: 85, alerta: 75 },
  inventarios: { meta: 96, alerta: 95 },
  administracion: { meta: 100, alerta: 95 },
  default: { meta: 85, alerta: 75 }
};

/**
 * Calculates a compliance score (0-100) based on the JSON responses.
 * Since fields vary per audit format, this dynamically checks standard values:
 * - "Sí", "Si", "SI" -> 100%
 * - "No", "NO" -> 0%
 * - "Mas o menos", "No Completo", "Parcial" -> 50%
 * - Numeric strings ("1"-"5") -> scaled to percentage
 * - Empty, "N/A", null -> ignored (does not affect denominator)
 * 
 * If no scorable responses are found, returns 0.
 */
export function calculateComplianceScore(responses: AuditResponses, auditType: string = ""): number {
  let totalScore = 0;
  let scorableFields = 0;

  for (const [key, rawValue] of Object.entries(responses)) {
    // Ignore internal or known text-only fields
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes("marca temporal") ||
      lowerKey.includes("observacion") ||
      lowerKey.includes("observación") ||
      lowerKey.includes("detalle") ||
      lowerKey.includes("problema") ||
      lowerKey.includes("audita") ||
      lowerKey.includes("fecha") ||
      lowerKey.includes("proveedor") ||
      lowerKey.includes("nombre") ||
      lowerKey.includes("semana") ||
      lowerKey.includes("área")
    ) {
      continue;
    }

    if (rawValue === null || rawValue === undefined || rawValue === "") continue;
    
    let value = String(rawValue).trim().toLowerCase();
    
    if (value === "n/a" || value === "no aplica" || value === "na") {
      continue;
    }
    
    if (value === "sí" || value === "si" || value === "s" || value === "true" || value === "aprobado") {
      totalScore += 100;
      scorableFields += 1;
    } else if (value === "no" || value === "falso" || value === "false" || value === "rechazado" || value === "no cumplio") {
      totalScore += 0;
      scorableFields += 1;
    } else if (value === "mas o menos" || value === "no completo" || value === "parcial" || value === "hay diferencia") {
      totalScore += 50; 
      scorableFields += 1;
    } else if (value === "sobre paso" || value === "sobrepaso") {
      totalScore += 100;
      scorableFields += 1;
    } else if (value === "cumplio" || value === "cumplió") {
      totalScore += 100;
      scorableFields += 1;
    } else {
      // Try to parse numeric scales (e.g., 1 to 5)
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        // Assume maximum is 5 if value is <= 5, if percentages then <= 100
        if (numValue <= 5) {
          totalScore += (numValue / 5) * 100;
        } else if (numValue <= 10) {
          totalScore += (numValue / 10) * 100;
        } else if (numValue <= 100) {
          totalScore += numValue;
        } else {
          // If > 100 (e.g. quantity of something), skip scoring unless we have specific logic
          continue;
        }
        scorableFields += 1;
      }
    }
  }

  // Si se trata de auditoría de Diferencia (Caja Sorpresa), un "No" en diferencia significa Cumple.
  if (auditType.toLowerCase().includes("caja sorpresa")) {
      const isOk = Object.values(responses).some(val => 
          String(val).toLowerCase() === "no" || 
          String(val).toLowerCase() === "0"
      );
      // Simplify logic for this specific one if it requires it, but for now fallback to the iteration.
  }

  if (scorableFields === 0) return 0;
  return totalScore / scorableFields;
}

/**
 * Determines the status, color, and compliance label based on a score and area
 */
export function determineStatus(score: number, areaName: string): { estado: ScoredStatus, color: ScoredColor, cumplimiento: ScoredCompliance } {
  const normArea = areaName.toLowerCase();
  
  let thresholdKey = "default";
  for (const key of Object.keys(THRESHOLDS)) {
    if (normArea.includes(key)) {
      thresholdKey = key;
      break;
    }
  }
  
  const thresh = THRESHOLDS[thresholdKey as keyof typeof THRESHOLDS] || THRESHOLDS.default;

  if (score >= thresh.meta) {
    return { estado: "Cumple", color: "green", cumplimiento: "Sí" };
  } else if (score >= thresh.alerta) {
    return { estado: "Alerta", color: "yellow", cumplimiento: "Parcial" };
  } else {
    return { estado: "No cumple", color: "red", cumplimiento: "No" };
  }
}
