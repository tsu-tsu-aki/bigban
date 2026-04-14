import { describe, it, expect } from "vitest";
import { extractPageLabel, parseKeywords } from "./og-utils";

describe("extractPageLabel", () => {
  it("パイプ区切りのタイトルからページラベル部分を返す", () => {
    expect(extractPageLabel("ABOUT US|THE PICKLE BANG THEORY")).toBe(
      "ABOUT US"
    );
  });

  it("中黒(·)区切りのタイトルからページラベル部分を返す", () => {
    expect(
      extractPageLabel("Legal Notice · THE PICKLE BANG THEORY")
    ).toBe("Legal Notice");
  });

  it("区切り文字周辺の空白を正しくトリムする", () => {
    expect(extractPageLabel("  HOME   |   SITE  ")).toBe("HOME");
  });

  it("区切り文字がない場合はそのまま返す", () => {
    expect(extractPageLabel("SINGLE")).toBe("SINGLE");
  });
});

describe("parseKeywords", () => {
  it("文字列配列をそのまま返す", () => {
    expect(parseKeywords(["a", "b"])).toEqual(["a", "b"]);
  });

  it("非文字列を除去する", () => {
    expect(parseKeywords(["a", 1, null, "b", undefined])).toEqual(["a", "b"]);
  });

  it("配列でない場合は空配列を返す", () => {
    expect(parseKeywords("not array")).toEqual([]);
    expect(parseKeywords(undefined)).toEqual([]);
    expect(parseKeywords(null)).toEqual([]);
    expect(parseKeywords({})).toEqual([]);
  });
});
