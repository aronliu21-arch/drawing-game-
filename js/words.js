// Word list: 200 Grade 1 picture words. Everyone draws from this list.
// Rules (checked by tests/room.test.mjs): every word is easy to draw,
// has 5 letters or fewer, uses letters only, and appears once.
// More levels can be added to LEVELS and WORDS; a level picker then
// appears on the home screen automatically.

export const LEVELS = {
  // the key stays 'g12' so word history saved on devices keeps working
  g12: { label: 'Grade 1 words', short: 'Gr 1', emoji: '🐣' },
};

export const WORDS = {
  g12: [
    // animals
    'cat', 'dog', 'pig', 'cow', 'hen', 'duck', 'fish', 'frog', 'bird', 'bee', 'ant', 'bug', 'fox',
    'owl', 'bat', 'rat', 'goat', 'horse', 'sheep', 'lion', 'bear', 'snake', 'snail', 'whale',
    'shark', 'crab', 'worm', 'mouse', 'zebra', 'tiger', 'chick', 'seal', 'deer', 'wolf', 'crow',
    'moth', 'pony', 'puppy', 'bunny', 'lamb', 'toad', 'swan', 'camel', 'hippo',
    // food
    'egg', 'cake', 'pie', 'bun', 'corn', 'pear', 'apple', 'grape', 'lemon', 'plum', 'bread', 'milk',
    'candy', 'pizza', 'soup', 'taco', 'donut', 'melon', 'toast', 'fries',
    // things
    'bed', 'cup', 'hat', 'box', 'bag', 'pen', 'map', 'mop', 'pot', 'pan', 'fan', 'jar', 'key',
    'lamp', 'door', 'sock', 'shoe', 'coat', 'dress', 'shirt', 'bell', 'ball', 'kite', 'doll',
    'drum', 'book', 'clock', 'chair', 'desk', 'bike', 'car', 'bus', 'van', 'ship', 'boat', 'truck',
    'train', 'plane', 'robot', 'crown', 'ring', 'gift', 'tent', 'flag', 'gate', 'nail', 'cap',
    'cape', 'mask', 'wand', 'sled', 'swing', 'slide', 'tub', 'sink', 'mug', 'bowl', 'fork', 'spoon',
    'plate', 'broom', 'brush', 'comb', 'glove', 'scarf', 'boot', 'belt', 'bow', 'paint', 'house',
    'cone', 'net', 'rug', 'top', 'jet', 'sofa', 'vase', 'fence', 'bench', 'rope', 'lock', 'wheel',
    'phone',
    // nature
    'sun', 'moon', 'star', 'cloud', 'rain', 'snow', 'tree', 'leaf', 'rock', 'hill', 'sand', 'pond',
    'nest', 'rose', 'seed', 'web', 'log', 'stick', 'wave', 'fire', 'ice', 'grass', 'plant', 'shell',
    'bone', 'lake',
    // body
    'hand', 'foot', 'nose', 'eye', 'ear', 'arm', 'leg', 'toe', 'tooth', 'head', 'hair',
    // fun
    'king', 'queen', 'baby', 'ghost', 'clown', 'farm', 'barn', 'hive', 'igloo', 'zoo', 'park',
    'pool', 'heart', 'witch', 'fairy', 'wagon',
  ],
};
