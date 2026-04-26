import { z } from "zod";

import { NEWS_CATEGORIES, type NewsCategoryId } from "@/constants/news";

const localeSelect = z
  .array(z.enum(["ja", "en"]))
  .min(1)
  .max(1)
  .transform((v) => v[0]);

const displayModeSelect = z
  .array(z.enum(["html", "rich"]))
  .min(1)
  .max(1)
  .transform((v) => v[0]);

// microCMS の category 選択肢は **日本語ラベル** で運用 (非エンジニア配慮)。
// サイト内部は英語IDで扱うため、ここで日本語→ID 変換 transform を入れる。
// 後方互換のため英語ID直接入力も受理する。
const VALID_IDS = new Set<string>(NEWS_CATEGORIES.map((c) => c.id));
const JA_LABEL_TO_ID = new Map<string, NewsCategoryId>(
  NEWS_CATEGORIES.map((c) => [c.labelJa, c.id]),
);

const categoryEnum = z.string().transform((v, ctx) => {
  if (VALID_IDS.has(v)) return v as NewsCategoryId;
  const id = JA_LABEL_TO_ID.get(v);
  if (id) return id;
  ctx.addIssue({
    code: "custom",
    message: `unknown category: ${v}`,
  });
  return z.NEVER;
});

const slugSchema = z
  .string()
  .regex(/^[a-z0-9-]+$/, "slug must match /^[a-z0-9-]+$/");

const eyecatch = z.object({
  url: z.string().url(),
  width: z.number(),
  height: z.number(),
});

const externalLink = z.object({
  label: z.string(),
  url: z
    .string()
    .url()
    .refine((u) => u.startsWith("https://"), {
      message: "externalLink.url must start with https://",
    }),
});

export const newsItemSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string().optional(),
  revisedAt: z.string().optional(),
  title: z.string(),
  slug: slugSchema,
  locale: localeSelect,
  category: z.array(categoryEnum).min(1),
  excerpt: z.string().max(160),
  displayMode: displayModeSelect,
  bodyHtml: z.string().optional().default(""),
  body: z.string().optional().default(""),
  eyecatch: eyecatch.optional(),
  externalLink: externalLink.optional(),
});
export type NewsItem = z.infer<typeof newsItemSchema>;

export const newsListSchema = z.object({
  contents: z.array(newsItemSchema),
  totalCount: z.number(),
  offset: z.number(),
  limit: z.number(),
});
export type NewsList = z.infer<typeof newsListSchema>;
