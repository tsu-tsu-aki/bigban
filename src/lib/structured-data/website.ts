import { SITE_URL } from "@/constants/site";

export interface WebSiteSchema {
  "@context": "https://schema.org";
  "@type": "WebSite";
  "@id": string;
  url: string;
  name: string;
  alternateName: string[];
  inLanguage: string[];
  publisher: { "@id": string };
}

export function buildWebSite(): WebSiteSchema {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "THE PICKLE BANG THEORY",
    alternateName: [
      "ザ ピックルバン セオリー",
      "ピックルバンセオリー",
    ],
    inLanguage: ["ja-JP", "en-US"],
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}
