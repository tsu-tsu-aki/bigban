import { SITE_URL } from "@/constants/site";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface BreadcrumbListItem {
  "@type": "ListItem";
  position: number;
  name: string;
  item: string;
}

export interface BreadcrumbListSchema {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: BreadcrumbListItem[];
}

function localizedPath(locale: string, path: string): string {
  if (locale === "ja") {
    return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
  }
  return path === "/" ? `${SITE_URL}/en` : `${SITE_URL}/en${path}`;
}

export function buildBreadcrumb(
  locale: string,
  items: readonly BreadcrumbItem[]
): BreadcrumbListSchema {
  const homeName = locale === "ja" ? "ホーム" : "Home";

  const home: BreadcrumbListItem = {
    "@type": "ListItem",
    position: 1,
    name: homeName,
    item: localizedPath(locale, "/"),
  };

  const rest: BreadcrumbListItem[] = items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 2,
    name: item.name,
    item: localizedPath(locale, item.path),
  }));

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [home, ...rest],
  };
}
