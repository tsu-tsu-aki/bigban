import { describe, it, expect } from "vitest";
import { isIOSSafari } from "./detectBrowser";

describe("isIOSSafari", () => {
  it("returns true for iOS Safari on iPhone", () => {
    const ua =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
    expect(isIOSSafari(ua)).toBe(true);
  });

  it("returns true for iOS Safari on iPad", () => {
    const ua =
      "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
    expect(isIOSSafari(ua)).toBe(true);
  });

  it("returns false for Chrome on iOS (CriOS)", () => {
    const ua =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.0.0 Mobile/15E148 Safari/604.1";
    expect(isIOSSafari(ua)).toBe(false);
  });

  it("returns false for Firefox on iOS (FxiOS)", () => {
    const ua =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/120.0 Mobile/15E148 Safari/605.1.15";
    expect(isIOSSafari(ua)).toBe(false);
  });

  it("returns false for Edge on iOS (EdgiOS)", () => {
    const ua =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 EdgiOS/120.0.0.0 Mobile/15E148 Safari/604.1";
    expect(isIOSSafari(ua)).toBe(false);
  });

  it("returns false for macOS Safari", () => {
    const ua =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";
    expect(isIOSSafari(ua)).toBe(false);
  });

  it("returns false for Chrome on desktop", () => {
    const ua =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    expect(isIOSSafari(ua)).toBe(false);
  });

  it("returns false for Chrome on Android", () => {
    const ua =
      "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
    expect(isIOSSafari(ua)).toBe(false);
  });

  it("returns false for null or empty UA", () => {
    expect(isIOSSafari(null)).toBe(false);
    expect(isIOSSafari(undefined)).toBe(false);
    expect(isIOSSafari("")).toBe(false);
  });

  it("returns false for iOS webview without Safari token", () => {
    const ua =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148";
    expect(isIOSSafari(ua)).toBe(false);
  });
});
