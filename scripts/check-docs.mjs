import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const docs = path.join(root, "docs");
const pages = [path.join(root, "README.md"), ...(await readdir(docs)).filter((name) => name.endsWith(".md")).map((name) => path.join(docs, name))];
const missing = [];
let checked = 0;

for (const page of pages) {
  const content = await readFile(page, "utf8");
  for (const match of content.matchAll(/!?(?:\[[^\]]*\])\(([^)]+)\)/g)) {
    const target = match[1].trim().split("#", 1)[0];
    if (!target || /^(?:https?:|mailto:|data:|\/)/i.test(target)) continue;
    const destination = path.resolve(path.dirname(page), decodeURIComponent(target));
    checked += 1;
    try { await access(destination); }
    catch { missing.push(`${path.relative(root, page)} → ${target}`); }
  }
}

if (missing.length) {
  console.error(`Broken documentation links:\n${missing.map((item) => `  ${item}`).join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`Checked ${checked} local links across ${pages.length} Markdown files.`);
}
