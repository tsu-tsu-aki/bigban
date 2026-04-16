import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import CrowdfundingPopup from "./CrowdfundingPopup";
import jaMessages from "../../../messages/ja.json";
import enMessages from "../../../messages/en.json";

import type { ReactElement } from "react";

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

const CAMPFIRE_URL =
  "https://camp-fire.jp/projects/926247/view?utm_campaign=cp_po_share_c_msg_mypage_projects_show";

describe("CrowdfundingPopup", () => {
  it("isOpen=trueでダイアログが表示される", () => {
    renderWithIntl(<CrowdfundingPopup isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("クラファン実施中！")).toBeInTheDocument();
    expect(
      screen.getByText(
        "PBTを一緒に育て上げてくれる方、盛り上げてくれる方を募集します"
      )
    ).toBeInTheDocument();
  });

  it("isOpen=falseでダイアログが非表示", () => {
    renderWithIntl(<CrowdfundingPopup isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("閉じるボタンクリックでonCloseが呼ばれる", () => {
    const onClose = vi.fn();
    renderWithIntl(<CrowdfundingPopup isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText("閉じる"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("背景クリックでonCloseが呼ばれる", () => {
    const onClose = vi.fn();
    renderWithIntl(<CrowdfundingPopup isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByTestId("crowdfunding-backdrop"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("ESCキーでonCloseが呼ばれる", () => {
    const onClose = vi.fn();
    renderWithIntl(<CrowdfundingPopup isOpen={true} onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("CTAリンクがCAMP-FIRE URLを持つ", () => {
    renderWithIntl(<CrowdfundingPopup isOpen={true} onClose={vi.fn()} />);
    const ctaLink = screen.getByRole("link", { name: /CAMP-FIRE/ });
    expect(ctaLink).toHaveAttribute("href", CAMPFIRE_URL);
    expect(ctaLink).toHaveAttribute("target", "_blank");
    expect(ctaLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("aria-modal, role=dialog, aria-labelledbyが設定されている", () => {
    renderWithIntl(<CrowdfundingPopup isOpen={true} onClose={vi.fn()} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "crowdfunding-title");
    expect(screen.getByText("クラファン実施中！")).toHaveAttribute(
      "id",
      "crowdfunding-title"
    );
  });

  it("クラファン画像が表示される", () => {
    renderWithIntl(<CrowdfundingPopup isOpen={true} onClose={vi.fn()} />);
    const img = screen.getByAltText(
      "THE PICKLE BANG THEORY クラウドファンディング"
    );
    expect(img).toBeInTheDocument();
  });

  it("ENロケールで英語テキストが表示される", () => {
    renderWithIntl(
      <CrowdfundingPopup isOpen={true} onClose={vi.fn()} />,
      "en"
    );
    expect(screen.getByText("Crowdfunding Now Live!")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /CAMP-FIRE/ })).toBeInTheDocument();
  });
});
