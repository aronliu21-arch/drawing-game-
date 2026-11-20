# Doodle Dash ✏️

A family drawing-and-guessing game. One player draws a word and everyone else races to type it. It runs in Safari on iPad and iPhone and in any desktop browser, with nothing to install, no accounts and no ads.

## How a game works

1. Each player opens the game on their own device and types a name. Everyone draws from the same list of **200 Grade 1 picture words**, each 5 letters or fewer (*frog*, *kite*, *cake*, …) in `js/words.js`.
2. One player taps **Create a private room** and gets a 4-digit room number and a QR code. Everyone else types the number or scans the code.
3. The host picks the number of rounds (1–6) and the draw time (60–150 s), then taps **Start**.
4. On each turn, the artist picks 1 of 5 words (🔊 reads a word aloud). Everyone else types guesses.
   - Letter hints appear as the time runs down (first letter first, never more than 40% of the word).
   - Kid spellings count: 1 slip on 4–7 letter words and 2 slips on longer words (*elefant* → elephant). Words with 3 or fewer letters must be exact. A near miss shows "so close!" to the guesser only.
   - Guessers score 50–100 points (faster = more), +10 for the first correct guess.
   - The artist earns 60% of every correct guesser's points, plus a +25 bonus when everyone gets it, so a good drawing pays about as much as a good guess.
   - Players who already know the word can only chat with each other, so nobody spoils it.
5. After the last round, a podium shows the winners. **Play again** keeps everyone in the room.

Drawing tools: pencil, eraser, paint bucket, 3 brush sizes, 16 colors, undo and clear.

**No repeats:** once anyone draws a word, it isn't offered again: not for the rest of the room (including **Play again**), and not in later games, because every device in the room remembers the words drawn there. When nearly all 200 words are used, the list starts over. **Reset word history (grown-ups)** on the home screen clears a device's memory behind a multiplication question.

## Two ways to play together

### A. Online link (any network, recommended)

Hosted free on GitHub Pages. Devices connect directly to each other (WebRTC). The free public PeerJS service only introduces the devices to each other. Works at home on the same Wi-Fi and also from different houses.

One-time setup:
1. **Make the repository public.** Free GitHub Pages doesn't serve private repositories. The code holds no names or personal data: names are typed on each device and stay there.
   Settings → General → Danger Zone → Change visibility → Public.
2. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
3. Merge to `main`. The workflow runs the tests and publishes the game at `https://<user>.github.io/drawing-game-/`.
4. On the iPad and iPhone, open the link in Safari → Share → **Add to Home Screen**.

The room lives on the host's device. If the host closes the game, the room ends.

### B. Home Wi-Fi only (no internet needed)

Run the small server on the MacBook (Node.js 18+):

```bash
npm start
```

It prints two addresses: `http://localhost:8080` for the Mac and `http://<Mac's IP>:8080` for the iPad and iPhone. Every device must be on the same Wi-Fi, and the Mac must stay awake.

## Develop and test

```bash
npm test                         # word list + game rules (no browser)
NODE_PATH=$(npm root -g) npm run e2e   # 3 browsers play a full game over the home-Wi-Fi relay
```

| File | What it does |
|---|---|
| `js/words.js` | The 200-word Grade 1 list (add more levels there; a level picker appears automatically) |
| `js/room.js` | The referee: turns, word choice, guess checking, hints, scoring. Runs on the host's device only |
| `js/net.js` | Peer-to-peer (PeerJS) and home-relay connections |
| `js/canvas.js` | Drawing board; replays the same operations on every device |
| `js/app.js` | Screens, drawing input, chat |
| `server/server.mjs` | Home-Wi-Fi server (static files + message relay) |

---

# 光靈大冒險 Lumi Quest 🏮 (in `lumi-quest/`)

A single-player RPG for Nora and Lucas. Explore six lands, capture and train creatures called Lumis, and clear King Mumble's Fog. Every battle move is powered by a question, and each land has its own subject and question style:

| Land | Subject | Question style |
|---|---|---|
| Numberwood | Maths | Number Duel (four choices) |
| Coral Cove | Science | Fact or Fib (true or false, plus choices) |
| Atlas Peaks | Geography | Map Quest (four choices) |
| Clockwork Canyon | Logic | Pattern Lock (sequences, tap-in-order, odd one out) |
| Lantern Isle | Chinese | Lantern Match (characters with zhuyin) |
| Fog Citadel | All of the above | Final battle |

It is one self-contained page (`lumi-quest/index.html`): canvas art, synthesized sound, no image or audio files. Progress saves per kid on the device (`localStorage`). When the page is opened as a claude.ai artifact by a signed-in viewer, each save is also written to that viewer's private artifact data, so it survives cleared browser storage and follows them to other devices. Saving happens after every change and again the moment the app is hidden. After merging to `main` it is served at `https://<user>.github.io/drawing-game-/lumi-quest/`.

```bash
node lumi-quest/build.mjs          # rebuild index.html after editing lumi-quest/src/
node lumi-quest/tests/check.cjs    # question and map checks (also part of npm test)
```

| File | What it does |
|---|---|
| `lumi-quest/src/questions.js` | Question generators (maths, logic) and banks (science, geography, Chinese), per kid |
| `lumi-quest/src/data.js` | Story, maps, Lumis, weapons, armour |
| `lumi-quest/src/animals.js` | Evolved Lumis: each species becomes its own animal at Level 6 |
| `lumi-quest/src/portraits.js` | Talking portraits shown beside dialog for every speaking character |
| `lumi-quest/src/fx.js` | Attack animations: four skill tiers per element, one per weapon kind |
| `lumi-quest/src/story.js` | Boss scenes, memories, villager news and King Mumble's backstory |
| `lumi-quest/src/art.js` | All drawing: heroes, Lumis, Fog creatures, tiles |
| `lumi-quest/src/world.js` | Walking, treasure, villagers, shop, teleport gate |
| `lumi-quest/src/battle.js` | Battles and the question screen |
| `lumi-quest/src/main.js` | Title, intro, hero creator, parent gate, main loop, `window.__test` hook |
