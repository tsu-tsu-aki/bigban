import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PreviewBanner } from "./PreviewBanner";

describe("PreviewBanner", () => {
  it("ja 日本語", () => {
    render(<PreviewBanner locale="ja" />);
    expect(screen.getByText(/プレビューモード/)).toBeInTheDocument();
  });

  it("en 英語", () => {
    render(<PreviewBanner locale="en" />);
    expect(screen.getByText(/Preview mode/i)).toBeInTheDocument();
  });

  it("終了リンクが /api/draft/disable", () => {
    render(<PreviewBanner locale="ja" />);
    expect(screen.getByRole("link", { name: /終了/ })).toHaveAttribute(
      "href",
      "/api/draft/disable",
    );
  });

  it("英語 Exit リンク", () => {
    render(<PreviewBanner locale="en" />);
    expect(screen.getByRole("link", { name: /Exit/ })).toHaveAttribute(
      "href",
      "/api/draft/disable",
    );
  });

  it("role=status + aria-live=polite", () => {
    render(<PreviewBanner locale="ja" />);
    const b = screen.getByRole("status");
    expect(b).toHaveAttribute("aria-live", "polite");
  });
});
