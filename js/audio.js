// Sound effects made with the Web Audio API (no audio files) and read-aloud.
let ctx = null;
let muted = false;
try { muted = localStorage.getItem('dd-muted') === '1'; } catch (e) { /* private mode */ }

export function unlock() {
  if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (C) ctx = new C(); }
  if (ctx && ctx.state === 'suspended') ctx.resume();
}
export const isMuted = () => muted;
export function setMuted(m) {
  muted = m;
  try { localStorage.setItem('dd-muted', m ? '1' : '0'); } catch (e) { /* ignore */ }
  if (m && window.speechSynthesis) speechSynthesis.cancel();
}

function tone(freq, start, dur, { type = 'sine', vol = 0.18 } = {}) {
  if (!ctx || muted) return;
  const t = ctx.currentTime + start;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t); o.stop(t + dur + 0.05);
}

export const sfx = {
  correct() { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.08, 0.25, { type: 'triangle' })); },
  otherCorrect() { tone(784, 0, 0.15, { type: 'triangle', vol: 0.12 }); tone(1047, 0.1, 0.2, { type: 'triangle', vol: 0.12 }); },
  close() { tone(440, 0, 0.12, { type: 'square', vol: 0.06 }); tone(494, 0.12, 0.15, { type: 'square', vol: 0.06 }); },
  turn() { tone(392, 0, 0.15); tone(523, 0.15, 0.3); },
  tick() { tone(1200, 0, 0.05, { type: 'square', vol: 0.05 }); },
  reveal() { tone(330, 0, 0.2, { type: 'triangle' }); tone(262, 0.2, 0.35, { type: 'triangle' }); },
  win() { [523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.14, 0.3, { type: 'triangle', vol: 0.16 })); },
  pop() { tone(660, 0, 0.06, { vol: 0.08 }); },
};

export function say(text) {
  if (muted || !window.speechSynthesis) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US'; u.rate = 0.9;
  speechSynthesis.speak(u);
}
