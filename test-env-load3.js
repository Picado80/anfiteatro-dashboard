const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");

// Find the GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY line
const keyLine = envContent.split("\n").find(l => l.startsWith("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="));

if (keyLine) {
  console.log("Key line starts with:", keyLine.substring(0, 100));
  console.log("Key line contains = at index:", keyLine.indexOf("="));
  
  const idx = keyLine.indexOf("=");
  let value = keyLine.substring(idx + 1);
  
  console.log("\nRaw value length:", value.length);
  console.log("First 100 of raw value:", value.substring(0, 100));
  
  // Check for quotes
  if (value.startsWith('"')) {
    console.log("Value starts with quote");
    value = value.slice(1);
  }
  if (value.endsWith('"')) {
    console.log("Value ends with quote");
    value = value.slice(0, -1);
  }
  
  console.log("\nAfter quote removal, length:", value.length);
  
  // Now check for the escape sequence
  console.log("Checking for escape sequences...");
  
  // Look for backslash character
  const hasBackslash = value.includes("\\");
  console.log("Contains backslash char:", hasBackslash);
  
  // Find position of first \n
  const backslashNIndex = value.indexOf("\n");
  console.log("Index of \\n:", backslashNIndex);
  
  if (backslashNIndex > -1) {
    console.log("Found \\n at position", backslashNIndex);
    console.log("Chars around it:", JSON.stringify(value.substring(backslashNIndex - 5, backslashNIndex + 10)));
    
    // Try replacement
    const converted = value.replace(/\n/g, "\n");
    console.log("\nAfter replace - lines:", converted.split("\n").length);
    console.log("First 100 chars:", converted.substring(0, 100));
  }
}
