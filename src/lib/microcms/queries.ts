import { cookies, draftMode } from "next/headers";

import { microcmsFetch } from "./client";
import { newsListSchema, type NewsItem, type NewsList } from "./schema";
import {
  DETAIL_PAGE_STATIC_LIMIT,
  type NewsCategoryId,
} from "@/constants/news";

type Locale = "ja" | "en";

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
    ? `locale[equals]${locale}[and]category[contains]${category}`
    : `locale[equals]${locale}`;
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
      filters: `slug[equals]${slug}[and]locale[equals]${locale}`,
      limit: 1,
    },
    tags: ["news", `news-${slug}-${locale}`],
    draftKey,
  });
  return list.contents[0] ?? null;
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
        filters: `locale[equals]${locale}`,
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
