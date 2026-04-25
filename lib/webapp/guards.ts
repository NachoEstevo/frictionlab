const secretKeyPattern = /password|token|secret|cookie|authorization|api[_-]?key|session/i;
const confirmationLinkPattern = /https?:\/\/[^\s"'<>]+/gi;
const verificationCodePattern = /\b(?:code|verification code|confirm(?:ation)? code)\D{0,16}(\d{4,8})\b/gi;
const destructiveActionPattern = /\b(delete|destroy|remove workspace|remove account|close account|deactivate|erase|drop|terminate|cancel subscription)\b/i;
const paymentActionPattern = /\b(credit card|payment method|billing details|checkout|subscribe|upgrade plan|pay now|purchase)\b/i;

export function buildAgentEmailAlias(mailboxUser: string, auditRunId: string): string {
  const [localPart, domain] = mailboxUser.split("@");
  if (!localPart || !domain) {
    throw new Error("AGENT_MAILBOX_USER must be a valid email address.");
  }

  const normalizedRunId = auditRunId.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${localPart}+frictionlab-${normalizedRunId}@${domain}`;
}

export function extractEmailActions(input: { html?: string | null; text?: string | null }) {
  const content = `${input.html || ""}\n${input.text || ""}`;
  const links = Array.from(new Set(content.match(confirmationLinkPattern) || [])).map(cleanUrl);
  const codes = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = verificationCodePattern.exec(content)) !== null) {
    if (match[1]) codes.add(match[1]);
  }

  return {
    links: links.filter((link) => {
      try {
        new URL(link);
        return true;
      } catch {
        return false;
      }
    }),
    codes: Array.from(codes)
  };
}

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

export function looksBlockedByHumanChallenge(text: string): string | null {
  const normalized = text.toLowerCase();
  if (normalized.includes("captcha") || normalized.includes("verify you are human")) return "Human verification challenge detected.";
  if (normalized.includes("two-factor") || normalized.includes("2fa") || normalized.includes("authenticator app")) {
    return "Two-factor authentication detected.";
  }
  if (normalized.includes("payment method") || normalized.includes("credit card")) return "Payment step detected.";
  return null;
}

export function getBlockedActionReason(action: { actionType: string; target?: string; value?: string; reason?: string }): string | null {
  const actionText = [action.target, action.reason].filter(Boolean).join(" ");
  if (destructiveActionPattern.test(actionText)) return "Destructive action blocked before execution.";
  if (paymentActionPattern.test(actionText)) return "Payment action blocked before execution.";
  return null;
}

export function redactSecrets<T>(value: T): T {
  if (Array.isArray(value)) return value.map((entry) => redactSecrets(entry)) as T;
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      secretKeyPattern.test(key) ? "[redacted]" : redactSecrets(entry)
    ])
  ) as T;
}

function cleanUrl(url: string): string {
  return url.replace(/[),.;\]]+$/, "");
}
