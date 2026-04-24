export function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export function asStringArray(value: unknown): string[] {
  return asArray<unknown>(value).filter((item): item is string => typeof item === "string");
}

export function formatStatus(status: string | null | undefined): string {
  if (!status) return "Unknown";
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
