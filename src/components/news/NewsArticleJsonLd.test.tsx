import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { NewsArticleJsonLd } from "./NewsArticleJsonLd";
import { makeParsedNewsItem } from "../../../__mocks__/microcms-fixtures";

function readJsonLd(): Record<string, unknown> {
  const s = document.querySelector<HTMLScriptElement>(
    'script[type="application/ld+json"]',
  );
  return JSON.parse(s?.textContent ?? "{}") as Record<string, unknown>;
}

describe("NewsArticleJsonLd", () => {
  it("NewsArticle スキーマ", () => {
    render(
      <NewsArticleJsonLd
        item={makeParsedNewsItem({
          title: "T",
          slug: "s",
          publishedAt: "2026-04-01T00:00:00.000Z",
          updatedAt: "2026-04-02T00:00:00.000Z",
        })}
        locale="ja"
      />,
    );
    const d = readJsonLd();
    expect(d["@type"]).toBe("NewsArticle");
    expect(d.headline).toBe("T");
    expect(d.inLanguage).toBe("ja");
    expect(d.datePublished).toBe("2026-04-01T00:00:00.000Z");
    expect(d.dateModified).toBe("2026-04-02T00:00:00.000Z");
  });

  it("eyecatch があれば image に", () => {
    render(
      <NewsArticleJsonLd
        item={makeParsedNewsItem({ title: "w" })}
        locale="ja"
      />,
    );
    expect(readJsonLd().image).toBeDefined();
  });

  it("publishedAt 無しは createdAt", () => {
    const base = makeParsedNewsItem({
      createdAt: "2026-02-02T00:00:00.000Z",
    });
    const { publishedAt: _p, ...rest } = base;
    void _p;
    render(<NewsArticleJsonLd item={rest} locale="ja" />);
    expect(readJsonLd().datePublished).toBe("2026-02-02T00:00:00.000Z");
  });

  it("locale=en inLanguage=en", () => {
    render(<NewsArticleJsonLd item={makeParsedNewsItem()} locale="en" />);
    expect(readJsonLd().inLanguage).toBe("en");
  });

  it("eyecatch 無しは image なし", () => {
    const base = makeParsedNewsItem();
    const { eyecatch: _e, ...rest } = base;
    void _e;
    render(<NewsArticleJsonLd item={rest} locale="ja" />);
    expect(readJsonLd().image).toBeUndefined();
  });

  it("description は excerpt から生成", () => {
    render(
      <NewsArticleJsonLd
        item={makeParsedNewsItem({ excerpt: "テスト抜粋文" })}
        locale="ja"
      />,
    );
    expect(readJsonLd().description).toBe("テスト抜粋文");
  });
});
