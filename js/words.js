// Word list: 200 drawable Grade 1–2 words. Everyone draws from this list.
// (More levels can be added to LEVELS and WORDS; a level picker appears
// on the home screen automatically when there is more than one.)
// Rules for every list: each word can be drawn as a picture, it is spelled
// with letters and spaces only, and no word appears in two lists.
// tests/words.test.mjs checks all of this.

export const LEVELS = {
  g12: { label: 'Grade 1–2 words', short: 'Gr 1–2', emoji: '🐣' },
};

export const WORDS = {
  // Short, phonics-friendly picture words a 1st–2nd grader can read and spell.
  g12: [
    // animals
    'cat', 'dog', 'pig', 'cow', 'hen', 'duck', 'fish', 'frog', 'bird', 'bee',
    'ant', 'bug', 'fox', 'owl', 'bat', 'rat', 'cub', 'goat', 'horse', 'sheep',
    'lion', 'bear', 'snake', 'snail', 'whale', 'shark', 'crab', 'worm', 'mouse', 'zebra',
    'tiger', 'monkey', 'rabbit', 'turtle', 'chick', 'puppy', 'kitten', 'spider', 'camel', 'seal',
    // food
    'egg', 'cake', 'pie', 'jam', 'bun', 'corn', 'pear', 'apple', 'grape', 'lemon',
    'plum', 'bread', 'milk', 'candy', 'pizza', 'cookie', 'carrot', 'banana', 'cheese', 'soup',
    'peas', 'nut', 'ham', 'taco', 'donut',
    // things
    'bed', 'cup', 'hat', 'box', 'bag', 'pen', 'map', 'mop', 'pot', 'pan',
    'fan', 'jar', 'key', 'lamp', 'door', 'sock', 'shoe', 'coat', 'dress', 'shirt',
    'bell', 'ball', 'kite', 'doll', 'drum', 'book', 'clock', 'chair', 'desk', 'bike',
    'car', 'bus', 'van', 'ship', 'boat', 'truck', 'train', 'plane', 'rocket', 'robot',
    'crown', 'ring', 'gift',
    // nature
    'sun', 'moon', 'star', 'cloud', 'rain', 'snow', 'tree', 'leaf', 'rock', 'hill',
    'sand', 'pond', 'nest', 'rose', 'seed', 'web', 'log', 'stick', 'wave', 'fire',
    'ice', 'rainbow',
    // body
    'hand', 'foot', 'nose', 'eye', 'ear', 'arm', 'leg', 'toe', 'tooth', 'head',
    'lips',
    // around the house and outside
    'house', 'tent', 'flag', 'gate', 'nail', 'cap', 'cape', 'mask', 'wand', 'sled',
    'swing', 'slide', 'tub', 'sink', 'mug', 'bowl', 'fork', 'spoon', 'plate', 'broom',
    'brush', 'comb', 'glove', 'mitten', 'scarf', 'boot', 'belt', 'bow', 'crayon', 'paint',
    // fun
    'king', 'queen', 'baby', 'ghost', 'snowman', 'pumpkin', 'heart', 'jump', 'swim', 'sleep',
    'clown', 'farm', 'barn', 'hive', 'shell', 'bone', 'igloo', 'ladder', 'castle', 'bridge',
    'cone', 'bubble', 'balloon', 'button', 'zoo', 'park', 'pool', 'wagon', 'dinosaur',
  ],

};
