import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import CrowdfundingBadge from "./CrowdfundingBadge";
import jaMessages from "../../../messages/ja.json";
import enMessages from "../../../messages/en.json";

import type { ReactElement } from "react";

function renderWithIntl(ui: ReactElement, locale: "ja" | "en" = "ja") {
  const messages = locale === "ja" ? jaMessages : enMessages;
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}

describe("CrowdfundingBadge", () => {
  it("button要素としてレンダリングされる", () => {
    renderWithIntl(<CrowdfundingBadge onClick={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: "クラウドファンディング情報を開く" })
    ).toBeInTheDocument();
  });

  it("クリックでonClickが呼ばれる", () => {
    const onClick = vi.fn();
    renderWithIntl(<CrowdfundingBadge onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("バッジラベルが表示される", () => {
    renderWithIntl(<CrowdfundingBadge onClick={vi.fn()} />);
    expect(screen.getByText("クラファン募集中")).toBeInTheDocument();
  });

  it("ENロケールで英語ラベルが表示される", () => {
    renderWithIntl(<CrowdfundingBadge onClick={vi.fn()} />, "en");
    expect(screen.getByText("CROWDFUNDING")).toBeInTheDocument();
  });
});
