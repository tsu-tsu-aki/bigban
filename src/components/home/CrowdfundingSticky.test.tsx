import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import CrowdfundingSticky from "./CrowdfundingSticky";
import jaMessages from "../../../messages/ja.json";
import enMessages from "../../../messages/en.json";

import type { ReactElement } from "react";

const SESSION_KEY = "bigban-crowdfunding-sticky-dismissed";

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
    </NextIntlClientProvider>,
  );
}

describe("CrowdfundingSticky", () => {
  beforeEach(() => {
    sessionStorage.removeItem(SESSION_KEY);
  });

  afterEach(() => {
    sessionStorage.removeItem(SESSION_KEY);
    vi.restoreAllMocks();
  });

  it("初期状態でカードが表示される (sessionStorage が空)", () => {
    renderWithIntl(<CrowdfundingSticky />);
    expect(screen.getByTestId("crowdfunding-sticky")).toBeInTheDocument();
  });

  it("headline / bonus / CTA を表示する (ja)", () => {
    renderWithIntl(<CrowdfundingSticky />);
    expect(screen.getByText("クラファン実施中！")).toBeInTheDocument();
    expect(
      screen.getByText("目標金額100%達成で6月も30%OFF🔥"),
    ).toBeInTheDocument();
    const cta = screen.getByRole("link", { name: /CAMP-FIRE/ });
    expect(cta).toHaveAttribute(
      "href",
      "https://camp-fire.jp/projects/926247/view?utm_campaign=cp_po_share_c_msg_mypage_projects_show",
    );
    expect(cta).toHaveAttribute("target", "_blank");
    expect(cta).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("クラファン画像が表示される", () => {
    renderWithIntl(<CrowdfundingSticky />);
    const img = screen.getByAltText(
      "THE PICKLE BANG THEORY クラウドファンディング",
    );
    expect(img).toBeInTheDocument();
    expect(img.getAttribute("src")).toBe("/images/crowdfunding.avif");
  });

  it("EN ロケールで英語表示", () => {
    renderWithIntl(<CrowdfundingSticky />, "en");
    expect(screen.getByText("Crowdfunding Now Live!")).toBeInTheDocument();
    expect(screen.getByText(/100% goal reached/)).toBeInTheDocument();
  });

  it("閉じるボタンで非表示になり sessionStorage に保存", () => {
    renderWithIntl(<CrowdfundingSticky />);
    expect(screen.getByTestId("crowdfunding-sticky")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("閉じる"));
    expect(screen.queryByTestId("crowdfunding-sticky")).not.toBeInTheDocument();
    expect(sessionStorage.getItem(SESSION_KEY)).toBe("true");
  });

  it("sessionStorage に dismissed フラグがあれば最初から非表示", () => {
    sessionStorage.setItem(SESSION_KEY, "true");
    renderWithIntl(<CrowdfundingSticky />);
    expect(screen.queryByTestId("crowdfunding-sticky")).not.toBeInTheDocument();
  });

  it("sessionStorage 読み取りエラーでもクラッシュしない (デフォルト表示)", () => {
    const originalGetItem = Storage.prototype.getItem;
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Access denied");
    });
    renderWithIntl(<CrowdfundingSticky />);
    expect(screen.getByTestId("crowdfunding-sticky")).toBeInTheDocument();
    Storage.prototype.getItem = originalGetItem;
  });

  it("sessionStorage 書き込みエラーでも閉じれる", () => {
    const originalSetItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Access denied");
    });
    renderWithIntl(<CrowdfundingSticky />);
    fireEvent.click(screen.getByLabelText("閉じる"));
    expect(screen.queryByTestId("crowdfunding-sticky")).not.toBeInTheDocument();
    Storage.prototype.setItem = originalSetItem;
  });

  it("z-index が CrowdfundingPopup (z-70) より下 (z-40) に配置される", () => {
    renderWithIntl(<CrowdfundingSticky />);
    const card = screen.getByTestId("crowdfunding-sticky");
    expect(card.className).toContain("z-40");
    expect(card.className).toContain("fixed");
    expect(card.className).toMatch(/bottom-/);
    expect(card.className).toMatch(/right-/);
  });
});
