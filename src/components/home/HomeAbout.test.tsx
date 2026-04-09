import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import jaMessages from "../../../messages/ja.json";
import HomeAbout from "./HomeAbout";

import type React from "react";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, ...props }: Record<string, unknown>) => (
    <a href={href as string} {...props}>{children as React.ReactNode}</a>
  ),
}));

describe("HomeAbout", () => {
  it('セクションID "about" を持つ', () => {
    render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeAbout />
      </NextIntlClientProvider>
    );
    const section = document.getElementById("about");
    expect(section).toBeInTheDocument();
  });

  it("ABOUT USタイトルを表示する", () => {
    render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeAbout />
      </NextIntlClientProvider>
    );
    expect(screen.getByText("ABOUT US")).toBeInTheDocument();
  });

  it("西村昭彦の名前を表示する", () => {
    render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeAbout />
      </NextIntlClientProvider>
    );
    expect(screen.getByText("西村昭彦")).toBeInTheDocument();
  });

  it("FOUNDER & CEOラベルを表示する", () => {
    render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeAbout />
      </NextIntlClientProvider>
    );
    expect(screen.getByText("FOUNDER & CEO")).toBeInTheDocument();
  });

  it("英語名を表示する", () => {
    render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeAbout />
      </NextIntlClientProvider>
    );
    expect(screen.getByText("AKIHIKO NISHIMURA")).toBeInTheDocument();
  });

  it("概要テキストを表示する", () => {
    render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeAbout />
      </NextIntlClientProvider>
    );
    expect(
      screen.getByText(/クロスミントン世界選手権6度優勝/)
    ).toBeInTheDocument();
  });

  it("詳しく見るリンクを表示する", () => {
    render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeAbout />
      </NextIntlClientProvider>
    );
    expect(screen.getByText("詳しく見る")).toBeInTheDocument();
  });

  it("/aboutへのリンクを持つ", () => {
    render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeAbout />
      </NextIntlClientProvider>
    );
    const link = screen.getByText("詳しく見る").closest("a");
    expect(link).toHaveAttribute("href", "/about");
  });
});
