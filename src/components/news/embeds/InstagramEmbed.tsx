"use client";

import { useTranslations } from "next-intl";

import { INSTAGRAM_PROVIDER } from "@/lib/news/embeds/instagram";

interface InstagramEmbedProps {
  embedId: string;
}

const SANDBOX =
  "allow-scripts allow-same-origin allow-presentation allow-popups";
const REFERRER_POLICY = "strict-origin-when-cross-origin";
const ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

// Instagram 投稿の中央値的サイズに合わせた固定高さ。
// postMessage による動的リサイズは行わない (CLS / カクつき防止)。
// 短い投稿は下部に余白が出る (黒背景でブランドのダーク基調と整合)。
// 長い投稿は iframe 内部で縦スクロール (Instagram 標準挙動)。
const EMBED_HEIGHT_PX = 700;
const MAX_WIDTH = "540px";

/**
 * Instagram 埋め込みコンポーネント (固定高さ表示)。
 *
 * - id 検証 (1〜15 文字、英数字 + - _) を行い、不正なら何も描画しない
 * - 投稿タイプ (post / reel / IGTV) はすべて /p/{id}/embed で処理可能
 *   (Instagram が内部リダイレクト)
 * - 540px 上限の中央寄せ、高さ 700px 固定
 * - レイアウトシフト 0、カクつき発生なし
 */
export function InstagramEmbed({ embedId }: InstagramEmbedProps) {
  const t = useTranslations("News.embed");

  if (!INSTAGRAM_PROVIDER.idPattern.test(embedId)) {
    return null;
  }

  return (
    <figure
      data-testid="embed-shell"
      className="relative w-full my-8 mx-auto bg-black"
      style={{ maxWidth: MAX_WIDTH, height: `${EMBED_HEIGHT_PX}px` }}
    >
      <iframe
        src={INSTAGRAM_PROVIDER.buildIframeUrl(embedId)}
        title={t("instagram.iframeTitle")}
        sandbox={SANDBOX}
        referrerPolicy={REFERRER_POLICY}
        loading="lazy"
        allow={ALLOW}
        allowFullScreen
        className="w-full h-full border-0 block"
      />
      <a
        data-testid="embed-fallback-link"
        href={`https://www.instagram.com/p/${embedId}/`}
        target="_blank"
        rel="noopener noreferrer"
        className="sr-only"
      >
        {t("fallbackLabel")}
      </a>
    </figure>
  );
}
