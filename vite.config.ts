import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import netlify from "@netlify/vite-plugin-tanstack-start";

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      target: "react",
      autoCodeSplitting: true,
      codeSplittingOptions: { addHmr: false },
    }),
    ...tanstackStart(),
    netlify(),
    viteReact(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: true,
  },
});
