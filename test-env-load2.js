const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envPath = path.join(__dirname, ".env.local");
  const envContent = fs.readFileSync(envPath, "utf-8");
  const env = {};

  let currentKey = null;
  let currentValue = "";

  envContent.split("\n").forEach((line) => {
    if (line.includes("=") && !line.trim().startsWith("#")) {
      if (currentKey) {
        env[currentKey] = currentValue.trim();
      }

      const idx = line.indexOf("=");
      currentKey = line.substring(0, idx).trim();
      currentValue = line.substring(idx + 1).trim();

      if (currentValue.startsWith("-----BEGIN")) {
        currentValue = line.substring(idx + 1);
      }
    } else if (currentKey && (line.includes("-----END") || currentValue.includes("-----"))) {
      currentValue += "\n" + line;
      if (line.includes("-----END")) {
        env[currentKey] = currentValue;
        currentKey = null;
        currentValue = "";
      }
    }
  });

  if (currentKey) {
    env[currentKey] = currentValue.trim();
  }

  return env;
}

const env = loadEnv();
let key = env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

console.log("Original key length:", key.length);
console.log("Original has \\n pattern?", key.includes("\n"));

// Check what chars are actually there at position of expected newline
const idx = key.indexOf("-----END");
console.log("\nLast 50 chars:", JSON.stringify(key.slice(idx - 10, idx + 40)));

// The key likely contains quote marks at start/end
if (key.startsWith('"')) {
  key = key.slice(1);
}
if (key.endsWith('"')) {
  key = key.slice(0, -1);
}

console.log("\nAfter removing quotes:");
console.log("Key length:", key.length);

// Check for the actual escape sequence
const hasEscapedNewlines = key.includes("\n");
console.log("Has \\n escape sequence:", hasEscapedNewlines);

if (hasEscapedNewlines) {
  console.log("\nReplacing \\n with actual newlines...");
  key = key.replace(/\n/g, "\n");
  console.log("After replacement - lines:", key.split("\n").length);
  console.log("First 100 chars:", key.substring(0, 100));
  console.log("Last 100 chars:", key.substring(key.length - 100));
}
