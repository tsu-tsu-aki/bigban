import type { Locale } from "@/i18n/routing";
import {
  RICH_EDITOR_CONFIG,
  STRICT_HTML_CONFIG,
  sanitizeNewsHtml,
} from "@/lib/news/sanitize";
import type { NewsItem } from "@/lib/microcms/schema";

interface NewsBodyRendererProps {
  displayMode: NewsItem["displayMode"];
  bodyHtml: string;
  body: string;
  isFirstImageLcp?: boolean;
  locale?: Locale;
}

const PROSE_CLASS = [
  "prose prose-invert max-w-none",
  "prose-headings:text-text-light prose-headings:font-bold",
  "prose-h2:text-xl lg:prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4",
  "prose-h3:text-base lg:prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3",
  "prose-p:text-text-light prose-p:text-base lg:prose-p:text-lg prose-p:leading-relaxed",
  "prose-a:text-accent prose-a:underline prose-a:decoration-accent/40 prose-a:underline-offset-4",
  "prose-a:hover:decoration-accent",
  "prose-a:focus-visible:outline prose-a:focus-visible:outline-2 prose-a:focus-visible:outline-accent prose-a:focus-visible:outline-offset-2",
  "prose-strong:text-text-light prose-strong:font-semibold",
  "prose-blockquote:border-l-2 prose-blockquote:border-accent/40 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-text-light/85",
  "prose-ul:my-6 prose-ol:my-6 prose-li:my-2 prose-li:marker:text-accent",
  // 画像: 自然サイズ + コンテナ幅まで縮小、中央寄せ、シャープエッジ
  "prose-img:rounded-none prose-img:max-w-full prose-img:h-auto prose-img:block prose-img:mx-auto prose-img:my-8",
  "prose-figure:my-12 prose-figure:text-center",
  "prose-figcaption:text-sm prose-figcaption:text-text-gray prose-figcaption:tracking-wide prose-figcaption:mt-3 prose-figcaption:italic",
  "prose-hr:border-text-gray/20 prose-hr:my-12",
].join(" ");

// All HTML rendered via dangerouslySetInnerHTML below is run through
// sanitizeNewsHtml (DOMPurify) with STRICT_HTML_CONFIG or RICH_EDITOR_CONFIG.
// Untrusted CMS content is XSS-safe after sanitization (see lib/news/sanitize.ts).

/**
 * <table> をスクロール可能なラッパーで包む (a11y + モバイル対応)。
 * - role="region" + aria-label: スクリーンリーダ向けのランドマーク
 * - tabindex="0": キーボード矢印キーでスクロール可能
 */
function wrapTablesForScroll(html: string): string {
  return html
    .replace(
      /<table([^>]*)>/g,
      (_match, attrs: string) =>
        `<figure class="news-table-scroll" role="region" tabindex="0" aria-label="表"><table${attrs}>`,
    )
    .replace(/<\/table>/g, "</table></figure>");
}

/**
 * microCMS 画像 (images.microcms-assets.io) の src に画像 API パラメータを
 * 自動付与し、WebP + 最大幅 1200px に最適化する。
 * 既にクエリパラメータ付きの URL は二重付与しない。
 *
 * 例:
 *   <img src="https://images.microcms-assets.io/foo.jpg" />
 *   → <img src="https://images.microcms-assets.io/foo.jpg?w=1200&fm=webp&q=80" />
 */
function optimizeMicrocmsImages(html: string): string {
  return html.replace(
    /(<img[^>]*\ssrc=")(https:\/\/images\.microcms-assets\.io\/[^"?]+)(")/g,
    (_match, before: string, src: string, after: string) =>
      `${before}${src}?w=1200&fm=webp&q=80${after}`,
  );
}

function renderBody(safeHtml: string) {
  const processed = optimizeMicrocmsImages(wrapTablesForScroll(safeHtml));
  return (
    <div
      data-testid="news-body"
      className={PROSE_CLASS}
      dangerouslySetInnerHTML={{ __html: processed }}
    />
  );
}

function renderEmpty(locale: Locale) {
  const message =
    locale === "en" ? "No content available." : "本文がありません。";
  return (
    <div data-testid="news-body-empty" className={PROSE_CLASS} role="status">
      {message}
    </div>
  );
}

export function NewsBodyRenderer({
  displayMode,
  bodyHtml,
  body,
  isFirstImageLcp = false,
  locale = "ja",
}: NewsBodyRendererProps) {
  if (displayMode === "html") {
    if (bodyHtml.trim().length > 0) {
      return renderBody(
        sanitizeNewsHtml(bodyHtml, STRICT_HTML_CONFIG, { isFirstImageLcp }),
      );
    }
    if (body.trim().length > 0) {
      console.warn(
        "[NewsBodyRenderer] displayMode=html だが bodyHtml が空のため body (rich) にフォールバック",
      );
      return renderBody(
        sanitizeNewsHtml(body, RICH_EDITOR_CONFIG, { isFirstImageLcp }),
      );
    }
    return renderEmpty(locale);
  }

  if (body.trim().length > 0) {
    return renderBody(
      sanitizeNewsHtml(body, RICH_EDITOR_CONFIG, { isFirstImageLcp }),
    );
  }
  if (bodyHtml.trim().length > 0) {
    return renderBody(
      sanitizeNewsHtml(bodyHtml, STRICT_HTML_CONFIG, { isFirstImageLcp }),
    );
  }
  return renderEmpty(locale);
}
