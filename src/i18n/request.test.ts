import { describe, it, expect, vi } from "vitest";

vi.mock("next-intl/server", () => ({
  getRequestConfig: (fn: (params: { requestLocale: Promise<string | undefined> }) => Promise<unknown>) => fn,
}));

describe("i18n request config", () => {
  it("loads Japanese messages for ja locale", async () => {
    const { default: getConfig } = await import("./request");
    const config = await getConfig({
      requestLocale: Promise.resolve("ja"),
    });
    expect(config.locale).toBe("ja");
    expect(config.messages).toBeDefined();
  });

  it("loads English messages for en locale", async () => {
    const { default: getConfig } = await import("./request");
    const config = await getConfig({
      requestLocale: Promise.resolve("en"),
    });
    expect(config.locale).toBe("en");
    expect(config.messages).toBeDefined();
  });

  it("falls back to ja for undefined locale", async () => {
    const { default: getConfig } = await import("./request");
    const config = await getConfig({
      requestLocale: Promise.resolve(undefined),
    });
    expect(config.locale).toBe("ja");
  });
});
