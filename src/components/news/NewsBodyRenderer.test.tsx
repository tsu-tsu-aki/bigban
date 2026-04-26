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
        body="<h2>rich-title</h2><p>rich-body</p>"
      />,
    );
    expect(container.querySelector("h2")?.textContent).toBe("rich-title");
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

  it("prose-invert + ブランドオーバーライド (リンク色 / blockquote / focus) が付与される", () => {
    render(
      <NewsBodyRenderer
        displayMode="html"
        bodyHtml="<p>x</p>"
        body=""
      />,
    );
    const cls = screen.getByTestId("news-body").className;
    expect(cls).toContain("prose-invert");
    expect(cls).toContain("prose-a:text-accent");
    expect(cls).toContain("prose-blockquote:border-accent/40");
    expect(cls).toContain("prose-a:focus-visible:outline");
    expect(cls).toContain("prose-img:rounded-none");
  });

  it("<table> は news-table-scroll ラッパー (role=region + tabindex=0) で自動的に包まれる", () => {
    const { container } = render(
      <NewsBodyRenderer
        displayMode="html"
        bodyHtml='<table><tr><th scope="col">A</th></tr></table>'
        body=""
      />,
    );
    const wrapper = container.querySelector("figure.news-table-scroll");
    expect(wrapper).not.toBeNull();
    expect(wrapper?.getAttribute("role")).toBe("region");
    expect(wrapper?.getAttribute("tabindex")).toBe("0");
    expect(wrapper?.getAttribute("aria-label")).toBe("表");
    expect(wrapper?.querySelector("table")).not.toBeNull();
  });

  it("badge / note / mark / aside がサニタイズ後に保持される", () => {
    const { container } = render(
      <NewsBodyRenderer
        displayMode="html"
        bodyHtml={
          '<p><span class="badge">中級</span> <mark>強調</mark></p>' +
          '<aside class="note">注意</aside>' +
          '<aside class="caution">警告</aside>'
        }
        body=""
      />,
    );
    expect(
      container.querySelector('span.badge')?.textContent,
    ).toBe("中級");
    expect(container.querySelector("mark")?.textContent).toBe("強調");
    expect(
      container.querySelector('aside.note')?.textContent,
    ).toBe("注意");
    expect(
      container.querySelector('aside.caution')?.textContent,
    ).toBe("警告");
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
