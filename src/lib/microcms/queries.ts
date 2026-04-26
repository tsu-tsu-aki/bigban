import { cookies, draftMode } from "next/headers";

import { microcmsFetch } from "./client";
import {
  newsItemSchema,
  newsListSchema,
  type NewsItem,
  type NewsList,
} from "./schema";
import {
  DETAIL_PAGE_STATIC_LIMIT,
  NEWS_CATEGORIES,
  type NewsCategoryId,
} from "@/constants/news";

type Locale = "ja" | "en";

// microCMS の category は日本語ラベルで保存されているため、
// 内部ID (notice 等) → 日本語ラベル (お知らせ 等) に変換してフィルタ送信する。
function categoryFilterValue(id: NewsCategoryId): string {
  const found = NEWS_CATEGORIES.find((c) => c.id === id);
  return found?.labelJa ?? id;
}

export interface GetNewsListParams {
  locale: Locale;
  limit: number;
  offset: number;
  category?: NewsCategoryId;
}

export async function getNewsList({
  locale,
  limit,
  offset,
  category,
}: GetNewsListParams): Promise<NewsList> {
  const filters = category
    ? `locale[contains]${locale}[and]category[contains]${categoryFilterValue(category)}`
    : `locale[contains]${locale}`;
  return microcmsFetch("news", newsListSchema, {
    searchParams: { filters, orders: "-publishedAt", limit, offset },
    tags: [
      "news",
      `news-list-${locale}${category ? `-${category}` : ""}`,
    ],
  });
}

export interface GetNewsDetailParams {
  locale: Locale;
  slug: string;
}

async function readDraftKey(): Promise<string | undefined> {
  const draft = await draftMode();
  if (!draft.isEnabled) return undefined;
  const store = await cookies();
  return store.get("microcms_draft_key")?.value;
}

export async function getNewsDetail({
  locale,
  slug,
}: GetNewsDetailParams): Promise<NewsItem | null> {
  const draftKey = await readDraftKey();
  const list = await microcmsFetch("news", newsListSchema, {
    searchParams: {
      filters: `slug[equals]${slug}[and]locale[contains]${locale}`,
      limit: 1,
    },
    tags: ["news", `news-${slug}-${locale}`],
    draftKey,
  });
  return list.contents[0] ?? null;
}

export interface GetNewsByContentIdParams {
  id: string;
  draftKey?: string;
}

/**
 * microCMS contentId 直接指定でレコード取得 (画面プレビューから利用)。
 * GET /api/v1/news/{id}?draftKey=... で単一コンテンツを返す。
 * 取得失敗 (404 / Zod parse 失敗) は null を返す。
 */
export async function getNewsByContentId({
  id,
  draftKey,
}: GetNewsByContentIdParams): Promise<NewsItem | null> {
  try {
    return await microcmsFetch(`news/${id}`, newsItemSchema, {
      tags: ["news", `news-${id}`],
      draftKey,
    });
  } catch {
    return null;
  }
}

export interface NewsSlug {
  locale: Locale;
  slug: string;
}

export async function getNewsSlugs(): Promise<NewsSlug[]> {
  const results: NewsSlug[] = [];
  for (const locale of ["ja", "en"] as const) {
    const list = await microcmsFetch("news", newsListSchema, {
      searchParams: {
        filters: `locale[contains]${locale}`,
        limit: DETAIL_PAGE_STATIC_LIMIT,
      },
      tags: ["news", `news-slugs-${locale}`],
    });
    for (const item of list.contents) {
      results.push({ locale, slug: item.slug });
    }
  }
  return results;
}
