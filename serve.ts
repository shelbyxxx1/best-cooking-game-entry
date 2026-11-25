import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('./game', import.meta.url)));
const options = process.argv.slice(2);
const portOption = options.indexOf('--port');
const portValue = portOption < 0 ? 8080 : Number(options[portOption + 1]);
const port = Number.isInteger(portValue) && portValue > 0 && portValue < 65536 ? portValue : 8080;
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end('bad request');
    return;
  }
  if (pathname.endsWith('/')) pathname += 'index.html';
  const filename = resolve(join(root, normalize(pathname)));
  if (filename !== root && !filename.startsWith(root + sep)) {
    response.writeHead(403).end('forbidden');
    return;
  }
  let size;
  try {
    const file = statSync(filename);
    if (!file.isFile()) throw new Error('not a file');
    size = file.size;
  } catch {
    response.writeHead(404).end('not found');
    return;
  }
  response.writeHead(200, {
    'content-type': mimeTypes[extname(filename).toLowerCase()] ?? 'application/octet-stream',
    'content-length': size,
    'cache-control': 'no-store',
  });
  createReadStream(filename).pipe(response);
}).listen(port, '127.0.0.1', () => {
  console.log(`Dapur Kilat is ready on http://localhost:${port}`);
});
