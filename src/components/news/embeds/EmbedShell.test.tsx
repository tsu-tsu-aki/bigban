import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { EmbedShell } from "./EmbedShell";

const baseProps = {
  thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  thumbnailAlt: "サムネイル",
  iframeUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0",
  iframeTitle: "YouTube プレイヤー",
  playLabel: "動画を再生",
  fallbackHref: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  fallbackLabel: "YouTube で見る",
};

describe("EmbedShell", () => {
  it("初期レンダで iframe は不在、再生ボタンが表示される", () => {
    render(<EmbedShell {...baseProps} />);
    expect(screen.queryByTitle("YouTube プレイヤー")).toBeNull();
    expect(
      screen.getByRole("button", { name: /動画を再生/ }),
    ).toBeInTheDocument();
  });

  it("ボタンクリック後に iframe (youtube-nocookie.com) が描画される", async () => {
    const user = userEvent.setup();
    render(<EmbedShell {...baseProps} />);
    await user.click(screen.getByRole("button", { name: /動画を再生/ }));
    const iframe = screen.getByTitle("YouTube プレイヤー") as HTMLIFrameElement;
    expect(iframe).toBeInTheDocument();
    expect(iframe.getAttribute("src")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0",
    );
  });

  it("iframe には sandbox / referrerpolicy / loading=lazy / allow がハードコード", async () => {
    const user = userEvent.setup();
    render(<EmbedShell {...baseProps} />);
    await user.click(screen.getByRole("button", { name: /動画を再生/ }));
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

  it("fallback リンクが provider 不明時用に DOM に存在する (visually-hidden)", () => {
    render(<EmbedShell {...baseProps} />);
    const fallback = screen.getByTestId("embed-fallback-link");
    expect(fallback.getAttribute("href")).toBe(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    );
    expect(fallback).toHaveTextContent("YouTube で見る");
  });
});
