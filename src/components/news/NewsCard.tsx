import Image from "next/image";
import Link from "next/link";

import { NEWS_CATEGORIES } from "@/constants/news";
import type { NewsItem } from "@/lib/microcms/schema";

type Locale = "ja" | "en";

interface NewsCardProps {
  item: NewsItem;
  locale: Locale;
}

function formatDate(iso: string): { display: string; iso: string } {
  const d = new Date(iso);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return { display: `${yyyy}.${mm}.${dd}`, iso: `${yyyy}-${mm}-${dd}` };
}

function buildHref(locale: Locale, slug: string): string {
  return locale === "ja" ? `/news/${slug}` : `/en/news/${slug}`;
}

export function NewsCard({ item, locale }: NewsCardProps) {
  const cat = NEWS_CATEGORIES.find((c) => c.id === item.category[0]);
  const label = locale === "ja" ? cat?.labelJa : cat?.labelEn;
  const dateIso = item.publishedAt ?? item.createdAt;
  const date = formatDate(dateIso);

  return (
    <Link
      href={buildHref(locale, item.slug)}
      className="group block border border-text-gray/10 hover:border-accent/60 transition-colors"
    >
      <div className="relative aspect-[16/9] bg-primary overflow-hidden">
        {item.eyecatch ? (
          <Image
            src={`${item.eyecatch.url}?w=600&fm=webp&q=75`}
            alt=""
            width={600}
            height={Math.round(
              (item.eyecatch.height / item.eyecatch.width) * 600,
            )}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            data-testid="news-card-placeholder"
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, ${cat?.color ?? "#8A8A8A"}33 0%, #0A0A0A 100%)`,
            }}
          />
        )}
      </div>
      <div className="p-5 space-y-2">
        <div className="flex items-center gap-3 text-xs text-text-gray">
          {label && (
            <span
              className="inline-block px-2 py-0.5 border"
              style={{ borderColor: cat?.color, color: cat?.color }}
            >
              {label}
            </span>
          )}
          <time dateTime={date.iso}>{date.display}</time>
        </div>
        <h3 className="text-text-light text-base lg:text-lg font-bold leading-snug line-clamp-2">
          {item.title}
        </h3>
      </div>
    </Link>
  );
}
