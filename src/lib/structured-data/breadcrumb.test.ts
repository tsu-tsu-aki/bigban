import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const PROD_URL = "https://www.thepicklebang.com";

describe("buildBreadcrumb", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", PROD_URL);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("@contextとBreadcrumbListを含む", async () => {
    const { buildBreadcrumb } = await import("./breadcrumb");
    const schema = buildBreadcrumb("ja", [
      { name: "About", path: "/about" },
    ]);

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("BreadcrumbList");
  });

  it("ja localeではルートURL先頭にprefixなし", async () => {
    const { buildBreadcrumb } = await import("./breadcrumb");
    const schema = buildBreadcrumb("ja", [
      { name: "About", path: "/about" },
    ]);

    expect(schema.itemListElement[0]).toEqual({
      "@type": "ListItem",
      position: 1,
      name: "ホーム",
      item: PROD_URL,
    });
    expect(schema.itemListElement[1]).toEqual({
      "@type": "ListItem",
      position: 2,
      name: "About",
      item: `${PROD_URL}/about`,
    });
  });

  it("en localeでは /en prefix付き", async () => {
    const { buildBreadcrumb } = await import("./breadcrumb");
    const schema = buildBreadcrumb("en", [
      { name: "About", path: "/about" },
    ]);

    expect(schema.itemListElement[0].item).toBe(`${PROD_URL}/en`);
    expect(schema.itemListElement[1].item).toBe(`${PROD_URL}/en/about`);
  });

  it("複数階層のパンくずに対応する", async () => {
    const { buildBreadcrumb } = await import("./breadcrumb");
    const schema = buildBreadcrumb("ja", [
      { name: "About", path: "/about" },
      { name: "Founder", path: "/about/founder" },
    ]);

    expect(schema.itemListElement).toHaveLength(3);
    expect(schema.itemListElement[2].position).toBe(3);
    expect(schema.itemListElement[2].item).toBe(`${PROD_URL}/about/founder`);
  });

  it("ja localeでHomeのnameは「ホーム」", async () => {
    const { buildBreadcrumb } = await import("./breadcrumb");
    const schema = buildBreadcrumb("ja", []);

    expect(schema.itemListElement[0].name).toBe("ホーム");
  });

  it("en localeでHomeのnameは「Home」", async () => {
    const { buildBreadcrumb } = await import("./breadcrumb");
    const schema = buildBreadcrumb("en", []);

    expect(schema.itemListElement[0].name).toBe("Home");
  });
});
