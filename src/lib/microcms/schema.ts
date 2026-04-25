import { z } from "zod";

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

const categoryEnum = z.enum(["notice", "media", "event", "campaign"]);

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
