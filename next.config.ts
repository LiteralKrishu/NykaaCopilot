import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@huggingface/transformers"],
  // The ONNX native binding loads this shared library at runtime, so file
  // tracing cannot discover it from the JavaScript imports alone.
  outputFileTracingIncludes: {
    "/api/analyze": [
      "./.models/jonathandinu/face-parsing/**/*",
      "./node_modules/onnxruntime-node/bin/napi-v3/linux/x64/onnxruntime_binding.node",
      "./node_modules/onnxruntime-node/bin/napi-v3/linux/x64/libonnxruntime.so*",
      "./node_modules/onnxruntime-node/bin/napi-v3/linux/x64/libonnxruntime_providers_shared.so",
    ],
  },
};

export default nextConfig;
