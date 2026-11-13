// Unit tests for the room referee and the word lists. Run: node tests/room.test.mjs
import assert from 'node:assert/strict';
import { Room, checkGuess, maskWord, CHOOSE_MS, REVEAL_MS, CHOICES } from '../js/room.js';
import { WORDS, LEVELS } from '../js/words.js';

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log('ok -', name); };

// ---------- words ----------
test('the Grade 1 list has exactly 200 unique short words', () => {
  const owner = new Map();
  for (const level of Object.keys(LEVELS)) {
    const list = WORDS[level];
    assert.equal(list.length, 200, level);
    assert.equal(new Set(list).size, 200, `${level} has duplicates`);
    for (const w of list) {
      assert.match(w, /^[a-z]+( [a-z]+)*$/, `bad spelling format: ${w}`);
      assert.ok(w.length <= 5, `"${w}" is too long for Grade 1 (5 letters max)`);
      assert.ok(!owner.has(w), `"${w}" is in both ${owner.get(w)} and ${level}`);
      owner.set(w, level);
    }
  }
});

// ---------- guess checking ----------
test('guess checking: exact, case, spaces, kid spellings', () => {
  assert.equal(checkGuess('Cat', 'cat'), 'correct');
  assert.equal(checkGuess('  hotdog ', 'hot dog'), 'correct');
  assert.equal(checkGuess('elefant', 'elephant'), 'correct'); // 2 slips on an 8-letter word
  assert.equal(checkGuess('bat', 'cat'), 'close'); // 3-letter words must be exact
  assert.equal(checkGuess('hous', 'house'), 'correct');
  assert.equal(checkGuess('dog', 'house'), 'wrong');
  assert.equal(checkGuess('', 'house'), 'empty');
  assert.equal(checkGuess('girafe', 'giraffe'), 'correct');
});

test('mask hides letters but keeps spaces', () => {
  assert.equal(maskWord('hot dog', new Set([0])), 'h__ ___');
});

// ---------- room flow ----------
function setup(n = 3) {
  let t = 1000;
  const inbox = {};
  const room = new Room({ code: '1234', hostId: 'p0', now: () => t, rand: () => 0.1, emit: (to, m) => (inbox[to] ||= []).push(m) });
  const levels = ['g12', 'g12', 'g12'];
  for (let i = 0; i < n; i++) room.handle(`p${i}`, { t: 'hello', name: `P${i}`, color: '#7048e8', level: levels[i % 3], seen: [] });
  return { room, inbox, adv: (ms) => { t += ms; room.tick(); }, now: () => t, last: (id, type) => [...(inbox[id] || [])].reverse().find((m) => m.t === type) };
}

test('an old saved level falls back to Grade 1-2', () => {
  const { room } = setup(1);
  room.handle('x', { t: 'hello', name: 'Old', level: 'adult' });
  assert.equal(room.players.get('x').level, 'g12');
});

test('only the host can start, and needs 2 players', () => {
  const { room, last } = setup(1);
  room.handle('p0', { t: 'start' });
  assert.equal(room.phase, 'lobby');
  room.handle('p1', { t: 'hello', name: 'B', level: 'g12' });
  room.handle('p1', { t: 'start' });
  assert.equal(room.phase, 'lobby');
  room.handle('p0', { t: 'start' });
  assert.equal(room.phase, 'choose');
  assert.equal(CHOICES, 5);
  const first = last('p0', 'choices').choices;
  assert.equal(first.length, 5);
  assert.equal(new Set(first).size, 5, 'choices must all be different');
});

test('drawer gets Grade 1-2 words; guessers never see the word', () => {
  const { room, inbox, last } = setup(3);
  room.handle('p0', { t: 'start' });
  const ch = last('p0', 'choices').choices;
  for (const w of ch) assert.ok(WORDS.g12.includes(w));
  room.handle('p0', { t: 'pick', i: 1 });
  assert.equal(room.phase, 'draw');
  assert.equal(last('p0', 'state').word, ch[1]);
  assert.equal(last('p1', 'state').word, null);
  assert.ok(!JSON.stringify(inbox.p1).includes(`"${ch[1]}"`), 'word leaked to a guesser');
  assert.equal(last('p0', 'seen').word, ch[1]);
});

test('correct guesses score, the turn ends when all have guessed, rounds advance', () => {
  const { room, last, adv } = setup(3);
  room.handle('p0', { t: 'start' });
  room.handle('p0', { t: 'pick', i: 0 });
  const word = room.word;
  room.handle('p1', { t: 'guess', text: 'nope' });
  assert.equal(last('p2', 'chat').text, 'nope');
  room.handle('p1', { t: 'guess', text: word.toUpperCase() });
  assert.ok(room.players.get('p1').score >= 100); // fast + first bonus
  assert.equal(room.phase, 'draw');
  // p1 already knows the word: their chat only goes to drawer and other guessers
  room.handle('p1', { t: 'guess', text: 'spoiler' });
  assert.notEqual(last('p2', 'chat').text, 'spoiler');
  assert.equal(last('p0', 'chat').text, 'spoiler');
  adv(10000);
  room.handle('p2', { t: 'guess', text: word });
  assert.equal(room.phase, 'reveal');
  assert.equal(last('p1', 'state').lastWord, word);
  assert.equal(room.players.get('p0').score, 30);
  adv(REVEAL_MS);
  assert.equal(room.phase, 'choose');
  assert.equal(room.drawerId, 'p1');
  for (const w of last('p1', 'choices').choices) assert.ok(WORDS.g12.includes(w));
});

test('hints reveal letters over time, timer ends turn, choose auto-picks', () => {
  const { room, last, adv } = setup(2);
  room.handle('p0', { t: 'start' });
  adv(CHOOSE_MS); // nobody picked
  assert.equal(room.phase, 'draw');
  const hint0 = last('p1', 'state').hint;
  assert.ok(!/[a-z]/.test(hint0));
  adv(room.settings.drawTime * 1000 * 0.5);
  assert.ok(/[a-z]/.test(last('p1', 'state').hint), 'no letter revealed by half time');
  adv(room.settings.drawTime * 1000);
  assert.equal(room.phase, 'reveal');
  assert.equal(room.endReason, 'time');
});

test('game ends after the set rounds; play again resets to lobby', () => {
  const { room, adv } = setup(2);
  room.handle('p0', { t: 'settings', rounds: 1, drawTime: 30 });
  room.handle('p0', { t: 'start' });
  for (let i = 0; i < 2; i++) { room.handle(room.drawerId, { t: 'pick', i: 0 }); adv(30000); adv(REVEAL_MS); }
  assert.equal(room.phase, 'over');
  room.handle('p0', { t: 'again' });
  assert.equal(room.phase, 'lobby');
  assert.equal(room.players.get('p1').score, 0);
});

test('drawing ops relay to others, undo removes the last stroke', () => {
  const { room, last } = setup(2);
  room.handle('p0', { t: 'start' });
  room.handle('p0', { t: 'pick', i: 0 });
  room.handle('p0', { t: 'draw', ops: [{ t: 's', id: 'a', c: '#000000', w: 4, p: [1, 2] }, { t: 'a', id: 'a', p: [3, 4] }] });
  room.handle('p0', { t: 'draw', ops: [{ t: 's', id: 'b', c: '#000000', w: 4, p: [1, 2] }] });
  room.handle('p1', { t: 'draw', ops: [{ t: 'c', id: 'x' }] }); // guessers cannot draw
  assert.equal(room.ops.length, 3);
  room.handle('p0', { t: 'draw', ops: [{ t: 'u' }] });
  assert.equal(room.ops.length, 2);
  room.handle('p0', { t: 'draw', ops: [{ t: 'sh', id: 'z', k: 'star', c: '#000000', w: 4, x1: 10, y1: 10, x2: 90, y2: 90 }] });
  assert.equal(room.ops.length, 3);
  room.handle('p0', { t: 'draw', ops: [{ t: 'u' }] });
  assert.equal(room.ops.length, 2, 'undo removes the last shape');
  assert.deepEqual(last('p1', 'draw').ops, [{ t: 'u' }]);
});

test('drawer leaving ends the turn; dropping to 1 player returns to lobby', () => {
  const { room } = setup(3);
  room.handle('p0', { t: 'start' });
  room.handle('p0', { t: 'pick', i: 0 });
  room.leave('p0');
  assert.equal(room.phase, 'reveal');
  room.leave('p2');
  assert.equal(room.phase, 'lobby');
  assert.equal(room.players.size, 1);
});

test('reconnecting player keeps score and gets the drawing', () => {
  const { room, last } = setup(2);
  room.handle('p0', { t: 'start' });
  room.handle('p0', { t: 'pick', i: 0 });
  room.handle('p0', { t: 'draw', ops: [{ t: 's', id: 'a', c: '#000000', w: 4, p: [1, 2] }] });
  room.handle('p1', { t: 'guess', text: room.word });
  // p1 guessed → turn ended (only guesser). Start next turn and drop/rejoin p1.
  const score = room.players.get('p1').score;
  room.players.get('p1').connected = false;
  room.handle('p1', { t: 'hello', name: 'P1', level: 'g34' });
  assert.equal(room.players.get('p1').score, score);
  assert.ok(last('p1', 'sync'));
});

test('seen words are skipped, then the list starts over', () => {
  let t = 0; const inbox = {};
  const room = new Room({ code: '1', hostId: 'a', now: () => t, emit: (to, m) => (inbox[to] ||= []).push(m), words: { g12: ['one', 'two', 'three', 'four', 'five', 'six'] } });
  room.handle('a', { t: 'hello', name: 'A', level: 'g12', seen: ['one'] });
  room.handle('b', { t: 'hello', name: 'B', level: 'g12' });
  room.handle('a', { t: 'start' });
  assert.ok(!room.choices.includes('one'));
  room.handle('a', { t: 'hello', name: 'A', level: 'g12', seen: ['two', 'three'] });
  assert.equal(room.pickChoices(room.players.get('a')).length, 5);
  assert.ok(inbox.a.some((m) => m.t === 'seenReset'));
});

console.log(`\n${passed} tests passed`);
