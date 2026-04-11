export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const OG_IMAGE = "/og-image.png";

export const RESERVE_URL = "https://reserva.be/tpbt";

export const EXTERNAL_LINK_PROPS = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;
