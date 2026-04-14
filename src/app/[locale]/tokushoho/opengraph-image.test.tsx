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

describe("tokushoho opengraph-image", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("tokushoho.titleのページラベル部分を描画する", async () => {
    const mockT = (key: string) => {
      if (key === "tokushoho.title") return "特定商取引法に基づく表記|THE SITE";
      if (key === "og.siteName") return "THE SITE";
      return key;
    };
    mockGetTranslations.mockResolvedValue(mockT);

    const mod = await import("./opengraph-image");
    await mod.default({ params: Promise.resolve({ locale: "ja" }) });

    expect(imageResponseSpy).toHaveBeenCalledTimes(1);
    const [element, options] = imageResponseSpy.mock.calls[0];
    expect(options).toMatchObject({ width: 1200, height: 630 });
    const serialized = JSON.stringify(element);
    expect(serialized).toContain("特定商取引法に基づく表記");
    expect(serialized).toContain("THE SITE");
  });

  it("メタ定数をエクスポートしている", async () => {
    const mod = await import("./opengraph-image");
    expect(mod.size).toEqual({ width: 1200, height: 630 });
    expect(mod.contentType).toBe("image/png");
    expect(mod.alt).toBeDefined();
  });
});
