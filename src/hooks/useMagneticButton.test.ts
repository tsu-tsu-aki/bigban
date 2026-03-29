// src/hooks/useMagneticButton.test.ts
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useMagneticButton } from "./useMagneticButton";

describe("useMagneticButton", () => {
  it("refとpositionステートを返す", () => {
    const { result } = renderHook(() => useMagneticButton());
    expect(result.current.ref).toBeDefined();
    expect(result.current.position).toEqual({ x: 0, y: 0 });
  });

  it("リセットハンドラーを返す", () => {
    const { result } = renderHook(() => useMagneticButton());
    expect(typeof result.current.handleMouseLeave).toBe("function");
  });

  it("マウス移動ハンドラーを返す", () => {
    const { result } = renderHook(() => useMagneticButton());
    expect(typeof result.current.handleMouseMove).toBe("function");
  });

  it("マウスリーブでpositionをリセットする", () => {
    const { result } = renderHook(() => useMagneticButton());
    result.current.handleMouseLeave();
    expect(result.current.position).toEqual({ x: 0, y: 0 });
  });
});
