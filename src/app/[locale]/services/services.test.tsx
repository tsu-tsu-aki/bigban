import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import jaMessages from "../../../../messages/ja.json";
import enMessages from "../../../../messages/en.json";

import type { ReactElement } from "react";

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(),
  setRequestLocale: vi.fn(),
}));

// Mock child components to isolate page-level testing
vi.mock("@/components/Navigation", () => ({
  default: () => <nav data-testid="navigation" />,
}));
vi.mock("@/components/services/ServicesHero", () => ({
  default: () => <section data-testid="services-hero" />,
}));
vi.mock("@/components/services/ServicesList", () => ({
  default: () => <section data-testid="services-list" />,
}));
vi.mock("@/components/services/BottomCTA", () => ({
  default: () => <section data-testid="bottom-cta" />,
}));
vi.mock("@/components/Footer", () => ({
  default: () => <footer data-testid="footer" />,
}));

const { default: ServicesPage } = await import("./page");

function renderWithIntl(ui: ReactElement, locale = "ja") {
  const messages = locale === "ja" ? jaMessages : enMessages;
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}

describe("ServicesPage", () => {
  it("全セクションをレンダリングする", async () => {
    const Page = await ServicesPage({ params: Promise.resolve({ locale: "ja" }) });
    renderWithIntl(Page);

    expect(screen.getByTestId("navigation")).toBeInTheDocument();
    expect(screen.getByTestId("services-hero")).toBeInTheDocument();
    expect(screen.getByTestId("services-list")).toBeInTheDocument();
    expect(screen.getByTestId("bottom-cta")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it("main要素でラップされている", async () => {
    const Page = await ServicesPage({ params: Promise.resolve({ locale: "ja" }) });
    renderWithIntl(Page);

    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});
