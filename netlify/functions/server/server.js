let r;function i(t){r={error:t,at:Date.now()},t instanceof Error?console.error("captured-error:",t.message,t.stack?.slice(0,500)):console.error("captured-error:",String(t))}typeof process<"u"&&typeof process.on=="function"?(process.on("uncaughtException",t=>i(t)),process.on("unhandledRejection",t=>i(t))):typeof globalThis.addEventListener=="function"&&(globalThis.addEventListener("error",t=>i(t.error??t)),globalThis.addEventListener("unhandledrejection",t=>i(t.reason)));function p(){if(!r)return;if(Date.now()-r.at>5e3){r=void 0;return}const{error:t}=r;return r=void 0,t}const f=`
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
`;function c(){return h("Error · Operiq AI","/robot-error.png","Error illustration","","","",`<button class="btn btn-primary" onclick="location.reload()" type="button">Refresh</button>
     <a class="btn btn-secondary" href="/">Back Home</a>`)}function h(t,o,e,n,a,d,l){return`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${t}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>${f}</style>
  </head>
  <body>
    <div class="container">
      <div class="figure">
        <img src="${o}" alt="${e}" />
      </div>
      
      <h1>${a}</h1>
      <p class="description">${d}</p>
      <div class="actions">${l}</div>
    </div>
  </body>
</html>`}let s;async function u(){return s||(s=import("./assets/server-CYbnEu78.js").then(t=>t.default??t)),s}async function m(t){if(t.status<500||!(t.headers.get("content-type")??"").includes("application/json"))return t;const e=await t.clone().text();if(!e.includes('"unhandled":true')||!e.includes('"message":"HTTPError"'))return t;const n=p();return n instanceof Error?console.error("SSR Error:",n.message,n.stack?.split(`
`).slice(0,5).join(`
`)):console.error("h3 swallowed SSR error:",e),new Response(c(),{status:500,headers:{"content-type":"text/html; charset=utf-8"}})}const x={async fetch(t,o,e){try{const a=await(await u()).fetch(t,o,e);return await m(a)}catch(n){return console.error(n),new Response(c(),{status:500,headers:{"content-type":"text/html; charset=utf-8"}})}}};export{x as default,c as r};
