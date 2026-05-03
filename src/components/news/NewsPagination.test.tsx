import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NewsPagination, buildPageList } from "./NewsPagination";

describe("NewsPagination", () => {
  it("totalPages=1 で何も描画しない", () => {
    const { container } = render(
      <NewsPagination currentPage={1} totalPages={1} locale="ja" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("totalPages=3 でページ番号 1,2,3 が描画", () => {
    render(<NewsPagination currentPage={1} totalPages={3} locale="ja" />);
    expect(screen.getByRole("link", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "2" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "3" })).toBeInTheDocument();
  });

  it("現在ページに aria-current=page", () => {
    render(<NewsPagination currentPage={2} totalPages={3} locale="ja" />);
    expect(screen.getByRole("link", { name: "2" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "1" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("現在ページは bg-accent + text-deep-black でコントラスト確保 (text-primary は未定義トークンなのでバグ防止)", () => {
    render(<NewsPagination currentPage={2} totalPages={3} locale="ja" />);
    const current = screen.getByRole("link", { name: "2" });
    expect(current.className).toContain("bg-accent");
    expect(current.className).toContain("text-deep-black");
    // テーマに存在しない 'text-primary' は使ってはいけない (色が text-light を継承して読めなくなるため)
    expect(current.className).not.toContain("text-primary");
  });

  it("前/次ページボタンの hover は bg-accent + text-deep-black でコントラスト確保", () => {
    render(<NewsPagination currentPage={2} totalPages={3} locale="ja" />);
    const prev = screen.getByRole("link", { name: "前のページ" });
    const next = screen.getByRole("link", { name: "次のページ" });
    for (const el of [prev, next]) {
      expect(el.className).toContain("hover:bg-accent");
      expect(el.className).toContain("hover:text-deep-black");
      expect(el.className).not.toContain("hover:text-primary");
    }
  });

  it("currentPage=1 で前ページボタンは非表示", () => {
    render(<NewsPagination currentPage={1} totalPages={3} locale="ja" />);
    expect(
      screen.queryByRole("link", { name: "前のページ" }),
    ).not.toBeInTheDocument();
  });

  it("currentPage=2 で前ページボタンに rel=prev", () => {
    render(<NewsPagination currentPage={2} totalPages={3} locale="ja" />);
    const prev = screen.getByRole("link", { name: "前のページ" });
    expect(prev).toHaveAttribute("rel", "prev");
  });

  it("currentPage<totalPages で次ページボタンに rel=next", () => {
    render(<NewsPagination currentPage={1} totalPages={3} locale="ja" />);
    const next = screen.getByRole("link", { name: "次のページ" });
    expect(next).toHaveAttribute("rel", "next");
  });

  it("最終ページで次ページボタン非表示", () => {
    render(<NewsPagination currentPage={3} totalPages={3} locale="ja" />);
    expect(
      screen.queryByRole("link", { name: "次のページ" }),
    ).not.toBeInTheDocument();
  });

  it("category 指定で URL に ?page=N&category=X", () => {
    render(
      <NewsPagination
        currentPage={1}
        totalPages={3}
        locale="ja"
        category="media"
      />,
    );
    const page2 = screen.getByRole("link", { name: "2" });
    expect(page2.getAttribute("href")).toBe("/news?page=2&category=media");
  });

  it("page=1 ではクエリに page を含めない (canonical)", () => {
    render(<NewsPagination currentPage={2} totalPages={3} locale="ja" />);
    expect(
      screen.getByRole("link", { name: "1" }).getAttribute("href"),
    ).toBe("/news");
  });

  it("locale=en は /en/news プレフィックス", () => {
    render(<NewsPagination currentPage={1} totalPages={2} locale="en" />);
    expect(
      screen.getByRole("link", { name: "2" }).getAttribute("href"),
    ).toBe("/en/news?page=2");
  });

  it("英語ラベル Previous/Next", () => {
    render(<NewsPagination currentPage={2} totalPages={3} locale="en" />);
    expect(screen.getByRole("link", { name: "Previous" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Next" })).toBeInTheDocument();
  });

  it("totalPages>7 で ellipsis を含めて省略表示", () => {
    render(<NewsPagination currentPage={5} totalPages={20} locale="ja" />);
    // 1, 4, 5, 6, 20 はリンク、両側に ellipsis (…)
    expect(screen.getByRole("link", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "4" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "5" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "6" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "20" })).toBeInTheDocument();
    // 中間の連続しないページはリンクとして存在しない
    expect(screen.queryByRole("link", { name: "10" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "15" })).not.toBeInTheDocument();
    // ellipsis 文字 (…) が描画される
    expect(screen.getAllByText("…").length).toBeGreaterThanOrEqual(1);
  });
});

describe("buildPageList", () => {
  it("totalPages <= 7 は全ページ", () => {
    expect(buildPageList(1, 1)).toEqual([1]);
    expect(buildPageList(3, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(buildPageList(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("中央付近: [1, '...', current-1, current, current+1, '...', total]", () => {
    expect(buildPageList(10, 20)).toEqual([
      1,
      "...",
      9,
      10,
      11,
      "...",
      20,
    ]);
  });

  it("先頭付近 (current<=4): [1,2,3,4, '...', total]", () => {
    expect(buildPageList(1, 20)).toEqual([1, 2, 3, 4, "...", 20]);
    expect(buildPageList(3, 20)).toEqual([1, 2, 3, 4, "...", 20]);
  });

  it("末尾付近 (current>=total-3): [1, '...', total-3, total-2, total-1, total]", () => {
    expect(buildPageList(20, 20)).toEqual([
      1,
      "...",
      17,
      18,
      19,
      20,
    ]);
    expect(buildPageList(18, 20)).toEqual([
      1,
      "...",
      17,
      18,
      19,
      20,
    ]);
  });
});
