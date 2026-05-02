import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { z } from "zod";

const schema = z.object({ id: z.string() });

describe("microcmsFetch", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("MICROCMS_SERVICE_DOMAIN", "example");
    vi.stubEnv("MICROCMS_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("APIキー+tags付きでGET", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ id: "x" }),
    });
    const { microcmsFetch } = await import("./client");
    const r = await microcmsFetch("news/x", schema, { tags: ["news"] });
    expect(r.id).toBe("x");
    expect(global.fetch).toHaveBeenCalledWith(
      "https://example.microcms.io/api/v1/news/x",
      expect.objectContaining({
        headers: { "X-MICROCMS-API-KEY": "test-key" },
        next: { tags: ["news"] },
      }),
    );
  });

  it("searchParams を URL クエリに付加", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ id: "x" }),
    });
    const { microcmsFetch } = await import("./client");
    await microcmsFetch("news", schema, {
      tags: ["news"],
      searchParams: { limit: 12, offset: 0, filters: "locale[equals]ja" },
    });
    const url = (global.fetch as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as string;
    expect(url).toContain("limit=12");
    expect(url).toContain("offset=0");
  });

  it("undefined の searchParam は無視", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ id: "x" }),
    });
    const { microcmsFetch } = await import("./client");
    await microcmsFetch("news", schema, {
      tags: ["news"],
      searchParams: { limit: 12, offset: undefined },
    });
    const url = (global.fetch as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as string;
    expect(url).not.toContain("offset=");
  });

  it("draftKey 指定時は no-store + ?draftKey=", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ id: "x" }),
    });
    const { microcmsFetch } = await import("./client");
    await microcmsFetch("news/x", schema, { tags: ["news"], draftKey: "dk-1" });
    const [url, init] = (global.fetch as ReturnType<typeof vi.fn>).mock
      .calls[0] as [string, RequestInit];
    expect(url).toContain("draftKey=dk-1");
    expect((init as { cache?: string }).cache).toBe("no-store");
    expect((init as { next?: unknown }).next).toBeUndefined();
  });

  it("!res.ok で例外", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });
    const { microcmsFetch } = await import("./client");
    await expect(
      microcmsFetch("news/x", schema, { tags: ["news"] }),
    ).rejects.toThrow(/404/);
  });

  it("環境変数未設定で fetch 呼び出し時にエラー (モジュールロードは成功)", async () => {
    vi.unstubAllEnvs();
    // モジュール ロード自体は throw しない (build 互換性のため遅延評価)
    const { microcmsFetch } = await import("./client");
    await expect(
      microcmsFetch("news", schema, { tags: ["news"] }),
    ).rejects.toThrow(/MICROCMS_SERVICE_DOMAIN \/ MICROCMS_API_KEY/);
  });
});
