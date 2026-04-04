import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePricing from "./HomePricing";

describe("HomePricing", () => {
  it('セクションID "pricing" を持つ', () => {
    render(<HomePricing />);
    const section = document.getElementById("pricing");
    expect(section).toBeInTheDocument();
  });

  it("PRICINGタイトルを表示する", () => {
    render(<HomePricing />);
    expect(screen.getByText("PRICING")).toBeInTheDocument();
  });

  it("OPEN記念価格バナーを表示する", () => {
    render(<HomePricing />);
    expect(
      screen.getByText("5月31日までのOPEN記念価格🈹☝️👽")
    ).toBeInTheDocument();
  });

  it("COURT RENTALラベルを表示する", () => {
    render(<HomePricing />);
    expect(screen.getByText("COURT RENTAL")).toBeInTheDocument();
  });

  it("全時間帯の料金を表示する", () => {
    render(<HomePricing />);
    expect(screen.getByText("6:00-9:00")).toBeInTheDocument();
    expect(screen.getByText("9:00-18:00")).toBeInTheDocument();
    expect(screen.getByText("18:00-23:00")).toBeInTheDocument();
    expect(screen.getByText("¥4,980")).toBeInTheDocument();
    expect(screen.getByText("¥5,960")).toBeInTheDocument();
    const prices7980 = screen.getAllByText("¥7,980");
    expect(prices7980.length).toBeGreaterThanOrEqual(3);
  });

  it("平日・週末ヘッダーを表示する", () => {
    render(<HomePricing />);
    expect(screen.getByText("平日")).toBeInTheDocument();
    expect(screen.getByText("週末・祝日")).toBeInTheDocument();
  });

  it("トレーニングエリアを準備中で表示する", () => {
    render(<HomePricing />);
    expect(screen.getByText("TRAINING AREA")).toBeInTheDocument();
    expect(screen.getByText("トレーニングエリア")).toBeInTheDocument();
    expect(screen.getByText("準備中")).toBeInTheDocument();
  });

  it("会員制度を近日公開で表示する", () => {
    render(<HomePricing />);
    expect(screen.getByText("MEMBERSHIP")).toBeInTheDocument();
    expect(screen.getByText("会員制度")).toBeInTheDocument();
    expect(screen.getByText("近日公開")).toBeInTheDocument();
  });

  it("レンタル案内を表示する", () => {
    render(<HomePricing />);
    expect(screen.getByText("イベント利用もしくは貸切のみレンタルパドルあり")).toBeInTheDocument();
  });

  it("貸切・法人利用の案内とリンクを表示する", () => {
    render(<HomePricing />);
    const link = screen.getByText("お問い合わせ");
    expect(link.closest("a")).toHaveAttribute("href", "/about#contact");
  });

  it("bg-deep-black背景を持つ", () => {
    render(<HomePricing />);
    const section = document.getElementById("pricing");
    expect(section?.className).toContain("bg-deep-black");
  });
});
