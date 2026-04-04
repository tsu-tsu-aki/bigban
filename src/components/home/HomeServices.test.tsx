import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomeServices from "./HomeServices";

describe("HomeServices", () => {
  it('セクションID "services" を持つ', () => {
    render(<HomeServices />);
    const section = document.getElementById("services");
    expect(section).toBeInTheDocument();
  });

  it("SERVICESタイトルを表示する", () => {
    render(<HomeServices />);
    expect(screen.getByText("SERVICES")).toBeInTheDocument();
  });

  it("5つのサービス番号（01〜05）を表示する", () => {
    render(<HomeServices />);
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
    expect(screen.getByText("04")).toBeInTheDocument();
    expect(screen.getByText("05")).toBeInTheDocument();
  });

  it("日本語タイトルを全て表示する", () => {
    render(<HomeServices />);
    expect(screen.getByText("コートレンタル")).toBeInTheDocument();
    expect(screen.getByText("レッスン & クリニック")).toBeInTheDocument();
    expect(screen.getByText("トレーニングプログラム")).toBeInTheDocument();
    expect(screen.getByText("大会 & リーグ")).toBeInTheDocument();
    expect(screen.getByText("イベント")).toBeInTheDocument();
  });

  it("英語タイトルを全て表示する", () => {
    render(<HomeServices />);
    expect(screen.getByText("COURT RENTAL")).toBeInTheDocument();
    expect(screen.getByText("LESSONS & CLINICS")).toBeInTheDocument();
    expect(screen.getByText("TRAINING")).toBeInTheDocument();
    expect(screen.getByText("TOURNAMENTS & LEAGUES")).toBeInTheDocument();
    expect(screen.getByText("EVENTS")).toBeInTheDocument();
  });

  it("説明文のキーワードを全て含む", () => {
    render(<HomeServices />);
    expect(screen.getByText(/無人チェックイン/)).toBeInTheDocument();
    expect(screen.getByText(/レベル別プログラム/)).toBeInTheDocument();
    expect(screen.getByText(/コンディショニング/)).toBeInTheDocument();
    expect(screen.getByText(/賞金付き/)).toBeInTheDocument();
    expect(screen.getByText(/異業種コラボレーション/)).toBeInTheDocument();
  });

  it("コートレンタルにRESERVEボタンを表示する", () => {
    render(<HomeServices />);
    const reserveButton = screen.getByText("RESERVE");
    expect(reserveButton).toBeInTheDocument();
    expect(reserveButton.closest("a")).toHaveAttribute("href", "#");
  });

  it("他のサービスにはRESERVEボタンを表示しない", () => {
    render(<HomeServices />);
    const reserveButtons = screen.getAllByText("RESERVE");
    expect(reserveButtons).toHaveLength(1);
  });

  it("data-service-row属性で背景色が交互になる（奇数:bg-deep-black, 偶数:bg-off-white）", () => {
    render(<HomeServices />);
    const rows = document.querySelectorAll("[data-service-row]");
    expect(rows).toHaveLength(5);

    rows.forEach((row, index) => {
      if (index % 2 === 0) {
        expect(row.className).toContain("bg-deep-black");
        expect(row.className).toContain("text-text-light");
      } else {
        expect(row.className).toContain("bg-off-white");
        expect(row.className).toContain("text-text-dark");
      }
    });
  });
});
