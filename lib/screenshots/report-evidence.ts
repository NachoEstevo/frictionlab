import { getScreenshotFallbackMessage, getScreenshotFallbackStatus } from "@/lib/screenshots/blob-errors";

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
  kind: "image" | "fallback";
  viewport: string;
  status: string;
  url: string | null;
  width: number | null;
  height: number | null;
  message: string;
};

export function getPrimaryScreenshotEvidence(screenshots: ScreenshotEvidenceRecord[]): PrimaryScreenshotEvidence | null {
  const screenshot = screenshots.find((item) => item.url) ?? screenshots[0];
  if (!screenshot) return null;

  if (screenshot.url) {
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

  return {
    kind: "fallback",
    viewport: screenshot.viewport,
    status: getScreenshotFallbackStatus(screenshot.status, screenshot.error),
    url: null,
    width: screenshot.width,
    height: screenshot.height,
    message: getScreenshotFallbackMessage(screenshot.error, "Screenshot unavailable; report is based on DOM evidence.")
  };
}
