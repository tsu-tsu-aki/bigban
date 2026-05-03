"use client";

import { useTranslations } from "next-intl";

import { INSTAGRAM_PROVIDER } from "@/lib/news/embeds/instagram";

import { EmbedShell } from "./EmbedShell";

interface InstagramEmbedProps {
  embedId: string;
}

/**
 * Instagram 埋め込みコンポーネント (常時 iframe ロード)。
 *
 * - id 検証 (1〜15 文字、英数字 + - _) を行い、不正なら何も描画しない
 * - 投稿タイプ (post / reel / IGTV) はすべて /p/{id}/embed で処理可能
 *   (Instagram が内部リダイレクト)
 * - レイアウト: 540px 上限 (Instagram 推奨幅) の中央寄せ、aspect-ratio 1/1.4
 *   (画像 + キャプションを含む典型的な投稿の見え方に合わせた経験値)
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
      aspectRatio="1 / 1.4"
      maxWidth="540px"
    />
  );
}
