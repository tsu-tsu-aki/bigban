import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { NextRequest } from "next/server";

// next-intl/middleware をモック
const mockIntlMiddleware = vi.fn();
vi.mock("next-intl/middleware", () => ({
  default: vi.fn(() => mockIntlMiddleware),
}));

// 環境変数のリセット用
const originalEnv = process.env.NEXT_PUBLIC_MAINTENANCE;

function createRequest(url: string, userAgent?: string): NextRequest {
  const headers: Record<string, string> = {};
  if (userAgent) {
    headers["user-agent"] = userAgent;
  }
  return new NextRequest(new URL(url, "http://localhost:3000"), { headers });
}

describe("middleware", () => {
  beforeEach(() => {
    vi.resetModules();
    mockIntlMiddleware.mockReset();
    delete process.env.NEXT_PUBLIC_MAINTENANCE;
  });

  afterAll(() => {
    if (originalEnv === undefined) {
      delete process.env.NEXT_PUBLIC_MAINTENANCE;
    } else {
      process.env.NEXT_PUBLIC_MAINTENANCE = originalEnv;
    }
  });

  describe("maintenance mode OFF", () => {
    it("delegates to next-intl middleware for root path", async () => {
      const { middleware } = await import("./middleware");
      const request = createRequest("/");
      mockIntlMiddleware.mockReturnValue(new Response());

      middleware(request);

      expect(mockIntlMiddleware).toHaveBeenCalledWith(request);
    });

    it("delegates to next-intl middleware for /en path", async () => {
      const { middleware } = await import("./middleware");
      const request = createRequest("/en");
      mockIntlMiddleware.mockReturnValue(new Response());

      middleware(request);

      expect(mockIntlMiddleware).toHaveBeenCalledWith(request);
    });

    it("delegates to next-intl middleware for /en/about", async () => {
      const { middleware } = await import("./middleware");
      const request = createRequest("/en/about");
      mockIntlMiddleware.mockReturnValue(new Response());

      middleware(request);

      expect(mockIntlMiddleware).toHaveBeenCalledWith(request);
    });
  });

  describe("maintenance mode ON — general user", () => {
    it("rewrites root to /teaser (URL preserved)", async () => {
      process.env.NEXT_PUBLIC_MAINTENANCE = "true";
      const { middleware } = await import("./middleware");
      const request = createRequest("/");

      const response = middleware(request);

      expect(response.headers.get("x-middleware-rewrite")).toContain("/ja/teaser");
    });

    it("allows /teaser through via i18n routing", async () => {
      process.env.NEXT_PUBLIC_MAINTENANCE = "true";
      const { middleware } = await import("./middleware");
      const request = createRequest("/teaser");
      mockIntlMiddleware.mockReturnValue(new Response());

      const response = middleware(request);

      expect(mockIntlMiddleware).toHaveBeenCalledWith(request);
      expect(response.status).not.toBe(503);
    });

    it("allows static assets through", async () => {
      process.env.NEXT_PUBLIC_MAINTENANCE = "true";
      const { middleware } = await import("./middleware");
      const request = createRequest("/logos/mark-neon.png");
      mockIntlMiddleware.mockReturnValue(new Response());

      const response = middleware(request);

      expect(response.status).not.toBe(503);
    });
  });

  describe("maintenance mode ON — bot", () => {
    it("returns 503 with Retry-After for Googlebot", async () => {
      process.env.NEXT_PUBLIC_MAINTENANCE = "true";
      const { middleware } = await import("./middleware");
      const request = createRequest("/", "Mozilla/5.0 (compatible; Googlebot/2.1)");

      const response = middleware(request);

      expect(response.status).toBe(503);
      expect(response.headers.get("Retry-After")).toBe("86400");
      expect(response.headers.get("Content-Type")).toContain("text/html");
    });

    it("returns 503 for Bingbot", async () => {
      process.env.NEXT_PUBLIC_MAINTENANCE = "true";
      const { middleware } = await import("./middleware");
      const request = createRequest("/about", "Mozilla/5.0 (compatible; bingbot/2.0)");

      const response = middleware(request);

      expect(response.status).toBe(503);
    });

    it("allows /teaser through for bots (bypass path)", async () => {
      process.env.NEXT_PUBLIC_MAINTENANCE = "true";
      const { middleware } = await import("./middleware");
      const request = createRequest("/teaser", "Googlebot");
      mockIntlMiddleware.mockReturnValue(new Response());

      const response = middleware(request);

      expect(mockIntlMiddleware).toHaveBeenCalledWith(request);
      expect(response.status).not.toBe(503);
    });
  });

  describe("config matcher", () => {
    it("exports a matcher config", async () => {
      const { config } = await import("./middleware");
      expect(config.matcher).toBeDefined();
      expect(Array.isArray(config.matcher)).toBe(true);
    });
  });
});
