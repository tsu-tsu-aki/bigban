import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

const mockGetTranslations = vi.fn();

vi.mock("next-intl/server", () => ({
  getTranslations: (...args: unknown[]) => mockGetTranslations(...args),
  setRequestLocale: vi.fn(),
}));

vi.mock("@/components/home/HomeIntro", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@/components/home/HomeNavigation", () => ({ default: () => null }));
vi.mock("@/components/home/HomeHero", () => ({ default: () => null }));
vi.mock("@/components/home/HomeConcept", () => ({ default: () => null }));
vi.mock("@/components/home/HomeFacility", () => ({ default: () => null }));
vi.mock("@/components/home/HomeServices", () => ({ default: () => null }));
vi.mock("@/components/home/HomePricing", () => ({ default: () => null }));
vi.mock("@/components/home/HomeAbout", () => ({ default: () => null }));
vi.mock("@/components/home/HomeAccess", () => ({ default: () => null }));
vi.mock("@/components/home/HomeFooter", () => ({ default: () => null }));

describe("Home generateMetadata", () => {
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
      buildMockT(["kw-a", "kw-b"])
    );

    const { generateMetadata } = await import("./page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "ja" }),
    });

    expect(metadata.keywords).toEqual(["kw-a", "kw-b"]);
    expect(metadata.alternates?.canonical).toBe("http://localhost:3000/");
    expect(metadata.openGraph?.url).toBe("http://localhost:3000/");
    expect(metadata.openGraph?.locale).toBe("ja_JP");
    expect(metadata.alternates?.languages).toMatchObject({
      ja: "http://localhost:3000/",
      en: "http://localhost:3000/en",
      "x-default": "http://localhost:3000/",
    });
  });

  it("英語でcanonicalに/enを含める", async () => {
    mockGetTranslations.mockResolvedValue(buildMockT(["kw"]));

    const { generateMetadata } = await import("./page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en" }),
    });

    expect(metadata.keywords).toEqual(["kw"]);
    expect(metadata.alternates?.canonical).toBe("http://localhost:3000/en");
    expect(metadata.openGraph?.url).toBe("http://localhost:3000/en");
    expect(metadata.openGraph?.locale).toBe("en_US");
  });

  it("openGraphにimagesを明示しない(opengraph-image.tsxに委譲)", async () => {
    mockGetTranslations.mockResolvedValue(buildMockT([]));

    const { generateMetadata } = await import("./page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "ja" }),
    });

    expect(metadata.openGraph?.images).toBeUndefined();
  });
});

describe("Home Page", () => {
  it("localeを設定しHomeコンポーネントを描画する", async () => {
    const { default: Home } = await import("./page");
    const element = await Home({
      params: Promise.resolve({ locale: "ja" }),
    });
    const { container } = render(element);
    expect(container).toBeTruthy();
  });
});
