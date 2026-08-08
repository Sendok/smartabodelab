import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const key = process.env.INDEXNOW_KEY?.trim();
const siteUrl = (process.env.SITE_URL || "https://smartabodelab.com").replace(/\/$/, "");
const endpoint = process.env.INDEXNOW_ENDPOINT || "https://api.indexnow.org/indexnow";

if (!key) {
  console.error("[IndexNow] Missing INDEXNOW_KEY.");
  process.exit(1);
}

if (!/^[A-Za-z0-9-]{8,128}$/.test(key)) {
  console.error("[IndexNow] Invalid INDEXNOW_KEY. Use 8-128 letters, numbers, or dashes.");
  process.exit(1);
}

const requested = process.argv.slice(2);
let urls = requested.map((value) => new URL(value, `${siteUrl}/`).toString());

if (urls.length === 0) {
  const sitemap = await readFile(resolve(root, "dist/sitemap.xml"), "utf8");
  urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) =>
    match[1]
      .replaceAll("&amp;", "&")
      .replaceAll("&lt;", "<")
      .replaceAll("&gt;", ">")
      .replaceAll("&quot;", '"')
      .replaceAll("&apos;", "'")
  );
}

urls = [...new Set(urls)].filter((url) => new URL(url).host === new URL(siteUrl).host);
if (urls.length === 0) {
  console.error("[IndexNow] No same-host URLs found to submit.");
  process.exit(1);
}

const chunks = [];
for (let i = 0; i < urls.length; i += 10000) chunks.push(urls.slice(i, i + 10000));

for (const urlList of chunks) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: new URL(siteUrl).host,
      key,
      keyLocation: `${siteUrl}/indexnow-key.txt`,
      urlList
    })
  });

  if (!response.ok && response.status !== 202) {
    const body = await response.text();
    console.error(`[IndexNow] Submission failed: ${response.status} ${response.statusText} ${body}`);
    process.exit(1);
  }

  console.log(`[IndexNow] Submitted ${urlList.length} URL(s): HTTP ${response.status}.`);
}
