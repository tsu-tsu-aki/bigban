import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { SITE_URL } from "@/constants/site";
import { parseLocale } from "@/i18n/routing";
import { parseKeywords } from "@/lib/og-utils";
import StructuredData from "@/components/StructuredData";
import { buildServices } from "@/lib/structured-data";
import HomeIntro from "@/components/home/HomeIntro";
import HomeNavigation from "@/components/home/HomeNavigation";
import HomeHero from "@/components/home/HomeHero";
import HomeConcept from "@/components/home/HomeConcept";
import HomeFacility from "@/components/home/HomeFacility";
import HomeServices from "@/components/home/HomeServices";
import HomePricing from "@/components/home/HomePricing";
import HomeNews from "@/components/home/HomeNews";
import HomeAbout from "@/components/home/HomeAbout";
import HomeAccess from "@/components/home/HomeAccess";
import HomeFooter from "@/components/home/HomeFooter";

import type { Metadata } from "next";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = parseLocale(rawLocale);
  if (!locale) return {};
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const keywords = parseKeywords(t.raw("home.keywords"));
  const canonicalUrl =
    locale === "ja" ? SITE_URL : `${SITE_URL}/${locale}`;

  return {
    title: t("home.title"),
    description: t("home.description"),
    keywords,
    openGraph: {
      title: t("home.title"),
      description: t("home.description"),
      url: canonicalUrl,
      locale: locale === "ja" ? "ja_JP" : "en_US",
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        ja: SITE_URL,
        en: `${SITE_URL}/en`,
        "x-default": SITE_URL,
      },
    },
  };
}

export default async function Home({ params }: HomePageProps) {
  const { locale: rawLocale } = await params;
  const locale = parseLocale(rawLocale);
  if (!locale) notFound();
  setRequestLocale(locale);

  return (
    <HomeIntro>
      <StructuredData data={buildServices()} />
      <main>
        <HomeNavigation />
        <HomeHero />
        <HomeConcept />
        <HomeFacility />
        <HomeServices />
        <HomePricing />
        <HomeNews locale={locale} />
        <HomeAbout />
        <HomeAccess />
        <HomeFooter />
      </main>
    </HomeIntro>
  );
}
