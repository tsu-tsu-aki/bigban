import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetTranslations = vi.fn();

vi.mock("next-intl/server", () => ({
  getTranslations: (...args: unknown[]) => mockGetTranslations(...args),
  setRequestLocale: vi.fn(),
}));

vi.mock("./TokushohoContent", () => ({ default: () => null }));
vi.mock("@/components/StructuredData", () => ({ default: () => null }));
vi.mock("@/lib/structured-data", () => ({
  buildBreadcrumb: vi.fn().mockReturnValue({}),
}));

describe("Tokushoho generateMetadata", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function buildMockT(keywords: string[]) {
    const mockT = ((key: string) => `translated:${key}`) as unknown as {
      (key: string): string;
      raw: (key: string) => unknown;
    };
    mockT.raw = (_key: string) => keywords;
    return mockT;
  }

  it("日本語でキーワード/canonical/og:urlを返す", async () => {
    mockGetTranslations.mockResolvedValue(
      buildMockT(["特定商取引法", "表記"])
    );

    const { generateMetadata } = await import("./page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "ja" }),
    });

    expect(metadata.keywords).toEqual(["特定商取引法", "表記"]);
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tokushoho"
    );
    expect(metadata.openGraph?.url).toBe("http://localhost:3000/tokushoho");
    expect(metadata.openGraph?.locale).toBe("ja_JP");
    expect(metadata.alternates?.languages).toMatchObject({
      ja: "http://localhost:3000/tokushoho",
      en: "http://localhost:3000/en/tokushoho",
      "x-default": "http://localhost:3000/tokushoho",
    });
  });

  it("英語でcanonicalに/en/tokushohoを含める", async () => {
    mockGetTranslations.mockResolvedValue(
      buildMockT(["legal notice"])
    );

    const { generateMetadata } = await import("./page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en" }),
    });

    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/en/tokushoho"
    );
    expect(metadata.openGraph?.url).toBe(
      "http://localhost:3000/en/tokushoho"
    );
    expect(metadata.openGraph?.locale).toBe("en_US");
  });
});
