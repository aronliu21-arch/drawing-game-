// Word lists: 200 drawable words per level.
// Rules for every list: each word can be drawn as a picture, it is spelled
// with letters and spaces only, and no word appears in two lists.
// tests/words.test.mjs checks all of this.

export const LEVELS = {
  g12: { label: 'Grade 1–2 words', short: 'Gr 1–2', emoji: '🐣' },
  g34: { label: 'Grade 3–4 words', short: 'Gr 3–4', emoji: '🚀' },
  adult: { label: 'Grown-up words', short: 'Grown-up', emoji: '🎩' },
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

  // Longer words with trickier spelling, still easy to picture.
  g34: [
    // animals and characters
    'octopus', 'penguin', 'dolphin', 'kangaroo', 'giraffe', 'elephant', 'crocodile', 'butterfly', 'caterpillar', 'ladybug',
    'scorpion', 'jellyfish', 'starfish', 'seahorse', 'squirrel', 'hedgehog', 'peacock', 'flamingo', 'parrot', 'eagle',
    'beaver', 'raccoon', 'gorilla', 'cheetah', 'unicorn', 'dragon', 'mermaid', 'wizard', 'knight', 'astronaut',
    'scientist', 'firefighter', 'detective', 'chef', 'superhero', 'scarecrow', 'dragonfly', 'grasshopper', 'mosquito', 'porcupine',
    'skunk', 'koala', 'panda', 'polar bear', 'walrus', 'hippo', 'rhinoceros', 'ostrich', 'chameleon', 'lobster',
    // places
    'pyramid', 'island', 'desert', 'jungle', 'cave', 'mountain', 'glacier', 'canyon', 'river', 'beach',
    'forest', 'palace', 'stadium', 'library', 'hospital', 'airport', 'museum', 'windmill', 'treehouse', 'playground',
    'volcano', 'lighthouse', 'waterfall', 'tornado', 'telescope', 'skeleton',
    // objects and vehicles
    'backpack', 'umbrella', 'scissors', 'keyboard', 'computer', 'headphones', 'microphone', 'camera', 'compass', 'magnet',
    'battery', 'lightbulb', 'flashlight', 'calendar', 'envelope', 'trophy', 'medal', 'helmet', 'skateboard', 'scooter',
    'bicycle', 'helicopter', 'submarine', 'sailboat', 'parachute', 'hot air balloon', 'tractor', 'ambulance', 'fire truck', 'spaceship',
    'satellite', 'treasure chest', 'hourglass', 'thermometer', 'toothbrush', 'pillow', 'blanket', 'curtain', 'staircase', 'chimney',
    'pirate ship', 'treasure map', 'sandcastle',
    // food
    'spaghetti', 'hamburger', 'popcorn', 'pancake', 'watermelon', 'pineapple', 'strawberry', 'broccoli', 'cupcake', 'pretzel',
    'sushi', 'popsicle', 'cereal', 'avocado', 'coconut', 'mushroom', 'sandwich', 'french fries', 'hot dog', 'ice cream',
    // nature and science
    'earthquake', 'lightning', 'snowflake', 'sunflower', 'cactus', 'seaweed', 'coral reef', 'planet', 'comet', 'fossil',
    'footprint', 'shadow', 'iceberg', 'avalanche', 'puddle', 'acorn', 'pinecone', 'feather', 'spiderweb', 'beehive',
    // sports and activities
    'soccer ball', 'goalkeeper', 'basketball', 'baseball bat', 'tennis racket', 'trampoline', 'karate', 'ballet', 'surfing', 'skiing',
    'fishing', 'camping', 'juggling', 'bowling', 'archery', 'referee', 'cartwheel', 'campfire', 'picnic', 'birthday party',
    // music and more
    'piano', 'guitar', 'violin', 'trumpet', 'xylophone', 'globe', 'puzzle', 'dice', 'chessboard', 'mailbox',
    'doorbell', 'fountain', 'statue', 'roller coaster', 'ferris wheel', 'carousel', 'toolbox', 'hammer', 'wrench', 'paintbrush',
    'candle',
  ],

  // Hard for the drawer, but still guessable by the kids.
  adult: [
    // objects and machines
    'chandelier', 'gargoyle', 'periscope', 'stethoscope', 'saxophone', 'accordion', 'harmonica', 'trombone', 'lawnmower', 'wheelbarrow',
    'chainsaw', 'crowbar', 'sledgehammer', 'stapler', 'paperclip', 'thumbtack', 'calculator', 'typewriter', 'gramophone', 'projector',
    'binoculars', 'microscope', 'kaleidoscope', 'metronome', 'sundial', 'abacus', 'catapult', 'trebuchet', 'hammock', 'pendulum',
    'anchor', 'lantern', 'padlock', 'keyhole', 'faucet', 'radiator', 'escalator', 'elevator', 'vending machine', 'parking meter',
    'traffic light', 'fire hydrant', 'manhole', 'scaffolding', 'crane', 'bulldozer', 'forklift', 'wrecking ball', 'conveyor belt', 'drawbridge',
    // ideas and moments
    'sleepwalking', 'daydream', 'traffic jam', 'rush hour', 'tug of war', 'high five', 'hide and seek', 'peekaboo', 'bedtime story', 'sunburn',
    'hiccup', 'sneeze', 'yawn', 'tickle', 'brain freeze', 'bad hair day', 'homesick', 'jet lag', 'time travel', 'black hole',
    'solar eclipse', 'northern lights', 'shooting star', 'constellation', 'food chain', 'life cycle', 'recycling', 'pollution', 'migration', 'hibernation',
    'camouflage', 'echo', 'reflection', 'magnetism', 'gravity', 'friction', 'evaporation', 'tsunami', 'hurricane', 'quicksand',
    'mirage', 'oasis', 'whirlpool', 'stalactite', 'geyser', 'erosion', 'landslide', 'sandstorm', 'heatwave', 'blizzard',
    // people and creatures
    'lumberjack', 'ventriloquist', 'magician', 'acrobat', 'tightrope walker', 'juggler', 'lifeguard', 'plumber', 'electrician', 'archaeologist',
    'beekeeper', 'conductor', 'sculptor', 'photographer', 'dentist', 'surgeon', 'pharaoh', 'mummy', 'cyclops', 'centaur',
    'phoenix', 'yeti', 'kraken', 'griffin', 'sphinx', 'leprechaun', 'genie', 'cowboy', 'snowboarder', 'astronomer',
    // food
    'croissant', 'burrito', 'dumpling', 'lasagna', 'fondue', 'kebab', 'nachos', 'waffle', 'smoothie', 'milkshake',
    'omelette', 'meatball', 'cotton candy', 'gingerbread house', 'fortune cookie', 'corn on the cob', 'bubble tea', 'birthday cake', 'lollipop', 'artichoke',
    // places and getting around
    'skyscraper', 'observatory', 'aquarium', 'planetarium', 'greenhouse', 'laundromat', 'barbershop', 'bakery', 'food truck', 'gas station',
    'car wash', 'toll booth', 'subway', 'monorail', 'cable car', 'gondola', 'hovercraft', 'jet ski', 'kayak', 'canoe',
    'catamaran', 'zeppelin', 'glider', 'unicycle', 'tandem bicycle', 'wheelchair', 'stroller', 'treadmill', 'dumbbell', 'bunk bed',
    'bean bag', 'rocking chair', 'grandfather clock', 'cuckoo clock', 'birdhouse', 'totem pole', 'teepee', 'log cabin', 'pagoda', 'weathervane',
    'satellite dish', 'solar panel', 'windsock', 'drive thru', 'hot tub', 'sprinkler', 'birdbath', 'compost bin', 'doghouse', 'snorkel',
  ],
};
