import fs from "node:fs";
import path from "node:path";

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, value, index, list) => {
  if (value.startsWith("--")) acc.push([value.slice(2), list[index + 1]?.startsWith("--") ? "" : list[index + 1]]);
  return acc;
}, []));
const cluster = args.cluster;
const keyword = args.keyword;
if (!cluster || !keyword) {
  console.error('Usage: npm run content:brief -- --cluster home-automation --keyword "Matter vs Thread" [--intent comparison] [--type comparison]');
  process.exit(1);
}
const root = process.cwd();
const clusterFile = path.join(root, "src", "content", "clusters", `${cluster}.md`);
if (!fs.existsSync(clusterFile)) { console.error(`Unknown cluster: ${cluster}`); process.exit(1); }
const raw = fs.readFileSync(clusterFile, "utf8");
const fm = raw.match(/^---\s*\n([\s\S]*?)\n---/)?.[1] ?? "";
const clean = (v="") => v.trim().replace(/^['"]|['"]$/g, "");
const scalar = (key) => clean(fm.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1] ?? "");
const list = (key) => {
  const m = fm.match(new RegExp(`^${key}:\\s*\\n((?:[ \\t]+-.*(?:\\n|$))*)`, "m"));
  return m ? [...m[1].matchAll(/^\s+-\s+(.+)$/gm)].map((x) => clean(x[1])) : [];
};
const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const slug = args.slug || slugify(keyword);
const articleFiles = fs.readdirSync(path.join(root, "src", "content", "articles")).filter((n) => n.endsWith(".md") && !n.startsWith("_"));
const existing = articleFiles.map((name) => {
  const text = fs.readFileSync(path.join(root, "src", "content", "articles", name), "utf8");
  const afm = text.match(/^---\s*\n([\s\S]*?)\n---/)?.[1] ?? "";
  const get = (key) => clean(afm.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1] ?? "");
  return { id: name.replace(/\.md$/, ""), title: get("title"), cluster: get("cluster"), keyword: get("primaryKeyword") };
}).filter((item) => item.cluster === cluster);
const questions = list("keyQuestions");
const outDir = path.join(root, "reports", "briefs");
fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, `${slug}.md`);
const brief = `# Content Brief — ${keyword}\n\n## Strategy\n\n- **Cluster:** ${scalar("title")} (${cluster})\n- **Cluster purpose:** ${scalar("description")}\n- **Primary query:** ${keyword}\n- **Search intent:** ${args.intent || "informational"}\n- **Content type:** ${args.type || "guide"}\n- **Suggested slug:** ${slug}\n\n## Reader outcome\n\nWrite one sentence describing the decision, task, or understanding the reader should leave with.\n\n## Answer-first requirement\n\nOpen with a direct 1–3 sentence answer that can stand alone without the rest of the article.\n\n## Cluster questions to consider\n\n${questions.length ? questions.map((q) => `- ${q}`).join("\n") : "- Add questions from real reader/search demand."}\n\n## Existing cluster content to link contextually\n\n${existing.length ? existing.map((item) => `- [${item.title}](/articles/${item.id}) — anchor idea: “${item.keyword || item.title}”`).join("\n") : "- No existing cluster articles yet."}\n\n## Evidence plan\n\n- Primary/official sources:\n- Measurements or original data, if any:\n- Important limitations or uncertainty:\n- Reviewer/fact checker required?\n\n## Suggested structure\n\n1. Direct answer\n2. Context / definitions only if needed\n3. Decision-relevant factors\n4. Evidence / comparison / examples\n5. Trade-offs and limitations\n6. Who this is for / not for\n7. Conclusion with next action\n\n## GEO extraction checklist\n\n- Clear definitions and explicit claims\n- Tables/bullets only where they improve scanning\n- Named entities are unambiguous\n- Claims near their sources\n- No unsupported superlatives\n- Concise FAQ-style questions are answered visibly\n`;
fs.writeFileSync(out, brief);
console.log(path.relative(root, out));
