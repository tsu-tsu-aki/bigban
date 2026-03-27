import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BigBangCanvas } from "./BigBangCanvas";
import type { BigBangConfig } from "./types";

// Canvas API をモック
const mockGetContext = vi.fn(() => ({
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  createRadialGradient: vi.fn(() => ({
    addColorStop: vi.fn(),
  })),
  canvas: { width: 1440, height: 900 },
  globalCompositeOperation: "source-over",
  globalAlpha: 1,
  fillStyle: "",
  strokeStyle: "",
  lineWidth: 1,
}));

HTMLCanvasElement.prototype.getContext = mockGetContext as unknown as typeof HTMLCanvasElement.prototype.getContext;

describe("BigBangCanvas", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      setTimeout(() => cb(performance.now()), 16);
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(vi.fn());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const defaultConfig: BigBangConfig = {
    explosionStyle: "physics",
    duration: "medium",
  };

  it("canvas 要素が role=img と aria-label 付きでレンダリングされる", () => {
    render(
      <BigBangCanvas
        config={defaultConfig}
        onPhaseChange={vi.fn()}
        logoSrc="/logos/tate-neon-hybrid.svg"
      />
    );

    const canvas = screen.getByRole("img");
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute("aria-label", "ビッグバン シネマティック演出");
  });

  it("canvas が全画面表示される", () => {
    render(
      <BigBangCanvas
        config={defaultConfig}
        onPhaseChange={vi.fn()}
        logoSrc="/logos/tate-neon-hybrid.svg"
      />
    );

    const canvas = screen.getByRole("img");
    expect(canvas.tagName).toBe("CANVAS");
  });

  it("マウント時に onPhaseChange が dark で呼ばれる", () => {
    const onPhaseChange = vi.fn();

    render(
      <BigBangCanvas
        config={defaultConfig}
        onPhaseChange={onPhaseChange}
        logoSrc="/logos/tate-neon-hybrid.svg"
      />
    );

    expect(onPhaseChange).toHaveBeenCalledWith("dark");
  });

  it("prefers-reduced-motion 時は canvas がレンダリングされない", () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const onPhaseChange = vi.fn();

    render(
      <BigBangCanvas
        config={defaultConfig}
        onPhaseChange={onPhaseChange}
        logoSrc="/logos/tate-neon-hybrid.svg"
      />
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(onPhaseChange).toHaveBeenCalledWith("content");
  });

  it("アンマウント時にアニメーションがクリーンアップされる", () => {
    const { unmount } = render(
      <BigBangCanvas
        config={defaultConfig}
        onPhaseChange={vi.fn()}
        logoSrc="/logos/tate-neon-hybrid.svg"
      />
    );

    unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });
});
