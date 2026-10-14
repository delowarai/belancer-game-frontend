# Public portfolio demo on Netlify

This build runs entirely in the browser. It does not require the developer's PC or FastAPI server. All games are free practice; progress is stored in the visitor's browser. Accounts, payments, shared rankings and admin services are not available in the public demo.

## GitHub deployment

1. Sign in to Netlify with GitHub.
2. Add a new project and import `delowarai/belancer-game-frontend`.
3. Choose the branch containing this configuration.
4. Build command: `npm run build:portfolio`.
5. Publish directory: `dist`.
6. Deploy. Netlify provides a public HTTPS URL; future GitHub pushes rebuild it.

The included netlify.toml supplies the build settings and SPA fallback so direct game links work.

## Manual upload

Run `npm ci` and `npm run build:portfolio`, then upload the generated dist folder using Netlify's manual deployment interface.

The normal `npm run dev` and `npm run build` retain the full backend-connected application. Do not put credentials or payment keys in this static build.
