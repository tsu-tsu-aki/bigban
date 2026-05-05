import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { EmbedShell } from "./EmbedShell";

const baseProps = {
  iframeUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0",
  iframeTitle: "YouTube プレイヤー",
  fallbackHref: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  fallbackLabel: "YouTube で見る",
  aspectRatio: "16 / 9",
};

describe("EmbedShell", () => {
  it("初期レンダで iframe (youtube-nocookie.com) を即座に描画する", () => {
    render(<EmbedShell {...baseProps} />);
    const iframe = screen.getByTitle("YouTube プレイヤー") as HTMLIFrameElement;
    expect(iframe).toBeInTheDocument();
    expect(iframe.getAttribute("src")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0",
    );
  });

  it("iframe には sandbox / referrerpolicy / loading=lazy / allow がハードコード", () => {
    render(<EmbedShell {...baseProps} />);
    const iframe = screen.getByTitle("YouTube プレイヤー");
    expect(iframe.getAttribute("sandbox")).toBe(
      "allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox",
    );
    expect(iframe.getAttribute("referrerpolicy")).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(iframe.getAttribute("loading")).toBe("lazy");
    const allow = iframe.getAttribute("allow") ?? "";
    expect(allow).toMatch(/encrypted-media/);
    expect(allow).toMatch(/clipboard-write/);
    expect(allow).toMatch(/picture-in-picture/);
  });

  it("sandbox に allow-popups-to-escape-sandbox を含む (PC Chrome の ERR_BLOCKED_BY_RESPONSE 回避)", () => {
    // YouTube/Instagram iframe 内のリンクをクリックすると target="_blank" で新規タブが開く。
    // allow-popups-to-escape-sandbox がないと新規タブが親 iframe の sandbox を継承し
    // origin が null 化 → YouTube の X-Frame-Options:SAMEORIGIN や COOP チェックで弾かれ
    // PC Chrome で ERR_BLOCKED_BY_RESPONSE (blocked:origin) が発生する。
    render(<EmbedShell {...baseProps} />);
    const sandbox = screen
      .getByTitle("YouTube プレイヤー")
      .getAttribute("sandbox") ?? "";
    expect(sandbox.split(/\s+/)).toContain("allow-popups-to-escape-sandbox");
  });

  it("aspectRatio prop が style に反映され CLS 0 になる", () => {
    render(<EmbedShell {...baseProps} />);
    const wrapper = screen.getByTestId("embed-shell");
    expect(wrapper).toHaveStyle({ aspectRatio: "16 / 9" });
  });

  it("aspectRatio はプロバイダごとに切替可 (Instagram の 1/1.4 等)", () => {
    render(<EmbedShell {...baseProps} aspectRatio="1 / 1.4" />);
    const wrapper = screen.getByTestId("embed-shell");
    expect(wrapper).toHaveStyle({ aspectRatio: "1 / 1.4" });
  });

  it("maxWidth が指定されると style に反映される (Instagram 540px 等)", () => {
    render(<EmbedShell {...baseProps} maxWidth="540px" />);
    const wrapper = screen.getByTestId("embed-shell");
    expect(wrapper).toHaveStyle({ maxWidth: "540px" });
  });

  it("aspectRatio の代わりに height (固定高さ) を指定できる (Instagram 等の可変投稿向け)", () => {
    const { aspectRatio: _omit, ...rest } = baseProps;
    void _omit;
    render(<EmbedShell {...rest} height="700px" maxWidth="540px" />);
    const wrapper = screen.getByTestId("embed-shell");
    expect(wrapper).toHaveStyle({ height: "700px", maxWidth: "540px" });
    expect(wrapper.style.aspectRatio).toBe("");
  });

  it("fallback リンクが sr-only で DOM に常時存在する", () => {
    render(<EmbedShell {...baseProps} />);
    const fallback = screen.getByTestId("embed-fallback-link");
    expect(fallback.getAttribute("href")).toBe(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    );
    expect(fallback).toHaveTextContent("YouTube で見る");
    expect(fallback.getAttribute("target")).toBe("_blank");
    expect(fallback.getAttribute("rel")).toBe("noopener noreferrer");
  });
});
