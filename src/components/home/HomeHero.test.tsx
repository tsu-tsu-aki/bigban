import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/hooks/useLanguage";
import HomeHero from "./HomeHero";

import type { ReactElement } from "react";

vi.mock("@/hooks/useMagneticButton", () => ({
  useMagneticButton: () => ({
    ref: { current: null },
    position: { x: 0, y: 0 },
    handleMouseMove: vi.fn(),
    handleMouseLeave: vi.fn(),
  }),
}));

function renderWithProvider(ui: ReactElement) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

describe("HomeHero", () => {
  it("「ビッグバン」がアクセントカラーでハイライトされている", () => {
    renderWithProvider(<HomeHero />);
    const bigbang = screen.getByText("ビッグバン");
    expect(bigbang.className).toContain("text-accent");
  });

  it("英語タグラインを表示する", () => {
    renderWithProvider(<HomeHero />);
    expect(
      screen.getByText("FROM A SMALL DINK TO A BIG MOVEMENT")
    ).toBeInTheDocument();
  });

  it("CTAボタン（RESERVE A COURT）を表示する", () => {
    renderWithProvider(<HomeHero />);
    const cta = screen.getByRole("link", { name: /RESERVE A COURT/ });
    expect(cta).toBeInTheDocument();
  });

  it("スクロールインジケーター（SCROLL）を表示する", () => {
    renderWithProvider(<HomeHero />);
    expect(screen.getByText("SCROLL")).toBeInTheDocument();
  });

  it("ヒーロー写真を表示する", () => {
    renderWithProvider(<HomeHero />);
    const img = screen.getByAltText("Player mid-swing");
    expect(img).toBeInTheDocument();
  });

  it("min-h-screenクラスが存在する", () => {
    const { container } = renderWithProvider(<HomeHero />);
    const section = container.firstElementChild;
    expect(section?.className).toContain("min-h-screen");
  });
});
