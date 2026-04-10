import { render, screen, act, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import TeaserPage from "./TeaserPage";

vi.mock("@/components/teaser/BigBangCanvas", () => ({
  BigBangCanvas: ({ onPhaseChange }: { onPhaseChange: (phase: string) => void }) => {
    setTimeout(() => onPhaseChange("content"), 0);
    return <canvas data-testid="canvas-engine" />;
  },
}));

describe("TeaserPage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-27T00:00:00+09:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("初期状態で Canvas エンジンが表示される", () => {
    render(<TeaserPage />);
    expect(screen.getByTestId("canvas-engine")).toBeInTheDocument();
  });

  it("演出完了後にティザーコンテンツが表示される", async () => {
    render(<TeaserPage />);
    await act(async () => {
      vi.advanceTimersByTime(10);
    });
    expect(screen.getByText("2026.4.17 18:00 OPEN")).toBeInTheDocument();
  });

  it("custom-cursor-area クラスが適用される", () => {
    render(<TeaserPage />);
    const container = screen.getByTestId("teaser-page");
    expect(container).toHaveClass("custom-cursor-area");
  });

  it("カスタムカーソル要素に custom-cursor クラスが適用される", () => {
    render(<TeaserPage />);
    const cursorElement = screen.getByTestId("custom-cursor");
    expect(cursorElement).toHaveClass("custom-cursor");
  });

  it("マウス移動でカーソル位置が更新される", () => {
    render(<TeaserPage />);

    fireEvent.mouseMove(window, { clientX: 100, clientY: 200 });

    const container = screen.getByTestId("teaser-page");
    expect(container).toBeInTheDocument();
  });
});

const mockGetTranslations = vi.fn();

vi.mock("next-intl/server", () => ({
  getTranslations: (...args: unknown[]) => mockGetTranslations(...args),
}));

describe("generateMetadata", () => {
  it("日本語メタデータを返す", async () => {
    const mockT = (key: string) => `translated:${key}`;
    mockGetTranslations.mockResolvedValue(mockT);

    const { generateMetadata } = await import("./page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "ja" }),
    });

    expect(metadata.title).toBe("translated:home.title");
    expect(metadata.description).toBe("translated:home.description");
    expect(metadata.openGraph?.locale).toBe("ja_JP");
  });

  it("英語メタデータを返す", async () => {
    const mockT = (key: string) => `translated:${key}`;
    mockGetTranslations.mockResolvedValue(mockT);

    const { generateMetadata } = await import("./page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en" }),
    });

    expect(metadata.title).toBe("translated:home.title");
    expect(metadata.description).toBe("translated:home.description");
    expect(metadata.openGraph?.locale).toBe("en_US");
  });
});

describe("Page wrapper", () => {
  it("TeaserPageを描画する", async () => {
    const { default: Page } = await import("./page");
    render(<Page />);
    expect(screen.getByTestId("teaser-page")).toBeInTheDocument();
  });
});
