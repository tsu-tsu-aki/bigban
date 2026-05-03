"use client";

import { useState } from "react";

interface EmbedShellProps {
  /** クリック前に表示する poster 画像 URL */
  thumbnailUrl: string;
  /** poster 画像の alt 属性 */
  thumbnailAlt: string;
  /** クリック後に iframe の src として使う URL */
  iframeUrl: string;
  /** iframe の title 属性 (a11y 必須) */
  iframeTitle: string;
  /** 再生ボタンのラベル (i18n 文言) */
  playLabel: string;
  /** JS 無効・フォールバック用の元 URL */
  fallbackHref: string;
  /** フォールバックリンクの文言 */
  fallbackLabel: string;
}

const SANDBOX = "allow-scripts allow-same-origin allow-presentation";
const REFERRER_POLICY = "strict-origin-when-cross-origin";
const ALLOW = "encrypted-media; picture-in-picture; web-share";

/**
 * SNS 埋め込みの Click-to-Load 共通骨格。
 *
 * - 初期表示: poster 画像 + 再生ボタン (3rd party リクエスト 0、CWV/プライバシー◎)
 * - クリック後: iframe を生成し動画/投稿を読み込む
 * - aspect-ratio で CLS 0
 * - sandbox / referrerpolicy / loading=lazy / allow はコンポーネント内ハードコード
 *   (運用者が触れない、CSP と合わせて多段防御)
 */
export function EmbedShell({
  thumbnailUrl,
  thumbnailAlt,
  iframeUrl,
  iframeTitle,
  playLabel,
  fallbackHref,
  fallbackLabel,
}: EmbedShellProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <figure
      data-testid="embed-shell"
      className="relative w-full my-8 overflow-hidden bg-black"
      style={{ aspectRatio: "16 / 9" }}
    >
      {loaded ? (
        <iframe
          src={iframeUrl}
          title={iframeTitle}
          sandbox={SANDBOX}
          referrerPolicy={REFERRER_POLICY}
          loading="lazy"
          allow={ALLOW}
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setLoaded(true)}
          aria-label={playLabel}
          className="group absolute inset-0 w-full h-full cursor-pointer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- 外部CDN(i.ytimg.com)のサムネを最小JSで描画。next/image にすると next.config.ts の domain 許可と LCP 計測の連携が複雑化するため意図的に <img> */}
          <img
            src={thumbnailUrl}
            alt={thumbnailAlt}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <span className="absolute inset-0 grid place-items-center bg-black/30 group-hover:bg-black/20 motion-safe:transition-colors">
            <span className="grid place-items-center w-16 h-16 rounded-full bg-white/95 text-black text-2xl shadow-lg motion-safe:transition-transform group-hover:scale-110">
              ▶
            </span>
          </span>
          <span className="sr-only">{playLabel}</span>
        </button>
      )}
      {/*
        フォールバックリンク: JS 無効環境やレンダラーの provider lookup 失敗時に
        crawler / SR にも届くよう、常に DOM に存在させる (visually-hidden)。
      */}
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
