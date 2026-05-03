import type { EmbedProviderDescriptor } from "./types";

const YOUTUBE_HOSTS = new Set([
  "www.youtube.com",
  "youtube.com",
  "m.youtube.com",
]);

const ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

/**
 * YouTube 動画の URL から動画 ID を抽出する。
 * 対応パターン:
 *   - https://www.youtube.com/watch?v=ID
 *   - https://youtu.be/ID
 *   - https://www.youtube.com/shorts/ID
 *   - https://www.youtube.com/embed/ID
 *   - https://www.youtube.com/v/ID
 */
function extractYouTubeId(url: URL): string | null {
  if (url.hostname === "youtu.be") {
    // String.prototype.split は常に最低 1 要素の配列を返すため [0] は string 確定
    const id = url.pathname.slice(1).split("/")[0];
    return ID_PATTERN.test(id) ? id : null;
  }

  if (!YOUTUBE_HOSTS.has(url.hostname)) return null;

  if (url.pathname === "/watch") {
    const id = url.searchParams.get("v") ?? "";
    return ID_PATTERN.test(id) ? id : null;
  }

  const m = url.pathname.match(/^\/(?:shorts|embed|v)\/([^/?]+)/);
  if (m) {
    const id = m[1];
    return ID_PATTERN.test(id) ? id : null;
  }

  return null;
}

/**
 * YouTube 埋め込みの URL パラメータ既定値:
 *  - rel=0: 再生終了時に他チャンネルの関連動画を出さない
 *  - playsinline=1: iOS Safari でフルスクリーン強制を防ぐ
 *  - color=white: 進行バーを赤→白 (エディトリアル基調と相性◎)
 *  - hl=<locale>: プレイヤー UI 言語をサイトロケールに合わせる (任意)
 */
function buildYouTubeIframeUrl(
  embedId: string,
  options?: { locale?: string },
): string {
  const params = new URLSearchParams({
    rel: "0",
    playsinline: "1",
    color: "white",
  });
  if (options?.locale) {
    params.set("hl", options.locale);
  }
  return `https://www.youtube-nocookie.com/embed/${embedId}?${params.toString()}`;
}

export const YOUTUBE_PROVIDER: EmbedProviderDescriptor = {
  id: "youtube",
  idPattern: ID_PATTERN,
  buildThumbnailUrl: (embedId) => `https://i.ytimg.com/vi/${embedId}/hqdefault.jpg`,
  buildIframeUrl: buildYouTubeIframeUrl,
  extractIdFromUrl: extractYouTubeId,
};
