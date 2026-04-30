export function isAllowedNavigationUrl(url: string, allowedDomains: string[]): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;

    const hostname = parsed.hostname.toLowerCase();
    return allowedDomains.some((domain) => {
      const normalized = domain.toLowerCase().replace(/^https?:\/\//, "").split("/")[0];
      return hostname === normalized || hostname.endsWith(`.${normalized}`);
    });
  } catch {
    return false;
  }
}
