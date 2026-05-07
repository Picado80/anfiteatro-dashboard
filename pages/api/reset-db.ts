import type { NextApiRequest, NextApiResponse } from "next";
import { getServiceSupabase } from "../../lib/database";

/**
 * Borra TODOS los registros de la tabla audits para permitir un re-sync limpio.
 * Solo debe usarse cuando haya duplicados o corrupción de datos.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const supabase = getServiceSupabase();

    // Contar antes de borrar
    const { count: before } = await supabase
      .from("audits")
      .select("*", { count: "exact", head: true });

    // Borrar TODOS los registros
    const { error } = await supabase
      .from("audits")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // truco para borrar todo

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: `Base de datos limpiada. Registros borrados: ${before}. Ahora corre /api/db-sync para recargar.`,
      deleted: before,
    });
  } catch (error: any) {
    console.error("Reset error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
