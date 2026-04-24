import { describe, expect, it } from "vitest";
import { fetchPageHtml } from "@/lib/extraction/fetch-page-html";

describe("fetchPageHtml", () => {
  it("returns html, status and final URL from a successful fetch", async () => {
    const result = await fetchPageHtml({
      url: "https://example.com",
      fetcher: async () =>
        new Response("<html><title>Example</title></html>", {
          status: 200,
          headers: { "content-type": "text/html" }
        })
    });

    expect(result.html).toContain("<title>Example</title>");
    expect(result.statusCode).toBe(200);
    expect(result.finalUrl).toBe("https://example.com/");
  });

  it("rejects non-html responses", async () => {
    await expect(
      fetchPageHtml({
        url: "https://example.com/data.json",
        fetcher: async () =>
          new Response("{}", {
            status: 200,
            headers: { "content-type": "application/json" }
          })
      })
    ).rejects.toThrow(/html/i);
  });
});
