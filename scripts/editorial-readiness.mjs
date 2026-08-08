import fs from "node:fs";
import path from "node:path";

const strict = process.argv.includes("--strict");
const root = process.cwd();
const articlesDir = path.join(root, "src", "content", "articles");
const authorsDir = path.join(root, "src", "content", "authors");
const issues = [];
const warnings = [];

function filesIn(dir) {
  return fs.readdirSync(dir)
    .filter((name) => name.endsWith(".md") && !name.startsWith("_"))
    .map((name) => path.join(dir, name));
}

function frontmatter(text) {
  const match = text.match(/^---\s*\n([\s\S]*?)\n---/);
  return match?.[1] ?? "";
}

function hasLine(fm, key) {
  return new RegExp(`^${key}:\\s*.+$`, "m").test(fm);
}

for (const file of filesIn(articlesDir)) {
  const text = fs.readFileSync(file, "utf8");
  const fm = frontmatter(text);
  const label = path.basename(file);

  const reviewedBy = hasLine(fm, "reviewedBy");
  const reviewedAt = hasLine(fm, "reviewedAt");
  const checkedBy = hasLine(fm, "factCheckedBy");
  const checkedAt = hasLine(fm, "factCheckedAt");
  const aiAssisted = /^aiAssisted:\s*true\s*$/m.test(fm);
  const aiDisclosure = hasLine(fm, "aiDisclosure");
  const handsOn = /^creationMethod:\s*["']?hands-on-testing["']?\s*$/m.test(fm);
  const firstHand = /^creationMethod:\s*["']?first-hand-experience["']?\s*$/m.test(fm);
  const originalResearch = /^originalResearch:\s*true\s*$/m.test(fm);
  const methodology = hasLine(fm, "methodologyNote");

  if (reviewedBy !== reviewedAt) issues.push(`${label}: reviewedBy and reviewedAt must be supplied together.`);
  if (checkedBy !== checkedAt) issues.push(`${label}: factCheckedBy and factCheckedAt must be supplied together.`);
  if (aiAssisted && !aiDisclosure) issues.push(`${label}: aiAssisted requires aiDisclosure.`);
  if ((handsOn || firstHand || originalResearch) && !methodology) issues.push(`${label}: hands-on/first-hand/original-research claims require methodologyNote.`);
  if (!hasLine(fm, "imageAlt")) issues.push(`${label}: imageAlt is required for editorial accessibility.`);
  if (!/^tags:\s*$/m.test(fm)) warnings.push(`${label}: no tags block detected; semantic topic metadata may be weak.`);
}

const demoAuthorFiles = new Set(["maya-chen.md", "daniel-reed.md"]);
for (const file of filesIn(authorsDir)) {
  const label = path.basename(file);
  const fm = frontmatter(fs.readFileSync(file, "utf8"));
  if (!hasLine(fm, "bio") || !/^expertise:\s*$/m.test(fm)) {
    issues.push(`${label}: author profile needs a bio and expertise list.`);
  }
  if (demoAuthorFiles.has(label)) {
    warnings.push(`${label}: bundled demo author profile detected. Replace with a real contributor before public launch.`);
  }
}

for (const item of warnings) console.warn(`EDITORIAL WARNING: ${item}`);
for (const item of issues) console.error(`EDITORIAL ERROR: ${item}`);

if (issues.length > 0 || (strict && warnings.length > 0)) {
  process.exitCode = 1;
} else {
  console.log(`Editorial readiness check passed${warnings.length ? ` with ${warnings.length} warning(s)` : ""}.`);
}
