import { cp, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = resolve(root, "dist/server");
const dest = resolve(root, "netlify/functions/server");

if (!existsSync(src)) {
  console.error("dist/server/ not found — run vite build first");
  process.exit(1);
}

await mkdir(dest, { recursive: true });
await cp(resolve(src, "server.js"), resolve(dest, "server.js"));
await cp(resolve(src, "assets"), resolve(dest, "assets"), { recursive: true });
console.log("SSR server files copied to netlify/functions/server/");
