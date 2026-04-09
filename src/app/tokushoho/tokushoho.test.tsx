import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import TokushohoPage from "./page";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, priority, ...rest } = props;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        {...rest}
        data-fill={fill ? "true" : undefined}
        data-priority={priority ? "true" : undefined}
      />
    );
  },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/tokushoho",
}));

vi.mock("@/hooks/useLanguage", () => ({
  useLanguage: () => ({ language: "ja", toggleLanguage: vi.fn() }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/hooks/useActiveSection", () => ({
  useActiveSection: () => "",
}));

describe("TokushohoPage", () => {
  it("ページタイトルを表示する", () => {
    render(<TokushohoPage />);
    expect(
      screen.getByRole("heading", { name: "特定商取引法に基づく表記" })
    ).toBeInTheDocument();
  });

  it("販売者情報を表示する", () => {
    render(<TokushohoPage />);
    expect(screen.getByText("RST Agency株式会社")).toBeInTheDocument();
    expect(screen.getByText("西村昭彦")).toBeInTheDocument();
  });

  it("連絡先情報を表示する", () => {
    render(<TokushohoPage />);
    expect(screen.getByText("090 5523 3879")).toBeInTheDocument();
    expect(screen.getByText("hello@rstagency.com")).toBeInTheDocument();
  });

  it("ホームページURLをリンクとして表示する", () => {
    render(<TokushohoPage />);
    const link = screen.getByRole("link", { name: "https://rstagency.com" });
    expect(link).toHaveAttribute("href", "https://rstagency.com");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("返品・交換情報を表示する", () => {
    render(<TokushohoPage />);
    expect(screen.getByText("不良品以外不可")).toBeInTheDocument();
    expect(screen.getByText("商品購入より2週間以内")).toBeInTheDocument();
  });

  it("全16項目が表示される", () => {
    render(<TokushohoPage />);
    const terms = screen.getAllByRole("term");
    expect(terms).toHaveLength(16);
  });

  it("フッターが表示される", () => {
    render(<TokushohoPage />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
