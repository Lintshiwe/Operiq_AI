#!/usr/bin/env node
// Copies the TanStack Start SSR server output to the Netlify functions directory
// so the function wrapper can import it with correct relative paths.

import { cp, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const srcServer = resolve(root, "dist/server");
const destServer = resolve(root, "netlify/functions/server");

async function main() {
  if (!existsSync(srcServer)) {
    console.error("❌ dist/server/ not found. Run 'vite build' first.");
    process.exit(1);
  }

  await mkdir(destServer, { recursive: true });

  // Copy server.js entry point
  await cp(resolve(srcServer, "server.js"), resolve(destServer, "server.js"));

  // Copy assets directory (contains all SSR chunks)
  const srcAssets = resolve(srcServer, "assets");
  if (existsSync(srcAssets)) {
    const destAssets = resolve(destServer, "assets");
    await cp(srcAssets, destAssets, { recursive: true });
  }

  console.log("✅ SSR server copied to netlify/functions/server/");
}

main().catch((err) => {
  console.error("❌ Failed to copy server:", err);
  process.exit(1);
});
