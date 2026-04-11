import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import HomeNavigation from "./HomeNavigation";
import jaMessages from "../../../messages/ja.json";
import enMessages from "../../../messages/en.json";

import type { ReactElement } from "react";

let mockPathname = "/";
const mockPush = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, onClick, ...props }: Record<string, unknown>) => (
    <a href={href as string} onClick={onClick as React.MouseEventHandler} {...props}>{children as React.ReactNode}</a>
  ),
  usePathname: () => mockPathname,
  useRouter: () => ({ push: mockPush }),
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

function renderWithIntl(ui: ReactElement, locale: "ja" | "en" = "ja") {
  const messages = locale === "ja" ? jaMessages : enMessages;
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
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
    renderWithIntl(<HomeNavigation />);
    const logo = screen.getByAltText("THE PICKLE BANG THEORY");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "/logos/yoko-neon.png");
  });

  it("ロゴが1つだけ表示される", () => {
    renderWithIntl(<HomeNavigation />);
    const logos = screen.getAllByAltText("THE PICKLE BANG THEORY");
    expect(logos).toHaveLength(1);
  });

  it("6つのデスクトップナビリンクと正しいhrefを表示する", () => {
    renderWithIntl(<HomeNavigation />);
    const nav = screen.getByRole("navigation", { name: "メインナビゲーション" });
    for (const item of NAV_ITEMS) {
      const link = screen.getByRole("link", { name: item.label });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", item.href);
      expect(nav).toContainElement(link);
    }
  });

  it("アクティブセクション(concept)をハイライトする", () => {
    renderWithIntl(<HomeNavigation />);
    const conceptLink = screen.getByRole("link", { name: "CONCEPT" });
    expect(conceptLink.className).toContain("text-accent");

    const facilityLink = screen.getByRole("link", { name: "FACILITY" });
    expect(facilityLink.className).not.toContain("text-accent");
  });

  it("ENクリックでrouter.pushが呼ばれる", () => {
    mockPush.mockClear();
    renderWithIntl(<HomeNavigation />);
    const enButtons = screen.getAllByRole("button", { name: "EN" });

    fireEvent.click(enButtons[0]);

    expect(mockPush).toHaveBeenCalledWith("/", { locale: "en" });
  });

  it("JPクリック（既にja）ではrouter.pushは呼ばれない", () => {
    mockPush.mockClear();
    renderWithIntl(<HomeNavigation />);
    const jpButtons = screen.getAllByRole("button", { name: "JP" });

    fireEvent.click(jpButtons[0]);

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("RESERVEボタンを表示する", () => {
    renderWithIntl(<HomeNavigation />);
    const reserveLinks = screen.getAllByRole("link", { name: "RESERVE" });
    expect(reserveLinks.length).toBeGreaterThanOrEqual(1);
    expect(reserveLinks[0]).toHaveAttribute("href", "https://reserva.be/tpbt");
    expect(reserveLinks[0]).toHaveAttribute("target", "_blank");
    expect(reserveLinks[0]).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("ハンバーガーメニューの開閉", () => {
    renderWithIntl(<HomeNavigation />);

    const openButton = screen.getByLabelText("メニューを開く");
    expect(openButton).toBeInTheDocument();
    fireEvent.click(openButton);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    const closeButton = screen.getByLabelText("メニューを閉じる");
    expect(closeButton).toBeInTheDocument();
    fireEvent.click(closeButton);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("モバイルメニューのナビリンククリックで自動クローズ", () => {
    renderWithIntl(<HomeNavigation />);

    fireEvent.click(screen.getByLabelText("メニューを開く"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    const dialog = screen.getByRole("dialog");
    const mobileLinks = dialog.querySelectorAll("a");
    expect(mobileLinks.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(mobileLinks[0]);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("固定配置である", () => {
    renderWithIntl(<HomeNavigation />);
    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();
    expect(header.className).toContain("fixed");
  });

  it("スクロールダウンでナビが非表示になる", () => {
    renderWithIntl(<HomeNavigation />);
    const header = screen.getByRole("banner");

    expect(header.className).toContain("translate-y-0");

    Object.defineProperty(window, "scrollY", { value: 200, writable: true });
    fireEvent.scroll(window);
    expect(header.className).toContain("-translate-y-full");
  });

  it("スクロールアップでナビが再表示される", () => {
    renderWithIntl(<HomeNavigation />);
    const header = screen.getByRole("banner");

    Object.defineProperty(window, "scrollY", { value: 200, writable: true });
    fireEvent.scroll(window);
    expect(header.className).toContain("-translate-y-full");

    Object.defineProperty(window, "scrollY", { value: 100, writable: true });
    fireEvent.scroll(window);
    expect(header.className).toContain("translate-y-0");
  });

  it("スクロール位置が100px未満ではナビが表示される", () => {
    renderWithIntl(<HomeNavigation />);
    const header = screen.getByRole("banner");

    Object.defineProperty(window, "scrollY", { value: 50, writable: true });
    fireEvent.scroll(window);
    expect(header.className).toContain("translate-y-0");
  });

  it("ホームでロゴクリックするとページ最上部にスクロールする", () => {
    mockPathname = "/";
    const scrollSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    renderWithIntl(<HomeNavigation />);
    const logo = screen.getByAltText("THE PICKLE BANG THEORY");
    fireEvent.click(logo);
    expect(scrollSpy).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    scrollSpy.mockRestore();
  });

  it("他ページでロゴクリックしてもscrollToは呼ばれない", () => {
    mockPathname = "/about";
    const scrollSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    renderWithIntl(<HomeNavigation />);
    const logo = screen.getByAltText("THE PICKLE BANG THEORY");
    fireEvent.click(logo);
    expect(scrollSpy).not.toHaveBeenCalled();
    scrollSpy.mockRestore();
    mockPathname = "/";
  });

  it("モバイルメニュー内にRESERVEボタンがある", () => {
    renderWithIntl(<HomeNavigation />);
    fireEvent.click(screen.getByLabelText("メニューを開く"));
    const dialog = screen.getByRole("dialog");
    const reserveInDialog = dialog.querySelector("a[href='https://reserva.be/tpbt']");
    expect(reserveInDialog).toBeInTheDocument();
    expect(reserveInDialog?.textContent).toBe("RESERVE");
  });

  it("英語ロケールでaria-labelが英語になる", () => {
    renderWithIntl(<HomeNavigation />, "en");
    const nav = screen.getByRole("navigation", { name: "Main Navigation" });
    expect(nav).toBeInTheDocument();
  });
});
