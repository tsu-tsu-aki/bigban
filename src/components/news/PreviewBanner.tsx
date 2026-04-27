type Locale = "ja" | "en";

interface PreviewBannerProps {
  locale: Locale;
}

export function PreviewBanner({ locale }: PreviewBannerProps) {
  const label = locale === "ja" ? "プレビューモード中" : "Preview mode";
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 inset-x-0 z-[var(--z-preview-banner)] bg-accent text-deep-black text-xs font-semibold tracking-wider py-2 text-center"
    >
      {label}
    </div>
  );
}
