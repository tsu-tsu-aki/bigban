import "@testing-library/jest-dom/vitest";
import { vi, afterEach } from "vitest";

// jsdom には window.matchMedia が存在しないためデフォルトモックを定義
Object.defineProperty(window, "matchMedia", {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// 各テスト後に window.matchMedia をデフォルト実装にリセット
afterEach(() => {
  (window.matchMedia as ReturnType<typeof vi.fn>).mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});
