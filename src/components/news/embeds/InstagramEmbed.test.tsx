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

  it("固定高さ 700px / 最大幅 540px (CLS 0、カクつきなし)", () => {
    renderWithIntl(<InstagramEmbed embedId="C12abcXYZ_-" />);
    const wrapper = screen.getByTestId("embed-shell");
    expect(wrapper.style.height).toBe("700px");
    expect(wrapper.style.maxWidth).toBe("540px");
    // aspect-ratio は使わない (高さ固定のため不要)
    expect(wrapper.style.aspectRatio).toBe("");
  });

  it("iframe には sandbox / referrerpolicy / loading=lazy / allow がハードコード", () => {
    renderWithIntl(<InstagramEmbed embedId="C12abcXYZ_-" />);
    const iframe = screen.getByTitle("Instagram 投稿");
    expect(iframe.getAttribute("sandbox")).toBe(
      "allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox",
    );
    expect(iframe.getAttribute("referrerpolicy")).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(iframe.getAttribute("loading")).toBe("lazy");
    const allow = iframe.getAttribute("allow") ?? "";
    expect(allow).toMatch(/clipboard-write/);
    expect(allow).toMatch(/encrypted-media/);
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
