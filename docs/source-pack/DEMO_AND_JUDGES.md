# FrictionLab — Demo Script and Judge Questions

## 2-minute demo script

### Opening — 15s

“Landing pages usually fail before analytics can explain why. Founders waste ad spend, agencies rely on opinion, and user testing takes time. FrictionLab runs a synthetic UX research swarm before real users bounce.”

### Input — 15s

“Here I paste a landing page URL, define the target customer and the conversion goal. For this demo: B2B SaaS founders trying to book a demo.”

### Live swarm — 25s

“The audit starts a Vercel Workflow. It extracts the page, captures snapshots, generates personas and runs synthetic sessions. Here you can see the swarm live: each synthetic user has a different motivation, trust sensitivity, price sensitivity and device.”

### Persona session — 20s

“Let’s open Diego, the technical evaluator. He understands the category, but hesitates because the hero doesn’t explain integration depth. The key part: every friction point links back to page evidence.”

### Findings — 20s

“The aggregator merges all sessions into a friction map. The top blocker is offer clarity, affecting three personas. Trust proof is weak for high-skepticism users. Pricing/process clarity is missing.”

### Recommendations/copy — 15s

“FrictionLab turns research into action: prioritized fixes, impact/effort, hero rewrites, CTA variants and FAQs.”

### Presenter Report — 15s

“Then it packages the audit into a Presenter Report: a 60-second client-ready storyboard with narration, captions and scene visuals. If rendering is enabled, these scenes can become a Remotion video; if not, the deck is already shareable.”

### Shareable report — 10s

“Finally, it publishes a client-ready report you can share with a founder, client or team.”

### Close — 10s

“This is not a chatbot reviewing a landing page. It’s an evidence-backed, multi-step AI research workflow running on Vercel.”

## What to show if everything works

1. Setup page.
2. Live workflow timeline.
3. Synthetic swarm dashboard.
4. Persona detail.
5. Evidence drawer.
6. Findings dashboard.
7. Final report.
8. Presenter Report storyboard.
9. Shareable report.

## If screenshot fails

Say:

“Screenshot capture failed, but because this is a durable workflow, the audit continues with DOM evidence.”

Show:

- DOM evidence map.
- Findings still generated.
- Banner: “Screenshot failed, continuing with DOM evidence.”

## If URL fetch fails

Say:

“Some sites block automated fetches, so the product has fallback and pre-cached demo runs. The workflow can still be evaluated.”

Show:

- Load demo audit.
- LaunchPilot seeded run.

## If workflow fails

Say:

“This is the completed output from the same workflow path. The UI contract is the same: every step persists status and output.”

Show:

- Seeded completed run.
- Event feed.
- Final report.

## If video render fails

Say:

“Video rendering is optional. The stable presenter output is the generated storyboard, script and captions. The same scene data can be rendered later.”

Show:

- Presenter Report.
- Render status: disabled/failed.
- Storyboard and script.

## Do not show

- Raw logs for too long.
- Incomplete auth/billing.
- Broken Remotion render.
- External integrations that are not stable.
- Random untested URL.
- Code unless judges ask.
- Long prompt details.

---

# Judge questions and answers

## Why is this an agent?

Because it does not just generate text. It uses tools, captures page evidence, creates synthetic evaluators, runs multiple structured sessions, aggregates findings, handles fallbacks, persists state and produces an actionable report through a workflow.

## How is this different from asking ChatGPT to review a landing page?

ChatGPT gives one generic opinion. FrictionLab runs a structured research process: page extraction, screenshots, evidence map, multiple personas, session timelines, scoring, aggregation, recommendations, copy variants, shareable report and presenter brief.

## Are synthetic users actually useful?

They do not replace real users. They are useful as a pre-flight diagnostic to catch obvious clarity, trust, pricing and CTA problems before spending money on traffic or human research.

## How do you avoid hallucinated feedback?

Every finding must cite extracted page evidence. If information is missing, the system marks it as missing information instead of inventing it. Outputs are constrained by Zod schemas and retried/validated.

## What tools does the agent use?

It uses tools for creating audit runs, fetching HTML, extracting visible content, capturing screenshots, detecting sections, generating personas, running sessions, aggregating findings, scoring conversion, generating recommendations, generating copy variants, producing a report and generating the presenter storyboard.

## Why use Workflow?

The audit is naturally long-running and multi-step. Workflow gives durable steps, retries, state and recovery if one part fails. That is better than one fragile API call.

## Why use Vercel?

The entire app is built around Vercel: v0 for UI, Next.js deployment, AI SDK, AI Gateway, Workflow, Blob storage and serverless infrastructure.

## How would this become a real product?

Start with founders and agencies as pay-per-audit. Then add team workspaces, historical benchmarks, recurring audits, task export, analytics integrations and optional human expert review.

## Who pays for it?

Agencies, indie founders, SaaS marketers, ecommerce teams and productized service businesses.

## How do you price it?

Free limited audit, pay-per-audit for founders, subscription for agencies and enterprise/white-label for larger teams.

## What are the limitations?

Synthetic users identify likely friction but do not replace real behavior. Some pages block fetching. Screenshots can fail. Quality depends on evidence extraction and prompt discipline.

## What would you build next?

Multi-page funnel audits, competitor comparison, analytics/session replay integrations, GitHub/Linear task export and optional human researcher review.

