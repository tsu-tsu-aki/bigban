import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const PROD_URL = "https://www.thepicklebang.com";

describe("robots", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", PROD_URL);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("production環境 (VERCEL_ENV=production)", () => {
    beforeEach(() => {
      vi.stubEnv("VERCEL_ENV", "production");
    });

    it("全userAgentにallow: / を返す", async () => {
      const { default: robots } = await import("./robots");
      const result = robots();

      const rules = Array.isArray(result.rules) ? result.rules : [result.rules!];
      expect(rules[0].userAgent).toBe("*");
      expect(rules[0].allow).toBe("/");
    });

    it("/api/ と /teaser を Disallow する", async () => {
      const { default: robots } = await import("./robots");
      const result = robots();

      const rules = Array.isArray(result.rules) ? result.rules : [result.rules!];
      const disallow = rules[0].disallow;
      expect(disallow).toEqual(expect.arrayContaining(["/api/", "/teaser"]));
    });

    it("sitemap の URL を返す", async () => {
      const { default: robots } = await import("./robots");
      const result = robots();

      expect(result.sitemap).toBe(`${PROD_URL}/sitemap.xml`);
    });

    it("host に www.thepicklebang.com を返す", async () => {
      const { default: robots } = await import("./robots");
      const result = robots();

      expect(result.host).toBe("www.thepicklebang.com");
    });
  });

  describe("非production環境 (VERCEL_ENV=preview)", () => {
    beforeEach(() => {
      vi.stubEnv("VERCEL_ENV", "preview");
    });

    it("全面Disallowを返す", async () => {
      const { default: robots } = await import("./robots");
      const result = robots();

      const rules = Array.isArray(result.rules) ? result.rules : [result.rules!];
      expect(rules[0].userAgent).toBe("*");
      expect(rules[0].disallow).toBe("/");
    });

    it("sitemap は設定しない", async () => {
      const { default: robots } = await import("./robots");
      const result = robots();

      expect(result.sitemap).toBeUndefined();
    });
  });

  describe("VERCEL_ENV未設定（ローカル開発）", () => {
    beforeEach(() => {
      vi.stubEnv("VERCEL_ENV", "");
    });

    it("全面Disallowを返す", async () => {
      const { default: robots } = await import("./robots");
      const result = robots();

      const rules = Array.isArray(result.rules) ? result.rules : [result.rules!];
      expect(rules[0].disallow).toBe("/");
    });
  });
});
