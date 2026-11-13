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
