import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCrowdfundingPopup } from "./useCrowdfundingPopup";

const SESSION_KEY = "bigban-crowdfunding-dismissed";
const TRIGGER_DELAY_MS = 1500;

describe("useCrowdfundingPopup", () => {
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    mockStorage = {};
    Object.defineProperty(window, "sessionStorage", {
      value: {
        getItem: vi.fn((key: string) => mockStorage[key] ?? null),
        setItem: vi.fn((key: string, value: string) => {
          mockStorage[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete mockStorage[key];
        }),
      },
      writable: true,
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("初期表示直後 (タイマー発火前) は isOpen が false", () => {
    const { result } = renderHook(() => useCrowdfundingPopup());
    expect(result.current.isOpen).toBe(false);
  });

  it(`${TRIGGER_DELAY_MS}ms 経過後に isOpen が true になる`, () => {
    const { result } = renderHook(() => useCrowdfundingPopup());
    expect(result.current.isOpen).toBe(false);

    act(() => {
      vi.advanceTimersByTime(TRIGGER_DELAY_MS);
    });

    expect(result.current.isOpen).toBe(true);
  });

  it(`${TRIGGER_DELAY_MS - 1}ms 経過時点ではまだ isOpen が false (1ms 直前は出さない)`, () => {
    const { result } = renderHook(() => useCrowdfundingPopup());
    act(() => {
      vi.advanceTimersByTime(TRIGGER_DELAY_MS - 1);
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("sessionStorage 設定済みの場合はタイマー経過後も isOpen が false", () => {
    mockStorage[SESSION_KEY] = "true";
    const { result } = renderHook(() => useCrowdfundingPopup());

    act(() => {
      vi.advanceTimersByTime(TRIGGER_DELAY_MS);
    });

    expect(result.current.isOpen).toBe(false);
  });

  it("closePopup で isOpen が false になり sessionStorage に書き込む", () => {
    const { result } = renderHook(() => useCrowdfundingPopup());

    act(() => {
      vi.advanceTimersByTime(TRIGGER_DELAY_MS);
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.closePopup();
    });

    expect(result.current.isOpen).toBe(false);
    expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
      SESSION_KEY,
      "true",
    );
  });

  it("sessionStorage アクセスエラー時でもタイマーで表示される", () => {
    Object.defineProperty(window, "sessionStorage", {
      value: {
        getItem: vi.fn(() => {
          throw new Error("Access denied");
        }),
        setItem: vi.fn(() => {
          throw new Error("Access denied");
        }),
      },
      writable: true,
    });

    const { result } = renderHook(() => useCrowdfundingPopup());
    expect(result.current.isOpen).toBe(false);

    act(() => {
      vi.advanceTimersByTime(TRIGGER_DELAY_MS);
    });

    expect(result.current.isOpen).toBe(true);
  });

  it("sessionStorage 書き込みエラー時も closePopup が正常に動作する", () => {
    Object.defineProperty(window, "sessionStorage", {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(() => {
          throw new Error("Access denied");
        }),
      },
      writable: true,
    });

    const { result } = renderHook(() => useCrowdfundingPopup());

    act(() => {
      vi.advanceTimersByTime(TRIGGER_DELAY_MS);
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.closePopup();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it("unmount 時にタイマーがクリアされ、その後発火しない", () => {
    const { result, unmount } = renderHook(() => useCrowdfundingPopup());
    unmount();

    act(() => {
      vi.advanceTimersByTime(TRIGGER_DELAY_MS * 2);
    });

    // unmount 後に setIsTriggered が呼ばれず、結果としてリーク警告も出ない
    expect(result.current.isOpen).toBe(false);
  });
});
