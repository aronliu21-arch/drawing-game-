// Two ways for devices to talk. Both give the same small interface:
//   host: hostRoom({ myId, onMessage(fromId, msg), onLeave(id) }) → { code, send(toId, msg), close() }
//   guest: joinRoom(code, { myId, onMessage(msg), onStatus(s) }) → { send(msg), close() }
//
// 'p2p'   (GitHub Pages, any network): devices connect directly with WebRTC.
//         The free PeerJS cloud service only does the hand-shake.
// 'relay' (npm start on a computer at home): the computer passes messages
//         along. Works on home Wi-Fi with no internet.

const PEER_PREFIX = 'doodle-dash-room-';
const randomCode = () => String(1000 + Math.floor(Math.random() * 9000));

export async function detectMode() {
  const q = new URLSearchParams(location.search);
  if (q.get('net') === 'p2p' || q.has('peer')) return 'p2p';
  if (q.get('net') === 'relay') return 'relay';
  if (/github\.io$/.test(location.hostname) || location.protocol === 'file:') return 'p2p';
  try {
    const r = await fetch('relay/health', { cache: 'no-store' });
    if (r.ok && (await r.json()).ok) return 'relay';
  } catch (e) { /* not our server */ }
  return 'p2p';
}

export function makeNet(mode) { return mode === 'relay' ? relayNet() : p2pNet(); }

// ---------------- peer-to-peer ----------------
function peerOptions() {
  const q = new URLSearchParams(location.search).get('peer'); // tests: ?peer=localhost:9001
  if (q) { const [host, port] = q.split(':'); return { host, port: Number(port), path: '/', secure: false, debug: 0 }; }
  return { debug: 0 };
}

function loadPeerJs() {
  if (window.Peer) return Promise.resolve();
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'vendor/peerjs.min.js'; s.onload = res; s.onerror = () => rej(new Error('peerjs'));
    document.head.appendChild(s);
  });
}

function p2pNet() {
  return {
    mode: 'p2p',
    async hostRoom({ onMessage, onLeave }) {
      await loadPeerJs();
      const conns = new Map(); // playerId → conn
      let peer, code;
      for (let tries = 0; ; tries++) {
        code = randomCode();
        try {
          peer = await new Promise((resolve, reject) => {
            const p = new window.Peer(PEER_PREFIX + code, peerOptions());
            let done = false;
            const timer = setTimeout(() => { if (!done) { done = true; p.destroy(); reject(new Error('timeout')); } }, 15000);
            p.on('open', () => { if (done) return; done = true; clearTimeout(timer); resolve(p); });
            p.on('error', (e) => { if (done) return; done = true; clearTimeout(timer); p.destroy(); reject(e); });
          });
          break;
        } catch (e) {
          if (e.type !== 'unavailable-id' || tries > 5) throw e;
        }
      }
      peer.on('error', () => { /* single connection errors are handled per connection */ });
      peer.on('disconnected', () => { try { peer.reconnect(); } catch (e) { /* ignore */ } });
      peer.on('connection', (conn) => {
        let id = null;
        conn.on('data', (msg) => {
          if (!msg || typeof msg !== 'object') return;
          if (!id) {
            if (msg.t !== 'hello' || typeof msg.id !== 'string') return;
            id = msg.id.slice(0, 40);
            const old = conns.get(id);
            if (old && old !== conn) { old._replaced = true; try { old.close(); } catch (e) { /* ignore */ } }
            conns.set(id, conn);
          }
          onMessage(id, msg);
        });
        const gone = () => { if (id && conns.get(id) === conn && !conn._replaced) { conns.delete(id); onLeave(id); } };
        conn.on('close', gone);
        conn.on('error', gone);
      });
      return {
        code,
        send(to, msg) { const c = conns.get(to); if (c && c.open) c.send(msg); },
        close() { try { peer.destroy(); } catch (e) { /* ignore */ } },
      };
    },

    async joinRoom(code, { myId, onMessage, onStatus }) {
      await loadPeerJs();
      let closed = false, conn = null, helloMsg = null, peer = null;
      const getPeer = () => new Promise((resolve, reject) => {
        if (peer && !peer.destroyed && peer.open) return resolve(peer);
        if (peer) { try { peer.destroy(); } catch (e) { /* ignore */ } }
        peer = new window.Peer(peerOptions());
        const timer = setTimeout(() => reject(new Error('timeout')), 15000);
        peer.on('open', () => { clearTimeout(timer); resolve(peer); });
        peer.on('error', (e) => { clearTimeout(timer); reject(e); });
      });
      const connect = async () => {
        const p = await getPeer();
        return new Promise((resolve, reject) => {
          const c = p.connect(PEER_PREFIX + code, { reliable: true, serialization: 'json' });
          const timer = setTimeout(() => reject(new Error('notFound')), 12000);
          const onErr = (e) => { if (e.type === 'peer-unavailable') { clearTimeout(timer); reject(new Error('notFound')); } };
          p.on('error', onErr);
          c.on('open', () => { clearTimeout(timer); p.off('error', onErr); resolve(c); });
        });
      };
      const wire = (c) => {
        conn = c;
        c.on('data', (m) => onMessage(m));
        c.on('close', () => { if (!closed && conn === c) reconnectLoop(); });
        if (helloMsg) c.send(helloMsg);
      };
      const reconnectLoop = async () => {
        onStatus && onStatus('reconnecting');
        for (let i = 0; i < 20 && !closed; i++) {
          await new Promise((r) => setTimeout(r, 1500));
          try { wire(await connect()); onStatus && onStatus('ok'); return; } catch (e) { /* try again */ }
        }
        if (!closed) onStatus && onStatus('lost');
      };
      wire(await connect());
      return {
        send(msg) {
          if (msg.t === 'hello') helloMsg = { ...msg, id: myId };
          if (conn && conn.open) conn.send(msg.t === 'hello' ? helloMsg : msg);
        },
        close() { closed = true; try { conn && conn.close(); peer && peer.destroy(); } catch (e) { /* ignore */ } },
      };
    },
  };
}

// ---------------- relay through our own small server ----------------
function relayNet() {
  const post = (path, body) => fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  return {
    mode: 'relay',
    async hostRoom({ myId, onMessage, onLeave }) {
      const r = await post('relay/create', { id: myId });
      if (!r.ok) throw new Error('create');
      const { code } = await r.json();
      const es = new EventSource(`relay/${code}/host?id=${encodeURIComponent(myId)}`);
      es.onmessage = (ev) => {
        const d = JSON.parse(ev.data);
        if (d.leave) onLeave(d.from); else onMessage(d.from, d.msg);
      };
      // batch outgoing messages into one request per tick
      let queue = [], flushing = false;
      const flush = async () => {
        if (flushing || !queue.length) return;
        flushing = true;
        const batch = queue; queue = [];
        try { await post(`relay/${code}/down`, batch); } catch (e) { /* dropped; next state update repairs it */ }
        flushing = false;
        if (queue.length) flush();
      };
      return {
        code,
        send(to, msg) { queue.push({ to, msg }); queueMicrotask(flush); },
        close() { es.close(); },
      };
    },

    async joinRoom(code, { myId, onMessage, onStatus }) {
      const check = await fetch(`relay/${code}/check`, { cache: 'no-store' });
      if (!check.ok) throw new Error('notFound');
      let helloMsg = null;
      const es = new EventSource(`relay/${code}/guest/${encodeURIComponent(myId)}`);
      await new Promise((resolve, reject) => { es.onopen = resolve; setTimeout(() => reject(new Error('timeout')), 10000); });
      es.onopen = () => { onStatus && onStatus('ok'); if (helloMsg) post(`relay/${code}/up`, { from: myId, msg: helloMsg }); };
      es.onerror = () => { onStatus && onStatus('reconnecting'); };
      es.onmessage = (ev) => onMessage(JSON.parse(ev.data));
      // keep strokes in order: one request at a time
      let chain = Promise.resolve();
      return {
        send(msg) {
          if (msg.t === 'hello') helloMsg = msg;
          chain = chain.then(() => post(`relay/${code}/up`, { from: myId, msg }).catch(() => {}));
        },
        close() { es.close(); },
      };
    },
  };
}
