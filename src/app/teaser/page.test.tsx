import { render, screen, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import TeaserPage from "./page";

// BigBang エンジンをモック
vi.mock("@/components/teaser/BigBangCanvas", () => ({
  BigBangCanvas: ({ onPhaseChange }: { onPhaseChange: (phase: string) => void }) => {
    // マウント直後に content フェーズに遷移（テスト用に即完了）
    setTimeout(() => onPhaseChange("content"), 0);
    return <canvas data-testid="canvas-engine" />;
  },
}));

vi.mock("@/components/teaser/BigBangWebGL", () => ({
  BigBangWebGL: ({ onPhaseChange }: { onPhaseChange: (phase: string) => void }) => {
    setTimeout(() => onPhaseChange("content"), 0);
    return <div data-testid="webgl-engine" />;
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
    expect(screen.getByText("2026.4.18 OPEN")).toBeInTheDocument();
  });

  it("EngineSwitch でエンジンを切り替えられる", async () => {
    render(<TeaserPage />);

    const webglBtn = screen.getByRole("button", { name: /webgl/i });
    await act(async () => {
      fireEvent.click(webglBtn);
    });

    expect(screen.getByTestId("webgl-engine")).toBeInTheDocument();
  });

  it("EngineSwitch が表示される", () => {
    render(<TeaserPage />);
    expect(screen.getByRole("button", { name: /canvas/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /physics/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /play/i })).toBeInTheDocument();
  });

  it("カスタムカーソルが表示される", () => {
    render(<TeaserPage />);
    const container = screen.getByTestId("teaser-page");
    expect(container).toHaveClass("cursor-none");
  });
});
