import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NewsPagination } from "./NewsPagination";

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
});
