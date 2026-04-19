import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const PROD_URL = "https://www.thepicklebang.com";
const BRAND = "THE PICKLE BANG THEORY";

describe("buildWebSite", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", PROD_URL);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("@contextとWebSite、@idを含む", async () => {
    const { buildWebSite } = await import("./website");
    const schema = buildWebSite();

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("WebSite");
    expect(schema["@id"]).toBe(`${PROD_URL}/#website`);
  });

  it("url・name・inLanguageを含む", async () => {
    const { buildWebSite } = await import("./website");
    const schema = buildWebSite();

    expect(schema.url).toBe(PROD_URL);
    expect(schema.name).toBe(BRAND);
    expect(schema.inLanguage).toEqual(["ja-JP", "en-US"]);
  });

  it("publisherでOrganizationと連結する", async () => {
    const { buildWebSite } = await import("./website");
    const schema = buildWebSite();

    expect(schema.publisher).toEqual({
      "@id": `${PROD_URL}/#organization`,
    });
  });

  it("alternateNameに日本語施設名を含む", async () => {
    const { buildWebSite } = await import("./website");
    const schema = buildWebSite();

    expect(Array.isArray(schema.alternateName)).toBe(true);
    expect(schema.alternateName).toContain("ザ ピックルバン セオリー");
  });
});
