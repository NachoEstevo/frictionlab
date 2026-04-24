import { describe, expect, it } from "vitest";
import { parseModelSpecifier } from "@/lib/ai/model";

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
});
