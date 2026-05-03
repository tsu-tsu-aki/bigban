interface EmbedShellProps {
  /** iframe の src として使う URL */
  iframeUrl: string;
  /** iframe の title 属性 (a11y 必須) */
  iframeTitle: string;
  /** JS 無効・SR 等のフォールバック用に DOM へ常時残す URL */
  fallbackHref: string;
  /** フォールバックリンクの文言 */
  fallbackLabel: string;
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
 * - aspect-ratio: 16/9 でレイアウトシフト 0 を担保
 * - sandbox / referrerpolicy / loading=lazy / allow をハードコード (運用者が触れない)
 * - loading=lazy はビューポート外の場合に読み込みを遅延させ通信量を抑える
 *   (Click-to-Load のような明示クリックは行わない)
 * - フォールバックリンクは sr-only で常時 DOM に保持 (a11y / クローラ対応)
 *
 * Server Component として動作 (state を持たない、純粋なレンダリング)。
 */
export function EmbedShell({
  iframeUrl,
  iframeTitle,
  fallbackHref,
  fallbackLabel,
}: EmbedShellProps) {
  return (
    <figure
      data-testid="embed-shell"
      className="relative w-full my-8 overflow-hidden bg-black"
      style={{ aspectRatio: "16 / 9" }}
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
