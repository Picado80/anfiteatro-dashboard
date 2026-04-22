import type { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";

interface DebugResponse {
  success: boolean;
  actualSheets?: string[];
  expectedSheets?: string[];
  mismatches?: string[];
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<DebugResponse>) {
  try {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKeyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    const sheetId = process.env.GOOGLE_SHEET_ID;

    // Log detailed key info for debugging
    console.log("DEBUG: Service account email:", serviceAccountEmail ? "✓" : "✗");
    console.log("DEBUG: Raw key length:", privateKeyRaw?.length);
    console.log("DEBUG: Key starts with:", privateKeyRaw?.substring(0, 50));
    console.log("DEBUG: Key ends with:", privateKeyRaw?.substring(privateKeyRaw.length - 50));
    console.log("DEBUG: Contains escaped newlines (\\\\n):", privateKeyRaw?.includes("\\n"));
    console.log("DEBUG: Contains real newlines:", privateKeyRaw?.includes("\n"));

    // Try with escaped newlines first, if found
    let privateKey = privateKeyRaw;
    if (privateKeyRaw?.includes("\\n")) {
      console.log("DEBUG: Converting escaped newlines");
      privateKey = privateKeyRaw.replace(/\\n/g, "\n");
    }

    console.log("DEBUG: Final key length:", privateKey?.length);
    console.log("DEBUG: Final key lines:", privateKey?.split("\n").length);
    console.log("DEBUG: Sheet ID:", sheetId ? "✓" : "✗");

    if (!serviceAccountEmail || !privateKey || !sheetId) {
      return res.status(400).json({
        success: false,
        error: "Missing credentials",
      });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: "service_account",
        private_key: privateKey,
        client_email: serviceAccountEmail,
      } as any,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Get spreadsheet metadata to see all sheet names
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });

    const actualSheets = metadata.data.sheets?.map((s) => s.properties?.title || "Unknown") || [];

    const expectedSheets = [
      "Auditoría de Apertura y Cierre - Cavernas",
      "Planilla y Horas - Auditoría",
      "SALÓN - AUDITORÍA DE EXCELENCIA EN SERVICIO",
      "COMPRAS - AUDITORÍA DE CONTROL DE PROVEEDORES",
      "SERVICIO AL CLIENTE - AUDITORÍA DE RESERVAS",
      "COCINA - AUDITORÍA GENERAL",
      "COCINA - AUDITORÍA INDIVIDUAL",
      "EVALUACIÓN - AUDITORÍA DE DESEMPEÑO POR ÁREA",
      "ADMINISTRACIÓN - AUDITORÍA DE CAJA SORPRESA",
      "SALÓN - AUDITORÍA DE OPERACIÓN",
      "OPERACIÓN - AUDITORÍA DE EJECUCIÓN DE EVENTOS",
      "AUDITORÍA DE PAGOS Y FACTURAS",
      "Inventarios - Auditoria",
    ];

    const mismatches = expectedSheets.filter((expected) => !actualSheets.includes(expected));

    res.status(200).json({
      success: true,
      actualSheets,
      expectedSheets,
      mismatches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch sheet metadata",
    });
  }
}
