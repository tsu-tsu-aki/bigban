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
vi.mock("@/components/facility/FacilityHero", () => ({
  default: () => <section data-testid="facility-hero" />,
}));
vi.mock("@/components/facility/FacilityStory", () => ({
  default: () => <section data-testid="facility-story" />,
}));
vi.mock("@/components/facility/CourtDetails", () => ({
  default: () => <section data-testid="court-details" />,
}));
vi.mock("@/components/facility/Amenities", () => ({
  default: () => <section data-testid="amenities" />,
}));
vi.mock("@/components/facility/FounderDetail", () => ({
  default: () => <section data-testid="founder-detail" />,
}));
vi.mock("@/components/facility/CompanyInfo", () => ({
  default: () => <section data-testid="company-info" />,
}));
vi.mock("@/components/Footer", () => ({
  default: () => <footer data-testid="footer" />,
}));

// Dynamic import to get the default export (async server component)
// We test the rendered output by importing the component directly
const { default: FacilityPage } = await import("./page");

function renderWithIntl(ui: ReactElement, locale = "ja") {
  const messages = locale === "ja" ? jaMessages : enMessages;
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}

describe("FacilityPage", () => {
  it("全セクションをレンダリングする", async () => {
    const Page = await FacilityPage({ params: Promise.resolve({ locale: "ja" }) });
    renderWithIntl(Page);

    expect(screen.getByTestId("navigation")).toBeInTheDocument();
    expect(screen.getByTestId("facility-hero")).toBeInTheDocument();
    expect(screen.getByTestId("facility-story")).toBeInTheDocument();
    expect(screen.getByTestId("court-details")).toBeInTheDocument();
    expect(screen.getByTestId("amenities")).toBeInTheDocument();
    expect(screen.getByTestId("founder-detail")).toBeInTheDocument();
    expect(screen.getByTestId("company-info")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it("main要素でラップされている", async () => {
    const Page = await FacilityPage({ params: Promise.resolve({ locale: "ja" }) });
    renderWithIntl(Page);

    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});
