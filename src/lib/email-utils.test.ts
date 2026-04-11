import { describe, it, expect } from "vitest";
import { escapeHtml } from "./email-utils";

describe("escapeHtml", () => {
  it("& を &amp; にエスケープする", () => {
    expect(escapeHtml("A & B")).toBe("A &amp; B");
  });

  it("< と > をエスケープする", () => {
    expect(escapeHtml("<script>alert(1)</script>")).toBe(
      "&lt;script&gt;alert(1)&lt;/script&gt;",
    );
  });

  it('" をエスケープする', () => {
    expect(escapeHtml('value="test"')).toBe("value=&quot;test&quot;");
  });

  it("' をエスケープする", () => {
    expect(escapeHtml("it's")).toBe("it&#39;s");
  });

  it("エスケープ不要な文字列はそのまま返す", () => {
    expect(escapeHtml("山田太郎")).toBe("山田太郎");
  });

  it("空文字列はそのまま返す", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("複数の特殊文字を同時にエスケープする", () => {
    expect(escapeHtml('<a href="x">&')).toBe(
      '&lt;a href=&quot;x&quot;&gt;&amp;',
    );
  });
});
