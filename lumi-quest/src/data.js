// Story, worlds, creatures and items.
// Map legend: . ground  , path  " tall grass  T tree  W water  b bridge  R rock  f flowers  H house (2x2)
// C chest  c hidden treasure  G gate  N quest villager  n villager  E fog creature  B boss  F fog wall  P start
// Hub only: S shopkeeper  I healer  L elder
const SPECIES = {
  emberpup: { name: 'Emberpup', evo: 'Blazehound', animal: 'fox', el: 'fire', col: '#ff8c42', body: 'round', ear: 'point', tail: 'flame' },
  sproutle: { name: 'Sproutle', evo: 'Florabuck', animal: 'fawn', el: 'leaf', col: '#69db7c', body: 'round', ear: 'leaf', tail: 'leaf' },
  bubblit: { name: 'Bubblit', evo: 'Tidalon', animal: 'otter', el: 'water', col: '#4dabf7', body: 'round', ear: 'fin', tail: 'fin' },
  acornox: { name: 'Acornox', evo: 'Oakhorn', animal: 'bison', el: 'leaf', col: '#b08968', body: 'wide', ear: 'horn', tail: 'leaf' },
  tallybird: { name: 'Tallybird', evo: 'Abacowl', animal: 'owl', el: 'star', col: '#ffd43b', body: 'tall', ear: 'point', tail: 'puff', extra: 'wings' },
  shellby: { name: 'Shellby', evo: 'Reefguard', animal: 'turtle', el: 'water', col: '#38d9a9', body: 'wide', ear: 'none', tail: 'fin', extra: 'shell' },
  steamlet: { name: 'Steamlet', evo: 'Geyserix', animal: 'axolotl', el: 'fire', col: '#ff8787', body: 'tall', ear: 'antenna', tail: 'puff' },
  glaciub: { name: 'Glaciub', evo: 'Frostbear', animal: 'bear', el: 'water', col: '#a5d8ff', body: 'wide', ear: 'round', tail: 'puff' },
  peakit: { name: 'Peakit', evo: 'Summitar', animal: 'goat', el: 'star', col: '#ced4da', body: 'round', ear: 'long', tail: 'bolt', extra: 'spikes' },
  cogbit: { name: 'Cogbit', evo: 'Gearon', animal: 'hedgehog', el: 'star', col: '#e8a33d', body: 'round', ear: 'antenna', tail: 'none', extra: 'gear' },
  sandflare: { name: 'Sandflare', evo: 'Dunedrake', animal: 'dragon', el: 'fire', col: '#f59f00', body: 'tall', ear: 'horn', tail: 'flame', extra: 'spikes' },
  bambu: { name: 'Bambu', evo: 'Pandaroo', animal: 'panda', el: 'leaf', col: '#f1f3f5', body: 'wide', ear: 'round', tail: 'puff', belly: 'rgba(60,60,70,.25)' },
  lampfly: { name: 'Lampfly', evo: 'Lanternix', animal: 'moth', el: 'fire', col: '#e599f7', body: 'round', ear: 'antenna', tail: 'none', extra: 'wings' },
  echo: { name: 'Echo', evo: 'Echo', animal: 'bat', el: 'star', col: '#b197fc', body: 'round', ear: 'antenna', tail: 'bolt', extra: 'glow' },
};
Object.values(SPECIES).forEach((s, i) => { s.ph = i * 1.3; });
// Each Lumi learns four skills, at Levels 1, 4, 8 and 10.
// Stronger skills need a rest of a few turns after each use.
const MOVES = {
  emberpup: ['Ember Dash', 'Flame Wheel', 'Meteor Blaze', 'Phoenix Rise'], sproutle: ['Vine Whip', 'Thorn Storm', 'Great Bloom', 'World Tree'], bubblit: ['Bubble Burst', 'Tidal Wave', 'Whirlpool Crash', 'Ocean Dragon'],
  acornox: ['Acorn Barrage', 'Root Slam', 'Forest Stampede', 'Mighty Oak'], tallybird: ['Count Strike', 'Feather Flurry', 'Star Tally', 'Starfall Count'], shellby: ['Shell Spin', 'Coral Crush', 'Deep Sea Surge', 'Tsunami Shell'],
  steamlet: ['Steam Jet', 'Boiling Burst', 'Geyser Blast', 'Volcano Steam'], glaciub: ['Ice Tumble', 'Snowball Roll', 'Avalanche', 'Blizzard Roar'], peakit: ['Echo Leap', 'Rock Rumble', 'Summit Flash', 'Mountain Thunder'],
  cogbit: ['Gear Grind', 'Spring Punch', 'Clockwork Storm', 'Great Clockwork'], sandflare: ['Sand Blaze', 'Dune Fang', 'Desert Sun', 'Sun Dragon'], bambu: ['Bamboo Bash', 'Leaf Tornado', 'Panda Quake', 'Bamboo Forest'],
  lampfly: ['Lantern Flash', 'Glow Swarm', 'Festival Fireworks', 'Lantern Sky'], echo: ['Brave Voice', 'Loud Answer', 'Lantern Chorus', 'Hearthome Song'],
};
const MOVE_LV = [1, 4, 8, 10], MOVE_MULT = [1, 1.45, 2, 2.6], MOVE_REST = [0, 2, 3, 4];
const STARTERS = ['emberpup', 'sproutle', 'bubblit'];
// fire beats leaf, leaf beats water, water beats fire. Star is neutral.
const BEATS = { fire: 'leaf', leaf: 'water', water: 'fire' };

const WEAPONS = {
  wood: { name: 'Wooden Sword', atk: 0, kind: 'sword', col: '#c9a66b', trim: '#8d6e4a' },
  bronze: { name: 'Bronze Blade', atk: 3, kind: 'sword', col: '#e0a060', price: 60 },
  silver: { name: 'Silver Saber', atk: 6, kind: 'sword', col: '#dee2e6', price: 150 , perks: ['lucky'] },
  crystal: { name: 'Crystal Lance', atk: 10, kind: 'spear', col: '#7fe3ff', price: 320 , perks: ['drain'] },
  star: { name: 'Starforged Blade', atk: 15, kind: 'sword', col: '#ffe066', trim: '#7048e8', price: 600 , perks: ['lucky', 'twin'] },
  axe: { name: 'Abacus Axe', atk: 5, kind: 'axe', col: '#8ce99a', found: true , perks: ['coins'] },
  trident: { name: 'Tide Trident', atk: 8, kind: 'trident', col: '#66d9e8', found: true , perks: ['chill'] },
  spear: { name: 'Summit Spear', atk: 11, kind: 'spear', col: '#e9ecef', found: true , perks: ['boss'] },
  hammer: { name: 'Gear Hammer', atk: 13, kind: 'hammer', col: '#e8a33d', found: true , perks: ['twin'] },
  staff: { name: 'Lantern Staff', atk: 17, kind: 'staff', col: '#ff8787', found: true , perks: ['boss', 'drain'] },
};
// Each weapon slot looks different for each hero class: Knights use blades and heavy weapons,
// Mages use wands and staffs, Rangers use bows and throwing weapons. Stats and powers come from WEAPONS.
// [name, kind, colour, style]
const WEAPON_LOOKS = {
  wood: { knight: ['Wooden Sword', 'sword', '#c9a66b', 'plain'], mage: ['Twig Wand', 'wand', '#c9a66b', 'twig'], ranger: ['Twig Bow', 'bow', '#c9a66b', 'twig'] },
  bronze: { knight: ['Bronze Blade', 'sword', '#e0a060', 'broad'], mage: ['Bronze Wand', 'wand', '#e0a060', 'orb'], ranger: ['Bronze Bow', 'bow', '#e0a060', 'wrapped'] },
  silver: { knight: ['Silver Saber', 'sword', '#dee2e6', 'saber'], mage: ['Moon Staff', 'staff', '#e7f5ff', 'moon'], ranger: ['Silver Longbow', 'bow', '#dee2e6', 'recurve'] },
  axe: { knight: ['Abacus Axe', 'axe', '#8ce99a'], mage: ['Abacus Rod', 'wand', '#8ce99a', 'abacus'], ranger: ['Abacus Boomerang', 'boomerang', '#8ce99a'] },
  trident: { knight: ['Tide Trident', 'trident', '#66d9e8'], mage: ['Tide Staff', 'staff', '#66d9e8', 'tide'], ranger: ['Tide Bow', 'bow', '#66d9e8', 'tide'] },
  crystal: { knight: ['Crystal Lance', 'spear', '#7fe3ff', 'lance'], mage: ['Crystal Staff', 'staff', '#7fe3ff', 'crystal'], ranger: ['Crystal Bow', 'bow', '#7fe3ff', 'crystal'] },
  spear: { knight: ['Summit Spear', 'spear', '#e9ecef', 'summit'], mage: ['Summit Scepter', 'wand', '#e9ecef', 'scepter'], ranger: ['Summit Javelin', 'spear', '#e9ecef', 'javelin'] },
  hammer: { knight: ['Gear Hammer', 'hammer', '#e8a33d'], mage: ['Gear Scepter', 'staff', '#e8a33d', 'gear'], ranger: ['Gear Crossbow', 'crossbow', '#e8a33d'] },
  star: { knight: ['Starforged Blade', 'sword', '#ffe066', 'star'], mage: ['Star Wand', 'wand', '#ffe066', 'star'], ranger: ['Starshot Bow', 'bow', '#ffe066', 'star'] },
  staff: { knight: ['Lantern Blade', 'sword', '#ff8787', 'lantern'], mage: ['Lantern Staff', 'staff', '#ff8787', 'lantern'], ranger: ['Lantern Bow', 'bow', '#ff8787', 'lantern'] },
};
function weaponLook(id, cls) { const L = (WEAPON_LOOKS[id] || WEAPON_LOOKS.wood)[cls] || WEAPON_LOOKS[id].knight; return Object.assign({}, WEAPONS[id], { name: L[0], kind: L[1], col: L[2], style: L[3] || '' }); }
// Special powers on the better weapons and armour.
const PERKS = {
  lucky: { icon: '🍀', name: 'Lucky Strike', text: '1 in 4 hits does double damage' },
  coins: { icon: '🪙', name: 'Treasure Finder', text: '+50% coins from every win' },
  chill: { icon: '❄️', name: 'Frost Touch', text: "your hit makes the foe's next attack half as strong" },
  drain: { icon: '💚', name: 'Life Spark', text: 'heals you for a quarter of the damage you deal' },
  boss: { icon: '🌟', name: 'Fog Breaker', text: '+50% damage to Fog bosses' },
  twin: { icon: '⚡', name: 'Double Strike', text: 'full-power hits strike a second time' },
  thorns: { icon: '🌵', name: 'Spiky Mail', text: 'foes take 4 damage every time they hit you' },
  guard: { icon: '💎', name: 'Crystal Guard', text: 'blocks the first hit in every battle' },
  sunrise: { icon: '🌅', name: 'Sunrise', text: 'heals 10% of your health at the start of each turn' },
};
const perkList = ids => (ids || []).map(p => `<span class="perk">${PERKS[p].icon} <b>${PERKS[p].name}</b>: ${PERKS[p].text}</span>`).join('');
const ARMORS = {
  cloth: { name: 'Cloth Tunic', hp: 0, def: 0, tier: 0 },
  leather: { name: 'Leather Vest', hp: 10, def: 1, tier: 1, price: 50 },
  chain: { name: 'Chain Mail', hp: 22, def: 2, tier: 2, price: 140 , perks: ['thorns'] },
  crystal: { name: 'Crystal Plate', hp: 36, def: 4, tier: 3, price: 300 , perks: ['guard'] },
  dawn: { name: 'Dawn Armour', hp: 55, def: 6, tier: 4, price: 550 , perks: ['guard', 'sunrise'] },
};
const CLASSES = {
  knight: { name: 'Knight', icon: '🛡️', perk: '+15 health' },
  mage: { name: 'Mage', icon: '✨', perk: 'Lumi skills hit 20% harder' },
  ranger: { name: 'Ranger', icon: '🏹', perk: '+25% coins, easier captures' },
};
// Hero creator choices. The first of each list is the kid's usual look.
const HAIRS = {
  nora: [['ponytail', 'Ponytail'], ['twinbuns', 'Twin buns'], ['long', 'Long'], ['bob', 'Bob'], ['braids', 'Braids']],
  lucas: [['spiky', 'Spiky'], ['neat', 'Neat'], ['curly', 'Curly'], ['swoop', 'Swoop'], ['cap', 'Cap']],
};
const HAIR_COLS = ['#17141c', '#5c3d2e', '#a0522d', '#d9a441'];
const EYES = [['sparkle', 'Sparkly'], ['big', 'Big shiny'], ['starry', 'Starry'], ['round', 'Round'], ['almond', 'Cat'], ['sleepy', 'Sleepy']];
const EYE_COLS = ['', '#17141c', '#1c7ed6', '#2f9e44', '#c2711e', '#7048e8'];
const EXTRAS = [['', 'None'], ['freckles', 'Freckles'], ['glasses', 'Glasses'], ['stars', 'Star cheeks'], ['plaster', 'Plaster']];
const TITLES = ['the Brave', 'the Clever', 'the Kind', 'the Swift', 'the Curious', 'the Bold'];
const NICKS = { fire: ['Sparky', 'Blaze', 'Ember', 'Toasty', 'Flicker'], water: ['Splash', 'Bubbles', 'Drizzle', 'Puddle', 'Misty'], leaf: ['Sprout', 'Clover', 'Mossy', 'Pip', 'Fern'], star: ['Twinkle', 'Comet', 'Nova', 'Glimmer', 'Sunny'] };
const TUNICS = ['#1c7ed6', '#e03131', '#2f9e44', '#7048e8', '#f76707', '#0ca678'];
const CAPES = [null, '#e03131', '#7048e8', '#ffd43b', '#12b886', '#343a40'];

const PAL = {
  hub: { g1: '#7bc86c', g2: '#74c365', path: '#e6c88f', tuft: '#5aa84f', water: '#4dabf7', tg1: '#2f9e44', tg2: '#37b24d', tree: 'round', leaf1: '#40c057', leaf2: '#2f9e44', rock: '#868e96', flowers: ['#ff8787', '#fff', '#da77f2'], fruit: '#e03131', sky: ['#74c0fc', '#d0ebff'], hill: '#69b55d' },
  w1: { g1: '#5fa85a', g2: '#59a054', path: '#c9a66b', tuft: '#3f8a3f', water: '#339af0', tg1: '#2b8a3e', tg2: '#2f9e44', tree: 'round', leaf1: '#2f9e44', leaf2: '#237032', rock: '#7d8590', flowers: ['#ffd43b', '#ff922b'], fruit: '#ffd43b', sky: ['#8ce99a', '#e6fcf5'], hill: '#3f8a3f' },
  w2: { g1: '#f3dfa2', g2: '#eed898', path: '#fff3bf', tuft: '#d9c27a', water: '#22b8cf', tg1: '#12b886', tg2: '#20c997', tree: 'palm', leaf1: '#2f9e44', leaf2: '#51cf66', rock: '#adb5bd', flowers: ['#ff6b6b', '#f783ac'], sky: ['#3bc9db', '#e3fafc'], hill: '#f3dfa2' },
  w3: { g1: '#e9f2f9', g2: '#dfeaf3', path: '#b9c6d2', tuft: '#c5d5e3', water: '#74c0fc', tg1: '#91a7ba', tg2: '#a5b9ca', tree: 'pine', leaf1: '#2b6e4f', leaf2: '#1f5a40', rock: '#8a94a0', flowers: ['#74c0fc', '#b197fc'], snow: true, sky: ['#a5d8ff', '#f8f9fa'], hill: '#cfd8e3' },
  w4: { g1: '#e0a96d', g2: '#d9a066', path: '#f1cf9d', tuft: '#c48b4f', water: '#f08c00', tg1: '#c2792e', tg2: '#d4883a', tree: 'cactus', leaf1: '#5c940d', leaf2: '#74b816', rock: '#a0522d', flowers: ['#ff8787', '#ffd43b'], sky: ['#ffa94d', '#fff4e6'], hill: '#c98b55' },
  w5: { g1: '#8fd3a6', g2: '#86cc9e', path: '#f3c5c5', tuft: '#63b583', water: '#3bc9db', tg1: '#0ca678', tg2: '#12b886', tree: 'bamboo', leaf1: '#51cf66', leaf2: '#37b24d', rock: '#868e96', flowers: ['#ff8fab', '#ffd6e0', '#e03131'], sky: ['#ffb3c1', '#fff0f3'], hill: '#7cc596', wall: '#fff5f5' },
  w6: { g1: '#3d3558', g2: '#383052', path: '#5c5080', tuft: '#2c2542', water: '#5f3dc4', tg1: '#4b3f72', tg2: '#55487f', tree: 'dead', leaf1: '#3b2f4a', leaf2: '#3b2f4a', rock: '#4a4466', flowers: ['#9775fa', '#5f3dc4'], sky: ['#1a1433', '#4a3a7a'], hill: '#2c2542' },
};

const WORLDS = {
  hub: {
    name: 'Hearthome Village', subject: 'mix', lvl: 0,
    map: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T..f...HH.....HH....f.CT',
      'T......HH..G..HH.......T',
      'T.c....S,.,,,.,I.......T',
      'T.......,,,,,,,........T',
      'T..HH...,..L..,...HH...T',
      'T..HH...,.....,...HH...T',
      'T...n,,,,,,,,,,,,,,n...T',
      'T.......,..f..,........T',
      'T.f.....,.....,....f...T',
      'TWWW....,,,P,,,....""".T',
      'TWWWW......,.......""""T',
      'TWWWWW.....,..f....""c.T',
      'TWWWW..C...,...........T',
      'TWWW.......,.....f...f.T',
      'TTTTTTTTTTTTTTTTTTTTTTTT'],
    chests: [{ gold: 40 }, { item: 'orb', n: 2 }, { item: 'potion', n: 2 }, { gold: 25 }],
    wild: ['tallybird'], wildLv: 1,
    villagers: [{ name: 'Baker Pim', col: '#f59f00', hair: '#6d4c41', hat: 'bun', lines: ['The fog made me forget my bread recipe! Was it 2 cups of flour or 20?', 'Tall grass hides wild Lumis. Weaken one, then throw a Capture Orb.'] }, { name: 'Farmer Jo', col: '#2f9e44', hair: '#343a40', lines: ['Look for sparkles on the ground. Treasure is buried there!', 'Fire beats Leaf, Leaf beats Water, Water beats Fire. Star is friends with all.'] }],
  },
  w1: {
    name: 'Numberwood', subject: 'math', lvl: 1, crystal: '#40c057', icon: '🌳', blurb: 'Maths duels in the counting forest',
    map: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'TG,,..TT....""""..T..CTT',
      'T.,N..T..E..""""..T...TT',
      'T.,,,.....TT.""..TT.E..T',
      'TT..,..TT.TT......T....T',
      'T...,,,,,,,,,,..f...TT.T',
      'T.""..T....T.,....c.TT.T',
      'T.""".T.E..T.,,,,,,,...T',
      'T..""....TT....T..,.TT.T',
      'TT.....f.TT.C..T..,..E.T',
      'T..TT.........TT..,....T',
      'T.cTT..""".E......,TTFTT',
      'T......""""...TT..,T.B.T',
      'TC..n..""".....T..,TTTTT',
      'T..............T.....C.T',
      'TTTTTTTTTTTTTTTTTTTTTTTT'],
    chests: [{ gold: 30 }, { item: 'orb', n: 2 }, { weapon: 'axe' }, { item: 'potion', n: 2 }, { gold: 35 }, { gold: 45 }],
    wild: ['acornox', 'tallybird'], wildLv: 2,
    fogs: [{ name: 'Mixling', kind: 'wisp', col: '#5f3dc4', sym: '+', el: 'water' }, { name: 'Minus Moth', kind: 'bat', col: '#7048e8', sym: '−', el: 'leaf' }],
    boss: { name: 'Count Muddle', kind: 'knight', col: '#2b8a3e', sym: '±', el: 'leaf' },
    giver: { name: 'Woodcutter Ada', col: '#b5712c', hair: '#d9480f' },
    problem: 'The fog scrambled every number in Numberwood. We cannot even count our apples!',
    tip: 'Try it this week: add up the prices of three things at the shop before the till does.',
    villagers: [{ name: 'Little Fen', col: '#74c0fc', hair: '#f59f00', lines: ['I had 12 acorns. Or was it 21? The fog mixed them up.', 'Count Muddle hides behind a wall of fog in the south-east.'] }],
  },
  w2: {
    name: 'Coral Cove', subject: 'science', lvl: 3, crystal: '#22b8cf', icon: '🏝️', blurb: 'Fact or Fib science on the beach',
    map: [
      'WWWWWWWWWWWWWWWWWWWWWWWW',
      'WG,,...T...WWWW...""".CW',
      'W.,N.......WWWW..""""..W',
      'W.,....E...bbbb...""...W',
      'W.,,,,.....WWWW.....T..W',
      'WT...,..T..WWWW.E......W',
      'W..c.,,,,,,bbbb,,,,..R.W',
      'W.....R..,.WWWW...,....W',
      'WWW...."".,.WWW.T.,.E..W',
      'WWWW.."""".,.......,...W',
      'WWW..C."""..,,,,,,,,.c.W',
      'W......E.......T...,..WW',
      'W.T.......n....RRRRFRRWW',
      'WC...f.........R.....BRW',
      'W.......T......R.C...RWW',
      'WWWWWWWWWWWWWWWWWWWWWWWW'],
    chests: [{ gold: 45 }, { weapon: 'trident' }, { item: 'potion', n: 2 }, { item: 'orb', n: 2 }, { gold: 55 }, { gold: 60 }],
    wild: ['shellby', 'steamlet'], wildLv: 4,
    fogs: [{ name: 'Fibber', kind: 'slime', col: '#1098ad', sym: '?', el: 'water' }, { name: 'Tall Tale', kind: 'wisp', col: '#0b7285', sym: '!', el: 'fire' }],
    boss: { name: 'Captain Fib', kind: 'slime', col: '#0c8599', sym: '?!', el: 'water' },
    giver: { name: 'Sailor Mako', col: '#1971c2', hair: '#212529' },
    problem: 'Captain Fib told the cove that fish can fly and the Moon is cheese. Nobody knows what is true any more!',
    tip: 'Try it this week: when you hear a surprising fact, ask "How do we know?" and look it up together.',
    villagers: [{ name: 'Diver Lin', col: '#f783ac', hair: '#5f3dc4', hat: 'bun', lines: ['Is a whale a fish? I used to know…', 'Here you must sort the Facts from the Fibs.'] }],
  },
  w3: {
    name: 'Atlas Peaks', subject: 'geo', lvl: 5, crystal: '#74c0fc', icon: '🏔️', blurb: 'Map Quest geography in the snow',
    map: [
      'RRRRRRRRRRRRRRRRRRRRRRRR',
      'RG,,..T....RR..."""..CRR',
      'R.,N.....E.RR..""""...RR',
      'R.,,,,......R...""..T..R',
      'RT...,..TT......R......R',
      'R..c.,,,,,,,,..RR..E...R',
      'R.....T....R,...R......R',
      'RRR..""....R,,,,,,,..T.R',
      'RR..""""..E....T..,....R',
      'R...."".....C..T..,,,c.R',
      'R.T.......RR........,..R',
      'R....E....RR..T..RRRFRRR',
      'R..n.........."".RRR...R',
      'RC......T...."""".R..B.R',
      'R..f..........""..R...CR',
      'RRRRRRRRRRRRRRRRRRRRRRRR'],
    chests: [{ gold: 60 }, { item: 'orb', n: 3 }, { weapon: 'spear' }, { item: 'potion', n: 3 }, { gold: 70 }, { gold: 80 }],
    wild: ['glaciub', 'peakit'], wildLv: 6,
    fogs: [{ name: 'Lostling', kind: 'wisp', col: '#4c6ef5', sym: 'N', el: 'water' }, { name: 'Drift Golem', kind: 'golem', col: '#748ffc', sym: '?', el: 'star' }],
    boss: { name: 'Baron Nowhere', kind: 'golem', col: '#3b5bdb', sym: '✕', el: 'water' },
    giver: { name: 'Guide Tenzin', col: '#c92a2a', hair: '#212529' },
    problem: 'Baron Nowhere wiped every map blank. Our climbers cannot find their way home!',
    tip: 'Try it this week: find where you live on a globe or map, then find one country you learned today.',
    villagers: [{ name: 'Climber Bo', col: '#fab005', hair: '#5c3d2e', lines: ['Which way is north? My compass is full of fog.', 'A Summit Spear is hidden somewhere in these peaks.'] }],
  },
  w4: {
    name: 'Clockwork Canyon', subject: 'logic', lvl: 7, crystal: '#ff922b', icon: '⚙️', blurb: 'Pattern Lock puzzles in the desert',
    map: [
      'RRRRRRRRRRRRRRRRRRRRRRRR',
      'RG,,....T...RR.....""CRR',
      'R.,N........RR..E.""""RR',
      'R.,,,,,..E.........""..R',
      'R.....,....T..RR.......R',
      'RR.c..,,,,,,,,RR...T...R',
      'RR..T......R.,.....E...R',
      'R..""".....R.,,,,,.....R',
      'R.""""..E......T.,..RR.R',
      'R..""........C...,..RR.R',
      'R.....RR..T......,,,c..R',
      'RT....RR...E.......,RRRR',
      'R...n........""..RRF...R',
      'RC.......T..""""..R..B.R',
      'R....f.......""...R...CR',
      'RRRRRRRRRRRRRRRRRRRRRRRR'],
    chests: [{ gold: 80 }, { item: 'potion', n: 3 }, { weapon: 'hammer' }, { item: 'orb', n: 3 }, { gold: 90 }, { gold: 100 }],
    wild: ['cogbit', 'sandflare'], wildLv: 8,
    fogs: [{ name: 'Jumbler', kind: 'golem', col: '#d9480f', sym: '⚙', el: 'fire' }, { name: 'Knot Bat', kind: 'bat', col: '#e8590c', sym: '∞', el: 'star' }],
    boss: { name: 'The Tangler', kind: 'bat', col: '#c2410c', sym: '∞', el: 'fire' },
    giver: { name: 'Tinker Zadie', col: '#e8a33d', hair: '#862e9c', hat: 'bun' },
    problem: 'The Tangler jammed the Great Clock. Our gears turn in the wrong order and nothing works!',
    tip: 'Try it this week: spot a pattern on a walk (tiles, fences, windows) and guess what comes next.',
    villagers: [{ name: 'Gear Boy Ozzy', col: '#868e96', hair: '#e67700', lines: ['Red, blue, red, blue… what comes next? I forgot!', 'Some puzzles here ask you to tap things in order.'] }],
  },
  w5: {
    name: 'Lantern Isle', subject: 'zh', lvl: 9, crystal: '#ff6b6b', icon: '🏮', blurb: 'Lantern Match with Chinese and zhuyin',
    map: [
      'WWWWWWWWWWWWWWWWWWWWWWWW',
      'WG,,...T...."""...T..CWW',
      'W.,N........""""......WW',
      'W.,,,,..E....""....E...W',
      'WT....,...WWWW.....T...W',
      'W..c..,,,,bbbb,,,,.....W',
      'W.........WWWW...,..f..W',
      'W..""..T..WWWW...,.....W',
      'W.""""........E..,..T..W',
      'W..""....C.......,,,c..W',
      'W.....T.....T......,...W',
      'WW.......E.........,TTTW',
      'WW..n......."".TTTTF...W',
      'WC..........""""..T..B.W',
      'W..f....T....""...T.f.CW',
      'WWWWWWWWWWWWWWWWWWWWWWWW'],
    chests: [{ gold: 100 }, { item: 'orb', n: 3 }, { weapon: 'staff' }, { item: 'potion', n: 3 }, { gold: 110 }, { gold: 120 }],
    wild: ['bambu', 'lampfly'], wildLv: 10,
    fogs: [{ name: 'Smudge', kind: 'slime', col: '#c2255c', sym: '字', el: 'leaf' }, { name: 'Ink Wisp', kind: 'wisp', col: '#a61e4d', sym: 'ㄅ', el: 'fire' }],
    boss: { name: 'Empress Smudge', kind: 'wisp', col: '#a61e4d', sym: '墨', el: 'fire' },
    giver: { name: 'Teacher Mei', col: '#e03131', hair: '#212529', hat: 'bun' },
    problem: 'Empress Smudge smeared the ink on every lantern. Nobody can read the festival wishes!',
    tip: 'Try it this week: read one sign, menu or book title in Chinese out loud with a grown-up.',
    villagers: [{ name: 'Lantern Kid Yu', col: '#fcc419', hair: '#212529', lines: ['山 means mountain. I remember that one!', 'Match each character to its sound and meaning.'] }],
  },
  w6: {
    name: 'Fog Citadel', subject: 'mix', lvl: 11, crystal: '#ffe066', icon: '🏰', blurb: 'Every subject at once. The final battle',
    map: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'TG,,....T.....RR......CT',
      'T.,N..........RR...E...T',
      'T.,,,,,,,,,........T...T',
      'T..T.....,...E.........T',
      'T........,......RR..c..T',
      'TRR..E...,,,,,,.RR.....T',
      'TRR...........,........T',
      'T...T....C....,...E....T',
      'T.............,,,,,....T',
      'T..c....T.........,.T..T',
      'T....E............,....T',
      'TT.........RRRRRRRFRRRRT',
      'TC...T.....R.........C.T',
      'T..........R....B......T',
      'TTTTTTTTTTTTTTTTTTTTTTTT'],
    chests: [{ gold: 150 }, { item: 'potion', n: 4 }, { item: 'orb', n: 3 }, { gold: 150 }, { gold: 200 }, { item: 'potion', n: 4 }],
    wild: [], wildLv: 12,
    fogs: [{ name: 'Fog Knight', kind: 'knight', col: '#5f3dc4', sym: '', el: 'star' }, { name: 'Gloom Golem', kind: 'golem', col: '#4c3a8f', sym: '', el: 'water' }, { name: 'Night Bat', kind: 'bat', col: '#3b2f6b', sym: '', el: 'fire' }],
    boss: { name: 'King Mumble', kind: 'wisp', col: '#2b1d5c', sym: '…', el: 'star', eye: '#ff6b6b' },
    giver: { name: 'Scout Wren', col: '#495057', hair: '#f59f00' },
    problem: 'King Mumble sits on his foggy throne. Beat him and the Great Lantern will shine again!',
    tip: 'Try it this week: teach someone at home one new thing you learned on this adventure.',
    villagers: [],
  },
};
const WORLD_ORDER = ['w1', 'w2', 'w3', 'w4', 'w5', 'w6'];

const STORY = {
  intro: [
    'Long ago, the Great Lantern of Hearthome lit the whole land with knowledge.',
    'Each time someone learned something new, a spark leapt from the Lantern and became a Lumi, a little creature of light.',
    'Then one night a cold Fog rolled in. The Lantern shattered into five Knowledge Crystals, and the Lumis scattered into the tall grass.',
    'Wherever the Fog went, people forgot: how to count, how to read a map, how to tell fact from fib.',
    'The Fog has a king. Nobody remembers his real name any more. They call him King Mumble.',
  ],
  elderFirst: n => [`${n}! You have come at last. I am Elder Lumen, keeper of the Lantern.`, 'The Fog cannot stand a brave answer. Even a wrong one makes it shiver, because trying is how we learn.', 'Five Fog bosses guard the crystals. They were not always monsters. The Fog changed them.', 'Answer questions to power every move. Catch wild Lumis and train them.', 'Step through the gate behind me, and start with Numberwood. And if you meet the king… be kind.'],
};
if (typeof module !== 'undefined') module.exports = { WORLDS, SPECIES };
