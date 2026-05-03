import { describe, it, expect } from "vitest";

import {
  getEmbedProvider,
  isValidEmbedAttributes,
  EMBED_PROVIDER_IDS,
} from "./registry";

describe("embed registry", () => {
  describe("EMBED_PROVIDER_IDS", () => {
    it("Phase 1 では youtube のみ", () => {
      expect(EMBED_PROVIDER_IDS).toEqual(["youtube"]);
    });
  });

  describe("getEmbedProvider", () => {
    it("登録済みプロバイダ (youtube) を返す", () => {
      const p = getEmbedProvider("youtube");
      expect(p).toBeDefined();
      expect(p?.id).toBe("youtube");
    });

    it("未登録は undefined", () => {
      expect(getEmbedProvider("vimeo")).toBeUndefined();
      expect(getEmbedProvider("instagram")).toBeUndefined();
      expect(getEmbedProvider("")).toBeUndefined();
      expect(getEmbedProvider("YOUTUBE")).toBeUndefined(); // 大文字は別物
    });
  });

  describe("isValidEmbedAttributes", () => {
    it("有効な provider + id で true", () => {
      expect(isValidEmbedAttributes("youtube", "dQw4w9WgXcQ")).toBe(true);
    });

    it("未登録プロバイダで false", () => {
      expect(isValidEmbedAttributes("vimeo", "123456789")).toBe(false);
      expect(isValidEmbedAttributes("", "dQw4w9WgXcQ")).toBe(false);
    });

    it("プロバイダ既知でも id 形式違反で false", () => {
      expect(isValidEmbedAttributes("youtube", "")).toBe(false);
      expect(isValidEmbedAttributes("youtube", "too_short")).toBe(false);
      expect(isValidEmbedAttributes("youtube", "way_too_long_invalid_id")).toBe(false);
      expect(isValidEmbedAttributes("youtube", "dQw4'WgXcQ")).toBe(false);
    });
  });
});
