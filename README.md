# Radioso website

Marketing site for Radioso. Next.js 16 (App Router), Tailwind v4, statically
exported and served from Firebase Hosting.

## Develop

```bash
pnpm install
pnpm run dev        # http://localhost:3002
pnpm run lint
pnpm run build      # static export → ./out
pnpm run preview    # serve ./out locally
```

## Agent answers

`lib/agent.ts` `fetchAnswer()` calls the live Radioso grounded API through a
**headless embed token**: it exchanges the token for a public session, then posts
the question to the public chat endpoint. If the live call fails (local dev, an
origin not on the workspace allowlist, or message-route CORS not yet deployed) it
falls back to canned answers so the page never breaks.

Config (optional — sensible defaults baked in, inlined at build):

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_RADIOSO_API_BASE` | `https://platform.radioso.dev` | Embed/public-chat host |
| `NEXT_PUBLIC_RADIOSO_EMBED_TOKEN` | the site's marketing token | Headless embed token (public, origin-locked) |

For the live API to work from the browser, the site's origin (production domain
**and** `http://localhost:3002` for dev) must be added to the agent workspace's
website-embed **allowed origins** in the Radioso dashboard. Until then the page
serves the canned fallback.

## Deploy (Firebase Hosting)

The site is a fully static export (`output: 'export'` in `next.config.mjs`), so
hosting serves the plain files in `out/`.

### One-time setup

The Firebase project is **`radioso-live`** (set in `.firebaserc` and the deploy
workflow). To enable CI deploys, add one GitHub Actions secret:

1. In the Firebase/GCP console, create a service account with the
   **Firebase Hosting Admin** role and download its JSON key.
2. In the GitHub repo settings add secret `FIREBASE_SERVICE_ACCOUNT` = the
   service-account JSON.

### Continuous deploy

`.github/workflows/deploy.yml` builds and deploys on every push to `main`
(live channel) and posts a preview channel on pull requests.

### Manual deploy

```bash
pnpm run build
npx firebase-tools deploy --only hosting --project radioso-live
```
