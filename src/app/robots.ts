import { SITE_URL } from "@/constants/site";

import type { MetadataRoute } from "next";

const PRODUCTION_HOST = "www.thepicklebang.com";

export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.VERCEL_ENV === "production";

  if (!isProduction) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/teaser"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: PRODUCTION_HOST,
  };
}
