import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { copyFile, mkdir, rm, rename } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

const modelId = "jonathandinu/face-parsing";
const revision = "758b82e15a0178c9db39c1ff666a8b56e3a550c8";
const modelRoot = path.join(process.cwd(), ".models", modelId);
const packageCache = path.join(process.cwd(), "node_modules", "@huggingface", "transformers", ".cache", modelId);
const files = [
  { name: "config.json", sha256: "01d82e818569beda6aec804642e34ce187bed43326337d52ce370ff015964d68" },
  { name: "preprocessor_config.json", sha256: "e5a25d8fc054bf780be930e161b47d188bec1b0bf0a44fd5fdfb3f3312c0be0b" },
  { name: "onnx/model_quantized.onnx", sha256: "5bab9bfb3cb979f3098ac3b934b1641dbf87f835e0b03c2ca6d88dcf18c83d27" },
];

async function sha256(file) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest("hex");
}

async function matches(file, expected) {
  try { return await sha256(file) === expected; }
  catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

for (const { name, sha256: expected } of files) {
  const target = path.join(modelRoot, name);
  if (await matches(target, expected)) continue;

  await mkdir(path.dirname(target), { recursive: true });
  const temporary = `${target}.${process.pid}.download`;
  try {
    const cached = path.join(packageCache, name);
    if (await matches(cached, expected)) {
      await copyFile(cached, temporary);
    } else {
      const url = `https://huggingface.co/${modelId}/resolve/${revision}/${name}`;
      console.log(`Downloading pinned face model file: ${name}`);
      const response = await fetch(url, { signal: AbortSignal.timeout(300_000) });
      if (!response.ok || !response.body) throw new Error(`Model download failed for ${name}: HTTP ${response.status}`);
      await pipeline(Readable.fromWeb(response.body), createWriteStream(temporary));
    }
    if (!await matches(temporary, expected)) throw new Error(`Model integrity check failed for ${name}`);
    await rm(target, { force: true });
    await rename(temporary, target);
  } finally {
    await rm(temporary, { force: true });
  }
}

console.log("Pinned face model is ready for local inference.");
