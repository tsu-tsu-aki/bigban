import { getTranslations, setRequestLocale } from "next-intl/server";
import { SITE_URL, OG_IMAGE } from "@/constants/site";
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

  return {
    title: t("facility.title"),
    description: t("facility.description"),
    openGraph: {
      title: t("facility.title"),
      description: t("facility.description"),
      images: [OG_IMAGE],
      locale: locale === "ja" ? "ja_JP" : "en_US",
    },
    alternates: {
      languages: {
        ja: `${SITE_URL}/facility`,
        en: `${SITE_URL}/en/facility`,
        "x-default": `${SITE_URL}/facility`,
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
