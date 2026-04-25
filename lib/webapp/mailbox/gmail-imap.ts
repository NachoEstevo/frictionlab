import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { extractEmailActions, isAllowedNavigationUrl } from "@/lib/webapp/guards";
import type { WebappMailboxEvent } from "@/lib/webapp/types";

export type GmailImapConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  appPassword: string;
};

export type PollMailboxInput = {
  config: GmailImapConfig;
  emailAlias: string;
  allowedDomains: string[];
  timeoutMs?: number;
  pollIntervalMs?: number;
};

export async function pollGmailForConfirmation(input: PollMailboxInput): Promise<WebappMailboxEvent> {
  const timeoutMs = input.timeoutMs ?? 90_000;
  const pollIntervalMs = input.pollIntervalMs ?? 5_000;
  const startedAt = Date.now();
  let lastError: string | undefined;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const event = await readLatestConfirmation(input);
      if (event) return event;
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Mailbox polling failed.";
    }

    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  return {
    emailAlias: input.emailAlias,
    status: "TIMEOUT",
    error: lastError || "No confirmation email arrived before the timeout."
  };
}

async function readLatestConfirmation(input: PollMailboxInput): Promise<WebappMailboxEvent | null> {
  const client = new ImapFlow({
    host: input.config.host,
    port: input.config.port,
    secure: input.config.secure,
    auth: {
      user: input.config.user,
      pass: input.config.appPassword
    },
    logger: false
  });

  await client.connect();
  try {
    const lock = await client.getMailboxLock("INBOX");
    try {
      const messages = await client.search({ to: input.emailAlias }, { uid: true });
      const uid = Array.isArray(messages) ? messages[messages.length - 1] : undefined;
      if (!uid) return null;

      const message = await client.fetchOne(uid, { source: true, envelope: true }, { uid: true });
      if (!message || !message.source) return null;

      const parsed = await simpleParser(message.source);
      const actions = extractEmailActions({ html: parsed.html || undefined, text: parsed.text || undefined });
      const confirmationLink = actions.links.find((link) => isAllowedNavigationUrl(link, input.allowedDomains));

      if (actions.links.length > 0 && !confirmationLink) {
        return {
          emailAlias: input.emailAlias,
          subject: parsed.subject || message.envelope?.subject,
          fromAddress: parsed.from?.text || message.envelope?.from?.[0]?.address,
          status: "BLOCKED",
          error: "Confirmation email linked to a domain outside allowedDomains."
        };
      }

      return {
        emailAlias: input.emailAlias,
        subject: parsed.subject || message.envelope?.subject,
        fromAddress: parsed.from?.text || message.envelope?.from?.[0]?.address,
        confirmationLink,
        confirmationCode: actions.codes[0],
        status: confirmationLink || actions.codes[0] ? "FOUND" : "FOUND"
      };
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => undefined);
  }
}
