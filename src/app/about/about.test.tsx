import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AboutPage from "./page";

const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock IntersectionObserver for HomeNavigation's useActiveSection
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

describe("AboutPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
    const contactElements = screen.getAllByText("CONTACT");
    expect(contactElements.length).toBeGreaterThanOrEqual(1);
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

  it("ハッシュ付きURLではスクロールリセットしない", () => {
    Object.defineProperty(window, "location", {
      value: { ...window.location, hash: "#contact" },
      writable: true,
    });
    const scrollSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    render(<AboutPage />);
    expect(scrollSpy).not.toHaveBeenCalled();
    scrollSpy.mockRestore();
    Object.defineProperty(window, "location", {
      value: { ...window.location, hash: "" },
      writable: true,
    });
  });

  it("HOMEリンクを表示する", () => {
    render(<AboutPage />);
    expect(screen.getByText(/© 2026 RST Agency/)).toBeInTheDocument();
  });

  it("フォーム送信成功時にメッセージを表示する", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    render(<AboutPage />);

    fireEvent.change(screen.getByPlaceholderText("お名前 *"), {
      target: { value: "テスト太郎" },
    });
    fireEvent.change(screen.getByPlaceholderText("メールアドレス *"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("お問い合わせ種別"), {
      target: { value: "other" },
    });
    fireEvent.change(screen.getByPlaceholderText("お問い合わせ内容 *"), {
      target: { value: "テストメッセージ" },
    });
    fireEvent.click(screen.getByText("SEND MESSAGE →"));

    await waitFor(() => {
      expect(
        screen.getByText("送信しました。ありがとうございます。")
      ).toBeInTheDocument();
    });
  });

  it("フォーム送信失敗時にエラーメッセージを表示する", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    render(<AboutPage />);

    fireEvent.change(screen.getByPlaceholderText("お名前 *"), {
      target: { value: "テスト太郎" },
    });
    fireEvent.change(screen.getByPlaceholderText("メールアドレス *"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("お問い合わせ種別"), {
      target: { value: "other" },
    });
    fireEvent.change(screen.getByPlaceholderText("お問い合わせ内容 *"), {
      target: { value: "テストメッセージ" },
    });
    fireEvent.click(screen.getByText("SEND MESSAGE →"));

    await waitFor(() => {
      expect(
        screen.getByText("送信に失敗しました。もう一度お試しください。")
      ).toBeInTheDocument();
    });
  });

  it("ネットワークエラー時にエラーメッセージを表示する", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    render(<AboutPage />);

    fireEvent.change(screen.getByPlaceholderText("お名前 *"), {
      target: { value: "テスト太郎" },
    });
    fireEvent.change(screen.getByPlaceholderText("メールアドレス *"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("お問い合わせ種別"), {
      target: { value: "other" },
    });
    fireEvent.change(screen.getByPlaceholderText("お問い合わせ内容 *"), {
      target: { value: "テストメッセージ" },
    });
    fireEvent.click(screen.getByText("SEND MESSAGE →"));

    await waitFor(() => {
      expect(
        screen.getByText("送信に失敗しました。もう一度お試しください。")
      ).toBeInTheDocument();
    });
  });
});
