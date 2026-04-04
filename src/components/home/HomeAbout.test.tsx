import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomeAbout from "./HomeAbout";

describe("HomeAbout", () => {
  it('セクションID "about" を持つ', () => {
    render(<HomeAbout />);
    const section = document.getElementById("about");
    expect(section).toBeInTheDocument();
  });

  it("ABOUT USタイトルを表示する", () => {
    render(<HomeAbout />);
    expect(screen.getByText("ABOUT US")).toBeInTheDocument();
  });

  it("西村昭彦の名前を表示する", () => {
    render(<HomeAbout />);
    expect(screen.getByText("西村昭彦")).toBeInTheDocument();
  });

  it("FOUNDER & CEOラベルを表示する", () => {
    render(<HomeAbout />);
    expect(screen.getByText("FOUNDER & CEO")).toBeInTheDocument();
  });

  it("英語名を表示する", () => {
    render(<HomeAbout />);
    expect(screen.getByText("AKIHIKO NISHIMURA")).toBeInTheDocument();
  });

  it("概要テキストを表示する", () => {
    render(<HomeAbout />);
    expect(
      screen.getByText(/クロスミントン世界選手権6度優勝/)
    ).toBeInTheDocument();
  });

  it("詳しく見るリンクを表示する", () => {
    render(<HomeAbout />);
    expect(screen.getByText("詳しく見る")).toBeInTheDocument();
  });

  it("/aboutへのリンクを持つ", () => {
    render(<HomeAbout />);
    const link = screen.getByText("詳しく見る").closest("a");
    expect(link).toHaveAttribute("href", "/about");
  });
});
