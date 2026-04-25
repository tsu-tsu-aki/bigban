type Locale = "ja" | "en";

interface PreviewBannerProps {
  locale: Locale;
}

export function PreviewBanner({ locale }: PreviewBannerProps) {
  const label = locale === "ja" ? "プレビューモード中" : "Preview mode";
  const linkLabel = locale === "ja" ? "終了" : "Exit";
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 inset-x-0 z-50 bg-accent text-primary text-xs tracking-wider py-2 text-center"
    >
      {label}
      {/* Route Handler への遷移は full reload が必須 (Cookie 削除+サーバー処理) */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/api/draft/disable" className="ml-4 underline">
        {linkLabel}
      </a>
    </div>
  );
}
