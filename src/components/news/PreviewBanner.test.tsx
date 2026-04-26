import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PreviewBanner } from "./PreviewBanner";

describe("PreviewBanner", () => {
  it("ja 日本語", () => {
    render(<PreviewBanner locale="ja" exitHref="/news/x" />);
    expect(screen.getByText(/プレビューモード/)).toBeInTheDocument();
  });

  it("en 英語", () => {
    render(<PreviewBanner locale="en" exitHref="/en/news/x" />);
    expect(screen.getByText(/Preview mode/i)).toBeInTheDocument();
  });

  it("終了リンクは exitHref に従う (公開版 URL に遷移)", () => {
    render(<PreviewBanner locale="ja" exitHref="/news/grand-opening" />);
    expect(screen.getByRole("link", { name: /終了/ })).toHaveAttribute(
      "href",
      "/news/grand-opening",
    );
  });

  it("英語 Exit リンクも exitHref に従う", () => {
    render(<PreviewBanner locale="en" exitHref="/en/news/grand-opening" />);
    expect(screen.getByRole("link", { name: /Exit/ })).toHaveAttribute(
      "href",
      "/en/news/grand-opening",
    );
  });

  it("role=status + aria-live=polite", () => {
    render(<PreviewBanner locale="ja" exitHref="/news/x" />);
    const b = screen.getByRole("status");
    expect(b).toHaveAttribute("aria-live", "polite");
  });
});
