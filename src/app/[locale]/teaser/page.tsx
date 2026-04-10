import { SITE_URL, OG_IMAGE } from "@/constants/site";
import TeaserPage from "./TeaserPage";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "COMING SOON | THE PICKLE BANG THEORY",
  description:
    "Premium Indoor Pickleball Facility. Coming Soon.",
  openGraph: {
    title: "COMING SOON | THE PICKLE BANG THEORY",
    description: "Premium Indoor Pickleball Facility. Coming Soon.",
    images: [OG_IMAGE],
    url: `${SITE_URL}/teaser`,
  },
};

export default function Page() {
  return <TeaserPage />;
}
