import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

/**
 * News 詳細・一覧ページ向け CSP (Content-Security-Policy)。
 *
 * Phase 1 (YouTube 埋め込み) では Report-Only モードで運用し、
 * 違反ログを 1 週間収集後に Content-Security-Policy (enforce) に
 * 切り替える計画 (別 PR)。
 *
 * frame-src:
 *   - 'self': 同一オリジンのみ
 *   - https://www.youtube-nocookie.com: YouTube プライバシー強化埋め込み専用
 *   - 他プロバイダ追加時はここに 1 行ずつ足す (Phase 2 以降)
 */
const NEWS_CSP_REPORT_ONLY = [
  "frame-src 'self' https://www.youtube-nocookie.com",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.microcms-assets.io",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:locale(ja|en)?/news/:path*",
        headers: [
          {
            key: "Content-Security-Policy-Report-Only",
            value: NEWS_CSP_REPORT_ONLY,
          },
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
