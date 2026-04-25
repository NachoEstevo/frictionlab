import { describe, expect, it } from "vitest";
import { getPrimaryScreenshotEvidence } from "@/lib/screenshots/report-evidence";

describe("getPrimaryScreenshotEvidence", () => {
  it("prefers the first uploaded screenshot with a URL", () => {
    const evidence = getPrimaryScreenshotEvidence([
      {
        viewport: "desktop",
        status: "FALLBACK",
        url: null,
        width: null,
        height: null,
        fallbackType: "DOM_SNAPSHOT",
        error: "Browserless is not configured."
      },
      {
        viewport: "mobile",
        status: "COMPLETED",
        url: "https://blob.example/mobile.png",
        width: 390,
        height: 844,
        fallbackType: null,
        error: null
      }
    ]);

    expect(evidence).toEqual({
      kind: "image",
      viewport: "mobile",
      status: "COMPLETED",
      url: "https://blob.example/mobile.png",
      width: 390,
      height: 844,
      message: "mobile screenshot captured."
    });
  });

  it("returns a fallback message when only DOM evidence is available", () => {
    const evidence = getPrimaryScreenshotEvidence([
      {
        viewport: "desktop",
        status: "FALLBACK",
        url: null,
        width: null,
        height: null,
        fallbackType: "DOM_SNAPSHOT",
        error: "BROWSERLESS_TOKEN is not configured."
      }
    ]);

    expect(evidence).toEqual({
      kind: "fallback",
      viewport: "desktop",
      status: "FALLBACK",
      url: null,
      width: null,
      height: null,
      message: "BROWSERLESS_TOKEN is not configured."
    });
  });

  it("returns null when no screenshot records exist", () => {
    expect(getPrimaryScreenshotEvidence([])).toBeNull();
  });
});
