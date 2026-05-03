import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";

import { YouTubeEmbed } from "./YouTubeEmbed";

const messages = {
  News: {
    embed: {
      youtube: {
        iframeTitle: "YouTube プレイヤー",
      },
      fallbackLabel: "YouTube で開く",
    },
  },
};

function renderWithIntl(ui: React.ReactNode, locale = "ja") {
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe("YouTubeEmbed", () => {
  it("登録済プロバイダの id で iframe (youtube-nocookie.com) を即時描画 (ja locale 反映)", () => {
    renderWithIntl(<YouTubeEmbed embedId="dQw4w9WgXcQ" />, "ja");
    const iframe = screen.getByTitle("YouTube プレイヤー") as HTMLIFrameElement;
    const url = new URL(iframe.getAttribute("src") ?? "");
    expect(url.origin + url.pathname).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
    expect(url.searchParams.get("rel")).toBe("0");
    expect(url.searchParams.get("playsinline")).toBe("1");
    expect(url.searchParams.get("color")).toBe("white");
    expect(url.searchParams.get("hl")).toBe("ja");
  });

  it("locale=en の場合は hl=en でプレイヤー UI が英語化", () => {
    renderWithIntl(<YouTubeEmbed embedId="dQw4w9WgXcQ" />, "en");
    const iframe = screen.getByTitle("YouTube プレイヤー") as HTMLIFrameElement;
    expect(new URL(iframe.getAttribute("src") ?? "").searchParams.get("hl")).toBe(
      "en",
    );
  });

  it("fallback リンクが元動画 URL を保持", () => {
    renderWithIntl(<YouTubeEmbed embedId="dQw4w9WgXcQ" />);
    const fallback = screen.getByTestId("embed-fallback-link");
    expect(fallback.getAttribute("href")).toBe(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    );
  });

  it("不正な ID (provider 固有検証 NG) は null を返す", () => {
    const { container } = renderWithIntl(
      <YouTubeEmbed embedId="too_long_invalid" />,
    );
    expect(container.firstChild).toBeNull();
  });
});
