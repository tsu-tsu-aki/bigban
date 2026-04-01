import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomeKeyNumbers from "./HomeKeyNumbers";

describe("HomeKeyNumbers", () => {
  it('セクションID "key-numbers" を持つ', () => {
    render(<HomeKeyNumbers />);
    const section = document.getElementById("key-numbers");
    expect(section).toBeInTheDocument();
  });

  it("4つの数値テキストを表示する", () => {
    render(<HomeKeyNumbers />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText(/6:00/)).toBeInTheDocument();
    expect(screen.getByText(/1 min/)).toBeInTheDocument();
    expect(screen.getByText(/4,800/)).toBeInTheDocument();
  });

  it("英語ラベルを表示する", () => {
    render(<HomeKeyNumbers />);
    expect(screen.getByText("COURTS")).toBeInTheDocument();
    expect(screen.getByText("HOURS")).toBeInTheDocument();
    expect(screen.getByText("FROM STATION")).toBeInTheDocument();
    expect(screen.getByText("US PLAYERS")).toBeInTheDocument();
  });

  it("日本語ラベルを表示する", () => {
    render(<HomeKeyNumbers />);
    expect(screen.getByText("プロ仕様コート")).toBeInTheDocument();
    expect(screen.getByText("営業時間")).toBeInTheDocument();
    expect(screen.getByText("駅徒歩1分")).toBeInTheDocument();
    expect(screen.getByText("米国競技人口")).toBeInTheDocument();
  });

  it("bg-deep-black 背景クラスを持つ", () => {
    render(<HomeKeyNumbers />);
    const section = document.getElementById("key-numbers");
    expect(section?.className).toContain("bg-deep-black");
  });
});
