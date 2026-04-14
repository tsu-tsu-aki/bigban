import { SITE_URL, RESERVE_URL } from "@/constants/site";

export interface SportsActivityLocationSchema {
  "@context": "https://schema.org";
  "@type": "SportsActivityLocation";
  "@id": string;
  name: string;
  url: string;
  logo: string;
  image: string;
  sport: string;
  address: {
    "@type": "PostalAddress";
    addressCountry: string;
    postalCode: string;
    addressRegion: string;
    addressLocality: string;
    streetAddress: string;
  };
  geo: {
    "@type": "GeoCoordinates";
    latitude: number;
    longitude: number;
  };
  telephone: string;
  email: string;
  priceRange: string;
  openingHoursSpecification: Array<{
    "@type": "OpeningHoursSpecification";
    dayOfWeek: string[];
    opens: string;
    closes: string;
  }>;
  sameAs: string[];
  parentOrganization: { "@id": string };
  potentialAction: {
    "@type": "ReserveAction";
    target: string;
  };
}

export function buildSportsActivityLocation(
  _locale: string
): SportsActivityLocationSchema {
  return {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    "@id": `${SITE_URL}/#facility`,
    name: "THE PICKLE BANG THEORY",
    url: SITE_URL,
    logo: `${SITE_URL}/logos/yoko-neon.png`,
    image: `${SITE_URL}/images/facility-interior-01.png`,
    sport: "Pickleball",
    address: {
      "@type": "PostalAddress",
      addressCountry: "JP",
      postalCode: "272-0021",
      addressRegion: "千葉県",
      addressLocality: "市川市",
      streetAddress: "八幡2-16-6 6階",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 35.7239695,
      longitude: 139.9317222,
    },
    telephone: "+81-90-5523-3879",
    email: "hello@rstagency.com",
    priceRange: "¥4980-¥7980",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "06:00",
        closes: "23:00",
      },
    ],
    sameAs: ["https://www.instagram.com/thepicklebangtheory"],
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "ReserveAction",
      target: RESERVE_URL,
    },
  };
}
