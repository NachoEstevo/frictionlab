# FrictionLab Deployment

This app is built for Vercel with Next.js App Router, Prisma, Postgres and the Vercel AI SDK.

## Vercel Project

Current project from the first deploy:

- Team: `rely-team`
- Project: `frictionlab`
- Production URL: `https://frictionlab-rho.vercel.app`

The local `.vercel/` folder is ignored and must not be committed.

## Environment Variables

Set these in Vercel for Production and Preview as needed.

Required:

- `DATABASE_URL`: Postgres connection string. Attach a Vercel Marketplace Postgres provider or another managed Postgres database, then run the Prisma migration.

Required for real AI with direct providers:

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`

The configured fast and strong models each need a matching credential. With the default model routing, keep both keys because fast and strong model routing use different providers.

Direct provider model routing:

- `FRICTIONLAB_FAST_MODEL=openai:gpt-4.1-mini`
- `FRICTIONLAB_STRONG_MODEL=anthropic:claude-sonnet-4-5`

Vercel AI Gateway model routing:

- `AI_GATEWAY_API_KEY`
- `FRICTIONLAB_FAST_MODEL=openai/gpt-5.4-mini`
- `FRICTIONLAB_STRONG_MODEL=anthropic/claude-sonnet-4.6`

Gateway model ids use `provider/model`; `gateway:provider/model` is also accepted. On Vercel, OIDC-based Gateway auth can satisfy this without a static API key when the project is configured for AI Gateway.

Runtime behavior:

- `MOCK_MODE=false`
- `DEMO_FALLBACK=true`
- `NEXT_PUBLIC_APP_URL=https://frictionlab-rho.vercel.app`

Optional integrations:

- `BROWSERLESS_TOKEN`
- `BLOB_READ_WRITE_TOKEN`
- `ENABLE_REMOTION_RENDER=false`

Screenshot capture is active only when both `BROWSERLESS_TOKEN` and `BLOB_READ_WRITE_TOKEN` are present. With one or both missing, audits continue and persist a fallback screenshot record instead of failing the workflow.

Never commit `.env`, `.env.local`, `.vercel/` or provider secrets.

## Deploy Flow

```bash
npm install
npm test
npm run typecheck
npm run build
npx vercel deploy --prod
```

After connecting Postgres, apply migrations against the production database:

```bash
npx prisma migrate deploy
```

If running migrations from a shell, make sure `DATABASE_URL` points at the production database for that command only.

## Health Check

Readiness endpoint:

```bash
curl https://frictionlab-rho.vercel.app/api/health/readiness
```

Expected states:

- `ready`: DB exists and the chosen mode is usable.
- `degraded`: DB exists, but real AI keys are missing; audits can run with fallback artifacts.
- `blocked`: a required runtime dependency is missing; currently this means `DATABASE_URL`.

## Audit Runtime

`POST /api/audits` now creates an `AuditRun` in `RUNNING` state and schedules the workflow after the response. The dashboard polls with `router.refresh()` until the run reaches `COMPLETED`, `PARTIAL`, `FAILED` or `DEMO`.

This avoids making the API request wait for fetch, extraction and AI synthesis inside the initial Vercel request.
