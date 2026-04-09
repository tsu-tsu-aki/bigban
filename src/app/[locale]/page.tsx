import { getTranslations, setRequestLocale } from "next-intl/server";
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
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    title: t("home.title"),
    description: t("home.description"),
    openGraph: {
      title: t("home.title"),
      description: t("home.description"),
      images: [t("og.image")],
      locale: locale === "ja" ? "ja_JP" : "en_US",
    },
    alternates: {
      languages: {
        ja: `${siteUrl}/`,
        en: `${siteUrl}/en`,
        "x-default": `${siteUrl}/`,
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
