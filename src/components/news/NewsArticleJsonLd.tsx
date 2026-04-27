import { SITE_URL } from "@/constants/site";
import type { NewsItem } from "@/lib/microcms/schema";

type Locale = "ja" | "en";

interface NewsArticleJsonLdProps {
  item: NewsItem;
  locale: Locale;
}

/**
 * Renders schema.org NewsArticle JSON-LD.
 *
 * The script tag content is produced via JSON.stringify(), which escapes all
 * characters that would otherwise close the script (e.g. quotes, backslashes).
 * For defense-in-depth we additionally replace `<` with `\u003c` to neutralize
 * `</script>` injection. No user-supplied raw HTML is rendered — all data is
 * structured fields parsed via Zod (newsItemSchema).
 */
export function NewsArticleJsonLd({ item, locale }: NewsArticleJsonLdProps) {
  const url = `${SITE_URL}${locale === "ja" ? "" : "/en"}/news/${item.slug}`;
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: item.title,
    description: item.excerpt,
    datePublished: item.publishedAt ?? item.createdAt,
    dateModified: item.updatedAt,
    inLanguage: locale,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    publisher: {
      "@type": "Organization",
      name: "THE PICKLE BANG THEORY",
    },
  };
  if (item.eyecatch) {
    data.image = `${item.eyecatch.url}?w=1200&fm=jpg`;
  }
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
