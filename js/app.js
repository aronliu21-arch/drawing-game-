import { Room } from './room.js';
import { LEVELS } from './words.js';
import { Board, W, H, SHAPES, strokeShape } from './canvas.js';
import { detectMode, makeNet } from './net.js';
import { sfx, say, unlock, isMuted, setMuted } from './audio.js';
import qrcode from '../vendor/qrcode.mjs';

const $ = (s) => document.querySelector(s);
const el = (tag, props = {}, ...kids) => { const e = document.createElement(tag); Object.assign(e, props); for (const k of kids) e.append(k); return e; };

// ---------------- storage (per device, never required) ----------------
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } },
};
const seenKey = (p) => `dd-seen:${p.name.trim().toLowerCase()}:${p.level}`;

const COLORS = ['#7048e8', '#f76707', '#1c7ed6', '#2f9e44', '#e64980', '#e8590c', '#0ca678', '#5c7cfa', '#ae3ec9', '#f59f00'];
const PALETTE = ['#000000', '#495057', '#adb5bd', '#ffffff', '#e03131', '#f76707', '#fcc419', '#94d82d',
  '#2f9e44', '#20c997', '#1c7ed6', '#74c0fc', '#7048e8', '#e64980', '#ffc9c9', '#8d5524'];
const SIZES = [4, 10, 22];

let myId;
try { myId = sessionStorage.getItem('dd-id'); } catch (e) { /* ignore */ }
if (!myId) { myId = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); try { sessionStorage.setItem('dd-id', myId); } catch (e) { /* ignore */ } }

// ---------------- profile ----------------
let profiles = store.get('dd-profiles', []);
let profile = store.get('dd-current', null) || { name: '', level: 'g12', color: COLORS[0] };
// players saved when there were more word levels move to a level that still exists
const fixLevel = (p) => { if (!LEVELS[p.level]) p.level = Object.keys(LEVELS)[0]; return p; };
profiles.forEach(fixLevel); fixLevel(profile);

function renderProfile() {
  $('#name').value = profile.name;
  const saved = $('#saved'); saved.replaceChildren();
  for (const p of profiles) {
    const b = el('button', { type: 'button', className: p.name === profile.name && p.level === profile.level ? 'on' : '' }, avatar(p), p.name);
    b.onclick = () => { profile = { ...p }; renderProfile(); };
    saved.append(b);
  }
  const lv = $('#levels'); lv.replaceChildren();
  lv.parentElement.classList.toggle('hidden', Object.keys(LEVELS).length < 2);
  for (const [k, v] of Object.entries(LEVELS)) {
    const b = el('button', { type: 'button', className: profile.level === k ? 'on' : '' }, el('b', { textContent: v.emoji }), v.label);
    b.dataset.level = k;
    b.onclick = () => { profile.level = k; renderProfile(); };
    lv.append(b);
  }
  const cs = $('#colors'); cs.replaceChildren();
  for (const c of COLORS) {
    const b = el('button', { type: 'button', className: profile.color === c ? 'on' : '' });
    b.style.background = c; b.setAttribute('aria-label', 'color ' + c);
    b.onclick = () => { profile.color = c; renderProfile(); };
    cs.append(b);
  }
}
$('#name').addEventListener('input', (e) => { profile.name = e.target.value; });

function saveProfile() {
  profile.name = profile.name.trim().slice(0, 16);
  profiles = profiles.filter((p) => !(p.name.toLowerCase() === profile.name.toLowerCase()));
  profiles.unshift({ ...profile });
  profiles = profiles.slice(0, 8);
  store.set('dd-profiles', profiles);
  store.set('dd-current', profile);
}

function avatar(p) {
  const a = el('span', { className: 'av', textContent: (p.name || '?').trim().charAt(0).toUpperCase() || '?' });
  a.style.background = p.color || '#1c7ed6';
  return a;
}

// ---------------- screens ----------------
let screen = 'home';
function show(name) {
  screen = name;
  for (const s of document.querySelectorAll('.screen')) s.classList.toggle('active', s.id === 's-' + name);
  document.body.classList.toggle('in-game', name === 'game');
  if (name === 'game') requestAnimationFrame(fitBoard);
}

// ---------------- sound button ----------------
const soundBtn = $('#btn-sound');
const paintSound = () => { soundBtn.textContent = isMuted() ? '🔇' : '🔊'; };
soundBtn.onclick = () => { unlock(); setMuted(!isMuted()); paintSound(); };
paintSound();
document.addEventListener('pointerdown', unlock, { once: true });

// ---------------- connection ----------------
let mode = 'p2p';
let net = null;
let room = null;        // host only: the referee
let hostConn = null;    // host only
let guestConn = null;   // guests only
let tickTimer = null;
let toRoom = () => {};
let state = null;
let myWord = null;
let choices = null;

function helloMsg() {
  return { t: 'hello', id: myId, name: profile.name, color: profile.color, level: profile.level, seen: store.get(seenKey(profile), []) };
}

function readyProfile() {
  profile.name = $('#name').value.trim();
  if (!profile.name) { $('#home-msg').textContent = 'Type your name first.'; $('#name').focus(); return false; }
  saveProfile();
  return true;
}

function busy(on) { for (const b of [$('#btn-create'), ...document.querySelectorAll('#join-form button')]) b.disabled = on; }

async function createRoom() {
  if (!readyProfile()) return;
  busy(true); $('#home-msg').style.color = ''; $('#home-msg').textContent = 'Opening a room…';
  try {
    net = makeNet(mode);
    hostConn = await net.hostRoom({
      myId,
      onMessage: (from, msg) => room && room.handle(from, msg),
      onLeave: (id) => room && room.leave(id),
    });
    room = new Room({
      code: hostConn.code, hostId: myId,
      emit: (to, msg) => { if (to === myId) queueMicrotask(() => receive(msg)); else hostConn.send(to, msg); },
    });
    tickTimer = setInterval(() => room.tick(), 250);
    toRoom = (msg) => queueMicrotask(() => room.handle(myId, msg));
    toRoom(helloMsg());
    $('#home-msg').textContent = '';
  } catch (e) {
    console.warn(e);
    $('#home-msg').textContent = 'Could not open a room. Check the internet and try again.';
  }
  busy(false);
}

async function joinRoom(code) {
  if (!readyProfile()) return;
  if (!/^\d{4}$/.test(code)) { $('#home-msg').textContent = 'Room numbers have 4 digits.'; return; }
  busy(true); $('#home-msg').style.color = ''; $('#home-msg').textContent = 'Joining room ' + code + '…';
  try {
    net = makeNet(mode);
    guestConn = await net.joinRoom(code, { myId, onMessage: receive, onStatus: netStatus });
    toRoom = (msg) => guestConn.send(msg);
    toRoom(helloMsg());
    $('#home-msg').textContent = '';
  } catch (e) {
    console.warn(e);
    $('#home-msg').textContent = e.message === 'notFound' ? `No room ${code}. Check the number with the host.` : 'Could not connect. Try again.';
  }
  busy(false);
}

function netStatus(s) {
  const n = $('#net-status');
  if (s === 'ok') n.classList.add('hidden');
  else { n.classList.remove('hidden'); n.textContent = s === 'lost' ? 'Lost the room. Tap Leave and join again.' : 'Reconnecting…'; }
}

function leave() {
  try { hostConn && hostConn.close(); guestConn && guestConn.close(); } catch (e) { /* ignore */ }
  clearInterval(tickTimer);
  room = hostConn = guestConn = null; state = null; myWord = null; choices = null;
  toRoom = () => {};
  $('#chat-log').replaceChildren();
  netStatus('ok');
  history.replaceState(null, '', location.pathname + stripRoom(location.search));
  show('home');
}
const stripRoom = (search) => { const q = new URLSearchParams(search); q.delete('room'); const s = q.toString(); return s ? '?' + s : ''; };

// ---------------- incoming messages ----------------
function receive(msg) {
  if (!msg || typeof msg !== 'object') return;
  switch (msg.t) {
    case 'state': return onState(msg);
    case 'chat': return addChat(msg);
    case 'draw': if (state && msg.turnId === state.turnId) for (const op of msg.ops) board.apply(op); return;
    case 'sync': if (state && msg.turnId === state.turnId) board.load(msg.ops); return;
    case 'choices': choices = msg.choices; renderOverlay(); return;
    case 'seen': {
      const k = seenKey(profile); const s = store.get(k, []);
      if (!s.includes(msg.word)) { s.push(msg.word); store.set(k, s); }
      return;
    }
    case 'seenReset': store.set(seenKey(profile), []); return;
    case 'you-got-it': myWord = msg.word; sfx.correct(); confetti(); return;
    case 'error': if (msg.code === 'full') { leave(); $('#home-msg').textContent = 'That room is full (8 players).'; } return;
    case 'hostLeft': leave(); $('#home-msg').textContent = 'The host closed the room.'; return;
    default:
  }
}

let deadline = 0;
function onState(s) {
  const prev = state;
  state = s;
  deadline = performance.now() + (s.left || 0);
  if (!prev || prev.turnId !== s.turnId) { board.reset(); draft = null; clearPreview(); myWord = null; if (s.phase !== 'choose' || s.drawerId !== myId) choices = null; closePalette(); }
  if (s.word) myWord = s.word;
  if (s.phase !== 'choose') choices = null;

  if (prev && prev.phase !== s.phase) {
    if (s.phase === 'choose') sfx.turn();
    if (s.phase === 'reveal') sfx.reveal();
    if (s.phase === 'over') { sfx.win(); confetti(); }
    if (s.phase === 'draw' && s.drawerId !== myId) setTimeout(() => { if (matchMedia('(pointer: fine)').matches) $('#guess').focus(); }, 50);
  }
  if (prev && s.phase === 'draw') {
    for (const p of s.players) {
      const was = prev.players.find((q) => q.id === p.id);
      if (p.guessed && was && !was.guessed && p.id !== myId) sfx.otherCorrect();
    }
  }

  if (s.phase === 'lobby') { renderLobby(); show('lobby'); }
  else if (s.phase === 'over') { renderOver(); show('over'); }
  else { if (screen !== 'game') show('game'); renderGame(); }
}

// ---------------- lobby ----------------
let qrFor = null;
function renderLobby() {
  $('#lobby-code').textContent = state.code;
  if (qrFor !== state.code) {
    qrFor = state.code;
    const q = new URLSearchParams(location.search); q.set('room', state.code);
    const link = location.origin + location.pathname + '?' + q.toString();
    try { const qr = qrcode(0, 'M'); qr.addData(link); qr.make(); $('#qr').innerHTML = qr.createSvgTag({ cellSize: 6, margin: 2, scalable: true }); } catch (e) { $('#qr').textContent = ''; }
  }
  const ul = $('#lobby-players'); ul.replaceChildren();
  for (const p of state.players) {
    const li = el('li', { className: p.id === myId ? 'me' : '' }, avatar(p), p.name + (p.id === state.hostId ? ' 👑' : ''), el('span', { className: 'lvl', textContent: Object.keys(LEVELS).length > 1 ? LEVELS[p.level]?.short || '' : '' }));
    ul.append(li);
  }
  const amHost = state.hostId === myId;
  $('#host-settings').classList.toggle('hidden', !amHost);
  $('#lobby-wait').classList.toggle('hidden', amHost);
  $('#set-rounds').value = String(state.settings.rounds);
  $('#set-time').value = String(state.settings.drawTime);
  $('#btn-start').disabled = state.players.filter((p) => p.connected).length < 2;
  $('#lobby-msg').textContent = amHost && state.players.length < 2 ? 'Waiting for another player to join…' : '';
}
$('#set-rounds').onchange = $('#set-time').onchange = () => toRoom({ t: 'settings', rounds: Number($('#set-rounds').value), drawTime: Number($('#set-time').value) });
$('#btn-start').onclick = () => { unlock(); toRoom({ t: 'start' }); };
$('#btn-leave').onclick = leave;
$('#btn-leave2').onclick = leave;
$('#btn-again').onclick = () => toRoom({ t: 'again' });

// ---------------- game screen ----------------
const board = new Board($('#board'));
const isDrawer = () => state && state.drawerId === myId;
const canDraw = () => isDrawer() && state.phase === 'draw';
const nameOf = (id) => state?.players.find((p) => p.id === id)?.name || 'Someone';

function renderGame() {
  const s = state;
  $('#g-round').textContent = `Round ${Math.min(s.round, s.settings.rounds)}/${s.settings.rounds}`;
  const hint = $('#g-hint');
  hint.classList.remove('mine', 'plain');
  if (s.phase === 'draw' && isDrawer()) { hint.textContent = `Draw: ${myWord || ''}`; hint.classList.add('mine'); }
  else if (s.phase === 'draw' && myWord) { hint.textContent = `✓ ${myWord}`; hint.classList.add('mine'); }
  else if (s.phase === 'draw' && s.hint) {
    const letters = s.hint.replace(/[^a-z_]/gi, '').length;
    hint.replaceChildren(s.hint.split('').join(' ').replace(/ {3}/g, '   '), el('small', { textContent: ` (${letters})` }));
  } else if (s.phase === 'choose') { hint.textContent = isDrawer() ? 'Pick a word!' : `${nameOf(s.drawerId)} is choosing…`; hint.classList.add('plain'); }
  else hint.textContent = '';

  const gp = $('#g-players'); gp.replaceChildren();
  const ranked = [...s.players].sort((a, b) => b.score - a.score);
  for (const p of s.players) {
    const rank = ranked.indexOf(p) + 1;
    const cls = ['gp', p.id === myId && 'me', p.guessed && 'guessed', p.id === s.drawerId && 'drawing', !p.connected && 'off'].filter(Boolean).join(' ');
    gp.append(el('div', { className: cls }, avatar(p),
      el('div', { className: 'info' }, el('span', { className: 'nm', textContent: p.name }), el('span', { className: 'sc', textContent: `#${rank} · ${p.score} pts` })),
      el('span', { className: 'badge', textContent: p.id === s.drawerId ? '✏️' : p.guessed ? '✅' : '' })));
  }

  const drawing = canDraw();
  $('#tools').classList.toggle('hidden', !drawing);
  $('#board').classList.toggle('can-draw', drawing);
  const input = $('#guess');
  input.disabled = false;
  input.placeholder = drawing ? 'Chat (you are drawing)' : myWord ? 'Chat with others who know it' : 'Type your guess';
  renderOverlay();
  fitBoard();
  lastSec = -1; updateTimer();
}

function renderOverlay() {
  const ov = $('#overlay');
  if (!state || screen !== 'game') return;
  const s = state;
  ov.replaceChildren();
  if (s.phase === 'choose' && isDrawer()) {
    ov.append(el('h3', { textContent: 'Your turn! Pick a word to draw' }));
    const box = el('div', { className: 'choices' });
    (choices || []).forEach((w, i) => {
      const pick = el('button', { className: 'pick', textContent: w, type: 'button' });
      pick.dataset.i = i;
      pick.onclick = () => { unlock(); toRoom({ t: 'pick', i }); };
      const speak = el('button', { className: 'speak', textContent: '🔊', type: 'button' });
      speak.setAttribute('aria-label', 'Read ' + w);
      speak.onclick = () => { unlock(); say(w); };
      box.append(el('div', { className: 'choice' }, pick, speak));
    });
    ov.append(box);
  } else if (s.phase === 'choose') {
    ov.append(el('h3', { textContent: `${nameOf(s.drawerId)} is choosing a word…` }), el('div', { textContent: 'Get ready to guess! 👀' }));
  } else if (s.phase === 'reveal') {
    const why = { all: 'Everyone got it! 🎉', time: "Time's up! ⏰", drawerLeft: 'The artist left.' }[s.endReason] || '';
    ov.append(el('h3', { textContent: why }));
    if (s.lastWord) ov.append(el('div', { textContent: 'The word was' }), el('div', { className: 'word', textContent: s.lastWord }));
    const ul = el('ul', { className: 'gains' });
    for (const p of s.players) {
      const g = (s.gains && s.gains[p.id]) || 0;
      ul.append(el('li', {}, `${p.name} `, el('span', { className: g ? 'plus' : '', textContent: g ? `+${g}` : '+0' })));
    }
    ov.append(ul);
  }
  ov.classList.toggle('hidden', !ov.childNodes.length);
}

function renderOver() {
  const ranked = [...state.players].sort((a, b) => b.score - a.score);
  const pod = $('#podium'); pod.replaceChildren();
  const medals = ['🥇', '🥈', '🥉'];
  for (const i of [1, 0, 2]) {
    const p = ranked[i]; if (!p) continue;
    pod.append(el('div', { className: 'p' + (i + 1) }, el('span', { className: 'medal', textContent: medals[i] }), avatar(p), el('div', { textContent: p.name }), el('div', { textContent: `${p.score} pts` })));
  }
  const ol = $('#final'); ol.replaceChildren();
  for (const p of ranked) ol.append(el('li', { textContent: `${p.name}: ${p.score} points` }));
  const amHost = state.hostId === myId;
  $('#btn-again').classList.toggle('hidden', !amHost);
  $('#over-wait').classList.toggle('hidden', amHost);
}

// timer
let lastSec = -1;
function updateTimer() {
  if (!state || screen !== 'game') return;
  const sec = Math.max(0, Math.ceil((deadline - performance.now()) / 1000));
  const t = $('#g-timer');
  if (sec !== lastSec) {
    t.textContent = state.phase === 'draw' || state.phase === 'choose' ? sec : '';
    t.classList.toggle('low', state.phase === 'draw' && sec <= 10);
    if (state.phase === 'draw' && sec <= 5 && sec > 0) sfx.tick();
    lastSec = sec;
  }
}
setInterval(updateTimer, 200);

// ---------------- chat / guesses ----------------
function addChat(m) {
  const log = $('#chat-log');
  const d = el('div', { className: m.kind });
  if (m.kind === 'guess' || m.kind === 'chat' || m.kind === 'secret') {
    const b = el('b', { textContent: m.name + ':' }); b.style.color = m.color || '#1b2a3a';
    d.append(b, m.text);
  } else d.textContent = m.text;
  if (m.kind === 'close') sfx.close();
  log.append(d);
  while (log.childNodes.length > 120) log.firstChild.remove();
  log.scrollTop = log.scrollHeight;
}
$('#guess-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const v = $('#guess').value.trim();
  if (!v) return;
  toRoom({ t: 'guess', text: v });
  $('#guess').value = '';
});

// ---------------- drawing ----------------
let tool = 'pen', color = '#000000', sizeIdx = 1, opSeq = 0;
let outbox = [], current = null;
let shapeKind = 'circle', draft = null;
const SHAPE_NAMES = { line: 'Line', rect: 'Square', circle: 'Circle', tri: 'Triangle', star: 'Star', heart: 'Heart' };
const DEFAULT_SHAPE = 120; // size of a shape placed with a quick tap
const pv = $('#preview'); pv.width = W; pv.height = H;
const pctx = pv.getContext('2d');
const clearPreview = () => pctx.clearRect(0, 0, W, H);
function shapeIcon(k) {
  const c = document.createElement('canvas'); c.width = c.height = 56;
  const g = c.getContext('2d');
  g.translate(0, 0);
  strokeShape(g, { k, c: '#1b2a3a', w: 5, x1: 8, y1: k === 'line' ? 48 : 8, x2: 48, y2: k === 'line' ? 8 : 48 });
  c.style.width = c.style.height = '28px';
  return c;
}
// the shape a drag (or a quick tap) makes
function shapeOp(d) {
  let { x1, y1, x2, y2 } = d;
  if (Math.abs(x2 - x1) < 10 && Math.abs(y2 - y1) < 10) {
    const r = DEFAULT_SHAPE / 2;
    if (d.k === 'line') { x1 -= r; x2 = x1 + DEFAULT_SHAPE; y2 = y1; }
    else { x2 = x1 + r; y2 = y1 + r; x1 -= r; y1 -= r; }
  }
  const cl = (v, m) => Math.round(Math.max(0, Math.min(m, v)) * 10) / 10;
  return { t: 'sh', id: d.id, k: d.k, c: d.c, w: d.w, x1: cl(x1, W), y1: cl(y1, H), x2: cl(x2, W), y2: cl(y2, H) };
}
const newId = () => myId.slice(0, 4) + (++opSeq).toString(36);

function queue(op) { outbox.push(op); }
setInterval(() => { if (outbox.length) { const ops = outbox; outbox = []; toRoom({ t: 'draw', ops }); } }, 50);

function toBoard(e) {
  const r = $('#board').getBoundingClientRect();
  return [Math.round(((e.clientX - r.left) / r.width) * W * 10) / 10, Math.round(((e.clientY - r.top) / r.height) * H * 10) / 10];
}
const cv = $('#board');
cv.addEventListener('pointerdown', (e) => {
  if (!canDraw()) return;
  e.preventDefault();
  closePalette();
  const [x, y] = toBoard(e);
  if (tool === 'fill') { const op = { t: 'f', id: newId(), x: Math.round(x), y: Math.round(y), c: color }; board.apply(op); queue(op); return; }
  try { cv.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  if (tool === 'shape') {
    // press and drag to set the shape's size; it is placed when the finger lifts
    draft = { id: newId(), k: shapeKind, c: color, w: SIZES[sizeIdx], x1: x, y1: y, x2: x, y2: y, pointer: e.pointerId };
    clearPreview(); strokeShape(pctx, shapeOp(draft));
    return;
  }
  const c = tool === 'eraser' ? '#ffffff' : color;
  const w = tool === 'eraser' ? SIZES[sizeIdx] * 2 : SIZES[sizeIdx];
  current = { id: newId(), x, y, pointer: e.pointerId };
  const op = { t: 's', id: current.id, c, w, p: [x, y] };
  board.apply(op); queue(op);
});
cv.addEventListener('pointermove', (e) => {
  if (draft && e.pointerId === draft.pointer) {
    if (!canDraw()) { draft = null; clearPreview(); return; }
    [draft.x2, draft.y2] = toBoard(e);
    clearPreview(); strokeShape(pctx, shapeOp(draft));
    return;
  }
  if (!current || e.pointerId !== current.pointer || !canDraw()) return;
  const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
  const pts = [];
  for (const ev of evs.length ? evs : [e]) {
    const [x, y] = toBoard(ev);
    if (Math.hypot(x - current.x, y - current.y) < 1.5) continue;
    pts.push(x, y); current.x = x; current.y = y;
  }
  if (!pts.length) return;
  board.apply({ t: 'a', id: current.id, p: pts });
  const last = outbox[outbox.length - 1];
  if (last && last.t === 'a' && last.id === current.id) last.p.push(...pts);
  else queue({ t: 'a', id: current.id, p: [...pts] });
});
const endStroke = (e) => { if (current && e.pointerId === current.pointer) current = null; };
cv.addEventListener('pointerup', (e) => {
  endStroke(e);
  if (draft && e.pointerId === draft.pointer) {
    const op = shapeOp(draft);
    draft = null; clearPreview();
    if (canDraw()) { board.apply(op); queue(op); }
  }
});
cv.addEventListener('pointercancel', (e) => { endStroke(e); if (draft && e.pointerId === draft.pointer) { draft = null; clearPreview(); } });

function setTool(t) { tool = t; for (const x of document.querySelectorAll('[data-tool]')) x.classList.toggle('on', x.dataset.tool === t); }
for (const b of document.querySelectorAll('[data-tool]')) {
  b.onclick = () => {
    const wasOpen = !$('#shapes').classList.contains('hidden');
    setTool(b.dataset.tool); closePalette();
    if (b.dataset.tool === 'shape' && !wasOpen) $('#shapes').classList.remove('hidden');
  };
}
function paintShapes() {
  $('#t-shape').replaceChildren(shapeIcon(shapeKind));
  $('#t-shape').setAttribute('aria-label', 'Shapes: ' + SHAPE_NAMES[shapeKind]);
  for (const b of $('#shapes').children) b.classList.toggle('on', b.dataset.shape === shapeKind);
}
for (const k of SHAPES) {
  const b = el('button', { type: 'button' }); b.dataset.shape = k; b.setAttribute('aria-label', SHAPE_NAMES[k]);
  b.append(shapeIcon(k));
  b.onclick = () => { shapeKind = k; setTool('shape'); paintShapes(); closePalette(); };
  $('#shapes').append(b);
}
paintShapes();
function paintToolIcons() {
  const dot = $('#t-size .dot'); const s = [8, 14, 22][sizeIdx]; dot.style.width = dot.style.height = s + 'px';
  $('#t-color .swatch').style.background = color;
}
$('#t-size').onclick = () => { sizeIdx = (sizeIdx + 1) % SIZES.length; paintToolIcons(); };
$('#t-color').onclick = () => { const open = $('#palette').classList.contains('hidden'); closePalette(); if (open) $('#palette').classList.remove('hidden'); };
$('#t-undo').onclick = () => { if (!canDraw()) return; const op = { t: 'u' }; board.apply(op); queue(op); };
$('#t-clear').onclick = () => { if (!canDraw()) return; const op = { t: 'c', id: newId() }; board.apply(op); queue(op); };
function closePalette() { $('#palette').classList.add('hidden'); $('#shapes').classList.add('hidden'); }
for (const c of PALETTE) {
  const b = el('button', { type: 'button' }); b.style.background = c; b.setAttribute('aria-label', 'paint ' + c);
  b.onclick = () => { color = c; if (tool === 'eraser') setTool('pen'); paintToolIcons(); closePalette(); };
  $('#palette').append(b);
}
paintToolIcons();

// keep the board 4:3 and as big as the space allows
function fitBoard() {
  if (screen !== 'game') return;
  const wrap = $('#board-wrap'), box = $('#board-box'), tools = $('#tools');
  const shown = !tools.classList.contains('hidden');
  const side = getComputedStyle(wrap).flexDirection === 'row';
  const toolsH = shown && !side ? tools.offsetHeight + 6 : 0;
  const toolsW = shown && side ? tools.offsetWidth + 6 : 0;
  const portrait = matchMedia('(orientation: portrait)').matches;
  const phone = matchMedia('(max-width: 599px)').matches;
  const availW = wrap.clientWidth - toolsW;
  // upright screens: the board takes the top part; the rest is guessing and chat
  const availH = portrait ? window.innerHeight * (phone ? 0.5 : 0.55) - toolsH : wrap.clientHeight - toolsH;
  let w = Math.min(availW, (availH * 4) / 3);
  w = Math.max(160, Math.floor(w));
  box.style.width = w + 'px'; box.style.height = Math.floor((w * 3) / 4) + 'px';
}
window.addEventListener('resize', fitBoard);
if (window.ResizeObserver) new ResizeObserver(fitBoard).observe($('#board-wrap'));

// ---------------- fun ----------------
function confetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const box = $('#confetti');
  const bits = ['🎉', '⭐', '✏️', '🖍️', '✨', '🎨'];
  for (let i = 0; i < 24; i++) {
    const c = el('i', { textContent: bits[i % bits.length] });
    c.style.left = Math.random() * 100 + 'vw'; c.style.animationDelay = Math.random() * 0.4 + 's';
    box.append(c); setTimeout(() => c.remove(), 2200);
  }
}

// ---------------- grown-up gate: reset word history ----------------
function parentGate() {
  const body = $('#modal-body');
  const ask = () => {
    const a = 100 + Math.floor(Math.random() * 900), b = 10 + Math.floor(Math.random() * 90);
    body.replaceChildren(
      el('h2', { textContent: 'Grown-ups only' }),
      el('p', { textContent: `What is ${a} × ${b}?` }),
      el('input', { type: 'number', id: 'gate-ans', inputMode: 'numeric' }),
      el('p', { className: 'msg', id: 'gate-msg' }),
      el('div', { className: 'row' }, el('button', { textContent: 'Cancel', type: 'button', onclick: close }), el('button', { className: 'primary', textContent: 'OK', type: 'button', onclick: () => {
        if (Number($('#gate-ans').value) === a * b) pickKids(); else { ask(); $('#gate-msg').textContent = 'Not quite. Here is a new one.'; }
      } })),
    );
    $('#gate-ans').focus();
  };
  const pickKids = () => {
    const list = store.get('dd-profiles', []);
    body.replaceChildren(el('h2', { textContent: 'Reset word history for…' }));
    if (!list.length) body.append(el('p', { textContent: 'No players saved on this device yet.' }));
    list.forEach((p, i) => {
      const n = store.get(seenKey(p), []).length;
      body.append(el('label', { className: 'chk' }, el('input', { type: 'checkbox', value: i }), `${p.name} (${n} words drawn)`));
    });
    body.append(el('p', { className: 'note', textContent: 'This clears the list of words already drawn, so they can come up again. Only on this device.' }),
      el('div', { className: 'row' }, el('button', { textContent: 'Cancel', type: 'button', onclick: close }), el('button', { className: 'primary', textContent: 'Reset selected', type: 'button', onclick: () => {
        for (const c of body.querySelectorAll('input[type=checkbox]:checked')) store.del(seenKey(list[Number(c.value)]));
        close();
      } })));
  };
  const close = () => $('#modal').classList.add('hidden');
  ask();
  $('#modal').classList.remove('hidden');
}
$('#btn-reset').onclick = parentGate;

// ---------------- home wiring ----------------
$('#btn-create').onclick = () => { unlock(); createRoom(); };
$('#join-form').addEventListener('submit', (e) => { e.preventDefault(); unlock(); joinRoom($('#join-code').value.trim()); });
$('#join-code').addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4); });

renderProfile();
const qRoom = new URLSearchParams(location.search).get('room');
if (qRoom) { $('#join-code').value = qRoom.replace(/\D/g, '').slice(0, 4); $('#home-msg').textContent = 'Type your name, then tap Join ▶'; $('#home-msg').style.color = 'var(--blue)'; }
detectMode().then((m) => {
  mode = m;
  $('#net-note').textContent = m === 'relay' ? 'Home Wi-Fi mode: everyone must be on the same Wi-Fi.' : 'Online mode: works on any network.';
});

// Expose for automated playtests. Harmless for players.
window.__test = {
  state: () => ({ screen, phase: state?.phase, isDrawer: isDrawer(), word: myWord, choices, hint: state?.hint, code: state?.code, players: state?.players, ops: board.ops.length, mode }),
  solve: () => { if (choices && isDrawer()) toRoom({ t: 'pick', i: 0 }); },
};
