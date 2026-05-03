import type { EmbedProviderDescriptor } from "./types";

const INSTAGRAM_HOSTS = new Set([
  "www.instagram.com",
  "instagram.com",
]);

// Instagram shortcode は通常 11 文字だが、古い投稿で短いものもあり
// 将来の長さ拡張も考慮して 1〜15 文字 + ハイフン / アンダースコアを許容
const ID_PATTERN = /^[A-Za-z0-9_-]{1,15}$/;

// /p/{id}/ /reel/{id}/ /tv/{id}/ いずれの URL からも shortcode を取り出す
const PATH_RE = /^\/(?:p|reel|tv)\/([^/?]+)/;

function extractInstagramId(url: URL): string | null {
  if (!INSTAGRAM_HOSTS.has(url.hostname)) return null;
  const m = url.pathname.match(PATH_RE);
  if (!m) return null;
  const id = m[1];
  return ID_PATTERN.test(id) ? id : null;
}

/**
 * 全タイプ (post / reel / IGTV) で /p/{id}/embed が利用可能。
 * Instagram は内部リダイレクトで適切な埋め込みページを返す。
 */
function buildInstagramIframeUrl(embedId: string): string {
  return `https://www.instagram.com/p/${embedId}/embed`;
}

export const INSTAGRAM_PROVIDER: EmbedProviderDescriptor = {
  id: "instagram",
  idPattern: ID_PATTERN,
  // Instagram は静的サムネ URL の安定提供がないため空文字。EmbedShell 側で
  // 即時 iframe ロードする現運用では使用されないが、interface 準拠のため定義。
  buildThumbnailUrl: () => "",
  buildIframeUrl: buildInstagramIframeUrl,
  extractIdFromUrl: extractInstagramId,
};
