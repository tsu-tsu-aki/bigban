import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAnimationPhase } from "./useAnimationPhase";

describe("useAnimationPhase", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("初期フェーズは dark", () => {
    const { result } = renderHook(() => useAnimationPhase());
    expect(result.current.phase).toBe("dark");
  });

  it("setPhase でフェーズを変更できる", () => {
    const { result } = renderHook(() => useAnimationPhase());

    act(() => {
      result.current.setPhase("converge");
    });

    expect(result.current.phase).toBe("converge");
  });

  it("reset で dark に戻る", () => {
    const { result } = renderHook(() => useAnimationPhase());

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
    const { result } = renderHook(() => useAnimationPhase());

    expect(result.current.isComplete).toBe(false);

    act(() => {
      result.current.setPhase("content");
    });

    expect(result.current.isComplete).toBe(true);
  });
});
