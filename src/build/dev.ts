import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { watch } from "chokidar";
import { build } from "./index.ts";
import { CONTENT_DIR, DIST_DIR, PUBLIC_DIR, ROOT } from "./paths.ts";

const PORT = Number(process.env.PORT ?? 4173);
const SITE_SRC = path.join(ROOT, "src", "site");

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};

function safeJoin(root: string, requestPath: string): string | null {
  const decoded = decodeURIComponent(requestPath.split("?")[0] ?? "/");
  const cleaned = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const full = path.join(root, cleaned);
  if (!full.startsWith(root)) return null;
  return full;
}

function sendFile(res: http.ServerResponse, filePath: string): void {
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { "Content-Type": MIME[ext] ?? "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
}

function serveDist(
  req: http.IncomingMessage,
  res: http.ServerResponse,
): void {
  const urlPath = req.url ?? "/";
  const candidate = safeJoin(DIST_DIR, urlPath);
  if (!candidate) {
    res.writeHead(400).end("Bad request");
    return;
  }

  let filePath = candidate;
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  } else if (!path.extname(filePath) && fs.existsSync(`${filePath}.html`)) {
    filePath = `${filePath}.html`;
  } else if (
    !path.extname(filePath) &&
    fs.existsSync(path.join(filePath, "index.html"))
  ) {
    filePath = path.join(filePath, "index.html");
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    sendFile(res, filePath);
    return;
  }

  const notFound = path.join(DIST_DIR, "404.html");
  if (fs.existsSync(notFound)) {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    fs.createReadStream(notFound).pipe(res);
    return;
  }

  res.writeHead(404).end("Not found");
}

function rebuild(): void {
  try {
    build();
    console.log(`[dev] rebuilt ${new Date().toISOString()}`);
  } catch (err) {
    console.error("[dev] build failed:", err);
  }
}

rebuild();

const server = http.createServer(serveDist);
server.listen(PORT, () => {
  console.log(`[dev] serving dist/ at http://127.0.0.1:${PORT}/`);
});

const watcher = watch(
  [CONTENT_DIR, SITE_SRC, PUBLIC_DIR, path.join(ROOT, "src", "build")],
  {
    ignoreInitial: true,
    ignored: ["**/node_modules/**", "**/dist/**"],
  },
);

let timer: NodeJS.Timeout | undefined;
watcher.on("all", (event, filePath) => {
  console.log(`[dev] ${event} ${path.relative(ROOT, filePath)}`);
  clearTimeout(timer);
  timer = setTimeout(rebuild, 100);
});
