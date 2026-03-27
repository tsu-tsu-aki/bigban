import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BigBangWebGL } from "./BigBangWebGL";
import type { BigBangConfig } from "./types";

// R3F は jsdom では動作しないため、dynamic import をモックし
// WebGL 未対応時のフォールバック動作をテストする
vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="r3f-canvas">{children}</div>
  ),
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({ size: { width: 1440, height: 900 } })),
}));

vi.mock("@react-three/drei", () => ({
  useTexture: vi.fn(() => ({
    image: { width: 100, height: 200 },
  })),
}));

describe("BigBangWebGL", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const defaultConfig: BigBangConfig = {
    explosionStyle: "physics",
    duration: "medium",
  };

  it("R3F Canvas コンテナがレンダリングされる", () => {
    render(
      <BigBangWebGL
        config={defaultConfig}
        onPhaseChange={vi.fn()}
        logoSrc="/logos/tate-neon-hybrid.svg"
      />
    );

    expect(screen.getByRole("img")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("aria-label", "ビッグバン シネマティック演出");
  });

  it("マウント時に onPhaseChange が dark で呼ばれる", () => {
    const onPhaseChange = vi.fn();

    render(
      <BigBangWebGL
        config={defaultConfig}
        onPhaseChange={onPhaseChange}
        logoSrc="/logos/tate-neon-hybrid.svg"
      />
    );

    expect(onPhaseChange).toHaveBeenCalledWith("dark");
  });

  it("prefers-reduced-motion 時は content に直接遷移する", () => {
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
      <BigBangWebGL
        config={defaultConfig}
        onPhaseChange={onPhaseChange}
        logoSrc="/logos/tate-neon-hybrid.svg"
      />
    );

    expect(onPhaseChange).toHaveBeenCalledWith("content");
  });
});
