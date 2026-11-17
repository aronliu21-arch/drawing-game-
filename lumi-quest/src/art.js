// All art is drawn with canvas. No image files.
const Art = (() => {
  const TAU = Math.PI * 2;
  const INK = '#15131f';
  function shade(hex, amt) { // amt -1..1
    const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const f = amt < 0 ? 0 : 255, p = Math.abs(amt);
    r = Math.round(r + (f - r) * p); g = Math.round(g + (f - g) * p); b = Math.round(b + (f - b) * p);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  function ell(c, x, y, rx, ry, fill, stroke, lw) { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 2.5; c.stroke(); } }
  function rr(c, x, y, w, h, r, fill, stroke, lw) { c.beginPath(); c.roundRect(x, y, w, h, r); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 2.5; c.stroke(); } }
  function star(c, x, y, r, fill, stroke, lw) { c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * 0.45 : r; c.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } c.closePath(); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1.5; c.stroke(); } }
  function shadow(c, x, y, rx) { ell(c, x, y, rx, rx * 0.3, 'rgba(0,0,0,.28)'); }

  // ---------- weapons ----------
  function weapon(c, w) {
    // Drawn pointing up from the hand at (0,0). w.style picks the design inside each kind.
    const col = w.col || '#cfd8dc', k = w.kind, st = w.style || '', dk = shade(col, -0.3), T = performance.now() / 1000;
    c.lineJoin = 'round'; c.lineCap = 'round';
    const rod = (len, colr, wdt) => rr(c, -(wdt || 4) / 2, -len, wdt || 4, len + 6, 2, colr || '#7b5a3a', INK, 1.8);
    const glowOn = (g, b) => { c.shadowColor = g; c.shadowBlur = b; };
    if (k === 'sword') {
      if (st === 'saber') { c.beginPath(); c.moveTo(-3, -6); c.quadraticCurveTo(-6, -26, 2, -44); c.quadraticCurveTo(8, -28, 4, -6); c.closePath(); c.fillStyle = col; c.fill(); c.strokeStyle = INK; c.lineWidth = 2; c.stroke(); c.beginPath(); c.moveTo(-12, -6); c.quadraticCurveTo(0, -1, 12, -9); c.strokeStyle = INK; c.lineWidth = 5; c.stroke(); c.strokeStyle = '#adb5bd'; c.lineWidth = 2.5; c.stroke(); ell(c, 0, -6, 3, 3, '#4dabf7', INK, 1.2); }
      else {
        const wd = st === 'broad' ? 6 : st === 'star' ? 5 : 4, len = st === 'star' ? 46 : st === 'broad' ? 38 : 34;
        c.save(); if (st === 'star') glowOn('#ffe066', 12);
        c.beginPath(); c.moveTo(-wd, -6); c.lineTo(-wd, -len); c.lineTo(0, -len - 9); c.lineTo(wd, -len); c.lineTo(wd, -6); c.closePath(); c.fillStyle = col; c.fill(); c.strokeStyle = INK; c.lineWidth = 2; c.stroke(); c.restore();
        if (st === 'lantern') { c.strokeStyle = '#ffd43b'; c.lineWidth = 1.6; c.beginPath(); for (let y = -8; y > -len; y -= 5) c.lineTo((y / 5) % 2 ? 2.5 : -2.5, y); c.stroke(); }
        else { c.beginPath(); c.moveTo(0, -8); c.lineTo(0, -len + 2); c.strokeStyle = st === 'star' ? '#7048e8' : 'rgba(255,255,255,.7)'; c.lineWidth = 1.6; c.stroke(); }
        if (st === 'star') star(c, 0, -6, 9, '#ffe066', INK, 1.5);
        else if (st === 'broad') { ell(c, 0, -6, 10, 5, w.trim || '#b5712c', INK, 1.8); }
        else rr(c, -9, -8, 18, 5, 2, w.trim || '#f4b400', INK, 2);
        rr(c, -2.5, -4, 5, 10, 2, '#6d4c2f', INK, 2); ell(c, 0, 7, 3.2, 3.2, st === 'lantern' ? '#e03131' : (w.trim || '#f4b400'), INK, 1.4);
      }
    } else if (k === 'bow') {
      const r = st === 'recurve' || st === 'star' || st === 'crystal' ? 32 : 28, cy = -14, cx = -r + 10, a0 = st === 'recurve' ? 1.15 : 1.05;
      c.save(); if (st === 'crystal' || st === 'star') glowOn(st === 'star' ? '#ffe066' : '#7fe3ff', 10);
      c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.arc(cx, cy, r, -a0, a0); c.stroke(); c.strokeStyle = col; c.lineWidth = 3.2; c.stroke(); c.restore();
      const tip = s => [cx + r * Math.cos(s * a0), cy + r * Math.sin(s * a0)];
      const [t1, t2] = [tip(-1), tip(1)];
      c.strokeStyle = '#f8f9fa'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(t1[0], t1[1]); c.lineTo(t2[0], t2[1]); c.stroke();
      for (const [p, s] of [[t1, -1], [t2, 1]]) {
        if (st === 'twig') ell(c, p[0] + 3, p[1] + s * -2, 3.5, 6, '#51cf66', INK, 1.2, 0.6 * s);
        else if (st === 'recurve') { c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.arc(p[0] + 4, p[1], 4, Math.PI, Math.PI * (s < 0 ? 1.8 : 0.2), s > 0); c.stroke(); }
        else if (st === 'tide') { c.beginPath(); c.moveTo(p[0], p[1]); c.quadraticCurveTo(p[0] + 10, p[1] + s * -2, p[0] + 6, p[1] + s * 8); c.fillStyle = '#66d9e8'; c.fill(); c.strokeStyle = INK; c.lineWidth = 1.2; c.stroke(); }
        else if (st === 'crystal') { c.beginPath(); c.moveTo(p[0], p[1] + s * 2); c.lineTo(p[0] + 3, p[1] + s * -9); c.lineTo(p[0] + 6, p[1] + s * 2); c.fillStyle = '#c5f6fa'; c.fill(); c.strokeStyle = INK; c.lineWidth = 1.2; c.stroke(); }
        else if (st === 'star') star(c, p[0], p[1], 5.5, '#ffe066', INK, 1.2);
        else if (st === 'lantern') { c.strokeStyle = '#ffd43b'; c.lineWidth = 2; c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(p[0] + 2, p[1] + 9); c.stroke(); ell(c, p[0] + 2, p[1] + 11, 2.5, 2.5, '#e03131'); }
      }
      if (st === 'wrapped') for (const y of [-26, -2]) rr(c, cx + r * Math.cos(Math.asin((y - cy) / r)) - 3, y - 2, 6, 4, 1, '#6d4c2f');
      rr(c, 6, -20, 6, 12, 2, st === 'star' ? '#7048e8' : '#6d4c2f', INK, 1.5);
    } else if (k === 'wand') {
      rod(32, st === 'scepter' ? '#e9ecef' : st === 'star' ? '#ffd43b' : '#7b5a3a', 4);
      c.save(); glowOn(col, 10);
      if (st === 'twig') { ell(c, 4, -36, 4, 8, '#51cf66', INK, 1.4, 0.6); ell(c, -3, -34, 3, 6, '#8ce99a', INK, 1.2, -0.6); }
      else if (st === 'orb') { ell(c, 0, -38, 7, 7, col, INK, 1.8); rr(c, -5, -32, 10, 3, 1, '#8d6e4a', INK, 1); ell(c, -2, -40, 2, 2, '#fff'); }
      else if (st === 'abacus') { c.strokeStyle = INK; c.lineWidth = 1.5; for (let i = 0; i < 3; i++) { const y = -24 - i * 7; c.beginPath(); c.moveTo(-8, y); c.lineTo(8, y); c.stroke(); for (let j = -1; j <= 1; j++) ell(c, j * 5, y, 2.6, 2.6, ['#ff8787', '#8ce99a', '#74c0fc'][(i + j + 3) % 3], INK, 0.8); } }
      else if (st === 'scepter') { poly4(c, [[-8, -32], [-8, -42], [-4, -37], [0, -44], [4, -37], [8, -42], [8, -32]], '#ffd43b'); ell(c, 0, -36, 2.5, 2.5, '#4dabf7'); }
      else { star(c, 0, -40, 12, col, INK, 1.6); c.strokeStyle = '#f783ac'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-2, -28); c.quadraticCurveTo(-12, -22, -8, -14); c.moveTo(2, -28); c.quadraticCurveTo(10, -20, 6, -12); c.stroke(); }
      c.restore();
    } else if (k === 'staff') {
      rod(40, '#7b5a3a', 5);
      c.save(); glowOn(col, 14);
      if (st === 'moon') { c.beginPath(); c.arc(0, -48, 10, 0.4, Math.PI * 2 - 0.4); c.arc(5, -48, 8, Math.PI * 2 - 0.6, 0.6, true); c.closePath(); c.fillStyle = col; c.fill(); c.strokeStyle = INK; c.lineWidth = 1.6; c.stroke(); }
      else if (st === 'tide') { ell(c, 0, -48, 9, 9, 'rgba(102,217,232,.9)', INK, 1.8); c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.arc(0, -48, 5, T * 3, T * 3 + 4); c.stroke(); c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.arc(0, -48, 13, Math.PI * 0.9, Math.PI * 2.1); c.stroke(); }
      else if (st === 'crystal') { for (const [x, h, r] of [[-5, 12, -0.3], [0, 18, 0], [5, 11, 0.3]]) { c.save(); c.translate(x, -40); c.rotate(r); poly4(c, [[-3.5, 0], [0, -h], [3.5, 0]], col); c.restore(); } }
      else if (st === 'gear') { c.save(); c.translate(0, -48); c.rotate(T); for (let i = 0; i < 8; i++) { c.rotate(Math.PI / 4); rr(c, -2.5, -12, 5, 5, 1, col, INK, 1); } ell(c, 0, 0, 8, 8, col, INK, 1.6); ell(c, 0, 0, 3, 3, '#7b5a3a'); c.restore(); }
      else { c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, -40); c.lineTo(0, -44); c.stroke(); rr(c, -7, -58, 14, 15, 5, col, INK, 1.8); rr(c, -8, -60, 16, 3, 1, '#ffd43b', INK, 1); ell(c, 0, -50, 3, 4, '#fff3bf'); }
      c.restore();
    } else if (k === 'spear') {
      const lance = st === 'lance', jav = st === 'javelin';
      rr(c, -2, -38, 4, 46, 2, jav ? '#c9a66b' : '#8d6e4a', INK, 2);
      c.save(); if (lance) glowOn('#7fe3ff', 10);
      if (lance) poly4(c, [[-6, -36], [0, -60], [6, -36], [0, -32]], col);
      else poly4(c, [[-5, -36], [0, -52], [5, -36]], col);
      c.restore();
      if (jav) for (const s of [-1, 1]) poly4(c, [[0, 4], [s * 6, 10], [0, 0]], '#ff8787');
      else if (!lance) { poly4(c, [[2, -34], [14, -31], [2, -27]], '#e03131'); }
    } else if (k === 'axe') {
      rr(c, -2.5, -40, 5, 46, 2, '#8d6e4a', INK, 2);
      c.beginPath(); c.moveTo(2, -38); c.quadraticCurveTo(22, -40, 18, -22); c.quadraticCurveTo(10, -26, 2, -24); c.closePath(); c.fillStyle = col; c.fill(); c.strokeStyle = INK; c.lineWidth = 2; c.stroke();
      c.beginPath(); c.moveTo(-2, -38); c.quadraticCurveTo(-14, -36, -12, -26); c.lineTo(-2, -26); c.closePath(); c.fillStyle = dk; c.fill(); c.stroke();
      for (let i = 0; i < 3; i++) ell(c, 9 + i * 3, -31 + i * 2, 1.6, 1.6, ['#ff8787', '#ffd43b', '#74c0fc'][i]);
    } else if (k === 'trident') {
      rr(c, -2, -38, 4, 46, 2, '#8d6e4a', INK, 2);
      c.fillStyle = col; c.strokeStyle = INK; c.lineWidth = 2;
      poly4(c, [[-5, -36], [0, -52], [5, -36]], col);
      for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * 3, -36); c.quadraticCurveTo(sx * 12, -36, sx * 10, -48); c.lineTo(sx * 7, -40); c.closePath(); c.fillStyle = col; c.fill(); c.stroke(); }
    } else if (k === 'hammer') {
      rr(c, -2.5, -34, 5, 40, 2, '#8d6e4a', INK, 2); rr(c, -13, -46, 26, 15, 3, col, INK, 2);
      c.save(); c.translate(0, -38.5); c.rotate(T); for (let i = 0; i < 6; i++) { c.rotate(Math.PI / 3); rr(c, -1.5, -7, 3, 3, 1, '#ffd43b'); } ell(c, 0, 0, 4.5, 4.5, '#ffd43b', INK, 1.5); c.restore();
    } else if (k === 'boomerang') {
      c.beginPath(); c.moveTo(-4, 4); c.quadraticCurveTo(-4, -26, 14, -40); c.lineTo(20, -34); c.quadraticCurveTo(6, -22, 6, 0); c.quadraticCurveTo(-10, -6, -26, -2); c.lineTo(-26, -10); c.quadraticCurveTo(-12, -14, -4, 4); c.closePath();
      c.fillStyle = col; c.fill(); c.strokeStyle = INK; c.lineWidth = 2; c.stroke(); for (let i = 0; i < 3; i++) ell(c, 4 + i * 4, -14 - i * 8, 1.8, 1.8, ['#ff8787', '#ffd43b', '#74c0fc'][i]);
    } else if (k === 'crossbow') {
      rr(c, -3, -30, 6, 36, 2, '#8d6e4a', INK, 2);
      c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.arc(0, -10, 20, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); c.strokeStyle = col; c.lineWidth = 2.5; c.stroke();
      c.strokeStyle = '#f8f9fa'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-17, -20); c.lineTo(0, -14); c.lineTo(17, -20); c.stroke();
      rr(c, -1.5, -40, 3, 16, 1, '#dee2e6', INK, 1); ell(c, 0, -10, 4, 4, '#ffd43b', INK, 1.2);
    }
    // Items with a special power twinkle.
    if (w.perks && w.perks.length) for (let i = 0; i < w.perks.length + 1; i++) { const a = (T * 0.9 + i * 0.55) % 1; if (a < 0.5) { c.save(); c.globalAlpha = Math.sin(a * Math.PI * 2); star(c, (i % 2 ? 9 : -9), -24 - i * 12, 3.5, '#fff9db'); c.restore(); } }
  }
  function poly4(c, pts, fill) { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); c.fillStyle = fill; c.fill(); c.strokeStyle = INK; c.lineWidth = 1.6; c.stroke(); }
  // ---------- the kids ----------
  // o: {kid,color,cape,weapon,armor(0-4),cls,t,walk(bool),glow,badge,back}
  function hero(c, x, y, s, o) {
    const t = o.t || 0, nora = o.kid === 'nora';
    const trim = nora ? '#ffd43b' : '#ffffff';
    const step = o.walk ? Math.sin(t * 14) : 0;
    const bob = o.walk ? Math.abs(step) * 2 : Math.sin(t * 2.4) * 1;
    c.save(); c.translate(x, y); c.scale(s, s);
    c.lineJoin = 'round'; c.lineCap = 'round';
    if (o.glow !== false) { c.save(); const g = c.createRadialGradient(0, -4, 2, 0, -4, 34); g.addColorStop(0, 'rgba(255,214,70,.55)'); g.addColorStop(1, 'rgba(255,214,70,0)'); c.fillStyle = g; c.beginPath(); c.ellipse(0, -2, 34, 13, 0, 0, TAU); c.fill(); c.restore(); }
    shadow(c, 0, 0, 17);
    if ((o.armor || 0) === 4) { c.save(); const g = c.createRadialGradient(0, -50, 4, 0, -50, 52); g.addColorStop(0, 'rgba(255,224,102,.35)'); g.addColorStop(1, 'rgba(255,224,102,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, -50, 52, 0, TAU); c.fill(); c.restore(); }
    c.translate(0, -bob);
    // cape
    if (o.cape) {
      const sw = Math.sin(t * 3) * 2 + step * 2;
      c.beginPath(); c.moveTo(-13, -45); c.lineTo(13, -45); c.quadraticCurveTo(24 + sw, -26, 20 + sw, -8);
      c.quadraticCurveTo(10 + sw, -12, 0 + sw, -7); c.quadraticCurveTo(-10 + sw, -12, -20 + sw, -8); c.quadraticCurveTo(-24 + sw, -26, -13, -45);
      c.fillStyle = o.cape; c.fill(); c.strokeStyle = INK; c.lineWidth = 2.5; c.stroke();
    }
    // Nora's ponytail sits behind her head
    if (nora) {
      const sway = o.walk ? Math.sin(t * 7) * 2 : 0;
      c.beginPath(); c.moveTo(12, -86); c.bezierCurveTo(30 + sway, -100, 44 + sway, -84, 38 + sway, -62);
      c.bezierCurveTo(36 + sway, -52, 44 + sway, -48, 46 + sway, -54); c.bezierCurveTo(48 + sway, -44, 30 + sway, -42, 30 + sway, -58);
      c.bezierCurveTo(30 + sway, -72, 28, -80, 18, -78); c.closePath();
      c.fillStyle = '#17141c'; c.fill(); c.strokeStyle = INK; c.lineWidth = 2.5; c.stroke();
      ell(c, 15, -84, 5.5, 5.5, '#ff6fae', INK, 2);
    }
    // legs and boots
    for (const sx of [-1, 1]) {
      const ly = o.walk ? Math.max(0, step * sx) * 4 : 0;
      rr(c, sx * 6 - 4.5, -20 - ly, 9, 15, 3, '#2b3350', INK, 2.5);
      rr(c, sx * 6 - 6, -7 - ly, 12, 8, 4, '#7a4a23', INK, 2.5);
    }
    // back arm + class extras behind body
    if (o.cls === 'knight') { c.save(); c.translate(-21, -28); c.beginPath(); c.moveTo(-9, -10); c.lineTo(9, -10); c.lineTo(9, 2); c.quadraticCurveTo(0, 14, -9, 2); c.closePath(); c.fillStyle = '#cfd8dc'; c.fill(); c.strokeStyle = INK; c.lineWidth = 2.5; c.stroke(); star(c, 0, -2, 5, o.color, INK, 1); c.restore(); }
    // tunic
    c.beginPath(); c.moveTo(-14, -45); c.lineTo(14, -45); c.lineTo(17, -17); c.lineTo(-17, -17); c.closePath();
    c.fillStyle = o.color; c.fill(); c.strokeStyle = INK; c.lineWidth = 2.5; c.stroke();
    c.beginPath(); c.moveTo(-7, -45); c.lineTo(0, -37); c.lineTo(7, -45); c.strokeStyle = trim; c.lineWidth = 3; c.stroke();
    rr(c, -16.5, -25, 33, 5, 1.5, '#3b2a1a'); ell(c, 0, -22.5, 3, 3, '#ffd43b', INK, 1.2);
    // armour
    const a = o.armor || 0;
    // Armour: leather straps, chain links, crystal plates, then golden Dawn armour with a sun and wings.
    if (a === 1) { c.beginPath(); c.moveTo(-12, -44); c.lineTo(12, -22); c.lineWidth = 5; c.strokeStyle = '#7f5539'; c.stroke(); ell(c, 0, -33, 2.5, 2.5, '#ffd43b'); for (const sx of [-1, 1]) { c.beginPath(); c.ellipse(sx * 15, -43, 8, 5, sx * 0.3, 0, TAU); c.fillStyle = '#9c6b3f'; c.fill(); c.strokeStyle = INK; c.lineWidth = 2; c.stroke(); c.strokeStyle = '#ffe8cc'; c.lineWidth = 1; c.setLineDash([2, 2]); c.beginPath(); c.ellipse(sx * 15, -43, 5, 2.5, sx * 0.3, 0, TAU); c.stroke(); c.setLineDash([]); } }
    else if (a === 2) { c.save(); c.beginPath(); c.moveTo(-13, -42); c.lineTo(13, -42); c.lineTo(15, -26); c.lineTo(-15, -26); c.closePath(); c.clip(); c.fillStyle = '#ced4da'; c.fillRect(-16, -44, 32, 20); c.strokeStyle = '#868e96'; c.lineWidth = 1; for (let y = -42; y < -24; y += 3.5) for (let x = -15 + ((y / 3.5) % 2 ? 1.75 : 0); x < 16; x += 3.5) { c.beginPath(); c.arc(x, y, 1.6, 0, TAU); c.stroke(); } c.restore(); for (const sx of [-1, 1]) { c.beginPath(); c.ellipse(sx * 15, -43, 8.5, 6, sx * 0.3, 0, TAU); c.fillStyle = '#b0bec5'; c.fill(); c.strokeStyle = INK; c.lineWidth = 2.2; c.stroke(); ell(c, sx * 15, -43, 1.6, 1.6, '#495057'); } }
    else if (a === 3) { c.save(); c.shadowColor = '#7fe3ff'; c.shadowBlur = 10; c.beginPath(); c.moveTo(-12, -42); c.lineTo(12, -42); c.lineTo(9, -27); c.lineTo(0, -23); c.lineTo(-9, -27); c.closePath(); c.fillStyle = '#c5f6fa'; c.fill(); c.strokeStyle = INK; c.lineWidth = 2; c.stroke(); c.restore(); c.beginPath(); c.moveTo(0, -40); c.lineTo(5, -33); c.lineTo(0, -26); c.lineTo(-5, -33); c.closePath(); c.fillStyle = '#22b8cf'; c.fill(); c.strokeStyle = INK; c.lineWidth = 1.4; c.stroke(); for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * 8, -40); c.lineTo(sx * 24, -48); c.lineTo(sx * 20, -38); c.lineTo(sx * 23, -36); c.lineTo(sx * 9, -36); c.closePath(); c.fillStyle = '#7fe3ff'; c.fill(); c.strokeStyle = INK; c.lineWidth = 2; c.stroke(); } }
    else if (a === 4) { for (const sx of [-1, 1]) { c.save(); c.translate(sx * 14, -44); c.rotate(sx * (0.25 + Math.sin(t * 2) * 0.05)); for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(sx * (8 + i * 6), -6 - i * 4, 9, 3.5, sx * -0.5, 0, TAU); c.fillStyle = i % 2 ? '#fff3bf' : '#fff'; c.fill(); c.strokeStyle = INK; c.lineWidth = 1.4; c.stroke(); } c.restore(); }
      c.beginPath(); c.moveTo(-13, -43); c.lineTo(13, -43); c.lineTo(11, -26); c.lineTo(-11, -26); c.closePath(); c.fillStyle = '#ffd43b'; c.fill(); c.strokeStyle = INK; c.lineWidth = 2; c.stroke();
      c.save(); c.shadowColor = '#ffe066'; c.shadowBlur = 12; for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4 + t; c.beginPath(); c.moveTo(Math.cos(an) * 5, -34 + Math.sin(an) * 5); c.lineTo(Math.cos(an) * 8.5, -34 + Math.sin(an) * 8.5); c.strokeStyle = '#e67700'; c.lineWidth = 1.6; c.stroke(); } ell(c, 0, -34, 4.5, 4.5, '#fff3bf', '#e67700', 1.4); c.restore();
      for (const sx of [-1, 1]) { c.beginPath(); c.ellipse(sx * 15, -43, 9, 6, sx * 0.3, 0, TAU); c.fillStyle = '#ffd43b'; c.fill(); c.strokeStyle = INK; c.lineWidth = 2.2; c.stroke(); ell(c, sx * 16, -45, 2.2, 1.3, '#fff'); } }
    if (o.cls === 'ranger') { rr(c, -12, -48, 24, 6, 3, '#2f9e44', INK, 2); c.beginPath(); c.moveTo(-9, -44); c.quadraticCurveTo(-18, -36, -15, -28); c.lineTo(-10, -30); c.quadraticCurveTo(-11, -38, -5, -43); c.closePath(); c.fillStyle = '#2f9e44'; c.fill(); c.strokeStyle = INK; c.lineWidth = 2; c.stroke(); }
    // arms
    c.strokeStyle = INK; c.lineWidth = 9; c.beginPath(); c.moveTo(-15, -40); c.lineTo(-21, -27 + step * 2); c.stroke();
    c.strokeStyle = o.color; c.lineWidth = 5; c.beginPath(); c.moveTo(-15, -40); c.lineTo(-21, -27 + step * 2); c.stroke();
    ell(c, -21.5, -25 + step * 2, 4.2, 4.2, '#ffd9b3', INK, 2);
    if (o.cls === 'mage') { c.save(); c.shadowColor = '#b197fc'; c.shadowBlur = 10; star(c, -30, -34 + Math.sin(t * 4) * 2, 5, '#e5dbff', '#7048e8', 1.2); c.restore(); }
    const hx = 22, hy = -30 - step * 2;
    if (o.weapon) { c.save(); c.translate(hx, hy); c.rotate(0.38 + (o.swing || 0)); weapon(c, o.weapon); c.restore(); }
    c.strokeStyle = INK; c.lineWidth = 9; c.beginPath(); c.moveTo(15, -40); c.lineTo(hx, hy); c.stroke();
    c.strokeStyle = o.color; c.lineWidth = 5; c.beginPath(); c.moveTo(15, -40); c.lineTo(hx, hy); c.stroke();
    ell(c, hx, hy, 4.5, 4.5, '#ffd9b3', INK, 2);
    // head
    const hy0 = -66, mood = o.mood || 'calm';
    if (nora) {
      // back hair covers the top and sides only, so nothing dark shows under her chin
      c.beginPath(); c.moveTo(-25.5, hy0 + 9); c.bezierCurveTo(-32, hy0 - 35, 32, hy0 - 35, 25.5, hy0 + 9); c.lineTo(19, hy0 + 2); c.lineTo(-19, hy0 + 2); c.closePath();
      c.fillStyle = '#17141c'; c.fill(); c.strokeStyle = INK; c.lineWidth = 2.5; c.stroke();
    } else {
      // soft, short spikes
      c.beginPath(); const n = 8;
      for (let i = 0; i <= n * 2; i++) { const a2 = -Math.PI * 1.06 + (i / (n * 2)) * Math.PI * 1.12; const rad = i % 2 ? 33 + (i % 4 === 1 ? 2 : 0) : 25.5; c.lineTo(Math.cos(a2) * rad, hy0 + Math.sin(a2) * rad * 0.98); }
      c.closePath(); c.fillStyle = '#17141c'; c.fill(); c.strokeStyle = INK; c.lineWidth = 2.5; c.stroke();
    }
    ell(c, 0, hy0, 23, 22, '#ffd9b3', INK, 2.8);
    for (const sx of [-1, 1]) ell(c, sx * 23, hy0 + 2, 3.5, 5, '#ffd9b3', INK, 2);
    if (nora) {
      // side-swept bangs, all curves
      c.beginPath(); c.moveTo(-24, hy0 + 2); c.bezierCurveTo(-27, hy0 - 26, 20, hy0 - 30, 24, hy0 - 2);
      c.bezierCurveTo(20, hy0 - 12, 10, hy0 - 15, 2, hy0 - 14); c.bezierCurveTo(-8, hy0 - 12, -16, hy0 - 6, -19, hy0 + 4); c.closePath();
      c.fillStyle = '#17141c'; c.fill(); c.strokeStyle = INK; c.lineWidth = 2; c.stroke();
      for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * 22, hy0 - 4); c.quadraticCurveTo(sx * 26.5, hy0 + 4, sx * 22.5, hy0 + 11); c.quadraticCurveTo(sx * 20, hy0 + 4, sx * 20, hy0 - 2); c.closePath(); c.fillStyle = '#17141c'; c.fill(); }
      c.beginPath(); c.moveTo(-8, hy0 - 21); c.quadraticCurveTo(2, hy0 - 24, 12, hy0 - 19); c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 2.6; c.stroke();
      star(c, -15, hy0 - 12, 5.5, '#ffd43b', INK, 1.2);
    } else {
      c.beginPath(); c.moveTo(-23, hy0 - 4); c.lineTo(-17, hy0 - 14); c.lineTo(-12, hy0 - 8); c.lineTo(-6, hy0 - 16); c.lineTo(-1, hy0 - 9); c.lineTo(6, hy0 - 16); c.lineTo(11, hy0 - 8); c.lineTo(17, hy0 - 14); c.lineTo(23, hy0 - 4);
      c.quadraticCurveTo(14, hy0 - 26, 0, hy0 - 25); c.quadraticCurveTo(-14, hy0 - 26, -23, hy0 - 4); c.closePath(); c.fillStyle = '#17141c'; c.fill();
    }
    // face: eyes, brows and mouth change with the mood
    const BROW = { calm: [0, nora ? 0 : 1.2], happy: [-1, -1], determined: [-1, 3.5], hurt: [0, 3], worried: [1.5, -2.5], sad: [2, -2.5], surprised: [-3.5, -3.5], think: [0, 0] }[mood] || [0, 0];
    const look = mood === 'think' ? -2.2 : 0, big = mood === 'surprised' ? 1.12 : 1;
    c.lineCap = 'round';
    for (const sx of [-1, 1]) {
      const ex = sx * 9, ey = hy0 + 3;
      if (mood === 'happy') { c.strokeStyle = INK; c.lineWidth = 2.8; c.beginPath(); c.arc(ex, ey + 3, 5, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
      else if (mood === 'hurt') { c.strokeStyle = INK; c.lineWidth = 2.8; c.beginPath(); c.moveTo(ex - sx * 5, ey - 4); c.lineTo(ex + sx * 3, ey); c.lineTo(ex - sx * 5, ey + 4); c.stroke(); }
      else {
        ell(c, ex, ey, 5.2 * big, 7 * big, nora ? '#6b3a1e' : '#17141c', INK, 1.6);
        if (nora) ell(c, ex, ey + 1 + look, 2.8, 4, '#17141c');
        ell(c, ex - 1.6, ey - 2.8 + look, 2, 2.4, '#fff'); ell(c, ex + 1.8, ey + 2.6 + look, 1, 1.1, '#fff');
        if (nora) { c.strokeStyle = INK; c.lineWidth = 2.6; c.beginPath(); c.moveTo(sx * 3.4, ey - 5.6 * big); c.quadraticCurveTo(ex, ey - 9.5 * big, sx * 15.4, ey - 5 * big); c.stroke(); }
      }
      const up = mood === 'think' && sx === 1 ? -3 : 0;
      c.strokeStyle = INK; c.lineWidth = nora ? 1.7 : 3; c.beginPath(); c.moveTo(sx * 15, hy0 - 10.5 + BROW[0] + up); c.quadraticCurveTo(sx * 9.5, hy0 - 12.4 + (BROW[0] + BROW[1]) / 2 + up, sx * 4, hy0 - 10.5 + BROW[1] + up); c.stroke();
      ell(c, sx * 15.5, hy0 + 10, 4, 2.2, nora ? 'rgba(255,120,150,.55)' : 'rgba(255,140,120,.3)');
    }
    const my = hy0 + 13; c.strokeStyle = INK; c.lineWidth = 2;
    if (mood === 'happy') { c.beginPath(); c.moveTo(-6.5, my - 1); c.quadraticCurveTo(0, my + 9, 6.5, my - 1); c.closePath(); c.fillStyle = '#a01f3c'; c.fill(); c.lineWidth = 1.8; c.stroke(); ell(c, 0, my + 2.6, 2.8, 1.5, '#ff8fab'); }
    else if (mood === 'surprised' || mood === 'hurt') ell(c, 0, my + 1.5, mood === 'hurt' ? 3.6 : 2.8, mood === 'hurt' ? 3 : 3.6, '#a01f3c', INK, 1.8);
    else if (mood === 'sad') { c.beginPath(); c.arc(0, my + 5.5, 5, Math.PI * 1.2, Math.PI * 1.8); c.stroke(); }
    else if (mood === 'worried') { c.beginPath(); c.moveTo(-5, my + 2); c.quadraticCurveTo(-2.5, my - 0.5, 0, my + 2); c.quadraticCurveTo(2.5, my + 4.5, 5, my + 2); c.stroke(); }
    else if (mood === 'determined') { c.beginPath(); c.moveTo(-4.5, my + 1.5); c.quadraticCurveTo(0, my + 3, 4.5, my + 1); c.stroke(); }
    else if (mood === 'think') { c.beginPath(); c.moveTo(0, my + 2); c.quadraticCurveTo(3, my + 2.6, 5.5, my + 0.5); c.stroke(); }
    else { c.beginPath(); c.arc(0, my - 2, 6, Math.PI * 0.2, Math.PI * 0.8); c.stroke(); }
    if (mood === 'worried' || mood === 'hurt') { c.beginPath(); c.moveTo(19, hy0 - 12); c.quadraticCurveTo(23.5, hy0 - 5, 19, hy0 - 3.5); c.quadraticCurveTo(14.5, hy0 - 5, 19, hy0 - 12); c.fillStyle = '#8fd3ff'; c.fill(); c.strokeStyle = INK; c.lineWidth = 1.2; c.stroke(); }
    if (mood === 'think') { c.fillStyle = INK; c.font = '900 13px system-ui'; c.textAlign = 'center'; c.fillText('?', 27, hy0 - 22 + Math.sin(t * 4) * 1.5); }
    c.restore();
    if (o.badge) {
      const nm = nora ? 'NORA' : 'LUCAS', bc = nora ? '#7048e8' : '#f76707';
      c.save(); c.font = `900 ${Math.max(10, 11 * s)}px system-ui`; c.textAlign = 'center';
      const w = c.measureText(nm).width + 12, by = y - 100 * s - bob;
      rr(c, x - w / 2, by - 12, w, 16, 8, bc, '#fff', 1.5); c.fillStyle = '#fff'; c.fillText(nm, x, by); c.restore();
    }
  }

  // ---------- Lumis (friendly creatures) ----------
  const EL = { fire: '#ff6b35', water: '#339af0', leaf: '#40c057', star: '#fcc419' };
  function lumi(c, sp, x, y, s, t, evo, flip) {
    // Evolved Lumis are drawn as their animal form (see animals.js).
    if (evo && sp.animal && typeof Animals !== 'undefined' && Animals[sp.animal]) { c.save(); c.translate(x, y); c.scale(s * 0.46 * (flip ? -1 : 1), s * 0.46); c.translate(-95, -160); Animals[sp.animal](c, t + (sp.ph || 0)); c.restore(); return; }
    const col = sp.col, dk = shade(col, -0.25), lt = shade(col, 0.45);
    const bounce = Math.abs(Math.sin(t * 3 + (sp.ph || 0))) * 3;
    c.save(); c.translate(x, y); c.scale(s * (flip ? -1 : 1) * (evo ? 1.25 : 1), s * (evo ? 1.25 : 1));
    shadow(c, 0, 0, 16); c.translate(0, -bounce);
    const tall = sp.body === 'tall', wide = sp.body === 'wide';
    const rx = wide ? 22 : tall ? 15 : 18, ry = wide ? 15 : tall ? 21 : 18, cy = -ry - 3;
    // tail
    c.save(); c.translate(-rx + 2, cy + 6);
    if (sp.tail === 'flame') { const f = Math.sin(t * 10) * 2; c.beginPath(); c.moveTo(0, 4); c.quadraticCurveTo(-20, 4, -12, -16 - f); c.quadraticCurveTo(-8, -6, -3, -8); c.closePath(); c.fillStyle = '#ffa94d'; c.fill(); c.beginPath(); c.moveTo(-2, 2); c.quadraticCurveTo(-13, 2, -9, -9 - f); c.quadraticCurveTo(-6, -3, -2, -3); c.closePath(); c.fillStyle = '#ffe066'; c.fill(); }
    else if (sp.tail === 'leaf') { c.rotate(-0.5 + Math.sin(t * 3) * 0.1); ell(c, -10, 0, 11, 5, '#69db7c'); c.strokeStyle = '#2b8a3e'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-20, 0); c.lineTo(0, 0); c.stroke(); }
    else if (sp.tail === 'fin') { c.beginPath(); c.moveTo(2, 0); c.lineTo(-14, -10); c.quadraticCurveTo(-9, 0, -14, 10); c.closePath(); c.fillStyle = lt; c.fill(); }
    else if (sp.tail === 'puff') { ell(c, -5, 2, 7, 7, '#fff'); }
    else if (sp.tail === 'bolt') { c.beginPath(); c.moveTo(2, 2); c.lineTo(-8, -2); c.lineTo(-5, -8); c.lineTo(-18, -14); c.lineTo(-12, -4); c.lineTo(-15, 2); c.closePath(); c.fillStyle = '#ffe066'; c.fill(); }
    c.restore();
    // extras behind
    if (sp.extra === 'wings') for (const sx of [-1, 1]) { c.save(); c.translate(sx * (rx - 4), cy - 4); c.rotate(sx * (0.5 + Math.sin(t * 12) * 0.25)); ell(c, sx * 9, -4, 12, 6, 'rgba(255,255,255,.8)'); c.restore(); }
    if (sp.extra === 'spikes') { c.fillStyle = dk; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * 6 - 4, cy - ry + 5); c.lineTo(i * 6, cy - ry - 7 + Math.abs(i) * 3); c.lineTo(i * 6 + 4, cy - ry + 5); c.fill(); } }
    // ears
    c.fillStyle = col;
    for (const sx of [-1, 1]) {
      c.save(); c.translate(sx * rx * 0.6, cy - ry * 0.75);
      if (sp.ear === 'point') { c.beginPath(); c.moveTo(-6, 4); c.lineTo(sx * 4, -15); c.lineTo(7, 4); c.closePath(); c.fill(); c.beginPath(); c.moveTo(-2, 2); c.lineTo(sx * 3, -8); c.lineTo(4, 2); c.closePath(); c.fillStyle = lt; c.fill(); }
      else if (sp.ear === 'round') { ell(c, 0, -3, 7, 7, col); ell(c, 0, -3, 3.5, 3.5, lt); }
      else if (sp.ear === 'long') { c.rotate(sx * 0.25); ell(c, 0, -12, 5, 15, col); ell(c, 0, -12, 2.2, 10, lt); }
      else if (sp.ear === 'leaf') { c.rotate(sx * 0.6); ell(c, 0, -9, 5, 11, '#69db7c'); }
      else if (sp.ear === 'fin') { c.beginPath(); c.moveTo(0, 4); c.lineTo(sx * 12, -8); c.lineTo(sx * 4, 6); c.closePath(); c.fillStyle = lt; c.fill(); }
      else if (sp.ear === 'horn') { c.beginPath(); c.moveTo(-4, 3); c.quadraticCurveTo(sx * 2, -8, sx * 7, -14); c.quadraticCurveTo(sx * 6, -2, 5, 3); c.closePath(); c.fillStyle = '#f8f0e3'; c.fill(); }
      else if (sp.ear === 'antenna') { c.strokeStyle = dk; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 3); c.quadraticCurveTo(sx * 4, -8, sx * 8, -13); c.stroke(); ell(c, sx * 8, -14, 3.2, 3.2, '#ffe066'); }
      c.restore();
    }
    // body
    const g = c.createRadialGradient(-rx * 0.3, cy - ry * 0.4, 2, 0, cy, rx * 1.3); g.addColorStop(0, lt); g.addColorStop(0.55, col); g.addColorStop(1, dk);
    ell(c, 0, cy, rx, ry, g);
    ell(c, 2, cy + ry * 0.35, rx * 0.62, ry * 0.5, sp.belly || 'rgba(255,255,255,.55)');
    if (sp.extra === 'shell') { c.beginPath(); c.ellipse(-3, cy - 2, rx * 0.95, ry * 0.9, 0, Math.PI * 0.75, Math.PI * 1.9); c.fillStyle = dk; c.fill(); c.strokeStyle = shade(col, -0.45); c.lineWidth = 1.5; c.beginPath(); c.arc(-6, cy - 6, 7, 0, TAU); c.stroke(); }
    if (sp.extra === 'gear') { c.save(); c.translate(-rx * 0.5, cy + 2); c.rotate(t * 2); c.strokeStyle = '#ffd43b'; c.lineWidth = 3; c.setLineDash([3, 3]); c.beginPath(); c.arc(0, 0, 6, 0, TAU); c.stroke(); c.restore(); ell(c, -rx * 0.5, cy + 2, 3.5, 3.5, '#ffd43b'); }
    if (sp.extra === 'glow') { c.save(); c.globalAlpha = 0.5 + Math.sin(t * 5) * 0.25; const gg = c.createRadialGradient(0, cy + 6, 1, 0, cy + 6, 16); gg.addColorStop(0, '#fff9db'); gg.addColorStop(1, 'rgba(255,249,219,0)'); c.fillStyle = gg; c.fillRect(-20, cy - 12, 40, 40); c.restore(); }
    // feet
    for (const sx of [-1, 1]) ell(c, sx * rx * 0.45, -2, 6, 3.6, dk);
    // face
    const blink = (t * 0.7 + (sp.ph || 0)) % 3 < 0.09;
    for (const sx of [-1, 1]) { if (blink) { c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(sx * 7 - 3 + 3, cy - 3); c.lineTo(sx * 7 + 3 + 3, cy - 3); c.stroke(); } else { ell(c, sx * 7 + 3, cy - 3, 3.6, 4.8, INK); ell(c, sx * 7 + 2, cy - 5, 1.5, 1.8, '#fff'); } ell(c, sx * 11 + 3, cy + 3, 3, 1.8, 'rgba(255,120,140,.45)'); }
    c.strokeStyle = INK; c.lineWidth = 1.6; c.lineCap = 'round'; c.beginPath(); c.arc(3, cy + 2, 3, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke();
    // element gem + evolved crest
    ell(c, 3, cy - ry + 5, 3.2, 3.2, EL[sp.el]); ell(c, 2.2, cy - ry + 4.2, 1, 1, 'rgba(255,255,255,.9)');
    if (evo) { c.save(); c.shadowColor = EL[sp.el]; c.shadowBlur = 8; star(c, 3, cy - ry - 7, 6, '#ffe066', '#e67700', 1); c.restore(); }
    c.restore();
  }

  // ---------- Fog creatures (enemies) ----------
  function fog(c, e, x, y, s, t, hit) {
    const boss = e.boss, col = e.col || '#5f3dc4', dk = shade(col, -0.45), lt = shade(col, 0.3);
    c.save(); c.translate(x, y); c.scale(s, s);
    shadow(c, 0, 0, boss ? 30 : 20);
    const fl = Math.sin(t * 2.5 + (e.ph || 0)) * 3; c.translate(0, -8 - fl);
    const R0 = boss ? 34 : 22, H = boss ? 62 : 42;
    const k = e.kind;
    if (k === 'bat') for (const sx of [-1, 1]) { c.save(); c.scale(sx, 1); c.rotate(-0.2 + Math.sin(t * 9) * 0.3); c.beginPath(); c.moveTo(R0 * 0.6, -H * 0.6); c.quadraticCurveTo(R0 * 2.2, -H * 1.1, R0 * 2.4, -H * 0.35); c.quadraticCurveTo(R0 * 1.9, -H * 0.5, R0 * 1.7, -H * 0.25); c.quadraticCurveTo(R0 * 1.3, -H * 0.5, R0 * 1.1, -H * 0.2); c.quadraticCurveTo(R0, -H * 0.45, R0 * 0.6, -H * 0.3); c.closePath(); c.fillStyle = dk; c.fill(); c.restore(); }
    if (k === 'golem') for (const sx of [-1, 1]) rr(c, sx * (R0 + 2) - 8, -H * 0.62 + Math.sin(t * 3 + sx) * 2, 16, 24, 6, dk);
    // body: ghostly shape with a wavy hem
    const g = c.createLinearGradient(0, -H, 0, 0); g.addColorStop(0, lt); g.addColorStop(0.5, col); g.addColorStop(1, dk);
    c.beginPath();
    if (k === 'golem') { c.roundRect(-R0, -H, R0 * 2, H, 10); }
    else if (k === 'slime') { c.moveTo(-R0 * 1.25, 0); c.bezierCurveTo(-R0 * 1.35, -H * 0.9, -R0 * 0.5, -H * 0.95, 0, -H * 0.9 - Math.sin(t * 4) * 3); c.bezierCurveTo(R0 * 0.5, -H * 0.95, R0 * 1.35, -H * 0.9, R0 * 1.25, 0); c.closePath(); }
    else { c.moveTo(-R0, 0); c.lineTo(-R0, -H + R0); c.arc(0, -H + R0, R0, Math.PI, 0); c.lineTo(R0, 0); for (let i = 0; i < 4; i++) { const x0 = R0 - i * (R0 / 2), x1 = x0 - R0 / 2; c.quadraticCurveTo((x0 + x1) / 2, (i % 2 ? -9 : 7) + Math.sin(t * 5 + i) * 2, x1, 0); } c.closePath(); }
    c.fillStyle = g; c.globalAlpha = 0.96; c.fill(); c.globalAlpha = 1;
    if (hit) { c.fillStyle = 'rgba(255,255,255,.7)'; c.fill(); }
    if (k === 'golem') { c.fillStyle = 'rgba(0,0,0,.18)'; rr(c, -R0 + 5, -H * 0.3, 12, 9, 3, 'rgba(0,0,0,.18)'); rr(c, R0 - 16, -H * 0.5, 10, 8, 3, 'rgba(0,0,0,.18)'); }
    if (k === 'knight') { c.beginPath(); c.arc(0, -H + R0, R0 + 1.5, Math.PI * 1.02, Math.PI * 1.98); c.lineTo(R0 * 0.75, -H + R0 - 4); c.lineTo(-R0 * 0.75, -H + R0 - 4); c.closePath(); c.fillStyle = '#868e96'; c.fill(); rr(c, -2.5, -H - 9, 5, 14, 2, '#e03131'); }
    // eyes
    const ey = -H * 0.62;
    for (const sx of [-1, 1]) { c.save(); c.shadowColor = e.eye || '#ffe066'; c.shadowBlur = 10; c.beginPath(); c.moveTo(sx * R0 * 0.18, ey + 2); c.lineTo(sx * R0 * 0.62, ey - 6); c.lineTo(sx * R0 * 0.62, ey + 5); c.quadraticCurveTo(sx * R0 * 0.4, ey + 9, sx * R0 * 0.18, ey + 2); c.fillStyle = e.eye || '#ffe066'; c.fill(); c.restore(); ell(c, sx * R0 * 0.44, ey + 1.5, 2, 2.6, INK); }
    // mouth
    c.beginPath(); c.moveTo(-R0 * 0.35, ey + 15); for (let i = 1; i <= 6; i++) c.lineTo(-R0 * 0.35 + i * R0 * 0.7 / 6, ey + 15 + (i % 2 ? 5 : 0)); c.strokeStyle = INK; c.lineWidth = 2; c.stroke();
    if (e.sym) { c.fillStyle = 'rgba(255,255,255,.85)'; c.font = `900 ${boss ? 18 : 12}px system-ui`; c.textAlign = 'center'; c.fillText(e.sym, 0, -H * 0.14); }
    if (boss) { c.beginPath(); const cy0 = -H - 2; c.moveTo(-16, cy0); c.lineTo(-18, cy0 - 16); c.lineTo(-8, cy0 - 7); c.lineTo(0, cy0 - 20); c.lineTo(8, cy0 - 7); c.lineTo(18, cy0 - 16); c.lineTo(16, cy0); c.closePath(); c.fillStyle = '#ffd43b'; c.fill(); c.strokeStyle = '#e67700'; c.lineWidth = 1.5; c.stroke(); ell(c, 0, cy0 - 8, 2.6, 2.6, '#e03131'); }
    c.restore();
  }

  // ---------- villagers ----------
  function villager(c, v, x, y, s, t) {
    c.save(); c.translate(x, y); c.scale(s, s); shadow(c, 0, 0, 14);
    const b = Math.sin(t * 2 + v.ph) * 1;
    c.translate(0, -b);
    rr(c, -11, -36, 22, 30, 8, v.col); rr(c, -8, -8, 6, 8, 2, '#4a3728'); rr(c, 2, -8, 6, 8, 2, '#4a3728');
    ell(c, 0, -48, 14, 14, v.skin || '#f2c9a0');
    c.fillStyle = v.hair || '#6d4c41';
    if (v.hat === 'elder') { c.beginPath(); c.arc(0, -50, 14.5, Math.PI, 0); c.fill(); c.fillStyle = '#f1f3f5'; c.beginPath(); c.moveTo(-9, -42); c.quadraticCurveTo(0, -18, 9, -42); c.quadraticCurveTo(0, -38, -9, -42); c.fill(); rr(c, 15, -58, 3.5, 56, 1.5, '#8d6e4a'); c.save(); c.shadowColor = '#ffe066'; c.shadowBlur = 10; ell(c, 16.5, -62, 6, 6, '#ffe066'); c.restore(); }
    else if (v.hat === 'shop') { c.beginPath(); c.arc(0, -52, 14.5, Math.PI, 0); c.fill(); rr(c, -17, -56, 34, 5, 2, '#e03131'); rr(c, -11, -67, 22, 12, 4, '#e03131'); }
    else if (v.hat === 'heal') { c.beginPath(); c.arc(0, -51, 14.5, Math.PI, 0); c.fill(); rr(c, -12, -66, 24, 11, 4, '#fff'); c.fillStyle = '#e03131'; c.fillRect(-2, -64, 4, 8); c.fillRect(-4.5, -61.5, 9, 3); }
    else { c.beginPath(); c.arc(0, -51, 14.5, Math.PI * 0.95, Math.PI * 0.05); c.fill(); if (v.hat === 'bun') ell(c, 0, -66, 6, 6, v.hair || '#6d4c41'); }
    for (const sx of [-1, 1]) ell(c, sx * 5, -47, 1.9, 2.5, INK);
    c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); if (v.sad) c.arc(0, -38, 4, 1.15 * Math.PI, 1.85 * Math.PI); else c.arc(0, -43, 4, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke();
    c.restore();
    if (v.mark) { c.save(); c.font = '900 22px system-ui'; c.textAlign = 'center'; c.fillStyle = '#ffd43b'; c.strokeStyle = INK; c.lineWidth = 4; const yy = y - 74 * s + Math.sin(t * 4) * 3; c.strokeText(v.mark, x, yy); c.fillText(v.mark, x, yy); c.restore(); }
  }

  // ---------- tiles ----------
  function hash(x, y) { let h = (x * 374761393 + y * 668265263) ^ 0x5bf03635; h = (h ^ (h >> 13)) * 1274126177; return ((h ^ (h >> 16)) >>> 0) / 4294967295; }
  function ground(c, ch, px, py, T, pal, t, gx, gy) {
    const h = hash(gx, gy);
    c.fillStyle = (gx + gy) % 2 ? pal.g1 : pal.g2; c.fillRect(px, py, T + 1, T + 1);
    if (ch === ',' || ch === 'G' || ch === 'P') { c.fillStyle = pal.path; c.beginPath(); c.roundRect(px + 1, py + 1, T - 2, T - 2, 9); c.fill(); c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(px + 8 + h * 20, py + 10 + h * 18, 6, 3); c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(px + 26 - h * 14, py + 30 - h * 12, 5, 3); }
    else if (ch === 'W') { c.fillStyle = pal.water; c.fillRect(px, py, T + 1, T + 1); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 2; c.lineCap = 'round'; for (let i = 0; i < 2; i++) { const yy = py + 14 + i * 20, off = Math.sin(t * 1.6 + gx + gy * 0.7 + i * 2) * 5; c.beginPath(); c.moveTo(px + 8 + off, yy); c.quadraticCurveTo(px + 18 + off, yy - 5, px + 28 + off, yy); c.stroke(); } }
    else if (ch === 'b') { c.fillStyle = pal.water; c.fillRect(px, py, T + 1, T + 1); c.fillStyle = '#a47148'; c.fillRect(px, py + 5, T + 1, T - 10); c.fillStyle = '#7f5539'; for (let i = 0; i < 4; i++) c.fillRect(px + i * 12 + 10, py + 5, 2, T - 10); c.fillRect(px, py + 3, T + 1, 4); c.fillRect(px, py + T - 7, T + 1, 4); }
    else if (h > 0.7) { c.fillStyle = pal.tuft; c.fillRect(px + h * 30 + 4, py + (1 - h) * 60 + 6, 3, 6); c.fillRect(px + h * 30 + 8, py + (1 - h) * 60 + 8, 3, 4); }
    if (ch === 'f') { for (let i = 0; i < 3; i++) { const fx = px + 10 + i * 13, fy = py + 14 + ((i * 17 + gx * 7) % 20); const fc = pal.flowers[(gx + gy + i) % pal.flowers.length]; for (let k = 0; k < 5; k++) ell(c, fx + Math.cos(k * 1.257) * 3.4, fy + Math.sin(k * 1.257) * 3.4, 2.4, 2.4, fc); ell(c, fx, fy, 2, 2, '#ffe066'); } }
  }
  function tallGrass(c, px, py, T, pal, t, gx, gy, front) {
    c.lineCap = 'round'; c.lineWidth = 4;
    for (let i = 0; i < 6; i++) { const bx = px + 5 + i * 7.5, sway = Math.sin(t * 2.2 + gx * 1.3 + i) * 3, hgt = 16 + ((i * 7 + gx * 3 + gy * 5) % 9); const by = py + (front ? T : T - 16); c.strokeStyle = i % 2 ? pal.tg1 : pal.tg2; c.beginPath(); c.moveTo(bx, by); c.quadraticCurveTo(bx + sway * 0.4, by - hgt * 0.6, bx + sway, by - hgt); c.stroke(); }
  }
  function tree(c, px, py, T, pal, t, gx, gy) {
    const cx = px + T / 2, by = py + T - 5, h = hash(gx, gy), sw = Math.sin(t * 1.3 + gx + gy) * 1.2;
    shadow(c, cx, by, 17);
    const kind = pal.tree;
    if (kind === 'palm') { c.strokeStyle = '#9c6644'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx, by); c.quadraticCurveTo(cx + 6, by - 28, cx + 2 + sw, by - 50); c.stroke(); for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.62; c.save(); c.translate(cx + 2 + sw, by - 50); c.rotate(a + Math.PI / 2 + sw * 0.03); ell(c, 0, -13, 5.5, 16, i % 2 ? '#2f9e44' : '#51cf66'); c.restore(); } ell(c, cx + 4 + sw, by - 47, 4, 4, '#7f5539'); }
    else if (kind === 'pine') { rr(c, cx - 4, by - 14, 8, 14, 2, '#7f5539'); for (let i = 0; i < 3; i++) { const w = 24 - i * 5, yy = by - 12 - i * 16; c.beginPath(); c.moveTo(cx - w, yy); c.lineTo(cx + sw * (i + 1) * 0.5, yy - 26); c.lineTo(cx + w, yy); c.closePath(); c.fillStyle = i % 2 ? pal.leaf2 : pal.leaf1; c.fill(); if (pal.snow) { c.beginPath(); c.moveTo(cx - w * 0.45, yy - 14); c.lineTo(cx + sw * (i + 1) * 0.5, yy - 26); c.lineTo(cx + w * 0.45, yy - 14); c.quadraticCurveTo(cx, yy - 9, cx - w * 0.45, yy - 14); c.fillStyle = '#fff'; c.fill(); } } }
    else if (kind === 'cactus') { rr(c, cx - 7, by - 44, 14, 44, 7, pal.leaf1); rr(c, cx - 20, by - 34, 8, 20, 4, pal.leaf2); rr(c, cx - 20, by - 20, 15, 7, 3.5, pal.leaf2); rr(c, cx + 12, by - 40, 8, 22, 4, pal.leaf2); rr(c, cx + 5, by - 25, 15, 7, 3.5, pal.leaf2); ell(c, cx, by - 46, 4, 4, '#ff8787'); }
    else if (kind === 'bamboo') { for (let i = -1; i <= 1; i++) { const bx = cx + i * 11 + sw * 0.6; rr(c, bx - 3.5, by - 56 - (i ? 0 : 8), 7, 56 + (i ? 0 : 8), 3, i ? pal.leaf2 : pal.leaf1); c.fillStyle = 'rgba(0,0,0,.2)'; for (let k = 1; k < 4; k++) c.fillRect(bx - 3.5, by - k * 15, 7, 1.6); c.save(); c.translate(bx, by - 50); c.rotate(i * 0.7 + 0.3); ell(c, 9, 0, 10, 3.5, '#8ce99a'); c.restore(); } }
    else if (kind === 'dead') { c.strokeStyle = '#3b2f4a'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx, by); c.lineTo(cx, by - 34); c.moveTo(cx, by - 22); c.lineTo(cx - 14, by - 40); c.moveTo(cx, by - 30); c.lineTo(cx + 13, by - 48); c.moveTo(cx, by - 34); c.lineTo(cx - 3, by - 54); c.stroke(); }
    else { rr(c, cx - 5, by - 20, 10, 20, 3, '#7f5539'); ell(c, cx + sw, by - 34, 23, 21, pal.leaf2); ell(c, cx - 7 + sw, by - 40, 14, 13, pal.leaf1); ell(c, cx + 9 + sw, by - 30, 11, 10, pal.leaf1); if (h > 0.6 && pal.fruit) { ell(c, cx - 9 + sw, by - 29, 3, 3, pal.fruit); ell(c, cx + 8 + sw, by - 41, 3, 3, pal.fruit); } }
  }
  function rock(c, px, py, T, pal) { const cx = px + T / 2, by = py + T - 6; shadow(c, cx, by, 18); c.beginPath(); c.moveTo(cx - 19, by); c.lineTo(cx - 14, by - 22); c.lineTo(cx - 2, by - 32); c.lineTo(cx + 13, by - 24); c.lineTo(cx + 19, by); c.closePath(); c.fillStyle = pal.rock; c.fill(); c.beginPath(); c.moveTo(cx - 14, by - 22); c.lineTo(cx - 2, by - 32); c.lineTo(cx + 2, by - 16); c.lineTo(cx - 9, by - 10); c.closePath(); c.fillStyle = 'rgba(255,255,255,.22)'; c.fill(); if (pal.snow) { c.beginPath(); c.moveTo(cx - 10, by - 25); c.lineTo(cx - 2, by - 32); c.lineTo(cx + 9, by - 26); c.quadraticCurveTo(cx, by - 20, cx - 10, by - 25); c.fillStyle = '#fff'; c.fill(); } }
  // houses are 2x2 tiles, drawn from their top-left tile
  function house(c, px, py, T, pal, roof) { const w = T * 2, h = T * 2; shadow(c, px + w / 2, py + h - 4, w * 0.48); rr(c, px + 6, py + h * 0.42, w - 12, h * 0.55, 4, pal.wall || '#f8e8c8'); c.beginPath(); c.moveTo(px - 2, py + h * 0.46); c.lineTo(px + w / 2, py + 2); c.lineTo(px + w + 2, py + h * 0.46); c.closePath(); c.fillStyle = roof; c.fill(); c.beginPath(); c.moveTo(px + w / 2, py + 2); c.lineTo(px + w + 2, py + h * 0.46); c.lineTo(px + w / 2, py + h * 0.46); c.closePath(); c.fillStyle = 'rgba(0,0,0,.14)'; c.fill(); rr(c, px + w / 2 - 9, py + h - 30, 18, 27, 5, '#7f5539'); ell(c, px + w / 2 + 4, py + h - 16, 1.8, 1.8, '#ffd43b'); for (const sx of [-1, 1]) { rr(c, px + w / 2 + sx * 28 - 8, py + h * 0.56, 16, 14, 3, '#a5d8ff'); c.fillStyle = 'rgba(255,255,255,.6)'; c.fillRect(px + w / 2 + sx * 28 - 5, py + h * 0.56 + 3, 5, 3); } }
  function chest(c, px, py, T, open, t) { const cx = px + T / 2, by = py + T - 8; shadow(c, cx, by + 2, 16); if (!open) { c.save(); c.globalAlpha = 0.35 + Math.sin(t * 3) * 0.2; const g = c.createRadialGradient(cx, by - 12, 2, cx, by - 12, 30); g.addColorStop(0, '#ffe066'); g.addColorStop(1, 'rgba(255,224,102,0)'); c.fillStyle = g; c.fillRect(cx - 30, by - 42, 60, 60); c.restore(); } rr(c, cx - 15, by - 16, 30, 17, 3, open ? '#8a5a2b' : '#b5712c', '#4a2c0f', 2); if (open) { rr(c, cx - 15, by - 30, 30, 10, 3, '#6d4319', '#4a2c0f', 2); c.fillStyle = '#2b1a0a'; c.fillRect(cx - 12, by - 19, 24, 5); } else { c.beginPath(); c.moveTo(cx - 15, by - 14); c.quadraticCurveTo(cx - 15, by - 29, cx, by - 29); c.quadraticCurveTo(cx + 15, by - 29, cx + 15, by - 14); c.closePath(); c.fillStyle = '#c98434'; c.fill(); c.strokeStyle = '#4a2c0f'; c.lineWidth = 2; c.stroke(); rr(c, cx - 3.5, by - 18, 7, 8, 2, '#ffd43b', '#4a2c0f', 1.5); c.fillStyle = '#ffd43b'; c.fillRect(cx - 15, by - 22, 30, 2.5); } }
  function gate(c, px, py, T, t, col) { const cx = px + T / 2, cy = py + T / 2; c.save(); for (let i = 3; i >= 0; i--) { c.globalAlpha = 0.25 + i * 0.12; c.beginPath(); c.ellipse(cx, cy, 20 - i * 3.5 + Math.sin(t * 3 + i) * 1.5, 22 - i * 4 + Math.cos(t * 3 + i) * 1.5, t * (i % 2 ? 1 : -1) * 0.8, 0, TAU); c.fillStyle = ['#fff', '#d0bfff', col || '#9775fa', '#5f3dc4'][i]; c.fill(); } c.globalAlpha = 1; for (let i = 0; i < 5; i++) { const a = t * 1.5 + i * 1.257; star(c, cx + Math.cos(a) * 24, cy + Math.sin(a) * 24, 3, '#ffe066'); } c.restore(); for (const sx of [-1, 1]) rr(c, cx + sx * 25 - 4, py - 4, 8, T + 2, 3, '#868e96', '#495057', 1.5); }
  function fogWall(c, px, py, T, t) { c.save(); for (let i = 0; i < 5; i++) { c.globalAlpha = 0.55; ell(c, px + 8 + i * 9 + Math.sin(t * 1.5 + i) * 4, py + T / 2 + Math.cos(t * 1.2 + i * 2) * 8, 14, 14, i % 2 ? '#5f3dc4' : '#343a6b'); } c.restore(); }
  function sparkle(c, x, y, t, ph) { const a = (t * 0.6 + ph) % 1; if (a > 0.35) return; const k = Math.sin(a / 0.35 * Math.PI); c.save(); c.globalAlpha = k; star(c, x, y, 2 + 5 * k, '#fff9db'); c.restore(); }
  function crystal(c, x, y, r, col, t) { c.save(); c.translate(x, y); c.shadowColor = col; c.shadowBlur = 14 + Math.sin(t * 4) * 5; c.beginPath(); c.moveTo(0, -r); c.lineTo(r * 0.6, -r * 0.2); c.lineTo(r * 0.35, r); c.lineTo(-r * 0.35, r); c.lineTo(-r * 0.6, -r * 0.2); c.closePath(); c.fillStyle = col; c.fill(); c.shadowBlur = 0; c.beginPath(); c.moveTo(0, -r); c.lineTo(-r * 0.6, -r * 0.2); c.lineTo(-r * 0.1, r * 0.1); c.closePath(); c.fillStyle = 'rgba(255,255,255,.55)'; c.fill(); c.restore(); }

  return { hero, lumi, fog, villager, weapon, ground, tallGrass, tree, rock, house, chest, gate, fogWall, sparkle, crystal, star, ell, rr, shade, EL, INK, hash };
})();
