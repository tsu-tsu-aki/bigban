import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { makeNewsItem } from "../../../../../__mocks__/microcms-fixtures";

const getNewsDetailMock = vi.fn();
const getNewsSlugsMock = vi.fn();
const notFoundMock = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});
const isCmsNewsEnabledMock = vi.fn(() => true);
const draftModeMock = vi.fn(async () => ({ isEnabled: false }));
const routerPushMock = vi.fn();

vi.mock("@/lib/microcms/queries", () => ({
  getNewsDetail: (args: unknown) => getNewsDetailMock(args),
  getNewsSlugs: () => getNewsSlugsMock(),
}));
vi.mock("next/navigation", () => ({
  notFound: () => notFoundMock(),
}));
vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: routerPushMock }),
}));
vi.mock("next-intl/server", () => ({ setRequestLocale: vi.fn() }));
vi.mock("next-intl", () => ({
  hasLocale: (_l: readonly string[], v: string) =>
    v === "ja" || v === "en",
}));
vi.mock("@/config/featureFlags", () => ({
  isCmsNewsEnabled: isCmsNewsEnabledMock,
}));
vi.mock("next/headers", () => ({
  draftMode: () => draftModeMock(),
}));

async function renderPage(params: { locale: string; slug: string }) {
  const { default: Detail } = await import("./page");
  const jsx = await Detail({ params: Promise.resolve(params) });
  render(jsx);
}

describe("NewsDetailPage", () => {
  beforeEach(() => {
    getNewsDetailMock.mockReset();
    getNewsSlugsMock.mockReset();
    notFoundMock.mockClear();
    isCmsNewsEnabledMock.mockReturnValue(true);
    draftModeMock.mockResolvedValue({ isEnabled: false });
  });

  it("記事+JSON-LD描画", async () => {
    getNewsDetailMock.mockImplementation(async ({ slug, locale }) => {
      if (slug === "x" && locale === "ja") {
        return makeNewsItem({
          title: "本件",
          slug: "x",
          bodyHtml: "<p>hi</p>",
        });
      }
      return null;
    });
    await renderPage({ locale: "ja", slug: "x" });
    expect(
      screen.getByRole("heading", { name: "本件" }),
    ).toBeInTheDocument();
    expect(
      document.querySelector('script[type="application/ld+json"]'),
    ).not.toBeNull();
  });

  it("記事なし notFound", async () => {
    getNewsDetailMock.mockResolvedValue(null);
    await expect(
      renderPage({ locale: "ja", slug: "none" }),
    ).rejects.toThrow(/NEXT_NOT_FOUND/);
  });

  it("flag OFF notFound", async () => {
    isCmsNewsEnabledMock.mockReturnValue(false);
    await expect(renderPage({ locale: "ja", slug: "x" })).rejects.toThrow(
      /NEXT_NOT_FOUND/,
    );
  });

  it("不正locale notFound", async () => {
    await expect(renderPage({ locale: "fr", slug: "x" })).rejects.toThrow(
      /NEXT_NOT_FOUND/,
    );
  });

  it("externalLink ボタン", async () => {
    getNewsDetailMock.mockImplementation(async ({ locale }) => {
      if (locale === "ja") {
        return makeNewsItem({
          slug: "x",
          externalLink: {
            label: "詳しくはこちら",
            url: "https://example.com",
          },
        });
      }
      return null;
    });
    await renderPage({ locale: "ja", slug: "x" });
    const a = screen.getByRole("link", { name: /詳しくはこちら/ });
    expect(a).toHaveAttribute("href", "https://example.com");
    expect(a).toHaveAttribute("target", "_blank");
  });

  it("戻るリンク /news", async () => {
    getNewsDetailMock.mockImplementation(async ({ locale }) =>
      locale === "ja" ? makeNewsItem({ slug: "x" }) : null,
    );
    await renderPage({ locale: "ja", slug: "x" });
    expect(
      screen.getByRole("link", { name: /一覧/ }),
    ).toHaveAttribute("href", "/news");
  });

  it("locale=en 戻るリンク /en/news", async () => {
    getNewsDetailMock.mockImplementation(async ({ locale }) =>
      locale === "en"
        ? makeNewsItem({ slug: "x", locale: "en" })
        : null,
    );
    await renderPage({ locale: "en", slug: "x" });
    expect(
      screen.getByRole("link", { name: /news index/i }),
    ).toHaveAttribute("href", "/en/news");
  });

  it("generateStaticParams が全slug返す", async () => {
    getNewsSlugsMock.mockResolvedValue([
      { locale: "ja", slug: "a" },
      { locale: "en", slug: "b" },
    ]);
    const { generateStaticParams } = await import("./page");
    const r = await generateStaticParams();
    expect(r).toEqual([
      { locale: "ja", slug: "a" },
      { locale: "en", slug: "b" },
    ]);
  });

  it("generateMetadata title", async () => {
    getNewsDetailMock.mockImplementation(async ({ locale }) =>
      locale === "ja"
        ? makeNewsItem({ title: "T", slug: "x", excerpt: "E" })
        : null,
    );
    const { generateMetadata } = await import("./page");
    const meta = await generateMetadata({
      params: Promise.resolve({ locale: "ja", slug: "x" }),
    });
    expect(meta.title).toContain("T");
    expect(meta.description).toBe("E");
  });

  it("generateMetadata 記事なし空", async () => {
    getNewsDetailMock.mockResolvedValue(null);
    const { generateMetadata } = await import("./page");
    const meta = await generateMetadata({
      params: Promise.resolve({ locale: "ja", slug: "x" }),
    });
    expect(meta).toEqual({});
  });

  it("draftモードで noindex", async () => {
    draftModeMock.mockResolvedValue({ isEnabled: true });
    getNewsDetailMock.mockImplementation(async ({ locale }) =>
      locale === "ja"
        ? makeNewsItem({ title: "T", slug: "x" })
        : null,
    );
    const { generateMetadata } = await import("./page");
    const meta = await generateMetadata({
      params: Promise.resolve({ locale: "ja", slug: "x" }),
    });
    expect(meta.robots).toEqual({ index: false, follow: false });
  });

  it("対向言語が存在する時のみ alternates.languages を出力", async () => {
    getNewsDetailMock.mockImplementation(async ({ locale }) => {
      if (locale === "ja") {
        return makeNewsItem({ title: "T", slug: "x" });
      }
      if (locale === "en") {
        return makeNewsItem({ title: "T", slug: "x", locale: "en" });
      }
      return null;
    });
    const { generateMetadata } = await import("./page");
    const meta = await generateMetadata({
      params: Promise.resolve({ locale: "ja", slug: "x" }),
    });
    expect(meta.alternates?.languages).toBeDefined();
  });

  it("対向言語なしの時は alternates.languages を出力しない", async () => {
    getNewsDetailMock.mockImplementation(async ({ locale }) =>
      locale === "ja" ? makeNewsItem({ title: "T", slug: "x" }) : null,
    );
    const { generateMetadata } = await import("./page");
    const meta = await generateMetadata({
      params: Promise.resolve({ locale: "ja", slug: "x" }),
    });
    expect(meta.alternates?.languages).toBeUndefined();
  });
});
