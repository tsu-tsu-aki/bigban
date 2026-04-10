import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import jaMessages from "../../../messages/ja.json";
import HomeAccess from "./HomeAccess";

describe("HomeAccess", () => {
  it('セクションID "access" を持つ', () => {
    render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeAccess />
      </NextIntlClientProvider>
    );
    const section = document.getElementById("access");
    expect(section).toBeInTheDocument();
  });

  it('iframe を表示する（title="THE PICKLE BANG THEORY 所在地"）', () => {
    render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeAccess />
      </NextIntlClientProvider>
    );
    const iframe = screen.getByTitle("THE PICKLE BANG THEORY 所在地");
    expect(iframe).toBeInTheDocument();
    expect(iframe.tagName).toBe("IFRAME");
  });

  it("住所と郵便番号を表示する", () => {
    render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeAccess />
      </NextIntlClientProvider>
    );
    expect(screen.getByText(/千葉県市川市八幡2-16-6/)).toBeInTheDocument();
    expect(screen.getByText(/〒272-0021/)).toBeInTheDocument();
  });

  it("営業時間を表示する", () => {
    render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeAccess />
      </NextIntlClientProvider>
    );
    expect(screen.getByText(/6:00/)).toBeInTheDocument();
    expect(screen.getByText(/23:00/)).toBeInTheDocument();
  });

  it("3つの駅アクセスを表示する", () => {
    render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeAccess />
      </NextIntlClientProvider>
    );
    expect(screen.getByText(/本八幡駅.*北口/)).toBeInTheDocument();
    expect(screen.getByText(/都営新宿線/)).toBeInTheDocument();
    expect(screen.getByText(/京成八幡駅/)).toBeInTheDocument();
  });

  it("所要時間がアクセントカラーで表示される", () => {
    render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeAccess />
      </NextIntlClientProvider>
    );
    const walkTime = screen.getByText("徒歩1分");
    expect(walkTime.className).toContain("text-accent");
  });

  it("駐車場案内を表示する", () => {
    render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeAccess />
      </NextIntlClientProvider>
    );
    expect(screen.getByText(/コインパーキング/)).toBeInTheDocument();
  });

  it("bg-off-white 背景を持つ", () => {
    render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeAccess />
      </NextIntlClientProvider>
    );
    const section = document.getElementById("access");
    expect(section?.className).toContain("bg-off-white");
  });
});
