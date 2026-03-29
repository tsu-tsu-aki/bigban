import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomeConcept from "./HomeConcept";

describe("HomeConcept", () => {
  it('セクションID "concept" を持つ', () => {
    render(<HomeConcept />);
    const section = document.getElementById("concept");
    expect(section).toBeInTheDocument();
  });

  it("CONCEPTラベルを表示する", () => {
    render(<HomeConcept />);
    const labels = screen.getAllByText("CONCEPT");
    expect(labels.length).toBeGreaterThanOrEqual(1);
  });

  it("段落テキストを表示する（クロスミントン世界王者 と すべてがここに）", () => {
    render(<HomeConcept />);
    expect(screen.getByText(/クロスミントン世界王者/)).toBeInTheDocument();
    expect(screen.getByText(/すべてがここに/)).toBeInTheDocument();
  });

  it("写真プレースホルダーを表示する（ムーディーな照明）", () => {
    render(<HomeConcept />);
    expect(screen.getByText(/ムーディーな照明/)).toBeInTheDocument();
  });

  it("bg-off-white 背景クラスを持つ", () => {
    render(<HomeConcept />);
    const section = document.getElementById("concept");
    expect(section?.className).toContain("bg-off-white");
  });
});
