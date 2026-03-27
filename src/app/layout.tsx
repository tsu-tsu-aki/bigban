import type { Metadata } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "THE PICKLE BANG THEORY | Premium Indoor Pickleball",
  description:
    "クロスミントン世界王者が手がけるプレミアムインドアピックルボール施設。本八幡駅徒歩1分。",
};

const isMaintenance = process.env.NEXT_PUBLIC_MAINTENANCE === "true";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${dmSerif.variable} ${inter.variable}`}>
      <body className="grain-overlay">
        {isMaintenance ? (
          <div className="flex min-h-screen items-center justify-center bg-[#000000]">
            <p className="text-[#E6E6E6] text-sm tracking-widest">準備中</p>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
