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

/**
 * ellipsis 付きページ番号配列を生成する。
 * 常に 1 と totalPages を表示し、現在ページの ±1 を含むウィンドウを表示。
 * 隙間があれば "..." を挿入する。
 *
 * 例:
 *   buildPageList(1, 5)  → [1, 2, 3, 4, 5]
 *   buildPageList(5, 10) → [1, "...", 4, 5, 6, "...", 10]
 *   buildPageList(1, 20) → [1, 2, 3, "...", 20]
 *   buildPageList(20, 20) → [1, "...", 18, 19, 20]
 */
export function buildPageList(
  current: number,
  total: number,
): Array<number | "..."> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const result: Array<number | "..."> = [];
  const window = new Set<number>([
    1,
    total,
    current - 1,
    current,
    current + 1,
  ]);
  // 端の隣も常に表示 (1,2 と total-1,total が連続するように)
  if (current <= 4) {
    window.add(2);
    window.add(3);
    window.add(4);
  }
  if (current >= total - 3) {
    window.add(total - 1);
    window.add(total - 2);
    window.add(total - 3);
  }
  const sorted = Array.from(window)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("...");
    result.push(p);
    prev = p;
  }
  return result;
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

  const pages = buildPageList(currentPage, totalPages);
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
      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            aria-hidden="true"
            className="px-2 py-2 text-sm text-text-gray"
          >
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(locale, p, category)}
            aria-current={p === currentPage ? "page" : undefined}
            className={`px-4 py-2 border text-sm transition-colors ${
              p === currentPage
                ? "border-accent bg-accent text-deep-black font-bold"
                : "border-text-gray text-text-light hover:border-accent hover:text-accent"
            }`}
          >
            {p}
          </Link>
        ),
      )}
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
