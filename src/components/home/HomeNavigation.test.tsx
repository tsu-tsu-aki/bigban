import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageProvider } from "@/hooks/useLanguage";
import HomeNavigation from "./HomeNavigation";

import type { ReactElement } from "react";

vi.mock("@/hooks/useActiveSection", () => ({
  useActiveSection: () => "concept",
}));

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, priority, ...rest } = props;
    return (
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
  { label: "CONCEPT", href: "#concept" },
  { label: "FACILITY", href: "#facility" },
  { label: "SERVICES", href: "#services" },
  { label: "PRICING", href: "#pricing" },
  { label: "ACCESS", href: "#access" },
  { label: "CONTACT", href: "#contact" },
];

describe("HomeNavigation", () => {
  it("ロゴ画像を表示する", () => {
    renderWithProvider(<HomeNavigation />);
    const logo = screen.getByAltText("THE PICKLE BANG THEORY");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "/logos/yoko-w.png");
  });

  it("モバイル用マーク画像を表示する", () => {
    renderWithProvider(<HomeNavigation />);
    const mark = screen.getByAltText("THE PICKLE BANG THEORY mark");
    expect(mark).toBeInTheDocument();
    expect(mark).toHaveAttribute("src", "/logos/mark-w.png");
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
    expect(jpButtons[0].className).toContain("text-off-white");
    expect(enButtons[0].className).toContain("text-text-gray");

    // ENをクリック
    fireEvent.click(enButtons[0]);

    // 全てのJP/ENボタンを再取得（状態変更後）
    const jpButtonsAfter = screen.getAllByRole("button", { name: "JP" });
    const enButtonsAfter = screen.getAllByRole("button", { name: "EN" });
    expect(jpButtonsAfter[0].className).toContain("text-text-gray");
    expect(enButtonsAfter[0].className).toContain("text-off-white");
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

  it("モバイルメニュー内にRESERVEボタンがある", () => {
    renderWithProvider(<HomeNavigation />);
    fireEvent.click(screen.getByLabelText("メニューを開く"));
    const dialog = screen.getByRole("dialog");
    const reserveInDialog = dialog.querySelector("a[href='#']");
    expect(reserveInDialog).toBeInTheDocument();
    expect(reserveInDialog?.textContent).toBe("RESERVE");
  });
});
