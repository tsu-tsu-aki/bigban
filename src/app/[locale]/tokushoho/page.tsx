import { getTranslations, setRequestLocale } from "next-intl/server";
import TokushohoContent from "./TokushohoContent";

import type { Metadata } from "next";

interface TokushohoPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: TokushohoPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    title: t("tokushoho.title"),
    description: t("tokushoho.description"),
    openGraph: {
      title: t("tokushoho.title"),
      description: t("tokushoho.description"),
      locale: locale === "ja" ? "ja_JP" : "en_US",
    },
    alternates: {
      languages: {
        ja: `${siteUrl}/tokushoho`,
        en: `${siteUrl}/en/tokushoho`,
        "x-default": `${siteUrl}/tokushoho`,
      },
    },
  };
}

export default async function TokushohoPage({ params }: TokushohoPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <TokushohoContent />;
}
