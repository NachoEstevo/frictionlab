import { getScreenshotFallbackMessage, isPrivateBlobStorePublicAccessError } from "@/lib/screenshots/blob-errors";

type ScreenshotViewport = "desktop" | "mobile";

type ScreenshotRecord = {
  viewport: ScreenshotViewport;
  status: "COMPLETED" | "FAILED" | "FALLBACK";
  url?: string;
  blobPath?: string;
  width?: number;
  height?: number;
  fallbackType?: "DOM_SNAPSHOT";
  error?: string;
};

type CaptureAuditScreenshotsInput = {
  auditRunId: string;
  url: string;
  browserlessToken?: string;
  fetcher?: typeof fetch;
  uploadScreenshot?: ScreenshotUploader;
};

type ScreenshotUploader = (input: {
  pathname: string;
  image: ArrayBuffer;
  contentType: string;
}) => Promise<{ url: string; pathname: string }>;

const browserlessScreenshotEndpoint = "https://production-sfo.browserless.io/screenshot";
const screenshotViewports: Array<{ viewport: ScreenshotViewport; width: number; height: number; isMobile?: boolean }> = [
  { viewport: "desktop", width: 1440, height: 1100 },
  { viewport: "mobile", width: 390, height: 844, isMobile: true }
];

export async function captureAuditScreenshots(input: CaptureAuditScreenshotsInput): Promise<ScreenshotRecord[]> {
  const browserlessToken = input.browserlessToken;

  if (!browserlessToken) {
    return screenshotViewports.map(({ viewport }) =>
      fallbackScreenshot(viewport, "BROWSERLESS_TOKEN is not configured; audit continued with DOM evidence.")
    );
  }

  if (!input.uploadScreenshot) {
    return screenshotViewports.map(({ viewport }) =>
      fallbackScreenshot(viewport, "BLOB_READ_WRITE_TOKEN is not configured; screenshot capture requires durable Blob storage.")
    );
  }

  return Promise.all(
    screenshotViewports.map((viewport) => captureViewportScreenshot({ ...input, browserlessToken }, viewport))
  );
}

async function captureViewportScreenshot(
  input: CaptureAuditScreenshotsInput & { browserlessToken: string },
  viewportConfig: (typeof screenshotViewports)[number]
): Promise<ScreenshotRecord> {
  try {
    const fetcher = input.fetcher ?? fetch;
    const response = await fetcher(`${browserlessScreenshotEndpoint}?token=${encodeURIComponent(input.browserlessToken)}`, {
      method: "POST",
      headers: {
        "Cache-Control": "no-cache",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: input.url,
        options: {
          fullPage: true,
          type: "png"
        },
        viewport: {
          width: viewportConfig.width,
          height: viewportConfig.height,
          deviceScaleFactor: 1,
          isMobile: Boolean(viewportConfig.isMobile)
        },
        gotoOptions: {
          waitUntil: "networkidle2",
          timeout: 30_000
        },
        bestAttempt: true
      }),
      signal: AbortSignal.timeout(45_000)
    });

    if (!response.ok) {
      throw new Error(`Browserless screenshot failed with ${response.status} ${response.statusText}`.trim());
    }

    const contentType = response.headers.get("content-type") || "image/png";
    const image = await response.arrayBuffer();
    const pathname = buildScreenshotPath(input.auditRunId, input.url, viewportConfig.viewport);

    if (!input.uploadScreenshot) {
      return {
        viewport: viewportConfig.viewport,
        status: "COMPLETED",
        width: viewportConfig.width,
        height: viewportConfig.height,
        blobPath: pathname
      };
    }

    const uploaded = await input.uploadScreenshot({ pathname, image, contentType });
    return {
      viewport: viewportConfig.viewport,
      status: "COMPLETED",
      url: uploaded.url,
      blobPath: uploaded.pathname,
      width: viewportConfig.width,
      height: viewportConfig.height
    };
  } catch (error) {
    if (isPrivateBlobStorePublicAccessError(error)) {
      return fallbackScreenshot(
        viewportConfig.viewport,
        getScreenshotFallbackMessage(error, "Screenshot upload failed; audit continued with DOM evidence.")
      );
    }

    return {
      ...fallbackScreenshot(
        viewportConfig.viewport,
        error instanceof Error ? error.message : "Screenshot capture failed."
      ),
      status: "FAILED"
    };
  }
}

function fallbackScreenshot(viewport: ScreenshotViewport, error: string): ScreenshotRecord {
  return {
    viewport,
    status: "FALLBACK",
    fallbackType: "DOM_SNAPSHOT",
    error
  };
}

function buildScreenshotPath(auditRunId: string, url: string, viewport: ScreenshotViewport): string {
  const hostname = new URL(url).hostname.replace(/^www\./, "");
  const slug = hostname.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "page";

  return `audits/screenshots/${auditRunId}/${slug}-${viewport}.png`;
}
