// Netlify Function wrapper for TanStack Start SSR server.
// During build, dist/server/server.js and dist/server/assets/ are
// copied here so relative imports resolve correctly.

let server;

async function getServer() {
  if (!server) {
    const mod = await import("./server.js");
    server = mod.default ?? mod;
  }
  return server;
}

/**
 * Netlify Function v2 streaming handler.
 * Receives a standard Web API Request, forwards it to the
 * TanStack Start SSR server, and returns a Response.
 */
export default async (request, context) => {
  const app = await getServer();
  return app.fetch(request, {}, context);
};

export const config = {
  path: "/*",
};
