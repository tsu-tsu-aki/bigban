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
  it("登録済プロバイダの id で iframe (youtube-nocookie.com) を即時描画", () => {
    renderWithIntl(<YouTubeEmbed embedId="dQw4w9WgXcQ" />);
    const iframe = screen.getByTitle("YouTube プレイヤー") as HTMLIFrameElement;
    expect(iframe.getAttribute("src")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0",
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
