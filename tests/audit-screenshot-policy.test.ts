import { describe, expect, it } from "vitest";
import { shouldCaptureAuditScreenshots } from "@/lib/screenshots/audit-screenshot-policy";

describe("shouldCaptureAuditScreenshots", () => {
  it("keeps landing audit screenshots disabled by default even when provider tokens exist", () => {
    expect(
      shouldCaptureAuditScreenshots({
        enableScreenshotCapture: false,
        browserlessToken: "browserless_test_token",
        blobReadWriteToken: "blob_test_token"
      })
    ).toBe(false);
  });

  it("captures screenshots only when the explicit flag and both storage tokens are present", () => {
    expect(
      shouldCaptureAuditScreenshots({
        enableScreenshotCapture: true,
        browserlessToken: "browserless_test_token",
        blobReadWriteToken: "blob_test_token"
      })
    ).toBe(true);

    expect(
      shouldCaptureAuditScreenshots({
        enableScreenshotCapture: true,
        browserlessToken: "browserless_test_token"
      })
    ).toBe(false);
  });
});
