export interface GenerateExcerptOptions {
  length?: number;
}

const DEFAULT_LENGTH = 120;

export function generateExcerpt(
  html: string,
  options: GenerateExcerptOptions = {},
): string {
  const length = options.length ?? DEFAULT_LENGTH;
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= length) return text;
  return `${text.slice(0, length)}…`;
}
