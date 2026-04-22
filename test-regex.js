// Test the regex directly
const testStr = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBA";

console.log("Test string:", testStr);
console.log("Test string length:", testStr.length);

// Check what's at each position
for (let i = 26; i < Math.min(35, testStr.length); i++) {
  const code = testStr.charCodeAt(i);
  const char = testStr[i];
  console.log(`Pos ${i}: char='${char}' code=${code}`);
}

// Test regex
console.log("\nRegex test:");
console.log("Pattern /\\n/ found:", /\n/.test(testStr));
console.log("Pattern /\n/ found:", /\n/.test(testStr));

// Try replace
console.log("\nReplace test:");
const replaced = testStr.replace(/\n/g, "\n");
console.log("After replace:", replaced);
console.log("Contains newline?", replaced.includes("\n"));
