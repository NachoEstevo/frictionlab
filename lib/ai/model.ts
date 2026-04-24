import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import { getEnv } from "@/lib/env";

export type ModelProvider = "openai" | "anthropic";

export type ParsedModelSpecifier = {
  provider: ModelProvider;
  modelId: string;
};

export function parseModelSpecifier(specifier: string): ParsedModelSpecifier {
  const [provider, ...rest] = specifier.split(":");

  if ((provider === "openai" || provider === "anthropic") && rest.length > 0) {
    return { provider, modelId: rest.join(":") };
  }

  return { provider: "openai", modelId: specifier };
}

export function getLanguageModel(specifier: string): LanguageModel {
  const parsed = parseModelSpecifier(specifier);

  if (parsed.provider === "anthropic") {
    return anthropic(parsed.modelId);
  }

  return openai(parsed.modelId);
}

export function hasProviderKey(specifier: string): boolean {
  const parsed = parseModelSpecifier(specifier);
  const env = getEnv();

  if (parsed.provider === "anthropic") return Boolean(env.anthropicApiKey);
  return Boolean(env.openaiApiKey);
}
