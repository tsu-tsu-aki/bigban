import { describe, it, expect } from "vitest";
import { newsItemSchema, newsListSchema } from "./schema";

const validItem = {
  id: "abc123",
  createdAt: "2026-04-01T00:00:00.000Z",
  updatedAt: "2026-04-01T00:00:00.000Z",
  publishedAt: "2026-04-01T00:00:00.000Z",
  revisedAt: "2026-04-01T00:00:00.000Z",
  title: "タイトル",
  slug: "grand-opening-2026",
  locale: ["ja"],
  category: ["notice"],
  excerpt: "抜粋文",
  displayMode: ["html"],
  bodyHtml: "<p>本文HTML</p>",
  body: "<p>本文リッチ</p>",
  eyecatch: {
    url: "https://images.microcms-assets.io/assets/xxx/test.jpg",
    width: 1200,
    height: 630,
  },
  externalLink: { label: "詳細を見る", url: "https://example.com" },
};

describe("newsItemSchema", () => {
  it("完全なレコードをパース", () => {
    const p = newsItemSchema.parse(validItem);
    expect(p.title).toBe("タイトル");
    expect(p.locale).toBe("ja");
    expect(p.displayMode).toBe("html");
    expect(p.category).toEqual(["notice"]);
  });

  it("eyecatch/externalLink/bodyHtml/body なしでもOK (excerpt と displayMode は必須)", () => {
    const {
      eyecatch: _e,
      externalLink: _el,
      bodyHtml: _bh,
      body: _b,
      ...minimal
    } = validItem;
    void _e;
    void _el;
    void _bh;
    void _b;
    const p = newsItemSchema.parse(minimal);
    expect(p.eyecatch).toBeUndefined();
    expect(p.externalLink).toBeUndefined();
    expect(p.bodyHtml).toBe("");
    expect(p.body).toBe("");
  });

  it("locale 想定外はエラー", () => {
    expect(() => newsItemSchema.parse({ ...validItem, locale: ["fr"] })).toThrow();
  });

  it("category 想定外はエラー", () => {
    expect(() =>
      newsItemSchema.parse({ ...validItem, category: ["invalid"] }),
    ).toThrow();
  });

  it("displayMode 想定外はエラー", () => {
    expect(() =>
      newsItemSchema.parse({ ...validItem, displayMode: ["pdf"] }),
    ).toThrow();
  });

  it("displayMode 欠落はエラー", () => {
    const { displayMode: _d, ...missing } = validItem;
    void _d;
    expect(() => newsItemSchema.parse(missing)).toThrow();
  });

  it("excerpt 欠落はエラー", () => {
    const { excerpt: _e, ...missing } = validItem;
    void _e;
    expect(() => newsItemSchema.parse(missing)).toThrow();
  });

  it("excerpt 160字超過はエラー", () => {
    const longExcerpt = "あ".repeat(161);
    expect(() =>
      newsItemSchema.parse({ ...validItem, excerpt: longExcerpt }),
    ).toThrow();
  });

  it("必須欠落 (title) でエラー", () => {
    const { title: _t, ...missing } = validItem;
    void _t;
    expect(() => newsItemSchema.parse(missing)).toThrow();
  });

  it("externalLink.url 非URLはエラー", () => {
    expect(() =>
      newsItemSchema.parse({
        ...validItem,
        externalLink: { label: "x", url: "not-url" },
      }),
    ).toThrow();
  });

  it("externalLink.url が http:// (非 https) はエラー", () => {
    expect(() =>
      newsItemSchema.parse({
        ...validItem,
        externalLink: { label: "x", url: "http://example.com" },
      }),
    ).toThrow();
  });

  it("slug 形式違反 (大文字) はエラー", () => {
    expect(() =>
      newsItemSchema.parse({ ...validItem, slug: "Invalid-Slug" }),
    ).toThrow();
  });
});

describe("newsListSchema", () => {
  it("contents配列をパース", () => {
    const p = newsListSchema.parse({
      contents: [validItem],
      totalCount: 1,
      offset: 0,
      limit: 12,
    });
    expect(p.contents).toHaveLength(1);
  });

  it("空でもOK", () => {
    const p = newsListSchema.parse({
      contents: [],
      totalCount: 0,
      offset: 0,
      limit: 12,
    });
    expect(p.contents).toEqual([]);
  });
});
