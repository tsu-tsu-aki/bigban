import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomeFacility from "./HomeFacility";

describe("HomeFacility", () => {
  it('セクションID "facility" を持つ', () => {
    render(<HomeFacility />);
    const section = document.getElementById("facility");
    expect(section).toBeInTheDocument();
  });

  it("キーナンバーを表示する", () => {
    render(<HomeFacility />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("COURTS")).toBeInTheDocument();
    expect(screen.getByText("6:00–23:00")).toBeInTheDocument();
    expect(screen.getByText("HOURS")).toBeInTheDocument();
    expect(screen.getByText("1 min")).toBeInTheDocument();
    expect(screen.getByText("FROM STATION")).toBeInTheDocument();
  });

  it("Primary Specsを表示する", () => {
    render(<HomeFacility />);
    expect(screen.getByText("SURFACE")).toBeInTheDocument();
    expect(screen.getByText("ハードコートデコターフ")).toBeInTheDocument();
    expect(screen.getByText("TYPE")).toBeInTheDocument();
    expect(screen.getByText("全天候型インドア")).toBeInTheDocument();
  });

  it("デコターフ説明文を表示する", () => {
    render(<HomeFacility />);
    expect(
      screen.getByText(/デコターフは世界トップレベルの大会で採用されてきた/)
    ).toBeInTheDocument();
  });

  it("全設備項目を表示する", () => {
    render(<HomeFacility />);
    expect(screen.getByText("トレーニングエリア")).toBeInTheDocument();
    expect(screen.getByText("ラウンジスペース")).toBeInTheDocument();
    expect(screen.getByText("男女別更衣室")).toBeInTheDocument();
    expect(screen.getByText("空調完備")).toBeInTheDocument();
    expect(screen.getByText("レンタル用具あり")).toBeInTheDocument();
    expect(screen.getByText("無人チェックイン対応予定")).toBeInTheDocument();
    expect(screen.getByText("ショーコート1面に変更可能")).toBeInTheDocument();
  });

  it("トレーニングエリアに準備中の注記を表示する", () => {
    render(<HomeFacility />);
    expect(screen.getByText("準備中")).toBeInTheDocument();
  });

  it("FACILITY タイトルを表示する", () => {
    render(<HomeFacility />);
    expect(screen.getByText("FACILITY")).toBeInTheDocument();
  });

  it("bg-deep-black 背景クラスを持つ", () => {
    render(<HomeFacility />);
    const section = document.getElementById("facility");
    expect(section?.className).toContain("bg-deep-black");
  });
});
