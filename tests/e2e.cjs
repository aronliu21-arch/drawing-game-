// End-to-end playtest: 3 browsers (MacBook, iPad, iPhone sizes) play a full
// 1-round game through the real network code.
//   node tests/e2e.cjs            → home Wi-Fi relay mode (starts server/server.mjs)
//   MODE=p2p node tests/e2e.cjs   → peer-to-peer mode against a local PeerJS server on :9001
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const MODE = process.env.MODE || 'relay';
const PORT = 8790;
const OUT = process.env.OUT || path.join(__dirname, '..', 'out');
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];
const ALL = {};

(async () => {
  const srv = spawn('node', [path.join(__dirname, '..', 'server', 'server.mjs')], { env: { ...process.env, PORT: String(PORT) }, stdio: 'pipe' });
  await sleep(600);
  const q = MODE === 'p2p' ? '?peer=localhost:9001' : '?net=relay';
  const base = `http://localhost:${PORT}/${q}`;
  const browser = await chromium.launch();
  const mk = async (name, viewport, extra = {}) => {
    const ctx = await browser.newContext({ viewport, hasTouch: true, ...extra });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(`${name}: ${e.message}`));
    page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) errors.push(`${name} console: ${m.text()}`); });
    await page.goto(base);
    ALL[name] = page;
    return page;
  };
  const dad = await mk('dad', { width: 1280, height: 800 });
  const ipad = await mk('ipad', { width: 1180, height: 820 });
  const phone = await mk('phone', { width: 844, height: 390 }, { isMobile: true, deviceScaleFactor: 1 });

  const setup = async (page, name, level, colorIdx) => {
    await page.fill('#name', name);
    await page.click(`#levels button[data-level="${level}"]`);
    await page.click(`#colors button:nth-child(${colorIdx})`);
  };
  await setup(dad, 'Dad', 'adult', 3);
  await setup(ipad, 'Kid A', 'g34', 1);
  await setup(phone, 'Kid B', 'g12', 2);
  await dad.screenshot({ path: `${OUT}/1-home.png` });

  await dad.click('#btn-create');
  await dad.waitForFunction(() => window.__test.state().code, null, { timeout: 20000 });
  const code = await dad.evaluate(() => window.__test.state().code);
  console.log('room', code);
  for (const p of [ipad, phone]) { await p.fill('#join-code', code); await p.click('#join-form button'); }
  await dad.waitForFunction(() => (window.__test.state().players || []).length === 3, null, { timeout: 20000 });
  await dad.selectOption('#set-rounds', '1');
  await dad.selectOption('#set-time', '60');
  await sleep(300);
  await dad.screenshot({ path: `${OUT}/2-lobby-host.png` });
  await ipad.screenshot({ path: `${OUT}/2-lobby-guest.png` });

  // wrong code shows a friendly message
  const stray = await mk('stray', { width: 800, height: 700 });
  await stray.fill('#name', 'X'); await stray.fill('#join-code', code === '9999' ? '9998' : '9999'); await stray.click('#join-form button');
  await stray.waitForFunction(() => /No room|Could not/.test(document.querySelector('#home-msg').textContent), null, { timeout: 20000 });
  await stray.close();

  await dad.click('#btn-start');
  const pages = { dad, ipad, phone };
  const levelOf = { dad: 'adult', ipad: 'g34', phone: 'g12' };
  const { WORDS } = await import('../js/words.js');

  for (let turn = 0; turn < 3; turn++) {
    // find the drawer
    let drawer = null;
    for (let i = 0; i < 100 && !drawer; i++) {
      for (const [n, p] of Object.entries(pages)) {
        const s = await p.evaluate(() => window.__test.state());
        if (s.isDrawer && s.phase === 'choose' && s.choices) drawer = n;
      }
      if (!drawer) await sleep(100);
    }
    if (!drawer) throw new Error('no drawer on turn ' + turn);
    const dp = pages[drawer];
    const ch = await dp.evaluate(() => window.__test.state().choices);
    for (const w of ch) if (!WORDS[levelOf[drawer]].includes(w)) throw new Error(`${drawer} got off-level word ${w}`);
    if (turn === 0) await dp.screenshot({ path: `${OUT}/3-choose-${drawer}.png` });
    await dp.click('.choice .pick >> nth=0');
    await dp.waitForFunction(() => window.__test.state().phase === 'draw' && window.__test.state().word);
    const word = await dp.evaluate(() => window.__test.state().word);
    console.log(`turn ${turn + 1}: ${drawer} draws "${word}"`);

    // draw a smiley with the mouse/finger, then fill
    const box = await dp.locator('#board').boundingBox();
    const cx = box.x + box.width / 2, cy = box.y + box.height / 2, r = box.height * 0.3;
    await dp.mouse.move(cx + r, cy); await dp.mouse.down();
    for (let a = 0; a <= 64; a++) await dp.mouse.move(cx + r * Math.cos((a / 64) * Math.PI * 2), cy + r * Math.sin((a / 64) * Math.PI * 2));
    await dp.mouse.up();
    await dp.click('#t-color'); await dp.click('#palette button:nth-child(7)');
    await dp.click('[data-tool="fill"]');
    await dp.mouse.click(cx, cy);
    await dp.click('[data-tool="pen"]');
    await dp.click('#t-color'); await dp.click('#palette button:nth-child(1)');
    await dp.mouse.move(cx - r * 0.5, cy + r * 0.3); await dp.mouse.down(); await dp.mouse.move(cx, cy + r * 0.6, { steps: 8 }); await dp.mouse.move(cx + r * 0.5, cy + r * 0.3, { steps: 8 }); await dp.mouse.up();
    // a stroke that gets undone
    await dp.mouse.move(box.x + 10, box.y + 10); await dp.mouse.down(); await dp.mouse.move(box.x + 100, box.y + 100, { steps: 5 }); await dp.mouse.up();
    await dp.click('#t-undo');
    await sleep(400);
    if (drawer === 'phone') { await dp.screenshot({ path: `${OUT}/4b-phone-drawing.png` }); await dp.click('#t-color'); await dp.screenshot({ path: `${OUT}/4c-phone-palette.png` }); await dp.click('#palette button:nth-child(1)'); }

    const guessers = Object.entries(pages).filter(([n]) => n !== drawer);
    // everyone's board matches the drawer's pixels
    const px = async (p) => p.evaluate(() => { const c = document.querySelector('#board').getContext('2d'); const d = c.getImageData(0, 0, 800, 600).data; let h = 0; for (let i = 0; i < d.length; i += 97) h = (h * 31 + d[i]) >>> 0; return h; });
    const want = await px(dp);
    for (const [n, p] of guessers) {
      let got; for (let i = 0; i < 20; i++) { got = await px(p); if (got === want) break; await sleep(150); }
      if (got !== want) { const dump = async (pg) => pg.evaluate(() => { const d = document.querySelector("#board").getContext("2d").getImageData(0,0,800,600).data; return Array.from(d.filter((_, i) => i % 4 === 0)); }); const a = await dump(dp), b = await dump(p); let diff = 0, first = -1; for (let i = 0; i < a.length; i++) if (Math.abs(a[i]-b[i])>0) { diff++; if (first<0) first=i; } console.log("diff px", diff, "first", first%800, Math.floor(first/800), "ops", await dp.evaluate(() => window.__test.state().ops), await p.evaluate(() => window.__test.state().ops)); throw new Error(`${n} board differs`); }
      const s = await p.evaluate(() => window.__test.state());
      if (s.word) throw new Error(`${n} can see the word before guessing`);
      if (!s.hint || s.hint.replace(/[^_a-z]/gi, '').length !== word.replace(/[^a-z]/g, '').length) throw new Error(`bad hint for ${n}: ${s.hint}`);
    }
    if (turn === 0) for (const [n, p] of [[drawer, dp], ...guessers]) await p.screenshot({ path: `${OUT}/4-draw-${n}.png` });

    // first guesser: a wrong guess, then a kid-spelling of the word; second: exact
    const [g1, g2] = guessers;
    await g1[1].fill('#guess', 'zzzz'); await g1[1].press('#guess', 'Enter');
    const kid = word.length >= 4 ? word.slice(0, -1) : word;
    await g1[1].fill('#guess', kid); await g1[1].press('#guess', 'Enter');
    await g1[1].waitForFunction((w) => window.__test.state().word === w, word, { timeout: 5000 });
    await sleep(200);
    if (turn === 0) await g1[1].screenshot({ path: `${OUT}/5-guessed-${g1[0]}.png` });
    await g2[1].fill('#guess', word.toUpperCase()); await g2[1].press('#guess', 'Enter');
    await dad.waitForFunction(() => window.__test.state().phase === 'reveal', null, { timeout: 5000 });
    await sleep(300);
    if (turn === 0) await phone.screenshot({ path: `${OUT}/6-reveal-phone.png` });
  }
  await dad.waitForFunction(() => window.__test.state().phase === 'over', null, { timeout: 15000 });
  await sleep(1800);
  await dad.screenshot({ path: `${OUT}/7-over-host.png` });
  const scores = await dad.evaluate(() => window.__test.state().players.map((p) => `${p.name}=${p.score}`).join(' '));
  console.log('final', scores);

  // play again → lobby; a guest leaves and the host sees it
  await dad.click('#btn-again');
  await ipad.waitForFunction(() => window.__test.state().phase === 'lobby');
  await phone.click('#btn-leave');
  await dad.waitForFunction(() => window.__test.state().players.length === 2, null, { timeout: 8000 });

  // iPad portrait layout check
  await ipad.setViewportSize({ width: 820, height: 1180 });
  await dad.click('#btn-start');
  await ipad.waitForFunction(() => window.__test.state().phase === 'choose');
  await sleep(400);
  await ipad.screenshot({ path: `${OUT}/8-ipad-portrait.png` });

  await browser.close();
  srv.kill();
  if (errors.length) { console.error('PAGE ERRORS:\n' + errors.join('\n')); process.exit(1); }
  console.log(`e2e (${MODE}) passed`);
})().catch(async (e) => { console.error(e.message.split('\n').slice(0, 3).join('\n'));
  for (const [n, p] of Object.entries(ALL)) { try { await p.screenshot({ path: `${OUT}/fail-${n}.png` }); } catch (x) { /* closed */ } } console.error(errors.join('\n')); process.exit(1); });
