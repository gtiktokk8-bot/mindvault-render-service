#!/usr/bin/env node
/**
 * MindVault Remotion Render Server
 *
 * Cloud render service that accepts video render requests via HTTP,
 * renders using Remotion, uploads to cloud storage, and returns a URL.
 *
 * API:
 *   POST /render
 *     Body: {
 *       broll_url: "https://...",
 *       audio_base64: "base64-encoded-mp3",
 *       script_lines: ["line1", "line2", ...],
 *       title: "Video Title",
 *       pillar: "psychology" | "stoicism" | "habits" | "focus" | "productivity",
 *       max_duration: 55,
 *       composition: "AutoPipelineReel" (optional, defaults to AutoPipelineReel)
 *     }
 *     Returns: { success: true, video_url: "https://...", duration: 30, render_time: 45.2 }
 *
 *   GET /
 *     Health check
 */

import express from "express";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import fs from "fs";
import os from "os";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Increase JSON body limit for base64 audio payloads (~2MB)
app.use(express.json({ limit: "10mb" }));

// Pre-bundle on startup for faster renders
let bundleLocation = null;
let bundling = false;

async function ensureBundle() {
  if (bundleLocation) return bundleLocation;
  if (bundling) {
    // Wait for in-progress bundle
    while (bundling) await new Promise((r) => setTimeout(r, 500));
    return bundleLocation;
  }

  bundling = true;
  console.log("📦 Pre-bundling Remotion project...");
  const start = Date.now();

  bundleLocation = await bundle({
    entryPoint: path.resolve(__dirname, "src/index.js"),
    webpackOverride: (config) => config,
  });

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`✅ Bundle ready (${elapsed}s)`);
  bundling = false;
  return bundleLocation;
}

// Theme mapping based on pillar
function getThemeForPillar(pillar) {
  const mapping = {
    psychology: "dark",
    stoicism: "stoic",
    habits: "gold",
    focus: "fire",
    productivity: "gold",
  };
  return mapping[pillar] || "dark";
}

// === HEALTH CHECK ===
app.get("/", (req, res) => {
  res.json({
    service: "mindvault-remotion-render",
    version: "2.0.0",
    status: "ok",
    bundled: !!bundleLocation,
    uptime: process.uptime(),
  });
});

// === RENDER ENDPOINT ===
app.post("/render", async (req, res) => {
  const startTime = Date.now();
  const requestId = crypto.randomBytes(6).toString("hex");

  console.log(`\n🎬 [${requestId}] Render request received`);

  try {
    const {
      broll_url,
      audio_base64,
      script_lines = [],
      title = "MindVault",
      pillar = "psychology",
      max_duration = 55,
      composition = "AutoPipelineReel",
      theme: requestedTheme,
      stripe_cta,
    } = req.body;

    if (!script_lines.length) {
      return res.status(400).json({ success: false, error: "script_lines is required" });
    }

    // Determine theme
    const theme = requestedTheme || getThemeForPillar(pillar);

    // Write audio to temp file if provided
    let audioPath = null;
    if (audio_base64) {
      audioPath = path.join(os.tmpdir(), `mv-audio-${requestId}.mp3`);
      fs.writeFileSync(audioPath, Buffer.from(audio_base64, "base64"));
      console.log(`  📝 Audio saved: ${audioPath} (${(fs.statSync(audioPath).size / 1024).toFixed(0)}KB)`);
    }

    // Calculate duration from script lines (3.5s per line + 5s overhead)
    const targetSeconds = Math.min(
      max_duration,
      Math.max(15, script_lines.length * 3.5 + 5)
    );

    // Prepare props
    const inputProps = {
      brollUrl: broll_url || "",
      audioUrl: audioPath ? `file://${audioPath}` : "",
      scriptLines: script_lines.filter((l) => l.trim()),
      title: title,
      theme: theme,
      pillar: pillar,
      stripeCta: stripe_cta || "27 Dark Psychology Tactics — Link in bio",
      stripeUrl: "https://buy.stripe.com/5kQeV66P5g6hdpp4rA1sQ03",
    };

    console.log(`  🎯 Composition: ${composition}`);
    console.log(`  ⏱️  Target duration: ${targetSeconds.toFixed(1)}s`);
    console.log(`  📊 Script lines: ${script_lines.length}`);
    console.log(`  🎨 Theme: ${theme} | Pillar: ${pillar}`);

    // Ensure bundle
    const serveUrl = await ensureBundle();

    // Select composition
    const comp = await selectComposition({
      serveUrl,
      id: composition,
      inputProps,
    });

    // Override duration based on our calculation
    const fps = 30;
    const durationInFrames = Math.round(targetSeconds * fps);

    // Output file
    const outputPath = path.join(os.tmpdir(), `mv-render-${requestId}.mp4`);

    // Render
    console.log(`  🔧 Rendering ${durationInFrames} frames...`);
    let lastLoggedPct = 0;
    await renderMedia({
      composition: { ...comp, durationInFrames },
      serveUrl,
      codec: "h264",
      outputLocation: outputPath,
      inputProps,
      concurrency: parseInt(process.env.RENDER_CONCURRENCY || "2", 10),
      imageFormat: "jpeg",
      jpegQuality: 85,
      pixelFormat: "yuv420p",
      crf: 23,
      chromiumOptions: {
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
        ],
      },
      onProgress: ({ progress }) => {
        const pct = Math.floor(progress * 100);
        if (pct >= lastLoggedPct + 20) {
          console.log(`  ▓${"█".repeat(Math.floor(pct / 5))}${"░".repeat(20 - Math.floor(pct / 5))} ${pct}%`);
          lastLoggedPct = pct;
        }
      },
    });

    const fileSize = fs.statSync(outputPath).size;
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
    const renderTime = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`  ✅ Render complete: ${fileSizeMB}MB in ${renderTime}s`);

    // Serve the file directly (for Render.com free tier without S3)
    // The file will be served at /videos/{requestId}.mp4
    const videoDir = path.join(__dirname, "rendered");
    if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

    const publicPath = path.join(videoDir, `${requestId}.mp4`);
    fs.renameSync(outputPath, publicPath);

    // Construct public URL
    const host = req.headers.host || `localhost:${PORT}`;
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const videoUrl = `${protocol}://${host}/videos/${requestId}.mp4`;

    // Clean up audio temp file
    if (audioPath && fs.existsSync(audioPath)) fs.unlinkSync(audioPath);

    // Schedule cleanup of rendered video after 30 minutes
    setTimeout(() => {
      if (fs.existsSync(publicPath)) {
        fs.unlinkSync(publicPath);
        console.log(`🗑️  Cleaned up: ${requestId}.mp4`);
      }
    }, 30 * 60 * 1000);

    res.json({
      success: true,
      video_url: videoUrl,
      duration: targetSeconds,
      render_time: parseFloat(renderTime),
      file_size_mb: parseFloat(fileSizeMB),
      composition,
      theme,
      request_id: requestId,
    });

  } catch (err) {
    const renderTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`  ❌ [${requestId}] Render failed (${renderTime}s):`, err.message);

    res.status(500).json({
      success: false,
      error: err.message,
      render_time: parseFloat(renderTime),
      request_id: requestId,
    });
  }
});

// === SERVE RENDERED VIDEOS ===
app.use("/videos", express.static(path.join(__dirname, "rendered"), {
  maxAge: "30m",
  setHeaders: (res) => {
    res.set("Content-Type", "video/mp4");
    res.set("Accept-Ranges", "bytes");
  },
}));

// === STARTUP ===
app.listen(PORT, async () => {
  console.log(`\n🚀 MindVault Remotion Render Server`);
  console.log(`   Port: ${PORT}`);
  console.log(`   Node: ${process.version}`);
  console.log(`   Env:  ${process.env.NODE_ENV || "development"}\n`);

  // Pre-bundle on startup
  try {
    await ensureBundle();
  } catch (err) {
    console.error("⚠️  Pre-bundle failed (will retry on first request):", err.message);
    bundleLocation = null;
    bundling = false;
  }
});
