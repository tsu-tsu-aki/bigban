import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  makeNewsItem,
  makeNewsList,
} from "../../../__mocks__/microcms-fixtures";

describe("queries", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("MICROCMS_SERVICE_DOMAIN", "example");
    vi.stubEnv("MICROCMS_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn());
    vi.doMock("next/headers", () => ({
      cookies: async () => ({ get: (_k: string) => undefined }),
      draftMode: async () => ({ isEnabled: false }),
    }));
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.doUnmock("next/headers");
  });

  describe("getNewsList", () => {
    it("locale/orders/limit/offset を渡す", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => makeNewsList([makeNewsItem()]),
      });
      const { getNewsList } = await import("./queries");
      const r = await getNewsList({ locale: "ja", limit: 12, offset: 0 });
      expect(r.contents).toHaveLength(1);
      const url = (global.fetch as ReturnType<typeof vi.fn>).mock
        .calls[0][0] as string;
      expect(decodeURIComponent(url)).toContain("filters=locale[equals]ja");
      expect(decodeURIComponent(url)).toContain("orders=-publishedAt");
      expect(url).toContain("limit=12");
    });

    it("category 指定で filters AND (microCMS 側は日本語ラベルで保存されているため日本語で送る)", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => makeNewsList([]),
      });
      const { getNewsList } = await import("./queries");
      await getNewsList({
        locale: "ja",
        limit: 12,
        offset: 0,
        category: "media",
      });
      const url = (global.fetch as ReturnType<typeof vi.fn>).mock
        .calls[0][0] as string;
      expect(decodeURIComponent(url)).toContain(
        "filters=locale[equals]ja[and]category[contains]メディア掲載",
      );
    });
  });

  describe("getNewsDetail", () => {
    it("1件取得", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => makeNewsList([makeNewsItem({ slug: "g" })]),
      });
      const { getNewsDetail } = await import("./queries");
      const r = await getNewsDetail({ locale: "ja", slug: "g" });
      expect(r?.slug).toBe("g");
    });

    it("見つからないとnull", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => makeNewsList([]),
      });
      const { getNewsDetail } = await import("./queries");
      expect(
        await getNewsDetail({ locale: "ja", slug: "none" }),
      ).toBeNull();
    });

    it("draft mode 有効時は Cookie draftKey 付与", async () => {
      vi.resetModules();
      vi.doMock("next/headers", () => ({
        cookies: async () => ({
          get: (k: string) =>
            k === "microcms_draft_key" ? { value: "dk-1" } : undefined,
        }),
        draftMode: async () => ({ isEnabled: true }),
      }));
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => makeNewsList([makeNewsItem({ slug: "x" })]),
      });
      const { getNewsDetail } = await import("./queries");
      await getNewsDetail({ locale: "ja", slug: "x" });
      const url = (global.fetch as ReturnType<typeof vi.fn>).mock
        .calls[0][0] as string;
      expect(url).toContain("draftKey=dk-1");
    });
  });

  describe("getNewsSlugs", () => {
    it("全 locale の slug を返す", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
        async (u: unknown) => {
          const url = String(u);
          if (decodeURIComponent(url).includes("locale[equals]ja")) {
            return {
              ok: true,
              json: async () =>
                makeNewsList([
                  makeNewsItem({ slug: "a", locale: "ja" }),
                  makeNewsItem({ slug: "b", locale: "ja" }),
                ]),
            };
          }
          return {
            ok: true,
            json: async () =>
              makeNewsList([makeNewsItem({ slug: "c", locale: "en" })]),
          };
        },
      );
      const { getNewsSlugs } = await import("./queries");
      const r = await getNewsSlugs();
      expect(r).toEqual([
        { locale: "ja", slug: "a" },
        { locale: "ja", slug: "b" },
        { locale: "en", slug: "c" },
      ]);
    });
  });
});
