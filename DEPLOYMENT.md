# Deployment Guide

This project has two deploy targets:

1. `apps/web` on Vercel
2. `apps/signaling` on Cloudflare Workers

The fastest path is to deploy the signaling worker first, then point the web app at the worker URL.

## What you need

- A GitHub repo connected to your deployments
- A Vercel account
- A Cloudflare account
- Node.js 22+ and `pnpm` if you want to test locally before deploying

## One-time setup

### 1) Cloudflare account

Any free Cloudflare account works, and no KV or other resources are needed. Keep the Durable Object migration in sqlite format (`new_sqlite_classes`) so deploys are accepted on the free plan.

### 2) Set the production signaling URL

The web app must know the deployed WebSocket URL for signaling.

Set `NEXT_PUBLIC_SIGNALING_URL` to the worker URL, for example:

```env
NEXT_PUBLIC_SIGNALING_URL=wss://your-worker.your-subdomain.workers.dev
```

For local development, the repo uses:

```env
NEXT_PUBLIC_SIGNALING_URL=ws://localhost:8787
```

## Deploy signaling to Cloudflare Workers

### Option A: Deploy from your machine

From the repository root:

```bash
pnpm install
pnpm --filter signaling run deploy
```

If this is your first time using Wrangler, log in first:

```bash
pnpm --filter signaling exec wrangler login
```

After deployment, note the public worker URL. You will use it in the web app environment variable.

### Option B: Deploy from CI

If you deploy from GitHub Actions or another CI system, add these secrets:

- `CF_API_TOKEN`
- `CF_ACCOUNT_ID`

Then run the same `pnpm --filter signaling run deploy` command in CI.

## Deploy the web app to Vercel

### Recommended setup

1. Import the repository into Vercel.
2. Set the root directory to `apps/web`.
3. Add the environment variable `NEXT_PUBLIC_SIGNALING_URL` with the production worker URL.
4. Deploy.

That is usually enough for a clean production release.

### If you deploy from the monorepo root

If you prefer to deploy the whole repo from one Vercel project, make sure the project is configured so that the web app build runs from `apps/web` and the `NEXT_PUBLIC_SIGNALING_URL` variable is still available at build time.

## Production checklist

Before sharing the app publicly, confirm these items:

- The Cloudflare worker deploys successfully and returns a healthy response at its URL.
- `NEXT_PUBLIC_SIGNALING_URL` in Vercel points to the production worker URL, not localhost.
- The web app opens and can create a room.
- A second browser tab can join the same room and connect.

## Minimal-effort deployment flow

If you want the shortest practical path, use this exact sequence:

```bash
pnpm install
pnpm --filter signaling run deploy
```

Then:

1. Copy the deployed worker URL.
2. Set `NEXT_PUBLIC_SIGNALING_URL` in Vercel.
3. Deploy `apps/web` on Vercel.

## Troubleshooting

### Web app cannot connect to signaling

- Check that `NEXT_PUBLIC_SIGNALING_URL` is a `wss://` URL in production.
- Verify the worker is deployed and publicly reachable.
- Make sure the worker URL in Vercel matches the current deployment.

### Rooms fail to join or connect

- Check Cloudflare Worker logs for errors.
- Make sure you open the full room URL, including the `#key` part, in both browsers.

### Local dev works but production does not

- Local dev uses `ws://localhost:8787`.
- Production must use the deployed `wss://...` worker URL.
- Double-check that Vercel has the production environment variable set for both preview and production environments if needed.

## Useful commands

```bash
pnpm dev:signaling
pnpm dev:web
pnpm --filter signaling run deploy
pnpm build
pnpm typecheck
```

# In-Short

Deployment steps:

1. Create a GitHub repo and push your code.
2. Create a Cloudflare account.
3. Log in with `pnpm --filter signaling exec wrangler login`.
4. If deploying from GitHub Actions, set the `CF_API_TOKEN` and `CF_ACCOUNT_ID` repo secrets for that account.
5. Deploy the signaling worker with pnpm --filter signaling run deploy.
6. Copy the deployed worker URL, for example wss://your-worker.your-subdomain.workers.dev.
7. Create a Vercel project from the same GitHub repo.
8. Set the root directory to apps/web.
9. Add NEXT_PUBLIC_SIGNALING_URL in Vercel and point it to the production worker URL.
10. Deploy the web app.

Open the Vercel URL, create a room, copy the link, and test it in a second tab.
After that, connect your custom domain in Vercel if you want a branded URL.
