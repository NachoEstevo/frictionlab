import { describe, expect, it, vi } from "vitest";
import { captureAuditScreenshots } from "@/lib/screenshots/capture-audit-screenshots";

describe("captureAuditScreenshots", () => {
  it("returns DOM fallback records when Browserless is not configured", async () => {
    const screenshots = await captureAuditScreenshots({
      auditRunId: "audit_123",
      url: "https://example.com",
      browserlessToken: undefined
    });

    expect(screenshots).toEqual([
      expect.objectContaining({ viewport: "desktop", status: "FALLBACK", fallbackType: "DOM_SNAPSHOT" }),
      expect.objectContaining({ viewport: "mobile", status: "FALLBACK", fallbackType: "DOM_SNAPSHOT" })
    ]);
  });

  it("returns DOM fallback records when Blob upload is not configured", async () => {
    const fetcher = vi.fn(async () => new Response(new Uint8Array([1, 2, 3]), { headers: { "content-type": "image/png" } }));
    const screenshots = await captureAuditScreenshots({
      auditRunId: "audit_123",
      url: "https://example.com",
      browserlessToken: "browserless_test_token",
      fetcher
    });

    expect(fetcher).not.toHaveBeenCalled();
    expect(screenshots).toEqual([
      expect.objectContaining({ viewport: "desktop", status: "FALLBACK", fallbackType: "DOM_SNAPSHOT" }),
      expect.objectContaining({ viewport: "mobile", status: "FALLBACK", fallbackType: "DOM_SNAPSHOT" })
    ]);
    expect(screenshots[0]?.error).toMatch(/BLOB_READ_WRITE_TOKEN/);
  });

  it("captures desktop and mobile screenshots and uploads them when an uploader is provided", async () => {
    const fetcher = vi.fn(async () => new Response(new Uint8Array([1, 2, 3]), { headers: { "content-type": "image/png" } }));
    const uploadScreenshot = vi.fn(async ({ pathname }: { pathname: string }) => ({
      url: `https://blob.example/${pathname}`,
      pathname
    }));

    const screenshots = await captureAuditScreenshots({
      auditRunId: "audit_123",
      url: "https://example.com",
      browserlessToken: "browserless_test_token",
      fetcher,
      uploadScreenshot
    });

    expect(screenshots).toEqual([
      expect.objectContaining({
        viewport: "desktop",
        status: "COMPLETED",
        url: "https://blob.example/audits/screenshots/audit_123/example-com-desktop.png",
        blobPath: "audits/screenshots/audit_123/example-com-desktop.png",
        width: 1440,
        height: 1100
      }),
      expect.objectContaining({
        viewport: "mobile",
        status: "COMPLETED",
        url: "https://blob.example/audits/screenshots/audit_123/example-com-mobile.png",
        blobPath: "audits/screenshots/audit_123/example-com-mobile.png",
        width: 390,
        height: 844
      })
    ]);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(uploadScreenshot).toHaveBeenCalledTimes(2);

    const [requestUrl, requestInit] = fetcher.mock.calls[0] as unknown as [string, RequestInit];
    expect(String(requestUrl)).toContain("https://production-sfo.browserless.io/screenshot?token=browserless_test_token");
    expect(JSON.parse(String(requestInit?.body))).toMatchObject({
      url: "https://example.com",
      options: {
        fullPage: true,
        type: "png"
      },
      viewport: {
        width: 1440,
        height: 1100
      }
    });
  });

  it("records failed screenshots without throwing when Browserless fails", async () => {
    const screenshots = await captureAuditScreenshots({
      auditRunId: "audit_123",
      url: "https://example.com",
      browserlessToken: "browserless_test_token",
      fetcher: async () => new Response("blocked", { status: 403, statusText: "Forbidden" }),
      uploadScreenshot: async ({ pathname }: { pathname: string }) => ({
        url: `https://blob.example/${pathname}`,
        pathname
      })
    });

    expect(screenshots).toEqual([
      expect.objectContaining({ viewport: "desktop", status: "FAILED", fallbackType: "DOM_SNAPSHOT" }),
      expect.objectContaining({ viewport: "mobile", status: "FAILED", fallbackType: "DOM_SNAPSHOT" })
    ]);
    expect(screenshots[0]?.error).toMatch(/403/);
  });

  it("records upload failure without throwing when Blob upload fails", async () => {
    const screenshots = await captureAuditScreenshots({
      auditRunId: "audit_123",
      url: "https://example.com",
      browserlessToken: "browserless_test_token",
      fetcher: async () => new Response(new Uint8Array([1, 2, 3]), { headers: { "content-type": "image/png" } }),
      uploadScreenshot: async () => {
        throw new Error("Blob token rejected");
      }
    });

    expect(screenshots).toEqual([
      expect.objectContaining({ viewport: "desktop", status: "FAILED", fallbackType: "DOM_SNAPSHOT" }),
      expect.objectContaining({ viewport: "mobile", status: "FAILED", fallbackType: "DOM_SNAPSHOT" })
    ]);
    expect(screenshots[0]?.error).toMatch(/Blob token rejected/);
  });

  it("falls back cleanly when a private Blob store rejects public screenshots", async () => {
    const screenshots = await captureAuditScreenshots({
      auditRunId: "audit_123",
      url: "https://example.com",
      browserlessToken: "browserless_test_token",
      fetcher: async () => new Response(new Uint8Array([1, 2, 3]), { headers: { "content-type": "image/png" } }),
      uploadScreenshot: async () => {
        throw new Error("Vercel Blob: Cannot use public access on a private store. The store is configured with private access.");
      }
    });

    expect(screenshots).toEqual([
      expect.objectContaining({ viewport: "desktop", status: "FALLBACK", fallbackType: "DOM_SNAPSHOT" }),
      expect.objectContaining({ viewport: "mobile", status: "FALLBACK", fallbackType: "DOM_SNAPSHOT" })
    ]);
    expect(screenshots[0]?.error).toBe(
      "Vercel Blob store is private; screenshot upload was skipped and the audit continued with DOM evidence."
    );
    expect(screenshots[0]?.error).not.toMatch(/Cannot use public access/);
  });
});
