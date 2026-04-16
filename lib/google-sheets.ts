import { google } from "googleapis";
import { AuditRecord } from "./audit-scoring";

// In-memory cache for audit data
interface CacheEntry {
  data: AuditRecord[];
  timestamp: number;
}

const cache: { [key: string]: CacheEntry } = {};
const CACHE_TTL = (parseInt(process.env.REFRESH_INTERVAL_MINUTES || "15") || 15) * 60 * 1000;

/**
 * Initialize Google Sheets API client with service account credentials
 */
function getAuthenticatedClient() {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!serviceAccountEmail || !privateKey) {
    throw new Error("Missing Google service account credentials in environment variables");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      type: "service_account",
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: privateKey,
      client_email: serviceAccountEmail,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    },
  });

  return google.sheets({ version: "v4", auth });
}

/**
 * Fetch all rows from a specific sheet tab
 */
async function fetchSheetData(sheetName: string): Promise<AuditRecord[]> {
  const cacheKey = `sheet_${sheetName}`;
  const now = Date.now();

  // Check cache
  if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_TTL) {
    return cache[cacheKey].data;
  }

  try {
    const sheets = getAuthenticatedClient();
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!sheetId) {
      throw new Error("Missing GOOGLE_SHEET_ID in environment variables");
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!A:Z`,
    });

    const rows = response.data.values || [];

    if (rows.length === 0) {
      cache[cacheKey] = { data: [], timestamp: now };
      return [];
    }

    // First row is headers
    const headers = rows[0];
    const records: AuditRecord[] = rows.slice(1).map((row) => {
      const record: AuditRecord = {
        timestamp: "",
        auditor: "",
        area: "",
        tipo: "",
      };

      headers.forEach((header: string, index: number) => {
        record[header] = row[index] || "";
      });

      return record;
    });

    // Cache the results
    cache[cacheKey] = { data: records, timestamp: now };
    return records;
  } catch (error) {
    console.error(`Error fetching sheet data for ${sheetName}:`, error);
    // Return cached data if available, even if stale
    if (cache[cacheKey]) {
      return cache[cacheKey].data;
    }
    throw error;
  }
}

/**
 * Sheet name mapping from environment variables
 */
const SHEET_NAMES = {
  cavernasTour: process.env.CAVERNAS_TOUR_SHEET || "Cavernas_Tour",
  cavernasAperturaCierre: process.env.CAVERNAS_APERTURA_CIERRE_SHEET || "Cavernas_AperturaCierre",
  salonServicio: process.env.SALON_SERVICIO_SHEET || "Salón_Servicio",
  salonOperacion: process.env.SALON_OPERACION_SHEET || "Salón_Operación",
  salonEncuestaCliente: process.env.SALON_ENCUESTA_CLIENTE_SHEET || "Salón_EncuestaCliente",
  cocinaGeneral: process.env.COCINA_GENERAL_SHEET || "Cocina_General",
  cocinaIndividual: process.env.COCINA_INDIVIDUAL_SHEET || "Cocina_Individual",
  inventarios: process.env.INVENTARIOS_SHEET || "Inventarios",
  cajaSorpresa: process.env.CAJA_SORPRESA_SHEET || "Caja_Sorpresa",
  planillaHoras: process.env.PLANILLA_HORAS_SHEET || "Planilla_Horas",
  pagoFacturas: process.env.PAGOS_FACTURAS_SHEET || "Pagos_Facturas",
  controlProveedores: process.env.CONTROL_PROVEEDORES_SHEET || "Control_Proveedores",
};

/**
 * Fetch all audit data from all sheets
 */
export async function fetchAllAudits(): Promise<AuditRecord[]> {
  const allRecords: AuditRecord[] = [];

  // Add area and tipo metadata based on sheet name
  const sheetConfigs = [
    { name: SHEET_NAMES.cavernasTour, area: "Cavernas", tipo: "Tour" },
    { name: SHEET_NAMES.cavernasAperturaCierre, area: "Cavernas", tipo: "AperturaCierre" },
    { name: SHEET_NAMES.salonServicio, area: "Salón", tipo: "Servicio" },
    { name: SHEET_NAMES.salonOperacion, area: "Salón", tipo: "Operación" },
    { name: SHEET_NAMES.salonEncuestaCliente, area: "Salón", tipo: "EncuestaCliente" },
    { name: SHEET_NAMES.cocinaGeneral, area: "Cocina", tipo: "General" },
    { name: SHEET_NAMES.cocinaIndividual, area: "Cocina", tipo: "Individual" },
    { name: SHEET_NAMES.inventarios, area: "Inventarios", tipo: "Inventario" },
    { name: SHEET_NAMES.cajaSorpresa, area: "Administración", tipo: "Caja Sorpresa" },
    { name: SHEET_NAMES.planillaHoras, area: "Administración", tipo: "Planilla" },
    { name: SHEET_NAMES.pagoFacturas, area: "Administración", tipo: "Pagos" },
    { name: SHEET_NAMES.controlProveedores, area: "Administración", tipo: "Proveedores" },
  ];

  // Fetch all sheets in parallel
  const results = await Promise.allSettled(
    sheetConfigs.map(async (config) => {
      const data = await fetchSheetData(config.name);
      return data.map((record) => ({
        ...record,
        area: record.area || config.area,
        tipo: record.tipo || config.tipo,
      }));
    })
  );

  // Combine results, handling any failures gracefully
  results.forEach((result) => {
    if (result.status === "fulfilled") {
      allRecords.push(...result.value);
    } else {
      console.error("Failed to fetch sheet data:", result.reason);
    }
  });

  return allRecords;
}

/**
 * Clear cache (useful for manual refresh)
 */
export function clearCache() {
  Object.keys(cache).forEach((key) => delete cache[key]);
}

/**
 * Get cache stats for monitoring
 */
export function getCacheStats() {
  return Object.entries(cache).map(([key, entry]) => ({
    sheet: key,
    cached: true,
    age: Date.now() - entry.timestamp,
    ttl: CACHE_TTL,
    recordCount: entry.data.length,
  }));
}
