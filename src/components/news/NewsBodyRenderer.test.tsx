import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NewsBodyRenderer } from "./NewsBodyRenderer";

describe("NewsBodyRenderer", () => {
  it("displayMode=html で bodyHtml を STRICT サニタイズ後に表示", () => {
    const { container } = render(
      <NewsBodyRenderer
        displayMode="html"
        bodyHtml="<p>html-mode-body</p>"
        body="<p>rich-body</p>"
      />,
    );
    expect(container.querySelector("p")?.textContent).toBe("html-mode-body");
  });

  it("displayMode=rich で body をリッチサニタイズ後に表示", () => {
    const { container } = render(
      <NewsBodyRenderer
        displayMode="rich"
        bodyHtml="<p>html-mode-body</p>"
        body="<h1>rich-title</h1><p>rich-body</p>"
      />,
    );
    expect(container.querySelector("h1")?.textContent).toBe("rich-title");
  });

  it("displayMode=html で <script> 除去", () => {
    const { container } = render(
      <NewsBodyRenderer
        displayMode="html"
        bodyHtml="<p>ok</p><script>alert(1)</script>"
        body=""
      />,
    );
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("p")?.textContent).toBe("ok");
  });

  it("body/bodyHtml 共に空かつ displayMode=html → 空状態フォールバック", () => {
    render(
      <NewsBodyRenderer displayMode="html" bodyHtml="" body="" />,
    );
    expect(
      screen.getByTestId("news-body-empty").textContent,
    ).toBeTruthy();
  });

  it("prose クラスを適用", () => {
    render(
      <NewsBodyRenderer
        displayMode="html"
        bodyHtml="<p>x</p>"
        body=""
      />,
    );
    expect(screen.getByTestId("news-body").className).toContain("prose");
  });

  it("isFirstImageLcp=true で先頭 img に fetchpriority=high", () => {
    const { container } = render(
      <NewsBodyRenderer
        displayMode="html"
        bodyHtml='<img src="https://images.microcms-assets.io/a.jpg" alt="x" width="10" height="10">'
        body=""
        isFirstImageLcp
      />,
    );
    const img = container.querySelector("img");
    expect(img?.getAttribute("fetchpriority")).toBe("high");
  });

  it("displayMode=html の本文に href の <a> があると target/rel が付く", () => {
    const { container } = render(
      <NewsBodyRenderer
        displayMode="html"
        bodyHtml='<a href="https://example.com">x</a>'
        body=""
      />,
    );
    const a = container.querySelector("a");
    expect(a?.getAttribute("target")).toBe("_blank");
    expect(a?.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("displayMode=html フォールバック: bodyHtml 空でも body があれば rich で表示", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(
      <NewsBodyRenderer
        displayMode="html"
        bodyHtml=""
        body="<p>rich-fallback</p>"
      />,
    );
    expect(container.querySelector("p")?.textContent).toBe("rich-fallback");
    warnSpy.mockRestore();
  });
});
