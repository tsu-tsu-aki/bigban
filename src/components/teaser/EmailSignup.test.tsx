import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EmailSignup } from "./EmailSignup";

const fetchMock = vi.fn();
globalThis.fetch = fetchMock;

describe("EmailSignup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("メール入力フィールドと送信ボタンが表示される", () => {
    render(<EmailSignup />);

    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /登録ｽﾙ/ })).toBeInTheDocument();
  });

  it("送信成功後に確認メッセージが表示される", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const user = userEvent.setup();
    render(<EmailSignup />);

    await user.type(screen.getByPlaceholderText("your@email.com"), "test@example.com");
    await user.click(screen.getByRole("button", { name: /登録ｽﾙ/ }));

    await waitFor(() => {
      expect(screen.getByText(/登録が完了しました/)).toBeInTheDocument();
    });
    expect(screen.queryByPlaceholderText("your@email.com")).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com" }),
    });
  });

  it("送信中はボタンと入力が無効化される", async () => {
    let resolvePromise!: (value: unknown) => void;
    fetchMock.mockReturnValue(new Promise((resolve) => { resolvePromise = resolve; }));

    const user = userEvent.setup();
    render(<EmailSignup />);

    await user.type(screen.getByPlaceholderText("your@email.com"), "test@example.com");
    await user.click(screen.getByRole("button", { name: /登録ｽﾙ/ }));

    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByPlaceholderText("your@email.com")).toBeDisabled();

    resolvePromise({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await waitFor(() => {
      expect(screen.getByText(/登録が完了しました/)).toBeInTheDocument();
    });
  });

  it("送信失敗時にエラーメッセージが表示される", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ success: false, error: "失敗" }),
    });

    const user = userEvent.setup();
    render(<EmailSignup />);

    await user.type(screen.getByPlaceholderText("your@email.com"), "test@example.com");
    await user.click(screen.getByRole("button", { name: /登録ｽﾙ/ }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /登録ｽﾙ/ })).toBeEnabled();
  });

  it("ネットワークエラー時にエラーメッセージが表示される", async () => {
    fetchMock.mockRejectedValue(new Error("Network error"));

    const user = userEvent.setup();
    render(<EmailSignup />);

    await user.type(screen.getByPlaceholderText("your@email.com"), "test@example.com");
    await user.click(screen.getByRole("button", { name: /登録ｽﾙ/ }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /登録ｽﾙ/ })).toBeEnabled();
  });

  it("空メールでは送信されない", async () => {
    const user = userEvent.setup();
    render(<EmailSignup />);

    const button = screen.getByRole("button", { name: /登録ｽﾙ/ });
    await user.click(button);

    expect(screen.queryByText(/登録が完了しました/)).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("空メールでフォーム送信時に handleSubmit が呼ばれても送信されない", () => {
    render(<EmailSignup />);

    const form = screen.getByRole("button", { name: /登録ｽﾙ/ }).closest("form");
    fireEvent.submit(form!);

    expect(screen.queryByText(/登録が完了しました/)).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
