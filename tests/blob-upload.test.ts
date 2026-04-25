import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@vercel/blob", () => ({
  put: vi.fn(async (pathname: string) => ({
    url: `https://blob.example/${pathname}`,
    pathname,
    downloadUrl: `https://blob.example/${pathname}?download=1`,
    contentType: "image/png",
    contentDisposition: "inline",
    etag: "etag"
  }))
}));

describe("uploadScreenshotToBlob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uploads screenshot bytes as a public PNG using the configured token", async () => {
    const { put } = await import("@vercel/blob");
    const { uploadScreenshotToBlob } = await import("@/lib/screenshots/upload-screenshot-to-blob");

    const result = await uploadScreenshotToBlob({
      pathname: "audits/screenshots/example-desktop.png",
      image: new Uint8Array([1, 2, 3]).buffer,
      contentType: "image/png",
      blobReadWriteToken: "blob_test_token"
    });

    expect(result).toEqual({
      url: "https://blob.example/audits/screenshots/example-desktop.png",
      pathname: "audits/screenshots/example-desktop.png"
    });
    expect(put).toHaveBeenCalledWith(
      "audits/screenshots/example-desktop.png",
      expect.any(Blob),
      {
        access: "public",
        contentType: "image/png",
        allowOverwrite: true,
        token: "blob_test_token"
      }
    );
  });

  it("throws a clear error when BLOB_READ_WRITE_TOKEN is missing", async () => {
    const { uploadScreenshotToBlob } = await import("@/lib/screenshots/upload-screenshot-to-blob");

    await expect(
      uploadScreenshotToBlob({
        pathname: "audits/screenshots/example-desktop.png",
        image: new Uint8Array([1, 2, 3]).buffer,
        contentType: "image/png",
        blobReadWriteToken: undefined
      })
    ).rejects.toThrow(/BLOB_READ_WRITE_TOKEN/);
  });
});
