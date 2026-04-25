import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

const mockGetTranslations = vi.fn();

vi.mock("next-intl/server", () => ({
  getTranslations: (...args: unknown[]) => mockGetTranslations(...args),
  setRequestLocale: vi.fn(),
}));

vi.mock("./AboutContent", () => ({ default: () => null }));
vi.mock("@/components/StructuredData", () => ({ default: () => null }));
vi.mock("@/lib/structured-data", () => ({
  buildBreadcrumb: vi.fn().mockReturnValue({}),
}));
vi.mock("@/config/featureFlags", () => ({
  isCmsNewsEnabled: () => false,
}));
vi.mock("@/lib/microcms/queries", () => ({
  getNewsList: vi.fn().mockResolvedValue({
    contents: [],
    totalCount: 0,
    offset: 0,
    limit: 12,
  }),
}));

describe("About generateMetadata", () => {
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
      buildMockT(["RST Agency", "西村昭彦"])
    );

    const { generateMetadata } = await import("./page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "ja" }),
    });

    expect(metadata.keywords).toEqual(["RST Agency", "西村昭彦"]);
    expect(metadata.alternates?.canonical).toBe("http://localhost:3000/about");
    expect(metadata.openGraph?.url).toBe("http://localhost:3000/about");
    expect(metadata.openGraph?.locale).toBe("ja_JP");
  });

  it("英語でcanonicalに/en/aboutを含める", async () => {
    mockGetTranslations.mockResolvedValue(
      buildMockT(["Akihiko Nishimura"])
    );

    const { generateMetadata } = await import("./page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en" }),
    });

    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/en/about"
    );
    expect(metadata.openGraph?.url).toBe("http://localhost:3000/en/about");
    expect(metadata.openGraph?.locale).toBe("en_US");
  });

  it("opengraph-image.tsxに委譲しimagesを明示しない", async () => {
    mockGetTranslations.mockResolvedValue(buildMockT([]));

    const { generateMetadata } = await import("./page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "ja" }),
    });

    expect(metadata.openGraph?.images).toBeUndefined();
  });
});

describe("About Page", () => {
  it("localeを設定しAboutコンポーネントを描画する", async () => {
    const { default: AboutPage } = await import("./page");
    const element = await AboutPage({
      params: Promise.resolve({ locale: "ja" }),
    });
    const { container } = render(element);
    expect(container).toBeTruthy();
  });
});
