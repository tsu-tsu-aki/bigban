import { describe, it, expect } from "vitest";
import { generateExcerpt } from "./excerpt";

describe("generateExcerpt", () => {
  it("HTMLタグ除去", () => {
    expect(generateExcerpt("<p>こんにちは <strong>世界</strong></p>")).toBe(
      "こんにちは 世界",
    );
  });

  it("120文字超は … を末尾に付与", () => {
    const r = generateExcerpt(`<p>${"あ".repeat(200)}</p>`);
    expect(r.length).toBe(121);
    expect(r.endsWith("…")).toBe(true);
  });

  it("120文字以下は素通し", () => {
    expect(generateExcerpt("<p>短い文章</p>")).toBe("短い文章");
  });

  it("空文字→空文字", () => {
    expect(generateExcerpt("")).toBe("");
  });

  it("連続空白を単一に", () => {
    expect(generateExcerpt("<p>A</p>   <p>B</p>")).toBe("A B");
  });

  it("length オプション", () => {
    const r = generateExcerpt("<p>" + "あ".repeat(50) + "</p>", { length: 10 });
    expect(r.length).toBe(11);
  });
});
