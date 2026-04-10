#!/usr/bin/env node
/**
 * MindVault Batch Render — Renders a full content calendar from a JSON manifest
 *
 * Usage:
 *   node batch_render.mjs --manifest content_week.json --outdir out/week1
 *
 * Manifest format (content_week.json):
 * [
 *   {
 *     "id": "mv-2026-04-10-am",
 *     "composition": "QuoteReel",
 *     "props": { ... },
 *     "caption": "Full IG/TT caption text...",
 *     "hashtags": "#stoicism #mindset #growth",
 *     "postTime": "2026-04-10T09:00:00-04:00",
 *     "platforms": ["instagram", "tiktok", "youtube"],
 *     "monetization": { "type": "amazon", "product": "Meditations" }
 *   },
 *   ...
 * ]
 *
 * Output: renders each entry to {outdir}/{id}.mp4 + writes a manifest_rendered.json
 */

import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import fs from "fs";

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { manifest: null, outdir: "out/batch" };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--manifest" || args[i] === "-m") opts.manifest = args[++i];
    if (args[i] === "--outdir" || args[i] === "-d") opts.outdir = args[++i];
  }
  return opts;
}

async function main() {
  const opts = parseArgs();
  if (!opts.manifest) {
    console.error("Usage: node batch_render.mjs --manifest <file.json> [--outdir <dir>]");
    process.exit(1);
  }

  const entries = JSON.parse(fs.readFileSync(opts.manifest, "utf8"));
  console.log(`\n🎬 MindVault Batch Render — ${entries.length} videos\n`);

  if (!fs.existsSync(opts.outdir)) fs.mkdirSync(opts.outdir, { recursive: true });

  // Bundle once for all renders
  console.log("📦 Bundling project...");
  const bundleLocation = await bundle({
    entryPoint: path.resolve("src/index.js"),
    webpackOverride: (config) => config,
  });
  console.log("✓ Bundle ready\n");

  const results = [];
  const startAll = Date.now();

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const outputFile = path.join(opts.outdir, `${entry.id}.mp4`);
    const start = Date.now();

    console.log(`[${i + 1}/${entries.length}] Rendering: ${entry.id} (${entry.composition})`);

    try {
      const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: entry.composition,
        inputProps: entry.props,
      });

      await renderMedia({
        composition,
        serveUrl: bundleLocation,
        codec: "h264",
        outputLocation: outputFile,
        inputProps: entry.props,
        concurrency: 2,
        imageFormat: "jpeg",
        jpegQuality: 90,
        pixelFormat: "yuv420p",
        crf: 23,
        onProgress: ({ progress }) => {
          const pct = Math.floor(progress * 100);
          if (pct % 25 === 0 && pct > 0) process.stdout.write(`${pct}%..`);
        },
      });

      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      const fileSize = (fs.statSync(outputFile).size / (1024 * 1024)).toFixed(2);
      console.log(` ✅ ${fileSize}MB in ${elapsed}s`);

      results.push({
        ...entry,
        outputFile,
        fileSize: `${fileSize}MB`,
        renderTime: `${elapsed}s`,
        status: "rendered",
      });
    } catch (err) {
      console.log(` ❌ FAILED: ${err.message}`);
      results.push({
        ...entry,
        status: "failed",
        error: err.message,
      });
    }
  }

  // Write rendered manifest
  const manifestOut = path.join(opts.outdir, "manifest_rendered.json");
  fs.writeFileSync(manifestOut, JSON.stringify(results, null, 2));

  const totalTime = ((Date.now() - startAll) / 1000).toFixed(1);
  const success = results.filter((r) => r.status === "rendered").length;
  console.log(`\n🏁 Batch complete: ${success}/${entries.length} rendered in ${totalTime}s`);
  console.log(`   Manifest: ${manifestOut}\n`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
