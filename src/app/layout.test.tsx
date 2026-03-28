import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "fs";
import path from "path";

// next/font/google のモック — 各フォントが CSS 変数クラスを返すことを検証
const mockDmSerif = vi.fn().mockReturnValue({
  variable: "--font-dm-serif",
  className: "mock-dm-serif",
});
const mockInter = vi.fn().mockReturnValue({
  variable: "--font-inter",
  className: "mock-inter",
});
const mockNotoSansJP = vi.fn().mockReturnValue({
  variable: "--font-noto-sans-jp",
  className: "mock-noto-sans-jp",
});

vi.mock("next/font/google", () => ({
  DM_Serif_Display: mockDmSerif,
  Inter: mockInter,
  Noto_Sans_JP: mockNotoSansJP,
}));

vi.mock("./globals.css", () => ({}));

describe("RootLayout", () => {
  it("Noto_Sans_JP が preload: false で初期化される", async () => {
    await import("./layout");

    expect(mockNotoSansJP).toHaveBeenCalledWith(
      expect.objectContaining({
        subsets: ["latin"],
        variable: "--font-noto-sans-jp",
        display: "swap",
        preload: false,
      })
    );
  });

  it("RootLayout が children を描画し、フォント CSS 変数クラスを適用する", async () => {
    const { default: RootLayout } = await import("./layout");

    render(
      <RootLayout>
        <p>test child</p>
      </RootLayout>
    );

    expect(screen.getByText("test child")).toBeInTheDocument();
  });
});

describe("globals.css", () => {
  const cssContent = readFileSync(
    path.resolve(__dirname, "globals.css"),
    "utf-8"
  );

  it("--font-sans に Noto Sans JP が含まれる", () => {
    expect(cssContent).toMatch(/--font-sans:.*Noto Sans JP/);
  });

  it("body に font-feature-settings: \"palt\" が設定されている", () => {
    expect(cssContent).toMatch(/font-feature-settings:\s*"palt"/);
  });
});
