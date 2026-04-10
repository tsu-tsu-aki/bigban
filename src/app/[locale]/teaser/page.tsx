import { getTranslations } from "next-intl/server";

import { SITE_URL, OG_IMAGE } from "@/constants/site";

import TeaserPage from "./TeaserPage";

import type { Metadata } from "next";

interface TeaserPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: TeaserPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("home.title"),
    description: t("home.description"),
    openGraph: {
      title: t("home.title"),
      description: t("home.description"),
      images: [OG_IMAGE],
      locale: locale === "ja" ? "ja_JP" : "en_US",
    },
    alternates: {
      languages: {
        ja: `${SITE_URL}/`,
        en: `${SITE_URL}/en`,
        "x-default": `${SITE_URL}/`,
      },
    },
  };
}

export default function Page() {
  return <TeaserPage />;
}
