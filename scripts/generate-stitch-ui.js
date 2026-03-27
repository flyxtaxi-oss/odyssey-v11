/**
 * Quantyx Stitch UI Generator — v2 (fixed for SDK 0.0.3)
 * Bypasses SDK response parsing bug by using raw callTool + extracting from outputComponents[1].design.screens[0].
 * 
 * Usage:
 *   node scripts/generate-stitch-ui.js "A futuristic dashboard with KPI cards and charts"
 */
import { StitchToolClient } from "@google/stitch-sdk";
import fs from "fs/promises";
import path from "path";
import https from "https";
import { execSync } from "child_process";
import { createWriteStream } from "fs";

const TARGET_DIR = path.resolve(process.cwd(), "src/components/generated");

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const request = (targetUrl) => {
      https.get(targetUrl, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return request(res.headers.location);
        }
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
        const file = createWriteStream(dest);
        res.pipe(file);
        file.on("finish", () => file.close(resolve));
      }).on("error", reject);
    };
    request(url);
  });
}

async function main() {
  const prompt = process.argv.slice(2).join(" ");
  if (!prompt) {
    console.error('Usage: node scripts/generate-stitch-ui.js <prompt...>');
    console.error('Example: node scripts/generate-stitch-ui.js "A futuristic glassmorphism search bar"');
    process.exit(1);
  }

  let apiKey = process.env.STITCH_API_KEY;
  let accessToken = process.env.STITCH_ACCESS_TOKEN;
  let projectId = process.env.GOOGLE_CLOUD_PROJECT;

  if (!apiKey && (!accessToken || !projectId)) {
    try {
      projectId = projectId || execSync('gcloud config get-value project', { encoding: 'utf8' }).trim();
      accessToken = accessToken || execSync('gcloud auth application-default print-access-token', { encoding: 'utf8' }).trim();
      console.log(`✅ Authenticated via gcloud (project: ${projectId})`);
    } catch (e) {
      console.error("⚠️ Run: gcloud auth application-default login");
      process.exit(1);
    }
  }

  console.log(`\n🚀 Prompt: "${prompt}"`);
  console.log("⏳ Connecting to Google Stitch AI...\n");

  try {
    const client = new StitchToolClient({ apiKey, accessToken, projectId });
    await fs.mkdir(TARGET_DIR, { recursive: true });

    // Step 1: Create project
    console.log("📁 Creating Stitch project...");
    const projectRaw = await client.callTool("create_project", { title: "Quantyx Generated UI" });
    const pid = projectRaw?.name?.replace("projects/", "") || String(projectRaw);
    console.log(`   Project: ${pid}`);

    // Step 2: Generate screen
    console.log("🎨 Generating screen (30-90s)...");
    const raw = await client.callTool("generate_screen_from_text", {
      projectId: pid,
      prompt,
      deviceType: "DESKTOP",
      modelId: "GEMINI_3_PRO"
    });

    // Extract screen from response — outputComponents[1].design.screens[0] is the actual screen
    const screen = raw?.outputComponents?.[1]?.design?.screens?.[0];
    if (!screen) {
      const debugPath = path.join(TARGET_DIR, `stitch_debug_${Date.now()}.json`);
      await fs.writeFile(debugPath, JSON.stringify(raw, null, 2), "utf8");
      console.error(`⚠️ Unexpected response. Debug: ${debugPath}`);
      process.exit(1);
    }

    console.log(`   Screen: ${screen.id} (${screen.screenMetadata?.status})`);

    const timestamp = Date.now();

    // Step 3: Download HTML
    if (screen.htmlCode?.downloadUrl) {
      const htmlDest = path.join(TARGET_DIR, `StitchComponent_${timestamp}.html`);
      await downloadFile(screen.htmlCode.downloadUrl, htmlDest);
      console.log(`📄 HTML: ${htmlDest}`);
    }

    // Step 4: Download screenshot
    if (screen.screenshot?.downloadUrl) {
      const imgDest = path.join(TARGET_DIR, `StitchComponent_${timestamp}.png`);
      await downloadFile(screen.screenshot.downloadUrl, imgDest);
      console.log(`🖼️  Preview: ${imgDest}`);
    }

    // Step 5: Save design system
    const designSystem = raw?.outputComponents?.[0]?.designSystem;
    if (designSystem) {
      const dsDest = path.join(TARGET_DIR, `DesignSystem_${timestamp}.json`);
      await fs.writeFile(dsDest, JSON.stringify(designSystem, null, 2), "utf8");
      console.log(`🎨 Design System: ${dsDest}`);
    }

    // Step 6: Show suggestions
    const suggestions = raw?.outputComponents?.filter(c => c.suggestion);
    if (suggestions?.length) {
      console.log("\n💡 Stitch suggestions:");
      suggestions.forEach(s => console.log(`   → ${s.suggestion}`));
    }

    console.log(`\n🎉 Done! Files saved to src/components/generated/`);
    try { await client.close(); } catch (e) {}

  } catch (err) {
    console.error("\n❌ Stitch error:", err.message || err);
    process.exit(1);
  }
}

main();
