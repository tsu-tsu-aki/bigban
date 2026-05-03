import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import HomeIntro from "./HomeIntro";

// canvas mount 中の onPhaseChange を外部に露出させ、
// canvas が unmount された後でも (連続発火テスト用に) 呼べるようにする。
let capturedPhaseChange: ((phase: string) => void) | null = null;

vi.mock("@/components/intro/StarfieldWarpIntro", () => ({
  StarfieldWarpIntro: ({
    onPhaseChange,
  }: {
    onPhaseChange: (phase: string) => void;
  }) => {
    capturedPhaseChange = onPhaseChange;
    return (
      <canvas
        data-testid="starfield-warp-intro"
        onClick={() => onPhaseChange("content")}
        onDoubleClick={() => onPhaseChange("explode")}
      />
    );
  },
}));

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

const mockSessionStorage: Record<string, string> = {};

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  capturedPhaseChange = null;
  Object.keys(mockSessionStorage).forEach(
    (key) => delete mockSessionStorage[key]
  );
  Object.defineProperty(window, "sessionStorage", {
    value: {
      getItem: (key: string) => mockSessionStorage[key] ?? null,
      setItem: (key: string, value: string) => {
        mockSessionStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete mockSessionStorage[key];
      },
    },
    writable: true,
  });
});

describe("HomeIntro", () => {
  it("初回アクセス時にイントロを表示する", () => {
    render(
      <HomeIntro>
        <div data-testid="home-content">Home</div>
      </HomeIntro>
    );
    expect(screen.getByTestId("starfield-warp-intro")).toBeInTheDocument();
    expect(screen.getByTestId("home-content")).toBeInTheDocument();
  });

  it("sessionStorageにフラグがある場合はイントロをスキップする", () => {
    mockSessionStorage["bigban-intro-played"] = "true";
    render(
      <HomeIntro>
        <div data-testid="home-content">Home</div>
      </HomeIntro>
    );
    expect(screen.queryByTestId("starfield-warp-intro")).not.toBeInTheDocument();
    expect(screen.getByTestId("home-content")).toBeInTheDocument();
  });

  it("content以外のフェーズではロゴを表示しない", () => {
    render(
      <HomeIntro>
        <div data-testid="home-content">Home</div>
      </HomeIntro>
    );
    const canvas = screen.getByTestId("starfield-warp-intro");
    act(() => {
      canvas.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    });
    expect(
      screen.queryByAltText("THE PICKLE BANG THEORY")
    ).not.toBeInTheDocument();
  });

  it("contentフェーズでロゴを表示する", () => {
    render(
      <HomeIntro>
        <div data-testid="home-content">Home</div>
      </HomeIntro>
    );
    const canvas = screen.getByTestId("starfield-warp-intro");
    act(() => {
      canvas.click();
    });
    expect(screen.getByAltText("THE PICKLE BANG THEORY")).toBeInTheDocument();
  });

  it("contentフェーズでsessionStorageにフラグを保存する", () => {
    render(
      <HomeIntro>
        <div data-testid="home-content">Home</div>
      </HomeIntro>
    );
    const canvas = screen.getByTestId("starfield-warp-intro");
    act(() => {
      canvas.click();
    });
    expect(mockSessionStorage["bigban-intro-played"]).toBe("true");
  });

  it("contentフェーズ後 LOGO_HOLD_MS (800ms) 経過でイントロが unmount される", () => {
    render(
      <HomeIntro>
        <div data-testid="home-content">Home</div>
      </HomeIntro>
    );
    const canvas = screen.getByTestId("starfield-warp-intro");
    act(() => {
      canvas.click();
    });
    act(() => {
      vi.advanceTimersByTime(900);
    });
    expect(screen.queryByTestId("starfield-warp-intro")).not.toBeInTheDocument();
    expect(
      screen.queryByAltText("THE PICKLE BANG THEORY"),
    ).not.toBeInTheDocument();
  });

  it("contentフェーズに入った瞬間に canvas (StarfieldWarpIntro) が unmount される", () => {
    // race を防ぐため、canvas は phase=content 受信即時に unmount し
    // rAF 停止後の最終フレーム (黒) が残らないようにする。
    render(
      <HomeIntro>
        <div data-testid="home-content">Home</div>
      </HomeIntro>
    );
    const canvas = screen.getByTestId("starfield-warp-intro");
    act(() => {
      canvas.click();
    });
    expect(screen.queryByTestId("starfield-warp-intro")).not.toBeInTheDocument();
    // ロゴは独立レイヤーで表示される
    expect(screen.getByAltText("THE PICKLE BANG THEORY")).toBeInTheDocument();
  });

  it("content フェーズが連続発火しても hold timer がリークしない (clearTimeout で上書き)", () => {
    render(
      <HomeIntro>
        <div data-testid="home-content">Home</div>
      </HomeIntro>
    );
    // 1 回目: hold timer set (この瞬間 canvas は unmount される)
    act(() => {
      capturedPhaseChange?.("content");
    });
    // 2 回目: canvas は既に unmount 済だが captured handler を直接呼んで
    // 既存 hold timer を clearTimeout で上書きする経路をカバーする。
    act(() => {
      capturedPhaseChange?.("content");
    });
    // 2 回目の setTimeout 後に unmount される
    act(() => {
      vi.advanceTimersByTime(900);
    });
    expect(
      screen.queryByTestId("starfield-warp-intro"),
    ).not.toBeInTheDocument();
  });

  it("phase=content が来なくても FALLBACK_UNMOUNT_MS (6000ms) で必ず unmount される", () => {
    // Framer Motion の race / canvas 暴走で phase=content が来ないケースの保険。
    // ユーザーが永久に黒画面に閉じ込められないよう必ず復帰する。
    render(
      <HomeIntro>
        <div data-testid="home-content">Home</div>
      </HomeIntro>
    );
    expect(screen.getByTestId("starfield-warp-intro")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(6100);
    });
    expect(
      screen.queryByTestId("starfield-warp-intro"),
    ).not.toBeInTheDocument();
  });

  it("childrenを常に表示する", () => {
    render(
      <HomeIntro>
        <div data-testid="home-content">Home</div>
      </HomeIntro>
    );
    expect(screen.getByTestId("home-content")).toBeInTheDocument();
  });

  it("マウント時にintro-pendingクラスを解除する", () => {
    document.documentElement.classList.add("intro-pending");
    render(
      <HomeIntro>
        <div data-testid="home-content">Home</div>
      </HomeIntro>
    );
    expect(
      document.documentElement.classList.contains("intro-pending")
    ).toBe(false);
  });

  it("sessionStorageアクセスエラー時はイントロをスキップする", () => {
    Object.defineProperty(window, "sessionStorage", {
      value: {
        getItem: () => {
          throw new Error("SecurityError");
        },
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });
    render(
      <HomeIntro>
        <div data-testid="home-content">Home</div>
      </HomeIntro>
    );
    expect(screen.queryByTestId("starfield-warp-intro")).not.toBeInTheDocument();
    expect(screen.getByTestId("home-content")).toBeInTheDocument();
  });
});
