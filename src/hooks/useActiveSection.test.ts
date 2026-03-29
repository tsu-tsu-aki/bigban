// src/hooks/useActiveSection.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useActiveSection } from "./useActiveSection";

let observerCallback: IntersectionObserverCallback;
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  global.IntersectionObserver = vi.fn(function (this: IntersectionObserver, callback: IntersectionObserverCallback) {
    observerCallback = callback;
    return {
      observe: mockObserve,
      disconnect: mockDisconnect,
      unobserve: vi.fn(),
      root: null,
      rootMargin: "",
      thresholds: [],
      takeRecords: vi.fn(),
    };
  }) as unknown as typeof IntersectionObserver;
});

const SECTION_IDS = ["concept", "facility", "services", "pricing", "access", "contact"];

describe("useActiveSection", () => {
  it("初期値は空文字列", () => {
    const { result } = renderHook(() => useActiveSection(SECTION_IDS));
    expect(result.current).toBe("");
  });

  it("提供された全セクションIDを監視する", () => {
    SECTION_IDS.forEach((id) => {
      const el = document.createElement("section");
      el.id = id;
      document.body.appendChild(el);
    });

    renderHook(() => useActiveSection(SECTION_IDS));
    expect(mockObserve).toHaveBeenCalledTimes(SECTION_IDS.length);

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) document.body.removeChild(el);
    });
  });

  it("要素が交差した時にアクティブセクションを更新する", () => {
    const section = document.createElement("section");
    section.id = "concept";
    document.body.appendChild(section);

    const { result } = renderHook(() => useActiveSection(SECTION_IDS));

    act(() => {
      observerCallback(
        [{ isIntersecting: true, target: section }] as unknown as IntersectionObserverEntry[],
        {} as IntersectionObserver
      );
    });

    expect(result.current).toBe("concept");
    document.body.removeChild(section);
  });

  it("アンマウント時にdisconnectする", () => {
    const { unmount } = renderHook(() => useActiveSection(SECTION_IDS));
    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
