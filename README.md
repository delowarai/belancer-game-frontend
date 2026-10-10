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

Belancer Bird Launch: open `/play/bird-launch` or choose it in the catalog. After the shared countdown, drag the supplied bird and release. Angle/power sliders are hidden; keyboard users can focus the canvas, use arrows to aim, +/− to change pull and Space to launch. Matter.js handles tower collisions. There are 11 distinct levels with sequential unlocking, replay, variable shot budgets, stars, collectible badges and 50–200 practice coins per completed level. Coins are collected once per level; replay can improve the best stars. Progress is saved in this browser's local storage and is shared by users of that browser, not synchronized with an account or backend. These rewards have no monetary value and never affect ranked API scores or leaderboards. Run `npm ci` after pulling to install the physics dependency.
