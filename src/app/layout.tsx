import type { Metadata } from "next";
import { Bebas_Neue, Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
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

export const metadata: Metadata = {
  title: "THE PICKLE BANG THEORY | Premium Indoor Pickleball",
  description:
    "クロスミントン世界王者が手がけるプレミアムインドアピックルボール施設。本八幡駅徒歩1分。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${bebasNeue.variable} ${inter.variable} ${notoSansJP.variable}`}>
      <body className="grain-overlay">{children}</body>
    </html>
  );
}
