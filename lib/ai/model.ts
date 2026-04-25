import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import { getEnv, type AppEnv } from "@/lib/env";

export type ModelProvider = "openai" | "anthropic" | "gateway";

export type ParsedModelSpecifier = {
  provider: ModelProvider;
  modelId: string;
};

export function parseModelSpecifier(specifier: string): ParsedModelSpecifier {
  const [provider, ...rest] = specifier.split(":");

  if (provider === "gateway" && rest.length > 0) {
    return { provider, modelId: rest.join(":") };
  }

  if ((provider === "openai" || provider === "anthropic") && rest.length > 0) {
    return { provider, modelId: rest.join(":") };
  }

  if (specifier.includes("/")) {
    return { provider: "gateway", modelId: specifier };
  }

  return { provider: "openai", modelId: specifier };
}

export function getLanguageModel(specifier: string): LanguageModel {
  const parsed = parseModelSpecifier(specifier);

  if (parsed.provider === "gateway") {
    return parsed.modelId as LanguageModel;
  }

  if (parsed.provider === "anthropic") {
    return anthropic(parsed.modelId);
  }

  return openai(parsed.modelId);
}

export function hasProviderKey(specifier: string): boolean {
  return hasModelCredential(specifier, getEnv());
}

export function hasModelCredential(
  specifier: string,
  env: Pick<AppEnv, "openaiApiKey" | "anthropicApiKey" | "aiGatewayApiKey" | "vercelOidcToken">
): boolean {
  const parsed = parseModelSpecifier(specifier);

  if (parsed.provider === "gateway") return Boolean(env.aiGatewayApiKey || env.vercelOidcToken);
  if (parsed.provider === "anthropic") return Boolean(env.anthropicApiKey);
  return Boolean(env.openaiApiKey);
}
