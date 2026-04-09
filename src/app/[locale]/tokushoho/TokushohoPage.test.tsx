import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import jaMessages from "../../../../messages/ja.json";
import enMessages from "../../../../messages/en.json";

import TokushohoContent from "./TokushohoContent";

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

vi.mock("next/navigation", () => ({
  usePathname: () => "/tokushoho",
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: Record<string, unknown>) => (
    <a href={href as string} {...props}>{children as React.ReactNode}</a>
  ),
  usePathname: () => "/tokushoho",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

vi.stubGlobal("IntersectionObserver", class {
  observe() {}
  unobserve() {}
  disconnect() {}
});

function renderWithIntl(ui: React.ReactElement, locale = "ja") {
  const messages = locale === "ja" ? jaMessages : enMessages;
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}

describe("TokushohoContent", () => {
  describe("日本語", () => {
    it("ページタイトルを表示する", () => {
      renderWithIntl(<TokushohoContent />);
      expect(
        screen.getByRole("heading", { name: "特定商取引法に基づく表記" })
      ).toBeInTheDocument();
    });

    it("販売者情報を表示する", () => {
      renderWithIntl(<TokushohoContent />);
      expect(screen.getByText("RST Agency株式会社")).toBeInTheDocument();
      expect(screen.getByText("西村昭彦")).toBeInTheDocument();
    });

    it("電話番号がtel:リンクとして表示される", () => {
      renderWithIntl(<TokushohoContent />);
      const link = screen.getByRole("link", { name: "090 5523 3879" });
      expect(link).toHaveAttribute("href", "tel:09055233879");
    });

    it("メールアドレスがmailto:リンクとして表示される", () => {
      renderWithIntl(<TokushohoContent />);
      const link = screen.getByRole("link", { name: "hello@rstagency.com" });
      expect(link).toHaveAttribute("href", "mailto:hello@rstagency.com");
    });

    it("ホームページURLを外部リンクとして表示する", () => {
      renderWithIntl(<TokushohoContent />);
      const link = screen.getByRole("link", { name: "https://rstagency.com" });
      expect(link).toHaveAttribute("href", "https://rstagency.com");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("全16項目が表示される", () => {
      renderWithIntl(<TokushohoContent />);
      const terms = screen.getAllByRole("term");
      expect(terms).toHaveLength(16);
    });

    it("フッターが表示される", () => {
      renderWithIntl(<TokushohoContent />);
      expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    });
  });

  describe("英語", () => {
    it("英語のタイトルを表示する", () => {
      renderWithIntl(<TokushohoContent />, "en");
      expect(
        screen.getByRole("heading", { name: "Specified Commercial Transactions Act" })
      ).toBeInTheDocument();
    });

    it("英語の販売者情報を表示する", () => {
      renderWithIntl(<TokushohoContent />, "en");
      expect(screen.getByText("RST Agency Inc.")).toBeInTheDocument();
      expect(screen.getByText("Akihiko Nishimura")).toBeInTheDocument();
    });
  });
});
