import { chromium, type Browser } from "playwright-core";

type ConnectBrowserlessInput = {
  token?: string;
  wsUrl?: string;
  sessionTtlMs?: number;
};

type BrowserlessSession = {
  id: string;
  connect: string;
  stop?: string;
};

export type BrowserlessConnection = {
  browser: Browser;
  mode: "session" | "ws" | "token";
  remoteSessionId?: string;
  close: () => Promise<void>;
};

const browserlessDefaultWsUrl = "wss://production-sfo.browserless.io";
const browserlessDefaultHttpUrl = "https://production-sfo.browserless.io";

export async function connectBrowserless(input: ConnectBrowserlessInput): Promise<BrowserlessConnection> {
  if (input.wsUrl) {
    const connectUrl = appendToken(input.wsUrl, input.token);
    const browser = await chromium.connectOverCDP(connectUrl);
    return buildConnection({ browser, mode: "ws" });
  }

  if (!input.token) {
    throw new Error("BROWSERLESS_TOKEN or BROWSERLESS_WS_URL is required for webapp audits.");
  }

  try {
    const session = await createBrowserlessSession({
      token: input.token,
      ttl: input.sessionTtlMs ?? 900_000
    });

    try {
      const browser = await chromium.connectOverCDP(session.connect);
      return buildConnection({
        browser,
        mode: "session",
        remoteSessionId: session.id,
        stopUrl: session.stop
      });
    } catch {
      await stopBrowserlessSession(session.stop);
      const browser = await chromium.connectOverCDP(appendToken(browserlessDefaultWsUrl, input.token));
      return buildConnection({ browser, mode: "token" });
    }
  } catch {
    const browser = await chromium.connectOverCDP(appendToken(browserlessDefaultWsUrl, input.token));
    return buildConnection({ browser, mode: "token" });
  }
}

async function createBrowserlessSession(input: { token: string; ttl: number }): Promise<BrowserlessSession> {
  const response = await fetch(`${browserlessDefaultHttpUrl}/session?token=${encodeURIComponent(input.token)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ttl: input.ttl })
  });

  if (!response.ok) {
    throw new Error(`Browserless session creation failed with ${response.status} ${response.statusText}`.trim());
  }

  const session = (await response.json()) as BrowserlessSession;
  if (!session.id || !session.connect) {
    throw new Error("Browserless session response did not include id and connect URL.");
  }

  return session;
}

function buildConnection(input: {
  browser: Browser;
  mode: BrowserlessConnection["mode"];
  remoteSessionId?: string;
  stopUrl?: string;
}): BrowserlessConnection {
  return {
    browser: input.browser,
    mode: input.mode,
    remoteSessionId: input.remoteSessionId,
    close: async () => {
      await input.browser.close().catch(() => undefined);
      await stopBrowserlessSession(input.stopUrl);
    }
  };
}

async function stopBrowserlessSession(stopUrl: string | undefined): Promise<void> {
  if (!stopUrl) return;
  await fetch(appendForce(stopUrl), { method: "DELETE" }).catch(() => undefined);
}

function appendToken(url: string, token: string | undefined): string {
  if (!token || url.includes("token=")) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}token=${encodeURIComponent(token)}`;
}

function appendForce(url: string): string {
  if (url.includes("force=")) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}force=true`;
}
