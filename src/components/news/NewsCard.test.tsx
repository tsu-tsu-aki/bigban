import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NewsCard } from "./NewsCard";
import { makeParsedNewsItem } from "../../../__mocks__/microcms-fixtures";

describe("NewsCard", () => {
  it("タイトル/日付/カテゴリバッジ", () => {
    render(
      <NewsCard
        item={makeParsedNewsItem({
          title: "サンプル",
          publishedAt: "2026-04-01T00:00:00.000Z",
          category: ["media"],
          slug: "sample",
        })}
        locale="ja"
      />,
    );
    expect(screen.getByText("サンプル")).toBeInTheDocument();
    expect(screen.getByText(/2026\.04\.01/)).toBeInTheDocument();
    expect(screen.getByText("メディア掲載")).toBeInTheDocument();
  });

  it("locale=en で英語ラベル+/en prefix", () => {
    render(
      <NewsCard
        item={makeParsedNewsItem({ slug: "sample", category: ["media"] })}
        locale="en"
      />,
    );
    expect(screen.getByText("Media")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/en/news/sample",
    );
  });

  it("locale=ja prefix なしリンク", () => {
    render(
      <NewsCard item={makeParsedNewsItem({ slug: "x" })} locale="ja" />,
    );
    expect(screen.getByRole("link")).toHaveAttribute("href", "/news/x");
  });

  it("eyecatch あり img描画", () => {
    const { container } = render(
      <NewsCard item={makeParsedNewsItem({ slug: "y" })} locale="ja" />,
    );
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img?.getAttribute("src") ?? "").toContain("test.jpg");
  });

  it("eyecatch なしでプレースホルダ", () => {
    const base = makeParsedNewsItem({ slug: "z" });
    const { eyecatch: _e, ...rest } = base;
    void _e;
    const { container } = render(<NewsCard item={rest} locale="ja" />);
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByTestId("news-card-placeholder")).toBeInTheDocument();
  });

  it("publishedAt なければ createdAt", () => {
    const base = makeParsedNewsItem({
      slug: "p",
      createdAt: "2026-01-15T00:00:00.000Z",
    });
    const { publishedAt: _p, ...rest } = base;
    void _p;
    render(<NewsCard item={rest} locale="ja" />);
    expect(screen.getByText(/2026\.01\.15/)).toBeInTheDocument();
  });

  it("time要素 dateTime 属性", () => {
    render(
      <NewsCard
        item={makeParsedNewsItem({
          publishedAt: "2026-04-01T00:00:00.000Z",
          slug: "x",
        })}
        locale="ja"
      />,
    );
    const t = screen.getByText(/2026\.04\.01/);
    expect(t.tagName).toBe("TIME");
    expect(t).toHaveAttribute("dateTime", "2026-04-01");
  });
});
