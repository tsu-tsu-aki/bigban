import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AboutPage from "./page";

// Mock fetch for contact form
global.fetch = vi.fn();

describe("AboutPage", () => {
  it("ABOUT USタイトルを表示する", () => {
    render(<AboutPage />);
    const headings = screen.getAllByText("ABOUT US");
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it("全6セクションのヘッダーを表示する", () => {
    render(<AboutPage />);
    expect(screen.getByText("COMPANY")).toBeInTheDocument();
    expect(screen.getByText("FOUNDER")).toBeInTheDocument();
    expect(screen.getByText("PLAYERS")).toBeInTheDocument();
    expect(screen.getByText("STAFF")).toBeInTheDocument();
    expect(screen.getByText("PRESS")).toBeInTheDocument();
    expect(screen.getByText("CONTACT")).toBeInTheDocument();
  });

  it("RST Agency情報を表示する", () => {
    render(<AboutPage />);
    const rstElements = screen.getAllByText("RST Agency株式会社");
    expect(rstElements.length).toBeGreaterThanOrEqual(1);
  });

  it("西村昭彦のタイムラインを表示する", () => {
    render(<AboutPage />);
    const nameElements = screen.getAllByText("西村昭彦");
    expect(nameElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/クロスミントン転向/)).toBeInTheDocument();
  });

  it("PBT契約選手セクションを表示する", () => {
    render(<AboutPage />);
    expect(screen.getByText("PBT契約選手")).toBeInTheDocument();
  });

  it("スタッフセクションを表示する", () => {
    render(<AboutPage />);
    expect(screen.getByText("スタッフ")).toBeInTheDocument();
  });

  it("プレスリリースリンクを表示する", () => {
    render(<AboutPage />);
    expect(screen.getByText("PR TIMES")).toBeInTheDocument();
  });

  it("コンタクトフォームを表示する", () => {
    render(<AboutPage />);
    expect(screen.getByText("SEND MESSAGE →")).toBeInTheDocument();
  });

  it("メールアドレスを表示しない", () => {
    render(<AboutPage />);
    const emailElements = screen.queryAllByText(/hello@rstagency/);
    expect(emailElements).toHaveLength(0);
  });

  it("HOMEリンクを表示する", () => {
    render(<AboutPage />);
    expect(screen.getByText("← HOME")).toBeInTheDocument();
  });
});
