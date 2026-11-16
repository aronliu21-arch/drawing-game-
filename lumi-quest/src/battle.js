// Battles: every move is powered by a question. Two tries, then the answer is shown.
let QS = null;
function askQuestion(subject) {
  return new Promise(res => {
    const q = Q.next(subject, S.kid, S.seen); S.stats.asked++;
    QS = { q, tries: 0, res, seq: [], done: false };
    const sub = Q.SUBJECTS[q.subject];
    $('qStyle').textContent = `${sub.style} · ${sub.name}`;
    $('qText').textContent = q.q; $('qWhy').hidden = true; $('qNext').hidden = true; $('qMsg').textContent = q.type === 'order' ? 'Tap them one by one' : '';
    $('qBig').hidden = !q.big; $('qBig').textContent = q.big || ''; $('qBig').className = (q.bigSmall ? 'small ' : '') + (q.sub ? 'hasSub' : ''); $('qSub').hidden = !q.sub; $('qSub').textContent = q.sub || '';
    const box = $('qChoices'); box.innerHTML = ''; box.className = q.type + (q.zh ? ' zh' : '') + (q.emoji ? ' emoji' : ''); box.style.gridTemplateColumns = q.type === 'order' ? `repeat(${q.items.length}, 1fr)` : '';
    const items = q.type === 'order' ? q.items : q.choices;
    items.forEach((txt, i) => { const b = document.createElement('button'); b.className = 'choice'; b.textContent = q.type === 'tf' ? (i === 0 ? '✅ Fact' : '❌ Fib') : txt; b.addEventListener('click', () => pickAnswer(i)); box.appendChild(b); });
    drawTries(); $('question').hidden = false;
    if (S.read) readQuestion();
  });
}
function readQuestion() { const q = QS.q; Snd.say(q.q + (q.type === 'tf' ? ' Fact, or fib?' : '')); }
function drawTries() { $('qTries').textContent = QS.tries === 0 ? '● ●' : '● ○'; }
function pickAnswer(i) {
  if (!QS || QS.done) return; const q = QS.q, btns = [...$('qChoices').children];
  if (q.type === 'order') {
    if (btns[i].classList.contains('locked')) return;
    if (i === q.correct[QS.seq.length]) { QS.seq.push(i); btns[i].classList.add('locked'); btns[i].dataset.n = QS.seq.length; Snd.play('tap'); if (QS.seq.length === q.correct.length) finishQ(true); return; }
    QS.tries++; drawTries(); Snd.play('bad'); QS.seq = []; btns.forEach(b => { b.classList.remove('locked'); delete b.dataset.n; }); shake($('qCard'));
    if (QS.tries >= 2) finishQ(false); else $('qMsg').textContent = 'Not quite. Start again from the smallest!';
    return;
  }
  if (btns[i].disabled) return;
  if (i === q.answer) { finishQ(true); return; }
  QS.tries++; drawTries(); Snd.play('bad'); btns[i].classList.add('wrong'); btns[i].disabled = true; shake($('qCard'));
  if (QS.tries >= 2) { finishQ(false); return; }
  $('qMsg').textContent = 'Not quite. One more try!';
  // Lucas gets a hint after one miss: one more wrong answer is removed.
  if (S.kid === 'lucas' && q.type === 'mc') { const extra = btns.findIndex((b, k) => k !== q.answer && !b.disabled); if (extra >= 0) { btns[extra].disabled = true; btns[extra].classList.add('faded'); $('qMsg').textContent = 'Hint: one wrong answer is gone. Try again!'; } }
}
function shake(el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
function finishQ(ok) {
  QS.done = true; const q = QS.q, btns = [...$('qChoices').children], first = ok && QS.tries === 0;
  if (q.type === 'order') q.correct.forEach((idx, n) => { btns[idx].classList.add('locked'); btns[idx].dataset.n = n + 1; }); else btns[q.answer].classList.add('right');
  btns.forEach(b => { b.disabled = true; });
  $('qWhy').hidden = false; $('qWhy').textContent = (ok ? (first ? '⭐ Perfect! ' : '👍 Got it! ') : 'The answer: ' + (q.type === 'order' ? '' : q.choices[q.answer] + '. ')) + q.why;
  if (ok) { Snd.play('ok'); S.stats.right++; if (first) S.stats.first++; $('qMsg').textContent = first ? 'Full power!' : 'Half power'; }
  else { $('qMsg').textContent = 'The move fizzled'; if (S.read) Snd.say('The answer is ' + (q.type === 'order' ? q.why : q.choices[q.answer]) + '. ' + q.why); }
  const out = { ok, tries: QS.tries, mult: ok ? (first ? 1 : 0.5) : 0, pts: ok ? (first ? 2 : 1) : 0 };
  const close = () => { $('question').hidden = true; const r = QS.res; QS = null; addXP(out.pts * 2); save(); updateHUD(); r(out); };
  if (ok) setTimeout(close, G.fast ? 0 : 1500); else { $('qNext').hidden = false; $('qNext').onclick = () => { Snd.play('tap'); close(); }; }
}
$('qSay').addEventListener('click', () => { if (QS) readQuestion(); });

// ---------- battle ----------
const worldIndex = () => Math.max(1, WORLD_ORDER.indexOf(G.world) + 1);
function makeFog(def) { const wi = worldIndex(), boss = !!def.boss; const hp = Math.round((22 + 17 * wi) * (boss ? 2.5 : 1)); return Object.assign({}, def, { hp, max: hp, atk: 3 + 2.5 * wi + (boss ? 2 : 0), xp: (10 + 6 * wi) * (boss ? 3 : 1), gold: (8 + 5 * wi) * (boss ? 4 : 1) }); }
function makeWild() { const w = WORLDS[G.world], sp = w.wild[Math.floor(Math.random() * w.wild.length)], wi = G.world === 'hub' ? 0.6 : worldIndex(); const hp = Math.round(16 + 9 * wi); return { wild: true, sp, name: SPECIES[sp].name, el: SPECIES[sp].el, lv: w.wildLv, hp, max: hp, atk: 3 + 2.2 * wi, xp: Math.round(8 + 5 * wi), gold: 0 }; }
function wildBattle() { beginBattle(makeWild(), null); }
function startBattle(ent) { beginBattle(makeFog(ent.def), ent); }
async function beginBattle(e, ent) {
  G.busy = true; Snd.play('battle');
  await tween(0.35, k => { G.fade = k; });
  G.mode = 'battle'; G.parts = [];
  G.B = { e, ent, subject: WORLDS[G.world].subject, hx: -300, ex: 300, lx: 0, eHit: 0, hHit: 0, shake: 0, eScale: 1, orb: null, lock: true, swing: 0 };
  $('battle').hidden = false; showHUD(false); setLog(e.wild ? `A wild ${e.name} jumped out of the grass!` : e.boss ? `${e.name} blocks the way!` : `A ${e.name} drifts closer…`); renderMoves();
  tween(0.5, k => { G.B.hx = -300 * (1 - k); G.B.ex = 300 * (1 - k); });
  await tween(0.35, k => { G.fade = 1 - k; });
  G.fade = 0; G.busy = false; G.B.lock = false; renderMoves();
}
function setLog(t) { $('bLog').textContent = t; }
function elemMult(a, d) { if (BEATS[a] === d) return 1.5; if (BEATS[d] === a) return 0.75; return 1; }
const captureLine = () => S.cls === 'ranger' ? 0.65 : 0.5;
function renderMoves() {
  const B = G.B; if (!B) return; const e = B.e, l = activeLumi(), sp = SPECIES[l.sp], m = elemMult(sp.el, e.el);
  const canCap = e.wild && S.orb > 0 && e.hp <= e.max * captureLine();
  const moves = [
    ['strike', '⚔️', WEAPONS[S.weapon].name, `Power ${heroAtk()}`, true],
    ['skill', { fire: '🔥', water: '💧', leaf: '🍃', star: '⭐' }[sp.el], sp.skill, `Power ${lumiPower(l)}${m > 1 ? ' · strong!' : m < 1 ? ' · weak' : ''}`, true],
    ['capture', '🔮', 'Capture', !e.wild ? 'Wild Lumis only' : S.orb < 1 ? 'No orbs left' : canCap ? `${S.orb} orbs` : 'Weaken it first', canCap],
    ['potion', '🧪', 'Potion', S.potion ? `${S.potion} left` : 'None left', S.potion > 0 && S.hp < maxHP()],
    ['swap', '🔁', 'Swap Lumi', lumiName(l), S.party.length > 1],
    ['run', '🏃', 'Run', e.boss ? 'No escape!' : 'Leave battle', !e.boss],
  ];
  $('bMoves').innerHTML = moves.map(m => `<button class="move m-${m[0]}" data-m="${m[0]}" ${m[4] && !B.lock ? '' : 'disabled'}><span>${m[1]}</span><b>${m[2]}</b><small>${m[3]}</small></button>`).join('');
  $('bMoves').querySelectorAll('button').forEach(b => b.addEventListener('click', () => doMove(b.dataset.m)));
}
async function doMove(kind) {
  const B = G.B; if (!B || B.lock) return; const e = B.e, n = KIDS[S.kid].name;
  Snd.play('tap');
  if (kind === 'swap') { await teamPanel(true); renderMoves(); return; }
  B.lock = true; renderMoves();
  if (kind === 'run') { setLog(`${n} got away safely.`); await wait(0.6); return leaveBattle(); }
  const r = await askQuestion(B.subject);
  if (kind === 'strike' || kind === 'skill') {
    const l = activeLumi(), sp = SPECIES[l.sp];
    if (!r.ok) { setLog(kind === 'strike' ? `${n}'s swing missed!` : `${lumiName(l)}'s ${sp.skill} fizzled!`); await wait(0.7); }
    else {
      const em = kind === 'skill' ? elemMult(sp.el, e.el) : 1;
      const dmg = Math.max(1, Math.round((kind === 'strike' ? heroAtk() : lumiPower(l)) * em * r.mult * rnd(0.92, 1.08)));
      const key = kind === 'strike' ? 'hx' : 'lx';
      if (kind === 'strike') tween(0.3, k => { B.swing = -Math.sin(k * Math.PI) * 1.6; });
      await tween(0.22, k => { B[key] = k * 300; });
      Snd.play(kind === 'strike' ? 'hit' : 'skill'); e.hp = Math.max(0, e.hp - dmg); B.eHit = 0.25;
      burst(720, 280, kind === 'strike' ? '#fff' : Art.EL[sp.el], 18); floater(720, 210, '-' + dmg, r.mult === 1 ? '#ffe066' : '#fff', r.mult === 1 ? 34 : 26);
      setLog((kind === 'strike' ? `${n} strikes with the ${WEAPONS[S.weapon].name}!` : `${lumiName(l)} used ${sp.skill}!`) + (em > 1 ? ' It is super strong!' : em < 1 ? ' It is not very strong…' : '') + (r.mult === 1 ? ' Full power!' : ''));
      await tween(0.25, k => { B[key] = (1 - k) * 300; });
      await wait(0.35);
    }
  } else if (kind === 'capture') {
    if (!r.ok) { setLog('The orb slipped! It was not thrown.'); await wait(0.7); }
    else {
      S.orb--; B.orb = { k: 0 }; await tween(0.5, k => { B.orb.k = k; });
      const caught = r.tries === 0 || Math.random() < 0.6;
      await tween(0.4, k => { B.eScale = 1 - k * 0.9; });
      if (caught) { Snd.play('capture'); burst(720, 300, '#e599f7', 30); B.orb = null; B.eScale = 0; return finishBattle('capture'); }
      Snd.play('bad'); B.orb = null; await tween(0.25, k => { B.eScale = 0.1 + k * 0.9; }); setLog(`${e.name} broke free! Answer first try for a sure catch.`); await wait(0.6);
    }
  } else if (kind === 'potion') {
    if (!r.ok) { setLog('The potion was not opened in time.'); await wait(0.7); }
    else { S.potion--; const heal = Math.round(maxHP() * (r.mult === 1 ? 0.6 : 0.35)); S.hp = Math.min(maxHP(), S.hp + heal); Snd.play('heal'); burst(210, 300, '#8ce99a', 18); floater(210, 220, '+' + heal, '#8ce99a'); setLog(`${n} drank a potion and healed ${heal}.`); updateHUD(); await wait(0.6); }
  }
  if (G.B !== B) return;
  if (e.hp <= 0) return finishBattle('win');
  // enemy turn
  await wait(0.25);
  const dmg = Math.max(1, Math.round(e.atk * rnd(0.85, 1.15)) - heroDef());
  await tween(0.2, k => { B.ex = -k * 260; });
  Snd.play('hurt'); S.hp = Math.max(0, S.hp - dmg); B.hHit = 0.25; B.shake = 0.3; floater(210, 220, '-' + dmg, '#ff8787'); updateHUD();
  setLog(`${e.name} ${e.wild ? 'tackles' : 'hurls fog at'} ${n}!`);
  await tween(0.25, k => { B.ex = -(1 - k) * 260; });
  if (S.hp <= 0) return finishBattle('lose');
  B.lock = false; renderMoves(); save();
}
function leaveBattle() { G.B = null; $('battle').hidden = true; showHUD(true); G.mode = 'world'; G.grace = 5; G.parts = []; updateHUD(); save(); }
async function finishBattle(how) {
  const B = G.B, e = B.e, n = KIDS[S.kid].name, w = WORLDS[G.world];
  $('bMoves').innerHTML = '';
  if (how === 'lose') {
    Snd.play('lose'); setLog(`${n} is out of health…`); await wait(0.8);
    await tween(0.4, k => { G.fade = k; }); leaveBattle(); S.hp = maxHP(); loadWorld('hub', true); save();
    await tween(0.4, k => { G.fade = 1 - k; }); G.fade = 0;
    await say(['You ran out of health, so Elder Lumen carried you home.', 'Nothing was lost. Rest, buy a potion or better armour, and try again!'], 'Healer Rosa'); return;
  }
  S.stats.wins++;
  const gold = Math.round(e.gold * (S.cls === 'ranger' ? 1.25 : 1));
  if (how === 'capture') {
    S.party.push({ sp: e.sp, lv: e.lv, xp: 0 }); setLog(`Gotcha! ${e.name} joined ${n}'s team!`); await wait(0.5);
    addXP(e.xp); await say([`${e.name} was captured! It joins your team at Level ${e.lv}.`, 'Open 🐾 Team to choose which Lumi fights beside you.']);
    return leaveBattle();
  }
  Snd.play('win'); await tween(0.5, k => { B.eScale = 1 - k; }); burst(720, 290, '#d0bfff', 26);
  setLog(`${e.name} ${e.wild ? 'ran away' : 'faded into mist'}!`);
  S.gold += gold; addXP(e.xp); addLumiXP(e.xp); updateHUD();
  await say(`Victory! +${e.xp} XP` + (gold ? ` and ${gold} coins.` : '.'));
  if (B.ent) {
    B.ent.gone = true; const q = S.quests[G.world];
    if (B.ent.type === 'fog') { q.kills++; if (q.kills === 3) { G.ents.filter(x => x.type === 'wall').forEach(x => { x.gone = true; }); toast(`🌫️ The fog wall has lifted! Find ${w.boss.name}.`); } }
    if (B.ent.type === 'boss') return bossWon();
  }
  leaveBattle();
}
async function bossWon() {
  const w = WORLDS[G.world], n = KIDS[S.kid].name, id = G.world, final = id === 'w6';
  S.bosses[id] = 1; if (!final) S.crystals.push(id); else S.won = true; S.hp = maxHP();
  G.ents.filter(x => x.type === 'wall').forEach(x => { x.gone = true; });
  leaveBattle(); Snd.play('level'); burst(W / 2, H / 2, w.crystal, 50);
  if (final) await say(['King Mumble melts away. The Fog lifts from every land!', `The five crystals fly together. The Great Lantern of Hearthome shines again.`, `${n}, you are the Hero of Hearthome!`]);
  else await say([`${w.boss.name} is defeated! The ${w.name} Knowledge Crystal is yours.`, `${w.name} remembers everything again. ${S.crystals.length} of 5 crystals found.`, S.crystals.length === 5 ? 'The way to the Fog Citadel is open. King Mumble awaits!' : `A new land has opened at the Teleport Gate: ${WORLDS[WORLD_ORDER[WORLD_ORDER.indexOf(id) + 1]].name}.`]);
  save();
  await openPanel(`<div class="break"><div class="bigc" style="color:${w.crystal}">◆</div><h2>Great practice! Time for a break</h2><p>${final ? 'You finished the whole adventure.' : 'Your adventure is saved. The next land will be waiting.'}</p><p class="tip">💡 ${w.tip}</p><button id="btnFinish" class="big">Finish for now</button></div>`, { noClose: true, cls: 'center' });
}
document.addEventListener('click', ev => { if (ev.target && ev.target.id === 'btnFinish') { Snd.play('tap'); closePanel(); goTitle(); } });

function drawBattle(c) {
  const B = G.B, e = B.e, pal = PAL[G.world], t = G.t;
  const sx = B.shake > 0 ? Math.sin(t * 90) * 7 * (B.shake / 0.3) : 0;
  c.save(); c.translate(sx, 0);
  const sky = c.createLinearGradient(0, 0, 0, 280); sky.addColorStop(0, pal.sky[0]); sky.addColorStop(1, pal.sky[1]); c.fillStyle = sky; c.fillRect(-20, 0, W + 40, 290);
  // sunburst + far hills
  c.save(); c.translate(W / 2, 250); c.globalAlpha = 0.13; c.fillStyle = '#fff'; for (let i = 0; i < 14; i++) { c.rotate(Math.PI / 7); c.beginPath(); c.moveTo(0, 0); c.lineTo(-40, -700); c.lineTo(40, -700); c.fill(); } c.restore();
  c.fillStyle = Art.shade(pal.hill, -0.12); c.beginPath(); c.moveTo(-20, 290); for (let x = -20; x <= W + 20; x += 40) c.lineTo(x, 235 - Math.sin(x * 0.012) * 26 - Math.sin(x * 0.031) * 10); c.lineTo(W + 20, 290); c.fill();
  c.fillStyle = pal.hill; c.beginPath(); c.moveTo(-20, 290); for (let x = -20; x <= W + 20; x += 40) c.lineTo(x, 262 - Math.sin(x * 0.009 + 2) * 18); c.lineTo(W + 20, 290); c.fill();
  const gr = c.createLinearGradient(0, 280, 0, H); gr.addColorStop(0, pal.g1); gr.addColorStop(1, Art.shade(pal.g1, -0.3)); c.fillStyle = gr; c.fillRect(-20, 280, W + 40, H);
  Art.ell(c, 250, 372, 170, 30, 'rgba(255,255,255,.16)'); Art.ell(c, 720, 356, 150, 26, 'rgba(255,255,255,.16)');
  // enemy
  if (B.eScale > 0.02) { c.save(); c.translate(720 + B.ex, 356); c.scale(B.eScale, B.eScale); if (e.wild) Art.lumi(c, SPECIES[e.sp], 0, 0, 2.6, t, false, true); else Art.fog(c, e, 0, 0, e.boss ? 2.3 : 2.4, t, B.eHit > 0); if (e.wild && B.eHit > 0) { c.globalAlpha = 0.5; Art.ell(c, 0, -50, 55, 55, '#fff'); } c.restore(); }
  // team
  const l = activeLumi();
  Art.lumi(c, SPECIES[l.sp], 345 + B.hx * 0.6 + B.lx, 384, 1.7, t, isEvo(l), false);
  c.save(); if (B.hHit > 0) c.globalAlpha = 0.55 + Math.sin(t * 60) * 0.3; Art.hero(c, 205 + B.hx, 376, 1.6, heroLook({ swing: B.swing, badge: true })); c.restore();
  if (B.orb) { const k = B.orb.k, ox = 240 + (720 - 240) * k, oy = 300 - Math.sin(k * Math.PI) * 190 + (k * 0); c.save(); c.shadowColor = '#e599f7'; c.shadowBlur = 16; Art.ell(c, ox, oy, 13, 13, '#e599f7', '#15131f', 3); c.restore(); Art.ell(c, ox - 4, oy - 4, 4, 4, '#fff'); }
  drawParts(c);
  c.restore();
  // name plates
  plate(c, 548, 22, e.name + (e.wild ? `  Lv ${e.lv}` : ''), e.hp, e.max, e.el, e.boss ? '#e03131' : '#495057');
  plate(c, 28, 22, `${KIDS[S.kid].name} Lv ${S.lv}  +  ${lumiName(l)} Lv ${l.lv}`, S.hp, maxHP(), SPECIES[l.sp].el, KIDS[S.kid].col, true);
}
function plate(c, x, y, name, hp, max, el, col, mine) {
  Art.rr(c, x, y, 384, 58, 14, 'rgba(21,19,31,.82)', 'rgba(255,255,255,.35)', 2);
  Art.rr(c, x + 10, y + 9, 26, 26, 13, Art.EL[el]); c.font = '15px system-ui'; c.textAlign = 'center'; c.fillText({ fire: '🔥', water: '💧', leaf: '🍃', star: '⭐' }[el], x + 23, y + 28);
  c.fillStyle = '#fff'; c.font = `400 19px ${FONT_D}`; c.textAlign = 'left'; c.fillText(name, x + 44, y + 29);
  c.textAlign = 'right'; c.font = '700 13px system-ui'; c.fillStyle = '#ced4da'; c.fillText(`${Math.max(0, Math.ceil(hp))} / ${max}`, x + 372, y + 28);
  Art.rr(c, x + 12, y + 39, 360, 11, 5.5, '#343a40'); const f = clamp(hp / max, 0, 1); if (f > 0) Art.rr(c, x + 12, y + 39, Math.max(11, 360 * f), 11, 5.5, f > 0.5 ? '#51cf66' : f > 0.25 ? '#fcc419' : '#ff6b6b');
  if (mine) { c.textAlign = 'left'; c.font = '700 11px system-ui'; }
}
