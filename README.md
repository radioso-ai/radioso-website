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

The agent answers in the page are currently served by a local stub in
`lib/agent.ts`. To connect the real grounded API, replace `fetchAnswer()` there
with a `fetch` against the endpoint and map the response into `AgentAnswerData`.

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
