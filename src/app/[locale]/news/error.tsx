"use client";

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function NewsError({ reset }: ErrorProps) {
  return (
    <section className="min-h-screen bg-primary text-text-light flex items-center justify-center">
      <div className="text-center space-y-6">
        <p>ニュースの読み込みに失敗しました。</p>
        <button
          type="button"
          onClick={reset}
          className="px-8 py-3 border border-accent text-accent text-sm tracking-wider"
        >
          再試行
        </button>
      </div>
    </section>
  );
}
