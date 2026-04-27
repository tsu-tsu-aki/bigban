import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("isCmsNewsEnabled", () => {
  beforeEach(() => {
    vi.resetModules();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("'true' で true", async () => {
    vi.stubEnv("USE_CMS_NEWS", "true");
    const { isCmsNewsEnabled } = await import("./featureFlags");
    expect(isCmsNewsEnabled()).toBe(true);
  });

  it("'false' で false", async () => {
    vi.stubEnv("USE_CMS_NEWS", "false");
    const { isCmsNewsEnabled } = await import("./featureFlags");
    expect(isCmsNewsEnabled()).toBe(false);
  });

  it("未設定で false", async () => {
    vi.stubEnv("USE_CMS_NEWS", "");
    const { isCmsNewsEnabled } = await import("./featureFlags");
    expect(isCmsNewsEnabled()).toBe(false);
  });

  it("想定外の値で false", async () => {
    vi.stubEnv("USE_CMS_NEWS", "yes");
    const { isCmsNewsEnabled } = await import("./featureFlags");
    expect(isCmsNewsEnabled()).toBe(false);
  });
});
