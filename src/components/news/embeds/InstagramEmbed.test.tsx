import { describe, it, expect } from "vitest";
import { act, render, screen } from "@testing-library/react";
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

function postInstagramMessage(data: unknown, origin = "https://www.instagram.com") {
  act(() => {
    window.dispatchEvent(
      new MessageEvent("message", { data, origin }),
    );
  });
}

describe("InstagramEmbed", () => {
  it("登録済 shortcode で iframe (instagram.com/p/{id}/embed) を即時描画", () => {
    renderWithIntl(<InstagramEmbed embedId="C12abcXYZ_-" />);
    const iframe = screen.getByTitle("Instagram 投稿") as HTMLIFrameElement;
    expect(iframe.getAttribute("src")).toBe(
      "https://www.instagram.com/p/C12abcXYZ_-/embed",
    );
  });

  it("初期高さは 600px (postMessage 到達前のフォールバック)", () => {
    renderWithIntl(<InstagramEmbed embedId="C12abcXYZ_-" />);
    const iframe = screen.getByTitle("Instagram 投稿") as HTMLIFrameElement;
    expect(iframe.style.height).toBe("600px");
  });

  it("aspect-ratio は使わず max-width のみ (高さは動的)", () => {
    renderWithIntl(<InstagramEmbed embedId="C12abcXYZ_-" />);
    const wrapper = screen.getByTestId("embed-shell");
    expect(wrapper.style.aspectRatio).toBe("");
    expect(wrapper.style.maxWidth).toBe("540px");
  });

  it("Instagram からの postMessage (MEASURE 形式) で iframe 高さが更新される", () => {
    renderWithIntl(<InstagramEmbed embedId="C12abcXYZ_-" />);
    const iframe = screen.getByTitle("Instagram 投稿") as HTMLIFrameElement;
    expect(iframe.style.height).toBe("600px");

    postInstagramMessage({ type: "MEASURE", details: { height: 1024 } });
    expect(iframe.style.height).toBe("1024px");
  });

  it("Instagram からの postMessage (簡易 height 形式) でも更新される", () => {
    renderWithIntl(<InstagramEmbed embedId="C12abcXYZ_-" />);
    const iframe = screen.getByTitle("Instagram 投稿") as HTMLIFrameElement;

    postInstagramMessage({ height: 800 });
    expect(iframe.style.height).toBe("800px");
  });

  it("文字列の JSON ペイロードでも高さを抽出できる", () => {
    renderWithIntl(<InstagramEmbed embedId="C12abcXYZ_-" />);
    const iframe = screen.getByTitle("Instagram 投稿") as HTMLIFrameElement;

    postInstagramMessage(JSON.stringify({ height: 750 }));
    expect(iframe.style.height).toBe("750px");
  });

  it("信頼できない origin からのメッセージは無視 (instagram.com 以外)", () => {
    renderWithIntl(<InstagramEmbed embedId="C12abcXYZ_-" />);
    const iframe = screen.getByTitle("Instagram 投稿") as HTMLIFrameElement;
    expect(iframe.style.height).toBe("600px");

    postInstagramMessage(
      { height: 9999 },
      "https://evil.example.com",
    );
    expect(iframe.style.height).toBe("600px");
  });

  it("負値 / 0 / 異常データは無視", () => {
    renderWithIntl(<InstagramEmbed embedId="C12abcXYZ_-" />);
    const iframe = screen.getByTitle("Instagram 投稿") as HTMLIFrameElement;

    postInstagramMessage({ height: 0 });
    postInstagramMessage({ height: -100 });
    postInstagramMessage({ unrelated: "data" });
    postInstagramMessage("not-json");
    expect(iframe.style.height).toBe("600px");
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
