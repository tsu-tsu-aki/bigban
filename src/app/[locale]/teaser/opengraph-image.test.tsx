import { describe, it, expect, vi, beforeEach } from "vitest";

const imageResponseSpy = vi.fn();

vi.mock("next/og", () => ({
  ImageResponse: class {
    constructor(element: unknown, options: unknown) {
      imageResponseSpy(element, options);
    }
  },
}));

const mockGetTranslations = vi.fn();

vi.mock("next-intl/server", () => ({
  getTranslations: (...args: unknown[]) => mockGetTranslations(...args),
}));

describe("teaser opengraph-image", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("OPEN日とCOMING SOONを含む画像を生成する", async () => {
    const mockT = (key: string) => {
      if (key === "og.siteName") return "THE PICKLE SITE";
      return key;
    };
    mockGetTranslations.mockResolvedValue(mockT);

    const mod = await import("./opengraph-image");
    await mod.default({ params: Promise.resolve({ locale: "ja" }) });

    expect(imageResponseSpy).toHaveBeenCalledTimes(1);
    const [element, options] = imageResponseSpy.mock.calls[0];
    expect(options).toMatchObject({ width: 1200, height: 630 });
    const serialized = JSON.stringify(element);
    expect(serialized).toContain("2026.4.17 OPEN");
    expect(serialized).toContain("COMING SOON");
    expect(serialized).toContain("THE PICKLE SITE");
  });

  it("ロケールが英語でも同一の画像を生成する", async () => {
    const mockT = (key: string) => {
      if (key === "og.siteName") return "THE PICKLE SITE";
      return key;
    };
    mockGetTranslations.mockResolvedValue(mockT);

    const mod = await import("./opengraph-image");
    await mod.default({ params: Promise.resolve({ locale: "en" }) });

    expect(imageResponseSpy).toHaveBeenCalledTimes(1);
    const [element] = imageResponseSpy.mock.calls[0];
    expect(JSON.stringify(element)).toContain("2026.4.17 OPEN");
  });

  it("メタ定数をエクスポートしている", async () => {
    const mod = await import("./opengraph-image");
    expect(mod.size).toEqual({ width: 1200, height: 630 });
    expect(mod.contentType).toBe("image/png");
    expect(mod.alt).toBeDefined();
  });
});
