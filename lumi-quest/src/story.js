// The deeper story: who each boss used to be, the memories they return, and King Mumble's past.
const LORE = {
  w1: {
    intro: ['Who goes there? One hero? Two? Seven? I… I cannot count you!', 'King Mumble says numbers only cause trouble. No more counting!'],
    half: 'Stop getting them right! It makes my head feel… clear…',
    was: 'Old Tally',
    after: ['One, two, three… I can count again! I am Old Tally. I count every tree in Numberwood.', 'The Fog turned me into Count Muddle. Thank you for setting me free.', 'I remember something. Long ago a boy came to count fireflies with me. He counted out loud, so proud of every number.'],
    memory: ['The Firefly Counter', 'A boy used to count fireflies in Numberwood, out loud and proud.'],
    voice: 'So you can count. Counting leads to mistakes. Mistakes lead to laughing. You will see.',
  },
  w2: {
    intro: ['Arr! The sea is made of lemonade, and crabs can sing opera!', 'King Mumble says if nothing is true, then nobody can ever be wrong!'],
    half: 'Is… is the sea really salty? I used to know that…',
    was: 'Captain Marlow',
    after: ['Blow me down, my head is clear! I am Captain Marlow. I tell true tales of the sea.', 'I remember a boy who loved my stories. He asked "How do we know?" about everything.', 'One day he stopped asking. He said questions only made people laugh at him.'],
    memory: ['The Boy Who Asked', 'He asked "How do we know?" about everything, until one day he stopped.'],
    voice: 'I asked questions once. It only got me laughed at. Stop asking.',
  },
  w3: {
    intro: ['There is no north. There is no south. There is only Nowhere!', 'King Mumble says a blank map can never be wrong.'],
    half: 'That mountain… it has a name. I drew it once…',
    was: 'Mapmaker Marta',
    after: ['My maps! The lines are coming back! I am Marta. I drew every path in these peaks.', 'I remember now. A boy asked me for a map to the Lantern Festival. He was going to answer the Great Question on stage.', 'He was so excited. I never saw him smile like that again.'],
    memory: ['The Road to the Festival', 'He walked to the Lantern Festival to answer the Great Question on stage.'],
    voice: 'Do not go looking for that day. Leave it in the fog.',
  },
  w4: {
    intro: ['Tick-tock, tock-tick, tick-tick-tock! Nothing comes next any more!', 'King Mumble says if there is no order, nobody can get things out of order.'],
    half: 'One, then two, then… three! Oh! That is what comes next!',
    was: 'Old Tick',
    after: ['Tick, tock, tick, tock. In order at last! I am Old Tick. I wind the Great Clock.', 'The clock remembers everything. On Festival night the boy gave his answer, and it was wrong.', 'The whole crowd laughed. His teacher said nothing. The boy ran out into the night, and the first fog rolled in behind him.'],
    memory: ['The Wrong Answer', 'His answer was wrong. The crowd laughed, his teacher said nothing, and he ran into the night.'],
    voice: 'Now you know. They LAUGHED. I will never let anyone laugh at an answer again.',
  },
  w5: {
    intro: ['Every word is a smudge. Every wish is a blot. Reading is over!', 'King Mumble says if nobody can read, nobody can read it wrong.'],
    half: 'That stroke… I taught that stroke to a hundred children…',
    was: 'Brushmaster Lan',
    after: ['The ink is clear again. I am Brushmaster Lan. I paint the wishes on every lantern.', 'I found the boy\'s festival lantern, hidden all these years. His wish says: "I wish I was never wrong."', 'And I remember his name. It was never Mumble. That is only how he spoke after that night, so quietly that nobody could hear a mistake. His name is Wick.'],
    memory: ['The Hidden Wish', 'His lantern wish said "I wish I was never wrong." His real name is Wick.'],
    voice: 'Wick is gone. There is only King Mumble. Come to my Citadel, and I will prove that knowing things only hurts.',
  },
  w6: {
    intro: ['…so you came. Speak up? No. If I speak quietly, nobody hears when I am wrong.', 'I will ask you everything. Numbers, facts, maps, patterns, words. You WILL get one wrong. Then you will understand.'],
    half: 'You got some wrong on the way here… and you just tried again? Why are you not afraid?',
  },
};
const ELDER_CONFESS = ['So. You know about Wick.', 'I was his teacher. When the crowd laughed, I should have stood up and said: a wrong answer is the bravest kind. I said nothing.', 'The Fog is my mistake as much as his. Please, bring him home.'];
// One-time news lines from the Hearthome villagers as each land is saved.
const VILLAGER_NEWS = {
  'Baker Pim': [['w1', 'Two cups of flour, not twenty! Numberwood is counting again, and so am I. Have a bun!'], ['w3', 'A climber from Atlas Peaks found her way here with a real map. She bought six loaves!'], ['w5', 'Lantern Isle sent us festival lanterns. I can read every wish on them.']],
  'Farmer Jo': [['w2', 'Sailors say Coral Cove tells true stories again. No more singing crabs.'], ['w4', 'Hear that? The Great Clock in the canyon is ticking in order. My hens are laying on time again.']],
};
const VILLAGER_SAVED = {
  'Little Fen': 'Twelve acorns! I counted them all by myself. Old Tally checked.',
  'Diver Lin': 'A whale is a mammal. I looked it up, and Captain Marlow agreed!',
  'Climber Bo': 'My compass points north again. Marta is drawing new maps for everyone.',
  'Gear Boy Ozzy': 'Red, blue, red, blue, RED! Old Tick let me wind the clock today.',
  'Lantern Kid Yu': 'I wrote my wish on a lantern: I wish to learn one new word every day.',
};
