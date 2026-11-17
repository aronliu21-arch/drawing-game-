// Shared state, saving, stats and the DOM helpers every screen uses.
const W = 960, H = 540, TILE = 48;
const $ = id => document.getElementById(id);
const cv = $('cv'), ctx = cv.getContext('2d');
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const KIDS = { nora: { name: 'Nora', col: '#7048e8', he: 'she', his: 'her' }, lucas: { name: 'Lucas', col: '#f76707', he: 'he', his: 'his' } };

let kid = null, S = null;
const G = { mode: 'title', t: 0, fast: false, world: null, grid: null, ents: [], px: 0, py: 0, fx: 0, fy: 0, path: [], after: null, walking: false, grace: 0, cam: { x: 0, y: 0 }, parts: [], B: null, intro: null, busy: false };

// ---------- save ----------
function newSave(k) { return { v: 1, kid: k, created: false, cls: 'knight', color: TUNICS[0], cape: null, lv: 1, xp: 0, hp: 40, gold: 30, weapon: 'wood', armor: 'cloth', weapons: ['wood'], armors: ['cloth'], potion: 2, orb: 3, party: [], active: 0, crystals: [], chests: {}, bosses: {}, quests: {}, seen: {}, met: {}, news: {}, elderTold: false, stats: { right: 0, asked: 0, wins: 0, first: 0 }, read: k === 'lucas', metElder: false, won: false }; }
function loadSave(k) { try { const r = localStorage.getItem('lumiquest.v1.' + k); if (r) { const s = JSON.parse(r); if (s && s.v === 1) return Object.assign(newSave(k), s); } } catch (e) { } return newSave(k); }
function save() { if (!S) return; try { localStorage.setItem('lumiquest.v1.' + S.kid, JSON.stringify(S)); } catch (e) { } }
function wipe(k) { try { localStorage.removeItem('lumiquest.v1.' + k); } catch (e) { } }

// ---------- stats ----------
const maxHP = () => 40 + 8 * (S.lv - 1) + ARMORS[S.armor].hp + (S.cls === 'knight' ? 15 : 0);
const heroAtk = () => 8 + 2 * S.lv + WEAPONS[S.weapon].atk;
const heroDef = () => ARMORS[S.armor].def;
const xpNeed = lv => 25 * lv;
const lumiNeed = lv => 18 * lv;
const isEvo = l => l.lv >= 6;
const lumiName = l => isEvo(l) ? SPECIES[l.sp].evo : SPECIES[l.sp].name;
const lumiPower = l => Math.round((9 + 3 * l.lv) * (isEvo(l) ? 1.2 : 1) * (S.cls === 'mage' ? 1.2 : 1));
const activeLumi = () => S.party[S.active] || S.party[0];
function heroLook(extra) { return Object.assign({ kid: S.kid, color: S.color, cape: S.cape, cls: S.cls, weapon: WEAPONS[S.weapon], armor: ARMORS[S.armor].tier, t: G.t, mood: curMood() }, extra || {}); }
// The hero's face follows what is happening: a timed mood first, then thinking, then worry at low health.
function setMood(m, secs) { G.mood = m; G.moodUntil = G.t + (secs || 1.2); }
function curMood() { if (G.moodUntil > G.t) return G.mood; if (QS && !QS.done) return 'think'; if (S && G.mode === 'battle' && S.hp < maxHP() * 0.3) return 'worried'; return 'calm'; }

function addXP(n) {
  S.xp += n; let up = false;
  while (S.xp >= xpNeed(S.lv)) { S.xp -= xpNeed(S.lv); S.lv++; up = true; }
  if (up) { S.hp = maxHP(); setMood('happy', 3); Snd.play('level'); toast(`⭐ ${KIDS[S.kid].name} reached Level ${S.lv}! Health restored.`); burst(W / 2, 120, '#ffe066', 30); }
  return up;
}
function addLumiXP(n) {
  const l = activeLumi(); if (!l) return; const was = isEvo(l); l.xp += n;
  while (l.xp >= lumiNeed(l.lv)) { l.xp -= lumiNeed(l.lv); l.lv++; toast(`🐾 ${lumiName(l)} grew to Level ${l.lv}!`); }
  if (!was && isEvo(l)) { Snd.play('level'); toast(`✨ ${SPECIES[l.sp].name} evolved into ${SPECIES[l.sp].evo}!`); }
}

// ---------- tweens & particles ----------
const tweens = [];
function tween(dur, fn) { return new Promise(res => tweens.push({ t: 0, dur: G.fast ? dur * 0.03 : dur, fn, res })); }
const wait = s => tween(s, () => { });
function burst(x, y, col, n, star) { for (let i = 0; i < (n || 12); i++) { const a = Math.random() * 6.283, v = rnd(60, 260); G.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, life: rnd(0.4, 0.9), max: 0.9, col, r: rnd(2, 5), star: star !== false && i % 3 === 0 }); } }
function floater(x, y, text, col, size) { G.parts.push({ x, y, vx: 0, vy: -55, life: 1.1, max: 1.1, text, col, size: size || 26 }); }
function stepParts(dt) { for (let i = G.parts.length - 1; i >= 0; i--) { const p = G.parts[i]; p.life -= dt; if (p.life <= 0) { G.parts.splice(i, 1); continue; } p.x += p.vx * dt; p.y += p.vy * dt; if (!p.text) p.vy += 420 * dt; } }
function drawParts(c) {
  for (const p of G.parts) {
    c.save(); c.globalAlpha = clamp(p.life / p.max * 1.6, 0, 1);
    if (p.text) { c.font = `900 ${p.size}px ${FONT_D}`; c.textAlign = 'center'; c.lineWidth = 5; c.strokeStyle = '#15131f'; c.strokeText(p.text, p.x, p.y); c.fillStyle = p.col; c.fillText(p.text, p.x, p.y); }
    else if (p.star) Art.star(c, p.x, p.y, p.r * 1.6, p.col); else Art.ell(c, p.x, p.y, p.r, p.r, p.col);
    c.restore();
  }
}
const FONT_ZH = '"PingFang TC","Noto Sans TC","Microsoft JhengHei","Heiti TC","Noto Sans CJK TC",sans-serif';
const FONT_D = '"Lilita One","Baloo 2",ui-rounded,"Arial Rounded MT Bold",system-ui,sans-serif';

// ---------- toast, dialog, panel ----------
let toastQ = [], toastBusy = false;
function toast(msg) { toastQ.push(msg); if (!toastBusy) nextToast(); }
function nextToast() { const el = $('toast'); if (!toastQ.length) { toastBusy = false; el.classList.remove('show'); return; } toastBusy = true; el.textContent = toastQ.shift(); el.classList.add('show'); setTimeout(() => { el.classList.remove('show'); setTimeout(nextToast, 220); }, G.fast ? 60 : 1900); }

// Tap any word to hear it. Each word becomes its own span; symbols are spoken by name.
const SPOKEN = { '+': 'plus', '−': 'minus', '-': 'minus', '×': 'times', '÷': 'divided by', '=': 'equals', '?': 'what number' };
const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function wordify(el, text) {
  el.innerHTML = String(text).split(' ').map(tok => {
    const core = tok.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
    const sayIt = /[\p{L}\p{N}]/u.test(core) ? core : SPOKEN[tok];
    return sayIt ? `<span class="word" data-say="${esc(sayIt)}">${esc(tok)}</span>` : esc(tok);
  }).join(' ');
}
document.addEventListener('click', ev => {
  const w = ev.target.closest && ev.target.closest('[data-say]'); if (!w) return;
  ev.stopPropagation(); ev.preventDefault(); Snd.init(); Snd.say(w.dataset.say);
  w.classList.add('said'); setTimeout(() => w.classList.remove('said'), 700);
}, true);
let dlg = null;
function say(lines, who) {
  if (typeof lines === 'string') lines = [lines];
  return new Promise(res => { dlg = { lines: lines.slice(), who, res }; $('dialog').hidden = false; showLine(); });
}
function showLine() { $('dlgWho').textContent = dlg.who || ''; $('dlgWho').hidden = !dlg.who; wordify($('dlgText'), dlg.lines[0]); }
function advanceDialog() { if (!dlg) return; Snd.play('tap'); dlg.lines.shift(); if (dlg.lines.length) showLine(); else { const r = dlg.res; dlg = null; $('dialog').hidden = true; r(); } }
$('dialog').addEventListener('click', advanceDialog);

let panelRes = null;
function openPanel(html, opts) {
  opts = opts || {};
  $('panelBody').innerHTML = html; $('panelClose').hidden = !!opts.noClose; $('panel').hidden = false; $('panel').className = opts.cls || '';
  return new Promise(res => { panelRes = res; });
}
function closePanel(v) { $('panel').hidden = true; $('panelBody').innerHTML = ''; const r = panelRes; panelRes = null; if (r) r(v); }
$('panelClose').addEventListener('click', () => { Snd.play('tap'); closePanel(); });
const panelOpen = () => !$('panel').hidden;

// Small canvases inside panels (portraits of heroes and Lumis).
function mini(el, draw, w, h) { const d = Math.min(2, window.devicePixelRatio || 1); el.width = w * d; el.height = h * d; el.style.width = w + 'px'; el.style.height = h + 'px'; const c = el.getContext('2d'); c.scale(d, d); draw(c); }
function drawMinis(root) {
  (root || document).querySelectorAll('canvas[data-lumi]').forEach(el => mini(el, c => Art.lumi(c, SPECIES[el.dataset.lumi], 32, 58, 1.15, 1, el.dataset.evo === '1'), 64, 64));
  (root || document).querySelectorAll('canvas[data-hero]').forEach(el => { const s = el.dataset.hero === 'me' ? S : loadSave(el.dataset.hero); mini(el, c => Art.hero(c, 60, 128, 1.15, { kid: s.kid, color: s.color, cape: s.cape, cls: s.created ? s.cls : null, weapon: WEAPONS[s.weapon], armor: ARMORS[s.armor].tier, t: 0.3 }), 120, 136); });
}

// ---------- HUD ----------
function updateHUD() {
  if (!S) return;
  $('hudName').textContent = `${KIDS[S.kid].name}  Lv ${S.lv}`; $('hudName').style.background = KIDS[S.kid].col;
  $('hudHP').style.width = clamp(S.hp / maxHP() * 100, 0, 100) + '%'; $('hudHPt').textContent = `${Math.max(0, S.hp)} / ${maxHP()}`;
  $('hudXP').style.width = (S.xp / xpNeed(S.lv) * 100) + '%';
  $('hudGold').textContent = S.gold; $('hudCrys').textContent = `${S.crystals.length}/5`;
  $('btnSound').textContent = Snd.isMuted() ? '🔇' : '🔊';
}
function showHUD(on) { $('hud').hidden = !on; }
