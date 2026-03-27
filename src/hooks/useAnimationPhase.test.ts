import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAnimationPhase } from "./useAnimationPhase";
import type { BigBangConfig } from "@/components/teaser/types";

describe("useAnimationPhase", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const defaultConfig: BigBangConfig = {
    explosionStyle: "physics",
    duration: "medium",
  };

  it("初期フェーズは dark", () => {
    const { result } = renderHook(() => useAnimationPhase(defaultConfig));
    expect(result.current.phase).toBe("dark");
  });

  it("setPhase でフェーズを変更できる", () => {
    const { result } = renderHook(() => useAnimationPhase(defaultConfig));

    act(() => {
      result.current.setPhase("converge");
    });

    expect(result.current.phase).toBe("converge");
  });

  it("reset で dark に戻る", () => {
    const { result } = renderHook(() => useAnimationPhase(defaultConfig));

    act(() => {
      result.current.setPhase("content");
    });
    expect(result.current.phase).toBe("content");

    act(() => {
      result.current.reset();
    });
    expect(result.current.phase).toBe("dark");
  });

  it("isComplete は content フェーズで true", () => {
    const { result } = renderHook(() => useAnimationPhase(defaultConfig));

    expect(result.current.isComplete).toBe(false);

    act(() => {
      result.current.setPhase("content");
    });

    expect(result.current.isComplete).toBe(true);
  });

  it("config を返す", () => {
    const { result } = renderHook(() => useAnimationPhase(defaultConfig));
    expect(result.current.config).toEqual(defaultConfig);
  });

  it("config 変更時に状態が更新される", () => {
    const { result, rerender } = renderHook(
      ({ config }) => useAnimationPhase(config),
      { initialProps: { config: defaultConfig } }
    );

    const newConfig: BigBangConfig = { explosionStyle: "neon", duration: "short" };
    rerender({ config: newConfig });

    expect(result.current.config).toEqual(newConfig);
  });
});
