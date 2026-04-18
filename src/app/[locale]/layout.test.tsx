import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/font/google", () => ({
  Orbitron: vi.fn().mockReturnValue({ variable: "--font-orbitron" }),
  Inter: vi.fn().mockReturnValue({ variable: "--font-inter" }),
  Noto_Sans_JP: vi.fn().mockReturnValue({ variable: "--font-noto-sans-jp" }),
}));

const mockGetTranslations = vi.fn().mockResolvedValue(
  (key: string) => {
    const map: Record<string, string> = {
      "og.siteName": "THE PICKLE BANG THEORY",
    };
    return map[key] ?? key;
  }
);

vi.mock("next-intl/server", () => ({
  getMessages: vi.fn().mockResolvedValue({}),
  setRequestLocale: vi.fn(),
  getTranslations: (...args: unknown[]) => mockGetTranslations(...args),
}));

vi.mock("next-intl", () => ({
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  hasLocale: vi.fn((locales: string[], locale: string) =>
    locales.includes(locale)
  ),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

const mockHeadersGet = vi.fn<(name: string) => string | null>();

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({
    get: (name: string) => mockHeadersGet(name),
  }),
}));

vi.mock("../../globals.css", () => ({}));

import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

describe("LocaleLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHeadersGet.mockReturnValue(null);
  });

  it("renders children with ja locale", async () => {
    const { default: LocaleLayout } = await import("./layout");

    render(
      await LocaleLayout({
        children: <p>test content</p>,
        params: Promise.resolve({ locale: "ja" }),
      })
    );

    expect(screen.getByText("test content")).toBeInTheDocument();
    expect(setRequestLocale).toHaveBeenCalledWith("ja");
  });

  it("sets data-browser='ios-safari' on <html> when UA is iOS Safari", async () => {
    mockHeadersGet.mockReturnValue(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
    );
    const { default: LocaleLayout } = await import("./layout");

    const element = (await LocaleLayout({
      children: <p>ios content</p>,
      params: Promise.resolve({ locale: "ja" }),
    })) as React.ReactElement<{ "data-browser"?: string }>;

    expect(element.props["data-browser"]).toBe("ios-safari");
  });

  it("omits data-browser on <html> for non-iOS-Safari UA", async () => {
    mockHeadersGet.mockReturnValue(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    const { default: LocaleLayout } = await import("./layout");

    const element = (await LocaleLayout({
      children: <p>chrome content</p>,
      params: Promise.resolve({ locale: "ja" }),
    })) as React.ReactElement<{ "data-browser"?: string }>;

    expect(element.props["data-browser"]).toBeUndefined();
  });

  it("renders children with en locale", async () => {
    const { default: LocaleLayout } = await import("./layout");

    render(
      await LocaleLayout({
        children: <p>english content</p>,
        params: Promise.resolve({ locale: "en" }),
      })
    );

    expect(screen.getByText("english content")).toBeInTheDocument();
    expect(setRequestLocale).toHaveBeenCalledWith("en");
  });

  it("calls notFound for invalid locale", async () => {
    const { default: LocaleLayout } = await import("./layout");

    render(
      await LocaleLayout({
        children: <p>invalid</p>,
        params: Promise.resolve({ locale: "fr" }),
      })
    );

    expect(notFound).toHaveBeenCalled();
  });

  it("generates static params for all locales", async () => {
    const { generateStaticParams } = await import("./layout");

    const params = generateStaticParams();

    expect(params).toEqual([{ locale: "ja" }, { locale: "en" }]);
  });
});

describe("generateMetadata", () => {
  it("returns metadata with ja locale", async () => {
    const { generateMetadata } = await import("./layout");

    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "ja" }),
    });

    expect(metadata.openGraph).toBeDefined();
    expect(metadata.twitter).toEqual({ card: "summary_large_image" });
    expect(mockGetTranslations).toHaveBeenCalledWith({
      locale: "ja",
      namespace: "Metadata",
    });
  });

  it("returns metadata with en locale", async () => {
    const { generateMetadata } = await import("./layout");

    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en" }),
    });

    expect(metadata.openGraph).toBeDefined();
    expect(metadata.twitter).toEqual({ card: "summary_large_image" });
    expect(mockGetTranslations).toHaveBeenCalledWith({
      locale: "en",
      namespace: "Metadata",
    });
  });
});
