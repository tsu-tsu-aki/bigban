import { getTranslations, setRequestLocale } from "next-intl/server";
import { SITE_URL } from "@/constants/site";
import HomeIntro from "@/components/home/HomeIntro";
import HomeNavigation from "@/components/home/HomeNavigation";
import HomeHero from "@/components/home/HomeHero";
import HomeConcept from "@/components/home/HomeConcept";
import HomeFacility from "@/components/home/HomeFacility";
import HomeServices from "@/components/home/HomeServices";
import HomePricing from "@/components/home/HomePricing";
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
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const keywords = t.raw("home.keywords") as string[];
  const canonicalUrl =
    locale === "ja" ? `${SITE_URL}/` : `${SITE_URL}/${locale}`;

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
        ja: `${SITE_URL}/`,
        en: `${SITE_URL}/en`,
        "x-default": `${SITE_URL}/`,
      },
    },
  };
}

export default async function Home({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <HomeIntro>
      <main>
        <HomeNavigation />
        <HomeHero />
        <HomeConcept />
        <HomeFacility />
        <HomeServices />
        <HomePricing />
        <HomeAbout />
        <HomeAccess />
        <HomeFooter />
      </main>
    </HomeIntro>
  );
}
