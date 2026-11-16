// Question engine. Every world has its own subject and its own style of question.
// Each question: {id, type:'mc'|'tf'|'order', q, choices?, answer?, items?, correct?, why, big?, sub?}
const Q = (() => {
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  function mc(id, q, ans, wrongs, why, extra) {
    const choices = shuffle([String(ans), ...wrongs.map(String)]);
    return Object.assign({ id, type: 'mc', q, choices, answer: choices.indexOf(String(ans)), why }, extra || {});
  }
  // Number answer with three believable wrong numbers.
  function num(id, q, ans, why, opts) {
    opts = opts || {};
    const deltas = shuffle(opts.deltas || [1, -1, 2, -2, 10, -10, 5, -5, 3, -3, 11, -9]);
    const wrongs = [];
    for (const d of deltas) {
      const w = ans + d;
      if (w >= (opts.min ?? 0) && w !== ans && !wrongs.includes(w)) wrongs.push(w);
      if (wrongs.length === 3) break;
    }
    const f = opts.fmt || (x => String(x));
    return mc(id, q, f(ans), wrongs.map(f), why);
  }
  function tf(id, q, truth, why) {
    return { id, type: 'tf', q, choices: ['Fact', 'Fib'], answer: truth ? 0 : 1, why };
  }
  function order(id, q, values, fmt, why) {
    const items = shuffle(values);
    const sorted = values.slice().sort((a, b) => a - b);
    // keep shuffling if it came out already sorted
    if (items.every((v, i) => v === sorted[i])) items.reverse();
    return { id, type: 'order', q, items: items.map(fmt || String), correct: sorted.map(v => items.indexOf(v)), why: why || ('In order: ' + sorted.map(fmt || String).join(', ')) };
  }

  // ---------- World 1: Numberwood (maths) ----------
  const mathLucas = [
    () => { const a = R(12, 68), b = R(4, 29); return num(`mL+${a},${b}`, `${a} + ${b} = ?`, a + b, `${a} + ${b} = ${a + b}.`); },
    () => { const a = R(25, 95), b = R(4, 19); return num(`mL-${a},${b}`, `${a} − ${b} = ?`, a - b, `${a} − ${b} = ${a - b}.`); },
    () => { const a = R(6, 40), c = a + R(5, 30); return num(`mL?${a},${c}`, `${a} + ? = ${c}`, c - a, `${c} − ${a} = ${c - a}, so ${a} + ${c - a} = ${c}.`); },
    () => { const n = pick([2, 3, 5, 10]), m = R(2, 10); return num(`mLx${n},${m}`, `${m} groups of ${n} berries. How many berries?`, n * m, `${m} × ${n} = ${n * m}.`, { deltas: [n, -n, 1, -1, 2, -2] }); },
    () => { const a = R(8, 20), b = R(5, 15), c = R(3, 9); return num(`mLw${a},${b},${c}`, `A Lumi found ${a} berries in the morning and ${b} in the afternoon. It ate ${c}. How many are left?`, a + b - c, `${a} + ${b} = ${a + b}, then ${a + b} − ${c} = ${a + b - c}.`); },
    () => { const n = R(6, 34) * 2; return num(`mLh${n}`, `What is half of ${n}?`, n / 2, `${n / 2} + ${n / 2} = ${n}.`); },
    () => { const a = R(11, 45), b = pick([50, 60, 80, 100].filter(x => x > a)); return num(`mLc${a},${b}`, `A potion costs ${a} coins. You pay with ${b} coins. How much change?`, b - a, `${b} − ${a} = ${b - a}.`); },
    () => { const t = R(2, 9), o = R(1, 9); return mc(`mLt${t},${o}`, `Which number has ${t} tens and ${o} ones?`, t * 10 + o, [o * 10 + t === t * 10 + o ? t * 10 + o + 10 : o * 10 + t, t + o, t * 10 + o + 1].filter((v, i, a) => a.indexOf(v) === i && v !== t * 10 + o).concat([t * 100 + o, t * 10 + o + 2]).slice(0, 3), `${t} tens is ${t * 10}, plus ${o} more makes ${t * 10 + o}.`); },
    () => { const n = R(3, 12); return num(`mLd${n}`, `Double ${n}, then add 1. What do you get?`, n * 2 + 1, `Double ${n} is ${n * 2}. One more is ${n * 2 + 1}.`); },
    () => { const a = R(3, 9), b = R(3, 9), c = R(2, 9); return num(`mL3${a},${b},${c}`, `${a} + ${b} + ${c} = ?`, a + b + c, `${a} + ${b} = ${a + b}, and ${a + b} + ${c} = ${a + b + c}.`); },
  ];
  const fmtTime = m => { m = ((m % 720) + 720) % 720; const h = Math.floor(m / 60) || 12; return h + ':' + String(m % 60).padStart(2, '0'); };
  const mathNora = [
    () => { const a = R(13, 89), b = R(3, 9); return num(`mNx${a},${b}`, `${a} × ${b} = ?`, a * b, `${a} × ${b} = ${a * b}.`, { deltas: [b, -b, 10, -10, a, -a, 2, -2] }); },
    () => { const d = R(4, 9), q = R(5, 12), r = R(1, d - 1); const n = d * q + r; return num(`mNr${n},${d}`, `${n} berries are shared equally among ${d} Lumis. How many berries are left over?`, r, `${d} × ${q} = ${d * q}, and ${n} − ${d * q} = ${r}.`, { deltas: [1, -1, 2, -2, 3, -3] }); },
    () => { const den = pick([3, 4, 5, 6, 8]), nu = R(2, den - 1), k = R(3, 12); return num(`mNf${nu},${den},${k}`, `What is ${nu}/${den} of ${den * k}?`, nu * k, `${den * k} ÷ ${den} = ${k}, and ${k} × ${nu} = ${nu * k}.`, { deltas: [k, -k, 1, -1, nu, -nu, 2] }); },
    () => { const r = R(2, 9), c = R(2, 9); const h = r + c, l = 4 * r + 2 * c; return num(`mNhl${r},${c}`, `A farm has only chickens and rabbits: ${h} heads and ${l} legs. How many rabbits are there?`, r, `If all ${h} were chickens there would be ${2 * h} legs. The extra ${l - 2 * h} legs come in pairs from rabbits: ${l - 2 * h} ÷ 2 = ${r}.`, { deltas: [1, -1, 2, -2, c - r || 3, 3] }); },
    () => { const x = R(4, 15), m = R(2, 6), a = R(3, 12); return num(`mNt${x},${m},${a}`, `I think of a number, multiply it by ${m}, then add ${a}. I get ${x * m + a}. What was my number?`, x, `${x * m + a} − ${a} = ${x * m}, and ${x * m} ÷ ${m} = ${x}.`, { deltas: [1, -1, 2, -2, 3, m] }); },
    () => { const l = R(7, 18), w = R(3, l - 1); return num(`mNp${l},${w}`, `A rectangle has a perimeter of ${2 * (l + w)} cm. Its length is ${l} cm. What is its width?`, w, `Half the perimeter is ${l + w}. ${l + w} − ${l} = ${w} cm.`, { deltas: [1, -1, 2, -2, l - w, w], fmt: x => x + ' cm' }); },
    () => { const st = R(1, 11) * 60 + pick([15, 30, 40, 45, 50]), d = pick([35, 50, 75, 80, 95, 110]); return mc(`mNc${st},${d}`, `A quest starts at ${fmtTime(st)} and lasts ${d} minutes. When does it end?`, fmtTime(st + d), [fmtTime(st + d + 10), fmtTime(st + d - 15), fmtTime(st + d + 60)], `${d} minutes after ${fmtTime(st)} is ${fmtTime(st + d)}.`); },
    () => { const t = R(5, 14), d = R(2, 7); return num(`mNa${t},${d}`, `Mia is ${d} years older than Tom. Together their ages add up to ${2 * t + d}. How old is Tom?`, t, `Take away the ${d} extra years: ${2 * t + d} − ${d} = ${2 * t}. Half of ${2 * t} is ${t}.`, { deltas: [1, -1, d, 2, -2, t + d - t] }); },
    () => { const n = R(8, 40); return num(`mNs${n}`, `Three numbers in a row (like 4, 5, 6) add up to ${3 * n}. What is the largest of the three?`, n + 1, `The middle number is ${3 * n} ÷ 3 = ${n}, so the largest is ${n + 1}.`, { deltas: [-1, 1, -2, 2, 3] }); },
    () => { const k = R(3, 9); return num(`mNdg${k}`, `How many two-digit numbers have digits that add up to ${k}?`, k, `The tens digit can be 1 to ${k}, and each gives one number (${k >= 2 ? '1' + (k - 1) + ', 2' + (k - 2) + ', …, ' + k + '0' : '10'}). That is ${k} numbers.`, { deltas: [1, -1, 2, -2, 3] }); },
    () => { const p = R(4, 15), a = R(2, 5), b = R(6, 9); return num(`mNu${p},${a},${b}`, `${a} capture orbs cost ${p * a} coins. How much do ${b} orbs cost?`, p * b, `One orb costs ${p * a} ÷ ${a} = ${p} coins. ${b} × ${p} = ${p * b}.`, { deltas: [p, -p, 2 * p, a, -a, 10] }); },
    () => { const a = R(4, 20), b = R(3, 9), c = R(3, 9); return num(`mNo${a},${b},${c}`, `${a} + ${b} × ${c} = ?`, a + b * c, `Multiply first: ${b} × ${c} = ${b * c}. Then ${a} + ${b * c} = ${a + b * c}.`, { deltas: [(a + b) * c - (a + b * c), 1, -1, b, -b, 10] }); },
  ];

  // ---------- World 4: Clockwork Canyon (logic and patterns) ----------
  const EMO = ['🔴', '🔵', '🟡', '🟢', '⭐', '🌙', '🔺', '🟪'];
  const CATS = { fruit: ['🍎', '🍌', '🍇', '🍓', '🍊', '🍐'], animal: ['🐶', '🐱', '🐰', '🐸', '🐴', '🐷'], ride: ['🚗', '🚌', '🚲', '🚂', '🚁', '⛵'], sky: ['☀️', '🌙', '⭐', '☁️', '🌈', '⚡'] };
  const CATNAME = { fruit: 'fruits', animal: 'animals', ride: 'things you ride', sky: 'things in the sky' };
  const logicLucas = [
    () => { const s = R(1, 30), d = pick([2, 3, 5, 10]); const seq = [0, 1, 2, 3].map(i => s + i * d); return num(`lLs${s},${d}`, `What comes next?  ${seq.join(', ')}, ?`, s + 4 * d, `The numbers go up by ${d} each time.`, { deltas: [1, -1, d, -d, 2, -2] }); },
    () => { const d = pick([2, 5, 10]), s = R(5, 9) * d + R(0, 4); const seq = [0, 1, 2, 3].map(i => s - i * d); return num(`lLb${s},${d}`, `What comes next?  ${seq.join(', ')}, ?`, s - 4 * d, `The numbers go down by ${d} each time.`, { deltas: [1, -1, d, 2, -2, 3] }); },
    () => { const pat = pick(['AB', 'AAB', 'ABC', 'ABB', 'AABB']); const e = shuffle(EMO).slice(0, 4); const m = { A: e[0], B: e[1], C: e[2] }; const len = pat.length * 2 + R(1, pat.length); let s = ''; for (let i = 0; i < len; i++) s += m[pat[i % pat.length]] + ' '; const ans = m[pat[len % pat.length]]; return mc(`lLp${pat}${len}${e.join('')}`, `What comes next in the pattern?`, ans, e.filter(x => x !== ans).slice(0, 3), `The pattern repeats: ${pat.split('').map(c => m[c]).join(' ')}.`, { big: s + '❓', bigSmall: true }); },
    () => { const set = new Set(); while (set.size < 4) set.add(R(1, 99)); const v = [...set]; return order(`lLo${v.join(',')}`, 'Tap the numbers from smallest to biggest.', v); },
    () => { const [c1, c2] = shuffle(Object.keys(CATS)); const three = shuffle(CATS[c1]).slice(0, 3), odd = pick(CATS[c2]); return mc(`lLx${three.join('')}${odd}`, 'Which one does not belong?', odd, three, `The other three are all ${CATNAME[c1]}.`, { emoji: true }); },
    () => { const sh = shuffle([['triangle', 3], ['square', 4], ['pentagon', 5], ['hexagon', 6], ['octagon', 8]]).slice(0, 4); const most = Math.random() < 0.5; const best = sh.slice().sort((a, b) => most ? b[1] - a[1] : a[1] - b[1])[0]; return mc(`lLg${most}${sh.map(s => s[1]).join('')}`, `Which shape has the ${most ? 'most' : 'fewest'} sides?`, best[0], sh.filter(s => s !== best).map(s => s[0]), `${best[0][0].toUpperCase()+best[0].slice(1)}: ${best[1]} sides.`); },
    () => { const a = R(2, 9), b = R(2, 9), e = shuffle(CATS.fruit); return num(`lLq${a},${b}`, `${e[0]} = ${a}   and   ${e[1]} = ${b}.   What is ${e[0]} + ${e[1]} + ${e[0]}?`, 2 * a + b, `${a} + ${b} + ${a} = ${2 * a + b}.`, { deltas: [1, -1, a, -a, b, 2] }); },
  ];
  const NAMES = ['Ava', 'Ben', 'Cy', 'Dee', 'Eli', 'Fay', 'Gus', 'Hana'];
  const WORDS = ['CAB', 'BEE', 'ACE', 'DAD', 'BAG', 'FED', 'HEN', 'JAM', 'KID', 'ICE', 'FIG', 'GEM', 'BED', 'CAGE', 'BEAD', 'FACE', 'HIDE', 'DICE'];
  const logicNora = [
    () => {
      const kind = pick(['geo', 'tri', 'sq', 'fib', 'alt']);
      let seq, next, why;
      if (kind === 'geo') { const m = pick([2, 3]), s = R(1, 5); seq = [0, 1, 2, 3].map(i => s * m ** i); next = s * m ** 4; why = `Each number is ${m} times the one before.`; }
      else if (kind === 'tri') { const s = R(1, 12), d0 = R(1, 4); seq = [s]; let d = d0; for (let i = 0; i < 4; i++) { seq.push(seq[i] + d); d++; } next = seq[4] + d; why = `The jumps grow by 1 each time: +${d0}, +${d0 + 1}, +${d0 + 2}, +${d0 + 3}, then +${d0 + 4}.`; }
      else if (kind === 'sq') { const s = R(1, 6); seq = [0, 1, 2, 3].map(i => (s + i) ** 2); next = (s + 4) ** 2; why = `These are square numbers: ${s}×${s}, ${s + 1}×${s + 1}, … so next is ${s + 4}×${s + 4}.`; }
      else if (kind === 'fib') { const a = R(1, 5), b = R(2, 7); seq = [a, b]; for (let i = 2; i < 5; i++) seq.push(seq[i - 1] + seq[i - 2]); next = seq[4] + seq[3]; why = 'Each number is the sum of the two before it.'; }
      else { const s = R(10, 30), up = R(5, 9), dn = R(1, 4); seq = [s]; for (let i = 0; i < 4; i++) seq.push(seq[i] + (i % 2 ? -dn : up)); next = seq[4] + up; why = `The pattern is +${up}, −${dn}, +${up}, −${dn}, so next is +${up}.`; }
      return num(`lNs${kind}${seq.join(',')}`, `What comes next?  ${seq.join(', ')}, ?`, next, why, { deltas: [1, -1, 2, -2, 3, -3, 4] });
    },
    () => { const dec = Math.random() < 0.5; const set = new Set(); if (dec) { while (set.size < 5) set.add(R(1, 99)); return order(`lNod${[...set].join(',')}`, 'Tap the numbers from smallest to biggest.', [...set].map(v => v / 100), v => String(v)); } const base = R(1, 8) * 1000 + R(0, 9) * 100; while (set.size < 5) set.add(base + R(0, 99)); return order(`lNo${[...set].join(',')}`, 'Tap the numbers from smallest to biggest.', [...set]); },
    () => { const a = R(3, 12), b = R(2, 12), e = shuffle(CATS.fruit); return num(`lNb${a},${b}`, `${e[0]} + ${e[0]} + ${e[1]} = ${2 * a + b}   and   ${e[0]} + ${e[1]} = ${a + b}.   What is ${e[0]} worth?`, a, `The first line has one extra ${e[0]}: ${2 * a + b} − ${a + b} = ${a}.`, { deltas: [1, -1, 2, -2, b - a || 3, 3] }); },
    () => { const n = shuffle(NAMES).slice(0, 4); const facts = shuffle([0, 1, 2].map(i => `${n[i]} is taller than ${n[i + 1]}.`)); const ask = pick([['tallest', 0], ['shortest', 3], ['second tallest', 1]]); return mc(`lNh${n.join('')}${ask[1]}`, `${facts.join(' ')} Who is the ${ask[0]}?`, n[ask[1]], n.filter((_, i) => i !== ask[1]), `From tallest to shortest: ${n.join(', ')}.`); },
    () => { const k = pick([3, 4, 6, 7, 8, 9]); const set = new Set(); while (set.size < 3) set.add(k * R(3, 12)); let odd; do { odd = R(k * 3, k * 12); } while (odd % k === 0); return mc(`lNm${k},${[...set].join(',')},${odd}`, `Three of these numbers are multiples of ${k}. Which one is not?`, odd, [...set], `${[...set].join(', ')} are all in the ${k} times table. ${odd} is not.`); },
    () => { const w = pick(WORDS); const s = w.split('').reduce((t, c) => t + c.charCodeAt(0) - 64, 0); return num(`lNw${w}`, `Secret code: A=1, B=2, C=3, and so on. What does the word ${w} add up to?`, s, `${w.split('').map(c => c + '=' + (c.charCodeAt(0) - 64)).join(', ')}. Total ${s}.`, { deltas: [1, -1, 2, -2, 3, -3] }); },
    () => { const a = R(2, 6), b = R(2, 5), c = R(2, 4); return num(`lNpath${a},${b},${c}`, `A menu has ${a} soups, ${b} main dishes and ${c} desserts. How many different meals of one soup, one main and one dessert can you make?`, a * b * c, `${a} × ${b} × ${c} = ${a * b * c}.`, { deltas: [a + b + c - a * b * c, a, -a, b, 2, -2, 1, -1, 4, 3].filter(d => d) }); },
  ];

  // ---------- World 2: Coral Cove (science, "Fact or Fib") ----------
  // [id, level, type, question, answer, wrongs, why]
  const SCI = [
    ['s1', 'L', 'tf', 'A spider has 8 legs.', true, 0, 'Spiders have 8 legs. Insects have 6.'],
    ['s2', 'L', 'tf', 'The Sun is a star.', true, 0, 'The Sun is the star closest to Earth.'],
    ['s3', 'L', 'tf', 'Fish use gills to breathe under water.', true, 0, 'Gills take oxygen out of the water.'],
    ['s4', 'L', 'mc', 'What does a caterpillar turn into?', 'A butterfly or moth', ['A frog', 'A bee', 'A bird'], 'A caterpillar makes a cocoon or chrysalis and comes out with wings.'],
    ['s5', 'L', 'mc', 'Which animal is a mammal?', 'Dolphin', ['Shark', 'Penguin', 'Turtle'], 'Dolphins breathe air and feed milk to their babies.'],
    ['s6', 'L', 'mc', 'What do plants need to make their food?', 'Sunlight', ['Moonlight', 'Sand', 'Wind'], 'Leaves use sunlight, water and air to make food.'],
    ['s7', 'L', 'tf', 'Ice is frozen water.', true, 0, 'Water turns into ice when it gets very cold.'],
    ['s8', 'L', 'mc', 'Which is the biggest planet in our solar system?', 'Jupiter', ['Earth', 'Mars', 'Venus'], 'Jupiter is so big that all the other planets could fit inside it.'],
    ['s9', 'L', 'mc', 'How many legs does an insect have?', '6', ['4', '8', '10'], 'All insects have 6 legs.'],
    ['s10', 'L', 'tf', 'Bats are birds.', false, 0, 'Bats are mammals. They have fur, not feathers.'],
    ['s11', 'L', 'mc', 'Which part of a plant takes in water from the soil?', 'Roots', ['Leaves', 'Flowers', 'Seeds'], 'Roots drink water from the soil.'],
    ['s12', 'L', 'mc', 'What is a baby frog called?', 'Tadpole', ['Cub', 'Chick', 'Calf'], 'Tadpoles swim with tails and grow legs later.'],
    ['s13', 'L', 'tf', 'The Moon makes its own light.', false, 0, 'The Moon shines because sunlight bounces off it.'],
    ['s14', 'L', 'mc', 'What do bees collect from flowers?', 'Nectar', ['Leaves', 'Rain', 'Stones'], 'Bees turn nectar into honey.'],
    ['s15', 'L', 'tf', 'Penguins can fly through the air.', false, 0, 'Penguins cannot fly, but they are great swimmers.'],
    ['s16', 'L', 'mc', 'Which animal lays eggs?', 'Chicken', ['Dog', 'Cow', 'Horse'], 'Birds like chickens lay eggs.'],
    ['s17', 'L', 'tf', 'A magnet can pick up a steel paper clip.', true, 0, 'Magnets pull on iron and steel.'],
    ['s18', 'L', 'mc', 'Which season comes right after winter?', 'Spring', ['Summer', 'Autumn', 'Winter again'], 'Winter, spring, summer, autumn.'],
    ['s19', 'L', 'tf', 'Living dinosaurs like T. rex can be seen in zoos today.', false, 0, 'Those dinosaurs died out about 66 million years ago.'],
    ['s20', 'L', 'mc', 'Which animal carries a shell on its back?', 'Turtle', ['Frog', 'Snake', 'Lizard'], 'A turtle\'s shell is part of its body.'],
    ['s21', 'L', 'mc', 'What does a thermometer measure?', 'Temperature', ['Weight', 'Time', 'Length'], 'A thermometer tells how hot or cold something is.'],
    ['s22', 'L', 'mc', 'Which bone protects your brain?', 'Skull', ['Ribs', 'Kneecap', 'Spine'], 'Your skull is like a helmet for your brain.'],
    ['s23', 'L', 'mc', 'What do we call an animal that eats only plants?', 'Herbivore', ['Carnivore', 'Predator', 'Omnivore'], 'Herbivores, like rabbits and cows, eat plants.'],
    ['s24', 'L', 'mc', 'Which gas do we need to breathe in to stay alive?', 'Oxygen', ['Helium', 'Smoke', 'Steam'], 'Our bodies use the oxygen in air.'],
    ['s25', 'L', 'tf', 'Sound can travel through water.', true, 0, 'Whales and dolphins talk to each other under water.'],
    ['s26', 'L', 'mc', 'What do we call water falling from clouds?', 'Rain', ['Steam', 'Dew', 'Fog'], 'Tiny drops in clouds join up and fall as rain.'],
    ['s27', 'L', 'mc', 'Which sense do you use with your nose?', 'Smell', ['Taste', 'Touch', 'Hearing'], 'Your nose smells. Your tongue tastes.'],
    ['s28', 'L', 'tf', 'A snail is faster than a rabbit.', false, 0, 'Snails are some of the slowest animals.'],
    ['s29', 'L', 'mc', 'What does a seed need first to start growing?', 'Water', ['Paint', 'Salt', 'Ice'], 'Water wakes a seed up so it can sprout.'],
    ['s30', 'L', 'mc', 'Which animal can live both in water and on land?', 'Frog', ['Goldfish', 'Eagle', 'Camel'], 'Frogs are amphibians.'],
    ['s40', 'N', 'mc', 'Which planet is known as the Red Planet?', 'Mars', ['Venus', 'Jupiter', 'Mercury'], 'Rusty iron in the soil makes Mars look red.'],
    ['s41', 'N', 'mc', 'What is it called when plants make food from sunlight?', 'Photosynthesis', ['Digestion', 'Evaporation', 'Pollination'], 'Photo means light, and synthesis means making.'],
    ['s42', 'N', 'tf', 'Sound travels faster than light.', false, 0, 'Light is far faster. That is why you see lightning before you hear thunder.'],
    ['s43', 'N', 'mc', 'Which gas do plants take in from the air to make food?', 'Carbon dioxide', ['Oxygen', 'Nitrogen', 'Helium'], 'Plants take in carbon dioxide and give out oxygen.'],
    ['s44', 'N', 'mc', 'Liquid water turning into water vapour is called…', 'Evaporation', ['Condensation', 'Freezing', 'Melting'], 'Evaporation is liquid turning into gas.'],
    ['s45', 'N', 'tf', 'All metals are attracted to magnets.', false, 0, 'Iron and steel are. Aluminium, copper and gold are not.'],
    ['s46', 'N', 'mc', 'About how long does Earth take to travel once around the Sun?', '365 days', ['24 hours', '30 days', '7 days'], 'One trip around the Sun is one year.'],
    ['s47', 'N', 'mc', 'What causes day and night?', 'Earth spinning on its axis', ['Earth moving around the Sun', 'The Moon blocking the Sun', 'Clouds covering the Sun'], 'Earth spins once every 24 hours.'],
    ['s48', 'N', 'mc', 'Which of these is NOT a state of matter?', 'Energy', ['Solid', 'Liquid', 'Gas'], 'Solid, liquid and gas are states of matter.'],
    ['s49', 'N', 'tf', 'A whale is a fish.', false, 0, 'Whales are mammals. They breathe air.'],
    ['s50', 'N', 'mc', 'Which force pulls objects toward the ground?', 'Gravity', ['Friction', 'Magnetism', 'Electricity'], 'Gravity pulls everything toward the centre of the Earth.'],
    ['s51', 'N', 'mc', 'What do we call animals that have a backbone?', 'Vertebrates', ['Invertebrates', 'Insects', 'Molluscs'], 'Fish, birds, reptiles, amphibians and mammals are vertebrates.'],
    ['s52', 'N', 'tf', 'The Moon\'s pull is the main cause of ocean tides.', true, 0, 'The Moon\'s gravity tugs on the oceans.'],
    ['s53', 'N', 'mc', 'Which planet has the biggest, brightest rings?', 'Saturn', ['Mars', 'Venus', 'Mercury'], 'Saturn\'s rings are made of ice and rock.'],
    ['s54', 'N', 'mc', 'At what temperature does pure water freeze?', '0 °C', ['100 °C', '10 °C', '50 °C'], 'Water freezes at 0 °C and boils at 100 °C.'],
    ['s55', 'N', 'mc', 'What is the largest organ of the human body?', 'Skin', ['Heart', 'Liver', 'Brain'], 'Your skin covers and protects your whole body.'],
    ['s56', 'N', 'mc', 'What kind of animal is a frog?', 'Amphibian', ['Reptile', 'Mammal', 'Fish'], 'Amphibians start life in water and can live on land later.'],
    ['s57', 'N', 'mc', 'Which of these is a renewable energy source?', 'Wind', ['Coal', 'Oil', 'Natural gas'], 'Wind never runs out. Coal, oil and gas do.'],
    ['s58', 'N', 'mc', 'What do you call a scientist who studies fossils?', 'Paleontologist', ['Astronomer', 'Chemist', 'Botanist'], 'Paleontologists dig up and study ancient life.'],
    ['s59', 'N', 'tf', 'An octopus has three hearts.', true, 0, 'Two hearts pump blood to the gills and one to the body.'],
    ['s60', 'N', 'mc', 'Which type of rock forms when lava cools?', 'Igneous', ['Sedimentary', 'Metamorphic', 'Fossil'], 'Igneous comes from a word meaning fire.'],
    ['s61', 'N', 'mc', 'Which blood cells help fight germs?', 'White blood cells', ['Red blood cells', 'Platelets', 'Nerve cells'], 'White blood cells are part of your immune system.'],
    ['s62', 'N', 'mc', 'How many bones does an adult human have?', '206', ['106', '306', '52'], 'Babies have more, and some join together as they grow.'],
    ['s63', 'N', 'tf', 'A shark\'s skeleton is made of cartilage, not bone.', true, 0, 'Cartilage is the bendy stuff in your ears and nose.'],
    ['s64', 'N', 'mc', 'What is the centre of an atom called?', 'Nucleus', ['Electron', 'Molecule', 'Cell'], 'Protons and neutrons sit in the nucleus.'],
    ['s65', 'N', 'mc', 'A ramp is which kind of simple machine?', 'Inclined plane', ['Lever', 'Pulley', 'Wheel and axle'], 'An inclined plane is a slope that makes lifting easier.'],
    ['s66', 'N', 'tf', 'The Sun travels around the Earth once a day.', false, 0, 'Earth spins, which makes the Sun seem to move.'],
    ['s67', 'N', 'mc', 'What is a pattern of stars in the sky called?', 'Constellation', ['Galaxy', 'Comet', 'Orbit'], 'Orion and the Big Dipper are star patterns.'],
    ['s68', 'N', 'mc', 'Which gas makes up most of the air around us?', 'Nitrogen', ['Oxygen', 'Carbon dioxide', 'Hydrogen'], 'Air is about 78% nitrogen and 21% oxygen.'],
    ['s69', 'N', 'mc', 'Which organ pumps blood around your body?', 'Heart', ['Lungs', 'Stomach', 'Kidneys'], 'Your heart beats about 100,000 times a day.'],
    ['s70', 'N', 'tf', 'Water vapour turning back into liquid drops is called condensation.', true, 0, 'That is how clouds and morning dew form.'],
    ['s71', 'N', 'mc', 'Which part of a plant makes most of its food?', 'Leaves', ['Roots', 'Stem', 'Flowers'], 'Leaves catch sunlight for photosynthesis.'],
  ];

  // ---------- World 3: Atlas Peaks (geography) ----------
  const GEO = [
    ['g1', 'L', 'mc', 'How many continents are there?', '7', ['5', '6', '8'], 'Asia, Africa, North America, South America, Antarctica, Europe and Australia.'],
    ['g2', 'L', 'mc', 'Which is the largest ocean?', 'Pacific Ocean', ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean'], 'The Pacific covers about a third of the Earth.'],
    ['g3', 'L', 'mc', 'Which ocean is at the very top of the world, around the North Pole?', 'Arctic Ocean', ['Pacific Ocean', 'Indian Ocean', 'Atlantic Ocean'], 'The Arctic Ocean is the smallest and coldest ocean.'],
    ['g4', 'L', 'tf', 'The Earth is shaped like a ball.', true, 0, 'A globe shows the Earth\'s round shape.'],
    ['g5', 'L', 'mc', 'Which direction is the opposite of north?', 'South', ['East', 'West', 'Up'], 'North and south are opposites. So are east and west.'],
    ['g6', 'L', 'mc', 'What do we call land with water all around it?', 'Island', ['Mountain', 'Valley', 'Desert'], 'An island is surrounded by water.'],
    ['g7', 'L', 'mc', 'Which animal lives wild in Australia?', 'Kangaroo', ['Lion', 'Polar bear', 'Giant panda'], 'Kangaroos hop across Australia.'],
    ['g8', 'L', 'mc', 'Where do wild polar bears live?', 'The Arctic', ['Antarctica', 'Africa', 'Australia'], 'Polar bears live near the North Pole. Penguins live far south.'],
    ['g9', 'L', 'tf', 'A desert gets very little rain.', true, 0, 'Deserts are the driest places on Earth.'],
    ['g10', 'L', 'mc', 'In which country are the pyramids of Giza?', 'Egypt', ['Italy', 'China', 'Brazil'], 'The pyramids were built in Egypt about 4,500 years ago.'],
    ['g11', 'L', 'mc', 'On a map, which colour usually shows water?', 'Blue', ['Red', 'Brown', 'Yellow'], 'Oceans, lakes and rivers are drawn in blue.'],
    ['g12', 'L', 'mc', 'In which country do wild giant pandas live?', 'China', ['Japan', 'India', 'Canada'], 'Giant pandas live in bamboo forests in China.'],
    ['g13', 'L', 'tf', 'The Sun rises in the west.', false, 0, 'The Sun rises in the east and sets in the west.'],
    ['g14', 'L', 'mc', 'What is a large stream of flowing water called?', 'River', ['Lake', 'Pond', 'Puddle'], 'Rivers flow toward a lake or the sea.'],
    ['g15', 'L', 'mc', 'Which is the biggest?', 'Continent', ['City', 'Country', 'Village'], 'Villages and cities are inside countries, and countries are on continents.'],
    ['g16', 'L', 'mc', 'On which continent is the Sahara Desert?', 'Africa', ['Asia', 'Australia', 'Europe'], 'The Sahara stretches across northern Africa.'],
    ['g17', 'L', 'mc', 'Which tool shows you which way is north?', 'Compass', ['Ruler', 'Clock', 'Thermometer'], 'A compass needle points north.'],
    ['g18', 'L', 'tf', 'An ocean is bigger than a lake.', true, 0, 'Oceans are the biggest bodies of water on Earth.'],
    ['g19', 'L', 'mc', 'Which country has the Eiffel Tower?', 'France', ['Spain', 'England', 'Italy'], 'The Eiffel Tower is in Paris, France.'],
    ['g20', 'L', 'mc', 'What do we call a mountain that can erupt with lava?', 'Volcano', ['Glacier', 'Canyon', 'Island'], 'Hot melted rock comes out of a volcano.'],
    ['g21', 'L', 'mc', 'Which is the coldest continent?', 'Antarctica', ['Africa', 'Europe', 'Asia'], 'Antarctica is covered in ice all year.'],
    ['g22', 'L', 'mc', 'Which country is shaped like a boot?', 'Italy', ['France', 'Japan', 'Egypt'], 'On a map, Italy looks like a boot kicking a ball.'],
    ['g23', 'L', 'tf', 'A globe is a model of the Earth.', true, 0, 'A globe is a small round copy of the Earth.'],
    ['g24', 'L', 'mc', 'Which of these is a continent?', 'Asia', ['Canada', 'Pacific', 'London'], 'Canada is a country, the Pacific is an ocean and London is a city.'],
    ['g25', 'L', 'mc', 'What is the imaginary line around the middle of the Earth called?', 'Equator', ['North Pole', 'Border', 'Coast'], 'The equator splits the Earth into a top half and a bottom half.'],
    ['g26', 'L', 'mc', 'Which animal would you see on an African savanna?', 'Giraffe', ['Penguin', 'Kangaroo', 'Polar bear'], 'Giraffes, lions and zebras live on the savanna.'],
    ['g27', 'L', 'mc', 'Which country built the Great Wall?', 'China', ['Mexico', 'Greece', 'Kenya'], 'The Great Wall of China is thousands of kilometres long.'],
    ['g28', 'L', 'mc', 'What is very low land between mountains called?', 'Valley', ['Peak', 'Island', 'Cliff'], 'Rivers often run through valleys.'],
    ['g29', 'L', 'tf', 'It is always hot at the North Pole.', false, 0, 'The North Pole is icy and freezing.'],
    ['g30', 'L', 'mc', 'If you face north, which direction is behind you?', 'South', ['East', 'West', 'North'], 'South is opposite north.'],
    ['g40', 'N', 'mc', 'Which is the largest continent?', 'Asia', ['Africa', 'North America', 'Europe'], 'Asia has the most land and the most people.'],
    ['g41', 'N', 'mc', 'Which is the longest river in Africa?', 'Nile', ['Congo', 'Niger', 'Zambezi'], 'The Nile flows north for more than 6,600 km.'],
    ['g42', 'N', 'mc', 'Mount Everest is in which mountain range?', 'Himalayas', ['Andes', 'Alps', 'Rocky Mountains'], 'The Himalayas are in Asia.'],
    ['g43', 'N', 'mc', 'What is the capital of Japan?', 'Tokyo', ['Kyoto', 'Osaka', 'Seoul'], 'Tokyo is Japan\'s capital and biggest city.'],
    ['g44', 'N', 'tf', 'Australia is both a country and a continent.', true, 0, 'It is the only country that is also a continent.'],
    ['g45', 'N', 'mc', 'Which line divides Earth into the Northern and Southern Hemispheres?', 'Equator', ['Prime Meridian', 'Tropic of Cancer', 'Arctic Circle'], 'The equator is at 0° latitude.'],
    ['g46', 'N', 'mc', 'Which is the smallest continent?', 'Australia', ['Europe', 'Antarctica', 'South America'], 'Australia is the smallest of the seven continents.'],
    ['g47', 'N', 'mc', 'Most of the Amazon rainforest is in which country?', 'Brazil', ['Peru', 'Argentina', 'Mexico'], 'About 60% of the Amazon rainforest is in Brazil.'],
    ['g48', 'N', 'mc', 'Which ocean lies between Europe and North America?', 'Atlantic Ocean', ['Pacific Ocean', 'Indian Ocean', 'Southern Ocean'], 'Ships cross the Atlantic between Europe and the Americas.'],
    ['g49', 'N', 'tf', 'The Sahara is the largest hot desert in the world.', true, 0, 'The Sahara is about as big as the United States.'],
    ['g50', 'N', 'mc', 'What is the capital of Canada?', 'Ottawa', ['Toronto', 'Vancouver', 'Montreal'], 'Toronto is bigger, but Ottawa is the capital.'],
    ['g51', 'N', 'mc', 'Lines on a globe that measure how far north or south you are from the equator are lines of…', 'Latitude', ['Longitude', 'Altitude', 'Magnitude'], 'Latitude lines run flat like the rungs of a ladder.'],
    ['g52', 'N', 'mc', 'Which continent has the most countries?', 'Africa', ['Asia', 'Europe', 'South America'], 'Africa has 54 countries.'],
    ['g53', 'N', 'mc', 'What is the capital of Australia?', 'Canberra', ['Sydney', 'Melbourne', 'Perth'], 'Sydney is the biggest city, but Canberra is the capital.'],
    ['g54', 'N', 'tf', 'The Pacific Ocean is larger than all of Earth\'s land put together.', true, 0, 'The Pacific is about 165 million km². All land is about 149 million km².'],
    ['g55', 'N', 'mc', 'The ancient city of Machu Picchu is in which country?', 'Peru', ['Mexico', 'Chile', 'Brazil'], 'The Inca built Machu Picchu high in the Andes of Peru.'],
    ['g56', 'N', 'mc', 'What is a narrow strip of land joining two larger pieces of land called?', 'Isthmus', ['Peninsula', 'Strait', 'Delta'], 'The Isthmus of Panama joins North and South America.'],
    ['g57', 'N', 'mc', 'Which is the largest country by area?', 'Russia', ['Canada', 'China', 'United States'], 'Russia stretches across 11 time zones.'],
    ['g58', 'N', 'mc', 'Which sea is so salty that people float easily in it?', 'Dead Sea', ['Red Sea', 'Black Sea', 'North Sea'], 'The Dead Sea is almost ten times saltier than the ocean.'],
    ['g59', 'N', 'tf', 'Iceland is mostly covered by tropical rainforest.', false, 0, 'Iceland is cold, with glaciers and volcanoes.'],
    ['g60', 'N', 'mc', 'Which city is home to the Colosseum?', 'Rome', ['Athens', 'Paris', 'Cairo'], 'The Romans finished the Colosseum almost 2,000 years ago.'],
    ['g61', 'N', 'mc', 'What do we call land with water on three sides?', 'Peninsula', ['Island', 'Isthmus', 'Plateau'], 'Italy and Florida are peninsulas.'],
    ['g62', 'N', 'mc', 'Which continent is Kenya in?', 'Africa', ['Asia', 'South America', 'Europe'], 'Kenya is in East Africa, on the equator.'],
    ['g63', 'N', 'mc', 'Which mountain is the tallest above sea level?', 'Mount Everest', ['K2', 'Kilimanjaro', 'Mont Blanc'], 'Everest is about 8,849 m tall.'],
    ['g64', 'N', 'mc', 'The Great Barrier Reef lies off the coast of which country?', 'Australia', ['Brazil', 'India', 'Mexico'], 'It is the largest coral reef system in the world.'],
    ['g65', 'N', 'tf', 'Greenland is the world\'s largest island.', true, 0, 'Australia is bigger, but it counts as a continent.'],
    ['g66', 'N', 'mc', 'Which country has a red maple leaf on its flag?', 'Canada', ['Japan', 'Switzerland', 'Peru'], 'The maple leaf is a symbol of Canada.'],
    ['g67', 'N', 'mc', 'What is the fan-shaped land where a river meets the sea called?', 'Delta', ['Canyon', 'Glacier', 'Plateau'], 'Rivers drop mud and sand there, building new land.'],
    ['g68', 'N', 'mc', 'Which imaginary line sits at 0° longitude?', 'Prime Meridian', ['Equator', 'International Date Line', 'Tropic of Capricorn'], 'The Prime Meridian runs through Greenwich, England.'],
    ['g69', 'N', 'tf', 'Antarctica counts as a desert because it gets so little rain and snow.', true, 0, 'A desert is any place with very little precipitation, hot or cold.'],
    ['g70', 'N', 'mc', 'Venice is famous for having these instead of roads.', 'Canals', ['Bridges', 'Tunnels', 'Railways'], 'People in Venice travel by boat.'],
    ['g71', 'N', 'mc', 'What is the capital of Taiwan?', 'Taipei', ['Tainan', 'Kaohsiung', 'Taichung'], 'Taipei is in the north of Taiwan.'],
  ];

  // ---------- World 5: Lantern Isle (Chinese with zhuyin) ----------
  // [character, zhuyin, meaning]
  const ZH = [
    ['人', 'ㄖㄣˊ', 'person'], ['大', 'ㄉㄚˋ', 'big'], ['小', 'ㄒㄧㄠˇ', 'small'], ['山', 'ㄕㄢ', 'mountain'], ['水', 'ㄕㄨㄟˇ', 'water'],
    ['火', 'ㄏㄨㄛˇ', 'fire'], ['木', 'ㄇㄨˋ', 'wood'], ['日', 'ㄖˋ', 'sun'], ['月', 'ㄩㄝˋ', 'moon'], ['口', 'ㄎㄡˇ', 'mouth'],
    ['手', 'ㄕㄡˇ', 'hand'], ['天', 'ㄊㄧㄢ', 'sky'], ['花', 'ㄏㄨㄚ', 'flower'], ['魚', 'ㄩˊ', 'fish'], ['鳥', 'ㄋㄧㄠˇ', 'bird'],
    ['馬', 'ㄇㄚˇ', 'horse'], ['牛', 'ㄋㄧㄡˊ', 'cow'], ['狗', 'ㄍㄡˇ', 'dog'], ['貓', 'ㄇㄠ', 'cat'], ['雨', 'ㄩˇ', 'rain'],
    ['風', 'ㄈㄥ', 'wind'], ['雲', 'ㄩㄣˊ', 'cloud'], ['星', 'ㄒㄧㄥ', 'star'], ['門', 'ㄇㄣˊ', 'door'], ['車', 'ㄔㄜ', 'car'],
    ['書', 'ㄕㄨ', 'book'], ['米', 'ㄇㄧˇ', 'rice'], ['茶', 'ㄔㄚˊ', 'tea'], ['草', 'ㄘㄠˇ', 'grass'], ['石', 'ㄕˊ', 'stone'],
    ['上', 'ㄕㄤˋ', 'up'], ['下', 'ㄒㄧㄚˋ', 'down'], ['左', 'ㄗㄨㄛˇ', 'left'], ['右', 'ㄧㄡˋ', 'right'], ['中', 'ㄓㄨㄥ', 'middle'],
    ['吃', 'ㄔ', 'eat'], ['喝', 'ㄏㄜ', 'drink'], ['看', 'ㄎㄢˋ', 'look'], ['走', 'ㄗㄡˇ', 'walk'], ['跑', 'ㄆㄠˇ', 'run'],
    ['紅', 'ㄏㄨㄥˊ', 'red'], ['白', 'ㄅㄞˊ', 'white'], ['黑', 'ㄏㄟ', 'black'], ['一', 'ㄧ', 'one'], ['二', 'ㄦˋ', 'two'],
    ['三', 'ㄙㄢ', 'three'], ['四', 'ㄙˋ', 'four'], ['五', 'ㄨˇ', 'five'], ['六', 'ㄌㄧㄡˋ', 'six'], ['七', 'ㄑㄧ', 'seven'],
    ['八', 'ㄅㄚ', 'eight'], ['九', 'ㄐㄧㄡˇ', 'nine'], ['十', 'ㄕˊ', 'ten'],
  ];
  function zhQ(kid) {
    const e = pick(ZH);
    const others = []; for (const o of shuffle(ZH)) { if (o !== e && o[1] !== e[1] && !others.some(x => x[1] === o[1])) others.push(o); if (others.length === 3) break; }
    const form = kid === 'lucas' ? pick(['mean', 'char']) : pick(['zy', 'read', 'mean']);
    const why = `${e[0]} (${e[1]}) means "${e[2]}".`;
    if (form === 'mean') return mc(`z-m-${e[0]}`, 'What does this character mean?', e[2], others.map(o => o[2]), why, { big: e[0], sub: e[1] });
    if (form === 'char') return mc(`z-c-${e[0]}`, `Which character means "${e[2]}"?`, `${e[0]} ${e[1]}`, others.map(o => `${o[0]} ${o[1]}`), why, { zh: true });
    if (form === 'zy') return mc(`z-z-${e[0]}`, 'Which zhuyin matches this character?', e[1], others.map(o => o[1]), why, { big: e[0], zh: true });
    return mc(`z-r-${e[0]}`, 'Which character is read like this?', e[0], others.map(o => o[0]), why, { big: e[1], bigSmall: true, zh: true });
  }

  function bankQ(bank, kid, seen) {
    const lv = kid === 'lucas' ? 'L' : 'N';
    let pool = bank.filter(b => b[1] === lv && !seen[b[0]]);
    // Nora gets the easier set as bonus questions before anything repeats.
    if (!pool.length && kid === 'nora') pool = bank.filter(b => !seen[b[0]]);
    if (!pool.length) { bank.forEach(b => delete seen[b[0]]); pool = bank.filter(b => b[1] === lv); }
    const b = pick(pool);
    return b[2] === 'tf' ? tf(b[0], b[3], b[4], b[6]) : mc(b[0], b[3], b[4], b[5], b[6]);
  }
  function genQ(gens, seen) {
    let q;
    for (let i = 0; i < 40; i++) { q = pick(gens)(); if (!seen[q.id]) break; }
    return q;
  }

  const SUBJECTS = {
    math: { name: 'Maths', style: 'Number Duel' },
    science: { name: 'Science', style: 'Fact or Fib' },
    geo: { name: 'Geography', style: 'Map Quest' },
    logic: { name: 'Logic', style: 'Pattern Lock' },
    zh: { name: 'Chinese', style: 'Lantern Match' },
  };
  // subject 'mix' rotates through every subject (final world).
  function next(subject, kid, seen) {
    if (subject === 'mix') subject = pick(['math', 'science', 'geo', 'logic', 'zh']);
    let q;
    if (subject === 'math') q = genQ(kid === 'lucas' ? mathLucas : mathNora, seen);
    else if (subject === 'logic') q = genQ(kid === 'lucas' ? logicLucas : logicNora, seen);
    else if (subject === 'science') q = bankQ(SCI, kid, seen);
    else if (subject === 'geo') q = bankQ(GEO, kid, seen);
    else { for (let i = 0; i < 40; i++) { q = zhQ(kid); if (!seen[q.id]) break; } if (seen[q.id]) ZH.forEach(e => ['m', 'c', 'z', 'r'].forEach(f => delete seen[`z-${f}-${e[0]}`])); }
    q.subject = subject;
    seen[q.id] = 1;
    return q;
  }
  return { next, SUBJECTS, _all: { mathLucas, mathNora, logicLucas, logicNora, SCI, GEO, ZH, zhQ } };
})();
if (typeof module !== 'undefined') module.exports = Q;
