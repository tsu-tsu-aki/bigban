import { SITE_URL } from "@/constants/site";
import { getNewsDetail } from "@/lib/microcms/queries";

export const runtime = "nodejs";
export const alt = "THE PICKLE BANG THEORY";
export const contentType = "image/jpeg";
export const size = { width: 1200, height: 630 };

type Locale = "ja" | "en";

interface Params {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function Image({ params }: Params): Promise<Response> {
  const { locale, slug } = await params;
  const fallback = `${SITE_URL}${locale === "en" ? "/en" : ""}/opengraph-image`;
  if (locale !== "ja" && locale !== "en") {
    return Response.redirect(fallback, 302);
  }
  const item = await getNewsDetail({ locale: locale as Locale, slug });
  if (!item?.eyecatch) {
    return Response.redirect(fallback, 302);
  }
  const url = `${item.eyecatch.url}?w=1200&h=630&fit=crop&fm=jpg`;
  return Response.redirect(url, 302);
}
