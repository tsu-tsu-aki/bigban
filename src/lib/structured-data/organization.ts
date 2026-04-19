import { SITE_URL } from "@/constants/site";

export interface OrganizationSchema {
  "@context": "https://schema.org";
  "@type": "Organization";
  "@id": string;
  name: string;
  alternateName: string[];
  url: string;
  founder: { "@id": string };
  member: Array<{ "@id": string }>;
  address: {
    "@type": "PostalAddress";
    addressCountry: string;
    addressRegion: string;
    addressLocality: string;
    streetAddress: string;
  };
  knowsAbout: string[];
  areaServed: {
    "@type": "Country";
    name: string;
  };
  sameAs: string[];
}

export function buildOrganization(): OrganizationSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "RST Agency株式会社",
    alternateName: [
      "RST Agency",
      "Racket Sports Tokyo",
      "アール・エス・ティ・エージェンシー",
    ],
    url: "https://rstagency.com",
    founder: { "@id": `${SITE_URL}/#person-nishimura` },
    member: [
      { "@id": `${SITE_URL}/#person-nishimura` },
      { "@id": `${SITE_URL}/#person-yoshida` },
    ],
    address: {
      "@type": "PostalAddress",
      addressCountry: "JP",
      addressRegion: "東京都",
      addressLocality: "品川区",
      streetAddress: "二葉1-4-2",
    },
    knowsAbout: [
      "Pickleball",
      "Crossminton",
      "スポーツ施設運営",
      "スポーツイベント企画",
    ],
    areaServed: {
      "@type": "Country",
      name: "Japan",
    },
    sameAs: ["https://rstagency.com"],
  };
}
