import { getTranslations, setRequestLocale } from "next-intl/server";
import Navigation from "@/components/Navigation";
import FacilityHero from "@/components/facility/FacilityHero";
import FacilityStory from "@/components/facility/FacilityStory";
import CourtDetails from "@/components/facility/CourtDetails";
import Amenities from "@/components/facility/Amenities";
import FounderDetail from "@/components/facility/FounderDetail";
import CompanyInfo from "@/components/facility/CompanyInfo";
import Footer from "@/components/Footer";

import type { Metadata } from "next";

interface FacilityPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: FacilityPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    title: t("facility.title"),
    description: t("facility.description"),
    openGraph: {
      title: t("facility.title"),
      description: t("facility.description"),
      images: [t("og.image")],
      locale: locale === "ja" ? "ja_JP" : "en_US",
    },
    alternates: {
      languages: {
        ja: `${siteUrl}/facility`,
        en: `${siteUrl}/en/facility`,
        "x-default": `${siteUrl}/facility`,
      },
    },
  };
}

export default async function FacilityPage({ params }: FacilityPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main>
      <Navigation />
      <FacilityHero />
      <FacilityStory />
      <CourtDetails />
      <Amenities />
      <FounderDetail />
      <CompanyInfo />
      <Footer />
    </main>
  );
}
