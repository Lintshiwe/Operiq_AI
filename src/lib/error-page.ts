export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Something went wrong · Operiq AI</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
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
      .robot-figure {
        max-width: 750px;
        margin: 0 auto 24px;
      }
      .robot-figure img {
        width: 100%;
        height: auto;
        display: block;
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
      .btn-refresh {
        width: 180px;
        background: #ffffff;
        color: #212121;
      }
      .btn-refresh:hover { background: #e8e8e8; }
      .btn-home {
        width: 220px;
        background: transparent;
        color: #ffffff;
        border: 1px solid #3a3a3a;
      }
      .btn-home:hover { background: rgba(255,255,255,0.06); border-color: #555; }

      @media (max-width: 1024px) {
        .container { padding: 2rem 1.5rem; }
        .robot-figure { max-width: 600px; }
        h1 { font-size: 56px; }
        .description { font-size: 22px; margin-bottom: 40px; }
        .btn { height: 52px; }
        .btn-refresh { width: 160px; }
        .btn-home { width: 190px; }
        .actions { gap: 14px; }
      }

      @media (max-width: 767px) {
        .container { padding: 1.5rem 1rem; }
        .robot-figure { max-width: 340px; margin-bottom: 20px; }
        h1 { font-size: 36px; letter-spacing: -0.015em; }
        .description { font-size: 17px; margin-bottom: 32px; max-width: 100%; }
        .actions { flex-direction: column; gap: 12px; }
        .btn { height: 48px; width: 100%; max-width: 320px; }
        .btn-refresh { width: 100%; }
        .btn-home { width: 100%; }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="robot-figure">
        <img src="/robot-error.png" alt="Error illustration" />
      </div>
      <h1>Something went wrong</h1>
      <p class="description">An unexpected error occurred. Please try refreshing the page or head back home.</p>
      <div class="actions">
        <button class="btn btn-refresh" onclick="location.reload()" type="button">Refresh</button>
        <a class="btn btn-home" href="/">Back Home</a>
      </div>
    </div>
  </body>
</html>`;
}
