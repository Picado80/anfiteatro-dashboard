import type { NextApiRequest, NextApiResponse } from "next";
import { getServiceSupabase } from "../../lib/database";

/**
 * Endpoint de limpieza: elimina duplicados en la tabla audits.
 * Un duplicado se define como registros con el mismo (timestamp, auditor, area, audit_type).
 * Mantiene solo el registro con el ID más bajo (el primero insertado).
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const supabase = getServiceSupabase();

    // 1. Traer todos los registros
    const { data: records, error } = await supabase
      .from("audits")
      .select("id, timestamp, auditor, area, audit_type")
      .order("id", { ascending: true });

    if (error) throw error;
    if (!records || records.length === 0) {
      return res.status(200).json({ success: true, message: "No records found", deleted: 0 });
    }

    // 2. Agrupar por timestamp únicamente — no pueden existir dos registros con el mismo timestamp
    const seen = new Map<string, string>(); // timestamp -> first id to keep
    const toDelete: string[] = [];

    for (const record of records) {
      const key = record.timestamp; // La marca temporal es la única llave real
      
      if (seen.has(key)) {
        toDelete.push(record.id);
      } else {
        seen.set(key, record.id);
      }
    }

    if (toDelete.length === 0) {
      return res.status(200).json({ success: true, message: "No duplicates found", deleted: 0 });
    }

    // 3. Eliminar duplicados
    const { error: deleteError } = await supabase
      .from("audits")
      .delete()
      .in("id", toDelete);

    if (deleteError) throw deleteError;

    return res.status(200).json({
      success: true,
      message: `Deleted ${toDelete.length} duplicate records`,
      deleted: toDelete.length,
      remaining: records.length - toDelete.length
    });

  } catch (error: any) {
    console.error("Cleanup error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
