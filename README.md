# Belancer Game frontend

Requires Node.js 22+ and npm. Open this repository in WebStorm and select your Node.js interpreter.

```powershell
npm ci
npm run dev
```

Open http://localhost:5173. The backend must be running on http://localhost:8000. Vite proxies `/api` to it; cookies stay on the browser origin. Port 5173 is enforced so the frontend origin matches the backend CSRF configuration. If it is occupied, stop the other server first.

```powershell
npm run build
```

This produces `dist/` for hosting. Vite preview previews static output only; it does not provide the development API proxy. Do not use it as the full application server.

Smoke check: register, log out, log in, play a Math Sprint challenge, open the leaderboard and dashboard. Practice can run without login; ranked challenges require the API.

Never commit `.env`, local IDE configuration or dependency folders.

Step 2 includes adaptive Memory Grid practice, timed games, ranked rules v2, action retries, and same-browser session recovery. Backend migrations must be upgraded at the same time. Game-engine tests: `npm test`.
