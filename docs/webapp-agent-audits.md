# Webapp Agent Audits

FrictionLab supports a second audit type for permitted signup and onboarding flows:

```json
{
  "auditType": "WEBAPP",
  "url": "https://app.example.com/signup",
  "targetAudience": "B2B SaaS operators evaluating workflow software",
  "conversionGoal": "Create an account and complete onboarding",
  "businessType": "saas",
  "scenarioPrompt": "Sign up, confirm the account, complete onboarding and identify friction.",
  "signupAllowed": true,
  "allowedDomains": ["app.example.com", "example.com"],
  "maxSteps": 12,
  "mailboxMode": "GMAIL_IMAP"
}
```

## Runtime Requirements

Minimum required for a real browser run:

```bash
BROWSERLESS_TOKEN=""
# or
BROWSERLESS_WS_URL=""
```

Required for autonomous email confirmation:

```bash
AGENT_MAILBOX_HOST="imap.gmail.com"
AGENT_MAILBOX_PORT="993"
AGENT_MAILBOX_SECURE="true"
AGENT_MAILBOX_USER="agent-inbox@gmail.com"
AGENT_MAILBOX_APP_PASSWORD=""
```

Optional screenshot persistence:

```bash
BLOB_READ_WRITE_TOKEN=""
```

Without Browserless, the run stops as `PARTIAL` with explicit missing-integration evidence. Without Gmail credentials, the browser can still inspect non-email-gated flows, but email confirmation records a mailbox failure event.

## Guardrails

- Only audit apps where we have permission to create test accounts.
- Set `allowedDomains` tightly; navigation outside those domains is blocked.
- The runner stops on captcha, 2FA, payment steps, credit-card requests and destructive actions.
- Passwords, tokens, cookies and authorization-like fields are redacted before persistence.
- Gmail is accessed through IMAP/API, not by visually logging into Gmail.
- Confirmation links are used only when their host is within `allowedDomains`.

## Smoke Test

1. Apply DB migrations:

```bash
npm run prisma:migrate:deploy
```

2. Verify runtime readiness:

```bash
curl https://frictionlab-rho.vercel.app/api/health/readiness
```

Expected webapp checks:

- `webappBrowser.status=ready` when Browserless is configured.
- `mailbox.status=ready` when Gmail IMAP credentials are configured.

3. Start a webapp audit:

```bash
curl -X POST https://frictionlab-rho.vercel.app/api/audits \
  -H "content-type: application/json" \
  -d '{
    "auditType": "WEBAPP",
    "url": "https://app.example.com/signup",
    "targetAudience": "B2B SaaS operators evaluating workflow software",
    "conversionGoal": "Create an account and complete onboarding",
    "businessType": "saas",
    "language": "en",
    "personaCount": 4,
    "demoMode": false,
    "scenarioPrompt": "Sign up, confirm the account, complete onboarding and identify friction.",
    "signupAllowed": true,
    "allowedDomains": ["app.example.com", "example.com"],
    "maxSteps": 12,
    "mailboxMode": "GMAIL_IMAP"
  }'
```

4. Poll events:

```bash
curl https://frictionlab-rho.vercel.app/api/audits/<auditRunId>/events
```

Confirm:

- `browserRun.steps` contains browser actions and observations.
- `browserRun.mailboxEvents` contains a confirmation event when email was needed.
- No password, token, cookie or authorization value appears in API JSON.

5. Open the dashboard:

```text
https://frictionlab-rho.vercel.app/audit/<auditRunId>
```

Expected result is `COMPLETED` when the flow finishes and AI succeeds, or `PARTIAL` with a clear reason when the target blocks automation, needs captcha/2FA/payment, or an optional integration is missing.
