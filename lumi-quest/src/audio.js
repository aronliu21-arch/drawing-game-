// Sound effects and music, all synthesized with the Web Audio API.
const Snd = (() => {
  let ac = null, master = null, music = null, muted = false, timer = null, nextT = 0, stepI = 0;
  try { muted = localStorage.getItem('lumiquest.mute') === '1'; } catch (e) { }
  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ac = new AC(); master = ac.createGain(); master.gain.value = muted ? 0 : 0.5; master.connect(ac.destination);
    music = ac.createGain(); music.gain.value = 0; music.connect(master);
    if (wantName) { const w = wantName; wantName = null; setMusic(w); }
  }
  function tone(f, d, type, vol, when, to, dest) {
    if (!ac) return; const t = ac.currentTime + (when || 0);
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type || 'square'; o.frequency.setValueAtTime(f, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(dest || master); o.start(t); o.stop(t + d + 0.03);
  }
  function noise(d, vol, when, dest) {
    if (!ac) return; const t = ac.currentTime + (when || 0); const n = Math.floor(ac.sampleRate * d);
    const b = ac.createBuffer(1, n, ac.sampleRate), ch = b.getChannelData(0); for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ac.createBufferSource(), g = ac.createGain(); s.buffer = b; g.gain.value = vol || 0.2; s.connect(g); g.connect(dest || master); s.start(t);
  }
  const N = { C4: 261.6, D4: 293.7, E4: 329.6, F4: 349.2, G4: 392, A4: 440, B4: 493.9, C5: 523.3, D5: 587.3, E5: 659.3, F5: 698.5, G5: 784, A5: 880, C6: 1046.5 };
  const sfx = {
    tap: () => tone(660, 0.06, 'triangle', 0.15),
    ok: () => { tone(N.E5, 0.09, 'square', 0.14); tone(N.G5, 0.09, 'square', 0.14, 0.08); tone(N.C6, 0.18, 'square', 0.14, 0.16); },
    bad: () => { tone(220, 0.16, 'sawtooth', 0.14, 0, 150); tone(160, 0.22, 'sawtooth', 0.12, 0.14, 110); },
    hit: () => { noise(0.14, 0.3); tone(180, 0.12, 'square', 0.18, 0, 70); },
    skill: () => { tone(500, 0.3, 'sawtooth', 0.12, 0, 1500); noise(0.2, 0.18, 0.2); },
    hurt: () => { noise(0.2, 0.3); tone(120, 0.2, 'triangle', 0.25, 0, 60); },
    chest: () => [N.C5, N.E5, N.G5, N.C6].forEach((f, i) => tone(f, 0.14, 'triangle', 0.2, i * 0.08)),
    coin: () => { tone(988, 0.07, 'square', 0.12); tone(1319, 0.2, 'square', 0.12, 0.07); },
    level: () => [N.C5, N.E5, N.G5, N.C6, N.G5, N.C6].forEach((f, i) => tone(f, 0.16, 'square', 0.15, i * 0.1)),
    capture: () => { tone(300, 0.4, 'sine', 0.2, 0, 900); [N.G5, N.C6].forEach((f, i) => tone(f, 0.2, 'triangle', 0.2, 0.45 + i * 0.12)); },
    heal: () => [N.C5, N.D5, N.E5, N.G5].forEach((f, i) => tone(f, 0.2, 'sine', 0.2, i * 0.07)),
    warp: () => { tone(200, 0.6, 'sine', 0.2, 0, 1200); tone(400, 0.6, 'triangle', 0.1, 0.05, 1600); },
    win: () => [N.G4, N.C5, N.E5, N.G5, N.E5, N.G5, N.C6].forEach((f, i) => tone(f, i === 6 ? 0.5 : 0.13, 'square', 0.15, i * 0.11)),
    lose: () => [N.E4, N.D4, N.C4].forEach((f, i) => tone(f, 0.3, 'triangle', 0.2, i * 0.22)),
    battle: () => { for (let i = 0; i < 6; i++) tone(200 + i * 90, 0.08, 'sawtooth', 0.12, i * 0.06); },
  };
  // ---------- music: eight short loops, one per place or occasion ----------
  const P = str => str.trim().split(/\s+/).map(x => x === '-' ? 0 : x);
  const TRACKS = {
    anthem: { step: 0.19, voice: 'square', bassEvery: 2, drums: 'k.h.', lead: P('C5 - E5 G5 C6 - G5 E5 F5 - A5 F5 G5 - D5 - E5 - G5 C6 A5 - G5 E5 F5 G5 A5 G5 C6 - - -'), bass: P('C3 C3 C3 C3 F3 F3 G3 G3 C3 C3 A3 A3 F3 G3 C3 C3') },
    village: { step: 0.3, voice: 'soft', bassEvery: 8, arp: true, lead: P('E4 G4 A4 G4 E4 D4 C4 - D4 E4 G4 E4 D4 C4 D4 - E4 G4 A4 C5 A4 G4 E4 - D4 E4 D4 C4 A3 C4 C4 -'), bass: P('C3 G2 A2 F2') },
    lantern: { step: 0.26, voice: 'pluck', bassEvery: 4, drums: '....t...', lead: P('G4 A4 C5 A4 G4 E4 G4 - E4 G4 A4 G4 E4 D4 E4 - C5 D5 C5 A4 G4 A4 G4 E4 D4 E4 G4 E4 D4 C4 C4 -'), bass: P('C3 G3 C3 G3 A2 E3 G2 C3') },
    box: { step: 0.27, voice: 'bell', bassEvery: 6, lead: P('C5 E5 G5 E5 G5 E5 A4 C5 E5 C5 E5 C5 F4 A4 C5 A4 C5 A4 G4 B4 D5 B4 D5 G5'), bass: P('C3 A2 F2 G2') },
    starry: { step: 0.5, voice: 'pad', bassEvery: 8, pad: true, lead: P('E5 - - G5 - - D5 - C5 - - E5 - - B4 - A4 - - C5 - - E5 - D5 - - - G4 - - -'), bass: P('C3 A2 F2 G2') },
    march: { step: 0.22, voice: 'square', bassEvery: 4, drums: 'k.h.s.h.', lead: P('G4 G4 C5 - C5 D5 E5 - E5 D5 C5 - D5 - G4 - A4 A4 D5 - D5 E5 F5 - E5 D5 C5 B4 C5 - - -'), bass: P('C3 G3 C3 G3 D3 A3 G2 C3') },
    mystery: { step: 0.34, voice: 'reed', bassEvery: 8, lead: P('A3 - C4 E4 - D4 C4 - B3 - D4 F4 - E4 D4 - A3 - C4 E4 - A4 G4 - F4 E4 D4 C4 B3 - A3 -'), bass: P('A2 D3 A2 E2') },
    battle: { step: 0.15, voice: 'square', bassEvery: 2, drums: 'k.hsk.hs', lead: P('E4 E4 G4 E4 B4 E4 G4 E4 D4 D4 F#4 D4 A4 D4 F#4 D4 C4 C4 E4 C4 G4 C4 E4 C4 B3 D#4 F#4 B4 A4 F#4 D#4 B3'), bass: P('E2 E2 E2 E2 D2 D2 D2 D2 C2 C2 C2 C2 B1 B1 B1 B1') },
  };
  const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const hz = n => { const m = /^([A-G])(#?)(\d)$/.exec(n); return 440 * Math.pow(2, (SEMI[m[1]] + (m[2] ? 1 : 0) + (m[3] - 4) * 12 - 9) / 12); };
  function mt(f, d, type, v, when, attack) { // one music note at an absolute time
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, when);
    g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(v, when + (attack || 0.012)); g.gain.exponentialRampToValueAtTime(0.0001, when + d);
    o.connect(g); g.connect(music); o.start(when); o.stop(when + d + 0.05);
  }
  function leadNote(tr, f, w) {
    const L = tr.step;
    if (tr.voice === 'square') { mt(f, L * 1.7, 'square', 0.085, w); mt(f / 2, L * 1.7, 'triangle', 0.07, w); }
    else if (tr.voice === 'soft') { mt(f, L * 2.4, 'triangle', 0.17, w, 0.03); mt(f * 2, L * 1.6, 'sine', 0.035, w, 0.03); }
    else if (tr.voice === 'pluck') { mt(f, L * 2.2, 'triangle', 0.2, w, 0.004); mt(f * 2, L * 0.7, 'sine', 0.07, w, 0.004); mt(f * 1.005, L * 1.4, 'sine', 0.05, w + 0.02, 0.004); }
    else if (tr.voice === 'bell') { mt(f, L * 4, 'sine', 0.2, w, 0.004); mt(f * 3, L * 1.2, 'sine', 0.03, w, 0.004); mt(f * 2, L * 2.5, 'sine', 0.05, w, 0.004); }
    else if (tr.voice === 'pad') { mt(f, L * 3.5, 'sine', 0.16, w, 0.12); mt(f * 1.004, L * 3.5, 'triangle', 0.05, w, 0.15); }
    else if (tr.voice === 'reed') { mt(f, L * 2.2, 'sawtooth', 0.055, w, 0.05); mt(f / 2, L * 2.2, 'triangle', 0.1, w, 0.05); }
  }
  let curName = null, wantName = null, duckLevel = 1;
  function tick() {
    const tr = TRACKS[curName]; if (!ac || !tr || ac.state !== 'running') return;
    if (nextT < ac.currentTime) nextT = ac.currentTime + 0.05; // tab was asleep: do not replay the backlog
    while (nextT < ac.currentTime + 0.25) {
      const w = nextT, n = tr.lead[stepI % tr.lead.length];
      if (n) leadNote(tr, hz(n), w);
      const bf = hz(tr.bass[Math.floor(stepI / tr.bassEvery) % tr.bass.length]);
      if (stepI % tr.bassEvery === 0) { if (tr.pad) [1, 1.5, 2, 2.52].forEach(m => mt(bf * m, tr.step * tr.bassEvery * 1.05, 'sine', 0.06, w, 0.4)); else mt(bf, tr.step * tr.bassEvery * 0.95, 'triangle', tr.voice === 'bell' ? 0.1 : 0.17, w, 0.02); }
      if (tr.arp && stepI % 2 === 1) mt(bf * [2, 3, 4, 3][Math.floor(stepI / 2) % 4], tr.step * 1.6, 'sine', 0.05, w, 0.02);
      if (tr.drums) { const d = tr.drums[stepI % tr.drums.length], wr = w - ac.currentTime; if (d === 'k') tone(110, 0.1, 'sine', 0.3, wr, 45, music); else if (d === 'h') noise(0.04, 0.05, wr, music); else if (d === 's') noise(0.09, 0.1, wr, music); else if (d === 't') tone(900, 0.05, 'sine', 0.08, wr, 0, music); }
      nextT += tr.step; stepI++;
    }
  }
  const MUSIC_VOL = 0.75;
  // Switch track with a short fade. Safe to call every frame: it does nothing if the track is already playing.
  function setMusic(name) {
    wantName = name || null;
    if (!ac || wantName === curName) return;
    const to = wantName; curName = to; music.gain.cancelScheduledValues(ac.currentTime); music.gain.setTargetAtTime(0, ac.currentTime, 0.06);
    setTimeout(() => { if (curName !== to) return; stepI = 0; nextT = ac.currentTime + 0.05; if (to) music.gain.setTargetAtTime(MUSIC_VOL * duckLevel, ac.currentTime, 0.15); }, 260);
    if (!timer) timer = setInterval(tick, 60);
  }
  // Turn the music down (0..1) while a question is open or the voice is reading.
  function duck(level) { if (level === duckLevel) return; duckLevel = level; if (ac && curName) music.gain.setTargetAtTime(MUSIC_VOL * level, ac.currentTime, 0.2); }
  function setMuted(m) { muted = m; try { localStorage.setItem('lumiquest.mute', m ? '1' : '0'); } catch (e) { } if (master) master.gain.value = m ? 0 : 0.5; if (m && window.speechSynthesis) speechSynthesis.cancel(); }
  function play(name) { if (ac && !muted && sfx[name]) sfx[name](); }
  function say(text) {
    // Only ever called from a tap on a word, so it works even when music and effects are muted.
    if (!window.speechSynthesis) return;
    try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = 0.8; u.pitch = 1.05; speechSynthesis.speak(u); } catch (e) { }
  }
  return { init, play, setMusic, duck, setMuted, say, isMuted: () => muted, track: () => curName };
})();
