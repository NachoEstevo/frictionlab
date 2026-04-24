# FrictionLab — Presenter / Video Layer

## Feature name

**Presenter Report**

Optional marketing name:

**FrictionLab Presenter**

## Purpose

Turn the audit into a client-friendly 45–60 second presentation:

- storyboard/deck;
- voiceover script;
- captions;
- scene-by-scene narrative;
- optional Remotion video render.

This creates a wow output without making video rendering a hard dependency.

## Key decision

**Do not make video rendering P0.**

The P0 is a polished React storyboard/deck plus script. Remotion MP4 is P2 only if the main app is stable.

## Why this helps the hackathon

It combines FrictionLab with the best part of Showrunner AI:

> Not only does the agent find conversion friction, it packages the result into a client-ready presenter brief.

Judges see:

1. Agent workflow.
2. Synthetic user swarm.
3. Evidence-backed findings.
4. Shareable report.
5. Presenter/video-ready output.

## MVP behavior

From an existing audit report, generate:

- 5–7 scenes.
- 45–60s total duration.
- A title and subtitle.
- Narration per scene.
- Visual payload per scene.
- Captions per scene.
- Full voiceover script.
- Deck/storyboard UI.

## Scene structure

Recommended 6-scene format:

1. **Intro** — what was audited and for whom.
2. **Conversion Score** — score and overall risk.
3. **Synthetic User Reactions** — 2–3 persona outcomes.
4. **Top Friction** — biggest blocker with evidence.
5. **Recommended Fixes** — top 3 actions.
6. **Before/After Hero** — strongest copy rewrite and CTA.

## Presenter schema

```ts
import { z } from "zod";

export const PresenterSceneSchema = z.object({
  id: z.string(),
  order: z.number(),
  title: z.string(),
  narration: z.string(),
  visualType: z.enum([
    "intro",
    "score",
    "screenshot",
    "persona",
    "finding",
    "recommendation",
    "copy_before_after",
    "outro"
  ]),
  visualPayload: z.record(z.any()),
  durationSeconds: z.number().min(3).max(15),
  caption: z.string(),
});

export const PresenterReportSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  durationSeconds: z.number().min(30).max(90),
  voiceoverScript: z.string(),
  executiveScript: z.string().optional(),
  scenes: z.array(PresenterSceneSchema).min(5).max(8),
  captions: z.array(z.string()),
});
```

## Prompt for Presenter Agent

```txt
You are the Presenter Agent for FrictionLab.

Your job is to convert a conversion audit report into a 45–60 second client-ready presentation.

Input:
- Audit report
- Conversion score
- Top findings
- Persona outcomes
- Recommendations
- Copy variants
- Screenshot URLs if available

Create a concise storyboard with 5–7 scenes.

Rules:
- Be direct and client-ready.
- Do not invent new findings.
- Use only findings and recommendations from the report.
- The narration should sound like a sharp growth/UX consultant.
- Each scene must have a visualType and visualPayload.
- The output must work as a deck even if video render is disabled.
- Keep total duration between 45 and 60 seconds.

Return only structured JSON matching PresenterReportSchema.
```

## UI components

### `PresenterReport`

Main wrapper.

Shows:

- Title.
- Duration.
- Render status.
- Storyboard.
- Script.
- Captions.

### `PresenterStoryboard`

Horizontal or vertical sequence of scene cards.

### `SceneCard`

Shows:

- Scene number.
- Title.
- Duration.
- Visual placeholder.
- Caption.
- Narration.

### `VideoPreview`

States:

- `disabled`: render not available.
- `not_requested`: button to render.
- `queued`.
- `rendering`.
- `ready`: video player/link.
- `failed`: show fallback storyboard.

### `RenderStatus`

Small card for render state.

## Optional Remotion architecture

Only implement after core is stable.

```txt
POST /api/presenter/[auditRunId]/render
  → validate PresenterReport exists
  → if ENABLE_REMOTION_RENDER !== true, return DISABLED
  → render video from scene data
  → upload MP4 to Blob
  → update PresenterReport.videoUrl + renderStatus READY
```

## Remotion fallback behavior

If any of these happen:

- Remotion dependency fails.
- Render exceeds timeout.
- Blob upload fails.
- Env disabled.

Then:

- Set `renderStatus = FAILED` or `DISABLED`.
- Keep storyboard and script visible.
- Never fail the audit/report.

User-facing message:

> Video render is unavailable, but the presenter storyboard and script are ready.

## Demo positioning

When showing it:

> “The final step packages the audit into a presenter-ready brief. For the hackathon demo, the storyboard is the stable output. If rendering is enabled, the same scene data can be rendered into a 60-second Remotion video.”

## P0 tasks

- [ ] Add `PresenterReport` and `PresenterScene` models.
- [ ] Add presenter Zod schemas.
- [ ] Add `generatePresenterReport` AI function.
- [ ] Add `POST /api/presenter/[auditRunId]`.
- [ ] Add presenter tab/page in UI.
- [ ] Add seeded presenter data.
- [ ] Add render status card with disabled/fallback state.

## P1 tasks

- [ ] Add presenter deck preview.
- [ ] Add shareable presenter tab.
- [ ] Add copy-to-clipboard script.
- [ ] Add scene timing summary.

## P2 tasks

- [ ] Add Remotion composition.
- [ ] Add render endpoint.
- [ ] Upload MP4 to Blob.
- [ ] Add video player.
- [ ] Add download link.

## Non-goals

- No AI avatar.
- No voice generation.
- No perfect video editor.
- No complex transitions.
- No blocking render pipeline.
- No video as required output.

## Example storyboard content

```json
{
  "title": "LaunchPilot Conversion Audit",
  "subtitle": "60-second synthetic UX research brief",
  "durationSeconds": 58,
  "scenes": [
    {
      "id": "scene_intro",
      "order": 1,
      "title": "What we tested",
      "visualType": "intro",
      "durationSeconds": 7,
      "caption": "Synthetic users evaluated LaunchPilot for B2B SaaS founders.",
      "narration": "We tested LaunchPilot's landing page with four synthetic buyer profiles focused on booking a demo."
    },
    {
      "id": "scene_score",
      "order": 2,
      "title": "Conversion score",
      "visualType": "score",
      "durationSeconds": 8,
      "caption": "Score: 64/100. Main risk: offer clarity before trust is established.",
      "narration": "The page scored 64 out of 100. The biggest issue is not visual polish, it's clarity and trust before the CTA."
    }
  ]
}
```

