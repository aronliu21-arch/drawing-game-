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
    // drawn pointing up from the hand at (0,0)
    const col = w.col || '#cfd8dc';
    c.lineJoin = 'round';
    const k = w.kind;
    if (k === 'sword') {
      c.beginPath(); c.moveTo(-4, -6); c.lineTo(-4, -34); c.lineTo(0, -42); c.lineTo(4, -34); c.lineTo(4, -6); c.closePath(); c.fillStyle = col; c.fill(); c.strokeStyle = INK; c.lineWidth = 2; c.stroke();
      c.beginPath(); c.moveTo(0, -8); c.lineTo(0, -36); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.5; c.stroke();
      rr(c, -9, -8, 18, 5, 2, w.trim || '#f4b400', INK, 2); rr(c, -2.5, -4, 5, 10, 2, '#6d4c2f', INK, 2);
    } else if (k === 'axe') {
      rr(c, -2.5, -40, 5, 46, 2, '#8d6e4a', INK, 2);
      c.beginPath(); c.moveTo(2, -38); c.quadraticCurveTo(22, -40, 18, -22); c.quadraticCurveTo(10, -26, 2, -24); c.closePath(); c.fillStyle = col; c.fill(); c.strokeStyle = INK; c.lineWidth = 2; c.stroke();
      c.beginPath(); c.moveTo(-2, -38); c.quadraticCurveTo(-14, -36, -12, -26); c.lineTo(-2, -26); c.closePath(); c.fillStyle = shade(col, -0.15); c.fill(); c.stroke();
    } else if (k === 'spear' || k === 'trident') {
      rr(c, -2, -38, 4, 46, 2, '#8d6e4a', INK, 2);
      c.fillStyle = col; c.strokeStyle = INK; c.lineWidth = 2;
      c.beginPath(); c.moveTo(-5, -36); c.lineTo(0, -52); c.lineTo(5, -36); c.closePath(); c.fill(); c.stroke();
      if (k === 'trident') { for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * 3, -36); c.quadraticCurveTo(sx * 12, -36, sx * 10, -48); c.lineTo(sx * 7, -40); c.closePath(); c.fill(); c.stroke(); } }
    } else if (k === 'hammer') {
      rr(c, -2.5, -34, 5, 40, 2, '#8d6e4a', INK, 2); rr(c, -13, -46, 26, 15, 3, col, INK, 2);
      ell(c, 0, -38.5, 4, 4, w.trim || '#f4b400', INK, 1.5);
    } else if (k === 'staff') {
      rr(c, -2.5, -38, 5, 46, 2, '#7b5a3a', INK, 2);
      c.save(); c.shadowColor = col; c.shadowBlur = 12; ell(c, 0, -44, 7.5, 7.5, col, INK, 2); c.restore(); ell(c, -2, -46, 2.3, 2.3, '#fff');
    }
  }

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
    c.fillStyle = trim; c.font = '900 10px system-ui'; c.textAlign = 'center'; c.fillText(nora ? '9' : '6', 0, -28);
    // armour
    const a = o.armor || 0;
    if (a > 0) {
      const ac = ['', '#9c6b3f', '#b0bec5', '#7fe3ff', '#ffd43b'][a];
      for (const sx of [-1, 1]) { c.beginPath(); c.ellipse(sx * 15, -43, 8, 5.5, sx * 0.3, 0, TAU); c.fillStyle = ac; c.fill(); c.strokeStyle = INK; c.lineWidth = 2.2; c.stroke(); if (a >= 3) ell(c, sx * 16, -45, 2, 1.2, 'rgba(255,255,255,.9)'); }
      if (a >= 2) { c.beginPath(); c.moveTo(-9, -36); c.lineTo(9, -36); c.moveTo(-10, -31); c.lineTo(10, -31); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1.5; c.stroke(); }
    }
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
    const hy0 = -66;
    if (nora) { c.beginPath(); c.ellipse(0, hy0 - 1, 27, 27, 0, 0, TAU); c.fillStyle = '#17141c'; c.fill(); c.strokeStyle = INK; c.lineWidth = 2.5; c.stroke(); }
    else {
      c.beginPath(); const n = 11;
      for (let i = 0; i <= n * 2; i++) { const ang = Math.PI * (1.08 - i / (n * 2) * 1.16) * -1 - Math.PI * 0.0; const a2 = -Math.PI * 1.08 + (i / (n * 2)) * Math.PI * 1.16; const rad = i % 2 ? 41 + (i % 4 === 1 ? 4 : 0) : 25; c.lineTo(Math.cos(a2) * rad, hy0 + Math.sin(a2) * rad * 0.98); }
      c.closePath(); c.fillStyle = '#17141c'; c.fill(); c.strokeStyle = INK; c.lineWidth = 2.5; c.stroke();
    }
    ell(c, 0, hy0, 23, 22, '#ffd9b3', INK, 2.8);
    for (const sx of [-1, 1]) ell(c, sx * 23, hy0 + 2, 3.5, 5, '#ffd9b3', INK, 2);
    if (nora) {
      // side-swept bangs, all curves
      c.beginPath(); c.moveTo(-24, hy0 + 2); c.bezierCurveTo(-27, hy0 - 26, 20, hy0 - 30, 24, hy0 - 2);
      c.bezierCurveTo(20, hy0 - 12, 10, hy0 - 15, 2, hy0 - 14); c.bezierCurveTo(-8, hy0 - 12, -16, hy0 - 6, -19, hy0 + 4); c.closePath();
      c.fillStyle = '#17141c'; c.fill(); c.strokeStyle = INK; c.lineWidth = 2; c.stroke();
      for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * 22, hy0 - 4); c.quadraticCurveTo(sx * 27, hy0 + 8, sx * 22, hy0 + 19); c.quadraticCurveTo(sx * 19.5, hy0 + 8, sx * 20, hy0 - 2); c.closePath(); c.fillStyle = '#17141c'; c.fill(); }
      c.beginPath(); c.moveTo(-8, hy0 - 21); c.quadraticCurveTo(2, hy0 - 24, 12, hy0 - 19); c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 2.6; c.stroke();
      star(c, -15, hy0 - 12, 5.5, '#ffd43b', INK, 1.2);
    } else {
      c.beginPath(); c.moveTo(-23, hy0 - 4); c.lineTo(-17, hy0 - 16); c.lineTo(-13, hy0 - 6); c.lineTo(-7, hy0 - 19); c.lineTo(-2, hy0 - 7); c.lineTo(5, hy0 - 20); c.lineTo(9, hy0 - 7); c.lineTo(16, hy0 - 17); c.lineTo(23, hy0 - 4);
      c.quadraticCurveTo(14, hy0 - 26, 0, hy0 - 25); c.quadraticCurveTo(-14, hy0 - 26, -23, hy0 - 4); c.closePath(); c.fillStyle = '#17141c'; c.fill();
    }
    // face
    for (const sx of [-1, 1]) {
      ell(c, sx * 9, hy0 + 3, 5.2, 7, nora ? '#6b3a1e' : '#17141c', INK, 1.6);
      if (nora) ell(c, sx * 9, hy0 + 4, 2.8, 4, '#17141c');
      ell(c, sx * 9 - 1.6, hy0 + 0.2, 2, 2.4, '#fff'); ell(c, sx * 9 + 1.8, hy0 + 5.6, 1, 1.1, '#fff');
      c.strokeStyle = INK;
      if (nora) { c.lineWidth = 2.6; c.beginPath(); c.moveTo(sx * 3.4, hy0 - 2.6); c.quadraticCurveTo(sx * 9, hy0 - 6.5, sx * 15.4, hy0 - 2); c.stroke(); c.lineWidth = 1.5; c.beginPath(); c.moveTo(sx * 4, hy0 - 10.5); c.quadraticCurveTo(sx * 9, hy0 - 12.6, sx * 15, hy0 - 10.6); c.stroke(); ell(c, sx * 15.5, hy0 + 10, 4, 2.2, 'rgba(255,120,150,.55)'); }
      else { c.lineWidth = 3.6; c.beginPath(); c.moveTo(sx * 15.5, hy0 - 9.5); c.lineTo(sx * 3.5, hy0 - 5); c.stroke(); }
    }
    if (nora) { c.beginPath(); c.moveTo(-6, hy0 + 12); c.quadraticCurveTo(0, hy0 + 21, 6, hy0 + 12); c.closePath(); c.fillStyle = '#a01f3c'; c.fill(); c.strokeStyle = INK; c.lineWidth = 1.8; c.stroke(); ell(c, 0, hy0 + 15.4, 2.6, 1.5, '#ff8fab'); }
    else { rr(c, -8, hy0 + 11, 16, 7, 2.5, '#fff', INK, 2); c.beginPath(); c.moveTo(-3, hy0 + 11); c.lineTo(-3, hy0 + 18); c.moveTo(3, hy0 + 11); c.lineTo(3, hy0 + 18); c.moveTo(-8, hy0 + 14.5); c.lineTo(8, hy0 + 14.5); c.strokeStyle = INK; c.lineWidth = 1.2; c.stroke(); }
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
