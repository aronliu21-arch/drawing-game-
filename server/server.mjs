// Home server: serves the game and passes messages between devices on the
// same Wi-Fi. No internet and no packages needed.
//
//   npm start                 → http://localhost:8080 (and http://<this computer's IP>:8080 on the iPad)
//   PORT=3000 npm start
import http from 'node:http';
import os from 'node:os';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PORT = Number(process.env.PORT || 8080);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png' };
const STATIC_DIRS = ['/index.html', '/css/', '/js/', '/vendor/', '/icons/', '/manifest.webmanifest'];

// code → { host: res|null, hostId, guests: Map(id → res), touched }
const rooms = new Map();
const sse = (res) => { res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-store', connection: 'keep-alive' }); res.write('retry: 1500\n\n'); };
const send = (res, data) => { try { res.write(`data: ${JSON.stringify(data)}\n\n`); } catch (e) { /* closed */ } };
const json = (res, code, obj) => { res.writeHead(code, { 'content-type': 'application/json', 'cache-control': 'no-store' }); res.end(JSON.stringify(obj)); };

async function body(req) {
  let s = '';
  for await (const c of req) { s += c; if (s.length > 512 * 1024) throw new Error('big'); }
  return JSON.parse(s || '{}');
}

// forget rooms nobody has used for 3 hours
setInterval(() => { const cut = Date.now() - 3 * 3600e3; for (const [k, r] of rooms) if (r.touched < cut && !r.host) rooms.delete(k); }, 60e3).unref();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const path = url.pathname;
  try {
    if (path === '/relay/health') return json(res, 200, { ok: true });
    if (path === '/relay/create' && req.method === 'POST') {
      const { id } = await body(req);
      let code; do { code = String(1000 + Math.floor(Math.random() * 9000)); } while (rooms.has(code));
      rooms.set(code, { host: null, hostId: String(id || ''), guests: new Map(), touched: Date.now() });
      return json(res, 200, { code });
    }
    const m = path.match(/^\/relay\/(\d{4})\/(host|check|up|down|guest\/([\w-]{1,40}))$/);
    if (m) {
      const room = rooms.get(m[1]);
      if (!room) return json(res, 404, { ok: false });
      room.touched = Date.now();
      const what = m[2];
      if (what === 'check') return json(res, room.host ? 200 : 404, { ok: !!room.host });
      if (what === 'host') {
        sse(res);
        room.host = res;
        const ka = setInterval(() => res.write(': ka\n\n'), 15000);
        req.on('close', () => {
          clearInterval(ka);
          if (room.host === res) {
            room.host = null;
            for (const g of room.guests.values()) send(g, { t: 'hostLeft' });
          }
        });
        return;
      }
      if (what.startsWith('guest/')) {
        const gid = m[3];
        if (!room.host) return json(res, 404, { ok: false });
        sse(res);
        const old = room.guests.get(gid);
        if (old) try { old.end(); } catch (e) { /* ignore */ }
        room.guests.set(gid, res);
        const ka = setInterval(() => res.write(': ka\n\n'), 15000);
        req.on('close', () => {
          clearInterval(ka);
          if (room.guests.get(gid) === res) { room.guests.delete(gid); if (room.host) send(room.host, { from: gid, leave: true }); }
        });
        return;
      }
      if (what === 'up' && req.method === 'POST') {
        const { from, msg } = await body(req);
        if (room.host && typeof from === 'string') send(room.host, { from, msg });
        return json(res, 200, { ok: true });
      }
      if (what === 'down' && req.method === 'POST') {
        const batch = await body(req);
        if (Array.isArray(batch)) for (const { to, msg } of batch) { const g = room.guests.get(to); if (g) send(g, msg); }
        return json(res, 200, { ok: true });
      }
      return json(res, 405, { ok: false });
    }

    // static files
    let p = decodeURIComponent(path);
    if (p === '/') p = '/index.html';
    p = normalize(p);
    if (!STATIC_DIRS.some((d) => p === d || p.startsWith(d))) { res.writeHead(404); res.end('Not found'); return; }
    const data = await readFile(join(ROOT, p));
    res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream', 'cache-control': 'no-cache' });
    res.end(data);
  } catch (e) {
    if (!res.headersSent) { res.writeHead(e.code === 'ENOENT' ? 404 : 400); res.end(); }
  }
});

server.listen(PORT, '0.0.0.0', () => {
  const ips = Object.values(os.networkInterfaces()).flat().filter((i) => i && i.family === 'IPv4' && !i.internal).map((i) => i.address);
  console.log(`Doodle Dash is running.\n  On this computer:  http://localhost:${PORT}`);
  for (const ip of ips) console.log(`  On the iPad/iPhone (same Wi-Fi):  http://${ip}:${PORT}`);
});
