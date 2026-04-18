import { SITE_URL } from "@/constants/site";

export interface OrganizationSchema {
  "@context": "https://schema.org";
  "@type": "Organization";
  "@id": string;
  name: string;
  url: string;
  founder: { "@type": "Person"; name: string };
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
    url: "https://rstagency.com",
    founder: {
      "@type": "Person",
      name: "西村昭彦",
    },
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
