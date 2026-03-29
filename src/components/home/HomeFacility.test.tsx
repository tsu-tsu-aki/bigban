import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomeFacility from "./HomeFacility";

describe("HomeFacility", () => {
  it('セクションID "facility" を持つ', () => {
    render(<HomeFacility />);
    const section = document.getElementById("facility");
    expect(section).toBeInTheDocument();
  });

  it("コートスペックを表示する", () => {
    render(<HomeFacility />);
    expect(screen.getByText(/PickleRoll Pro/)).toBeInTheDocument();
    expect(screen.getByText(/3面/)).toBeInTheDocument();
    expect(screen.getByText(/ショーコート/)).toBeInTheDocument();
    expect(screen.getByText(/全天候型インドア \/ 空調完備/)).toBeInTheDocument();
  });

  it("全アメニティ名を表示する", () => {
    render(<HomeFacility />);
    expect(screen.getByText("更衣室")).toBeInTheDocument();
    expect(screen.getByText("トレーニングエリア")).toBeInTheDocument();
    expect(screen.getByText("ラウンジスペース")).toBeInTheDocument();
    expect(screen.getByText("レンタル用品")).toBeInTheDocument();
    expect(screen.getByText("無人チェックイン対応")).toBeInTheDocument();
  });

  it("FACILITY ラベルを表示する", () => {
    render(<HomeFacility />);
    expect(screen.getByText("FACILITY")).toBeInTheDocument();
  });

  it("bg-deep-black 背景クラスを持つ", () => {
    render(<HomeFacility />);
    const section = document.getElementById("facility");
    expect(section?.className).toContain("bg-deep-black");
  });
});
