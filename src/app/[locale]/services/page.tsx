import { getTranslations, setRequestLocale } from "next-intl/server";
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
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    title: t("services.title"),
    description: t("services.description"),
    openGraph: {
      title: t("services.title"),
      description: t("services.description"),
      images: [t("og.image")],
      locale: locale === "ja" ? "ja_JP" : "en_US",
    },
    alternates: {
      languages: {
        ja: `${siteUrl}/services`,
        en: `${siteUrl}/en/services`,
        "x-default": `${siteUrl}/services`,
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
