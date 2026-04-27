import { describe, it, expect, vi, beforeEach } from "vitest";

const getNewsDetailMock = vi.fn();
vi.mock("@/lib/microcms/queries", () => ({
  getNewsDetail: (args: unknown) => getNewsDetailMock(args),
}));

describe("news detail opengraph-image", () => {
  beforeEach(() => {
    getNewsDetailMock.mockReset();
  });

  it("eyecatchあり: 302 で画像URLへ", async () => {
    getNewsDetailMock.mockResolvedValue({
      slug: "x",
      locale: "ja",
      eyecatch: {
        url: "https://images.microcms-assets.io/e.jpg",
        width: 1,
        height: 1,
      },
    });
    const { default: handler } = await import("./opengraph-image");
    const res = await handler({
      params: Promise.resolve({ locale: "ja", slug: "x" }),
    });
    expect(res.status).toBe(302);
    expect(res.headers.get("location") ?? "").toContain("e.jpg");
    expect(res.headers.get("location") ?? "").toContain("w=1200");
  });

  it("eyecatchなし: 共通OGP", async () => {
    getNewsDetailMock.mockResolvedValue({
      slug: "x",
      locale: "ja",
      eyecatch: undefined,
    });
    const { default: handler } = await import("./opengraph-image");
    const res = await handler({
      params: Promise.resolve({ locale: "ja", slug: "x" }),
    });
    expect(res.status).toBe(302);
    expect(res.headers.get("location") ?? "").toMatch(/opengraph-image/);
  });

  it("記事なし: 共通OGP", async () => {
    getNewsDetailMock.mockResolvedValue(null);
    const { default: handler } = await import("./opengraph-image");
    const res = await handler({
      params: Promise.resolve({ locale: "ja", slug: "none" }),
    });
    expect(res.status).toBe(302);
    expect(res.headers.get("location") ?? "").toMatch(/opengraph-image/);
  });

  it("不正locale: 共通OGPへ", async () => {
    const { default: handler } = await import("./opengraph-image");
    const res = await handler({
      params: Promise.resolve({ locale: "fr", slug: "x" }),
    });
    expect(res.status).toBe(302);
    expect(res.headers.get("location") ?? "").toMatch(/opengraph-image/);
  });

  it("locale=en eyecatchなし: /en/opengraph-image にリダイレクト", async () => {
    getNewsDetailMock.mockResolvedValue(null);
    const { default: handler } = await import("./opengraph-image");
    const res = await handler({
      params: Promise.resolve({ locale: "en", slug: "none" }),
    });
    expect(res.status).toBe(302);
    expect(res.headers.get("location") ?? "").toMatch(
      /\/en\/opengraph-image/,
    );
  });
});
