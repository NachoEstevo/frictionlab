import { afterEach, describe, expect, it, vi } from "vitest";
import { hasProviderKey, parseModelSpecifier } from "@/lib/ai/model";

describe("parseModelSpecifier", () => {
  it("parses provider-prefixed model ids", () => {
    expect(parseModelSpecifier("openai:gpt-4.1-mini")).toEqual({
      provider: "openai",
      modelId: "gpt-4.1-mini"
    });

    expect(parseModelSpecifier("anthropic:claude-sonnet-4-5")).toEqual({
      provider: "anthropic",
      modelId: "claude-sonnet-4-5"
    });
  });

  it("defaults unprefixed models to OpenAI", () => {
    expect(parseModelSpecifier("gpt-4.1-mini")).toEqual({
      provider: "openai",
      modelId: "gpt-4.1-mini"
    });
  });

  it("parses AI Gateway model ids", () => {
    expect(parseModelSpecifier("gateway:anthropic/claude-sonnet-4.6")).toEqual({
      provider: "gateway",
      modelId: "anthropic/claude-sonnet-4.6"
    });

    expect(parseModelSpecifier("openai/gpt-5.4-mini")).toEqual({
      provider: "gateway",
      modelId: "openai/gpt-5.4-mini"
    });
  });

  it("accepts AI Gateway API key credentials for gateway model ids", () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    vi.stubEnv("AI_GATEWAY_API_KEY", "gateway_test_key");

    expect(hasProviderKey("gateway:openai/gpt-5.4-mini")).toBe(true);
    expect(hasProviderKey("anthropic/claude-sonnet-4.6")).toBe(true);
  });

  it("accepts Vercel OIDC credentials for gateway model ids", () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    vi.stubEnv("AI_GATEWAY_API_KEY", "");
    vi.stubEnv("VERCEL_OIDC_TOKEN", "oidc_test_token");

    expect(hasProviderKey("gateway:anthropic/claude-sonnet-4.6")).toBe(true);
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
});
