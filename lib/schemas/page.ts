import { z } from "zod";

export const PageSectionTypeSchema = z.enum([
  "hero",
  "benefits",
  "features",
  "proof",
  "pricing",
  "faq",
  "cta",
  "footer",
  "unknown"
]);

export const PageSectionSchema = z.object({
  id: z.string(),
  order: z.number().int().positive(),
  type: PageSectionTypeSchema,
  heading: z.string().optional(),
  text: z.string(),
  ctas: z.array(z.string()).default([])
});

export const PageLinkSchema = z.object({
  label: z.string(),
  href: z.string().optional()
});

export const PageSnapshotSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  visibleText: z.string(),
  sections: z.array(PageSectionSchema),
  ctas: z.array(z.string()),
  links: z.array(PageLinkSchema),
  metadata: z.record(z.string(), z.unknown()).optional()
});

export type PageSection = z.infer<typeof PageSectionSchema>;
export type PageSnapshot = z.infer<typeof PageSnapshotSchema>;
