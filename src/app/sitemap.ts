import { SITE_URL } from "@/constants/site";
import { SITEMAP_ROUTES } from "@/constants/routes";

import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return SITEMAP_ROUTES.map(({ path, priority, changeFrequency }) => {
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
  });
}
