"use client";

import { useEffect, useState } from "react";

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

const TRUSTED_ORIGIN = "https://www.instagram.com";
// 投稿の中身が postMessage で届くまでの初期高さ。Instagram が送ってきた
// 実測値で上書きされるため一時的な値で OK だが、極端に小さいと CLS が出る
// ため標準的な投稿の高さに合わせて 600px とする。
const INITIAL_HEIGHT = 600;

/**
 * Instagram から送られてくる postMessage の型 (旧来の形式)。
 * { type: "MEASURE", details: { height: number } }
 * 仕様未公開のため複数形式を防御的にパースする。
 */
function extractHeightFromMessage(data: unknown): number | null {
  if (typeof data === "string") {
    try {
      return extractHeightFromMessage(JSON.parse(data));
    } catch {
      return null;
    }
  }
  if (typeof data !== "object" || data === null) return null;
  const obj = data as Record<string, unknown>;
  // 形式 1: { type: "MEASURE", details: { height: N } }
  if (obj.type === "MEASURE" && typeof obj.details === "object" && obj.details !== null) {
    const h = (obj.details as Record<string, unknown>).height;
    if (typeof h === "number" && h > 0) return h;
  }
  // 形式 2: { height: N }
  if (typeof obj.height === "number" && obj.height > 0) return obj.height;
  return null;
}

/**
 * Instagram 埋め込みコンポーネント (動的高さ調整あり)。
 *
 * - id 検証 (1〜15 文字、英数字 + - _) を行い、不正なら何も描画しない
 * - 投稿タイプ (post / reel / IGTV) はすべて /p/{id}/embed で処理可能
 *   (Instagram が内部リダイレクト)
 * - 540px 上限の中央寄せ
 * - 高さは Instagram からの postMessage で自動調整 (投稿の長さに応じて変動)
 *   届く前の初期高さは 600px (CLS 抑制のため)
 */
export function InstagramEmbed({ embedId }: InstagramEmbedProps) {
  const t = useTranslations("News.embed");
  const [height, setHeight] = useState<number>(INITIAL_HEIGHT);

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.origin !== TRUSTED_ORIGIN) return;
      const h = extractHeightFromMessage(e.data);
      if (h !== null) {
        setHeight(h);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  if (!INSTAGRAM_PROVIDER.idPattern.test(embedId)) {
    return null;
  }

  const iframeUrl = INSTAGRAM_PROVIDER.buildIframeUrl(embedId);
  const iframeTitle = t("instagram.iframeTitle");
  const fallbackHref = `https://www.instagram.com/p/${embedId}/`;
  const fallbackLabel = t("fallbackLabel");

  return (
    <figure
      data-testid="embed-shell"
      className="relative w-full my-8 mx-auto bg-black"
      style={{ maxWidth: "540px" }}
    >
      <iframe
        src={iframeUrl}
        title={iframeTitle}
        sandbox={SANDBOX}
        referrerPolicy={REFERRER_POLICY}
        loading="lazy"
        allow={ALLOW}
        allowFullScreen
        className="w-full border-0 block"
        style={{ height: `${height}px` }}
      />
      <a
        data-testid="embed-fallback-link"
        href={fallbackHref}
        target="_blank"
        rel="noopener noreferrer"
        className="sr-only"
      >
        {fallbackLabel}
      </a>
    </figure>
  );
}
