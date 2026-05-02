import { SITE_URL } from "@/constants/site";
import { parseLocale } from "@/i18n/routing";
import { getNewsDetail } from "@/lib/microcms/queries";

export const runtime = "nodejs";
export const alt = "THE PICKLE BANG THEORY";
export const contentType = "image/jpeg";
export const size = { width: 1200, height: 630 };

interface Params {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function Image({ params }: Params): Promise<Response> {
  const { locale: rawLocale, slug } = await params;
  const fallback = `${SITE_URL}${rawLocale === "en" ? "/en" : ""}/opengraph-image`;
  const locale = parseLocale(rawLocale);
  /* istanbul ignore next -- @preserve middleware で routing 制限済みのため到達不可 (defensive) */
  if (!locale) {
    return Response.redirect(fallback, 302);
  }
  const item = await getNewsDetail({ locale, slug });
  if (!item?.eyecatch) {
    return Response.redirect(fallback, 302);
  }
  const url = `${item.eyecatch.url}?w=1200&h=630&fit=crop&fm=jpg`;
  return Response.redirect(url, 302);
}
