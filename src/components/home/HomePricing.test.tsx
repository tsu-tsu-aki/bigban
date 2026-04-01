import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePricing from "./HomePricing";

describe("HomePricing", () => {
  it('セクションID "pricing" を持つ', () => {
    render(<HomePricing />);
    const section = document.getElementById("pricing");
    expect(section).toBeInTheDocument();
  });

  it("近日公開見出しを表示する", () => {
    render(<HomePricing />);
    expect(screen.getByText("料金の詳細は近日公開")).toBeInTheDocument();
  });

  it("Instagram言及を表示する", () => {
    render(<HomePricing />);
    expect(
      screen.getByText(/最新情報はInstagramでお知らせいたします/)
    ).toBeInTheDocument();
    const link = screen.getByText("@thepicklebangtheory");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute(
      "href",
      "https://www.instagram.com/thepicklebangtheory"
    );
  });

  it("3つの料金プランを表示する（VISITOR, REGULAR, PREMIUM）", () => {
    render(<HomePricing />);
    expect(screen.getByText(/VISITOR/)).toBeInTheDocument();
    expect(screen.getByText(/REGULAR/)).toBeInTheDocument();
    expect(screen.getByText(/PREMIUM/)).toBeInTheDocument();
  });

  it("COMING SOON を3つ表示する", () => {
    render(<HomePricing />);
    const comingSoons = screen.getAllByText("COMING SOON");
    expect(comingSoons).toHaveLength(3);
  });

  it("レンタル案内を表示する", () => {
    render(<HomePricing />);
    expect(screen.getByText(/手ぶらでお気軽に/)).toBeInTheDocument();
  });

  it("bg-deep-black背景を持つ", () => {
    render(<HomePricing />);
    const section = document.getElementById("pricing");
    expect(section?.className).toContain("bg-deep-black");
  });
});
