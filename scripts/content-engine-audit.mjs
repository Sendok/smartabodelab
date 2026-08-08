import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const articlesDir = path.join(root, "src", "content", "articles");
const clustersDir = path.join(root, "src", "content", "clusters");
const reportDir = path.join(root, "reports");

function filesIn(dir) {
  return fs.readdirSync(dir).filter((name) => name.endsWith(".md") && !name.startsWith("_")).map((name) => path.join(dir, name));
}
function frontmatter(text) { return text.match(/^---\s*\n([\s\S]*?)\n---/)?.[1] ?? ""; }
function body(text) { return text.replace(/^---\s*\n[\s\S]*?\n---\s*/, ""); }
function clean(value = "") { return value.trim().replace(/^['"]|['"]$/g, ""); }
function scalar(fm, key) { return clean(fm.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1] ?? ""); }
function list(fm, key) {
  const match = fm.match(new RegExp(`^${key}:\\s*\\n((?:[ \\t]+-.*(?:\\n|$))*)`, "m"));
  if (!match) {
    const inline = fm.match(new RegExp(`^${key}:\\s*\\[(.*)\\]\\s*$`, "m"))?.[1];
    return inline ? inline.split(",").map(clean).filter(Boolean) : [];
  }
  return [...match[1].matchAll(/^\s+-\s+(.+)$/gm)].map((item) => clean(item[1])).filter((item) => !item.includes(":"));
}
function overlap(a, b) { const set = new Set(a.map((v) => v.toLowerCase())); return b.filter((v) => set.has(v.toLowerCase())).length; }
function articleLinks(text) {
  const found = new Set();
  for (const match of text.matchAll(/(?:href=["']|\]\()\/articles\/([^#?"')\s]+)/g)) found.add(match[1]);
  return [...found];
}

const clusterIds = new Set(filesIn(clustersDir).map((file) => path.basename(file, ".md")));
const articles = filesIn(articlesDir).map((file) => {
  const text = fs.readFileSync(file, "utf8");
  const fm = frontmatter(text);
  return {
    id: path.basename(file, ".md"),
    file: path.relative(root, file),
    title: scalar(fm, "title"),
    cluster: scalar(fm, "cluster"),
    contentType: scalar(fm, "contentType"),
    searchIntent: scalar(fm, "searchIntent"),
    funnelStage: scalar(fm, "funnelStage"),
    primaryKeyword: scalar(fm, "primaryKeyword"),
    tags: list(fm, "tags"),
    secondaryKeywords: list(fm, "secondaryKeywords"),
    entities: list(fm, "entities"),
    hasDirectAnswer: /^directAnswer:\s*.+$/m.test(fm),
    hasQuestions: /^questions:\s*$/m.test(fm),
    text: body(text),
    contextualLinks: articleLinks(body(text))
  };
});

const errors = [];
const warnings = [];
const coverage = {};
for (const article of articles) {
  if (!article.cluster || !clusterIds.has(article.cluster)) errors.push(`${article.id}: missing or unknown cluster '${article.cluster}'.`);
  if (!article.primaryKeyword) errors.push(`${article.id}: primaryKeyword is required.`);
  if (!article.searchIntent) errors.push(`${article.id}: searchIntent is required.`);
  if (!article.funnelStage) errors.push(`${article.id}: funnelStage is required.`);
  if (!article.hasDirectAnswer) warnings.push(`${article.id}: add directAnswer for answer-first UX.`);
  if (!article.hasQuestions) warnings.push(`${article.id}: add reader questions to cover query variants.`);
  if (article.entities.length === 0) warnings.push(`${article.id}: entities list is empty.`);
  if (article.contextualLinks.length === 0) warnings.push(`${article.id}: no contextual /articles/ links found in the Markdown body.`);
  coverage[article.cluster] ??= { total: 0, awareness: 0, consideration: 0, decision: 0, types: {} };
  coverage[article.cluster].total++;
  if (article.funnelStage in coverage[article.cluster]) coverage[article.cluster][article.funnelStage]++;
  coverage[article.cluster].types[article.contentType] = (coverage[article.cluster].types[article.contentType] ?? 0) + 1;
}

const suggestions = {};
for (const source of articles) {
  const existing = new Set(source.contextualLinks);
  suggestions[source.id] = articles
    .filter((candidate) => candidate.id !== source.id && !existing.has(candidate.id))
    .map((candidate) => {
      let score = 0;
      const lowerBody = source.text.toLowerCase();
      if (source.cluster === candidate.cluster) score += 20;
      if (candidate.primaryKeyword && lowerBody.includes(candidate.primaryKeyword.toLowerCase())) score += 20;
      score += overlap(source.tags, candidate.tags) * 5;
      score += overlap(source.entities, candidate.entities) * 4;
      score += overlap(source.secondaryKeywords, candidate.secondaryKeywords) * 2;
      return { id: candidate.id, title: candidate.title, suggestedAnchor: candidate.primaryKeyword || candidate.title, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

for (const [cluster, data] of Object.entries(coverage)) {
  if (data.total < 3) warnings.push(`${cluster}: only ${data.total} published sample article(s); build toward at least a small multi-page cluster.`);
  if (data.awareness === 0) warnings.push(`${cluster}: no awareness-stage article.`);
  if (data.consideration === 0) warnings.push(`${cluster}: no consideration-stage article.`);
  if (data.decision === 0) warnings.push(`${cluster}: no decision-stage article.`);
}

const report = { generatedAt: new Date().toISOString(), articleCount: articles.length, clusterCount: clusterIds.size, coverage, suggestions, errors, warnings };
fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(path.join(reportDir, "content-engine-report.json"), JSON.stringify(report, null, 2) + "\n");

console.log(`Content Engine: ${articles.length} articles across ${clusterIds.size} clusters.`);
for (const [cluster, data] of Object.entries(coverage)) console.log(`  ${cluster}: ${data.total} article(s) · A:${data.awareness} C:${data.consideration} D:${data.decision}`);
for (const item of warnings) console.warn(`CONTENT WARNING: ${item}`);
for (const item of errors) console.error(`CONTENT ERROR: ${item}`);
console.log(`Internal-link suggestions written to reports/content-engine-report.json`);
if (errors.length) process.exitCode = 1;
