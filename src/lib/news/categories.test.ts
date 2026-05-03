import { describe, it, expect } from "vitest";

import { resolveCategories } from "./categories";

describe("resolveCategories", () => {
  it("既知カテゴリ ID を NEWS_CATEGORIES のオブジェクトに解決する", () => {
    const result = resolveCategories(["notice", "media"]);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ id: "notice", labelJa: "お知らせ" });
    expect(result[1]).toMatchObject({ id: "media", labelJa: "メディア掲載" });
  });

  it("配列順を保つ", () => {
    const result = resolveCategories(["event", "notice", "campaign"]);
    expect(result.map((c) => c.id)).toEqual(["event", "notice", "campaign"]);
  });

  it("未知カテゴリは除外する", () => {
    const result = resolveCategories(["notice", "ghost", "media"]);
    expect(result.map((c) => c.id)).toEqual(["notice", "media"]);
  });

  it("空配列を入れたら空配列を返す", () => {
    expect(resolveCategories([])).toEqual([]);
  });

  it("全件未知なら空配列", () => {
    expect(resolveCategories(["a", "b", "c"])).toEqual([]);
  });
});
