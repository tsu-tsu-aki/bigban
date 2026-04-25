import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createHmac } from "node:crypto";

const revalidateTagMock = vi.fn();
vi.mock("next/cache", () => ({
  revalidateTag: (tag: string) => revalidateTagMock(tag),
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

  it("news+id で news/news-{id}-ja/news-{id}-en の3タグ", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest({ api: "news", id: "abc" }));
    expect(res.status).toBe(200);
    expect(revalidateTagMock).toHaveBeenCalledWith("news");
    expect(revalidateTagMock).toHaveBeenCalledWith("news-abc-ja");
    expect(revalidateTagMock).toHaveBeenCalledWith("news-abc-en");
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

  it("id無しでも news タグ", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest({ api: "news" }));
    expect(res.status).toBe(200);
    expect(revalidateTagMock).toHaveBeenCalledWith("news");
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
});
