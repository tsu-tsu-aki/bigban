import { getTranslations, setRequestLocale } from "next-intl/server";
import { SITE_URL } from "@/constants/site";
import AboutContent from "./AboutContent";
import StructuredData from "@/components/StructuredData";
import { buildBreadcrumb } from "@/lib/structured-data";

import type { Metadata } from "next";

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const keywords = t.raw("about.keywords") as string[];
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
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <StructuredData
        data={buildBreadcrumb(locale, [{ name: "About", path: "/about" }])}
      />
      <AboutContent />
    </>
  );
}
