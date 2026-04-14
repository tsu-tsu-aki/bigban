import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const PROD_URL = "https://www.thepicklebang.com";

describe("sitemap", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", PROD_URL);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("想定3ページ（/, /about, /tokushoho）を含む", async () => {
    const { default: sitemap } = await import("./sitemap");
    const entries = sitemap();

    expect(entries).toHaveLength(3);
    const urls = entries.map((e) => e.url);
    expect(urls).toContain(`${PROD_URL}`);
    expect(urls).toContain(`${PROD_URL}/about`);
    expect(urls).toContain(`${PROD_URL}/tokushoho`);
  });

  it("/teaser / /facility / /services は sitemap に含まれない", async () => {
    const { default: sitemap } = await import("./sitemap");
    const entries = sitemap();

    const urls = entries.map((e) => e.url);
    expect(urls.some((u) => u.includes("/teaser"))).toBe(false);
    expect(urls.some((u) => u.includes("/facility"))).toBe(false);
    expect(urls.some((u) => u.includes("/services"))).toBe(false);
  });

  it("各エントリに ja/en/x-default の alternates.languages が設定される", async () => {
    const { default: sitemap } = await import("./sitemap");
    const entries = sitemap();

    for (const entry of entries) {
      expect(entry.alternates?.languages).toBeDefined();
      expect(entry.alternates?.languages?.ja).toBeDefined();
      expect(entry.alternates?.languages?.en).toBeDefined();
      expect(entry.alternates?.languages?.["x-default"]).toBeDefined();
    }
  });

  it("ja URL は prefix なし（localePrefix: as-needed に従う）", async () => {
    const { default: sitemap } = await import("./sitemap");
    const entries = sitemap();

    const home = entries.find((e) => e.url === PROD_URL);
    expect(home?.alternates?.languages?.ja).toBe(PROD_URL);

    const about = entries.find((e) => e.url === `${PROD_URL}/about`);
    expect(about?.alternates?.languages?.ja).toBe(`${PROD_URL}/about`);
  });

  it("en URL は /en prefix 付き", async () => {
    const { default: sitemap } = await import("./sitemap");
    const entries = sitemap();

    const home = entries.find((e) => e.url === PROD_URL);
    expect(home?.alternates?.languages?.en).toBe(`${PROD_URL}/en`);

    const about = entries.find((e) => e.url === `${PROD_URL}/about`);
    expect(about?.alternates?.languages?.en).toBe(`${PROD_URL}/en/about`);
  });

  it("x-default は ja URL と一致する", async () => {
    const { default: sitemap } = await import("./sitemap");
    const entries = sitemap();

    for (const entry of entries) {
      expect(entry.alternates?.languages?.["x-default"]).toBe(
        entry.alternates?.languages?.ja
      );
    }
  });

  it("priority と changeFrequency が SITEMAP_ROUTES と一致する", async () => {
    const { default: sitemap } = await import("./sitemap");
    const { SITEMAP_ROUTES } = await import("@/constants/routes");
    const entries = sitemap();

    for (const route of SITEMAP_ROUTES) {
      const expectedUrl =
        route.path === "/" ? PROD_URL : `${PROD_URL}${route.path}`;
      const entry = entries.find((e) => e.url === expectedUrl);
      expect(entry?.priority).toBe(route.priority);
      expect(entry?.changeFrequency).toBe(route.changeFrequency);
    }
  });

  it("lastModified は設定しない（ビルド毎に値が変わる誤った鮮度シグナル回避）", async () => {
    const { default: sitemap } = await import("./sitemap");
    const entries = sitemap();

    for (const entry of entries) {
      expect(entry.lastModified).toBeUndefined();
    }
  });
});
