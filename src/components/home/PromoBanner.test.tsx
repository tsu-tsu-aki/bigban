import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import PromoBanner from "./PromoBanner";
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

describe("PromoBanner", () => {
  it("renders Japanese promotional text with discount emoji (VS16 forced)", () => {
    renderWithIntl(<PromoBanner />, "ja");
    expect(
      screen.getByText(/🈹\uFE0F コート30%OFFキャンペーン中/),
    ).toBeInTheDocument();
    expect(screen.getByText(/PBTOPEN30/)).toBeInTheDocument();
  });

  it("renders English promotional text with discount emoji when locale is en", () => {
    renderWithIntl(<PromoBanner />, "en");
    expect(screen.getByText(/🈹\uFE0F 30% OFF CAMPAIGN/)).toBeInTheDocument();
  });

  it("links to the reserve URL opening in a new tab with safe rel", () => {
    renderWithIntl(<PromoBanner />, "ja");
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://reserva.be/tpbt");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("exposes an accessible label describing the link destination", () => {
    renderWithIntl(<PromoBanner />, "ja");
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "aria-label",
      "コート30%OFFキャンペーン。予約ページへ移動します",
    );
  });
});
