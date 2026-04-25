import Link from "next/link";

import type { NewsCategoryId } from "@/constants/news";

type Locale = "ja" | "en";

interface NewsPaginationProps {
  currentPage: number;
  totalPages: number;
  locale: Locale;
  category?: NewsCategoryId;
}

function buildHref(
  locale: Locale,
  page: number,
  category?: NewsCategoryId,
): string {
  const base = locale === "ja" ? "/news" : "/en/news";
  const params = new URLSearchParams();
  if (page !== 1) params.set("page", String(page));
  if (category) params.set("category", category);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function NewsPagination({
  currentPage,
  totalPages,
  locale,
  category,
}: NewsPaginationProps) {
  if (totalPages <= 1) return null;

  const labels =
    locale === "ja"
      ? { prev: "前のページ", next: "次のページ", aria: "ページネーション" }
      : { prev: "Previous", next: "Next", aria: "Pagination" };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav aria-label={labels.aria} className="mt-12 flex justify-center gap-2">
      {hasPrev && (
        <Link
          href={buildHref(locale, currentPage - 1, category)}
          rel="prev"
          className="px-4 py-2 border border-accent text-accent text-sm hover:bg-accent hover:text-primary transition-colors"
        >
          {labels.prev}
        </Link>
      )}
      {pages.map((p) => (
        <Link
          key={p}
          href={buildHref(locale, p, category)}
          aria-current={p === currentPage ? "page" : undefined}
          className={`px-4 py-2 border text-sm transition-colors ${
            p === currentPage
              ? "border-accent bg-accent text-primary"
              : "border-text-gray text-text-light hover:border-accent hover:text-accent"
          }`}
        >
          {p}
        </Link>
      ))}
      {hasNext && (
        <Link
          href={buildHref(locale, currentPage + 1, category)}
          rel="next"
          className="px-4 py-2 border border-accent text-accent text-sm hover:bg-accent hover:text-primary transition-colors"
        >
          {labels.next}
        </Link>
      )}
    </nav>
  );
}
