import { getTranslations, setRequestLocale } from "next-intl/server";
import { SITE_URL, OG_IMAGE } from "@/constants/site";
import Navigation from "@/components/Navigation";
import ServicesHero from "@/components/services/ServicesHero";
import ServicesList from "@/components/services/ServicesList";
import BottomCTA from "@/components/services/BottomCTA";
import Footer from "@/components/Footer";

import type { Metadata } from "next";

interface ServicesPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ServicesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("services.title"),
    description: t("services.description"),
    openGraph: {
      title: t("services.title"),
      description: t("services.description"),
      images: [OG_IMAGE],
      locale: locale === "ja" ? "ja_JP" : "en_US",
    },
    alternates: {
      languages: {
        ja: `${SITE_URL}/services`,
        en: `${SITE_URL}/en/services`,
        "x-default": `${SITE_URL}/services`,
      },
    },
  };
}

export default async function ServicesPage({ params }: ServicesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main>
      <Navigation />
      <ServicesHero />
      <ServicesList />
      <BottomCTA />
      <Footer />
    </main>
  );
}
