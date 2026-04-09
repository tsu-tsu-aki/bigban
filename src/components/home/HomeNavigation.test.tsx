import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageProvider } from "@/hooks/useLanguage";
import HomeNavigation from "./HomeNavigation";

import type { ReactElement } from "react";

let mockPathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

vi.mock("@/hooks/useActiveSection", () => ({
  useActiveSection: () => "concept",
}));

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, priority, ...rest } = props;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        {...rest}
        data-fill={fill ? "true" : undefined}
        data-priority={priority ? "true" : undefined}
      />
    );
  },
}));

function renderWithProvider(ui: ReactElement) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

const NAV_ITEMS = [
  { label: "CONCEPT", href: "/#concept" },
  { label: "FACILITY", href: "/#facility" },
  { label: "SERVICES", href: "/#services" },
  { label: "PRICING", href: "/#pricing" },
  { label: "ABOUT", href: "/#about" },
  { label: "ACCESS", href: "/#access" },
];

describe("HomeNavigation", () => {
  it("ロゴ画像を表示する", () => {
    renderWithProvider(<HomeNavigation />);
    const logo = screen.getByAltText("THE PICKLE BANG THEORY");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "/logos/yoko-neon.png");
  });

  it("ロゴが1つだけ表示される", () => {
    renderWithProvider(<HomeNavigation />);
    const logos = screen.getAllByAltText("THE PICKLE BANG THEORY");
    expect(logos).toHaveLength(1);
  });

  it("6つのデスクトップナビリンクと正しいhrefを表示する", () => {
    renderWithProvider(<HomeNavigation />);
    const nav = screen.getByRole("navigation", { name: "メインナビゲーション" });
    for (const item of NAV_ITEMS) {
      const link = screen.getByRole("link", { name: item.label });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", item.href);
      expect(nav).toContainElement(link);
    }
  });

  it("アクティブセクション(concept)をハイライトする", () => {
    renderWithProvider(<HomeNavigation />);
    const conceptLink = screen.getByRole("link", { name: "CONCEPT" });
    expect(conceptLink.className).toContain("text-accent");

    const facilityLink = screen.getByRole("link", { name: "FACILITY" });
    expect(facilityLink.className).not.toContain("text-accent");
  });

  it("JP/ENトグルが切り替わる", () => {
    renderWithProvider(<HomeNavigation />);
    const jpButtons = screen.getAllByRole("button", { name: "JP" });
    const enButtons = screen.getAllByRole("button", { name: "EN" });

    // デフォルトは日本語: JPが選択状態
    expect(jpButtons[0].className).toContain("text-text-light");
    expect(enButtons[0].className).toContain("text-text-gray");

    // ENをクリック
    fireEvent.click(enButtons[0]);

    // 全てのJP/ENボタンを再取得（状態変更後）
    const jpButtonsAfter = screen.getAllByRole("button", { name: "JP" });
    const enButtonsAfter = screen.getAllByRole("button", { name: "EN" });
    expect(jpButtonsAfter[0].className).toContain("text-text-gray");
    expect(enButtonsAfter[0].className).toContain("text-text-light");
  });

  it("RESERVEボタンを表示する", () => {
    renderWithProvider(<HomeNavigation />);
    const reserveLinks = screen.getAllByRole("link", { name: "RESERVE" });
    expect(reserveLinks.length).toBeGreaterThanOrEqual(1);
    expect(reserveLinks[0]).toHaveAttribute("href", "#");
  });

  it("ハンバーガーメニューの開閉", () => {
    renderWithProvider(<HomeNavigation />);

    // メニューを開く
    const openButton = screen.getByLabelText("メニューを開く");
    expect(openButton).toBeInTheDocument();
    fireEvent.click(openButton);

    // ダイアログが表示される
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    // 閉じるボタン
    const closeButton = screen.getByLabelText("メニューを閉じる");
    expect(closeButton).toBeInTheDocument();
    fireEvent.click(closeButton);

    // ダイアログが消える
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("モバイルメニューのナビリンククリックで自動クローズ", () => {
    renderWithProvider(<HomeNavigation />);

    // メニューを開く
    fireEvent.click(screen.getByLabelText("メニューを開く"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // モバイルメニュー内のリンクをクリック
    const dialog = screen.getByRole("dialog");
    const mobileLinks = dialog.querySelectorAll("a");
    expect(mobileLinks.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(mobileLinks[0]);

    // メニューが閉じる
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("固定配置である", () => {
    renderWithProvider(<HomeNavigation />);
    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();
    expect(header.className).toContain("fixed");
  });

  it("スクロールダウンでナビが非表示になる（デスクトップのみ）", () => {
    renderWithProvider(<HomeNavigation />);
    const header = screen.getByRole("banner");

    // 初期状態: 表示
    expect(header.className).toContain("translate-y-0");

    // 200pxスクロールダウン
    Object.defineProperty(window, "scrollY", { value: 200, writable: true });
    fireEvent.scroll(window);
    // デスクトップ (md:) でのみ非表示クラスを付与（iOS Safari対応）
    expect(header.className).toContain("md:-translate-y-full");
    // モバイルでは平坦な -translate-y-full を付与しない
    expect(header.className).not.toMatch(/(^| )-translate-y-full( |$)/);
  });

  it("スクロールアップでナビが再表示される", () => {
    renderWithProvider(<HomeNavigation />);
    const header = screen.getByRole("banner");

    // まず下にスクロール
    Object.defineProperty(window, "scrollY", { value: 200, writable: true });
    fireEvent.scroll(window);
    expect(header.className).toContain("md:-translate-y-full");

    // 上にスクロール
    Object.defineProperty(window, "scrollY", { value: 100, writable: true });
    fireEvent.scroll(window);
    expect(header.className).toContain("translate-y-0");
    expect(header.className).not.toContain("md:-translate-y-full");
  });

  it("スクロール位置が100px未満ではナビが表示される", () => {
    renderWithProvider(<HomeNavigation />);
    const header = screen.getByRole("banner");

    // 50pxの位置
    Object.defineProperty(window, "scrollY", { value: 50, writable: true });
    fireEvent.scroll(window);
    expect(header.className).toContain("translate-y-0");
  });

  it("ホームでロゴクリックするとページ最上部にスクロールする", () => {
    mockPathname = "/";
    const scrollSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    renderWithProvider(<HomeNavigation />);
    const logo = screen.getByAltText("THE PICKLE BANG THEORY");
    fireEvent.click(logo);
    expect(scrollSpy).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    scrollSpy.mockRestore();
  });

  it("他ページでロゴクリックしてもscrollToは呼ばれない", () => {
    mockPathname = "/about";
    const scrollSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    renderWithProvider(<HomeNavigation />);
    const logo = screen.getByAltText("THE PICKLE BANG THEORY");
    fireEvent.click(logo);
    expect(scrollSpy).not.toHaveBeenCalled();
    scrollSpy.mockRestore();
    mockPathname = "/";
  });

  it("モバイルメニュー内にRESERVEボタンがある", () => {
    renderWithProvider(<HomeNavigation />);
    fireEvent.click(screen.getByLabelText("メニューを開く"));
    const dialog = screen.getByRole("dialog");
    const reserveInDialog = dialog.querySelector("a[href='#']");
    expect(reserveInDialog).toBeInTheDocument();
    expect(reserveInDialog?.textContent).toBe("RESERVE");
  });
});
