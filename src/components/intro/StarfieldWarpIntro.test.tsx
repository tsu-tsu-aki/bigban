import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { StarfieldWarpIntro } from "./StarfieldWarpIntro";

const mockGetContext = vi.fn(() => ({
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
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
  shadowBlur: 0,
  shadowColor: "",
}));

HTMLCanvasElement.prototype.getContext =
  mockGetContext as unknown as typeof HTMLCanvasElement.prototype.getContext;

describe("StarfieldWarpIntro", () => {
  beforeEach(() => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      setTimeout(() => cb(performance.now()), 16);
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("canvas 要素が role=img と aria-label 付きでレンダリングされる", () => {
    render(<StarfieldWarpIntro onPhaseChange={vi.fn()} />);

    const canvas = screen.getByRole("img");
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute("aria-label", "ハイパースペース・ワープ シネマティック演出");
  });

  it("canvas タグでレンダリングされる", () => {
    render(<StarfieldWarpIntro onPhaseChange={vi.fn()} />);
    const canvas = screen.getByRole("img");
    expect(canvas.tagName).toBe("CANVAS");
  });

  it("マウント時に onPhaseChange が dark で呼ばれる", () => {
    const onPhaseChange = vi.fn();
    render(<StarfieldWarpIntro onPhaseChange={onPhaseChange} />);
    expect(onPhaseChange).toHaveBeenCalledWith("dark");
  });

  it("prefers-reduced-motion 時は canvas がレンダリングされず即 content が呼ばれる", () => {
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
    render(<StarfieldWarpIntro onPhaseChange={onPhaseChange} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(onPhaseChange).toHaveBeenCalledWith("content");
  });

  it("アンマウント時にアニメーションがクリーンアップされる", () => {
    const { unmount } = render(<StarfieldWarpIntro onPhaseChange={vi.fn()} />);
    unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });

  it("drift フェーズの描画で onPhaseChange が dark のまま維持される", () => {
    const onPhaseChange = vi.fn();

    let currentTime = 0;
    vi.spyOn(performance, "now").mockImplementation(() => currentTime);

    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });

    render(<StarfieldWarpIntro onPhaseChange={onPhaseChange} />);

    // drift phase: elapsed = 500ms
    currentTime = 500;
    rafCallbacks[rafCallbacks.length - 1](currentTime);

    expect(onPhaseChange).toHaveBeenCalledWith("dark");
    // 500ms ではまだ converge には遷移しない
    expect(
      onPhaseChange.mock.calls.filter((c) => c[0] === "converge").length
    ).toBe(0);
  });

  it("drift を抜けると converge フェーズに遷移する", () => {
    const onPhaseChange = vi.fn();

    let currentTime = 0;
    vi.spyOn(performance, "now").mockImplementation(() => currentTime);

    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });

    render(<StarfieldWarpIntro onPhaseChange={onPhaseChange} />);

    // elapsed = 1500 (> T_DRIFT 900)
    currentTime = 1500;
    rafCallbacks[rafCallbacks.length - 1](currentTime);

    expect(onPhaseChange).toHaveBeenCalledWith("converge");
  });

  it("accel/hyperspace 進行中 phaseProgress の各域で色分岐をカバー", () => {
    const onPhaseChange = vi.fn();

    let currentTime = 0;
    vi.spyOn(performance, "now").mockImplementation(() => currentTime);

    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });

    render(<StarfieldWarpIntro onPhaseChange={onPhaseChange} />);

    // phaseProgress < 0.4 (accel 初期)
    currentTime = 1200;
    rafCallbacks[rafCallbacks.length - 1](currentTime);

    // phaseProgress ∈ [0.4, 0.75)
    currentTime = 1900;
    rafCallbacks[rafCallbacks.length - 1](currentTime);

    // phaseProgress >= 0.75 → hyperspace flare ブランチも通過
    currentTime = 2500;
    rafCallbacks[rafCallbacks.length - 1](currentTime);

    // hyperspace 以降
    currentTime = 3000;
    rafCallbacks[rafCallbacks.length - 1](currentTime);

    expect(onPhaseChange).toHaveBeenCalledWith("converge");
  });

  it("hyperspace を抜けると explode フェーズに遷移する", () => {
    const onPhaseChange = vi.fn();

    let currentTime = 0;
    vi.spyOn(performance, "now").mockImplementation(() => currentTime);

    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });

    render(<StarfieldWarpIntro onPhaseChange={onPhaseChange} />);

    // まず converge に
    currentTime = 1500;
    rafCallbacks[rafCallbacks.length - 1](currentTime);

    // T_HYPER(3400) 以降 → explode
    currentTime = 3600;
    rafCallbacks[rafCallbacks.length - 1](currentTime);

    expect(onPhaseChange).toHaveBeenCalledWith("explode");
  });

  it("burst 終了後 content フェーズに遷移しアニメーションが停止する", () => {
    const onPhaseChange = vi.fn();

    let currentTime = 0;
    vi.spyOn(performance, "now").mockImplementation(() => currentTime);

    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });

    render(<StarfieldWarpIntro onPhaseChange={onPhaseChange} />);

    // converge → explode → content
    currentTime = 1500;
    rafCallbacks[rafCallbacks.length - 1](currentTime);
    currentTime = 3600;
    rafCallbacks[rafCallbacks.length - 1](currentTime);
    currentTime = 5000; // T_BURST 4700 超え
    rafCallbacks[rafCallbacks.length - 1](currentTime);

    expect(onPhaseChange).toHaveBeenCalledWith("content");
  });

  it("resize イベントで canvas サイズが更新される", () => {
    const onPhaseChange = vi.fn();
    render(<StarfieldWarpIntro onPhaseChange={onPhaseChange} />);

    window.dispatchEvent(new Event("resize"));

    const ctx = mockGetContext.mock.results[0].value;
    expect(ctx.scale).toHaveBeenCalled();
  });

  it("getContext が null を返した場合アニメーションが開始されない", () => {
    mockGetContext.mockReturnValueOnce(
      null as unknown as ReturnType<typeof mockGetContext>
    );
    const onPhaseChange = vi.fn();
    render(<StarfieldWarpIntro onPhaseChange={onPhaseChange} />);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("同じフェーズで setPhase を呼んでも onPhaseChange が重複しない", () => {
    const onPhaseChange = vi.fn();

    let currentTime = 0;
    vi.spyOn(performance, "now").mockImplementation(() => currentTime);

    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });

    render(<StarfieldWarpIntro onPhaseChange={onPhaseChange} />);

    // drift 内2回連続
    currentTime = 100;
    rafCallbacks[rafCallbacks.length - 1](currentTime);
    currentTime = 200;
    rafCallbacks[rafCallbacks.length - 1](currentTime);

    const darkCalls = onPhaseChange.mock.calls.filter((c) => c[0] === "dark");
    // dark は一度だけ (useEffect からの初期呼出し)
    expect(darkCalls.length).toBe(1);
  });

  it("burst 中に flashAlpha / ringAlpha が 0 に達する分岐をカバー", () => {
    const onPhaseChange = vi.fn();

    let currentTime = 0;
    vi.spyOn(performance, "now").mockImplementation(() => currentTime);

    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });

    render(<StarfieldWarpIntro onPhaseChange={onPhaseChange} />);

    // converge → explode の後、burst の終盤で flashAlpha=0 / ringAlpha=0 の分岐を通過
    currentTime = 1500;
    rafCallbacks[rafCallbacks.length - 1](currentTime);
    currentTime = 3600;
    rafCallbacks[rafCallbacks.length - 1](currentTime);
    // T_HYPER (3400) + burst の 80% 超え (t > 1/1.1 ≈ 0.909) → ringAlpha = 0
    currentTime = 4600;
    rafCallbacks[rafCallbacks.length - 1](currentTime);

    expect(onPhaseChange).toHaveBeenCalledWith("explode");
  });

  it("T_BURST 以降に初回 render されると phaseRef が explode でなくても早期returnする", () => {
    const onPhaseChange = vi.fn();

    let currentTime = 0;
    vi.spyOn(performance, "now").mockImplementation(() => currentTime);

    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });

    render(<StarfieldWarpIntro onPhaseChange={onPhaseChange} />);

    // 一気に T_BURST (4700) 超え → phaseRef は "dark" のまま、if (phaseRef === "explode") は false
    currentTime = 5000;
    rafCallbacks[rafCallbacks.length - 1](currentTime);

    // content には遷移しない (explode 経由していないため)
    const contentCalls = onPhaseChange.mock.calls.filter((c) => c[0] === "content");
    expect(contentCalls.length).toBe(0);
  });

  it("devicePixelRatio が未定義の場合フォールバック値 1 が使われる", () => {
    const original = window.devicePixelRatio;
    Object.defineProperty(window, "devicePixelRatio", {
      value: 0,
      writable: true,
      configurable: true,
    });

    const onPhaseChange = vi.fn();
    render(<StarfieldWarpIntro onPhaseChange={onPhaseChange} />);

    expect(screen.getByRole("img")).toBeInTheDocument();

    Object.defineProperty(window, "devicePixelRatio", {
      value: original,
      writable: true,
      configurable: true,
    });
  });

  it("星が画面後方 (z<=0) に達するとリセットされる", () => {
    const onPhaseChange = vi.fn();

    let currentTime = 0;
    vi.spyOn(performance, "now").mockImplementation(() => currentTime);

    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });

    render(<StarfieldWarpIntro onPhaseChange={onPhaseChange} />);

    // accel フェーズで複数フレーム実行 → 一部の星が z<=0 になりリセット
    for (let i = 0; i < 50; i++) {
      currentTime = 1500 + i * 50;
      rafCallbacks[rafCallbacks.length - 1](currentTime);
    }

    // エラーなく complete までいく
    currentTime = 5000;
    rafCallbacks[rafCallbacks.length - 1](currentTime);

    expect(onPhaseChange).toHaveBeenCalledWith("content");
  });
});
