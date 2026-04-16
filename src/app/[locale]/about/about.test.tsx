import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import AboutPage from "./AboutContent";
import jaMessages from "../../../../messages/ja.json";

import type { ReactElement } from "react";

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, ...props }: Record<string, unknown>) => (
    <a href={href as string} {...props}>{children as React.ReactNode}</a>
  ),
  usePathname: () => "/about",
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("embla-carousel-react", () => ({
  default: () => [vi.fn(), null],
}));

// Mock IntersectionObserver for HomeNavigation's useActiveSection
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

function renderWithIntl(ui: ReactElement) {
  return render(
    <NextIntlClientProvider locale="ja" messages={jaMessages}>
      {ui}
    </NextIntlClientProvider>
  );
}

describe("AboutPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ABOUT USタイトルを表示する", () => {
    renderWithIntl(<AboutPage />);
    const headings = screen.getAllByText("ABOUT US");
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it("全6セクションのヘッダーを表示する", () => {
    renderWithIntl(<AboutPage />);
    expect(screen.getByText("COMPANY")).toBeInTheDocument();
    expect(screen.getByText("FOUNDER")).toBeInTheDocument();
    expect(screen.getByText("OUR PLAYERS")).toBeInTheDocument();
    expect(screen.getByText("OUR CREW")).toBeInTheDocument();
    expect(screen.getByText("NEWS")).toBeInTheDocument();
    const contactElements = screen.getAllByText("CONTACT");
    expect(contactElements.length).toBeGreaterThanOrEqual(1);
  });

  it("CONTACTセクションに施設住所が表示される", () => {
    renderWithIntl(<AboutPage />);
    expect(screen.getByText("千葉県市川市八幡2-16-6 6階")).toBeInTheDocument();
  });

  it("RST Agency情報を表示する", () => {
    renderWithIntl(<AboutPage />);
    const rstElements = screen.getAllByText("RST Agency株式会社");
    expect(rstElements.length).toBeGreaterThanOrEqual(1);
  });

  it("西村昭彦の経歴を表示する", () => {
    renderWithIntl(<AboutPage />);
    const nameElements = screen.getAllByText("西村昭彦");
    expect(nameElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/クロスミントンへ転向/)).toBeInTheDocument();
  });

  it("PBT契約選手セクションを表示する", () => {
    renderWithIntl(<AboutPage />);
    expect(screen.getByText("PBT契約選手")).toBeInTheDocument();
  });

  it("モバイル用カルーセルとPC用2カラムグリッドの両方が存在する", () => {
    const { container } = renderWithIntl(<AboutPage />);

    const mobileWrap = container.querySelector(
      '.md\\:hidden [aria-roledescription="carousel"]'
    );
    expect(mobileWrap).toBeInTheDocument();

    const pcGrid = container.querySelector(".hidden.md\\:grid.md\\:grid-cols-2");
    expect(pcGrid).toBeInTheDocument();
  });

  it("PBTクルーセクションを表示する", () => {
    renderWithIntl(<AboutPage />);
    expect(screen.getByText("PBTクルー")).toBeInTheDocument();
  });

  it("ニュースセクションを表示する", () => {
    renderWithIntl(<AboutPage />);
    expect(screen.getByText("ニュース")).toBeInTheDocument();
    expect(screen.getByText("PR TIMES")).toBeInTheDocument();
  });

  it("コンタクトフォームを表示する", () => {
    renderWithIntl(<AboutPage />);
    expect(screen.getByText("SEND MESSAGE")).toBeInTheDocument();
  });

  it("Instagramリンクが設定されている", () => {
    renderWithIntl(<AboutPage />);
    const igLink = screen.getByText("@thepicklebangtheory");
    expect(igLink.closest("a")).toHaveAttribute(
      "href",
      "https://www.instagram.com/thepicklebangtheory"
    );
  });

  it("FOUNDERセクションに西村昭彦のInstagramリンクを表示する", () => {
    renderWithIntl(<AboutPage />);
    const link = screen.getByText("@akihiko.rst").closest("a");
    expect(link).toHaveAttribute(
      "href",
      "https://www.instagram.com/akihiko.rst/"
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link?.querySelector("svg")).toBeInTheDocument();
  });

  it("メールアドレスを表示しない", () => {
    renderWithIntl(<AboutPage />);
    const emailElements = screen.queryAllByText(/hello@rstagency/);
    expect(emailElements).toHaveLength(0);
  });

  it("ハッシュ付きURLではスクロールリセットしない", () => {
    Object.defineProperty(window, "location", {
      value: { ...window.location, hash: "#contact" },
      writable: true,
    });
    const scrollSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    renderWithIntl(<AboutPage />);
    expect(scrollSpy).not.toHaveBeenCalled();
    scrollSpy.mockRestore();
    Object.defineProperty(window, "location", {
      value: { ...window.location, hash: "" },
      writable: true,
    });
  });

  it("戦績セクション（PICKLEBALL CAREER）を表示する", () => {
    renderWithIntl(<AboutPage />);
    expect(screen.getByText("PICKLEBALL CAREER")).toBeInTheDocument();
    expect(screen.getByText("YEAR")).toBeInTheDocument();
    expect(screen.getByText("TOURNAMENT")).toBeInTheDocument();
    expect(screen.getByText("CATEGORY")).toBeInTheDocument();
    expect(screen.getByText("RESULT")).toBeInTheDocument();
  });

  it("戦績データが全件表示される", () => {
    renderWithIntl(<AboutPage />);
    expect(screen.getByText("Pickleball D-Joy Tour 2026")).toBeInTheDocument();
    expect(screen.getByText("PPA World Championship")).toBeInTheDocument();
    expect(screen.getByText("KINTO JAPAN CUP 19+A")).toBeInTheDocument();
    expect(screen.getByText("JPA TOP TOUR T1")).toBeInTheDocument();
    expect(screen.getByText("JPA TOP TOUR T2")).toBeInTheDocument();
  });

  it("戦績の結果ラベルが表示される", () => {
    renderWithIntl(<AboutPage />);
    const goldResults = screen.getAllByText("優勝");
    expect(goldResults.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("JPA日本ランキング上位者として選抜")).toBeInTheDocument();
    expect(screen.getByText("4位")).toBeInTheDocument();
  });

  it("HOMEリンクを表示する", () => {
    renderWithIntl(<AboutPage />);
    expect(screen.getByText(/© 2026 RST Agency/)).toBeInTheDocument();
  });

  it("フォーム送信成功時にメッセージを表示する", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    renderWithIntl(<AboutPage />);

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
    fireEvent.click(screen.getByText("SEND MESSAGE"));

    await waitFor(() => {
      expect(
        screen.getByText("送信しました。ありがとうございます。")
      ).toBeInTheDocument();
    });
  });

  it("フォーム送信失敗時にエラーメッセージを表示する", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    renderWithIntl(<AboutPage />);

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
    fireEvent.click(screen.getByText("SEND MESSAGE"));

    await waitFor(() => {
      expect(
        screen.getByText("送信に失敗しました。もう一度お試しください。")
      ).toBeInTheDocument();
    });
  });

  it("ネットワークエラー時にエラーメッセージを表示する", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    renderWithIntl(<AboutPage />);

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
    fireEvent.click(screen.getByText("SEND MESSAGE"));

    await waitFor(() => {
      expect(
        screen.getByText("送信に失敗しました。もう一度お試しください。")
      ).toBeInTheDocument();
    });
  });
});
