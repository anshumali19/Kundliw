const fs = require("fs");
const path = require("path");

const targetDirs = ["src/app", "src/components", "src/features"];
const results = [];

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDirectory(fullPath);
    } else if (entry.name.endsWith(".tsx")) {
      scanFile(fullPath);
    }
  }
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");

  // Count ternary isHindi patterns: isHindi ? "..." : "..."
  const ternaryMatches = content.match(/isHindi\s*\?\s*["'`][^"'`\r\n]{2,}["'`]\s*:\s*["'`][^"'`\r\n]{2,}["'`]/g) || [];

  // Count JSX text nodes between tags: >Some text<
  // Exclude empty whitespace, braces, operators
  const jsxTextMatches = [];
  const jsxRegex = />([^<>{}\n\r]+)</g;
  let match;
  while ((match = jsxRegex.exec(content)) !== null) {
    const text = match[1].trim();
    if (text.length > 2 && !/^[0-9\s.,/\\()\-:;!?*+=&%$#@|~_]+$/.test(text)) {
      jsxTextMatches.push(text);
    }
  }

  const total = ternaryMatches.length * 2 + jsxTextMatches.length;
  if (total > 0) {
    results.push({
      filePath: filePath.replace(/\\/g, "/"),
      total,
      ternaries: ternaryMatches.length,
      jsxTags: jsxTextMatches.length,
    });
  }
}

for (const dir of targetDirs) {
  if (fs.existsSync(dir)) scanDirectory(dir);
}

results.sort((a, b) => b.total - a.total);

console.log(JSON.stringify(results, null, 2));
