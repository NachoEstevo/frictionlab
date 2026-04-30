const privateStorePublicAccessPattern = /Cannot use public access on a private store/i;

export const privateBlobStoreFallbackMessage =
  "Vercel Blob store is private; screenshot upload was skipped and the audit continued with DOM evidence.";

export function isPrivateBlobStorePublicAccessError(error: unknown): boolean {
  const message = getErrorMessage(error);
  return Boolean(message && privateStorePublicAccessPattern.test(message));
}

export function getScreenshotFallbackMessage(error: unknown, defaultMessage: string): string {
  if (isPrivateBlobStorePublicAccessError(error)) {
    return privateBlobStoreFallbackMessage;
  }

  return getErrorMessage(error) || defaultMessage;
}

export function getScreenshotFallbackStatus(status: string, error: unknown): string {
  return isPrivateBlobStorePublicAccessError(error) ? "FALLBACK" : status;
}

function getErrorMessage(error: unknown): string | null {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return null;
}
