export type FetchPageHtmlInput = {
  url: string;
  timeoutMs?: number;
  fetcher?: typeof fetch;
};

export type FetchPageHtmlResult = {
  html: string;
  finalUrl: string;
  statusCode: number;
};

export async function fetchPageHtml({
  url,
  timeoutMs = 15000,
  fetcher = fetch
}: FetchPageHtmlInput): Promise<FetchPageHtmlResult> {
  const targetUrl = new URL(url);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetcher(targetUrl, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "user-agent":
          "FrictionLab/1.0 (+https://frictionlab.vercel.app; synthetic conversion research bot)",
        accept: "text/html,application/xhtml+xml"
      }
    });

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
      throw new Error(`Expected HTML response but received ${contentType || "unknown content type"}.`);
    }

    if (!response.ok) {
      throw new Error(`Fetch failed with status ${response.status}.`);
    }

    return {
      html: await response.text(),
      finalUrl: response.url || targetUrl.toString(),
      statusCode: response.status
    };
  } finally {
    clearTimeout(timeout);
  }
}
