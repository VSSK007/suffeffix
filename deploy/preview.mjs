// Local preview of the static site, with the same URL behaviour as the nginx config in deploy/nginx:
//   /lexicon/        -> lexicon/index.html
//   /lexicon         -> 301 /lexicon/        (a directory without its trailing slash)
//   anything missing -> 404.html with status 404
// No dependencies. Usage:  node deploy/preview.mjs [port]      (or: make preview)
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "apps", "web", "out");
const port = Number(process.argv[2] ?? process.env.PORT ?? 3000);

if (!existsSync(join(root, "index.html"))) {
  console.error(`No build found at ${root}\nRun "make site" (or "pnpm build" in apps/web) first.`);
  process.exit(1);
}

const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".csv": "text/csv; charset=utf-8",
  ".xml": "application/xml; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon",
  ".woff2": "font/woff2", ".zip": "application/zip", ".webmanifest": "application/manifest+json",
};

const isFile = (p) => existsSync(p) && statSync(p).isFile();
const isDir = (p) => existsSync(p) && statSync(p).isDirectory();

createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  const rel = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, "");
  const file = join(root, rel);
  if (file !== root && !file.startsWith(root + sep)) {
    res.writeHead(403).end("forbidden");
    return;
  }

  let target = null;
  let status = 200;
  if (isDir(file)) {
    if (!url.pathname.endsWith("/")) {
      res.writeHead(301, { Location: url.pathname + "/" + url.search }).end();
      return;
    }
    if (isFile(join(file, "index.html"))) target = join(file, "index.html");
  } else if (isFile(file)) {
    target = file;
  }
  if (!target) {
    status = 404;
    target = join(root, "404.html");
  }

  const body = readFileSync(target);
  res.writeHead(status, {
    "Content-Type": TYPES[extname(target)] ?? "application/octet-stream",
    "Content-Length": body.length,
    "Cache-Control": "no-cache",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(req.method === "HEAD" ? undefined : body);
  console.log(`${status} ${req.method} ${url.pathname}`);
}).listen(port, () => console.log(`\nSuffeffix preview: http://localhost:${port}   (Ctrl+C to stop)\n`));
