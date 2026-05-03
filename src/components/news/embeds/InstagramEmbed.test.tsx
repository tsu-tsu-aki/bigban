import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";

import { InstagramEmbed } from "./InstagramEmbed";

const messages = {
  News: {
    embed: {
      instagram: {
        iframeTitle: "Instagram 投稿",
      },
      fallbackLabel: "Instagram で開く",
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

describe("InstagramEmbed", () => {
  it("登録済 shortcode で iframe (instagram.com/p/{id}/embed) を即時描画", () => {
    renderWithIntl(<InstagramEmbed embedId="C12abcXYZ_-" />);
    const iframe = screen.getByTitle("Instagram 投稿") as HTMLIFrameElement;
    expect(iframe.getAttribute("src")).toBe(
      "https://www.instagram.com/p/C12abcXYZ_-/embed",
    );
  });

  it("aspect-ratio と maxWidth が Instagram 向けに設定される", () => {
    renderWithIntl(<InstagramEmbed embedId="C12abcXYZ_-" />);
    const wrapper = screen.getByTestId("embed-shell");
    expect(wrapper.getAttribute("style")).toMatch(/aspect-ratio/);
    expect(wrapper.getAttribute("style")).toMatch(/max-width/);
  });

  it("fallback リンクが元投稿 URL を保持", () => {
    renderWithIntl(<InstagramEmbed embedId="C12abcXYZ_-" />);
    const fallback = screen.getByTestId("embed-fallback-link");
    expect(fallback.getAttribute("href")).toBe(
      "https://www.instagram.com/p/C12abcXYZ_-/",
    );
  });

  it("不正な ID (provider 固有検証 NG) は null を返す", () => {
    const { container } = renderWithIntl(
      <InstagramEmbed embedId={"a".repeat(16)} />,
    );
    expect(container.firstChild).toBeNull();
  });
});
