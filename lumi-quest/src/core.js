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
function newSave(k) { return { v: 1, kid: k, created: false, cls: 'knight', color: TUNICS[0], cape: null, hair: HAIRS[k][0][0], hairCol: HAIR_COLS[0], eyes: 'sparkle', eyeCol: '', extra: '', title: '', readBtns: false, lv: 1, xp: 0, hp: 40, gold: 30, weapon: 'wood', armor: 'cloth', weapons: ['wood'], armors: ['cloth'], potion: 2, orb: 3, party: [], active: 0, crystals: [], chests: {}, bosses: {}, quests: {}, ts: 0, seen: {}, met: {}, news: {}, elderTold: false, stats: { right: 0, asked: 0, wins: 0, first: 0 }, read: k === 'lucas', metElder: false, won: false }; }
function loadSave(k) { try { const r = localStorage.getItem('lumiquest.v1.' + k); if (r) { const s = JSON.parse(r); if (s && s.v === 1) { const o = Object.assign(newSave(k), s); if (s.face && s.eyes === undefined) { o.eyes = s.face === 'round' ? 'round' : 'sparkle'; o.extra = ['freckles', 'glasses'].includes(s.face) ? s.face : ''; } return o; } } } catch (e) { } return newSave(k); }
function save() { if (!S) return; S.ts = Date.now(); try { localStorage.setItem('lumiquest.v1.' + S.kid, JSON.stringify(S)); } catch (e) { } Cloud.dirty[S.kid] = JSON.stringify(S); cloudSoon(); }
function wipe(k) { try { localStorage.removeItem('lumiquest.v1.' + k); } catch (e) { } delete Cloud.dirty[k]; if (Cloud.ready) Cloud.doc(k).delete().catch(() => { }); }

// ---------- account save ----------
// When the page is opened signed in on claude.ai, each kid's progress is also kept in the viewer's private
// account data, so it survives the browser clearing its storage and follows them to other devices.
// Everywhere else (signed out, or the GitHub Pages copy) the game still saves on the device.
const Cloud = { ready: false, dirty: {}, busy: false, timer: null, db: null, uid: null, doc: k => Cloud.db.collection('data/users/' + Cloud.uid).doc('lumi-' + k) };
async function cloudInit() {
  try {
    if (!window.claude || !window.claude.use) return;
    const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
    if (!db || !user) return; const uid = await user.id(); if (!uid) return;
    Cloud.db = db; Cloud.uid = uid;
    for (const k of ['nora', 'lucas']) {
      const local = loadSave(k); let remote = null;
      try { const snap = await Cloud.doc(k).get(); if (snap.exists) remote = JSON.parse(snap.data().json); } catch (e) { }
      const playing = S && S.kid === k;
      if (remote && (remote.ts || 0) > (local.ts || 0) && !playing) { try { localStorage.setItem('lumiquest.v1.' + k, JSON.stringify(remote)); } catch (e) { } }
      else if (local.created && (!remote || (local.ts || 0) > (remote.ts || 0))) Cloud.dirty[k] = JSON.stringify(playing ? S : local);
    }
    Cloud.ready = true; cloudFlush(); if (typeof onCloudReady === 'function') onCloudReady();
  } catch (e) { }
}
function cloudSoon() { if (!Cloud.ready || Cloud.timer) return; Cloud.timer = setTimeout(() => { Cloud.timer = null; cloudFlush(); }, 4000); }
async function cloudFlush() {
  if (!Cloud.ready || Cloud.busy) return; Cloud.busy = true;
  try { for (const k of Object.keys(Cloud.dirty)) { const json = Cloud.dirty[k]; delete Cloud.dirty[k]; try { await Cloud.doc(k).set({ json, ts: Date.now(), v: 1 }); } catch (e) { if (!Cloud.dirty[k]) Cloud.dirty[k] = json; Cloud.failed = true; break; } Cloud.failed = false; } }
  finally { Cloud.busy = false; if (Object.keys(Cloud.dirty).length) { clearTimeout(Cloud.timer); Cloud.timer = setTimeout(() => { Cloud.timer = null; cloudFlush(); }, Cloud.failed ? 20000 : 4000); } }
}
// Save the moment the page is hidden or closed (switching apps on the iPad, locking the screen).
document.addEventListener('visibilitychange', () => { if (document.hidden && S) { save(); clearTimeout(Cloud.timer); Cloud.timer = null; cloudFlush(); } });
window.addEventListener('pagehide', () => { if (S) save(); });

// ---------- stats ----------
const maxHP = () => 40 + 8 * (S.lv - 1) + ARMORS[S.armor].hp + (S.cls === 'knight' ? 15 : 0);
const heroAtk = () => 8 + 2 * S.lv + WEAPONS[S.weapon].atk;
const heroDef = () => ARMORS[S.armor].def;
const xpNeed = lv => 25 * lv;
const lumiNeed = lv => 18 * lv;
const isEvo = l => l.lv >= 6;
const speciesName = l => isEvo(l) ? SPECIES[l.sp].evo : SPECIES[l.sp].name;
const lumiName = l => l.nick || speciesName(l);
const heroName = s => KIDS[s.kid].name + (s.title ? ' ' + s.title : '');
const looksOf = s => ({ hair: s.hair, hairCol: s.hairCol, eyes: s.eyes, eyeCol: s.eyeCol, extra: s.extra });
const lumiPower = l => Math.round((9 + 3 * l.lv) * (isEvo(l) ? 1.2 : 1) * (S.cls === 'mage' ? 1.2 : 1));
const knownMoves = l => MOVE_LV.filter(lv => l.lv >= lv).length;
const movePower = (l, tier) => Math.round(lumiPower(l) * MOVE_MULT[tier]);
const activeLumi = () => S.party[S.active] || S.party[0];
function heroLook(extra) { return Object.assign({ ...looksOf(S), kid: S.kid, color: S.color, cape: S.cape, cls: S.cls, weapon: weaponLook(S.weapon, S.cls), armor: ARMORS[S.armor].tier, t: G.t, mood: curMood() }, extra || {}); }
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
  const l = activeLumi(); if (!l) return; const was = isEvo(l), knew = knownMoves(l); l.xp += n;
  while (l.xp >= lumiNeed(l.lv)) { l.xp -= lumiNeed(l.lv); l.lv++; toast(`🐾 ${lumiName(l)} grew to Level ${l.lv}!`); }
  for (let t = knew; t < knownMoves(l); t++) { Snd.play('level'); toast(`💥 ${lumiName(l)} learned ${MOVES[l.sp][t]}!`); (G.learned = G.learned || []).push([lumiName(l), MOVES[l.sp][t], t]); }
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
// Any plain text in menus and the battle message becomes tappable words too.
function wordifyAll(root) {
  const skip = 'button, input, textarea, canvas, .zh, .word, [data-say], #qChoices, #toast';
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => (!/[\p{L}\p{N}]/u.test(n.nodeValue) || n.parentElement.closest(skip)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
  const nodes = []; while (tw.nextNode()) nodes.push(tw.currentNode);
  for (const n of nodes) { const span = document.createElement('span'); wordify(span, n.nodeValue); n.replaceWith(...span.childNodes); }
}
const wordWatch = new MutationObserver(() => { wordWatch.disconnect(); for (const id of ['panelBody', 'bLog', 'crBody', 'crName']) wordifyAll($(id)); watchWords(); });
function watchWords() { for (const id of ['panelBody', 'bLog', 'crBody', 'crName']) wordWatch.observe($(id), { childList: true, subtree: true, characterData: true }); }
// Read-to-me for buttons: with the setting on, the first tap on a button says it out loud and the second tap chooses it.
let armed = null, armedHint = false;
document.addEventListener('click', ev => {
  if (!S || !S.readBtns || G.mode === 'title') return;
  const b = ev.target.closest && ev.target.closest('button'); if (!b || b.disabled) return;
  if (['dlgNext', 'panelClose', 'qNext', 'crBack'].includes(b.id) || b.classList.contains('choice') || ev.target.closest('[data-say]')) return;
  if (armed === b) { armed.classList.remove('armed'); armed = null; return; }
  ev.preventDefault(); ev.stopImmediatePropagation();
  let label = b.getAttribute('aria-label') || b.innerText;
  label = label.replace(/[^\p{L}\p{N} ',.!?-]/gu, ' ').replace(/\s+/g, ' ').trim();
  const row = b.closest('.row'); if (row && row.querySelector('b') && !label.includes(row.querySelector('b').innerText)) label = row.querySelector('b').innerText + '. ' + label + (b.dataset.buy ? ' coins' : '');
  if (armed) armed.classList.remove('armed'); armed = b; b.classList.add('armed'); Snd.init(); Snd.say(label || 'button');
  if (!armedHint) { armedHint = true; toast('👂 Tap again to choose it'); }
  clearTimeout(b.__t); b.__t = setTimeout(() => { if (armed === b) { b.classList.remove('armed'); armed = null; } }, 4000);
}, true);
let dlg = null;
function say(lines, who) {
  if (typeof lines === 'string') lines = [lines];
  return new Promise(res => { dlg = { lines: lines.slice(), who, res }; $('dialog').hidden = false; showLine(); });
}
function showLine() {
  $('dlgWho').textContent = S && dlg.who === KIDS[S.kid].name ? heroName(S) : dlg.who || ''; $('dlgWho').hidden = !dlg.who; wordify($('dlgText'), dlg.lines[0]);
  // The speaker's portrait, which talks for a moment while the line appears.
  G.face = Portraits.forSpeaker(dlg.who, dlg.lines[0]); G.faceT0 = G.t; $('dialog').classList.toggle('has-face', !!G.face);
  // The player's own face listens and reacts in a small circle, with their name.
  G.me = S && (G.mode === 'world' || G.mode === 'battle' || G.mode === 'ending') && dlg.who !== KIDS[S.kid].name ? Portraits.reaction(dlg.lines[0]) : null;
  $('dlgMe').hidden = !G.me; if (G.me) $('dlgMeName').textContent = heroName(S);
}
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
  (root || document).querySelectorAll('canvas[data-hero]').forEach(el => { const s = el.dataset.hero === 'me' ? S : loadSave(el.dataset.hero); mini(el, c => Art.hero(c, 60, 128, 1.15, { ...looksOf(s), kid: s.kid, color: s.color, cape: s.cape, cls: s.created ? s.cls : null, weapon: weaponLook(s.weapon, s.cls), armor: ARMORS[s.armor].tier, t: 0.3 }), 120, 136); });
  (root || document).querySelectorAll('canvas[data-head]').forEach(el => mini(el, c => Art.hero(c, 36, 99, 1.0, Object.assign({ kid: S.kid, color: S.color, cape: null, cls: null, weapon: null, armor: 0, t: 0.3, glow: false, mood: 'calm' }, looksOf(S), JSON.parse(el.dataset.head))), 72, 64));
  (root || document).querySelectorAll('canvas[data-weapon]').forEach(el => mini(el, c => { const w = weaponLook(el.dataset.weapon, S.cls), bow = w.kind === 'bow'; c.translate(bow ? 44 : 22, bow ? 47 : 54); c.rotate(bow ? 0.15 : 0.62); c.scale(bow ? 0.85 : 0.8, bow ? 0.85 : 0.8); Art.weapon(c, w); }, 60, 60));
  (root || document).querySelectorAll('canvas[data-armor]').forEach(el => mini(el, c => { c.beginPath(); c.rect(0, 0, 60, 60); c.clip(); Art.hero(c, 30, 78, 1.05, { ...looksOf(S), kid: S.kid, color: S.color, cape: null, cls: null, weapon: null, armor: ARMORS[el.dataset.armor].tier, t: 0.3, glow: false, mood: 'calm' }); }, 60, 60));
}

// ---------- HUD ----------
function updateHUD() {
  if (!S) return;
  $('hudName').textContent = `${heroName(S)} · Lv ${S.lv}`; $('hudName').style.background = KIDS[S.kid].col;
  $('hudHP').style.width = clamp(S.hp / maxHP() * 100, 0, 100) + '%'; $('hudHPt').textContent = `${Math.max(0, S.hp)} / ${maxHP()}`;
  $('hudXP').style.width = (S.xp / xpNeed(S.lv) * 100) + '%';
  $('hudGold').textContent = S.gold; $('hudCrys').textContent = `${S.crystals.length}/5`;
  $('btnSound').textContent = Snd.isMuted() ? '🔇' : '🔊';
}
function showHUD(on) { $('hud').hidden = !on; }
