import { describe, it, expect } from "vitest";
import {
  NEWS_CATEGORIES,
  NEWS_PAGE_SIZE,
  ABOUT_NEWS_LIMIT,
  DETAIL_PAGE_STATIC_LIMIT,
  type NewsCategoryId,
} from "./news";

describe("news constants", () => {
  it("4カテゴリ", () => {
    expect(NEWS_CATEGORIES).toHaveLength(4);
  });

  it("すべて id/labelJa/labelEn/color を持つ", () => {
    for (const c of NEWS_CATEGORIES) {
      expect(c.id).toBeDefined();
      expect(c.labelJa).toBeDefined();
      expect(c.labelEn).toBeDefined();
      expect(c.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("IDは notice/media/event/campaign", () => {
    expect(NEWS_CATEGORIES.map((c) => c.id)).toEqual([
      "notice",
      "media",
      "event",
      "campaign",
    ]);
  });

  it("NEWS_PAGE_SIZE=12", () => {
    expect(NEWS_PAGE_SIZE).toBe(12);
  });

  it("ABOUT_NEWS_LIMIT=3", () => {
    expect(ABOUT_NEWS_LIMIT).toBe(3);
  });

  it("DETAIL_PAGE_STATIC_LIMIT=100", () => {
    expect(DETAIL_PAGE_STATIC_LIMIT).toBe(100);
  });

  it("NewsCategoryId が正しく推論される", () => {
    const id: NewsCategoryId = "notice";
    expect(id).toBe("notice");
  });
});
