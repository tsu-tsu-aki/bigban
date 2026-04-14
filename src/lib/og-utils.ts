export function extractPageLabel(title: string): string {
  return title.split(/\s*\|\s*|\s+·\s+/)[0].trim();
}

export function parseKeywords(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}
