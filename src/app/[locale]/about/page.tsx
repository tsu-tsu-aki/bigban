import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import StructuredData from "@/components/StructuredData";
import { isCmsNewsEnabled } from "@/config/featureFlags";
import { ABOUT_NEWS_LIMIT } from "@/constants/news";
import { SITE_URL } from "@/constants/site";
import { parseLocale } from "@/i18n/routing";
import { parseKeywords } from "@/lib/og-utils";
import { getNewsList } from "@/lib/microcms/queries";
import { buildBreadcrumb } from "@/lib/structured-data";
import type { NewsItem } from "@/lib/microcms/schema";

import AboutContent from "./AboutContent";

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const keywords = parseKeywords(t.raw("about.keywords"));
  const canonicalUrl =
    locale === "ja" ? `${SITE_URL}/about` : `${SITE_URL}/${locale}/about`;

  return {
    title: t("about.title"),
    description: t("about.description"),
    keywords,
    openGraph: {
      title: t("about.title"),
      description: t("about.description"),
      url: canonicalUrl,
      locale: locale === "ja" ? "ja_JP" : "en_US",
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        ja: `${SITE_URL}/about`,
        en: `${SITE_URL}/en/about`,
        "x-default": `${SITE_URL}/about`,
      },
    },
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale: rawLocale } = await params;
  const locale = parseLocale(rawLocale);
  if (!locale) notFound();
  setRequestLocale(locale);

  let newsItems: NewsItem[] = [];
  if (isCmsNewsEnabled()) {
    try {
      const list = await getNewsList({
        locale,
        limit: ABOUT_NEWS_LIMIT,
        offset: 0,
      });
      newsItems = list.contents;
    } catch {
      /* istanbul ignore next -- @preserve microCMS 未到達時の防御フォールバック */
      newsItems = [];
    }
  }

  return (
    <>
      <StructuredData
        data={buildBreadcrumb(locale, [{ name: "About", path: "/about" }])}
      />
      <AboutContent newsItems={newsItems} locale={locale} />
    </>
  );
}
