import type { NextApiRequest, NextApiResponse } from "next";
import { getServiceSupabase } from "../../lib/database";
import { determineStatus } from "../../lib/metrics/calculations";
import { ScoredAudit } from "../../lib/audit-scoring";

/**
 * Normaliza el área para compatibilidad con datos históricos en Supabase.
 * Aplica las mismas reglas que db-sync.ts para consistencia.
 */
function normalizeArea(area: string, auditType: string): string {
  const type = (auditType || "").toUpperCase();
  if (
    type.includes("EJECUCIÓN DE EVENTOS") ||
    type.includes("AUDITORÍA DE RESERVAS") ||
    type.includes("ENCUESTA DE SERVICIO") ||
    (area || "").toUpperCase() === "OPERACIÓN"
  ) {
    return "Servicio al Cliente";
  }
  return area;
}

interface ApiResponse {
  success: boolean;
  data?: ScoredAudit[];
  error?: string;
  timestamp?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const supabase = getServiceSupabase();

    // Fetch all audits from Supabase, ordered by date
    const { data: records, error } = await supabase
      .from("audits")
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) {
      throw error;
    }

    // Map to ScoredAudit format expected by the frontend
    const scoredAudits: ScoredAudit[] = (records || []).map((record) => {
      // Normalize area (handles historical records with wrong area like 'Operación')
      const area = normalizeArea(record.area || "", record.audit_type || "");

      // Re-calculate the exact state based on the raw_score and normalized area
      const score = Number(record.raw_score || 0);
      const { estado, color, cumplimiento } = determineStatus(score, area);

      return {
        timestamp: record.timestamp,
        auditor: record.auditor || null,
        employee_name: (record as any).employee_name || null, // Campo colaborador evaluado
        area: area,
        auditType: record.audit_type,
        tipo: record.audit_type,
        responses: record.responses || {},
        score: Math.round(score),
        cumplimiento,
        estado,
        color,
      };
    });

    res.status(200).json({
      success: true,
      data: scoredAudits,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch audit data from Supabase",
      timestamp: new Date().toISOString(),
    });
  }
}
