import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { extractPageLabel } from "@/lib/og-utils";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "ABOUT · THE PICKLE BANG THEORY";

interface OGImageProps {
  params: Promise<{ locale: string }>;
}

export default async function OpengraphImage({ params }: OGImageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const pageLabel = extractPageLabel(t("about.title"));
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
          background: "#0A0A0A",
          color: "#F5F2EE",
          fontFamily: "sans-serif",
          padding: "80px",
        }}
      >
        <div
          style={{
            fontSize: 40,
            letterSpacing: "0.3em",
            color: "#C8FF00",
            marginBottom: 48,
            fontWeight: 700,
          }}
        >
          {siteName}
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.2,
            maxWidth: "1040px",
          }}
        >
          {pageLabel}
        </div>
        <div
          style={{
            marginTop: 64,
            width: 120,
            height: 4,
            background: "#C8FF00",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
