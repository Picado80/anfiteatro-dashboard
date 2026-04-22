const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");

const keyLine = envContent.split("\n").find(l => l.startsWith("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="));
const idx = keyLine.indexOf("=");
let value = keyLine.substring(idx + 1);

// Remove quotes
value = value.slice(1, -1);

console.log("Testing replace operation:");
console.log("Original length:", value.length);
console.log("Contains backslash-n pattern?", /\n/.test(value));

const converted = value.replace(/\n/g, "\n");
console.log("After replace length:", converted.length);
console.log("Newline count:", (converted.match(/\n/g) || []).length);

console.log("\nFirst 200 chars of converted key:");
console.log(converted.substring(0, 200));

console.log("\nLast 200 chars of converted key:");
console.log(converted.substring(converted.length - 200));

// Check if it looks like a valid PEM
const lines = converted.split("\n");
console.log("\nTotal lines:", lines.length);
console.log("First line:", lines[0]);
console.log("Last line:", lines[lines.length - 1]);
