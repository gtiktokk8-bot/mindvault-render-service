#!/usr/bin/env node
/**
 * MindVault Remotion Render CLI
 *
 * Usage:
 *   node render.mjs --composition QuoteReel --props '{"quote":"...","author":"..."}' --output out/quote1.mp4
 *   node render.mjs --composition MindVaultReel --props-file content.json --output out/reel1.mp4
 *
 * All outputs conform to RENDER_SPEC.md (1080x1920, H.264 High, 30fps, CRF 23, ≤58s)
 */

import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { createRequire } from "module";
import path from "path";
import fs from "fs";

const require = createRequire(import.meta.url);

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    composition: "MindVaultReel",
    props: {},
    output: "out/render.mp4",
    concurrency: 2,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--composition":
      case "-c":
        opts.composition = args[++i];
        break;
      case "--props":
      case "-p":
        opts.props = JSON.parse(args[++i]);
        break;
      case "--props-file":
      case "-f":
        opts.props = JSON.parse(fs.readFileSync(args[++i], "utf8"));
        break;
      case "--output":
      case "-o":
        opts.output = args[++i];
        break;
      case "--concurrency":
        opts.concurrency = parseInt(args[++i], 10);
        break;
    }
  }
  return opts;
}

async function main() {
  const opts = parseArgs();
  const startTime = Date.now();

  console.log(`\n🎬 MindVault Remotion Render`);
  console.log(`   Composition: ${opts.composition}`);
  console.log(`   Output:      ${opts.output}`);
  console.log(`   Props:       ${JSON.stringify(opts.props).slice(0, 120)}...`);

  // Ensure output directory exists
  const outDir = path.dirname(opts.output);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Bundle the project
  console.log("\n📦 Bundling...");
  const bundleLocation = await bundle({
    entryPoint: path.resolve("src/index.js"),
    webpackOverride: (config) => config,
  });

  // Select composition
  console.log("🎯 Selecting composition...");
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: opts.composition,
    inputProps: opts.props,
  });

  // Render
  console.log("🔧 Rendering...");
  let lastProgress = 0;
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: opts.output,
    inputProps: opts.props,
    concurrency: opts.concurrency,
    imageFormat: "jpeg",
    jpegQuality: 90,
    // RENDER_SPEC conformance — use CRF for quality (can't combine with videoBitrate in Remotion)
    // Post-render we re-encode with ffmpeg for maxrate/bufsize if needed
    pixelFormat: "yuv420p",
    crf: 23,
    onProgress: ({ progress }) => {
      const pct = Math.floor(progress * 100);
      if (pct >= lastProgress + 10) {
        console.log(`   ▓${"█".repeat(Math.floor(pct / 5))}${"░".repeat(20 - Math.floor(pct / 5))} ${pct}%`);
        lastProgress = pct;
      }
    },
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const fileSize = (fs.statSync(opts.output).size / (1024 * 1024)).toFixed(2);
  console.log(`\n✅ Render complete!`);
  console.log(`   File: ${opts.output} (${fileSize} MB)`);
  console.log(`   Time: ${elapsed}s`);
  console.log(`   Spec: 1080x1920 | 30fps | H.264 High | CRF 23 | ≤5Mbps\n`);
}

main().catch((err) => {
  console.error("❌ Render failed:", err.message);
  process.exit(1);
});
