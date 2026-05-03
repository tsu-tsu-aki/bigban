"use client";

import { useLocale, useTranslations } from "next-intl";

import { YOUTUBE_PROVIDER } from "@/lib/news/embeds/youtube";

import { EmbedShell } from "./EmbedShell";

interface YouTubeEmbedProps {
  embedId: string;
}

/**
 * YouTube 埋め込みコンポーネント (常時 iframe ロード)。
 *
 * - id の最終検証 (provider 固有: 11 文字) を行い、不正なら何も描画しない
 *   (サニタイザーは generic 検証のみ。最終的な「壊れた iframe を出さない」
 *   保証は描画レイヤーで担保 = 二段防御)
 * - iframe URL は registry の YOUTUBE_PROVIDER から取得
 *   - 現在ロケール (ja / en) を hl パラメータでプレイヤー UI に反映
 * - state を持たないが useTranslations / useLocale のため "use client"
 */
export function YouTubeEmbed({ embedId }: YouTubeEmbedProps) {
  const t = useTranslations("News.embed");
  const locale = useLocale();

  if (!YOUTUBE_PROVIDER.idPattern.test(embedId)) {
    return null;
  }

  return (
    <EmbedShell
      iframeUrl={YOUTUBE_PROVIDER.buildIframeUrl(embedId, { locale })}
      iframeTitle={t("youtube.iframeTitle")}
      fallbackHref={`https://www.youtube.com/watch?v=${embedId}`}
      fallbackLabel={t("fallbackLabel")}
      aspectRatio="16 / 9"
    />
  );
}
