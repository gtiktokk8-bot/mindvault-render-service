#!/usr/bin/env node
/**
 * Pre-bundle Remotion project during Docker build
 * This avoids the memory-heavy webpack bundling at runtime
 */
import { bundle } from "@remotion/bundler";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("📦 Pre-bundling Remotion project (build-time)...");
const start = Date.now();

try {
  const bundleLocation = await bundle({
    entryPoint: path.resolve(__dirname, "src/index.js"),
    webpackOverride: (config) => config,
  });

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`✅ Bundle ready at: ${bundleLocation} (${elapsed}s)`);

  // Write bundle location to a file so server can read it
  const fs = await import("fs");
  fs.writeFileSync(
    path.resolve(__dirname, ".bundle-location"),
    bundleLocation,
    "utf-8"
  );
  console.log("📝 Bundle location saved to .bundle-location");
} catch (err) {
  console.error("❌ Pre-bundle failed:", err.message);
  process.exit(1);
}
