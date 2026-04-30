export function isAllowedNavigationUrl(url: string, allowedDomains: string[]): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return allowedDomains.some((domain) => {
      const normalized = domain.toLowerCase().replace(/^https?:\/\//, "").split("/")[0];
      return hostname === normalized || hostname.endsWith(`.${normalized}`);
    });
  } catch {
    return false;
  }
}
