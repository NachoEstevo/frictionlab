# FrictionLab

FrictionLab is a real-first AI conversion research app for landing pages. A user submits a URL, target audience and conversion goal; the app extracts DOM evidence, runs structured AI synthesis, persists the audit in Postgres and publishes a shareable report plus a Presenter Report storyboard.

## Local Setup

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Required for persisted audits:

- `DATABASE_URL`

Required for real AI synthesis:

- `OPENAI_API_KEY` and/or `ANTHROPIC_API_KEY`

Useful modes:

- `MOCK_MODE=true` creates deterministic demo audits without AI keys.
- `DEMO_FALLBACK=true` lets blocked page fetches continue with explicit missing-information evidence.

## Runtime Checks

Use the readiness endpoint before a demo or deploy:

```bash
curl http://localhost:3000/api/health/readiness
```

`status=blocked` means audits cannot start, usually because `DATABASE_URL` is missing. `status=degraded` means the app can persist audits but will use fallback/template artifacts instead of real AI.

## Scripts

```bash
npm test
npm run typecheck
npm run build
npm run prisma:migrate
```

## Deployment

See [docs/deployment.md](docs/deployment.md).
