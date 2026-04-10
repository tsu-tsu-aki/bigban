// src/hooks/useMagneticButton.test.ts
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
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
    act(() => {
      result.current.handleMouseLeave();
    });
    expect(result.current.position).toEqual({ x: 0, y: 0 });
  });

  it("ref未設定時にhandleMouseMoveを呼んでもpositionが変わらない", () => {
    const { result } = renderHook(() => useMagneticButton());
    act(() => {
      result.current.handleMouseMove({
        clientX: 100,
        clientY: 100,
      } as React.MouseEvent);
    });
    expect(result.current.position).toEqual({ x: 0, y: 0 });
  });

  it("ref設定時にhandleMouseMoveでpositionが更新される", () => {
    const { result } = renderHook(() => useMagneticButton(0.5));

    const el = document.createElement("button");
    el.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      width: 100,
      height: 40,
      right: 100,
      bottom: 40,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    Object.defineProperty(result.current.ref, "current", {
      value: el,
      writable: true,
    });

    act(() => {
      result.current.handleMouseMove({
        clientX: 80,
        clientY: 30,
      } as React.MouseEvent);
    });

    // centerX=50, centerY=20, dx=30*0.5=15, dy=10*0.5=5
    expect(result.current.position.x).toBe(15);
    expect(result.current.position.y).toBe(5);
  });
});
