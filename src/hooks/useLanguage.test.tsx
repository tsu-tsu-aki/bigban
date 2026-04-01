// src/hooks/useLanguage.test.ts
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { render, screen } from "@testing-library/react";
import React from "react";
import { LanguageProvider, useLanguage } from "./useLanguage";
import type { ReactNode } from "react";

function wrapper({ children }: { children: ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}

describe("useLanguage", () => {
  it("デフォルトは 'ja'", () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    expect(result.current.language).toBe("ja");
  });

  it("'en' に切り替えて 'ja' に戻る", () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });

    act(() => result.current.toggleLanguage());
    expect(result.current.language).toBe("en");

    act(() => result.current.toggleLanguage());
    expect(result.current.language).toBe("ja");
  });

  it("複数のコンシューマーに一貫した状態を提供する", () => {
    function DisplayLang() {
      const { language } = useLanguage();
      return <span data-testid="lang">{language}</span>;
    }
    function ToggleButton() {
      const { toggleLanguage } = useLanguage();
      return <button onClick={toggleLanguage}>toggle</button>;
    }

    render(
      <LanguageProvider>
        <DisplayLang />
        <ToggleButton />
      </LanguageProvider>
    );

    expect(screen.getByTestId("lang")).toHaveTextContent("ja");
  });

  it("LanguageProvider外で使用するとエラーを投げる", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useLanguage())).toThrow(
      "useLanguage must be used within a LanguageProvider"
    );
    spy.mockRestore();
  });
});
