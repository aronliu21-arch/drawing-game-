// Title, intro, hero creator, main loop, input and the test hook.
const REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
G.intro = { state: 'wait', t: 0 };

// ---------- title ----------
function profileCards() {
  $('whoText').innerHTML = zh(ZT.who); $('btnReset').innerHTML = zh(ZT.reset);
  $('saveNote').textContent = Cloud.ready ? '☁️ Progress is saved to your Claude account, on every device' : '💾 Progress is saved on this device';
  $('profiles').innerHTML = ['nora', 'lucas'].map(k => { const s = loadSave(k); return `<button class="pcard ${k}" data-kid="${k}"><canvas data-hero="${k}"></canvas><b style="background:${KIDS[k].col}">${KIDS[k].name}</b><small>${s.created ? `${zh(ZT.level)} ${s.lv} · ${zh(ZT.crystal)} ${s.crystals.length}/5${s.won ? ' 🏆' : ''}` : zh(ZT.fresh)}</small></button>`; }).join('');
  drawMinis($('profiles'));
  $('profiles').querySelectorAll('.pcard').forEach(b => b.addEventListener('click', () => pickKid(b.dataset.kid)));
}
function startIntro() {
  Snd.init(); Snd.play('tap'); $('btnStart').hidden = true;
  if (REDUCED) return showMenu();
  G.intro.state = 'play'; G.intro.t = 0;
}
function showMenu() { G.intro.state = 'menu'; G.intro.t = 99; profileCards(); $('menu').hidden = false; }
function goTitle() {
  save(); S = null; kid = null; G.mode = 'title'; G.B = null; G.parts = []; showHUD(false); $('battle').hidden = true; $('creator').hidden = true; $('title').hidden = false;
  G.breakOn = false; showMenu();
}
function pickKid(k) {
  Snd.play('tap'); kid = k; S = loadSave(k); $('title').hidden = true; $('menu').hidden = true;
  if (!S.created) showCreator(); else enterGame(false);
}
async function enterGame(fresh) {
  $('creator').hidden = true;
  S.hp = Math.min(S.hp || maxHP(), maxHP()); if (S.hp <= 0) S.hp = maxHP();
  loadWorld('hub'); save();
  if (fresh) { G.busy = true; await say(STORY.intro); G.busy = false; toast('❗ Walk to Elder Lumen. Tap where you want to go.'); }
}

// ---------- creator ----------
let pickSp = STARTERS[0], crStep = 0, crNick = '';
const cleanNick = t => String(t || '').replace(/[^\p{L}\p{N} '\-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 12);
// The hero creator has three steps: how the hero looks, their class and gear, then their first Lumi.
function showCreator() { G.mode = 'create'; $('creator').hidden = false; pickSp = STARTERS[0]; crStep = 0; crNick = ''; drawCreatorUI(); }
function drawCreatorUI() {
  const steps = ['Look', 'Hero', 'Lumi'], head = o => `data-head='${JSON.stringify(o)}'`;
  $('crName').textContent = crStep === 0 ? `How does ${KIDS[kid].name} look?` : crStep === 1 ? `Choose ${KIDS[kid].name}'s gear` : `${KIDS[kid].name}'s first Lumi friend`;
  $('crSteps').innerHTML = steps.map((n, i) => `<span class="${i === crStep ? 'on' : i < crStep ? 'done' : ''}">${i + 1}. ${n}</span>`).join('');
  let h = '';
  if (crStep === 0) {
    h += `<div class="crsec"><h3>Hair style</h3><div class="opts heads">${HAIRS[kid].map(([id, n]) => `<button class="opt head${S.hair === id ? ' on' : ''}" data-hair="${id}" aria-label="${n} hair"><canvas ${head({ hair: id })}></canvas><b>${n}</b></button>`).join('')}</div></div>`;
    h += `<div class="crsec"><h3>Hair colour</h3><div class="sws">${HAIR_COLS.map(c => `<button class="sw${S.hairCol === c ? ' on' : ''}" data-hc="${c}" style="background:${c}" aria-label="Hair colour"></button>`).join('')}</div></div>`;
    h += `<div class="crsec"><h3>Face</h3><div class="opts heads">${FACES.map(([id, n]) => `<button class="opt head${S.face === id ? ' on' : ''}" data-face="${id}" aria-label="${n} face"><canvas ${head({ face: id })}></canvas><b>${n}</b></button>`).join('')}</div></div>`;
  } else if (crStep === 1) {
    h += `<div class="crsec"><h3>Hero class</h3><div class="opts">${Object.entries(CLASSES).map(([id, c]) => `<button class="opt${S.cls === id ? ' on' : ''}" data-cls="${id}"><span>${c.icon}</span><b>${c.name}</b><small>${c.perk}</small></button>`).join('')}</div></div>`;
    h += `<div class="crsec"><h3>Tunic</h3><div class="sws">${TUNICS.map(c => `<button class="sw${S.color === c ? ' on' : ''}" data-col="${c}" style="background:${c}" aria-label="Tunic colour"></button>`).join('')}</div></div>`;
    h += `<div class="crsec"><h3>Cape</h3><div class="sws">${CAPES.map(c => `<button class="sw${S.cape === c ? ' on' : ''}" data-cape="${c || ''}" style="background:${c || 'transparent'}" aria-label="${c ? 'Cape colour' : 'No cape'}">${c ? '' : '✕'}</button>`).join('')}</div></div>`;
    h += `<div class="crsec"><h3>Hero title</h3><div class="pills">${['', ...TITLES].map(tl => `<button class="pill${S.title === tl ? ' on' : ''}" data-title="${tl}">${tl ? KIDS[kid].name + ' ' + tl : 'Just ' + KIDS[kid].name}</button>`).join('')}</div></div>`;
  } else {
    h += `<div class="crsec"><div class="opts">${STARTERS.map(id => `<button class="opt lumi${pickSp === id ? ' on' : ''}" data-sp="${id}"><canvas data-lumi="${id}"></canvas><b>${SPECIES[id].name}</b><small class="el el-${SPECIES[id].el}">${SPECIES[id].el}</small></button>`).join('')}</div></div>`;
    h += `<div class="crsec"><h3>Give it a name</h3><input id="crNick" type="text" maxlength="12" autocomplete="off" placeholder="${SPECIES[pickSp].name}" value="${crNick}" aria-label="Lumi name"><div class="pills">${NICKS[SPECIES[pickSp].el].map(n => `<button class="pill${crNick === n ? ' on' : ''}" data-nick="${n}">${n}</button>`).join('')}</div></div>`;
  }
  $('crBody').innerHTML = h; drawMinis($('creator'));
  $('crBack').hidden = crStep === 0; $('btnBegin').textContent = crStep < 2 ? 'Next ▶' : 'Begin the adventure ▶';
  const on = (sel, fn) => $('creator').querySelectorAll(sel).forEach(b => b.onclick = () => { fn(b); Snd.play('tap'); drawCreatorUI(); });
  on('[data-hair]', b => { S.hair = b.dataset.hair; }); on('[data-hc]', b => { S.hairCol = b.dataset.hc; }); on('[data-face]', b => { S.face = b.dataset.face; });
  on('[data-cls]', b => { S.cls = b.dataset.cls; }); on('[data-col]', b => { S.color = b.dataset.col; }); on('[data-cape]', b => { S.cape = b.dataset.cape || null; }); on('[data-title]', b => { S.title = b.dataset.title; });
  on('[data-sp]', b => { if (pickSp !== b.dataset.sp) crNick = ''; pickSp = b.dataset.sp; }); on('[data-nick]', b => { crNick = b.dataset.nick; });
  const inp = $('crNick'); if (inp) inp.oninput = () => { crNick = cleanNick(inp.value); };
}
$('crBack').addEventListener('click', () => { if (crStep > 0) { crStep--; Snd.play('tap'); drawCreatorUI(); } });
$('btnBegin').addEventListener('click', () => {
  if (crStep < 2) { crStep++; Snd.play('tap'); drawCreatorUI(); return; }
  Snd.play('ok'); S.created = true; S.party = [{ sp: pickSp, lv: 1, xp: 0, nick: cleanNick(crNick) }]; S.active = 0; S.hp = maxHP(); save(); enterGame(true);
});

// ---------- parent gate ----------
function resetGate() {
  Snd.play('tap');
  const ask = () => {
    const a = 100 + Math.floor(Math.random() * 900), b = 12 + Math.floor(Math.random() * 88);
    $('panelBody').innerHTML = `<h2>🔒 Grown-ups only</h2><p>To reset records, answer this:</p><p class="gateq">${a} × ${b} = ?</p><div class="gaterow"><input id="gateIn" type="text" inputmode="numeric" autocomplete="off" aria-label="Answer"><button id="gateGo" class="big">Check</button></div><p id="gateMsg" class="hint"></p>`;
    $('gateGo').onclick = () => { if (parseInt($('gateIn').value, 10) === a * b) pickReset(); else { Snd.play('bad'); ask(); $('gateMsg').textContent = 'Not right. Here is a new question.'; } };
    G.gateAnswer = a * b;
  };
  const pickReset = () => {
    $('panelBody').innerHTML = `<h2>Reset records</h2><p>Tick who to reset on this device. This clears levels, Lumis, treasure and seen questions.</p><label class="chk"><input type="checkbox" id="rsNora"> Nora</label><label class="chk"><input type="checkbox" id="rsLucas"> Lucas</label><div class="gaterow"><button id="rsGo" class="big danger">Reset ticked</button></div>`;
    $('rsGo').onclick = () => { if ($('rsNora').checked) wipe('nora'); if ($('rsLucas').checked) wipe('lucas'); closePanel(); profileCards(); toast('Records reset.'); };
  };
  openPanel(''); ask();
}

// ---------- title drawing ----------
function sunburst(c, cx, cy, a, b, rot) { c.fillStyle = a; c.fillRect(0, 0, W, H); c.save(); c.translate(cx, cy); c.rotate(rot); c.fillStyle = b; for (let i = 0; i < 12; i++) { c.rotate(Math.PI / 6); c.beginPath(); c.moveTo(0, 0); c.lineTo(-95, -900); c.lineTo(95, -900); c.fill(); } c.restore(); }
function lantern(c, x, y, s, lit, crack) {
  c.save(); c.translate(x, y); c.scale(s, s);
  if (lit) { const g = c.createRadialGradient(0, -40, 5, 0, -40, 150); g.addColorStop(0, 'rgba(255,236,153,.9)'); g.addColorStop(1, 'rgba(255,236,153,0)'); c.fillStyle = g; c.fillRect(-150, -190, 300, 300); }
  Art.rr(c, -8, 0, 16, 60, 4, '#5c3d2e', '#15131f', 3); Art.rr(c, -30, -8, 60, 12, 5, '#8d6e4a', '#15131f', 3);
  Art.rr(c, -26, -72, 52, 66, 12, lit ? '#ffe066' : '#495057', '#15131f', 3.5);
  c.beginPath(); c.moveTo(-34, -70); c.lineTo(0, -98); c.lineTo(34, -70); c.closePath(); c.fillStyle = '#e03131'; c.fill(); c.strokeStyle = '#15131f'; c.lineWidth = 3.5; c.stroke();
  if (lit) Art.star(c, 0, -40, 14, '#fff');
  if (crack) { c.strokeStyle = '#15131f'; c.lineWidth = 3; c.beginPath(); c.moveTo(-10, -70); c.lineTo(4, -48); c.lineTo(-6, -34); c.lineTo(8, -10); c.stroke(); }
  c.restore();
}
function caption(c, pairs) { zhDraw(c, pairs, W / 2, 506, 34, '#fff', [['#15131f', 7]]); }
// ---------- Chinese text with zhuyin beside each character ----------
const ZT = {
  title: [['光', 'ㄍㄨㄤ'], ['靈', 'ㄌㄧㄥˊ'], ['大', 'ㄉㄚˋ'], ['冒', 'ㄇㄠˋ'], ['險', 'ㄒㄧㄢˇ']],
  sub: [['找', 'ㄓㄠˇ'], ['回', 'ㄏㄨㄟˊ'], ['知', 'ㄓ'], ['識', 'ㄕˋ'], ['神', 'ㄕㄣˊ'], ['燈', 'ㄉㄥ']],
  start: [['開', 'ㄎㄞ'], ['始', 'ㄕˇ']],
  who: [['誰', 'ㄕㄟˊ'], ['要', 'ㄧㄠˋ'], ['玩', 'ㄨㄢˊ'], ['？', '']],
  fresh: [['新', 'ㄒㄧㄣ'], ['冒', 'ㄇㄠˋ'], ['險', 'ㄒㄧㄢˇ']],
  level: [['等', 'ㄉㄥˇ'], ['級', 'ㄐㄧˊ']],
  crystal: [['水', 'ㄕㄨㄟˇ'], ['晶', 'ㄐㄧㄥ']],
  reset: [['重', 'ㄔㄨㄥˊ'], ['設', 'ㄕㄜˋ'], ['紀', 'ㄐㄧˋ'], ['錄', 'ㄌㄨˋ']],
  cap1: [['很', 'ㄏㄣˇ'], ['久', 'ㄐㄧㄡˇ'], ['以', 'ㄧˇ'], ['前', 'ㄑㄧㄢˊ'], ['，', ''], ['神', 'ㄕㄣˊ'], ['燈', 'ㄉㄥ'], ['照', 'ㄓㄠˋ'], ['亮', 'ㄌㄧㄤˋ'], ['大', 'ㄉㄚˋ'], ['地', 'ㄉㄧˋ']],
  cap2: [['迷', 'ㄇㄧˊ'], ['霧', 'ㄨˋ'], ['大', 'ㄉㄚˋ'], ['王', 'ㄨㄤˊ'], ['出', 'ㄔㄨ'], ['現', 'ㄒㄧㄢˋ'], ['！', '']],
  cap3: [['神', 'ㄕㄣˊ'], ['燈', 'ㄉㄥ'], ['碎', 'ㄙㄨㄟˋ'], ['成', 'ㄔㄥˊ'], ['五', 'ㄨˇ'], ['顆', 'ㄎㄜ'], ['水', 'ㄕㄨㄟˇ'], ['晶', 'ㄐㄧㄥ'], ['！', '']],
  cap4: [['兩', 'ㄌㄧㄤˇ'], ['位', 'ㄨㄟˋ'], ['小', 'ㄒㄧㄠˇ'], ['英', 'ㄧㄥ'], ['雄', 'ㄒㄩㄥˊ'], ['出', 'ㄔㄨ'], ['發', 'ㄈㄚ'], ['！', '']],
};
const TONES = 'ˊˇˋ';
const splitZy = z => TONES.includes(z.slice(-1)) ? [z.slice(0, -1), z.slice(-1)] : [z, ''];
// HTML version: zhuyin stacked to the right of each character, tone mark beside the last symbol.
function zh(pairs) { return '<span class="zh">' + pairs.map(([ch, z]) => { const [sym, tone] = splitZy(z); return `<span class="zc">${ch}${z ? `<span class="zy">${[...sym].map(x => `<span>${x}</span>`).join('')}</span><span class="zt">${tone}</span>` : ''}</span>`; }).join('') + '</span>'; }
// Canvas version. strokes: [[colour, width], …] drawn before the fill.
function zhDraw(c, pairs, cx, y, size, fill, strokes) {
  const zw = size * 0.46, widths = pairs.map(p => size + (p[1] ? zw : 0)), total = widths.reduce((a, b) => a + b, 0);
  let x = cx - total / 2; c.save(); c.lineJoin = 'round'; c.textBaseline = 'alphabetic';
  const put = (txt, px, py, font, align) => { c.font = font; c.textAlign = align; for (const [col, lw] of strokes || []) { c.strokeStyle = col; c.lineWidth = lw * (font.includes(' ' + Math.round(size) + 'px') ? 1 : 0.32); c.strokeText(txt, px, py); } c.fillStyle = fill; c.fillText(txt, px, py); };
  pairs.forEach(([ch, z], i) => {
    put(ch, x + size / 2, y, `900 ${Math.round(size)}px ${FONT_ZH}`, 'center');
    if (z) { const [sym, tone] = splitZy(z), zs = size * 0.33, n = sym.length, top = y - size * 0.42 - (n * zs) / 2 + zs * 0.85; [...sym].forEach((s, k) => put(s, x + size + zs * 0.55, top + k * zs, `700 ${zs.toFixed(1)}px ${FONT_ZH}`, 'center')); if (tone) put(tone, x + size + zs * 1.12, top + (n - 1) * zs - zs * 0.1, `700 ${zs.toFixed(1)}px ${FONT_ZH}`, 'center'); }
    x += widths[i];
  });
  c.restore();
}
function logo(c, y, s) {
  c.save(); c.translate(W / 2, y); c.scale(s, s); c.rotate(-0.025);
  const g = c.createLinearGradient(0, -80, 0, 0); g.addColorStop(0, '#fff9db'); g.addColorStop(1, '#ffd43b');
  zhDraw(c, ZT.title, 0, 0, 92, g, [['#15131f', 20], ['#7048e8', 9]]);
  zhDraw(c, ZT.sub, 0, 54, 38, '#fff', [['#15131f', 8]]);
  c.restore();
}
function heroFor(k, t) { const s = loadSave(k); return { ...looksOf(s), kid: k, color: s.color, cape: s.cape || (k === 'nora' ? '#ffd43b' : '#e03131'), weapon: weaponLook(s.weapon, s.cls), armor: ARMORS[s.armor].tier, cls: s.created ? s.cls : null, t, glow: false }; }
let titleLooks = null;
function drawTitle(c) {
  const I = G.intro, t = I.t, gt = G.t;
  if (!titleLooks || (G.t | 0) % 3 === 0) titleLooks = { nora: heroFor('nora', 0), lucas: heroFor('lucas', 0) };
  if (I.state === 'wait') { sunburst(c, W / 2, 330, '#2b1d5c', '#3b2a7a', gt * 0.05); lantern(c, W / 2, 400, 1.5, true); logo(c, 150, 1); return; }
  if (I.state === 'menu') { sunburst(c, W / 2, 620, '#f59f00', '#ffd43b', gt * 0.06); c.fillStyle = 'rgba(112,72,232,.22)'; c.fillRect(0, 0, W, H); logo(c, 100, 0.8); [90, 215, 860].forEach((x, i) => Art.lumi(c, SPECIES[STARTERS[i]], x, 520, 1.3, gt, false, i === 2)); return; }
  // intro animation
  if (t < 3.3) {
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1a1433'); g.addColorStop(1, '#3b2a7a'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 40; i++) { const x = Art.hash(i, 1) * W, y = Art.hash(i, 2) * 300; c.globalAlpha = 0.4 + Math.sin(gt * 3 + i) * 0.3; Art.ell(c, x, y, 1.6, 1.6, '#fff'); } c.globalAlpha = 1;
    c.fillStyle = '#231a47'; c.beginPath(); c.ellipse(W / 2, 560, 620, 180, 0, 0, 6.283); c.fill();
    const broke = t > 2.5;
    lantern(c, W / 2, 410, 1.7, !broke, t > 2.1);
    if (t > 1.5) { const k = clamp((t - 1.5) / 1.2, 0, 1); for (let i = 0; i < 14; i++) { const side = i % 2 ? 1 : -1; c.globalAlpha = 0.75; Art.ell(c, W / 2 + side * (620 - k * 430) + Math.sin(gt * 2 + i) * 20, 200 + (i * 53) % 330, 110, 70, i % 3 ? '#4c3a8f' : '#2b1d5c'); } c.globalAlpha = 1; Art.fog(c, { kind: 'wisp', col: '#2b1d5c', boss: true, eye: '#ff6b6b', sym: '…' }, W / 2 + 250 - k * 40, 300, 2.6 * k + 0.01, gt); }
    if (broke) { const k = (t - 2.5) / 0.8; c.fillStyle = `rgba(255,255,255,${clamp(1 - k * 1.6, 0, 1)})`; c.fillRect(0, 0, W, H); WORLD_ORDER.slice(0, 5).forEach((id, i) => { const a = -Math.PI * 0.9 + i * Math.PI * 0.2; Art.crystal(c, W / 2 + Math.cos(a) * k * 520, 330 + Math.sin(a) * k * 420, 22, WORLDS[id].crystal, gt); }); }
    caption(c, t < 1.5 ? ZT.cap1 : t < 2.5 ? ZT.cap2 : ZT.cap3);
  } else {
    const k = clamp((t - 3.3) / 0.5, 0, 1), e = 1 - Math.pow(1 - k, 3);
    sunburst(c, W / 2, 330, '#f76707', '#ffd43b', gt * 0.3);
    c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 4; for (let i = 0; i < 16; i++) { const y = 60 + i * 30, x = ((gt * 900 + i * 173) % (W + 300)) - 150; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 120, y); c.stroke(); }
    Art.hero(c, -200 + e * 500, 490, 2.4, Object.assign({}, titleLooks.nora, { t: gt }));
    Art.hero(c, W + 200 - e * 500, 490, 2.4, Object.assign({}, titleLooks.lucas, { t: gt + 1 }));
    if (t > 4.2) { const z = clamp((t - 4.2) / 0.3, 0, 1); const sh = t < 4.7 ? Math.sin(gt * 80) * 5 * (1 - (t - 4.2) / 0.5) : 0; c.save(); c.translate(sh, 0); logo(c, 130, 3 - 2 * z); c.restore(); }
    else caption(c, ZT.cap4);
  }
}
function drawEnding(c) {
  const E = G.end, t = G.t, l = activeLumi();
  // The cast stands high on the screen so the story box below never covers them.
  if (E.scene === 0) { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1a1433'); g.addColorStop(1, '#4a3a7a'); c.fillStyle = g; c.fillRect(0, 0, W, H); } else sunburst(c, W / 2, 210, '#f59f00', '#ffd43b', t * 0.05);
  c.save(); c.translate(0, -92);
  if (E.scene === 0) {
    for (let i = 0; i < 12; i++) { c.globalAlpha = 0.5 * (1 - E.k * 0.8); Art.ell(c, (i * 97 + Math.sin(t + i) * 30) % W, 120 + (i * 61) % 260, 120, 70, i % 2 ? '#4c3a8f' : '#2b1d5c'); } c.globalAlpha = 1;
    c.fillStyle = '#2c2542'; c.beginPath(); c.ellipse(W / 2, 560, 640, 170, 0, 0, 6.283); c.fill();
    Art.fog(c, { kind: 'wisp', col: E.k > 0.7 ? '#7048e8' : '#2b1d5c', boss: E.k < 0.45, eye: E.k > 0.7 ? '#ffe066' : '#ff6b6b', sym: '…' }, 690, 430, 2.6 - 1.75 * E.k, t);
  } else {
    c.fillStyle = '#69b55d'; c.beginPath(); c.ellipse(W / 2, 570, 680, 180, 0, 0, 6.283); c.fill();
    lantern(c, W / 2, 392, 1.6, E.scene >= 2, false);
    WORLD_ORDER.slice(0, 5).forEach((id, i) => { const a = t * 0.8 + i * 1.257, r = E.scene >= 2 ? 105 : 190; Art.crystal(c, W / 2 + Math.cos(a) * r, 250 + Math.sin(a) * r * 0.45, 17, WORLDS[id].crystal, t); });
    Art.villager(c, { col: '#7048e8', hair: '#adb5bd', hat: 'elder', ph: 3 }, 800, 452, 1.7, t);
    Art.villager(c, { col: '#5f3dc4', hair: '#343a40', ph: 1, sad: E.scene < 2 }, 680, 452, 1.35, t);
    if (E.scene >= 3) Art.lumi(c, SPECIES.echo, 590, 462, 1.6, t, true, true);
    if (E.scene >= 2 && Math.random() < 0.1) burst(W / 2, 160, '#fff9db', 3);
  }
  if (l) Art.lumi(c, SPECIES[l.sp], 345, 462, 1.6, t, isEvo(l), false);
  Art.hero(c, 225, 452, 1.9, heroLook({ badge: true }));
  c.restore();
}
function drawCreator(c) {
  sunburst(c, 250, 330, '#3b2a7a', '#4c3a8f', G.t * 0.05);
  Art.ell(c, 250, 452, 170, 34, 'rgba(255,255,255,.14)');
  Art.hero(c, 190, 448, 3, heroLook({ badge: true }));
  Art.lumi(c, SPECIES[pickSp], 372, 466, 1.8, G.t, false, true);
}

// ---------- loop ----------
function mini2(el, draw) { const d = DPR; if (el.width !== 72 * d) { el.width = 72 * d; el.height = 72 * d; } const c = el.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); c.clearRect(0, 0, 72, 72); draw(c); }
// Which track fits what is on screen right now.
const WORLD_MUSIC = { hub: 'village', w1: 'march', w2: 'starry', w3: 'starry', w4: 'march', w5: 'lantern', w6: 'mystery' };
function musicNow() {
  if (G.mode === 'title') return G.intro.state === 'wait' ? null : 'anthem';
  if (G.mode === 'create' || G.breakOn) return 'box';
  if (G.mode === 'ending') return G.end && G.end.scene >= 2 ? 'anthem' : 'mystery';
  if (G.mode === 'battle' && G.B) return G.B.e.boss ? 'mystery' : 'battle';
  return WORLD_MUSIC[G.world] || 'village';
}
let lastTs = 0;
function frame(ts) {
  const dt = Math.min(0.05, (ts - lastTs) / 1000 || 0); lastTs = ts; G.t += dt;
  for (let i = tweens.length - 1; i >= 0; i--) { const tw = tweens[i]; tw.t += dt; tw.fn(Math.min(1, tw.t / tw.dur)); if (tw.t >= tw.dur) { tweens.splice(i, 1); tw.res(); } }
  stepParts(dt);
  Snd.setMusic(musicNow()); Snd.duck(QS ? 0.4 : 1);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (G.mode === 'title') { if (G.intro.state === 'play') { G.intro.t += dt; if (G.intro.t > 6.2) showMenu(); } drawTitle(ctx); }
  else if (G.mode === 'create') drawCreator(ctx);
  else if (G.mode === 'ending' && G.end) { drawEnding(ctx); drawParts(ctx); }
  else if (G.mode === 'world') { if (held && !G.path.length) worldKey(held[0], held[1]); stepWorld(dt); drawWorld(ctx); drawParts(ctx); }
  if (QS && S) mini2($('qFace'), c => Art.hero(c, 36, 106, 1.05, heroLook({ glow: false, weapon: null, cls: null, cape: null })));
  if (G.mode === 'battle' && G.B) { const B = G.B; B.eHit = Math.max(0, B.eHit - dt); B.hHit = Math.max(0, B.hHit - dt); B.shake = Math.max(0, B.shake - dt); drawBattle(ctx); }
  if (dlg && G.me) Portraits.drawMe($('dlgMeFace'), G.mood && G.moodUntil > G.t ? G.mood : G.me, G.t);
  if (dlg && G.face) Portraits.draw($('dlgFace'), G.face, G.t, G.t - G.faceT0 < Math.min(2.4, 0.5 + dlg.lines[0].length * 0.03));
  if (G.fade > 0) { ctx.fillStyle = `rgba(21,19,31,${G.fade})`; ctx.fillRect(0, 0, W, H); }
  requestAnimationFrame(frame);
}
let DPR = 1;
function fit() {
  DPR = Math.min(2, window.devicePixelRatio || 1); cv.width = W * DPR; cv.height = H * DPR;
  const wrap = $('wrap'), s = Math.min(wrap.clientWidth / W, wrap.clientHeight / H);
  $('stage').style.transform = `translate(-50%,-50%) scale(${s})`;
  $('rotate').hidden = !(window.innerHeight > window.innerWidth * 1.15 && window.innerWidth < 700);
}
window.addEventListener('resize', fit); fit();

// ---------- input ----------
let held = null;
cv.addEventListener('pointerdown', ev => {
  const r = cv.getBoundingClientRect(), lx = (ev.clientX - r.left) / r.width * W, ly = (ev.clientY - r.top) / r.height * H;
  Snd.init();
  if (G.mode === 'world') worldTap(lx, ly);
});
// Skip the intro on click (not pointerdown), so the same tap cannot also press a profile card.
cv.addEventListener('click', () => { if (G.mode === 'title' && G.intro.state === 'play') showMenu(); });
const DIRS = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] };
window.addEventListener('keydown', ev => {
  if (ev.target && ev.target.tagName === 'INPUT') return;
  if (DIRS[ev.key]) { held = DIRS[ev.key]; ev.preventDefault(); }
  if ((ev.key === 'Enter' || ev.key === ' ') && dlg) { advanceDialog(); ev.preventDefault(); }
});
window.addEventListener('keyup', ev => { if (DIRS[ev.key] && held === DIRS[ev.key]) held = null; });
$('btnStart').innerHTML = '▶ ' + zh(ZT.start);
$('btnStart').addEventListener('click', startIntro);
$('btnReset').addEventListener('click', resetGate);
$('btnBag').addEventListener('click', () => { if (!G.busy && !dlg) { Snd.play('tap'); bagPanel(); } });
$('btnTeam').addEventListener('click', () => { if (!G.busy && !dlg) { Snd.play('tap'); teamPanel(); } });
$('btnQuest').addEventListener('click', () => { if (!G.busy && !dlg) { Snd.play('tap'); questPanel(); } });
$('btnExit').addEventListener('click', () => { if (!G.busy && !dlg) { Snd.play('tap'); goTitle(); } });
for (const id of ['btnSound', 'btnSound2']) $(id).addEventListener('click', () => { Snd.init(); Snd.setMuted(!Snd.isMuted()); $('btnSound').textContent = $('btnSound2').textContent = Snd.isMuted() ? '🔇' : '🔊'; });
$('btnSound2').textContent = Snd.isMuted() ? '🔇' : '🔊';

// Expose for automated playtests. Harmless for players.
window.__test = {
  G, save: () => S,
  state: () => ({ cloud: Cloud.ready, music: Snd.track(), screen: G.mode, intro: G.intro.state, world: G.world, kid, dialog: !!dlg, panel: panelOpen(), question: QS ? QS.q : null, battle: G.B ? { enemy: G.B.e.name, hp: G.B.e.hp, lock: G.B.lock } : null, lv: S && S.lv, hp: S && S.hp, done: !!(S && S.won) }),
  fast: on => { G.fast = on; },
  warp: id => loadWorld(id, true),
  wild: () => wildBattle(),
  solve() { this.step(); },
  step() {
    if (G.mode === 'title') { if (G.intro.state === 'wait') return startIntro(); if (G.intro.state === 'play') return showMenu(); return pickKid('nora'); }
    if (G.mode === 'create') { crStep = 2; return $('btnBegin').click(); }
    if (QS) { if (QS.done) { if (!$('qNext').hidden) $('qNext').click(); return; } const q = QS.q; if (q.type === 'order') q.correct.forEach(i => pickAnswer(i)); else pickAnswer(q.answer); return; }
    if (dlg) return advanceDialog();
    if (panelOpen()) { const f = $('btnFinish'); if (f) return f.click(); return closePanel(); }
    if (G.busy) return;
    if (G.mode === 'battle') { if (G.B.lock) return; const l = activeLumi(); let best = 0; for (let t = 0; t < knownMoves(l); t++) if (!G.B.rest[t]) best = t; if (movePower(l, best) * elemMult(SPECIES[l.sp].el, G.B.e.el) > heroAtk()) doMove('skill', best); else doMove('strike'); return; }
    if (G.mode === 'world') {
      if (G.world === 'hub') { if (!S.metElder) return interact(G.ents.find(e => e.role === 'elder')); const nx = WORLD_ORDER.find(id => !S.bosses[id]); if (nx) return teleport(nx); return; }
      const q = S.quests[G.world], giver = G.ents.find(e => e.role === 'giver');
      if (S.bosses[G.world]) return teleport('hub');
      if (!q.accepted) return interact(giver);
      const chest = G.ents.find(e => (e.type === 'chest' && !e.open) || (e.type === 'hidden' && !e.gone)); if (chest) return openChest(chest, chest.type === 'hidden');
      if (S.hp < maxHP() * 0.4) { S.hp = maxHP(); }
      const fogE = G.ents.find(e => e.type === 'fog' && !e.gone); if (q.kills < 3 && fogE) return interact(fogE);
      const boss = G.ents.find(e => e.type === 'boss' && !e.gone); if (boss) return interact(boss);
    }
  },
};
watchWords();
function onCloudReady() { if (G.mode === 'title' && !$('menu').hidden) profileCards(); }
cloudInit();
requestAnimationFrame(frame);
