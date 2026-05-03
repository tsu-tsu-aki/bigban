import { NEWS_CATEGORIES } from "@/constants/news";

export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

/**
 * microCMS から取得したカテゴリ ID 配列を NEWS_CATEGORIES 上の
 * オブジェクト配列に解決する。allowlist 外の ID は除外する。
 * 配列順は保たれる。
 */
export function resolveCategories(ids: readonly string[]): NewsCategory[] {
  return ids
    .map((id) => NEWS_CATEGORIES.find((c) => c.id === id))
    .filter((c): c is NewsCategory => Boolean(c));
}
