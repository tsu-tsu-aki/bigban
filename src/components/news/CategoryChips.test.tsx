import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => new URLSearchParams(""),
}));

import { CategoryChips } from "./CategoryChips";

describe("CategoryChips", () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it("All+4カテゴリ=5ボタン", () => {
    render(<CategoryChips locale="ja" activeCategory={undefined} />);
    expect(screen.getAllByRole("button")).toHaveLength(5);
  });

  it("activeCategory に一致で aria-pressed=true", () => {
    render(<CategoryChips locale="ja" activeCategory="media" />);
    expect(
      screen.getByRole("button", { name: "メディア掲載" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("Allはactive=undefined で pressed=true", () => {
    render(<CategoryChips locale="ja" activeCategory={undefined} />);
    expect(
      screen.getByRole("button", { name: "すべて" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("カテゴリクリックで /news?category=xxx", () => {
    render(<CategoryChips locale="ja" activeCategory={undefined} />);
    fireEvent.click(screen.getByRole("button", { name: "メディア掲載" }));
    expect(pushMock).toHaveBeenCalledWith("/news?category=media");
  });

  it("Allクリックで /news", () => {
    render(<CategoryChips locale="ja" activeCategory="media" />);
    fireEvent.click(screen.getByRole("button", { name: "すべて" }));
    expect(pushMock).toHaveBeenCalledWith("/news");
  });

  it("locale=en /en/news プレフィックス", () => {
    render(<CategoryChips locale="en" activeCategory={undefined} />);
    fireEvent.click(screen.getByRole("button", { name: "Media" }));
    expect(pushMock).toHaveBeenCalledWith("/en/news?category=media");
  });

  it("en All ラベルが All", () => {
    render(<CategoryChips locale="en" activeCategory={undefined} />);
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
  });
});
