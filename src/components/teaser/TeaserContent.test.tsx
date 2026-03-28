import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TeaserContent } from "./TeaserContent";

describe("TeaserContent", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-27T00:00:00+09:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("ロゴ画像が表示される", () => {
    render(<TeaserContent logoSrc="/logos/tate-neon-hybrid.svg" />);

    const logo = screen.getByAltText("THE PICKLE BANG THEORY");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "/logos/tate-neon-hybrid.svg");
  });

  it("開業日が表示される", () => {
    render(<TeaserContent logoSrc="/logos/tate-neon-hybrid.svg" />);
    expect(screen.getByText("2026.4.18 OPEN")).toBeInTheDocument();
  });

  it("カウントダウンが表示される", () => {
    render(<TeaserContent logoSrc="/logos/tate-neon-hybrid.svg" />);

    expect(screen.getByText("DAYS")).toBeInTheDocument();
    expect(screen.getByText("HOURS")).toBeInTheDocument();
    expect(screen.getByText("MIN")).toBeInTheDocument();
    expect(screen.getByText("SEC")).toBeInTheDocument();
  });

  it("日本語見出しがh2タグで表示される", () => {
    render(<TeaserContent logoSrc="/logos/tate-neon-hybrid.svg" />);
    const heading = screen.getByText(/ここから、ピックルボールのビッグバンが始まる/);
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe("H2");
  });

  it("英語見出しが表示される", () => {
    render(<TeaserContent logoSrc="/logos/tate-neon-hybrid.svg" />);
    const heading = screen.getByText(
      /the pickle bang will begin here from your small dinks/i
    );
    expect(heading).toBeInTheDocument();
  });

  it("コピーセクションにディバイダーが存在する", () => {
    render(<TeaserContent logoSrc="/logos/tate-neon-hybrid.svg" />);
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("ボディテキストが表示される", () => {
    render(<TeaserContent logoSrc="/logos/tate-neon-hybrid.svg" />);
    expect(
      screen.getByText(/トレーニング、競技、コミュニティが一体となった空間/)
    ).toBeInTheDocument();
  });

  it("強調テキストが正しくマークアップされている", () => {
    render(<TeaserContent logoSrc="/logos/tate-neon-hybrid.svg" />);
    const emphasis = screen.getByText(/これは単なるレンタルコートではない/);
    expect(emphasis.tagName).toBe("EM");
  });

  it("メール登録セクションが表示される", () => {
    render(<TeaserContent logoSrc="/logos/tate-neon-hybrid.svg" />);
    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
  });

  it("キーファクトが表示される", () => {
    render(<TeaserContent logoSrc="/logos/tate-neon-hybrid.svg" />);

    expect(screen.getByText("本八幡駅 徒歩1分")).toBeInTheDocument();
    expect(screen.getByText("プロ仕様ハードコート 3面")).toBeInTheDocument();
    expect(screen.getByText("6:00 – 23:00")).toBeInTheDocument();
    expect(screen.getByText("西村昭彦 — 世界王者")).toBeInTheDocument();
  });

  it("フッターが表示される", () => {
    render(<TeaserContent logoSrc="/logos/tate-neon-hybrid.svg" />);
    expect(screen.getByText(/RST Agency/)).toBeInTheDocument();
    expect(screen.getByText("Instagram")).toBeInTheDocument();
  });
});
