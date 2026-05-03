interface EmbedShellProps {
  /** iframe の src として使う URL */
  iframeUrl: string;
  /** iframe の title 属性 (a11y 必須) */
  iframeTitle: string;
  /** JS 無効・SR 等のフォールバック用に DOM へ常時残す URL */
  fallbackHref: string;
  /** フォールバックリンクの文言 */
  fallbackLabel: string;
  /**
   * CSS aspect-ratio (例: "16 / 9", "1 / 1.4")。
   * プロバイダごとに最適値が異なるため必須。CLS 対策として固定する。
   */
  aspectRatio: string;
  /**
   * 最大幅 (例: "540px")。指定時は中央寄せで配置。
   * Instagram (540px 推奨) など、幅を絞りたいプロバイダ向け。
   */
  maxWidth?: string;
}

const SANDBOX = "allow-scripts allow-same-origin allow-presentation allow-popups";
const REFERRER_POLICY = "strict-origin-when-cross-origin";
// YouTube 公式埋め込みコードの推奨値ベース。
// clipboard-write でプレイヤーの「共有 → リンクコピー」が動作する。
// accelerometer / gyroscope は 360 度動画 (VR) で使われる。
// autoplay は将来 autoplay=1 を URL に付けた時のために許可。
const ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

/**
 * SNS 埋め込みの共通骨格 (ページ表示と同時に iframe 読み込み開始)。
 *
 * - aspect-ratio はプロバイダごとに props で指定 (CLS 対策必須)
 * - maxWidth はプロバイダごとに props で指定 (Instagram 540px 等)
 * - sandbox / referrerpolicy / loading=lazy / allow をハードコード (運用者が触れない)
 * - loading=lazy はビューポート外の場合に読み込みを遅延させ通信量を抑える
 * - フォールバックリンクは sr-only で常時 DOM に保持 (a11y / クローラ対応)
 *
 * Server Component として動作 (state を持たない、純粋なレンダリング)。
 */
export function EmbedShell({
  iframeUrl,
  iframeTitle,
  fallbackHref,
  fallbackLabel,
  aspectRatio,
  maxWidth,
}: EmbedShellProps) {
  return (
    <figure
      data-testid="embed-shell"
      className="relative w-full my-8 overflow-hidden bg-black mx-auto"
      style={{ aspectRatio, maxWidth }}
    >
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
      {/*
        フォールバックリンク: SR / クローラ / iframe 描画失敗時用に
        常に DOM に存在させる (visually-hidden)。
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
