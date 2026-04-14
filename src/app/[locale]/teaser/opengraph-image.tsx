import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "COMING SOON · THE PICKLE BANG THEORY";

interface OGImageProps {
  params: Promise<{ locale: string }>;
}

const OPEN_DATE_LABEL = "2026.4.17 OPEN";

export default async function OpengraphImage({ params }: OGImageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const siteName = t("og.siteName");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
          color: "#E6E6E6",
          fontFamily: "sans-serif",
          padding: "80px",
        }}
      >
        <div
          style={{
            fontSize: 40,
            letterSpacing: "0.3em",
            color: "#306EC3",
            marginBottom: 48,
            fontWeight: 700,
          }}
        >
          {siteName}
        </div>
        <div
          style={{
            fontSize: 88,
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.1,
            color: "#F6FF54",
          }}
        >
          {OPEN_DATE_LABEL}
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 32,
            letterSpacing: "0.2em",
            color: "#8A8A8A",
          }}
        >
          COMING SOON
        </div>
      </div>
    ),
    { ...size }
  );
}
