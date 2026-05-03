"use client";

import { useTranslations } from "next-intl";

import { YOUTUBE_PROVIDER } from "@/lib/news/embeds/youtube";

import { EmbedShell } from "./EmbedShell";

interface YouTubeEmbedProps {
  embedId: string;
}

/**
 * YouTube 埋め込みコンポーネント (Click-to-Load)。
 *
 * - id の最終検証 (provider 固有: 11 文字) を行い、不正なら何も描画しない
 *   (サニタイザーは generic 検証のみ。最終的な「壊れた iframe を出さない」
 *   保証は描画レイヤーで担保 = 二段防御)
 * - サムネ / iframe URL は registry の YOUTUBE_PROVIDER から取得
 *   (URL ロジックを 1 箇所に集約)
 */
export function YouTubeEmbed({ embedId }: YouTubeEmbedProps) {
  const t = useTranslations("News.embed");

  if (!YOUTUBE_PROVIDER.idPattern.test(embedId)) {
    return null;
  }

  return (
    <EmbedShell
      thumbnailUrl={YOUTUBE_PROVIDER.buildThumbnailUrl(embedId)}
      thumbnailAlt={t("youtube.thumbnailAlt")}
      iframeUrl={YOUTUBE_PROVIDER.buildIframeUrl(embedId)}
      iframeTitle={t("youtube.iframeTitle")}
      playLabel={t("youtube.playLabel")}
      fallbackHref={`https://www.youtube.com/watch?v=${embedId}`}
      fallbackLabel={t("fallbackLabel")}
    />
  );
}
