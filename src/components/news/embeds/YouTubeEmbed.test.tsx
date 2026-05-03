import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";

import { YouTubeEmbed } from "./YouTubeEmbed";

const messages = {
  News: {
    embed: {
      youtube: {
        playLabel: "動画を再生",
        iframeTitle: "YouTube プレイヤー",
        thumbnailAlt: "YouTube サムネイル",
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
  it("登録済プロバイダの id でサムネと再生ボタンを描画", () => {
    renderWithIntl(<YouTubeEmbed embedId="dQw4w9WgXcQ" />);
    const thumbnail = screen.getByAltText("YouTube サムネイル") as HTMLImageElement;
    expect(thumbnail.getAttribute("src")).toBe(
      "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    );
    expect(screen.queryByTitle("YouTube プレイヤー")).toBeNull();
  });

  it("クリック後に youtube-nocookie.com の iframe を生成", async () => {
    const user = userEvent.setup();
    renderWithIntl(<YouTubeEmbed embedId="dQw4w9WgXcQ" />);
    await user.click(screen.getByRole("button", { name: /動画を再生/ }));
    const iframe = screen.getByTitle("YouTube プレイヤー") as HTMLIFrameElement;
    expect(iframe.getAttribute("src")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0",
    );
  });

  it("不正な ID (provider 固有検証 NG) は null を返しレンダーされない", () => {
    const { container } = renderWithIntl(
      <YouTubeEmbed embedId="too_long_invalid" />,
    );
    expect(container.firstChild).toBeNull();
  });
});
