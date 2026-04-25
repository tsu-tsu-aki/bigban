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
}

const PROSE_CLASS = "prose prose-invert max-w-none";

// All HTML rendered via dangerouslySetInnerHTML below is run through
// sanitizeNewsHtml (DOMPurify) with STRICT_HTML_CONFIG or RICH_EDITOR_CONFIG.
// Untrusted CMS content is XSS-safe after sanitization (see lib/news/sanitize.ts).

export function NewsBodyRenderer({
  displayMode,
  bodyHtml,
  body,
  isFirstImageLcp = false,
}: NewsBodyRendererProps) {
  if (displayMode === "html") {
    if (bodyHtml.trim().length > 0) {
      const safeHtml = sanitizeNewsHtml(bodyHtml, STRICT_HTML_CONFIG, {
        isFirstImageLcp,
      });
      return (
        <div
          data-testid="news-body"
          className={PROSE_CLASS}
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      );
    }
    if (body.trim().length > 0) {
      console.warn(
        "[NewsBodyRenderer] displayMode=html だが bodyHtml が空のため body (rich) にフォールバック",
      );
      const safeHtml = sanitizeNewsHtml(body, RICH_EDITOR_CONFIG, {
        isFirstImageLcp,
      });
      return (
        <div
          data-testid="news-body"
          className={PROSE_CLASS}
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      );
    }
    return (
      <div
        data-testid="news-body-empty"
        className={PROSE_CLASS}
        role="status"
      >
        本文がありません。
      </div>
    );
  }

  if (body.trim().length > 0) {
    const safeHtml = sanitizeNewsHtml(body, RICH_EDITOR_CONFIG, {
      isFirstImageLcp,
    });
    return (
      <div
        data-testid="news-body"
        className={PROSE_CLASS}
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    );
  }
  if (bodyHtml.trim().length > 0) {
    const safeHtml = sanitizeNewsHtml(bodyHtml, STRICT_HTML_CONFIG, {
      isFirstImageLcp,
    });
    return (
      <div
        data-testid="news-body"
        className={PROSE_CLASS}
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    );
  }
  return (
    <div data-testid="news-body-empty" className={PROSE_CLASS} role="status">
      本文がありません。
    </div>
  );
}
