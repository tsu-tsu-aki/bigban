import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { EmbedShell } from "./EmbedShell";

const baseProps = {
  iframeUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0",
  iframeTitle: "YouTube プレイヤー",
  fallbackHref: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  fallbackLabel: "YouTube で見る",
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
      "allow-scripts allow-same-origin allow-presentation",
    );
    expect(iframe.getAttribute("referrerpolicy")).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(iframe.getAttribute("loading")).toBe("lazy");
    expect(iframe.getAttribute("allow")).toMatch(/encrypted-media/);
  });

  it("aspect-ratio は 16/9 でレイアウトシフト 0 (CLS 対策)", () => {
    render(<EmbedShell {...baseProps} />);
    const wrapper = screen.getByTestId("embed-shell");
    expect(wrapper).toHaveStyle({ aspectRatio: "16 / 9" });
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
