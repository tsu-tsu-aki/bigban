import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import HomeIntro from "./HomeIntro";

vi.mock("@/components/teaser/BigBangCanvas", () => ({
  BigBangCanvas: ({
    onPhaseChange,
  }: {
    onPhaseChange: (phase: string) => void;
  }) => (
    <canvas
      data-testid="bigbang-canvas"
      onClick={() => onPhaseChange("content")}
    />
  ),
}));

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, priority, ...rest } = props;
    return (
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
    expect(screen.getByTestId("bigbang-canvas")).toBeInTheDocument();
    expect(screen.getByTestId("home-content")).toBeInTheDocument();
  });

  it("sessionStorageにフラグがある場合はイントロをスキップする", () => {
    mockSessionStorage["bigban-intro-played"] = "true";
    render(
      <HomeIntro>
        <div data-testid="home-content">Home</div>
      </HomeIntro>
    );
    expect(screen.queryByTestId("bigbang-canvas")).not.toBeInTheDocument();
    expect(screen.getByTestId("home-content")).toBeInTheDocument();
  });

  it("contentフェーズでロゴを表示する", () => {
    render(
      <HomeIntro>
        <div data-testid="home-content">Home</div>
      </HomeIntro>
    );
    const canvas = screen.getByTestId("bigbang-canvas");
    act(() => {
      canvas.click();
    });
    expect(
      screen.getByAltText("THE PICKLE BANG THEORY")
    ).toBeInTheDocument();
  });

  it("contentフェーズでsessionStorageにフラグを保存する", () => {
    render(
      <HomeIntro>
        <div data-testid="home-content">Home</div>
      </HomeIntro>
    );
    const canvas = screen.getByTestId("bigbang-canvas");
    act(() => {
      canvas.click();
    });
    expect(mockSessionStorage["bigban-intro-played"]).toBe("true");
  });

  it("contentフェーズ後にイントロがフェードアウトする", () => {
    render(
      <HomeIntro>
        <div data-testid="home-content">Home</div>
      </HomeIntro>
    );
    const canvas = screen.getByTestId("bigbang-canvas");
    act(() => {
      canvas.click();
    });
    act(() => {
      vi.advanceTimersByTime(2100);
    });
    expect(screen.queryByTestId("bigbang-canvas")).not.toBeInTheDocument();
  });

  it("childrenを常に表示する", () => {
    render(
      <HomeIntro>
        <div data-testid="home-content">Home</div>
      </HomeIntro>
    );
    expect(screen.getByTestId("home-content")).toBeInTheDocument();
  });
});
