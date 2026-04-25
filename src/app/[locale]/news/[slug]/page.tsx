import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import { NewsArticleJsonLd } from "@/components/news/NewsArticleJsonLd";
import { NewsBodyRenderer } from "@/components/news/NewsBodyRenderer";
import { NewsLanguageSwitcher } from "@/components/news/NewsLanguageSwitcher";
import { PreviewBanner } from "@/components/news/PreviewBanner";
import { isCmsNewsEnabled } from "@/config/featureFlags";
import { NEWS_CATEGORIES } from "@/constants/news";
import { EXTERNAL_LINK_PROPS, SITE_URL } from "@/constants/site";
import { routing } from "@/i18n/routing";
import { getNewsDetail, getNewsSlugs } from "@/lib/microcms/queries";

type Locale = "ja" | "en";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

function buildNewsUrl(locale: Locale, slug: string): string {
  return locale === "ja"
    ? `${SITE_URL}/news/${slug}`
    : `${SITE_URL}/en/news/${slug}`;
}

export async function generateStaticParams() {
  try {
    return await getNewsSlugs();
  } catch {
    // microCMS 未設定/未到達時はビルド時の事前生成を空にする
    // (ランタイム fetch で 404 を返す)
    return [];
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const item = await getNewsDetail({ locale: locale as Locale, slug });
  if (!item) return {};

  const draft = await draftMode();
  const otherLocale: Locale = locale === "ja" ? "en" : "ja";
  const other = await getNewsDetail({ locale: otherLocale, slug });

  const meta: Metadata = {
    title: `${item.title} | THE PICKLE BANG THEORY`,
    description: item.excerpt,
  };

  if (draft.isEnabled) {
    meta.robots = { index: false, follow: false };
  }

  if (other) {
    meta.alternates = {
      languages: {
        ja: buildNewsUrl("ja", slug),
        en: buildNewsUrl("en", slug),
      },
    };
  }

  return meta;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, "0")}.${String(d.getUTCDate()).padStart(2, "0")}`;
}

export default async function NewsDetailPage({ params }: PageProps) {
  if (!isCmsNewsEnabled()) notFound();

  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const item = await getNewsDetail({ locale: locale as Locale, slug });
  if (!item) notFound();

  const draft = await draftMode();
  const otherLocale: Locale = locale === "ja" ? "en" : "ja";
  const other = await getNewsDetail({ locale: otherLocale, slug });
  const hasOtherLocale = other !== null;

  const cat = NEWS_CATEGORIES.find((c) => c.id === item.category[0]);
  const backHref = locale === "ja" ? "/news" : "/en/news";
  const backLabel =
    locale === "ja" ? "← ニュース一覧へ" : "← News index";

  return (
    <article className="min-h-screen bg-primary text-text-light py-16 lg:py-24">
      {draft.isEnabled && <PreviewBanner locale={locale as Locale} />}
      <NewsArticleJsonLd item={item} locale={locale as Locale} />
      <div className="mx-auto max-w-3xl px-6 lg:px-12">
        <div className="flex items-center justify-between gap-4">
          <Link
            href={backHref}
            className="text-xs tracking-wider text-text-gray hover:text-accent transition-colors"
          >
            {backLabel}
          </Link>
          <NewsLanguageSwitcher
            slug={slug}
            currentLocale={locale as Locale}
            hasOtherLocale={hasOtherLocale}
          />
        </div>
        <div className="mt-6 flex items-center gap-3 text-xs">
          {cat && (
            <span
              className="inline-block px-2 py-0.5 border"
              style={{ borderColor: cat.color, color: cat.color }}
            >
              {locale === "ja" ? cat.labelJa : cat.labelEn}
            </span>
          )}
          <time dateTime={(item.publishedAt ?? item.createdAt).slice(0, 10)}>
            {formatDate(item.publishedAt ?? item.createdAt)}
          </time>
        </div>
        <h1 className="mt-4 text-2xl lg:text-4xl font-bold leading-tight">
          {item.title}
        </h1>
        {item.eyecatch && (
          <div className="mt-8">
            <Image
              src={`${item.eyecatch.url}?w=1200&fm=webp&q=80`}
              alt=""
              width={1200}
              height={Math.round(
                (item.eyecatch.height / item.eyecatch.width) * 1200,
              )}
              className="w-full h-auto"
              priority
            />
          </div>
        )}
        <div className="mt-10">
          <NewsBodyRenderer
            displayMode={item.displayMode}
            bodyHtml={item.bodyHtml}
            body={item.body}
            isFirstImageLcp={!item.eyecatch}
          />
        </div>
        {item.externalLink && (
          <div className="mt-10">
            <a
              href={item.externalLink.url}
              {...EXTERNAL_LINK_PROPS}
              className="inline-flex items-center gap-2 px-6 py-3 border border-accent text-accent text-sm tracking-wider hover:bg-accent hover:text-primary transition-colors"
            >
              {item.externalLink.label}
              <span>→</span>
            </a>
          </div>
        )}
      </div>
    </article>
  );
}
