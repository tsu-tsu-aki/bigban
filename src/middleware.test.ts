import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "./middleware";

function createRequest(path: string): NextRequest {
  return new NextRequest(new URL(path, "http://localhost:3000"));
}

describe("middleware", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_MAINTENANCE;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.useRealTimers();
  });

  it("ローンチ日前は / を /teaser にリダイレクトする", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-17T08:00:00+09:00"));

    const response = middleware(createRequest("/"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/teaser");
  });

  it("ローンチ日後は通過する", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-17T18:00:01+09:00"));

    const response = middleware(createRequest("/"));
    expect(response.status).toBe(200);
  });

  it("NEXT_PUBLIC_MAINTENANCE=true ならローンチ日後でもリダイレクトする", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-18T12:00:00+09:00"));
    process.env.NEXT_PUBLIC_MAINTENANCE = "true";

    const response = middleware(createRequest("/"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/teaser");
  });

  it("/teaser は常に通過する", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-16T12:00:00+09:00"));

    const response = middleware(createRequest("/teaser"));
    expect(response.status).toBe(200);
  });

  it("/_next/* は常に通過する", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-16T12:00:00+09:00"));

    const response = middleware(createRequest("/_next/static/chunk.js"));
    expect(response.status).toBe(200);
  });

  it("/logos/* は常に通過する", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-16T12:00:00+09:00"));

    const response = middleware(createRequest("/logos/logo.svg"));
    expect(response.status).toBe(200);
  });

  it("ローンチ時刻ちょうどは通過する（< の境界値）", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-17T18:00:00+09:00"));

    const response = middleware(createRequest("/"));
    expect(response.status).toBe(200);
  });
});
