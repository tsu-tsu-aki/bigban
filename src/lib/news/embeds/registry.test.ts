import { describe, it, expect } from "vitest";

import {
  getEmbedProvider,
  isValidEmbedAttributes,
  EMBED_PROVIDER_IDS,
} from "./registry";

describe("embed registry", () => {
  describe("EMBED_PROVIDER_IDS", () => {
    it("登録済みプロバイダは youtube / instagram", () => {
      expect(EMBED_PROVIDER_IDS).toEqual(["youtube", "instagram"]);
    });
  });

  describe("getEmbedProvider", () => {
    it("登録済みプロバイダを返す (youtube)", () => {
      const p = getEmbedProvider("youtube");
      expect(p).toBeDefined();
      expect(p?.id).toBe("youtube");
    });

    it("登録済みプロバイダを返す (instagram)", () => {
      const p = getEmbedProvider("instagram");
      expect(p).toBeDefined();
      expect(p?.id).toBe("instagram");
    });

    it("未登録は undefined", () => {
      expect(getEmbedProvider("vimeo")).toBeUndefined();
      expect(getEmbedProvider("twitter")).toBeUndefined();
      expect(getEmbedProvider("")).toBeUndefined();
      expect(getEmbedProvider("YOUTUBE")).toBeUndefined(); // 大文字は別物
    });
  });

  describe("isValidEmbedAttributes", () => {
    it("有効な provider + id で true (youtube)", () => {
      expect(isValidEmbedAttributes("youtube", "dQw4w9WgXcQ")).toBe(true);
    });

    it("有効な provider + id で true (instagram)", () => {
      expect(isValidEmbedAttributes("instagram", "C12abcXYZ_-")).toBe(true);
    });

    it("未登録プロバイダで false", () => {
      expect(isValidEmbedAttributes("vimeo", "123456789")).toBe(false);
      expect(isValidEmbedAttributes("", "dQw4w9WgXcQ")).toBe(false);
    });

    it("プロバイダ既知でも id 形式違反で false (youtube)", () => {
      expect(isValidEmbedAttributes("youtube", "")).toBe(false);
      expect(isValidEmbedAttributes("youtube", "too_short")).toBe(false);
      expect(isValidEmbedAttributes("youtube", "way_too_long_invalid_id")).toBe(false);
      expect(isValidEmbedAttributes("youtube", "dQw4'WgXcQ")).toBe(false);
    });

    it("プロバイダ既知でも id 形式違反で false (instagram)", () => {
      expect(isValidEmbedAttributes("instagram", "")).toBe(false);
      expect(isValidEmbedAttributes("instagram", "a".repeat(16))).toBe(false);
      expect(isValidEmbedAttributes("instagram", "abc/xyz")).toBe(false);
    });
  });
});
