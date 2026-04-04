import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomeConcept from "./HomeConcept";

describe("HomeConcept", () => {
  it('セクションID "concept" を持つ', () => {
    render(<HomeConcept />);
    const section = document.getElementById("concept");
    expect(section).toBeInTheDocument();
  });

  it("CONCEPTタイトルを表示する", () => {
    render(<HomeConcept />);
    expect(screen.getByText("CONCEPT")).toBeInTheDocument();
  });

  it("1段落目のテキストを表示する", () => {
    render(<HomeConcept />);
    expect(screen.getByText(/ビッグバンによって誕生したように/)).toBeInTheDocument();
  });

  it("2段落目のテキストを表示する", () => {
    render(<HomeConcept />);
    expect(screen.getByText(/一つの小さなプレー/)).toBeInTheDocument();
  });

  it("キャッチコピーを表示する", () => {
    render(<HomeConcept />);
    expect(screen.getByText("小さなディンクから、大きなムーブメントへ")).toBeInTheDocument();
  });

  it("コンセプト写真を表示する", () => {
    render(<HomeConcept />);
    const img = screen.getByAltText("Paddle and ball in atmospheric lighting");
    expect(img).toBeInTheDocument();
  });

  it("bg-off-white 背景クラスを持つ", () => {
    render(<HomeConcept />);
    const section = document.getElementById("concept");
    expect(section?.className).toContain("bg-off-white");
  });
});
