// Netlify Function wrapper for TanStack Start SSR.
// server.js and assets/ are copied here during build:netlify.

let server;

async function get() {
  if (!server) {
    const mod = await import("./server.js");
    server = mod.default ?? mod;
  }
  return server;
}

export default async (request, context) => {
  const app = await get();
  return app.fetch(request, {}, context);
};
