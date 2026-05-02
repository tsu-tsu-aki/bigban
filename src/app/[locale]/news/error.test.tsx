import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const useLocaleMock = vi.fn(() => "ja");
vi.mock("next-intl", () => ({
  useLocale: () => useLocaleMock(),
}));

import NewsError from "./error";

describe("news error.tsx", () => {
  beforeEach(() => {
    useLocaleMock.mockReturnValue("ja");
  });

  it("ja: 再試行ボタンで reset を呼ぶ", () => {
    const reset = vi.fn();
    render(<NewsError error={new Error("x")} reset={reset} />);
    expect(
      screen.getByText("ニュースの読み込みに失敗しました。"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "再試行" }));
    expect(reset).toHaveBeenCalled();
  });

  it("en: Retry ボタンで reset を呼ぶ", () => {
    useLocaleMock.mockReturnValue("en");
    const reset = vi.fn();
    render(<NewsError error={new Error("x")} reset={reset} />);
    expect(screen.getByText("Failed to load news.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(reset).toHaveBeenCalled();
  });
});
