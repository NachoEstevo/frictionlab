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
- `BROWSERLESS_WS_URL`
- `BLOB_READ_WRITE_TOKEN`
- `ENABLE_REMOTION_RENDER=false`

Screenshot capture is active only when both `BROWSERLESS_TOKEN` and `BLOB_READ_WRITE_TOKEN` are present. With one or both missing, audits continue and persist a fallback screenshot record instead of failing the workflow.

Webapp agent audits:

- `WEBAPP_BROWSER_PROVIDER=browserless`
- `WEBAPP_MAX_STEPS=20`
- `AGENT_MAILBOX_HOST=imap.gmail.com`
- `AGENT_MAILBOX_PORT=993`
- `AGENT_MAILBOX_SECURE=true`
- `AGENT_MAILBOX_USER`
- `AGENT_MAILBOX_APP_PASSWORD`

Webapp audits require `BROWSERLESS_TOKEN` or `BROWSERLESS_WS_URL` to run the browser agent. Gmail confirmation requires `AGENT_MAILBOX_USER` and `AGENT_MAILBOX_APP_PASSWORD`. Without those optional credentials, the run records a partial result with explicit missing-integration evidence.

Never commit `.env`, `.env.local`, `.vercel/` or provider secrets.

## Deploy Flow

```bash
npm install
npm run verify
npx vercel deploy --prod
```

After connecting Postgres, apply migrations against the production database:

```bash
npm run prisma:migrate:deploy
```

If running migrations from a shell, make sure `DATABASE_URL` points at the production database for that command only.

If you want Vercel to run migrations during the build, set the Vercel project Build Command to:

```bash
npm run build:with-migrate
```

Use that only when the environment has `DATABASE_URL`; otherwise use the default `npm run build` and run `npm run prisma:migrate:deploy` manually before the smoke test.

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

For `auditType=WEBAPP`, the workflow also persists:

- `BrowserRun`: provider, status, start/final URL and redacted metadata.
- `BrowserStep`: action, URL, title, observation, optional screenshot and status.
- `MailboxEvent`: plus-addressed inbox alias, subject/from metadata, confirmation link/code status and errors.

The public events endpoint returns `agentRuns`, `toolCalls` and the webapp `browserRun` payload for polling.
