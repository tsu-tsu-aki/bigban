import { getTranslations, setRequestLocale } from "next-intl/server";
import AboutContent from "./AboutContent";

import type { Metadata } from "next";

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    title: t("about.title"),
    description: t("about.description"),
    openGraph: {
      title: t("about.title"),
      description: t("about.description"),
      images: [t("og.image")],
      locale: locale === "ja" ? "ja_JP" : "en_US",
    },
    alternates: {
      languages: {
        ja: `${siteUrl}/about`,
        en: `${siteUrl}/en/about`,
        "x-default": `${siteUrl}/about`,
      },
    },
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AboutContent />;
}
