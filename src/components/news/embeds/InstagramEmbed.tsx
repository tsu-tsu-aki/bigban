"use client";

import { useTranslations } from "next-intl";

import { INSTAGRAM_PROVIDER } from "@/lib/news/embeds/instagram";

import { EmbedShell } from "./EmbedShell";

interface InstagramEmbedProps {
  embedId: string;
}

// Instagram 投稿の中央値的サイズに合わせた固定高さ。
// 投稿の長さによって最適値は変わるが、postMessage による動的リサイズは
// CLS / カクつきの原因になるため固定する。
// - 短い投稿: 下部に余白 (黒背景でブランドのダーク基調と整合)
// - 長い投稿: iframe 内部で縦スクロール (Instagram 標準挙動)
const EMBED_HEIGHT = "700px";
// Instagram 公式推奨の埋め込み幅。
const MAX_WIDTH = "540px";

/**
 * Instagram 埋め込みコンポーネント。
 *
 * - id 検証 (1〜15 文字、英数字 + - _) を行い、不正なら何も描画しない
 * - 投稿タイプ (post / reel / IGTV) はすべて /p/{id}/embed で処理可能
 *   (Instagram が内部リダイレクト)
 * - iframe のセキュリティ属性は EmbedShell に集約 (DRY / 単一の真実の源)
 */
export function InstagramEmbed({ embedId }: InstagramEmbedProps) {
  const t = useTranslations("News.embed");

  if (!INSTAGRAM_PROVIDER.idPattern.test(embedId)) {
    return null;
  }

  return (
    <EmbedShell
      iframeUrl={INSTAGRAM_PROVIDER.buildIframeUrl(embedId)}
      iframeTitle={t("instagram.iframeTitle")}
      fallbackHref={`https://www.instagram.com/p/${embedId}/`}
      fallbackLabel={t("fallbackLabel")}
      height={EMBED_HEIGHT}
      maxWidth={MAX_WIDTH}
    />
  );
}
