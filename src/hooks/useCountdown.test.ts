import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useCountdown } from "./useCountdown";

describe("useCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("残り時間を正しく計算する", () => {
    const now = new Date("2026-03-27T00:00:00+09:00");
    vi.setSystemTime(now);

    const target = new Date("2026-04-18T00:00:00+09:00");
    const { result } = renderHook(() => useCountdown(target));

    expect(result.current.days).toBe(22);
    expect(result.current.hours).toBe(0);
    expect(result.current.minutes).toBe(0);
    expect(result.current.seconds).toBe(0);
  });

  it("1秒ごとに更新される", () => {
    const now = new Date("2026-04-17T23:59:58+09:00");
    vi.setSystemTime(now);

    const target = new Date("2026-04-18T00:00:00+09:00");
    const { result } = renderHook(() => useCountdown(target));

    expect(result.current.seconds).toBe(2);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.seconds).toBe(1);
  });

  it("目標日時を過ぎたらすべて0になる", () => {
    const now = new Date("2026-04-19T00:00:00+09:00");
    vi.setSystemTime(now);

    const target = new Date("2026-04-18T00:00:00+09:00");
    const { result } = renderHook(() => useCountdown(target));

    expect(result.current.days).toBe(0);
    expect(result.current.hours).toBe(0);
    expect(result.current.minutes).toBe(0);
    expect(result.current.seconds).toBe(0);
  });

  it("アンマウント時にインターバルがクリアされる", () => {
    const now = new Date("2026-03-27T00:00:00+09:00");
    vi.setSystemTime(now);

    const target = new Date("2026-04-18T00:00:00+09:00");
    const { unmount } = renderHook(() => useCountdown(target));

    const clearIntervalSpy = vi.spyOn(global, "clearInterval");
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });
});
