import fs from "node:fs";
import path from "node:path";

const pairs = [];
for (let i = 2; i < process.argv.length; i++) if (process.argv[i].startsWith("--")) pairs.push([process.argv[i].slice(2), process.argv[i + 1] ?? ""]);
const args = Object.fromEntries(pairs);
for (const required of ["slug", "title", "cluster", "keyword", "author"]) {
  if (!args[required]) { console.error(`Missing --${required}`); process.exit(1); }
}
const root = process.cwd();
const clusterFile = path.join(root, "src", "content", "clusters", `${args.cluster}.md`);
if (!fs.existsSync(clusterFile)) { console.error(`Unknown cluster: ${args.cluster}`); process.exit(1); }
const authorFile = path.join(root, "src", "content", "authors", `${args.author}.md`);
if (!fs.existsSync(authorFile)) { console.error(`Unknown author: ${args.author}`); process.exit(1); }
const target = path.join(root, "src", "content", "articles", `${args.slug}.md`);
if (fs.existsSync(target)) { console.error(`Article already exists: ${args.slug}`); process.exit(1); }
const intent = args.intent || "informational";
const type = args.type || "guide";
const stage = args.stage || (intent === "commercial" || intent === "comparison" ? "consideration" : "awareness");
const categoryMap = { "smart-energy": ["Smart Energy", "smart-energy", "energy"], "home-automation": ["Home Automation", "home-automation", "iot"], "urban-living": ["Urban Living", "urban-living", "apartment"], "reviews": ["Reviews", "reviews", "appliances"] };
const [category, categorySlug, topic] = categoryMap[args.cluster] || ["Home Automation", "home-automation", "iot"];
const today = new Date().toISOString().slice(0, 10);
const markdown = `---\ntitle: "${args.title.replaceAll('"','\\"')}"\ndescription: "REPLACE: clear subtitle and meta description."\ncategory: "${category}"\ncategorySlug: "${categorySlug}"\ntopic: "${topic}"\ncluster: "${args.cluster}"\ncontentType: "${type}"\nsearchIntent: "${intent}"\nfunnelStage: "${stage}"\nprimaryKeyword: "${args.keyword.replaceAll('"','\\"')}"\nsecondaryKeywords: []\nentities: []\ndirectAnswer: "REPLACE: direct 1–3 sentence answer."\nquestions: []\nauthor: "${args.author}"\npublishedAt: ${today}\nreadTime: "8 min read"\nimage: "/images/articles/${args.slug}.webp"\nimageAlt: "REPLACE with accurate image description"\nfeatured: false\neditorsPick: false\ndraft: true\ntags: []\nrelatedPosts: []\nkeyTakeaways: []\noriginalResearch: false\naffiliateDisclosure: false\naiAssisted: false\nsources: []\ncorrections: []\n---\n\nOpening paragraph one.\n\nOpening paragraph two.\n\nOpening paragraph three.\n\n<div class="article-ad-slot" data-ad-slot="in-article-1" role="complementary" aria-label="Advertisement placeholder"><span>Advertisement · In-Article Slot 1 · Responsive Native Ad</span></div>\n\n## Main section\n\nWrite for the reader's decision or task.\n\n<div class="article-ad-slot" data-ad-slot="in-article-2" role="complementary" aria-label="Advertisement placeholder"><span>Advertisement · In-Article Slot 2 · Responsive In-Content</span></div>\n\n## Conclusion\n\nResolve the query and give the next action.\n`;
fs.writeFileSync(target, markdown);
console.log(path.relative(root, target));
