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

describe("about opengraph-image", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("about.titleのページラベル部分を描画する", async () => {
    const mockT = (key: string) => {
      if (key === "about.title") return "ABOUT US|THE SITE";
      if (key === "og.siteName") return "THE SITE";
      return key;
    };
    mockGetTranslations.mockResolvedValue(mockT);

    const module = await import("./opengraph-image");
    await module.default({ params: Promise.resolve({ locale: "ja" }) });

    expect(imageResponseSpy).toHaveBeenCalledTimes(1);
    const [element, options] = imageResponseSpy.mock.calls[0];
    expect(options).toMatchObject({ width: 1200, height: 630 });
    const serialized = JSON.stringify(element);
    expect(serialized).toContain("ABOUT US");
    expect(serialized).toContain("THE SITE");
  });

  it("メタ定数をエクスポートしている", async () => {
    const module = await import("./opengraph-image");
    expect(module.size).toEqual({ width: 1200, height: 630 });
    expect(module.contentType).toBe("image/png");
    expect(module.alt).toBeDefined();
  });
});
