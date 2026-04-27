"use client";

import { useRouter } from "next/navigation";

import { NEWS_CATEGORIES, type NewsCategoryId } from "@/constants/news";

type Locale = "ja" | "en";

interface CategoryChipsProps {
  locale: Locale;
  activeCategory: NewsCategoryId | undefined;
}

function basePath(locale: Locale): string {
  return locale === "ja" ? "/news" : "/en/news";
}

function allLabel(locale: Locale): string {
  return locale === "ja" ? "すべて" : "All";
}

export function CategoryChips({ locale, activeCategory }: CategoryChipsProps) {
  const router = useRouter();

  function handleClick(id: NewsCategoryId | null) {
    if (id === null) router.push(basePath(locale));
    else router.push(`${basePath(locale)}?category=${id}`);
  }

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <button
        type="button"
        aria-pressed={activeCategory === undefined}
        onClick={() => handleClick(null)}
        className={`px-4 py-1.5 text-xs tracking-wider border transition-colors ${
          activeCategory === undefined
            ? "border-accent text-accent"
            : "border-text-gray/40 text-text-gray hover:border-text-light/60"
        }`}
      >
        {allLabel(locale)}
      </button>
      {NEWS_CATEGORIES.map((c) => {
        const label = locale === "ja" ? c.labelJa : c.labelEn;
        const active = activeCategory === c.id;
        return (
          <button
            key={c.id}
            type="button"
            aria-pressed={active}
            onClick={() => handleClick(c.id)}
            className={`px-4 py-1.5 text-xs tracking-wider border transition-colors ${
              active
                ? "border-accent text-accent"
                : "border-text-gray/40 text-text-gray hover:border-text-light/60"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
