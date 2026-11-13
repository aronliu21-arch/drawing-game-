// Room referee. Runs only on the host's device; every other device just
// sends messages and draws what it is told. Pure logic with no DOM or network,
// so tests/room.test.mjs can drive it with a fake clock.
import { WORDS, LEVELS } from './words.js';

export const MAX_PLAYERS = 8;
export const CHOICES = 5; // words the artist chooses from each turn
export const CHOOSE_MS = 15000;
export const REVEAL_MS = 6000;
export const MAX_OPS = 30000;

export function normalize(s) {
  return String(s || '').toLowerCase().normalize('NFKD').replace(/[^a-z]/g, '');
}

export function lev(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

// How many spelling slips still count as right. Kids spell by sound, so
// "elefant" for "elephant" counts.
export function allowedSlips(len) { return len <= 3 ? 0 : len <= 7 ? 1 : 2; }

export function checkGuess(guess, word) {
  const g = normalize(guess), w = normalize(word);
  if (!g) return 'empty';
  if (g === w) return 'correct';
  const d = lev(g, w), a = allowedSlips(w.length);
  if (d <= a) return 'correct';
  if (d === a + 1 && g.length >= 2) return 'close';
  return 'wrong';
}

export function maskWord(word, revealed) {
  return [...word].map((ch, i) => (/[a-z]/i.test(ch) ? (revealed.has(i) ? ch : '_') : ch)).join('');
}

const cleanName = (s) => String(s || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 16) || 'Player';
const cleanColor = (s) => (/^#[0-9a-f]{6}$/i.test(s) ? s : '#1c7ed6');

export class Room {
  constructor({ code, hostId, emit, now = () => Date.now(), rand = Math.random, words = WORDS }) {
    this.code = code;
    this.hostId = hostId;
    this.emitRaw = emit;
    this.now = now;
    this.rand = rand;
    this.words = words;
    this.players = new Map();
    this.order = [];
    this.phase = 'lobby';
    this.settings = { rounds: 3, drawTime: 90 };
    this.turnId = 0;
    this.used = new Set();
    this.resetTurnFields();
  }

  resetTurnFields() {
    this.drawerId = null; this.word = null; this.choices = null; this.ops = [];
    this.endsAt = 0; this.revealed = new Set(); this.revealPlan = []; this.gains = {}; this.firstDone = false;
    this.lastWord = null; this.endReason = null;
  }

  // ---------- sending ----------
  emit(to, msg) {
    if (to === '*') { for (const p of this.players.values()) if (p.connected) this.emitRaw(p.id, msg); return; }
    const p = this.players.get(to);
    if (p && p.connected) this.emitRaw(to, msg);
  }
  chat(to, kind, text, extra = {}) { this.emit(to, { t: 'chat', kind, text, ...extra }); }
  connected() { return [...this.players.values()].filter((p) => p.connected); }

  publicState(forId) {
    const p = this.players.get(forId);
    const left = this.endsAt ? Math.max(0, this.endsAt - this.now()) : 0;
    return {
      t: 'state', code: this.code, you: forId, hostId: this.hostId, phase: this.phase,
      settings: this.settings, round: this.round || 0, turnId: this.turnId, drawerId: this.drawerId,
      left, hint: this.word && this.phase === 'draw' ? maskWord(this.word, this.revealed) : null,
      lastWord: this.phase === 'reveal' || this.phase === 'over' ? this.lastWord : null,
      endReason: this.phase === 'reveal' ? this.endReason : null,
      gains: this.phase === 'reveal' ? this.gains : null,
      word: (p && this.word && (forId === this.drawerId || p.guessed) && this.phase === 'draw') ? this.word : null,
      players: this.order.map((id) => this.players.get(id)).filter(Boolean).map((q) => ({
        id: q.id, name: q.name, color: q.color, level: q.level, score: q.score, connected: q.connected, guessed: q.guessed,
      })),
    };
  }
  broadcastState() { for (const p of this.players.values()) if (p.connected) this.emitRaw(p.id, this.publicState(p.id)); }

  // ---------- incoming ----------
  handle(from, msg) {
    if (!msg || typeof msg !== 'object') return;
    if (msg.t === 'hello') return this.onHello(from, msg);
    const p = this.players.get(from);
    if (!p) return;
    switch (msg.t) {
      case 'settings': return this.onSettings(from, msg);
      case 'start': return this.onStart(from);
      case 'pick': return this.onPick(from, msg);
      case 'draw': return this.onDraw(from, msg);
      case 'guess': return this.onGuess(p, msg);
      case 'again': return this.onAgain(from);
      default:
    }
  }

  onHello(from, msg) {
    let p = this.players.get(from);
    const level = LEVELS[msg.level] ? msg.level : 'g12';
    const seen = new Set(Array.isArray(msg.seen) ? msg.seen.filter((w) => typeof w === 'string').slice(0, 1000) : []);
    if (p) {
      Object.assign(p, { name: cleanName(msg.name), color: cleanColor(msg.color), level, connected: true });
      for (const w of seen) p.seen.add(w);
    } else {
      if (this.players.size >= MAX_PLAYERS) { this.emitRaw(from, { t: 'error', code: 'full' }); return; }
      p = { id: from, name: cleanName(msg.name), color: cleanColor(msg.color), level, score: 0, guessed: false, connected: true, seen };
      this.players.set(from, p);
      this.order.push(from);
    }
    this.chat('*', 'system', `${p.name} joined`);
    this.broadcastState();
    // bring a (re)joining player up to date
    if (this.phase === 'draw' || this.phase === 'reveal') this.emit(from, { t: 'sync', turnId: this.turnId, ops: this.ops });
    if (this.phase === 'choose' && from === this.drawerId) this.emit(from, { t: 'choices', choices: this.choices, turnId: this.turnId });
  }

  onSettings(from, msg) {
    if (from !== this.hostId || this.phase !== 'lobby') return;
    const r = Math.round(Number(msg.rounds)), d = Math.round(Number(msg.drawTime));
    if (r >= 1 && r <= 6) this.settings.rounds = r;
    if (d >= 30 && d <= 180) this.settings.drawTime = d;
    this.broadcastState();
  }

  onStart(from) {
    if (from !== this.hostId || this.phase !== 'lobby') return;
    if (this.connected().length < 2) { this.chat(from, 'system', 'Wait for at least 2 players.'); return; }
    for (const p of this.players.values()) { p.score = 0; p.guessed = false; }
    // drop players who left while in the lobby
    this.order = this.order.filter((id) => this.players.get(id)?.connected);
    for (const id of [...this.players.keys()]) if (!this.order.includes(id)) this.players.delete(id);
    this.used.clear();
    this.round = 1;
    this.roundOrder = [...this.order];
    this.turnIdx = -1;
    this.chat('*', 'system', 'Game on! Round 1');
    this.nextTurn();
  }

  nextTurn() {
    for (const p of this.players.values()) p.guessed = false;
    this.resetTurnFields();
    for (;;) {
      this.turnIdx++;
      if (this.turnIdx >= this.roundOrder.length) {
        this.round++;
        if (this.round > this.settings.rounds) return this.gameOver();
        this.roundOrder = [...this.order];
        this.turnIdx = 0;
        this.chat('*', 'system', `Round ${this.round}`);
      }
      const id = this.roundOrder[this.turnIdx];
      if (this.players.get(id)?.connected) { this.drawerId = id; break; }
      if (!this.connected().length) return this.gameOver();
    }
    this.turnId++;
    this.phase = 'choose';
    this.choices = this.pickChoices(this.players.get(this.drawerId));
    this.endsAt = this.now() + CHOOSE_MS;
    this.broadcastState();
    this.emit(this.drawerId, { t: 'choices', choices: this.choices, turnId: this.turnId });
  }

  pickChoices(drawer) {
    const list = this.words[drawer.level] || this.words.g12;
    let pool = list.filter((w) => !drawer.seen.has(w) && !this.used.has(w));
    if (pool.length < CHOICES) {
      // this player has drawn every word on the list: start the list over
      drawer.seen.clear();
      this.emit(drawer.id, { t: 'seenReset', level: drawer.level });
      pool = list.filter((w) => !this.used.has(w));
      if (pool.length < CHOICES) pool = [...list];
    }
    const out = [];
    while (out.length < CHOICES && pool.length) out.push(pool.splice(Math.floor(this.rand() * pool.length), 1)[0]);
    return out;
  }

  onPick(from, msg) {
    if (this.phase !== 'choose' || from !== this.drawerId) return;
    const i = Number(msg.i);
    if (!(i >= 0 && i < this.choices.length)) return;
    this.beginDraw(this.choices[i]);
  }

  beginDraw(word) {
    const drawer = this.players.get(this.drawerId);
    this.word = word;
    this.used.add(word);
    if (drawer) { drawer.seen.add(word); this.emit(drawer.id, { t: 'seen', word, level: drawer.level }); }
    this.phase = 'draw';
    const ms = this.settings.drawTime * 1000;
    this.startedAt = this.now();
    this.endsAt = this.startedAt + ms;
    // hints: first letter first, then random letters, never more than 40% of the word
    const letters = [...word].map((c, i) => (/[a-z]/i.test(c) ? i : -1)).filter((i) => i >= 0);
    const n = Math.max(1, Math.floor(letters.length * 0.4));
    const rest = letters.slice(1);
    for (let i = rest.length - 1; i > 0; i--) { const j = Math.floor(this.rand() * (i + 1)); [rest[i], rest[j]] = [rest[j], rest[i]]; }
    const order = [letters[0], ...rest].slice(0, n);
    this.revealPlan = order.map((idx, k) => ({ idx, at: this.startedAt + ms * (0.35 + (0.5 * k) / Math.max(1, n - 1 || 1)) }));
    this.broadcastState();
  }

  onDraw(from, msg) {
    if (this.phase !== 'draw' || from !== this.drawerId || !Array.isArray(msg.ops)) return;
    const ops = msg.ops.slice(0, 400);
    for (const op of ops) {
      if (op && op.t === 'u') this.undo();
      else if (this.ops.length < MAX_OPS) this.ops.push(op);
    }
    for (const p of this.players.values()) if (p.connected && p.id !== from) this.emitRaw(p.id, { t: 'draw', turnId: this.turnId, ops });
  }

  undo() {
    for (let i = this.ops.length - 1; i >= 0; i--) {
      const o = this.ops[i];
      if (o && (o.t === 's' || o.t === 'f' || o.t === 'c')) { const id = o.id; this.ops = this.ops.filter((x) => x.id !== id); return; }
    }
  }

  onGuess(p, msg) {
    const text = String(msg.text || '').replace(/[\u0000-\u001f]/g, '').trim().slice(0, 60);
    if (!text) return;
    if (this.phase !== 'draw') { this.chat('*', 'chat', text, { from: p.id, name: p.name, color: p.color }); return; }
    if (p.id === this.drawerId || p.guessed) {
      // keep people who know the word from spoiling it
      for (const q of this.players.values()) if (q.id === this.drawerId || q.guessed) this.chat(q.id, 'secret', text, { from: p.id, name: p.name, color: p.color });
      return;
    }
    const res = checkGuess(text, this.word);
    if (res === 'correct') {
      p.guessed = true;
      const ms = this.settings.drawTime * 1000;
      const frac = Math.max(0, (this.endsAt - this.now()) / ms);
      const gain = 20 + Math.round(80 * frac) + (this.firstDone ? 0 : 10);
      this.firstDone = true;
      p.score += gain;
      this.gains[p.id] = (this.gains[p.id] || 0) + gain;
      const drawer = this.players.get(this.drawerId);
      if (drawer) { drawer.score += 15; this.gains[drawer.id] = (this.gains[drawer.id] || 0) + 15; }
      this.chat('*', 'correct', `${p.name} guessed the word!`, { from: p.id, name: p.name });
      this.emit(p.id, { t: 'you-got-it', word: this.word, gain });
      this.broadcastState();
      const guessers = this.connected().filter((q) => q.id !== this.drawerId);
      if (guessers.length && guessers.every((q) => q.guessed)) this.endTurn('all');
      return;
    }
    this.chat('*', 'guess', text, { from: p.id, name: p.name, color: p.color });
    if (res === 'close') this.chat(p.id, 'close', `"${text}" is so close!`);
  }

  endTurn(reason) {
    if (this.phase !== 'draw' && this.phase !== 'choose') return;
    this.lastWord = this.word || (this.choices && this.choices[0]) || null;
    if (this.phase === 'choose') this.lastWord = null;
    this.endReason = reason;
    this.phase = 'reveal';
    this.endsAt = this.now() + REVEAL_MS;
    this.broadcastState();
  }

  gameOver() {
    this.phase = 'over';
    this.drawerId = null; this.word = null; this.endsAt = 0;
    this.broadcastState();
  }

  onAgain(from) {
    if (from !== this.hostId || this.phase !== 'over') return;
    for (const p of this.players.values()) { p.score = 0; p.guessed = false; }
    this.order = this.order.filter((id) => this.players.get(id)?.connected);
    for (const id of [...this.players.keys()]) if (!this.order.includes(id)) this.players.delete(id);
    this.phase = 'lobby';
    this.resetTurnFields();
    this.broadcastState();
  }

  leave(id) {
    const p = this.players.get(id);
    if (!p || !p.connected) return;
    p.connected = false;
    if (this.phase === 'lobby') { this.players.delete(id); this.order = this.order.filter((x) => x !== id); }
    this.chat('*', 'system', `${p.name} left`);
    if (this.phase !== 'lobby' && this.phase !== 'over' && this.connected().length < 2) {
      this.chat('*', 'system', 'Not enough players. Back to the lobby.');
      this.order = this.order.filter((x) => this.players.get(x)?.connected);
      for (const k of [...this.players.keys()]) if (!this.order.includes(k)) this.players.delete(k);
      this.phase = 'lobby';
      this.resetTurnFields();
      this.broadcastState();
      return;
    }
    if (id === this.drawerId && (this.phase === 'choose' || this.phase === 'draw')) { this.endTurn('drawerLeft'); return; }
    if (this.phase === 'draw') {
      const guessers = this.connected().filter((q) => q.id !== this.drawerId);
      if (guessers.length && guessers.every((q) => q.guessed)) { this.endTurn('all'); return; }
    }
    this.broadcastState();
  }

  // call every ~250 ms on the host
  tick() {
    const t = this.now();
    if (this.phase === 'choose' && t >= this.endsAt) {
      this.beginDraw(this.choices[Math.floor(this.rand() * this.choices.length)]);
    } else if (this.phase === 'draw') {
      let changed = false;
      for (const r of this.revealPlan) if (!this.revealed.has(r.idx) && t >= r.at) { this.revealed.add(r.idx); changed = true; }
      if (t >= this.endsAt) this.endTurn('time');
      else if (changed) this.broadcastState();
    } else if (this.phase === 'reveal' && t >= this.endsAt) {
      this.nextTurn();
    }
  }
}
