import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomeFounder from "./HomeFounder";

describe("HomeFounder", () => {
  it('セクションID "founder" を持つ', () => {
    render(<HomeFounder />);
    const section = document.getElementById("founder");
    expect(section).toBeInTheDocument();
  });

  it("FOUNDERラベルを表示する", () => {
    render(<HomeFounder />);
    const labels = screen.getAllByText("FOUNDER");
    expect(labels.length).toBeGreaterThanOrEqual(1);
  });

  it('日本語名 "西村昭彦" を表示する', () => {
    render(<HomeFounder />);
    expect(screen.getByText("西村昭彦")).toBeInTheDocument();
  });

  it('英語名 "AKIHIKO NISHIMURA" を表示する', () => {
    render(<HomeFounder />);
    expect(screen.getByText("AKIHIKO NISHIMURA")).toBeInTheDocument();
  });

  it("タイムラインエントリーを表示する", () => {
    render(<HomeFounder />);
    expect(screen.getByText(/北海道出身/)).toBeInTheDocument();
    expect(screen.getByText(/青森山田高校/)).toBeInTheDocument();
    expect(screen.getByText(/クロスミントン転向/)).toBeInTheDocument();
    expect(screen.getByText(/4連覇/)).toBeInTheDocument();
    expect(screen.getByText(/RST Agency/)).toBeInTheDocument();
  });

  it("PRESSラベルとPR TIMESリンクを表示する", () => {
    render(<HomeFounder />);
    const labels = screen.getAllByText("PRESS");
    expect(labels.length).toBeGreaterThanOrEqual(1);
    const link = screen.getByRole("link", { name: /PR TIMES/ });
    expect(link).toHaveAttribute(
      "href",
      "https://prtimes.jp/main/html/rd/p/000000003.000179043.html"
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("記事タイトルを表示する", () => {
    render(<HomeFounder />);
    expect(screen.getByText(/都市型ピックルボール施設/)).toBeInTheDocument();
  });
});
