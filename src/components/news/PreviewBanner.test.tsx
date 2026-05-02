import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PreviewBanner } from "./PreviewBanner";

describe("PreviewBanner", () => {
  it("ja 日本語ラベル", () => {
    render(<PreviewBanner locale="ja" />);
    expect(screen.getByText(/プレビューモード/)).toBeInTheDocument();
  });

  it("en 英語ラベル", () => {
    render(<PreviewBanner locale="en" />);
    expect(screen.getByText(/Preview mode/i)).toBeInTheDocument();
  });

  it("role=status + aria-live=polite", () => {
    render(<PreviewBanner locale="ja" />);
    const b = screen.getByRole("status");
    expect(b).toHaveAttribute("aria-live", "polite");
  });

  it("リンクは含まれない (URL クエリ削除のみで終了)", () => {
    render(<PreviewBanner locale="ja" />);
    expect(screen.queryByRole("link")).toBeNull();
  });
});
