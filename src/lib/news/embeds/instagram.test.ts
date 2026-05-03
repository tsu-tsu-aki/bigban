import { describe, it, expect } from "vitest";

import { INSTAGRAM_PROVIDER } from "./instagram";

describe("INSTAGRAM_PROVIDER", () => {
  describe("id / idPattern", () => {
    it("id は 'instagram'", () => {
      expect(INSTAGRAM_PROVIDER.id).toBe("instagram");
    });

    it("Instagram shortcode (英数字 + _ + -) を許可", () => {
      expect(INSTAGRAM_PROVIDER.idPattern.test("C12abcXYZ_-")).toBe(true);
      expect(INSTAGRAM_PROVIDER.idPattern.test("Bxyz123_456")).toBe(true);
      expect(INSTAGRAM_PROVIDER.idPattern.test("Cxyz")).toBe(true);
    });

    it("16 文字超 / 0 文字 / 特殊文字は拒否", () => {
      expect(INSTAGRAM_PROVIDER.idPattern.test("a".repeat(16))).toBe(false);
      expect(INSTAGRAM_PROVIDER.idPattern.test("")).toBe(false);
      expect(INSTAGRAM_PROVIDER.idPattern.test("abc xyz")).toBe(false);
      expect(INSTAGRAM_PROVIDER.idPattern.test("abc/xyz")).toBe(false);
      expect(INSTAGRAM_PROVIDER.idPattern.test("<script>")).toBe(false);
    });
  });

  describe("buildIframeUrl", () => {
    it("instagram.com/p/{id}/embed を返す", () => {
      expect(INSTAGRAM_PROVIDER.buildIframeUrl("C12abcXYZ_-")).toBe(
        "https://www.instagram.com/p/C12abcXYZ_-/embed",
      );
    });

    it("locale 引数は受理するが Instagram embed は影響なし (現状の仕様)", () => {
      expect(
        INSTAGRAM_PROVIDER.buildIframeUrl("C12abcXYZ_-", { locale: "ja" }),
      ).toBe("https://www.instagram.com/p/C12abcXYZ_-/embed");
    });
  });

  describe("buildThumbnailUrl", () => {
    it("Instagram は静的サムネ URL が無いため空文字を返す (フォールバック扱い)", () => {
      expect(INSTAGRAM_PROVIDER.buildThumbnailUrl("C12abcXYZ_-")).toBe("");
    });
  });

  describe("extractIdFromUrl", () => {
    it("https://www.instagram.com/p/{id}/ から ID 抽出", () => {
      expect(
        INSTAGRAM_PROVIDER.extractIdFromUrl(
          new URL("https://www.instagram.com/p/C12abcXYZ_-/"),
        ),
      ).toBe("C12abcXYZ_-");
    });

    it("https://instagram.com/p/{id}/ (www なし) から ID 抽出", () => {
      expect(
        INSTAGRAM_PROVIDER.extractIdFromUrl(
          new URL("https://instagram.com/p/C12abcXYZ_-"),
        ),
      ).toBe("C12abcXYZ_-");
    });

    it("https://www.instagram.com/reel/{id}/ から ID 抽出", () => {
      expect(
        INSTAGRAM_PROVIDER.extractIdFromUrl(
          new URL("https://www.instagram.com/reel/C12abcXYZ_-/"),
        ),
      ).toBe("C12abcXYZ_-");
    });

    it("https://www.instagram.com/tv/{id}/ (IGTV) から ID 抽出", () => {
      expect(
        INSTAGRAM_PROVIDER.extractIdFromUrl(
          new URL("https://www.instagram.com/tv/C12abcXYZ_-/"),
        ),
      ).toBe("C12abcXYZ_-");
    });

    it("クエリパラメータ (utm_source 等) があっても抽出可", () => {
      expect(
        INSTAGRAM_PROVIDER.extractIdFromUrl(
          new URL("https://www.instagram.com/p/C12abcXYZ_-/?utm_source=ig_web_copy_link"),
        ),
      ).toBe("C12abcXYZ_-");
    });

    it("関係ないホストは null", () => {
      expect(
        INSTAGRAM_PROVIDER.extractIdFromUrl(
          new URL("https://www.facebook.com/p/abc/"),
        ),
      ).toBeNull();
      expect(
        INSTAGRAM_PROVIDER.extractIdFromUrl(
          new URL("https://example.com/instagram/p/abc/"),
        ),
      ).toBeNull();
    });

    it("Instagram ホストでもプロフィールやエクスプロアは null", () => {
      expect(
        INSTAGRAM_PROVIDER.extractIdFromUrl(
          new URL("https://www.instagram.com/explore/"),
        ),
      ).toBeNull();
      expect(
        INSTAGRAM_PROVIDER.extractIdFromUrl(
          new URL("https://www.instagram.com/some_user/"),
        ),
      ).toBeNull();
    });

    it("ID が pattern に合わない場合 null", () => {
      expect(
        INSTAGRAM_PROVIDER.extractIdFromUrl(
          new URL("https://www.instagram.com/p/aaaaaaaaaaaaaaaaaaaaaaaaa/"),
        ),
      ).toBeNull();
    });
  });
});
