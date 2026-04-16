import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCrowdfundingPopup } from "./useCrowdfundingPopup";

const SESSION_KEY = "bigban-crowdfunding-dismissed";

// IntersectionObserverのモック
let observerCallback: IntersectionObserverCallback;
let mockObserve: ReturnType<typeof vi.fn>;
let mockDisconnect: ReturnType<typeof vi.fn>;

function setupIntersectionObserver() {
  mockObserve = vi.fn();
  mockDisconnect = vi.fn();

  class MockIntersectionObserver {
    constructor(callback: IntersectionObserverCallback) {
      observerCallback = callback;
    }
    observe = mockObserve;
    unobserve = vi.fn();
    disconnect = mockDisconnect;
    root = null;
    rootMargin = "";
    thresholds = [] as number[];
    takeRecords = vi.fn();
  }

  global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
}

function triggerAboutSectionPassed() {
  // about usセクションが上方向に通過した状態をシミュレート
  const aboutEl = document.getElementById("about");
  if (aboutEl) {
    vi.spyOn(aboutEl, "getBoundingClientRect").mockReturnValue({
      bottom: -100,
      top: -500,
      left: 0,
      right: 0,
      width: 0,
      height: 400,
      x: 0,
      y: -500,
      toJSON: vi.fn(),
    });
  }
  observerCallback(
    [{ isIntersecting: false } as IntersectionObserverEntry],
    {} as IntersectionObserver
  );
}

describe("useCrowdfundingPopup", () => {
  let mockStorage: Record<string, string>;
  let aboutSection: HTMLElement;

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
    setupIntersectionObserver();

    // about usセクションのDOM要素を作成
    aboutSection = document.createElement("section");
    aboutSection.id = "about";
    document.body.appendChild(aboutSection);
  });

  afterEach(() => {
    aboutSection.remove();
    vi.restoreAllMocks();
  });

  it("初回訪問時でもスクロール前はisOpenがfalse", () => {
    const { result } = renderHook(() => useCrowdfundingPopup());
    expect(result.current.isOpen).toBe(false);
  });

  it("about usセクション通過後にisOpenがtrueになる", () => {
    const { result } = renderHook(() => useCrowdfundingPopup());
    expect(result.current.isOpen).toBe(false);

    act(() => {
      triggerAboutSectionPassed();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it("sessionStorage設定済みの場合はスクロールしてもisOpenがfalse", () => {
    mockStorage[SESSION_KEY] = "true";
    const { result } = renderHook(() => useCrowdfundingPopup());

    act(() => {
      triggerAboutSectionPassed();
    });

    expect(result.current.isOpen).toBe(false);
    expect(mockObserve).not.toHaveBeenCalled();
  });

  it("closePopupでisOpenがfalseになりsessionStorageに書き込む", () => {
    const { result } = renderHook(() => useCrowdfundingPopup());

    act(() => {
      triggerAboutSectionPassed();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.closePopup();
    });

    expect(result.current.isOpen).toBe(false);
    expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
      SESSION_KEY,
      "true"
    );
  });

  it("openPopupでisOpenがtrueになる（sessionStorageは変更しない）", () => {
    mockStorage[SESSION_KEY] = "true";
    const { result } = renderHook(() => useCrowdfundingPopup());
    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.openPopup();
    });

    expect(result.current.isOpen).toBe(true);
    expect(window.sessionStorage.setItem).not.toHaveBeenCalled();
  });

  it("sessionStorageアクセスエラー時はisOpenがfalseになる", () => {
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
  });

  it("sessionStorage書き込みエラー時もclosePopupが正常に動作する", () => {
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
      result.current.openPopup();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.closePopup();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it("aboutセクションが画面内にある（まだ通過していない）場合はisOpenがfalse", () => {
    const { result } = renderHook(() => useCrowdfundingPopup());

    // aboutセクションがまだ画面下方にある状態
    vi.spyOn(aboutSection, "getBoundingClientRect").mockReturnValue({
      bottom: 500,
      top: 100,
      left: 0,
      right: 0,
      width: 0,
      height: 400,
      x: 0,
      y: 100,
      toJSON: vi.fn(),
    });

    act(() => {
      observerCallback(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });

    expect(result.current.isOpen).toBe(false);
  });

  it("aboutセクションが存在しない場合もエラーにならない", () => {
    aboutSection.remove();
    const { result } = renderHook(() => useCrowdfundingPopup());
    expect(result.current.isOpen).toBe(false);
  });
});
