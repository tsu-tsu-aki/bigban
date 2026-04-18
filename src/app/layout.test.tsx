import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "fs";
import path from "path";

vi.mock("./globals.css", () => ({}));

describe("RootLayout", () => {
  it("RootLayout が children をそのまま返す", async () => {
    const { default: RootLayout } = await import("./layout");

    render(
      <RootLayout>
        <p>test child</p>
      </RootLayout>
    );

    expect(screen.getByText("test child")).toBeInTheDocument();
  });

  it("theme-color 用の viewport export が設定されている", async () => {
    const { viewport } = await import("./layout");

    expect(viewport).toMatchObject({
      themeColor: "#000000",
    });
  });
});

describe("globals.css", () => {
  const cssContent = readFileSync(
    path.resolve(__dirname, "globals.css"),
    "utf-8"
  );

  it("--font-sans に Noto Sans JP が含まれる", () => {
    expect(cssContent).toMatch(/--font-sans:.*Noto Sans JP/);
  });

  it("body に font-feature-settings: \"palt\" が設定されている", () => {
    expect(cssContent).toMatch(/font-feature-settings:\s*"palt"/);
  });

  it("site header 用の safe area 変数と utility が定義されている", () => {
    expect(cssContent).toMatch(/--site-header-safe-top:\s*env\(safe-area-inset-top,\s*0px\)/);
    expect(cssContent).toMatch(/\.site-header-shell/);
    expect(cssContent).toMatch(/\.site-header-offset/);
  });
});
