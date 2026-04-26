type Locale = "ja" | "en";

interface PreviewBannerProps {
  locale: Locale;
  /**
   * 「終了」リンクの遷移先。通常は同じ詳細ページの公開版 URL
   * (例: `/news/grand-opening-campaign`) を渡す。URL から ?draftKey= 等を
   * 落とすことでプレビュー状態が解除される。
   */
  exitHref: string;
}

export function PreviewBanner({ locale, exitHref }: PreviewBannerProps) {
  const label = locale === "ja" ? "プレビューモード中" : "Preview mode";
  const linkLabel = locale === "ja" ? "終了" : "Exit";
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 inset-x-0 z-50 bg-accent text-primary text-xs tracking-wider py-2 text-center"
    >
      {label}
      <a href={exitHref} className="ml-4 underline">
        {linkLabel}
      </a>
    </div>
  );
}
