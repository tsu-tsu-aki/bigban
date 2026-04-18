import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL } from "@/constants/site";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { Orbitron, Inter, Noto_Sans_JP } from "next/font/google";
import { routing } from "@/i18n/routing";
import StructuredData from "@/components/StructuredData";
import {
  buildSportsActivityLocation,
  buildOrganization,
} from "@/lib/structured-data";
import { isIOSSafari } from "@/lib/detectBrowser";
import "../globals.css";

import type { Metadata } from "next";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  display: "swap",
  preload: false,
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface MetadataProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    metadataBase: new URL(SITE_URL),
    openGraph: {
      type: "website",
      siteName: t("og.siteName"),
      locale: locale === "ja" ? "ja_JP" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const requestHeaders = await headers();
  const iosSafari = isIOSSafari(requestHeaders.get("user-agent"));

  return (
    <html
      lang={locale}
      className={`${orbitron.variable} ${inter.variable} ${notoSansJP.variable}`}
      data-browser={iosSafari ? "ios-safari" : undefined}
      suppressHydrationWarning
    >
      <body className="grain-overlay">
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var p=location.pathname;if((p==='/'||/^\\/[a-z]{2}\\/?$/.test(p))&&sessionStorage.getItem('bigban-intro-played')!=='true'&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('intro-pending')}}catch(e){}`,
          }}
        />
        <StructuredData
          data={[
            buildSportsActivityLocation(locale),
            buildOrganization(),
          ]}
        />
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
