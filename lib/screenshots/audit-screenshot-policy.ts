type ScreenshotCaptureEnv = {
  enableScreenshotCapture?: boolean;
  browserlessToken?: string;
  blobReadWriteToken?: string;
};

export function shouldCaptureAuditScreenshots(env: ScreenshotCaptureEnv): boolean {
  return Boolean(env.enableScreenshotCapture && env.browserlessToken && env.blobReadWriteToken);
}
