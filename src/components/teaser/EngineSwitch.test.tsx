import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { EngineSwitch } from "./EngineSwitch";
import type { BigBangConfig } from "./types";

describe("EngineSwitch", () => {
  const defaultConfig: BigBangConfig = {
    explosionStyle: "physics",
    duration: "medium",
  };

  it("エンジン切り替えボタンが表示される", () => {
    render(
      <EngineSwitch
        engine="canvas"
        config={defaultConfig}
        onEngineChange={vi.fn()}
        onConfigChange={vi.fn()}
        onReplay={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: /canvas/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /webgl/i })).toBeInTheDocument();
  });

  it("爆発パターン切り替えボタンが表示される", () => {
    render(
      <EngineSwitch
        engine="canvas"
        config={defaultConfig}
        onEngineChange={vi.fn()}
        onConfigChange={vi.fn()}
        onReplay={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: /physics/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /neon/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /minimal/i })).toBeInTheDocument();
  });

  it("尺切り替えボタンが表示される", () => {
    render(
      <EngineSwitch
        engine="canvas"
        config={defaultConfig}
        onEngineChange={vi.fn()}
        onConfigChange={vi.fn()}
        onReplay={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: /short/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /medium/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /long/i })).toBeInTheDocument();
  });

  it("リプレイボタンが表示される", () => {
    render(
      <EngineSwitch
        engine="canvas"
        config={defaultConfig}
        onEngineChange={vi.fn()}
        onConfigChange={vi.fn()}
        onReplay={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: /play/i })).toBeInTheDocument();
  });

  it("エンジンを切り替えるとコールバックが呼ばれる", async () => {
    const user = userEvent.setup();
    const onEngineChange = vi.fn();

    render(
      <EngineSwitch
        engine="canvas"
        config={defaultConfig}
        onEngineChange={onEngineChange}
        onConfigChange={vi.fn()}
        onReplay={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /webgl/i }));
    expect(onEngineChange).toHaveBeenCalledWith("webgl");
  });

  it("爆発パターンを切り替えるとコールバックが呼ばれる", async () => {
    const user = userEvent.setup();
    const onConfigChange = vi.fn();

    render(
      <EngineSwitch
        engine="canvas"
        config={defaultConfig}
        onEngineChange={vi.fn()}
        onConfigChange={onConfigChange}
        onReplay={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /neon/i }));
    expect(onConfigChange).toHaveBeenCalledWith({ ...defaultConfig, explosionStyle: "neon" });
  });

  it("尺を切り替えるとコールバックが呼ばれる", async () => {
    const user = userEvent.setup();
    const onConfigChange = vi.fn();

    render(
      <EngineSwitch
        engine="canvas"
        config={defaultConfig}
        onEngineChange={vi.fn()}
        onConfigChange={onConfigChange}
        onReplay={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /long/i }));
    expect(onConfigChange).toHaveBeenCalledWith({ ...defaultConfig, duration: "long" });
  });

  it("リプレイボタンを押すとコールバックが呼ばれる", async () => {
    const user = userEvent.setup();
    const onReplay = vi.fn();

    render(
      <EngineSwitch
        engine="canvas"
        config={defaultConfig}
        onEngineChange={vi.fn()}
        onConfigChange={vi.fn()}
        onReplay={onReplay}
      />
    );

    await user.click(screen.getByRole("button", { name: /play/i }));
    expect(onReplay).toHaveBeenCalled();
  });

  it("現在選択中のエンジンがアクティブ表示される", () => {
    render(
      <EngineSwitch
        engine="canvas"
        config={defaultConfig}
        onEngineChange={vi.fn()}
        onConfigChange={vi.fn()}
        onReplay={vi.fn()}
      />
    );

    const canvasBtn = screen.getByRole("button", { name: /canvas/i });
    expect(canvasBtn).toHaveAttribute("aria-pressed", "true");
  });
});
