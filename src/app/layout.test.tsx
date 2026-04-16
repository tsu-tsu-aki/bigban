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

  it("--safe-top CSS変数が safe-area-inset-top で定義されている", () => {
    expect(cssContent).toContain("--safe-top");
    expect(cssContent).toMatch(/safe-area-inset-top/);
  });

  it(".safe-area-top ユーティリティクラスが定義されている", () => {
    expect(cssContent).toMatch(/\.safe-area-top/);
  });
});
