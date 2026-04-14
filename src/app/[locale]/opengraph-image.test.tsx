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

describe("home opengraph-image", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1200x630でImageResponseを生成する", async () => {
    const mockT = (key: string) => {
      if (key === "home.title") return "HOME TITLE|THE SITE";
      if (key === "og.siteName") return "THE SITE";
      return key;
    };
    mockGetTranslations.mockResolvedValue(mockT);

    const mod = await import("./opengraph-image");
    await mod.default({ params: Promise.resolve({ locale: "ja" }) });

    expect(imageResponseSpy).toHaveBeenCalledTimes(1);
    const [, options] = imageResponseSpy.mock.calls[0];
    expect(options).toMatchObject({ width: 1200, height: 630 });
  });

  it("タイトルから区切り以降を除いたページラベルを含める", async () => {
    const mockT = (key: string) => {
      if (key === "home.title") return "駅徒歩1分|THE PICKLE BANG THEORY";
      if (key === "og.siteName") return "THE PICKLE BANG THEORY";
      return key;
    };
    mockGetTranslations.mockResolvedValue(mockT);

    const mod = await import("./opengraph-image");
    await mod.default({ params: Promise.resolve({ locale: "ja" }) });

    const [element] = imageResponseSpy.mock.calls[0];
    const serialized = JSON.stringify(element);
    expect(serialized).toContain("駅徒歩1分");
    expect(serialized).toContain("THE PICKLE BANG THEORY");
  });

  it("sizeとcontentTypeをエクスポートしている", async () => {
    const mod = await import("./opengraph-image");
    expect(mod.size).toEqual({ width: 1200, height: 630 });
    expect(mod.contentType).toBe("image/png");
    expect(mod.alt).toBeDefined();
  });
});
