import { getTranslations, setRequestLocale } from "next-intl/server";
import { SITE_URL } from "@/constants/site";
import TokushohoContent from "./TokushohoContent";
import StructuredData from "@/components/StructuredData";
import { buildBreadcrumb } from "@/lib/structured-data";

import type { Metadata } from "next";

interface TokushohoPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: TokushohoPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

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
        ja: `${SITE_URL}/tokushoho`,
        en: `${SITE_URL}/en/tokushoho`,
        "x-default": `${SITE_URL}/tokushoho`,
      },
    },
  };
}

export default async function TokushohoPage({ params }: TokushohoPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <StructuredData
        data={buildBreadcrumb(locale, [
          { name: "特定商取引法に基づく表記", path: "/tokushoho" },
        ])}
      />
      <TokushohoContent />
    </>
  );
}
