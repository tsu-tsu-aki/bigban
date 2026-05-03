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
    const id = url.pathname.slice(1).split("/")[0] ?? "";
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

export const YOUTUBE_PROVIDER: EmbedProviderDescriptor = {
  id: "youtube",
  idPattern: ID_PATTERN,
  buildThumbnailUrl: (embedId) => `https://i.ytimg.com/vi/${embedId}/hqdefault.jpg`,
  buildIframeUrl: (embedId) =>
    `https://www.youtube-nocookie.com/embed/${embedId}?rel=0`,
  extractIdFromUrl: extractYouTubeId,
};
