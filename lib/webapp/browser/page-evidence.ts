import type { Page } from "playwright-core";
import type { PageSnapshot } from "@/lib/schemas/page";
import { uploadScreenshotToBlob } from "@/lib/screenshots/upload-screenshot-to-blob";
import { redactSecrets } from "@/lib/webapp/guards";
import type { WebappStepEvidence } from "@/lib/webapp/types";

export type BrowserObservation = {
  url: string;
  title: string;
  text: string;
  controls: string[];
};

export async function observeStep(
  page: Page,
  order: number,
  actionType: WebappStepEvidence["actionType"],
  target?: string,
  status: WebappStepEvidence["status"] = "COMPLETED",
  note?: string,
  screenshot?: { auditRunId: string; blobReadWriteToken?: string }
): Promise<WebappStepEvidence> {
  const observation = await getObservation(page).catch(() => ({
    url: page.url(),
    title: "",
    text: note || "No page text available.",
    controls: []
  }));

  return {
    order,
    actionType,
    target,
    url: observation.url,
    title: observation.title,
    observation: note || observation.text.slice(0, 1200),
    screenshotUrl: await captureStepScreenshot(page, order, screenshot),
    status,
    metadata: redactSecrets({ controls: observation.controls.slice(0, 20) })
  };
}

export async function getObservation(page: Page): Promise<BrowserObservation> {
  const [title, text, controls] = await Promise.all([
    page.title().catch(() => ""),
    page.locator("body").innerText({ timeout: 5_000 }).catch(() => ""),
    page
      .locator("a,button,input,textarea,select")
      .evaluateAll((elements) =>
        elements.slice(0, 60).map((element) => {
          const el = element as HTMLElement;
          return [
            el.tagName.toLowerCase(),
            el.getAttribute("aria-label"),
            el.getAttribute("placeholder"),
            el.getAttribute("name"),
            el.innerText,
            (el as HTMLInputElement).value
          ]
            .filter(Boolean)
            .join(": ");
        })
      )
      .catch(() => [])
  ]);

  return { url: page.url(), title, text: text.slice(0, 6000), controls };
}

export function buildSnapshot(url: string, steps: WebappStepEvidence[], error?: string): PageSnapshot {
  const visibleText = steps.map((step) => `${step.actionType}: ${step.observation}`).join("\n\n") || error || "No browser evidence.";
  return {
    title: "Webapp audit evidence",
    description: "Interactive browser session evidence captured by FrictionLab.",
    visibleText,
    sections: steps.map((step) => ({
      id: `browser_step_${step.order}`,
      order: step.order,
      type: "unknown",
      heading: `${step.actionType} ${step.status}`,
      text: step.observation,
      ctas: []
    })),
    ctas: [],
    links: steps.flatMap((step) => (step.url ? [{ label: `Step ${step.order}`, href: step.url }] : [])),
    metadata: {
      auditType: "WEBAPP",
      source: "browser_run",
      finalUrl: url,
      fallbackUsed: Boolean(error),
      error
    }
  };
}

async function captureStepScreenshot(
  page: Page,
  order: number,
  screenshot?: { auditRunId: string; blobReadWriteToken?: string }
) {
  if (!screenshot?.blobReadWriteToken) return undefined;

  try {
    const image = await page.screenshot({ fullPage: true, type: "png" });
    const imageBuffer = new Uint8Array(image).buffer;
    const uploaded = await uploadScreenshotToBlob({
      pathname: `audits/webapp-steps/${screenshot.auditRunId}/step-${order}.png`,
      image: imageBuffer,
      contentType: "image/png",
      blobReadWriteToken: screenshot.blobReadWriteToken
    });
    return uploaded.url;
  } catch {
    return undefined;
  }
}
