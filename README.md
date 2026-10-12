# Belancer Game frontend

Requires Node.js 22+ and npm. Open this repository in WebStorm and select your Node.js interpreter.

```powershell
npm ci
npm run dev
```

Open http://localhost:5173. The backend must be running on http://localhost:8000. Vite proxies `/api` to it; cookies stay on the browser origin. Port 5173 is enforced so the frontend origin matches the backend CSRF configuration. If it is occupied, stop the other server first.

The proxy connects directly to `127.0.0.1:8000` to avoid localhost IPv6 resolution differences. The updated backend also accepts opening the frontend at `http://127.0.0.1:5173` during local development. Use one hostname consistently after login.

```powershell
npm run build
```

This produces `dist/` for hosting. Vite preview previews static output only; it does not provide the development API proxy. Do not use it as the full application server.

Smoke check: register, log out, log in, play a Math Sprint challenge, open the leaderboard and dashboard. Practice can run without login; ranked challenges require the API.

The games catalog groups activities by skill and includes several local practice games in each category. Local practice scores are not stored in ranked progress or leaderboards; ranked play remains limited to games supported by the backend. The homepage also explains the available skill areas, offers play tips and FAQs, and links visitors to the game catalog and daily challenges.

Never commit `.env`, local IDE configuration or dependency folders.

Step 2 includes adaptive Memory Grid practice, timed games, ranked rules v2, action retries, and same-browser session recovery. Backend migrations must be upgraded at the same time. Game-engine tests: `npm test`.

Step 3 adds `/admin` with Overview, Users, Games, Challenges, Results, Content and Audit. The backend must be migrated to 0003. Provision your first admin using the operator command in the backend README; refresh the browser to see the Admin link. Game settings and public content come from the API; published challenge configuration remains fixed.

Step 4: /settings supports username/password updates and sign out everywhere; /dashboard and /progress show per-game metrics, UTC streaks and paginated activity. Pull the matching backend and restart both servers.

Step 5: /leaderboards supports daily, weekly and all-time periods, UTC dates, challenge setting profiles, your rank and pagination. Pull the matching backend before restarting.

Brand palette: all screens use the Belancer UI/UX Kit 2026 colors through src/theme.css. See [docs/BRAND_THEME.md](docs/BRAND_THEME.md) for tokens and visual validation. Restart Vite after pulling.

Belancer Bird Launch: open `/play/bird-launch` or choose it in the catalog. After the shared countdown, drag the supplied bird and release. Angle/power sliders are hidden; keyboard users can focus the canvas, use arrows to aim, +/− to change pull and Space to launch. Matter.js handles tower collisions. There are 30 distinct levels with sequential unlocking, replay, variable shot budgets, stars, collectible badges and 50–575 practice coins per completed level. Coins are collected once per level; replay can improve the best stars. Progress is saved in this browser's local storage and is shared by users of that browser, not synchronized with an account or backend. These rewards have no monetary value and never affect ranked API scores or leaderboards. Run `npm ci` after pulling to install the physics dependency.

Bird Launch city update: colored bird targets replace bullseyes. Day, sunset and night skylines follow the level tiers; platforms have wood grain, metal bands and bolts. Each level increases platform density and target impact resistance, later levels add permanent steel barriers, and shots per target tighten. Level completion opens an accessible modal with earned coins, current level points, total saved coins/points, badge and stars. Coins remain once per level and saved points keep the best completed score (100 per cleared bird plus 50 per remaining shot). Existing star-only browser saves migrate automatically. These are local practice rewards; clearing browser data removes them. Difficulty is a handcrafted demo and may need further balancing from play feedback.

Mini Sudoku is available at `/play/mini-sudoku` and under Math in the catalog. It offers uniquely solvable 6×6 (2×3 boxes), 8×8 (2×4 boxes), and 10×10 (2×5 boxes) puzzles, Easy/Medium/Hard, timer, notes, clear, undo, reset and three hints per puzzle/reset. Hint highlights its row/column and explains a logical single or, when necessary, explicitly labels a solution reveal; Fill it applies it. Dismissing a hint does not refund it, and Undo does not refund used hints. Keyboard arrows select cells, number keys enter digits, Delete clears, and 0 enters 10 on the largest board. Size/difficulty changes start a new puzzle and discard the current session. This game is local practice only and has no ranked API score.

Additional Sudoku board sizes: 4×4 (2×2 boxes), classic 9×9 (3×3 boxes), and 12×12 (3×4 boxes). All six sizes support unique puzzles and guided hints. Use the number buttons for 11 and 12; keyboard 0 enters 10.

Bird Launch presentation includes animated city scenery, flight trails, hit feedback, optional synthesized sound (off by default), pause/resume (P), expanded playfield and district cards. Reduced-motion preferences suppress decorative motion. The 30-level adventure and cosmetic coins/stars remain browser-local practice rewards, not authoritative ranked scores or account-synced currency.

Campaign progression: levels 1–5 Easy, 6–15 Medium, 16–30 Hard. Existing 11-level saves retain their completed stars and points; new districts unlock sequentially. The mission dashboard shows shot tokens, clear progress and total rewards. Platform trims and reinforced footings are visual details; difficulty comes from actual density, impact thresholds, barriers and shot budgets. First-launch physics remains frozen to prevent pre-shot collapse.

Nuts & Bolts: `/play/nuts-bolts` is an original SVG workshop puzzle with 20 Easy/Medium/Hard levels. Select an exposed screw and move it into an uncovered level hole or a limited spare hole. Shared screws support multiple overlapping plates; a plate swings down around its remaining screw, then drops when that last screw is removed. Undo restores the previous screw layout and exact plank poses and velocities, hints show a legal transfer, pause stops the timer, and restart resets the current level. Mouse, touch, Tab/Enter/Space and optional synthesized sound are supported. Stars and once-per-level coins save locally under `belancer-bolts-v1`; these cosmetic practice rewards are not account-synced or ranked. Released planks use Matter.js gravity, friction and collisions with remaining screws and other planks. A caught plank remains visible; moving the blocking screw releases it. Rewards wait for every plank to leave the board. Undo restores physical poses. Only original plank holes and limited spare holes are available in early levels. Dense later layouts add two recovery holes (three in the last two levels), verified with collision-based solutions. Selection and hints use current plank geometry. Tests verify actual collision-based solutions across all 20 levels. Timer and physics pause while the page is hidden. Stars and rewards remain browser-local practice progress.

### Belancer Highway Rush

Original procedural Three.js racing at `/play/highway-rush`, listed under Speed (More games). Career and Time Challenge each have 12 progressively harder districts and four AI competitors. Top-three finishes unlock the next race. First/improved podium stars award the reward difference; replaying the same finish awards no additional coins. Endless and Free Ride include traffic, rivals and a manual End Drive option.

The garage includes three cars, five paints and four upgrade steps for speed, handling and brakes. Keyboard and simultaneous touch controls, auto/manual acceleration, pause on tab switch, engine audio, speed units, profile and result standings are included. WebGL/hardware acceleration is required. Models and environments are original geometric assets, not MR RACER assets.

This is local practice: progress, cosmetic coins and XP save in this browser only. Competitors are AI, not online players. No account sync, real-money rewards or ranked leaderboard submission is implemented for racing. Server-authoritative ranked games remain separate.

### Belancer Snake Arena

`/play/snake-arena` is an original canvas practice game under Speed → More games. Six cosmetic skins, four arena themes, 16 AI competitors, a mini-map and live AI standings accompany Survival (3 minutes), Growth Sprint (800 weight in 90 seconds) and Endless modes. Mouse, keyboard, touch-point and floating-joystick controls are supported. Boost consumes weight; enemy body and boundary collisions end the run, while your own body is safe. Defeated AI snakes leave food and respawn.

Run-end rewards, coins, XP, best weight, skin purchases, a once-per-browser-day gift/free wheel and a 30-food achievement chest save locally. Reward recording is guarded once per finished run. Sound effects and a volume slider start after a user gesture. These are local practice rewards, not real-money prizes or authoritative ranked scores; there is no online multiplayer or account synchronization. Clearing browser storage resets progress, and browser clocks/storage can be edited.

Nuts & Bolts workshop boosters: Unscrew removes an exposed screw, Hammer removes a chosen visible plank while retaining its screws, and Unlock Hole adds one spare hole per attempt. Each successful action costs 50 local practice coins; invalid actions are free and Undo restores both the physical snapshot and spending. A browser receives 100 starter coins; first clears award level coins once. Restart does not refund used boosters. Timer and physics pause while a booster dialog is open. These browser-local coins have no ranked value.
