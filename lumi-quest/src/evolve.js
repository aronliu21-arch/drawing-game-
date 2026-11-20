// Evolution scene: glow, flicker between the old and new shapes, a flash, then the new form appears.
const Evolve = (() => {
  const W = 960, H = 540, TAU = Math.PI * 2, CALM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const seg = (k, a, b) => Math.max(0, Math.min(1, (k - a) / (b - a))), ease = k => 1 - Math.pow(1 - k, 3);
  // Draw a Lumi to its own canvas so it can be shown in colour or as a glowing white shape.
  function sprite(sp, evo, t) { const c = document.createElement('canvas'); c.width = 460; c.height = 420; const x = c.getContext('2d'); Art.lumi(x, SPECIES[sp], 230, 380, 4.2, t, evo, false); return c; }
  function white(src, col) { const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const x = c.getContext('2d'); x.drawImage(src, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col || '#fff'; x.fillRect(0, 0, c.width, c.height); return c; }
  const parts = [];
  function burst(n, col) { for (let i = 0; i < n; i++) { const a = Math.random() * TAU, v = 120 + Math.random() * 420; parts.push({ x: W / 2, y: 290, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, life: 1.4 + Math.random(), max: 2.4, r: 3 + Math.random() * 6, col: col || ['#fff9db', '#ffd43b', '#e5dbff', '#c5f6fa'][i % 4], star: i % 2 === 0 }); } }
  function caption(c, text, a) { if (!text || a <= 0) return; c.save(); c.globalAlpha = a; c.font = '400 34px "Lilita One", ui-rounded, system-ui, sans-serif'; c.textAlign = 'center'; c.lineJoin = 'round'; c.lineWidth = 8; c.strokeStyle = '#15131f'; c.strokeText(text, W / 2, 500); c.fillStyle = '#fff'; c.fillText(text, W / 2, 500); c.restore(); }
  // k runs from 0 to DURATION seconds.
  const DURATION = 7.2;
  function draw(c, st, k, dt, sounds) {
    const sp = SPECIES[st.sp], el = Art.EL[sp.el], t = k;
    if (!st.a) { st.a = sprite(st.sp, false, 0); st.b = sprite(st.sp, true, 0); st.aw = white(st.a); st.bw = white(st.b); st.fired = {}; parts.length = 0; }
    const once = (key, fn) => { if (!st.fired[key]) { st.fired[key] = 1; fn(); } };
    // background: night that warms into the element colour
    const g = c.createRadialGradient(W / 2, 280, 20, W / 2, 280, 620); g.addColorStop(0, Art.shade(el, -0.35 + 0.35 * seg(k, 0.8, 4))); g.addColorStop(1, '#0f0b24'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    // light rays
    const ray = seg(k, 0.8, 2.2) * (1 - seg(k, 5.6, 7)); if (ray > 0) { c.save(); c.translate(W / 2, 280); c.rotate(k * (CALM ? 0.1 : 0.6)); c.globalAlpha = 0.18 * ray; c.fillStyle = '#fff'; for (let i = 0; i < 14; i++) { c.rotate(TAU / 14); c.beginPath(); c.moveTo(0, 0); c.lineTo(-40, -720); c.lineTo(40, -720); c.fill(); } c.restore(); }
    // glow behind the creature
    const glow = seg(k, 0.6, 2) * (1 - seg(k, 5, 6.5) * 0.6); if (glow > 0) { const r = 140 + 40 * Math.sin(k * 4); const gg = c.createRadialGradient(W / 2, 290, 10, W / 2, 290, r * 1.6); gg.addColorStop(0, `rgba(255,249,219,${0.85 * glow})`); gg.addColorStop(1, 'rgba(255,249,219,0)'); c.fillStyle = gg; c.fillRect(0, 0, W, H); }
    // sparks spiralling in while it changes
    if (k > 1 && k < 4.4 && !CALM) for (let i = 0; i < 18; i++) { const p = ((k * 0.7 + i / 18) % 1), a = i * 2.4 + k * 3, r = 300 * (1 - p); c.globalAlpha = p; Art.star(c, W / 2 + Math.cos(a) * r, 290 + Math.sin(a) * r * 0.7, 3 + 4 * p, '#fff9db'); c.globalAlpha = 1; }
    // the creature
    const place = (img, sc, alpha) => { c.save(); c.globalAlpha = alpha; c.translate(W / 2, 290 + 0); c.scale(sc, sc); c.drawImage(img, -230, -270); c.restore(); };
    const bob = Math.sin(k * 3) * 0.02;
    if (k < 1.9) { const w = seg(k, 0.7, 1.9); place(st.a, 1 + bob, 1); if (w > 0) place(st.aw, 1 + bob, w); once('rise', () => sounds('rise')); }
    else if (k < 4.4) { // flicker between the two shapes, faster and faster
      // The shape swaps speed up, but never faster than 3 times a second (photosensitivity guidance).
      const p = k - 1.9; let flip = false; if (CALM) flip = p > 1.25; else { let at = 0, iv = 0.7; while (at + iv <= p) { at += iv; flip = !flip; iv = Math.max(0.34, iv - 0.12); } }
      const pulse = 1 + 0.05 * Math.sin(k * 6);
      place(flip ? st.bw : st.aw, (flip ? 1 : 0.95) * pulse, 1);
    }
    else if (k < 4.75) { place(st.bw, 1.1, 1); }
    else { // reveal
      const r = seg(k, 4.75, 5.4), sc = 1 + 0.25 * (1 - ease(r)) + Math.sin(k * 3) * 0.015; place(st.b, sc, 1); place(st.bw, sc, 1 - r);
      once('reveal', () => { burst(CALM ? 20 : 70); sounds('reveal'); });
    }
    // white flash
    const fl = k > 4.3 ? Math.max(0, 1 - Math.abs(k - 4.65) / 0.45) : 0; if (fl > 0) { c.fillStyle = `rgba(255,255,255,${(CALM ? 0.35 : 0.6) * fl})`; c.fillRect(0, 0, W, H); }
    // particles
    for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.life -= dt; if (p.life <= 0) { parts.splice(i, 1); continue; } p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 260 * dt; p.vx *= 0.99; c.globalAlpha = Math.min(1, p.life / p.max * 2); if (p.star) Art.star(c, p.x, p.y, p.r * 1.5, p.col); else Art.ell(c, p.x, p.y, p.r, p.r, p.col); } c.globalAlpha = 1;
    if (k > 5.4 && !CALM && Math.random() < 0.3) parts.push({ x: Math.random() * W, y: -10, vx: 0, vy: 60 + Math.random() * 80, life: 4, max: 4, r: 2 + Math.random() * 3, col: '#fff9db', star: true });
    // words
    const nm = st.nick || sp.name;
    caption(c, `What? ${nm} is glowing!`, seg(k, 0.3, 0.8) * (1 - seg(k, 1.7, 2)));
    caption(c, `${nm} is evolving!`, seg(k, 2, 2.3) * (1 - seg(k, 4.2, 4.4)));
    caption(c, `${nm} evolved into ${sp.evo}!`, seg(k, 5, 5.4));
  }
  return { draw, DURATION };
})();
