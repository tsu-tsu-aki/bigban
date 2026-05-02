import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ja", "en"],
  defaultLocale: "ja",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];

/**
 * 文字列を Locale 型に絞り込む。許可リスト外なら null。
 * Server Component で `if (!parseLocale(x)) notFound()` パターンに使うことで
 * `as Locale` 型アサーションを排除できる。
 */
export function parseLocale(value: string): Locale | null {
  return (routing.locales as readonly string[]).includes(value)
    ? (value as Locale)
    : null;
}
