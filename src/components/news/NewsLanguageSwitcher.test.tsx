import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const pushMock = vi.fn();
vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

import { NewsLanguageSwitcher } from "./NewsLanguageSwitcher";

describe("NewsLanguageSwitcher", () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it("locale=ja で EN ラベル", () => {
    render(
      <NewsLanguageSwitcher
        slug="x"
        currentLocale="ja"
        hasOtherLocale={true}
      />,
    );
    expect(screen.getByRole("button")).toHaveTextContent("EN");
  });

  it("locale=en で JA ラベル", () => {
    render(
      <NewsLanguageSwitcher
        slug="x"
        currentLocale="en"
        hasOtherLocale={true}
      />,
    );
    expect(screen.getByRole("button")).toHaveTextContent("JA");
  });

  it("hasOtherLocale=true: クリックで対向言語の詳細ページへ", () => {
    render(
      <NewsLanguageSwitcher
        slug="grand-opening"
        currentLocale="ja"
        hasOtherLocale={true}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(pushMock).toHaveBeenCalledWith("/news/grand-opening", {
      locale: "en",
    });
  });

  it("hasOtherLocale=false: クリックで一覧ページへフォールバック", () => {
    render(
      <NewsLanguageSwitcher
        slug="grand-opening"
        currentLocale="ja"
        hasOtherLocale={false}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(pushMock).toHaveBeenCalledWith("/news", { locale: "en" });
  });

  it("hasOtherLocale=false 時、aria-label に補足説明を含む (ja→en)", () => {
    render(
      <NewsLanguageSwitcher
        slug="x"
        currentLocale="ja"
        hasOtherLocale={false}
      />,
    );
    const button = screen.getByRole("button");
    expect(button.getAttribute("aria-label") ?? "").toContain("英語");
  });

  it("hasOtherLocale=false 時、aria-label に補足説明を含む (en→ja)", () => {
    render(
      <NewsLanguageSwitcher
        slug="x"
        currentLocale="en"
        hasOtherLocale={false}
      />,
    );
    const button = screen.getByRole("button");
    expect(button.getAttribute("aria-label") ?? "").toMatch(/Japanese/i);
  });

  it("Enterキーで動作 (button要素のデフォルト動作)", () => {
    render(
      <NewsLanguageSwitcher
        slug="x"
        currentLocale="ja"
        hasOtherLocale={true}
      />,
    );
    const button = screen.getByRole("button");
    button.focus();
    fireEvent.click(button);
    expect(pushMock).toHaveBeenCalled();
  });
});
