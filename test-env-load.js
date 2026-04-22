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
const key = env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

console.log("Raw key length:", key.length);
console.log("First 100 chars:", key.substring(0, 100));
console.log("Contains literal backslash-n:", key.includes("\n"));
console.log("Contains actual newlines:", key.includes("\n"));

// Try to see what we have
if (key.includes("\n")) {
  console.log("\nKey contains literal \n - need to replace");
  const converted = key.replace(/\n/g, "\n");
  console.log("After replacement - lines:", converted.split("\n").length);
  console.log("First 100 after replacement:", converted.substring(0, 100));
}
