import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import NewsError from "./error";

describe("news error.tsx", () => {
  it("reset ボタンで reset を呼ぶ", () => {
    const reset = vi.fn();
    render(<NewsError error={new Error("x")} reset={reset} />);
    fireEvent.click(screen.getByRole("button", { name: "再試行" }));
    expect(reset).toHaveBeenCalled();
  });
});
