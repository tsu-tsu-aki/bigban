import type { MetadataRoute } from "next";

import { SITEMAP_ROUTES } from "@/constants/routes";
import { SITE_URL } from "@/constants/site";
import { getNewsSlugs } from "@/lib/microcms/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = SITEMAP_ROUTES.map(
    ({ path, priority, changeFrequency }) => {
      const jaPath = path === "/" ? "" : path;
      const enPath = path === "/" ? "/en" : `/en${path}`;
      const jaUrl = `${SITE_URL}${jaPath}`;
      const enUrl = `${SITE_URL}${enPath}`;
      return {
        url: jaUrl,
        changeFrequency,
        priority,
        alternates: {
          languages: {
            ja: jaUrl,
            en: enUrl,
            "x-default": jaUrl,
          },
        },
      };
    },
  );

  const newsIndex: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/news`,
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: {
        languages: {
          ja: `${SITE_URL}/news`,
          en: `${SITE_URL}/en/news`,
          "x-default": `${SITE_URL}/news`,
        },
      },
    },
  ];

  const slugs = await getNewsSlugs();
  const newsDetails: MetadataRoute.Sitemap = slugs.map(
    ({ locale, slug }) => ({
      url:
        locale === "ja"
          ? `${SITE_URL}/news/${slug}`
          : `${SITE_URL}/en/news/${slug}`,
      changeFrequency: "monthly",
      priority: 0.6,
    }),
  );

  return [...staticEntries, ...newsIndex, ...newsDetails];
}
