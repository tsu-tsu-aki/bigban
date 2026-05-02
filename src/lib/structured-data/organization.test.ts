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

  it("founderをPerson schemaの@idで参照する", async () => {
    const { buildOrganization } = await import("./organization");
    const schema = buildOrganization();

    expect(schema.founder).toEqual({
      "@id": `${PROD_URL}/#person-nishimura`,
    });
  });

  it("会社住所（品川区上大崎）を返す", async () => {
    const { buildOrganization } = await import("./organization");
    const schema = buildOrganization();

    expect(schema.address).toEqual({
      "@type": "PostalAddress",
      addressCountry: "JP",
      postalCode: "141-0021",
      addressRegion: "東京都",
      addressLocality: "品川区",
      streetAddress: "上大崎3-14-34プラスワン402",
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

  it("alternateNameにブランド表記ゆれを含む", async () => {
    const { buildOrganization } = await import("./organization");
    const schema = buildOrganization();

    expect(Array.isArray(schema.alternateName)).toBe(true);
    expect(schema.alternateName).toContain("RST Agency");
    expect(schema.alternateName).toContain("Racket Sports Tokyo");
  });

  it("memberに所属する人物を@id参照で含む", async () => {
    const { buildOrganization } = await import("./organization");
    const schema = buildOrganization();

    expect(Array.isArray(schema.member)).toBe(true);
    expect(schema.member).toContainEqual({
      "@id": `${PROD_URL}/#person-nishimura`,
    });
    expect(schema.member).toContainEqual({
      "@id": `${PROD_URL}/#person-yoshida`,
    });
  });
});
