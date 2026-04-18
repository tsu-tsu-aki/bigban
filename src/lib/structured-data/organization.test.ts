import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const PROD_URL = "https://www.thepicklebang.com";

describe("buildOrganization", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", PROD_URL);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("@contextとOrganizationを含む", async () => {
    const { buildOrganization } = await import("./organization");
    const schema = buildOrganization();

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Organization");
    expect(schema["@id"]).toBe(`${PROD_URL}/#organization`);
  });

  it("社名とURLを含む", async () => {
    const { buildOrganization } = await import("./organization");
    const schema = buildOrganization();

    expect(schema.name).toBe("RST Agency株式会社");
    expect(schema.url).toBe("https://rstagency.com");
  });

  it("founderに西村昭彦を含む", async () => {
    const { buildOrganization } = await import("./organization");
    const schema = buildOrganization();

    expect(schema.founder).toEqual({
      "@type": "Person",
      name: "西村昭彦",
    });
  });

  it("会社住所（品川区二葉）を返す", async () => {
    const { buildOrganization } = await import("./organization");
    const schema = buildOrganization();

    expect(schema.address).toEqual({
      "@type": "PostalAddress",
      addressCountry: "JP",
      addressRegion: "東京都",
      addressLocality: "品川区",
      streetAddress: "二葉1-4-2",
    });
  });

  it("knowsAboutにピックルボール関連領域を含む", async () => {
    const { buildOrganization } = await import("./organization");
    const schema = buildOrganization();

    expect(Array.isArray(schema.knowsAbout)).toBe(true);
    expect(schema.knowsAbout).toContain("Pickleball");
    expect(schema.knowsAbout.length).toBeGreaterThanOrEqual(2);
  });

  it("areaServedで日本を指す", async () => {
    const { buildOrganization } = await import("./organization");
    const schema = buildOrganization();

    expect(schema.areaServed).toEqual({
      "@type": "Country",
      name: "Japan",
    });
  });

  it("sameAsにRST Agency公式サイトを含む", async () => {
    const { buildOrganization } = await import("./organization");
    const schema = buildOrganization();

    expect(Array.isArray(schema.sameAs)).toBe(true);
    expect(schema.sameAs).toContain("https://rstagency.com");
  });
});
