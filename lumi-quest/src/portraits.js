// Large talking portraits for the dialog box. Drawn on a 280 x 340 canvas, shoulders at the bottom.
// The kids use their own bold style; everyone else uses a softer style without outlines.
const Portraits = (() => {
  const PW = 280, PH = 340, TAU = Math.PI * 2, INK = '#15131f';
  const E = (c, x, y, rx, ry, fill, rot) => { c.beginPath(); c.ellipse(x, y, rx, ry, rot || 0, 0, TAU); c.fillStyle = fill; c.fill(); };

  // ---------- a soft-style person ----------
  function bust(c, v, mood, t, talk) {
    const skin = v.skin || '#f2c9a0', hair = v.hair || '#6d4c41', col = v.col || '#1c7ed6', hx = 140, hy = 168;
    const dark = Art.shade(col, -0.25), skinD = Art.shade(skin, -0.12);
    // long hair behind the head
    if (v.hat === 'bun' || v.hat === 'long') { c.beginPath(); c.moveTo(hx - 84, hy); c.bezierCurveTo(hx - 92, hy + 110, hx - 60, hy + 140, hx - 40, hy + 120); c.lineTo(hx + 40, hy + 120); c.bezierCurveTo(hx + 60, hy + 140, hx + 92, hy + 110, hx + 84, hy); c.closePath(); c.fillStyle = Art.shade(hair, -0.1); c.fill(); }
    // shoulders and neck
    c.beginPath(); c.moveTo(22, PH); c.bezierCurveTo(26, 290, 64, 262, 110, 258); c.lineTo(170, 258); c.bezierCurveTo(216, 262, 254, 290, 258, PH); c.closePath(); c.fillStyle = col; c.fill();
    c.beginPath(); c.moveTo(108, 258); c.lineTo(140, 300); c.lineTo(172, 258); c.closePath(); c.fillStyle = dark; c.fill();
    c.fillStyle = skinD; c.fillRect(118, 226, 44, 40);
    if (v.hat === 'captain') { c.fillStyle = '#ffd43b'; for (const sx of [-1, 1]) { c.beginPath(); c.roundRect(hx + sx * 92 - 22, 262, 44, 12, 5); c.fill(); } }
    if (v.hat === 'scarf') { c.beginPath(); c.roundRect(96, 244, 88, 26, 12); c.fillStyle = '#f783ac'; c.fill(); }
    // ears and head
    if (v.hat !== 'elder') E(c, hx, hy - 8, 82, 84, hair); // hair behind the head, so the top is never bald
    for (const sx of [-1, 1]) E(c, hx + sx * 74, hy + 8, 13, 18, skinD);
    E(c, hx, hy, 74, 80, skin);
    // hair and hats
    const fringe = () => { c.beginPath(); c.moveTo(hx - 78, hy + 6); c.bezierCurveTo(hx - 96, hy - 118, hx + 96, hy - 118, hx + 78, hy + 6); c.bezierCurveTo(hx + 66, hy - 30, hx + 40, hy - 50, hx + 10, hy - 44); c.bezierCurveTo(hx - 18, hy - 36, hx - 52, hy - 48, hx - 78, hy + 6); c.fillStyle = hair; c.fill(); };
    if (v.hat === 'elder') {
      for (const sx of [-1, 1]) { c.beginPath(); c.ellipse(hx + sx * 66, hy - 18, 22, 36, sx * 0.2, 0, TAU); c.fillStyle = '#f1f3f5'; c.fill(); }
      c.beginPath(); c.moveTo(hx - 58, hy + 18); c.bezierCurveTo(hx - 70, hy + 120, hx - 20, hy + 150, hx, hy + 156); c.bezierCurveTo(hx + 20, hy + 150, hx + 70, hy + 120, hx + 58, hy + 18); c.bezierCurveTo(hx + 30, hy + 50, hx - 30, hy + 50, hx - 58, hy + 18); c.fillStyle = '#f8f9fa'; c.fill();
      c.save(); c.shadowColor = '#ffe066'; c.shadowBlur = 24; E(c, 248, 120 + Math.sin(t * 2) * 3, 16, 16, '#ffe066'); c.restore(); c.fillStyle = '#8d6e4a'; c.fillRect(244, 136, 8, PH - 136);
    } else if (v.hat === 'messy') { fringe(); c.fillStyle = hair; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(hx - 60 + i * 22, hy - 62 + Math.abs(i - 2.5) * 6); c.lineTo(hx - 50 + i * 22, hy - 90 + Math.abs(i - 2.5) * 6); c.lineTo(hx - 40 + i * 22, hy - 62 + Math.abs(i - 2.5) * 6); c.fill(); } }
    else { fringe(); }
    if (v.hat === 'bun') E(c, hx, hy - 86, 28, 26, hair);
    if (v.hat === 'shop') { c.beginPath(); c.ellipse(hx, hy - 50, 80, 40, 0, Math.PI, 0); c.fillStyle = '#e03131'; c.fill(); c.beginPath(); c.roundRect(hx - 92, hy - 56, 184, 16, 8); c.fill(); }
    if (v.hat === 'heal') { c.beginPath(); c.roundRect(hx - 50, hy - 112, 100, 46, 14); c.fillStyle = '#fff'; c.fill(); c.fillStyle = '#e03131'; c.fillRect(hx - 6, hy - 104, 12, 30); c.fillRect(hx - 15, hy - 95, 30, 12); }
    if (v.hat === 'captain') { c.beginPath(); c.ellipse(hx, hy - 56, 84, 30, 0, Math.PI, 0); c.fillStyle = '#1c3d6e'; c.fill(); c.beginPath(); c.roundRect(hx - 92, hy - 60, 184, 14, 7); c.fill(); Art.star(c, hx, hy - 74, 12, '#ffd43b'); }
    if (v.hat === 'goggles') { c.beginPath(); c.roundRect(hx - 76, hy - 54, 152, 12, 6); c.fillStyle = '#5c3d2e'; c.fill(); for (const sx of [-1, 1]) { E(c, hx + sx * 30, hy - 48, 20, 16, '#e8a33d'); E(c, hx + sx * 30, hy - 48, 13, 10, '#a5d8ff'); } }
    // face
    const blink = ((t * 0.9 + (v.ph || 0)) % 3.6) < 0.1, ey = hy + 10, BR = { calm: [0, 0], happy: [-4, -4], sad: [6, -6], think: [0, -8], surprised: [-10, -10], worried: [6, -6] }[mood] || [0, 0];
    for (const sx of [-1, 1]) {
      const ex = hx + sx * 30;
      if (blink) { c.strokeStyle = INK; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(ex - 12, ey); c.lineTo(ex + 12, ey); c.stroke(); }
      else if (mood === 'happy' && !talk) { c.strokeStyle = INK; c.lineWidth = 4.5; c.lineCap = 'round'; c.beginPath(); c.arc(ex, ey + 6, 12, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); }
      else { E(c, ex, ey, 12, 15, '#3b2a1e'); E(c, ex, ey + 2, 7, 9, INK); E(c, ex - 4, ey - 5, 4, 4.5, '#fff'); E(c, ex + 4, ey + 6, 2, 2, '#fff'); }
      c.strokeStyle = v.hat === 'elder' ? '#dee2e6' : Art.shade(hair, -0.2); c.lineWidth = v.hat === 'elder' ? 8 : 5; c.lineCap = 'round';
      c.beginPath(); c.moveTo(hx + sx * 46, ey - 26 + (sx > 0 ? BR[0] : BR[0])); c.quadraticCurveTo(hx + sx * 30, ey - 34 + (BR[0] + BR[1]) / 2, hx + sx * 14, ey - 26 + BR[1]); c.stroke();
      E(c, hx + sx * 48, ey + 26, 14, 8, 'rgba(255,120,140,.35)');
    }
    c.strokeStyle = skinD; c.lineWidth = 3; c.beginPath(); c.arc(hx, ey + 26, 6, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke();
    const my = ey + 48;
    if (v.hat === 'elder') { c.beginPath(); c.moveTo(hx - 40, my - 8); c.quadraticCurveTo(hx, my - 24, hx + 40, my - 8); c.quadraticCurveTo(hx, my + 4, hx - 40, my - 8); c.fillStyle = '#e9ecef'; c.fill(); }
    if (talk) { const o = Math.abs(Math.sin(t * 16)); E(c, hx, my, 14, 4 + o * 10, '#9c3b4a'); }
    else if (mood === 'sad' || mood === 'worried') { c.strokeStyle = '#7a3b3b'; c.lineWidth = 4; c.beginPath(); c.arc(hx, my + 12, 14, Math.PI * 1.2, Math.PI * 1.8); c.stroke(); }
    else if (mood === 'surprised') E(c, hx, my, 9, 12, '#9c3b4a');
    else if (mood === 'think') { c.strokeStyle = '#7a3b3b'; c.lineWidth = 4; c.beginPath(); c.moveTo(hx - 6, my); c.quadraticCurveTo(hx + 8, my + 3, hx + 16, my - 4); c.stroke(); }
    else { c.strokeStyle = '#7a3b3b'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.arc(hx, my - 8, 16, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke(); }
  }

  // ---------- who looks like what ----------
  const BOSSES = {}; const PEOPLE = {
    'Elder Lumen': { col: '#7048e8', hat: 'elder', skin: '#efc9a4' },
    'Shopkeeper Brom': { col: '#e8590c', hair: '#5c3d2e', hat: 'shop' },
    'Healer Rosa': { col: '#f783ac', hair: '#862e9c', hat: 'heal' },
    'Wick': { col: '#5f3dc4', hair: '#343a40', hat: 'messy', skin: '#f5d6b8' },
    'Captain Marlow': { col: '#1c3d6e', hair: '#adb5bd', hat: 'captain' },
    'Mapmaker Marta': { col: '#c92a2a', hair: '#ced4da', hat: 'bun' },
    'Old Tick': { col: '#868e96', hair: '#adb5bd', hat: 'goggles' },
    'Brushmaster Lan': { col: '#a61e4d', hair: '#e9ecef', hat: 'long' },
  };
  for (const w of Object.values(WORLDS)) {
    if (w.boss) BOSSES[w.boss.name] = Object.assign({ boss: true }, w.boss);
    for (const v of [w.giver, ...(w.villagers || [])]) if (v && !PEOPLE[v.name]) PEOPLE[v.name] = Object.assign({}, v, { hat: v.hat === 'bun' ? 'bun' : v.hat || (/Diver|Kid|Teacher|Tinker|Woodcutter/.test(v.name) ? 'long' : '') });
  }
  function moodOf(text) {
    if (/sorry|wrong|forgot|cannot|can't|lost|scrambled|smeared|wiped|jammed|blank|fog made/i.test(text)) return 'sad';
    if (/\?\s*$/.test(text)) return 'think';
    if (/!/.test(text)) return 'happy';
    return 'calm';
  }
  function forSpeaker(who, text) {
    if (!who) return null;
    const kid = Object.keys(KIDS).find(k => KIDS[k].name === who);
    if (kid) return { type: 'hero', kid };
    if (who === 'A voice in the fog') return { type: 'voice' };
    if (who === 'Old Tally') return { type: 'owl', mood: moodOf(text) };
    if (BOSSES[who]) return { type: 'fog', def: BOSSES[who] };
    return { type: 'bust', v: PEOPLE[who] || { col: '#495057' }, mood: moodOf(text) };
  }
  function draw(cv, p, t, talk) {
    const d = Math.min(2, window.devicePixelRatio || 1);
    if (cv.width !== PW * d) { cv.width = PW * d; cv.height = PH * d; }
    const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); c.clearRect(0, 0, PW, PH);
    if (!p) return;
    c.save(); c.beginPath(); c.rect(0, 0, PW, PH); c.clip();
    if (p.type === 'bust') bust(c, p.v, p.mood, t, talk);
    else if (p.type === 'hero') { const s = p.kid === S.kid ? S : loadSave(p.kid); Art.hero(c, 140, 448, 4.2, { kid: p.kid, color: s.color, cape: null, cls: null, weapon: null, armor: ARMORS[s.armor].tier, t, glow: false, mood: p.kid === S.kid ? curMood() : 'calm' }); }
    else if (p.type === 'owl') { c.translate(140 - 95 * 2.2, 176 - 80 * 2.2); c.scale(2.2, 2.2); Animals.owl(c, t); }
    else if (p.type === 'fog') Art.fog(c, p.def, 140, p.def.boss ? 352 : 330, p.def.boss ? 2.9 : 3.3, t, false);
    else if (p.type === 'voice') { const g = c.createRadialGradient(140, 200, 10, 140, 200, 150); g.addColorStop(0, 'rgba(43,29,92,.95)'); g.addColorStop(1, 'rgba(43,29,92,0)'); c.fillStyle = g; c.fillRect(0, 0, PW, PH); for (const sx of [-1, 1]) { c.save(); c.shadowColor = '#ff6b6b'; c.shadowBlur = 20; c.globalAlpha = 0.6 + Math.sin(t * 2) * 0.3; E(c, 140 + sx * 30, 190, 12, 7, '#ff6b6b', sx * 0.3); c.restore(); } }
    c.restore();
  }
  return { forSpeaker, draw };
})();
