// Sound effects and music, all synthesized with the Web Audio API.
const Snd = (() => {
  let ac = null, master = null, music = null, muted = false, playing = false, timer = null, nextT = 0, stepI = 0;
  try { muted = localStorage.getItem('lumiquest.mute') === '1'; } catch (e) { }
  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ac = new AC(); master = ac.createGain(); master.gain.value = muted ? 0 : 0.5; master.connect(ac.destination);
    music = ac.createGain(); music.gain.value = 0; music.connect(master);
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
  // Anthem: 16-step loop, lead + bass + drums.
  const LEAD = ['C5', 0, 'E5', 'G5', 'C6', 0, 'G5', 'E5', 'F5', 0, 'A5', 'F5', 'G5', 0, 'D5', 0, 'E5', 0, 'G5', 'C6', 'A5', 0, 'G5', 'E5', 'F5', 'G5', 'A5', 'G5', 'C6', 0, 0, 0];
  const BASS = [130.8, 130.8, 130.8, 130.8, 174.6, 174.6, 196, 196, 130.8, 130.8, 220, 220, 174.6, 196, 130.8, 130.8];
  function tick() {
    if (!ac || !playing) return;
    const stepLen = 0.19;
    while (nextT < ac.currentTime + 0.25) {
      const w = nextT - ac.currentTime; const n = LEAD[stepI % LEAD.length];
      if (n) { tone(N[n], stepLen * 1.7, 'square', 0.09, w, 0, music); tone(N[n] / 2, stepLen * 1.7, 'triangle', 0.07, w, 0, music); }
      if (stepI % 2 === 0) tone(BASS[(stepI / 2) % BASS.length], stepLen * 1.8, 'triangle', 0.16, w, 0, music);
      if (stepI % 4 === 0) tone(110, 0.1, 'sine', 0.3, w, 45, music); else if (stepI % 4 === 2) noise(0.07, 0.1, w, music);
      nextT += stepLen; stepI++;
    }
  }
  function setMusic(on) {
    if (!ac) return;
    if (on && !playing) { playing = true; nextT = ac.currentTime + 0.05; stepI = 0; timer = setInterval(tick, 80); }
    music.gain.cancelScheduledValues(ac.currentTime); music.gain.setTargetAtTime(on ? 0.8 : 0, ac.currentTime, on ? 0.2 : 0.5);
    if (!on && playing) setTimeout(() => { if (music.gain.value < 0.02) { playing = false; clearInterval(timer); } }, 2500);
  }
  function setMuted(m) { muted = m; try { localStorage.setItem('lumiquest.mute', m ? '1' : '0'); } catch (e) { } if (master) master.gain.value = m ? 0 : 0.5; if (m && window.speechSynthesis) speechSynthesis.cancel(); }
  function play(name) { if (ac && !muted && sfx[name]) sfx[name](); }
  function say(text) {
    if (muted || !window.speechSynthesis) return;
    try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text.replace(/[❓▶]/g, '')); u.rate = 0.92; u.pitch = 1.1; speechSynthesis.speak(u); } catch (e) { }
  }
  return { init, play, setMusic, setMuted, say, isMuted: () => muted };
})();
