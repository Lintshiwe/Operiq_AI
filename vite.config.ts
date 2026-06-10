import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
// import netlify from "@netlify/vite-plugin-tanstack-start"; // conflicts with dev SSR — see below

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      target: "react",
      autoCodeSplitting: true,
      codeSplittingOptions: { addHmr: false },
    }),
    ...tanstackStart(),
    // @netlify/vite-plugin-tanstack-start conflicts with TanStack Start's built-in SSR dev server
    // (requests hang indefinitely). Deployment uses manual wrapper in netlify/functions/server/ instead.
    // Only enable for `netlify dev` when you need Netlify emulation features.
    // netlify(),
    viteReact(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  build: {
    minify: "esbuild", // TEMPORARY: baseline without terser
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: true,
  },
});
