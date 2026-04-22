const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");

const keyLine = envContent.split("\n").find(l => l.startsWith("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="));
const idx = keyLine.indexOf("=");
let value = keyLine.substring(idx + 1);

// Remove quotes
value = value.slice(1, -1);

console.log("Looking for actual newline sequences...");

// Find where we expect the first newline (after BEGIN)
const beginIdx = value.indexOf("-----BEGIN PRIVATE KEY-----");
const afterBegin = value.substring(beginIdx + "-----BEGIN PRIVATE KEY-----".length, beginIdx + "-----BEGIN PRIVATE KEY-----".length + 10);

console.log("Characters after '-----BEGIN PRIVATE KEY-----':");
for (let i = 0; i < afterBegin.length; i++) {
  const char = afterBegin[i];
  const code = afterBegin.charCodeAt(i);
  console.log(`  Char ${i}: '${char}' (code: ${code})`);
}

// Check what we actually have
console.log("\nFirst few chars and their codes:");
for (let i = 0; i < Math.min(50, value.length); i++) {
  const char = value[i];
  const code = value.charCodeAt(i);
  if (char === "\n") {
    console.log(`  Pos ${i}: [NEWLINE]`);
  } else if (char === "\\") {
    console.log(`  Pos ${i}: [BACKSLASH]`);
  } else if (code < 32 || code > 126) {
    console.log(`  Pos ${i}: [CODE ${code}]`);
  }
}
