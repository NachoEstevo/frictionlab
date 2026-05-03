export type ScreenshotEvidenceRecord = {
  viewport: string;
  status: string;
  url: string | null;
  width: number | null;
  height: number | null;
  fallbackType: string | null;
  error: string | null;
};

export type PrimaryScreenshotEvidence = {
  kind: "image";
  viewport: string;
  status: string;
  url: string | null;
  width: number | null;
  height: number | null;
  message: string;
};

export function getPrimaryScreenshotEvidence(screenshots: ScreenshotEvidenceRecord[]): PrimaryScreenshotEvidence | null {
  const screenshot = screenshots.find(
    (item): item is ScreenshotEvidenceRecord & { url: string } => Boolean(item.url)
  );
  if (!screenshot) return null;

  return {
    kind: "image",
    viewport: screenshot.viewport,
    status: screenshot.status,
    url: screenshot.url,
    width: screenshot.width,
    height: screenshot.height,
    message: `${screenshot.viewport} screenshot captured.`
  };
}
