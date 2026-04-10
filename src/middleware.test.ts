import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { NextRequest } from "next/server";

// next-intl/middleware をモック
const mockIntlMiddleware = vi.fn();
vi.mock("next-intl/middleware", () => ({
  default: vi.fn(() => mockIntlMiddleware),
}));

// 環境変数のリセット用
const originalEnv = process.env.NEXT_PUBLIC_MAINTENANCE;

function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3000"));
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

  describe("maintenance mode ON", () => {
    it("rewrites root to /ja/teaser (URL preserved)", async () => {
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

      middleware(request);

      expect(mockIntlMiddleware).toHaveBeenCalledWith(request);
    });

    it("allows static assets through", async () => {
      process.env.NEXT_PUBLIC_MAINTENANCE = "true";
      const { middleware } = await import("./middleware");
      const request = createRequest("/logos/mark-neon.png");
      mockIntlMiddleware.mockReturnValue(new Response());

      middleware(request);

      expect(mockIntlMiddleware).toHaveBeenCalledWith(request);
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
