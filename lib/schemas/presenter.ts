import { z } from "zod";

export const PresenterSceneSchema = z.object({
  id: z.string(),
  order: z.number().int().positive(),
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
  visualPayload: z.record(z.string(), z.unknown()),
  durationSeconds: z.number().int().min(3).max(15),
  caption: z.string()
});

export const PresenterReportSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  durationSeconds: z.number().int().min(30).max(90),
  voiceoverScript: z.string(),
  executiveScript: z.string().optional(),
  scenes: z.array(PresenterSceneSchema).min(5).max(8),
  captions: z.array(z.string()),
  renderStatus: z.enum(["NOT_REQUESTED", "QUEUED", "RENDERING", "READY", "FAILED", "DISABLED"]).default("DISABLED")
});

export type PresenterReport = z.infer<typeof PresenterReportSchema>;
export type PresenterScene = z.infer<typeof PresenterSceneSchema>;
