import { beforeEach, describe, expect, it, vi } from "vitest";

const close = vi.fn(async () => undefined);
const connectOverCDP = vi.fn(async () => ({ close }));

vi.mock("playwright-core", () => ({
  chromium: {
    connectOverCDP
  }
}));

describe("browserless provider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("prefers Browserless Session API when a token is configured", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        id: "session_123",
        connect: "wss://production-sfo.browserless.io/session/session_123?token=embedded",
        stop: "https://production-sfo.browserless.io/session/session_123?token=embedded"
      })
    }));
    vi.stubGlobal("fetch", fetchMock);

    const { connectBrowserless } = await import("@/lib/webapp/browser/browserless-provider");
    const connection = await connectBrowserless({ token: "browserless-token", sessionTtlMs: 900_000 });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://production-sfo.browserless.io/session?token=browserless-token",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ ttl: 900_000 })
      })
    );
    expect(connectOverCDP).toHaveBeenCalledWith("wss://production-sfo.browserless.io/session/session_123?token=embedded");
    expect(connection.remoteSessionId).toBe("session_123");
    expect(connection.mode).toBe("session");
  });

  it("uses BROWSERLESS_WS_URL as an explicit connection override", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { connectBrowserless } = await import("@/lib/webapp/browser/browserless-provider");
    const connection = await connectBrowserless({
      token: "browserless-token",
      wsUrl: "wss://browserless.example/custom",
      sessionTtlMs: 900_000
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(connectOverCDP).toHaveBeenCalledWith("wss://browserless.example/custom?token=browserless-token");
    expect(connection.remoteSessionId).toBeUndefined();
    expect(connection.mode).toBe("ws");
  });
});
