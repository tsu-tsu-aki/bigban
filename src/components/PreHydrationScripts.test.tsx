import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";

type InsertCallback = () => ReactNode;

const state: { callback: InsertCallback | null } = { callback: null };

vi.mock("next/navigation", () => ({
  useServerInsertedHTML: (cb: InsertCallback) => {
    state.callback = cb;
  },
}));

describe("PreHydrationScripts", () => {
  beforeEach(() => {
    state.callback = null;
  });

  it("returns null so it does not render anything directly into the tree", async () => {
    const { default: PreHydrationScripts } = await import(
      "./PreHydrationScripts"
    );

    const { container } = render(<PreHydrationScripts />);

    expect(container.innerHTML).toBe("");
  });

  it("registers a useServerInsertedHTML callback that emits both scripts", async () => {
    const { default: PreHydrationScripts, browserDetectScript, introScript } =
      await import("./PreHydrationScripts");

    render(<PreHydrationScripts />);

    const cb = state.callback;
    if (!cb) throw new Error("useServerInsertedHTML callback was not captured");

    const { container } = render(<>{cb()}</>);
    const scripts = container.querySelectorAll("script");
    expect(scripts.length).toBe(2);
    expect(scripts[0].textContent).toBe(browserDetectScript);
    expect(scripts[1].textContent).toBe(introScript);
  });

  it("exposes browser detection logic targeting iOS Safari", async () => {
    const { browserDetectScript } = await import("./PreHydrationScripts");
    expect(browserDetectScript).toContain("ios-safari");
    expect(browserDetectScript).toContain("navigator.userAgent");
    expect(browserDetectScript).toContain("maxTouchPoints");
    expect(browserDetectScript).toContain("Instagram");
  });

  it("exposes intro-pending logic gated by reduced-motion and session flag", async () => {
    const { introScript } = await import("./PreHydrationScripts");
    expect(introScript).toContain("intro-pending");
    expect(introScript).toContain("bigban-intro-played");
    expect(introScript).toContain("prefers-reduced-motion");
  });
});
