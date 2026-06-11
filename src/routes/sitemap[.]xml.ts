/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://operiq-ai.netlify.app";

interface SitemapEntry {
  path: string;
  changefreq?: "weekly" | "monthly" | "daily";
  priority?: string;
  lastmod: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const TODAY = new Date().toISOString().split("T")[0];
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "daily", priority: "1.0", lastmod: TODAY },
          { path: "/assistant", changefreq: "daily", priority: "1.0", lastmod: TODAY },
          { path: "/email", changefreq: "monthly", priority: "0.8", lastmod: TODAY },
          { path: "/meetings", changefreq: "monthly", priority: "0.8", lastmod: TODAY },
          { path: "/planner", changefreq: "monthly", priority: "0.8", lastmod: TODAY },
          { path: "/research", changefreq: "monthly", priority: "0.8", lastmod: TODAY },
          { path: "/code", changefreq: "monthly", priority: "0.8", lastmod: TODAY },
          { path: "/image", changefreq: "monthly", priority: "0.8", lastmod: TODAY },
          { path: "/video", changefreq: "monthly", priority: "0.8", lastmod: TODAY },
          { path: "/prompts", changefreq: "monthly", priority: "0.7", lastmod: TODAY },
          { path: "/templates", changefreq: "monthly", priority: "0.7", lastmod: TODAY },
          { path: "/docs", changefreq: "monthly", priority: "0.6", lastmod: TODAY },
          { path: "/settings", changefreq: "monthly", priority: "0.5", lastmod: TODAY },
          { path: "/login", changefreq: "monthly", priority: "0.4", lastmod: TODAY },
          { path: "/signup", changefreq: "monthly", priority: "0.4", lastmod: TODAY },
        ];

        const urls = entries
          .map((e) =>
            [
              `  <url>`,
              `    <loc>${BASE_URL}${e.path}</loc>`,
              `    <lastmod>${e.lastmod}</lastmod>`,
              e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
              e.priority ? `    <priority>${e.priority}</priority>` : null,
              `  </url>`,
            ]
              .filter(Boolean)
              .join("\n"),
          )
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});