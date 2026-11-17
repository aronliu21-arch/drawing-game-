// Evolved Lumis become animals. Each is drawn in a 190 x 180 box with its feet at (95, 160), facing right.
const Animals = (() => {
  const TAU = Math.PI * 2, INK = '#15131f';
// Five creature design directions. Each draws a Fire, Water, Leaf and Star Lumi in a cell 190 x 180, feet at y 160.
function E(c, x, y, rx, ry, fill, stroke, lw, rot) { c.beginPath(); c.ellipse(x, y, rx, ry, rot || 0, 0, TAU); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 3; c.stroke(); } }
function F(c, fill, stroke, lw) { if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 3; c.lineJoin = 'round'; c.stroke(); } }
function poly(c, pts) { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); }
function shadow(c, x, rx) { E(c, x, 162, rx, rx * 0.22, 'rgba(0,0,0,.25)'); }
function eye(c, x, y, r, t, ph, col) { if (((t + (ph || 0)) % 3.4) < 0.1) { c.strokeStyle = INK; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x - r, y); c.lineTo(x + r, y); c.stroke(); return; } E(c, x, y, r, r * 1.2, col || INK); E(c, x - r * 0.35, y - r * 0.4, r * 0.38, r * 0.42, '#fff'); E(c, x + r * 0.35, y + r * 0.45, r * 0.16, r * 0.16, '#fff'); }
function smile(c, x, y, w, lw) { c.strokeStyle = INK; c.lineWidth = lw || 2.5; c.lineCap = 'round'; c.beginPath(); c.arc(x, y - w * 0.4, w, Math.PI * 0.2, Math.PI * 0.8); c.stroke(); }
function blush(c, x, y) { E(c, x, y, 6, 3.5, 'rgba(255,120,150,.45)'); }
function star(c, x, y, r, fill, stroke, lw, inner) { c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * (inner || 0.46) : r; c.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } c.closePath(); F(c, fill, stroke, lw); }
function flameShape(c, x, y, r, t) { c.beginPath(); c.moveTo(x, y - r * 1.6 - Math.sin(t * 9) * r * 0.2); c.bezierCurveTo(x + r * 1.1, y - r * 0.4, x + r, y + r, x, y + r); c.bezierCurveTo(x - r, y + r, x - r * 1.1, y - r * 0.4, x, y - r * 1.6 - Math.sin(t * 9) * r * 0.2); }
function shade(hex, a) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; const f = a < 0 ? 0 : 255, p = Math.abs(a); r = Math.round(r + (f - r) * p); g = Math.round(g + (f - g) * p); b = Math.round(b + (f - b) * p); return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1); }

// ---------- 1. Animal Friends: real animal silhouettes, bold outline ----------
const A = {
  fox(c, t) {
    shadow(c, 92, 52); const b = Math.abs(Math.sin(t * 3)) * 2; c.save(); c.translate(0, -b);
    c.save(); c.translate(58, 128); c.rotate(Math.sin(t * 2.5) * 0.12);
    c.beginPath(); c.moveTo(0, 2); c.bezierCurveTo(-40, 6, -50, -50, -20, -66); c.bezierCurveTo(-6, -72, 4, -60, -4, -48); c.bezierCurveTo(-12, -32, 2, -12, 14, -6); c.closePath(); F(c, '#ff8c42', INK, 3);
    flameShape(c, -18, -62, 11, t); F(c, '#ffd43b'); c.restore();
    for (const x of [62, 76, 106, 120]) { c.beginPath(); c.roundRect(x - 5, 128, 10, 30, 4); F(c, '#e8590c', INK, 2.5); }
    E(c, 90, 124, 40, 22, '#ff8c42', INK, 3); E(c, 96, 134, 26, 9, '#fff1e0');
    poly(c, [[112, 86], [116, 58], [130, 80]]); F(c, '#ff8c42', INK, 3); poly(c, [[128, 80], [140, 56], [146, 84]]); F(c, '#ff8c42', INK, 3);
    E(c, 128, 100, 25, 23, '#ff8c42', INK, 3);
    c.beginPath(); c.moveTo(138, 94); c.quadraticCurveTo(168, 100, 164, 108); c.quadraticCurveTo(150, 118, 136, 114); F(c, '#fff1e0', INK, 3); E(c, 163, 106, 4, 3.5, INK);
    eye(c, 132, 96, 4.6, t, 0); blush(c, 120, 108); c.restore();
  },
  otter(c, t) {
    shadow(c, 95, 40); const b = Math.sin(t * 2.4) * 2; c.save(); c.translate(0, b);
    c.save(); c.translate(122, 148); c.rotate(0.5 + Math.sin(t * 3) * 0.1); E(c, 10, 0, 22, 8, '#2b6cb0', INK, 3); c.restore();
    for (const x of [80, 110]) E(c, x, 156, 13, 6, '#2b6cb0', INK, 3);
    c.beginPath(); c.moveTo(95, 52); c.bezierCurveTo(132, 52, 130, 160, 95, 158); c.bezierCurveTo(60, 160, 58, 52, 95, 52); F(c, '#3d8bd4', INK, 3);
    c.beginPath(); c.moveTo(95, 92); c.bezierCurveTo(118, 92, 116, 150, 95, 150); c.bezierCurveTo(74, 150, 72, 92, 95, 92); F(c, '#cfe8ff');
    for (const s of [-1, 1]) E(c, 95 + s * 22, 50, 7, 7, '#3d8bd4', INK, 3);
    E(c, 95, 66, 30, 24, '#3d8bd4', INK, 3); E(c, 95, 76, 16, 10, '#e7f5ff', INK, 2); E(c, 95, 71, 5, 3.5, INK);
    c.strokeStyle = INK; c.lineWidth = 1.5; for (const s of [-1, 1]) for (const k of [0, 5]) { c.beginPath(); c.moveTo(95 + s * 12, 76 + k); c.lineTo(95 + s * 30, 72 + k * 1.6); c.stroke(); }
    eye(c, 83, 60, 4.4, t, 1); eye(c, 107, 60, 4.4, t, 1);
    c.beginPath(); c.moveTo(80, 116); c.quadraticCurveTo(95, 98, 110, 116); c.quadraticCurveTo(95, 126, 80, 116); F(c, '#ffa8c5', INK, 2.5);
    for (const s of [-1, 1]) E(c, 95 + s * 15, 118, 7, 6, '#3d8bd4', INK, 2.5); c.restore();
  },
  fawn(c, t) {
    shadow(c, 92, 46);
    for (const [x, ph] of [[64, 0], [74, 1], [108, 2], [118, 3]]) { c.beginPath(); c.roundRect(x - 3.5, 112, 7, 44, 3); F(c, '#a77c52', INK, 2.5); E(c, x, 157, 5, 3, INK); }
    E(c, 58, 104, 8, 7, '#fff', INK, 2.5);
    E(c, 91, 112, 37, 19, '#c19a6b', INK, 3); for (const [x, y] of [[78, 106], [96, 104], [86, 116], [106, 112], [70, 114]]) E(c, x, y, 3.2, 3.2, '#fff');
    c.beginPath(); c.moveTo(104, 104); c.quadraticCurveTo(116, 78, 124, 66); c.lineTo(138, 72); c.quadraticCurveTo(128, 92, 122, 112); F(c, '#c19a6b', INK, 3);
    const sw = Math.sin(t * 2) * 0.08;
    for (const [x, rot] of [[122, -0.5], [140, 0.3]]) { c.save(); c.translate(x, 50); c.rotate(rot + sw); c.strokeStyle = '#6b4f2e'; c.lineWidth = 3.5; c.beginPath(); c.moveTo(0, 6); c.lineTo(0, -16); c.moveTo(0, -6); c.lineTo(-8, -14); c.stroke(); E(c, 0, -22, 5, 9, '#51cf66', INK, 2); E(c, -11, -18, 4, 7, '#69db7c', INK, 2, -0.6); c.restore(); }
    E(c, 117, 58, 13, 7, '#c19a6b', INK, 2.5, -0.6); E(c, 146, 56, 13, 7, '#c19a6b', INK, 2.5, 0.6);
    E(c, 132, 66, 17, 15, '#c19a6b', INK, 3); E(c, 145, 74, 10, 8, '#e6ccb0', INK, 2.5); E(c, 151, 72, 3.5, 3, INK);
    eye(c, 133, 63, 4.4, t, 2); blush(c, 126, 74);
  },
  owl(c, t) {
    shadow(c, 95, 40);
    for (const s of [-1, 1]) for (const k of [-4, 0, 4]) { c.strokeStyle = '#e67700'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(95 + s * 13, 150); c.lineTo(95 + s * 13 + k, 160); c.stroke(); }
    c.beginPath(); c.moveTo(95, 46); c.bezierCurveTo(140, 46, 138, 154, 95, 154); c.bezierCurveTo(52, 154, 50, 46, 95, 46); F(c, '#f2b705', INK, 3);
    const fl = Math.sin(t * 5) * 0.06;
    for (const s of [-1, 1]) { c.save(); c.translate(95 + s * 33, 102); c.rotate(s * (0.12 + fl)); c.beginPath(); c.ellipse(0, 6, 12, 34, 0, 0, TAU); F(c, '#c98a00', INK, 3); c.restore(); }
    for (const s of [-1, 1]) { poly(c, [[95 + s * 16, 56], [95 + s * 34, 30], [95 + s * 34, 60]]); F(c, '#c98a00', INK, 3); }
    E(c, 95, 80, 33, 24, '#fff3bf', INK, 2.5);
    for (const s of [-1, 1]) { E(c, 95 + s * 15, 78, 12, 12, '#ffa94d', INK, 2); eye(c, 95 + s * 15, 78, 7, t, 3); }
    poly(c, [[90, 90], [100, 90], [95, 100]]); F(c, '#e67700', INK, 2);
    star(c, 95, 128, 11, '#fff9db', INK, 2);
  },
  bison(c, t) { // Oakhorn: a shaggy bison with acorn horns and a leafy hump
    shadow(c, 92, 54); const b = Math.abs(Math.sin(t * 2.6)) * 1.5; c.save(); c.translate(0, -b);
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(48, 112); c.quadraticCurveTo(38, 122, 42, 136); c.stroke(); E(c, 42, 138, 5, 6, '#5c3d2e', INK, 2);
    for (const x of [58, 74, 106, 122]) { c.beginPath(); c.roundRect(x - 7, 126, 14, 32, 5); F(c, '#6b4f2e', INK, 2.5); }
    E(c, 86, 118, 42, 28, '#8d6e4a', INK, 3); E(c, 112, 104, 28, 32, '#6b4f2e', INK, 3);
    for (const [x, r] of [[100, -0.5], [116, 0.4]]) { c.save(); c.translate(x, 74); c.rotate(r + Math.sin(t * 2) * 0.06); E(c, 0, -10, 6, 12, '#51cf66', INK, 2); c.restore(); }
    E(c, 140, 118, 19, 17, '#6b4f2e', INK, 3); E(c, 152, 126, 11, 9, '#b08968', INK, 2.5); E(c, 156, 124, 2.4, 2, INK);
    for (const s of [-1, 1]) { c.save(); c.translate(138 + s * 9, 102); c.rotate(s * 0.5); E(c, 0, -7, 6, 8, '#d9a066', INK, 2); c.beginPath(); c.roundRect(-6, -17, 12, 6, 3); F(c, '#8d6e4a', INK, 2); c.restore(); }
    eye(c, 142, 113, 4.2, t, 0); blush(c, 134, 124); c.restore();
  },
  turtle(c, t) { // Reefguard: a sea turtle with coral on its shell
    shadow(c, 92, 54); const b = Math.sin(t * 2) * 1.5;
    for (const [x, r] of [[60, 0.4], [118, -0.3]]) { c.save(); c.translate(x, 152); c.rotate(r + Math.sin(t * 3 + x) * 0.15); E(c, 0, 0, 15, 7, '#63e6be', INK, 2.5); c.restore(); }
    c.save(); c.translate(0, b); c.beginPath(); c.moveTo(136, 132); c.quadraticCurveTo(150, 110, 160, 118); F(c, null, INK, 3);
    E(c, 150, 124, 16, 13, '#63e6be', INK, 3); eye(c, 156, 120, 4, t, 1); smile(c, 156, 130, 4, 2);
    c.beginPath(); c.moveTo(42, 146); c.bezierCurveTo(44, 84, 140, 84, 142, 146); c.closePath(); F(c, '#0ca678', INK, 3);
    c.strokeStyle = 'rgba(21,19,31,.35)'; c.lineWidth = 2; for (const [x, y] of [[70, 124], [92, 112], [114, 124], [92, 134]]) { c.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; c.lineTo(x + Math.cos(a) * 11, y + Math.sin(a) * 9); } c.closePath(); c.stroke(); }
    c.beginPath(); c.roundRect(40, 142, 104, 9, 4); F(c, '#96f2d7', INK, 2.5);
    c.strokeStyle = '#f783ac'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(84, 92); c.lineTo(84, 74); c.moveTo(84, 82); c.lineTo(74, 72); c.moveTo(84, 78); c.lineTo(94, 68); c.stroke(); c.restore();
  },
  axolotl(c, t) { // Geyserix: an axolotl with steaming gills
    shadow(c, 92, 52);
    for (let i = 0; i < 3; i++) { const p = (t * 0.6 + i / 3) % 1; c.globalAlpha = 1 - p; E(c, 150 + i * 6, 96 - p * 46, 5 + p * 7, 4 + p * 6, '#fff'); } c.globalAlpha = 1;
    c.beginPath(); c.moveTo(64, 138); c.quadraticCurveTo(30, 136, 20, 118 + Math.sin(t * 3) * 6); c.quadraticCurveTo(40, 150, 72, 150); F(c, '#ff8787', INK, 3);
    for (const [x, d] of [[66, -1], [80, 1], [108, -1], [122, 1]]) { c.beginPath(); c.moveTo(x, 146); c.lineTo(x + d * 6, 160); F(c, null, INK, 6); c.strokeStyle = '#ff8787'; c.lineWidth = 3; c.stroke(); }
    E(c, 94, 140, 38, 15, '#ff8787', INK, 3); for (const x of [78, 96, 112]) E(c, x, 134, 3, 3, '#c92a2a');
    for (const s of [-1, 0, 1]) { c.save(); c.translate(130, 116); c.rotate(-0.9 + s * 0.45 + Math.sin(t * 4 + s) * 0.08); E(c, 0, -20, 4.5, 12, '#e03131', INK, 2); c.restore(); }
    E(c, 140, 126, 22, 17, '#ffa8a8', INK, 3); eye(c, 146, 121, 4.4, t, 1); smile(c, 150, 133, 6, 2.2); blush(c, 136, 132);
  },
  bear(c, t) { // Frostbear: a polar bear cub with an ice crystal
    shadow(c, 94, 52); const b = Math.abs(Math.sin(t * 2.6)) * 1.5; c.save(); c.translate(0, -b);
    for (const x of [60, 76, 108, 124]) { c.beginPath(); c.roundRect(x - 8, 128, 16, 30, 7); F(c, '#e7f5ff', INK, 2.5); }
    E(c, 90, 122, 44, 28, '#f1f8ff', INK, 3);
    poly(c, [[78, 96], [88, 74], [98, 96], [88, 104]]); F(c, '#a5d8ff', INK, 2.5); poly(c, [[96, 98], [104, 84], [110, 100]]); F(c, '#d0ebff', INK, 2);
    for (const s of [-1, 1]) E(c, 136 + s * 14, 86, 7, 7, '#f1f8ff', INK, 2.5);
    E(c, 136, 104, 24, 21, '#f1f8ff', INK, 3); E(c, 150, 112, 12, 9, '#fff', INK, 2.5); E(c, 156, 109, 4, 3, INK);
    eye(c, 138, 98, 4.4, t, 2); blush(c, 128, 110); c.restore();
  },
  goat(c, t) { // Summitar: a mountain goat with golden curled horns
    shadow(c, 92, 46);
    for (const x of [66, 78, 106, 118]) { c.beginPath(); c.roundRect(x - 4, 116, 8, 40, 3); F(c, '#dee2e6', INK, 2.5); E(c, x, 157, 5.5, 3, INK); }
    E(c, 92, 112, 36, 20, '#f1f3f5', INK, 3); star(c, 84, 112, 9, '#ffd43b', INK, 1.8);
    c.beginPath(); c.moveTo(110, 104); c.quadraticCurveTo(118, 88, 124, 80); c.lineTo(136, 86); c.quadraticCurveTo(128, 100, 124, 112); F(c, '#f1f3f5', INK, 3);
    c.strokeStyle = INK; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.arc(124, 66, 11, Math.PI * 0.9, Math.PI * 2.4); c.stroke(); c.strokeStyle = '#f2b705'; c.lineWidth = 3.5; c.stroke();
    E(c, 132, 80, 16, 14, '#f1f3f5', INK, 3); E(c, 144, 86, 8, 7, '#e9ecef', INK, 2.5); E(c, 149, 85, 2.4, 2.2, INK);
    poly(c, [[134, 92], [142, 92], [138, 106]]); F(c, '#f1f3f5', INK, 2.5); eye(c, 134, 76, 4.2, t, 3); blush(c, 128, 86);
  },
  hedgehog(c, t) { // Gearon: a hedgehog with a brass gear on its back
    shadow(c, 92, 48);
    for (let i = 0; i < 13; i++) { const a = Math.PI * (1.02 + i * 0.075), x = 90 + Math.cos(a) * 44, y = 134 + Math.sin(a) * 36; poly(c, [[90 + Math.cos(a - 0.08) * 36, 134 + Math.sin(a - 0.08) * 28], [x + Math.cos(a) * 12, y + Math.sin(a) * 12], [90 + Math.cos(a + 0.08) * 36, 134 + Math.sin(a + 0.08) * 28]]); F(c, '#8d6e4a', INK, 2); }
    E(c, 92, 134, 40, 28, '#a47148', INK, 3);
    c.save(); c.translate(84, 112); c.rotate(t * 1.5); for (let i = 0; i < 8; i++) { c.rotate(Math.PI / 4); c.beginPath(); c.roundRect(-4, -18, 8, 8, 2); F(c, '#f2b705', INK, 2); } E(c, 0, 0, 13, 13, '#f2b705', INK, 2.5); E(c, 0, 0, 4.5, 4.5, '#8d6e4a'); c.restore();
    for (const x of [72, 110]) E(c, x, 158, 9, 4, '#5c3d2e');
    c.beginPath(); c.moveTo(118, 120); c.quadraticCurveTo(152, 128, 152, 138); c.quadraticCurveTo(140, 150, 118, 150); F(c, '#e6ccb0', INK, 3); E(c, 152, 136, 4, 3.5, INK);
    eye(c, 128, 130, 4.2, t, 0); blush(c, 124, 142);
  },
  dragon(c, t) { // Dunedrake: a little sand dragon
    shadow(c, 92, 44);
    c.save(); c.translate(58, 142); c.rotate(Math.sin(t * 2.4) * 0.1); c.beginPath(); c.moveTo(6, 0); c.quadraticCurveTo(-30, 4, -32, -26); c.lineTo(-24, -24); c.quadraticCurveTo(-20, -4, 10, -12); F(c, '#f59f00', INK, 3); flameShape(c, -30, -34, 8, t); F(c, '#ff6b35', INK, 2); c.restore();
    const fl = Math.sin(t * 4) * 0.1; c.save(); c.translate(84, 100); c.rotate(-0.3 + fl); c.beginPath(); c.moveTo(0, 0); c.lineTo(-30, -36); c.quadraticCurveTo(-24, -20, -38, -16); c.quadraticCurveTo(-24, -10, -32, 2); c.quadraticCurveTo(-16, 0, 0, 10); F(c, '#ffd8a8', INK, 2.5); c.restore();
    for (const x of [74, 104]) { c.beginPath(); c.roundRect(x - 7, 136, 14, 22, 6); F(c, '#e67700', INK, 2.5); }
    E(c, 90, 124, 30, 30, '#f59f00', INK, 3); E(c, 98, 128, 16, 22, '#fff3bf', INK, 2); c.strokeStyle = 'rgba(230,119,0,.6)'; c.lineWidth = 2; for (const y of [118, 128, 138]) { c.beginPath(); c.moveTo(86, y); c.lineTo(110, y); c.stroke(); }
    for (const s of [0, 1]) { poly(c, [[118 + s * 12, 74], [116 + s * 16, 58], [126 + s * 12, 72]]); F(c, '#fff3bf', INK, 2); }
    E(c, 126, 92, 22, 19, '#f59f00', INK, 3); E(c, 142, 98, 12, 9, '#ffc078', INK, 2.5); E(c, 148, 95, 2.4, 2, INK);
    eye(c, 128, 87, 4.6, t, 2); blush(c, 120, 100);
  },
  panda(c, t) { // Pandaroo: a panda holding bamboo
    shadow(c, 95, 40);
    for (const s of [-1, 1]) E(c, 95 + s * 20, 150, 14, 11, '#212529', INK, 2.5);
    E(c, 95, 124, 36, 32, '#f8f9fa', INK, 3);
    c.save(); c.translate(124, 120); c.rotate(0.2 + Math.sin(t * 2) * 0.05); c.beginPath(); c.roundRect(-4, -54, 8, 70, 3); F(c, '#69db7c', INK, 2.5); c.strokeStyle = 'rgba(21,19,31,.4)'; c.lineWidth = 1.5; for (const y of [-34, -14]) { c.beginPath(); c.moveTo(-4, y); c.lineTo(4, y); c.stroke(); } E(c, 10, -50, 11, 4.5, '#51cf66', INK, 1.8, -0.5); c.restore();
    for (const s of [-1, 1]) E(c, 95 + s * 28, 118, 11, 15, '#212529', INK, 2.5, s * -0.4);
    for (const s of [-1, 1]) E(c, 95 + s * 21, 54, 9, 9, '#212529', INK, 2.5);
    E(c, 95, 76, 30, 26, '#f8f9fa', INK, 3);
    for (const s of [-1, 1]) { E(c, 95 + s * 11, 72, 8, 10, '#212529', null, 0, s * -0.5); eye(c, 95 + s * 11, 72, 3.6, t, 3, '#fff'); E(c, 95 + s * 11, 73, 2.2, 2.6, INK); }
    E(c, 95, 84, 5, 3.5, INK); smile(c, 95, 92, 4, 2); blush(c, 76, 84); blush(c, 114, 84);
  },
  moth(c, t) { // Lanternix: a glowing lantern moth
    const y = 104 + Math.sin(t * 2) * 4, fl = 1 - Math.abs(Math.sin(t * 5)) * 0.18; E(c, 95, 162, 30, 6, 'rgba(229,153,247,.3)');
    c.save(); c.shadowColor = '#ffd43b'; c.shadowBlur = 18;
    for (const s of [-1, 1]) { c.save(); c.translate(95, y); c.scale(s * fl, 1);
      c.beginPath(); c.moveTo(4, -6); c.bezierCurveTo(30, -50, 66, -40, 60, -10); c.bezierCurveTo(56, 4, 30, 4, 4, 0); F(c, '#e599f7', INK, 3); E(c, 40, -20, 9, 9, '#ffd43b', INK, 2); E(c, 40, -20, 4, 4, '#ff922b');
      c.beginPath(); c.moveTo(4, 4); c.bezierCurveTo(34, 8, 44, 34, 26, 40); c.bezierCurveTo(14, 42, 6, 26, 4, 8); F(c, '#cc5de8', INK, 3); c.restore(); }
    c.restore();
    E(c, 95, y + 8, 11, 24, '#ffe8a3', INK, 3); c.strokeStyle = 'rgba(21,19,31,.3)'; c.lineWidth = 2; for (const k of [4, 12, 20]) { c.beginPath(); c.moveTo(85, y + k); c.lineTo(105, y + k); c.stroke(); }
    for (const s of [-1, 1]) { c.strokeStyle = INK; c.lineWidth = 2.5; c.beginPath(); c.moveTo(95 + s * 4, y - 24); c.quadraticCurveTo(95 + s * 14, y - 46, 95 + s * 24, y - 48); c.stroke(); E(c, 95 + s * 24, y - 48, 4, 4, '#ffd43b', INK, 1.8); }
    E(c, 95, y - 16, 13, 11, '#ffe8a3', INK, 3); eye(c, 90, y - 17, 3.2, t, 0); eye(c, 100, y - 17, 3.2, t, 0); smile(c, 95, y - 10, 3, 1.8);
  },
  bat(c, t) { // Echo: a small bat that is not afraid to speak up
    const y = 96 + Math.sin(t * 2.4) * 5, fl = Math.sin(t * 7) * 0.14; E(c, 95, 162, 26, 5, 'rgba(177,151,252,.3)');
    for (let i = 0; i < 3; i++) { const p = (t * 0.5 + i / 3) % 1; c.globalAlpha = 1 - p; c.strokeStyle = '#d0bfff'; c.lineWidth = 3; c.beginPath(); c.arc(95, y, 30 + p * 50, -Math.PI * 0.8, -Math.PI * 0.2); c.stroke(); } c.globalAlpha = 1;
    for (const s of [-1, 1]) { c.save(); c.translate(95 + s * 14, y); c.rotate(s * fl); c.scale(s, 1); c.beginPath(); c.moveTo(0, -10); c.quadraticCurveTo(30, -36, 64, -20); c.quadraticCurveTo(56, -6, 58, 8); c.quadraticCurveTo(46, -2, 40, 10); c.quadraticCurveTo(28, 0, 20, 12); c.quadraticCurveTo(10, 4, 0, 10); F(c, '#7048e8', INK, 3); c.restore(); }
    for (const s of [-1, 1]) { poly(c, [[95 + s * 6, y - 18], [95 + s * 20, y - 44], [95 + s * 22, y - 12]]); F(c, '#9775fa', INK, 2.5); }
    E(c, 95, y, 22, 22, '#9775fa', INK, 3); E(c, 95, y + 8, 13, 10, '#e5dbff'); star(c, 95, y + 9, 5, '#ffd43b');
    eye(c, 87, y - 4, 4.2, t, 1); eye(c, 103, y - 4, 4.2, t, 1); smile(c, 95, y + 3, 3.5, 2); blush(c, 80, y + 2); blush(c, 110, y + 2);
    for (const s of [-1, 1]) E(c, 95 + s * 7, y + 24, 3.5, 3, '#5f3dc4');
  },
};
  return A;
})();
