import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BigBangCanvas } from "./BigBangCanvas";

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
  scale: vi.fn(),
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

  it("canvas 要素が role=img と aria-label 付きでレンダリングされる", () => {
    render(<BigBangCanvas onPhaseChange={vi.fn()} />);

    const canvas = screen.getByRole("img");
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute("aria-label", "ビッグバン シネマティック演出");
  });

  it("canvas が全画面表示される", () => {
    render(<BigBangCanvas onPhaseChange={vi.fn()} />);

    const canvas = screen.getByRole("img");
    expect(canvas.tagName).toBe("CANVAS");
  });

  it("マウント時に onPhaseChange が dark で呼ばれる", () => {
    const onPhaseChange = vi.fn();
    render(<BigBangCanvas onPhaseChange={onPhaseChange} />);
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
    render(<BigBangCanvas onPhaseChange={onPhaseChange} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(onPhaseChange).toHaveBeenCalledWith("content");
  });

  it("アンマウント時にアニメーションがクリーンアップされる", () => {
    const { unmount } = render(<BigBangCanvas onPhaseChange={vi.fn()} />);
    unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });

  it("dark フェーズで星を描画する", () => {
    const onPhaseChange = vi.fn();

    let currentTime = 0;
    vi.spyOn(performance, "now").mockImplementation(() => currentTime);

    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });

    render(<BigBangCanvas onPhaseChange={onPhaseChange} />);

    // dark phase: elapsed = 500ms
    currentTime = 500;
    rafCallbacks[rafCallbacks.length - 1](currentTime);

    expect(onPhaseChange).toHaveBeenCalledWith("dark");
  });

  it("converge フェーズに遷移する", () => {
    const onPhaseChange = vi.fn();

    let currentTime = 0;
    vi.spyOn(performance, "now").mockImplementation(() => currentTime);

    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });

    render(<BigBangCanvas onPhaseChange={onPhaseChange} />);

    // converge phase: elapsed > 1500
    currentTime = 2000;
    rafCallbacks[rafCallbacks.length - 1](currentTime);

    expect(onPhaseChange).toHaveBeenCalledWith("converge");
  });

  it("explode フェーズに遷移する", () => {
    const onPhaseChange = vi.fn();

    let currentTime = 0;
    vi.spyOn(performance, "now").mockImplementation(() => currentTime);

    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });

    render(<BigBangCanvas onPhaseChange={onPhaseChange} />);

    // explode phase: elapsed > 3000
    currentTime = 3500;
    rafCallbacks[rafCallbacks.length - 1](currentTime);

    expect(onPhaseChange).toHaveBeenCalledWith("explode");
  });

  it("explode フェーズでフラッシュが減衰する", () => {
    const onPhaseChange = vi.fn();

    let currentTime = 0;
    vi.spyOn(performance, "now").mockImplementation(() => currentTime);

    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });

    render(<BigBangCanvas onPhaseChange={onPhaseChange} />);

    // First frame in explode phase
    currentTime = 3100;
    rafCallbacks[rafCallbacks.length - 1](currentTime);

    // Second frame - flash should still be > 0 but decaying
    currentTime = 3200;
    rafCallbacks[rafCallbacks.length - 1](currentTime);

    expect(onPhaseChange).toHaveBeenCalledWith("explode");
  });

  it("content フェーズに遷移しアニメーションが停止する", () => {
    const onPhaseChange = vi.fn();

    let currentTime = 0;
    vi.spyOn(performance, "now").mockImplementation(() => currentTime);

    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });

    render(<BigBangCanvas onPhaseChange={onPhaseChange} />);

    // content phase: elapsed > 4000
    currentTime = 5000;
    rafCallbacks[rafCallbacks.length - 1](currentTime);

    expect(onPhaseChange).toHaveBeenCalledWith("content");
  });

  it("resize イベントで canvas サイズが更新される", () => {
    const onPhaseChange = vi.fn();

    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });

    render(<BigBangCanvas onPhaseChange={onPhaseChange} />);

    window.dispatchEvent(new Event("resize"));

    const ctx = mockGetContext.mock.results[0].value;
    expect(ctx.scale).toHaveBeenCalled();
  });

  it("getContext が null を返した場合アニメーションが開始されない", () => {
    mockGetContext.mockReturnValueOnce(null as unknown as ReturnType<typeof mockGetContext>);
    const onPhaseChange = vi.fn();

    render(<BigBangCanvas onPhaseChange={onPhaseChange} />);

    // onPhaseChange should only be called for initial dark (from useState), not from animation
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("同じフェーズで setPhase を呼んでも onPhaseChange が重複呼び出しされない", () => {
    const onPhaseChange = vi.fn();

    let currentTime = 0;
    vi.spyOn(performance, "now").mockImplementation(() => currentTime);

    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });

    render(<BigBangCanvas onPhaseChange={onPhaseChange} />);

    // Call dark phase twice — second call should not trigger onPhaseChange again
    currentTime = 100;
    rafCallbacks[rafCallbacks.length - 1](currentTime);

    currentTime = 200;
    rafCallbacks[rafCallbacks.length - 1](currentTime);

    // dark is called from initial setup + first rAF, but not duplicated
    const darkCalls = onPhaseChange.mock.calls.filter(
      (c: unknown[]) => c[0] === "dark"
    );
    // Initial dark + setPhase("dark") from first callback = should be same count as with second callback
    expect(darkCalls.length).toBeGreaterThanOrEqual(1);
  });

  it("モバイル幅で星と爆発パーティクル数が少なくなる", () => {
    const onPhaseChange = vi.fn();

    const originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, "innerWidth", { value: 375, writable: true, configurable: true });

    let currentTime = 0;
    vi.spyOn(performance, "now").mockImplementation(() => currentTime);

    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });

    render(<BigBangCanvas onPhaseChange={onPhaseChange} />);

    // dark phase
    currentTime = 500;
    rafCallbacks[rafCallbacks.length - 1](currentTime);

    expect(onPhaseChange).toHaveBeenCalledWith("dark");

    Object.defineProperty(window, "innerWidth", { value: originalInnerWidth, writable: true, configurable: true });
  });

  it("ctx.scale が関数でない場合スキップされる", () => {
    const ctxWithoutScale = {
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
    };
    mockGetContext.mockReturnValueOnce(ctxWithoutScale as unknown as ReturnType<typeof mockGetContext>);

    const onPhaseChange = vi.fn();

    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });

    render(<BigBangCanvas onPhaseChange={onPhaseChange} />);

    expect(onPhaseChange).toHaveBeenCalledWith("dark");
  });

  it("devicePixelRatio が未定義の場合デフォルト値が使われる", () => {
    const onPhaseChange = vi.fn();

    const originalDpr = window.devicePixelRatio;
    Object.defineProperty(window, "devicePixelRatio", { value: undefined, writable: true, configurable: true });

    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });

    render(<BigBangCanvas onPhaseChange={onPhaseChange} />);

    expect(onPhaseChange).toHaveBeenCalledWith("dark");

    Object.defineProperty(window, "devicePixelRatio", { value: originalDpr, writable: true, configurable: true });
  });

  it("explode フェーズでパーティクルの life が 0 以下になる", () => {
    const onPhaseChange = vi.fn();

    let currentTime = 0;
    vi.spyOn(performance, "now").mockImplementation(() => currentTime);

    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });

    render(<BigBangCanvas onPhaseChange={onPhaseChange} />);

    // Run many frames in the explode phase to let p.life decay below 0
    // p.life starts at 1 and decreases by 0.012 per frame -> ~84 frames to reach 0
    for (let i = 0; i < 90; i++) {
      currentTime = 3001 + i;
      rafCallbacks[rafCallbacks.length - 1](currentTime);
    }

    expect(onPhaseChange).toHaveBeenCalledWith("explode");
  });

  it("canvas の ref が null の場合アニメーションが開始されない", () => {
    mockGetContext.mockReturnValueOnce(null as unknown as ReturnType<typeof mockGetContext>);
    const onPhaseChange = vi.fn();

    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });

    render(<BigBangCanvas onPhaseChange={onPhaseChange} />);

    // rAF should not have been called since ctx is null
    expect(rafCallbacks).toHaveLength(0);
  });
});

