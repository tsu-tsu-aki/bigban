"use client";

import { useLocale } from "next-intl";

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function NewsError({ reset }: ErrorProps) {
  const locale = useLocale();
  const isJa = locale === "ja";
  const message = isJa
    ? "ニュースの読み込みに失敗しました。"
    : "Failed to load news.";
  const retryLabel = isJa ? "再試行" : "Retry";
  return (
    <section className="min-h-screen bg-primary text-text-light flex items-center justify-center">
      <div className="text-center space-y-6">
        <p>{message}</p>
        <button
          type="button"
          onClick={reset}
          className="px-8 py-3 border border-accent text-accent text-sm tracking-wider"
        >
          {retryLabel}
        </button>
      </div>
    </section>
  );
}
