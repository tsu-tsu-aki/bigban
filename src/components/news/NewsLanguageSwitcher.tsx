"use client";

import { useCallback } from "react";

import { useRouter } from "@/i18n/navigation";

type Locale = "ja" | "en";

interface NewsLanguageSwitcherProps {
  slug: string;
  currentLocale: Locale;
  hasOtherLocale: boolean;
}

function buildAriaLabel(
  currentLocale: Locale,
  targetLocale: Locale,
  hasOtherLocale: boolean,
): string {
  if (hasOtherLocale) {
    return targetLocale === "en" ? "View English version" : "日本語版を見る";
  }
  return currentLocale === "ja"
    ? "この記事は日本語のみ公開（英語版ニュース一覧へ移動）"
    : "Article only available in English (move to Japanese news index)";
}

export function NewsLanguageSwitcher({
  slug,
  currentLocale,
  hasOtherLocale,
}: NewsLanguageSwitcherProps) {
  const router = useRouter();
  const targetLocale: Locale = currentLocale === "ja" ? "en" : "ja";
  const ariaLabel = buildAriaLabel(currentLocale, targetLocale, hasOtherLocale);

  const handleClick = useCallback(() => {
    const target = hasOtherLocale ? `/news/${slug}` : "/news";
    router.push(target, { locale: targetLocale });
  }, [hasOtherLocale, slug, router, targetLocale]);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      className="px-3 py-1 border border-accent text-accent text-xs hover:bg-accent hover:text-primary transition-colors"
    >
      {targetLocale.toUpperCase()}
    </button>
  );
}
