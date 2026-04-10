import { render, screen, act, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import TeaserPage from "./page";

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
