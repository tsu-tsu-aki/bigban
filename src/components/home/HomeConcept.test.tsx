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

  it("リードコピーを表示する", () => {
    render(<HomeConcept />);
    expect(screen.getByText(/ビッグバンによって誕生したように/)).toBeInTheDocument();
  });

  it("詩的な行を英数字の1で表示する", () => {
    render(<HomeConcept />);
    expect(screen.getByText("1つの小さなプレー。")).toBeInTheDocument();
    expect(screen.getByText("1つの小さなディンク。")).toBeInTheDocument();
  });

  it("説明テキストを表示する", () => {
    render(<HomeConcept />);
    expect(screen.getByText(/やがて大きなエネルギーとなり/)).toBeInTheDocument();
  });

  it("キャッチコピーを表示する", () => {
    render(<HomeConcept />);
    expect(screen.getByText("小さなディンクから、大きなムーブメントへ。")).toBeInTheDocument();
  });

  it("ビッグバン画像を表示する", () => {
    render(<HomeConcept />);
    const img = screen.getByAltText("ビッグバン — 宇宙の誕生");
    expect(img).toBeInTheDocument();
  });

  it("bg-off-white 背景クラスを持つ", () => {
    render(<HomeConcept />);
    const section = document.getElementById("concept");
    expect(section?.className).toContain("bg-off-white");
  });
});
