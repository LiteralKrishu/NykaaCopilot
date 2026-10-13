import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const traceDirectory = path.join(process.cwd(), ".next/server/app/api/analyze");
const trace = JSON.parse(await readFile(path.join(traceDirectory, "route.js.nft.json"), "utf8"));
const required = [
  ".models/jonathandinu/face-parsing/config.json",
  ".models/jonathandinu/face-parsing/preprocessor_config.json",
  ".models/jonathandinu/face-parsing/onnx/model_quantized.onnx",
  "node_modules/onnxruntime-node/bin/napi-v3/linux/x64/onnxruntime_binding.node",
  "node_modules/onnxruntime-node/bin/napi-v3/linux/x64/libonnxruntime.so.1",
  "node_modules/onnxruntime-node/bin/napi-v3/linux/x64/libonnxruntime_providers_shared.so",
];

for (const expected of required) {
  const traced = trace.files.find((file) => file.endsWith(expected));
  if (!traced) throw new Error(`Analysis function is missing ${expected}`);
  const file = path.resolve(traceDirectory, traced);
  if (!(await stat(file)).isFile()) throw new Error(`Analysis function file is unavailable: ${file}`);
}

console.log("Analysis function includes the local model and Linux ONNX runtime.");
