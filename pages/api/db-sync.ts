import type { NextApiRequest, NextApiResponse } from "next";
import { fetchAllAudits } from "../../lib/google-sheets";
import { getServiceSupabase } from "../../lib/database";
import { calculateComplianceScore } from "../../lib/metrics/calculations";
import { DbAudit } from "../../lib/db-schema";

/**
 * Normaliza el nombre del área basado en el tipo de auditoría.
 */
function normalizeArea(area: string, auditType: string): string {
  const type = auditType.toUpperCase();
  if (
    type.includes("EJECUCIÓN DE EVENTOS") ||
    type.includes("AUDITORÍA DE RESERVAS") ||
    type.includes("ENCUESTA DE SERVICIO") ||
    area.toUpperCase() === "OPERACIÓN"
  ) {
    return "Servicio al Cliente";
  }
  return area;
}

/**
 * Detecta el nombre del colaborador EVALUADO en las respuestas del formulario.
 *
 * Campos conocidos por formulario:
 *   - Salón (Excelencia en Servicio): "Mesero auditado?"
 *   - Cocina (Auditoría Individual):   "Colaborador auditado"
 *   - Cavernas: campo con "guía" o "colaborador"
 *
 * La función distingue entre EVALUADOR ("¿Quién audita?") y EVALUADO ("Mesero auditado").
 * Retorna null si no encuentra el campo (el formulario aún no lo tiene).
 */
function extractEmployeeName(responses: Record<string, any>): string | null {
  // Campos que identifican AL EVALUADO (voz pasiva, campos específicos conocidos)
  const EVALUADO_KEYWORDS = [
    // Campos exactos conocidos de los formularios actuales
    "mesero auditado",
    "colaborador auditado",
    "guía auditado",
    "guia auditado",
    "empleado auditado",
    // Términos genéricos de persona evaluada
    "mesero",
    "colaborador",
    "guía evaluado",
    "guia evaluado",
    "empleado evaluado",
    "trabajador",
    "nombre del colaborador",
    "nombre del guía",
    "nombre del empleado",
    "nombre del mesero",
  ];

  // Campos que identifican AL EVALUADOR (quien llena el form — excluir estos)
  const EVALUADOR_KEYWORDS = [
    "quién audita",
    "quien audita",
    "quién realiza",
    "quien realiza",
    "nombre del auditor",
    "lider",
    "líder",
  ];

  // Prioridad 1: campos con "auditado" en el nombre (voz pasiva = el evaluado)
  for (const [key, value] of Object.entries(responses)) {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes("auditado") && value && String(value).trim().length > 0) {
      return String(value).trim();
    }
  }

  // Prioridad 2: campos que coincidan con keywords del evaluado (excluyendo evaluadores)
  for (const [key, value] of Object.entries(responses)) {
    const lowerKey = key.toLowerCase();

    // Saltar si es claramente el evaluador
    if (EVALUADOR_KEYWORDS.some((kw) => lowerKey.includes(kw))) continue;

    if (EVALUADO_KEYWORDS.some((kw) => lowerKey.includes(kw))) {
      if (value && String(value).trim().length > 0) {
        return String(value).trim();
      }
    }
  }

  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Solo permitir POST o GET (para CRON jobs)
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Opcional: Proteger con un API Key si es llamado externamente
  const authHeader = req.headers.authorization;
  const expectedAuth = `Bearer ${process.env.CRON_SECRET || ""}`;
  
  if (process.env.CRON_SECRET && authHeader !== expectedAuth) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const supabase = getServiceSupabase();
    
    // 1. Obtener datos crudos de todas las pestañas
    const rawRecords = await fetchAllAudits();
    
    if (!rawRecords || rawRecords.length === 0) {
      return res.status(200).json({ message: "No records found in Google Sheets" });
    }

    // 2. Mapear a la estructura de la base de datos
    const auditsToUpsert: Omit<DbAudit, "id" | "created_at">[] = rawRecords.map(record => {
      // Calcular score (esto opcionalmente se puede hacer directo en frontend, pero guardarlo acelera querys)
      const score = calculateComplianceScore(record.responses, record.auditType);
      
      let parsedTimestamp = new Date().toISOString();
      try {
        if (record.timestamp) {
           // Asume que la fecha de Google Sheets puede ser parseada
           const d = new Date(record.timestamp);
           if (!isNaN(d.getTime())) {
               parsedTimestamp = d.toISOString();
           }
        }
      } catch(e) {
          console.warn("Invalid timestamp parsing for:", record.timestamp);
      }

      const normalizedArea = normalizeArea(record.area, record.auditType || "");
      const employeeName = extractEmployeeName(record.responses);

      return {
        timestamp: parsedTimestamp,
        auditor: record.auditor || null,
        employee_name: employeeName,
        area: normalizedArea,
        audit_type: record.auditType,
        responses: record.responses,
        raw_score: score
      };
    });

    // 3. Upsert a Supabase
    // Como Google Forms no nos da un UUID único predecible y la combinación
    // (timestamp + auditor + area) puede ser nuestra llave lógica, 
    // lo ideal sería hacer insert si no existe. 
    // Como Supabase upsert requiere una constraint de unicidad (ON CONFLICT),
    // y no la tenemos, buscaremos los existentes basándonos en fechas recientes
    // para evitar hacer un GET total, o más simple: insertar e ignorar conflictos si agregamos una constraint.
    // 
    // POR AHORA: Insertamos y dejamos que el dashboard consolide o, si añadimos un hash id, upsert:
    // NOTA PARA EL USUARIO: Si quieres upsert real sin duplicados, hay que agregar un UNIQUE constraint
    // en schema.sql como: UNIQUE(timestamp, auditor, area, audit_type).
    // Asumiremos que este script se llama periódicamente para traer *solo* lo nuevo 
    // (para lo cual se debería cambiar fetchAllAudits a algo con límite temporal),
    // pero por ahora hacemos un simple insert-ignore para toda la data si la restricción existe, 
    // O limpiar y recargar (riesgoso).
    
    // Solución simplificada para Fase 1: Limpiar y re-insertar o insertar con ON CONFLICT
    // IMPORTANTE: Requiere ejecutar ALTER TABLE audits ADD CONSTRAINT unique_audit UNIQUE(timestamp, auditor, area, audit_type);
    
    const { data, error } = await supabase
      .from("audits")
      .upsert(
        auditsToUpsert as any, 
        { onConflict: 'timestamp,auditor,area,audit_type', ignoreDuplicates: true }

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    return res.status(200).json({ 
      success: true, 
      message: "Sync completed", 
      synced_records: auditsToUpsert.length 
    });

  } catch (error: any) {
    console.error("Sync error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Sync failed", 
      error: error.message 
    });
  }
}
