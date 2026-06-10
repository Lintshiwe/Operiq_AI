/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

/* ------------------------------------------------------------------ */
/*  Shared CSS                                                         */
/* ------------------------------------------------------------------ */

const ERROR_CSS = `
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  background: #212121;
  color: #ffffff;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.container {
  width: 100%;
  max-width: 880px;
  text-align: center;
  padding: 2rem 1.5rem;
}
.figure {
  max-width: 750px;
  margin: 0 auto 24px;
}
.figure img {
  width: 100%;
  height: auto;
  display: block;
}
.status-code {
  color: #10a37f;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.1em;
  margin-bottom: 8px;
}
h1 {
  font-size: 64px;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin-bottom: 12px;
}
.description {
  font-size: 24px;
  color: #a0a0a0;
  line-height: 1.5;
  margin-bottom: 48px;
  max-width: 640px;
  margin-left: auto;
  margin-right: auto;
}
.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}
.btn {
  height: 56px;
  border-radius: 16px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  outline: none;
  transition: all 0.2s ease;
}
.btn:focus-visible { outline: 2px solid #10a37f; outline-offset: 2px; }
.btn-primary {
  width: 180px;
  background: #ffffff;
  color: #212121;
}
.btn-primary:hover { background: #e8e8e8; }
.btn-secondary {
  width: 220px;
  background: transparent;
  color: #ffffff;
  border: 1px solid #3a3a3a;
}
.btn-secondary:hover { background: rgba(255,255,255,0.06); border-color: #555; }

@media (max-width: 1024px) {
  .container { padding: 2rem 1.5rem; }
  .figure { max-width: 600px; }
  h1 { font-size: 56px; }
  .description { font-size: 22px; margin-bottom: 40px; }
  .btn { height: 52px; }
  .btn-primary { width: 160px; }
  .btn-secondary { width: 190px; }
  .actions { gap: 14px; }
}

@media (max-width: 767px) {
  .container { padding: 1.5rem 1rem; }
  .figure { max-width: 340px; margin-bottom: 20px; }
  h1 { font-size: 36px; letter-spacing: -0.015em; }
  .description { font-size: 17px; margin-bottom: 32px; max-width: 100%; }
  .actions { flex-direction: column; gap: 12px; }
  .btn { height: 48px; width: 100%; max-width: 320px; }
  .btn-primary { width: 100%; }
  .btn-secondary { width: 100%; }
}
`;

/* ------------------------------------------------------------------ */
/*  Page renderers                                                     */
/* ------------------------------------------------------------------ */

export function renderErrorPage(): string {
  return pageHtml(
    "Error · Operiq AI",
    "/robot-error.png",
    "Error illustration",
    "",
    "",
    "",
    `<button class="btn btn-primary" onclick="location.reload()" type="button">Refresh</button>
     <a class="btn btn-secondary" href="/">Back Home</a>`,
  );
}

export function renderNotFoundPage(): string {
  return pageHtml(
    "Page not found · Operiq AI",
    "/error-404.png",
    "404 — Page not found",
    "404",
    "Page not found",
    "The page you're looking for doesn't exist or has been moved.",
    `<a class="btn btn-primary" href="/">Back Home</a>
     <a class="btn btn-secondary" href="/assistant">Go to Assistant</a>`,
  );
}

export function renderTimeoutPage(): string {
  return pageHtml(
    "Request timed out · Operiq AI",
    "/error-408.png",
    "408 — Request timed out",
    "408",
    "Request timed out",
    "The server took too long to respond. Please try again.",
    `<button class="btn btn-primary" onclick="location.reload()" type="button">Try Again</button>
     <a class="btn btn-secondary" href="/">Back Home</a>`,
  );
}

export function renderMaintenancePage(): string {
  return pageHtml(
    "Under maintenance · Operiq AI",
    "/maintenance.png",
    "Under maintenance",
    "",
    "Under maintenance",
    "We're performing scheduled maintenance and will be back shortly.",
    `<a class="btn btn-primary" href="mailto:support@operiq.ai">Contact Support</a>
     <a class="btn btn-secondary" href="/">Back Home</a>`,
  );
}

/* ------------------------------------------------------------------ */
/*  Template                                                           */
/* ------------------------------------------------------------------ */

function pageHtml(
  title: string,
  imageSrc: string,
  imageAlt: string,
  statusCode: string,
  heading: string,
  description: string,
  actions: string,
): string {
  const codeBlock = statusCode
    ? `<p class="status-code">${statusCode}</p>`
    : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>${ERROR_CSS}</style>
  </head>
  <body>
    <div class="container">
      <div class="figure">
        <img src="${imageSrc}" alt="${imageAlt}" />
      </div>
      ${codeBlock}
      <h1>${heading}</h1>
      <p class="description">${description}</p>
      <div class="actions">${actions}</div>
    </div>
  </body>
</html>`;
}