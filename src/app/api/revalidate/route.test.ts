import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createHmac } from "node:crypto";

const revalidateTagMock = vi.fn();
// 第2引数 (cacheLife profile) も検証対象にしたいので、すべての引数を
// そのままモックに転送する。誤って "default" など stale-while-revalidate 系の
// プロファイルに戻された場合に検知できるようにする。
vi.mock("next/cache", () => ({
  revalidateTag: (...args: unknown[]) => revalidateTagMock(...args),
}));

const SECRET = "s3cret";

function hmac(body: string): string {
  return createHmac("sha256", SECRET).update(body).digest("hex");
}

function makeRequest(body: unknown, signature?: string) {
  const text = JSON.stringify(body);
  const sig = signature ?? hmac(text);
  return new Request("http://localhost/api/revalidate", {
    method: "POST",
    headers: new Headers({ "x-microcms-signature": sig }),
    body: text,
  });
}

describe("/api/revalidate POST", () => {
  beforeEach(() => {
    revalidateTagMock.mockClear();
    vi.stubEnv("MICROCMS_WEBHOOK_SECRET", SECRET);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("HMAC不一致で401", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      makeRequest({ api: "news" }, "00".repeat(32)),
    );
    expect(res.status).toBe(401);
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it("署名ヘッダー欠落で401", async () => {
    const text = JSON.stringify({ api: "news" });
    const req = new Request("http://localhost/api/revalidate", {
      method: "POST",
      body: text,
    });
    const { POST } = await import("./route");
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("news+id で news/news-{id}-ja/news-{id}-en の3タグ + 即時無効化プロファイル", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest({ api: "news", id: "abc" }));
    expect(res.status).toBe(200);
    // 3 タグそれぞれが { expire: 0 } (即時無効化) で呼ばれることを検証する。
    // "default" や "max" などの stale-while-revalidate 系プロファイルに
    // 戻された場合はここで失敗させる。
    expect(revalidateTagMock).toHaveBeenCalledWith("news", { expire: 0 });
    expect(revalidateTagMock).toHaveBeenCalledWith("news-abc-ja", {
      expire: 0,
    });
    expect(revalidateTagMock).toHaveBeenCalledWith("news-abc-en", {
      expire: 0,
    });
  });

  it("api!=news はスキップ", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest({ api: "other" }));
    expect(res.status).toBe(200);
    expect((await res.json()) as { skipped: boolean }).toEqual(
      expect.objectContaining({ skipped: true }),
    );
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it("id無しでも news タグが即時無効化プロファイルで呼ばれる", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest({ api: "news" }));
    expect(res.status).toBe(200);
    expect(revalidateTagMock).toHaveBeenCalledWith("news", { expire: 0 });
    expect(revalidateTagMock).toHaveBeenCalledTimes(1);
  });

  it("不正body(JSON parse失敗) で400", async () => {
    const text = "not-json";
    const sig = hmac(text);
    const req = new Request("http://localhost/api/revalidate", {
      method: "POST",
      headers: new Headers({ "x-microcms-signature": sig }),
      body: text,
    });
    const { POST } = await import("./route");
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("schema違反(api欠落)で400", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest({ broken: true }));
    expect(res.status).toBe(400);
  });

  it("secret環境変数未設定で500", async () => {
    vi.unstubAllEnvs();
    const { POST } = await import("./route");
    const res = await POST(makeRequest({ api: "news" }, "00".repeat(32)));
    expect(res.status).toBe(500);
  });

  it("署名が非hex文字 (timingSafeEqual内例外) でも 401 で安全に弾く", async () => {
    const { POST } = await import("./route");
    // 64 文字だが非 hex (z は 16 進外) → Buffer.from(.., 'hex') が長さ不一致を返し
    // timingSafeEqual が throw → safeEqualHex の catch ブランチに落ちる
    const res = await POST(makeRequest({ api: "news" }, "zz".repeat(32)));
    expect(res.status).toBe(401);
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });
});
