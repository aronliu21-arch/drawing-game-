// Sanity checks for Lumi Quest content (no browser): node lumi-quest/tests/check.cjs
const vm = require('vm'), fs = require('fs'), path = require('path');
const src = f => fs.readFileSync(path.join(__dirname, '..', 'src', f), 'utf8');
const Q = vm.runInNewContext(src('questions.js') + ';Q', {});
const { WORLDS } = vm.runInNewContext(src('data.js') + ';({WORLDS})', {});
let bad = 0; const fail = (...m) => { bad++; console.log('FAIL', ...m); };

// 1. Every generated question has one right answer, distinct choices and no broken text.
for (const kid of ['nora', 'lucas']) for (const s of ['math', 'science', 'geo', 'logic', 'zh', 'mix']) {
  const seen = {};
  for (let i = 0; i < 500; i++) {
    const q = Q.next(s, kid, seen);
    if (/NaN|undefined/.test(JSON.stringify(q))) fail('broken text', kid, s, q.id);
    if (q.type === 'order') { const v = q.correct.map(k => parseFloat(q.items[k])); if (new Set(q.items).size !== q.items.length || v.some((x, k) => k && x <= v[k - 1])) fail('order', q.id); }
    else if (new Set(q.choices).size !== q.choices.length || q.answer < 0 || (q.type === 'mc' && q.choices.length !== 4)) fail('choices', kid, s, q.id, q.choices);
  }
}
// 2. Nora sees no repeats until a bank runs out.
{ const seen = {}, ids = new Set(); for (let i = 0; i < 60; i++) { const q = Q.next('science', 'nora', seen); if (ids.has(q.id)) fail('Nora repeat', q.id); ids.add(q.id); } }

// 3. Maps are 24x16, everything is reachable, and bosses sit behind the fog wall.
const solid = 'TWRHCNnEBSIL', N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
function flood(m, start, extra) { const seen = new Set([start + '']), q = [start]; while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of N4) { const ch = (m[y + dy] || '')[x + dx], k = (x + dx) + ',' + (y + dy); if (!ch || (solid + extra).includes(ch) || seen.has(k)) continue; seen.add(k); q.push([x + dx, y + dy]); } } return seen; }
for (const [id, w] of Object.entries(WORLDS)) {
  const m = w.map; if (m.length !== 16 || m.some(r => r.length !== 24)) fail(id, 'map size');
  let start, chests = 0; m.forEach((r, y) => [...r].forEach((ch, x) => { if (ch === 'P') start = [x, y]; if (ch === 'G' && id !== 'hub') start = [x + 1, y]; if (ch === 'C' || ch === 'c') chests++; }));
  if (chests !== w.chests.length) fail(id, 'chest count', chests, w.chests.length);
  const all = flood(m, start, ''), open = flood(m, start, 'F');
  m.forEach((r, y) => [...r].forEach((ch, x) => {
    const near = set => N4.some(([dx, dy]) => set.has((x + dx) + ',' + (y + dy)));
    if ('CNnEBSIL'.includes(ch) && !near(all)) fail(id, 'unreachable', ch, x, y);
    if ('cGF'.includes(ch) && !all.has(x + ',' + y)) fail(id, 'unreachable', ch, x, y);
    if (ch === 'B' && near(open)) fail(id, 'boss reachable without clearing the fog wall');
  }));
}
console.log(bad ? `${bad} problems` : 'lumi-quest content ok'); process.exit(bad ? 1 : 0);
