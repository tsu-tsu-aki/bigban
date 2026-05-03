import { describe, it, expect } from "vitest";

import { YOUTUBE_PROVIDER } from "./youtube";

describe("YOUTUBE_PROVIDER", () => {
  describe("id / idPattern", () => {
    it("id は 'youtube'", () => {
      expect(YOUTUBE_PROVIDER.id).toBe("youtube");
    });

    it("11 文字の英数字 + ハイフン + アンダースコアを許可", () => {
      expect(YOUTUBE_PROVIDER.idPattern.test("dQw4w9WgXcQ")).toBe(true);
      expect(YOUTUBE_PROVIDER.idPattern.test("abc_DEF-123")).toBe(true);
    });

    it("12 文字以上 / 10 文字以下は拒否", () => {
      expect(YOUTUBE_PROVIDER.idPattern.test("dQw4w9WgXcQX")).toBe(false);
      expect(YOUTUBE_PROVIDER.idPattern.test("dQw4w9WgXc")).toBe(false);
    });

    it("特殊文字は拒否", () => {
      expect(YOUTUBE_PROVIDER.idPattern.test("dQw4 9WgXcQ")).toBe(false);
      expect(YOUTUBE_PROVIDER.idPattern.test("dQw4'WgXcQ")).toBe(false);
      expect(YOUTUBE_PROVIDER.idPattern.test("<dQw4WgXcQ")).toBe(false);
      expect(YOUTUBE_PROVIDER.idPattern.test("")).toBe(false);
    });
  });

  describe("buildThumbnailUrl", () => {
    it("i.ytimg.com の hqdefault URL を返す", () => {
      expect(YOUTUBE_PROVIDER.buildThumbnailUrl("dQw4w9WgXcQ")).toBe(
        "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      );
    });
  });

  describe("buildIframeUrl", () => {
    it("youtube-nocookie.com の embed URL を返す (rel=0 / playsinline=1 / color=white)", () => {
      const url = YOUTUBE_PROVIDER.buildIframeUrl("dQw4w9WgXcQ");
      expect(url).toMatch(
        /^https:\/\/www\.youtube-nocookie\.com\/embed\/dQw4w9WgXcQ\?/,
      );
      const u = new URL(url);
      expect(u.searchParams.get("rel")).toBe("0");
      expect(u.searchParams.get("playsinline")).toBe("1");
      expect(u.searchParams.get("color")).toBe("white");
      expect(u.searchParams.has("hl")).toBe(false);
    });

    it("locale を指定すると hl パラメータが付く (ja)", () => {
      const url = YOUTUBE_PROVIDER.buildIframeUrl("dQw4w9WgXcQ", {
        locale: "ja",
      });
      expect(new URL(url).searchParams.get("hl")).toBe("ja");
    });

    it("locale を指定すると hl パラメータが付く (en)", () => {
      const url = YOUTUBE_PROVIDER.buildIframeUrl("dQw4w9WgXcQ", {
        locale: "en",
      });
      expect(new URL(url).searchParams.get("hl")).toBe("en");
    });
  });

  describe("extractIdFromUrl", () => {
    it("https://www.youtube.com/watch?v=ID から ID を抽出", () => {
      expect(
        YOUTUBE_PROVIDER.extractIdFromUrl(
          new URL("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
        ),
      ).toBe("dQw4w9WgXcQ");
    });

    it("https://youtube.com/watch?v=ID (www なし) から ID を抽出", () => {
      expect(
        YOUTUBE_PROVIDER.extractIdFromUrl(
          new URL("https://youtube.com/watch?v=dQw4w9WgXcQ"),
        ),
      ).toBe("dQw4w9WgXcQ");
    });

    it("https://m.youtube.com/watch?v=ID (mobile) から ID を抽出", () => {
      expect(
        YOUTUBE_PROVIDER.extractIdFromUrl(
          new URL("https://m.youtube.com/watch?v=dQw4w9WgXcQ"),
        ),
      ).toBe("dQw4w9WgXcQ");
    });

    it("https://youtu.be/ID から ID を抽出", () => {
      expect(
        YOUTUBE_PROVIDER.extractIdFromUrl(
          new URL("https://youtu.be/dQw4w9WgXcQ"),
        ),
      ).toBe("dQw4w9WgXcQ");
    });

    it("https://www.youtube.com/shorts/ID から ID を抽出", () => {
      expect(
        YOUTUBE_PROVIDER.extractIdFromUrl(
          new URL("https://www.youtube.com/shorts/dQw4w9WgXcQ"),
        ),
      ).toBe("dQw4w9WgXcQ");
    });

    it("https://www.youtube.com/embed/ID から ID を抽出", () => {
      expect(
        YOUTUBE_PROVIDER.extractIdFromUrl(
          new URL("https://www.youtube.com/embed/dQw4w9WgXcQ"),
        ),
      ).toBe("dQw4w9WgXcQ");
    });

    it("ID が pattern にマッチしない場合は null", () => {
      expect(
        YOUTUBE_PROVIDER.extractIdFromUrl(
          new URL("https://www.youtube.com/watch?v=invalid_too_long_id"),
        ),
      ).toBeNull();
      expect(
        YOUTUBE_PROVIDER.extractIdFromUrl(
          new URL("https://youtu.be/short"),
        ),
      ).toBeNull();
    });

    it("関係ないホストは null", () => {
      expect(
        YOUTUBE_PROVIDER.extractIdFromUrl(
          new URL("https://vimeo.com/123456789"),
        ),
      ).toBeNull();
      expect(
        YOUTUBE_PROVIDER.extractIdFromUrl(
          new URL("https://example.com/watch?v=dQw4w9WgXcQ"),
        ),
      ).toBeNull();
    });

    it("YouTube ホストでも知らないパスは null", () => {
      expect(
        YOUTUBE_PROVIDER.extractIdFromUrl(
          new URL("https://www.youtube.com/playlist?list=PLxxx"),
        ),
      ).toBeNull();
      expect(
        YOUTUBE_PROVIDER.extractIdFromUrl(
          new URL("https://www.youtube.com/channel/UCxxx"),
        ),
      ).toBeNull();
    });

    it("watch?v= が空 / 欠落 の時は null", () => {
      expect(
        YOUTUBE_PROVIDER.extractIdFromUrl(
          new URL("https://www.youtube.com/watch"),
        ),
      ).toBeNull();
      expect(
        YOUTUBE_PROVIDER.extractIdFromUrl(
          new URL("https://www.youtube.com/watch?v="),
        ),
      ).toBeNull();
    });
  });
});
