import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(projectRoot, "public/indexnow-key.txt");
const key = process.env.INDEXNOW_KEY?.trim();

if (!key) {
  await rm(output, { force: true });
  console.log("[IndexNow] INDEXNOW_KEY not set; key file generation skipped.");
  process.exit(0);
}

if (!/^[A-Za-z0-9-]{8,128}$/.test(key)) {
  console.error("[IndexNow] Invalid INDEXNOW_KEY. Use 8-128 letters, numbers, or dashes.");
  process.exit(1);
}

await mkdir(dirname(output), { recursive: true });
await writeFile(output, key, "utf8");
console.log("[IndexNow] Generated public/indexnow-key.txt for build output.");
