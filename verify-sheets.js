const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

// Read .env.local manually with proper handling for quoted values
function loadEnv() {
  const envPath = path.join(__dirname, ".env.local");
  const envContent = fs.readFileSync(envPath, "utf-8");
  const env = {};

  envContent.split("\n").forEach((line) => {
    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith("#")) {
      return;
    }

    // Find the first = sign
    const eqIdx = line.indexOf("=");
    if (eqIdx === -1) {
      return;
    }

    const key = line.substring(0, eqIdx).trim();
    let value = line.substring(eqIdx + 1).trim();

    // Handle quoted values (remove surrounding quotes)
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.substring(1, value.length - 1);
    }

    // For values with escaped newlines (like in quoted PEM keys),
    // JavaScript's file reading has already interpreted \n as actual newlines
    // So we don't need to do any further conversion
    env[key] = value;
  });

  return env;
}

async function verifySheets() {
  const env = loadEnv();
  const serviceAccountEmail = env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  const sheetId = env.GOOGLE_SHEET_ID;

  console.log("Loaded credentials:", {
    email: serviceAccountEmail ? "✓" : "✗",
    privateKey: privateKey ? `✓ (${privateKey.split("\n").length} lines)` : "✗",
    sheetId: sheetId ? "✓" : "✗",
  });

  console.log("DEBUG - Raw key sample:", privateKey?.substring(0, 100));
  console.log("DEBUG - Contains literal backslash-n:", privateKey?.includes("\\n"));
  console.log("DEBUG - Key length before:", privateKey?.length);

  if (!serviceAccountEmail || !privateKey || !sheetId) {
    console.error("Missing credentials");
    process.exit(1);
  }

  // The key has literal \n (two chars: backslash + n) that need conversion to real newlines
  if (privateKey.includes("\\n")) {
    console.log("DEBUG - Converting escaped newlines");
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  console.log("DEBUG - Key length after:", privateKey?.length);
  console.log("DEBUG - Lines after split:", privateKey?.split("\n").length);
  console.log("DEBUG - Key starts with:", privateKey?.substring(0, 30));
  console.log("DEBUG - Key ends with:", privateKey?.substring(privateKey.length - 30));

  const auth = new google.auth.GoogleAuth({
    credentials: {
      type: "service_account",
      private_key: privateKey,
      client_email: serviceAccountEmail,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  try {
    // Get spreadsheet metadata to see all sheet names
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });

    console.log("\n✓ Connected to Google Sheet successfully!\n");
    console.log("Actual sheet names in Google Sheet:\n");
    metadata.data.sheets?.forEach((sheet, idx) => {
      const title = sheet.properties?.title || "Unknown";
      console.log(`${idx + 1}. "${title}"`);
    });

    console.log("\n\nExpected sheet names in code:\n");
    const expectedNames = {
      cavernasAperturaCierre: "Auditoría de Apertura y Cierre - Cavernas",
      planillaHoras: "Planilla y Horas - Auditoría",
      salonServicio: "SALÓN - AUDITORÍA DE EXCELENCIA EN SERVICIO",
      comprasProveedores: "COMPRAS - AUDITORÍA DE CONTROL DE PROVEEDORES",
      servicioClienteReservas: "SERVICIO AL CLIENTE - AUDITORÍA DE RESERVAS",
      cocinaGeneral: "COCINA - AUDITORÍA GENERAL",
      cocinaIndividual: "COCINA - AUDITORÍA INDIVIDUAL",
      evaluacionDesempeno: "EVALUACIÓN - AUDITORÍA DE DESEMPEÑO POR ÁREA",
      cajaSorpresa: "ADMINISTRACIÓN - AUDITORÍA DE CAJA SORPRESA",
      salonOperacion: "SALÓN - AUDITORÍA DE OPERACIÓN",
      operacionEventos: "OPERACIÓN - AUDITORÍA DE EJECUCIÓN DE EVENTOS",
      pagoFacturas: "AUDITORÍA DE PAGOS Y FACTURAS",
      inventarios: "Inventarios - Auditoria",
    };

    Object.entries(expectedNames).forEach(([key, name]) => {
      console.log(`- "${name}"`);
    });

    // Check for matches
    console.log("\n\nMatching results:\n");
    const actualTitles = metadata.data.sheets?.map((s) => s.properties?.title) || [];
    let mismatches = [];
    Object.entries(expectedNames).forEach(([key, expectedName]) => {
      const found = actualTitles.includes(expectedName);
      console.log(`${found ? "✓" : "✗"} "${expectedName}"`);
      if (!found) {
        mismatches.push(expectedName);
      }
    });

    if (mismatches.length > 0) {
      console.log("\n\n⚠ MISMATCHES FOUND! These sheet names don't exist:");
      mismatches.forEach((name) => console.log(`  - "${name}"`));
      console.log("\nLikely matches:");
      mismatches.forEach((expected) => {
        const similar = actualTitles.find((actual) =>
          actual?.toLowerCase().includes(expected.toLowerCase().split("-")[0].trim())
        );
        if (similar) {
          console.log(`  "${expected}" → "${similar}"`);
        }
      });
    } else {
      console.log("\n\n✓ All sheet names match!");
    }
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

verifySheets();
