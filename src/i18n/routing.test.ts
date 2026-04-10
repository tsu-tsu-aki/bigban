import { describe, it, expect } from "vitest";
import { routing } from "./routing";

describe("i18n routing configuration", () => {
  it("supports ja and en locales", () => {
    expect(routing.locales).toEqual(["ja", "en"]);
  });

  it("defaults to ja locale", () => {
    expect(routing.defaultLocale).toBe("ja");
  });

  it("uses as-needed locale prefix strategy", () => {
    expect(routing.localePrefix).toBe("as-needed");
  });
});
