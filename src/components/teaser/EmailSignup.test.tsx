import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { EmailSignup } from "./EmailSignup";

describe("EmailSignup", () => {
  it("メール入力フィールドと送信ボタンが表示される", () => {
    render(<EmailSignup />);

    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /登録ｽﾙ/ })).toBeInTheDocument();
  });

  it("メール送信後に確認メッセージが表示される", async () => {
    const user = userEvent.setup();
    render(<EmailSignup />);

    const input = screen.getByPlaceholderText("your@email.com");
    const button = screen.getByRole("button", { name: /登録ｽﾙ/ });

    await user.type(input, "test@example.com");
    await user.click(button);

    expect(screen.getByText(/registered/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("your@email.com")).not.toBeInTheDocument();
  });

  it("空メールでは送信されない", async () => {
    const user = userEvent.setup();
    render(<EmailSignup />);

    const button = screen.getByRole("button", { name: /登録ｽﾙ/ });
    await user.click(button);

    expect(screen.queryByText(/registered/i)).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
  });

  it("空メールでフォーム送信時に handleSubmit が呼ばれても submitted にならない", () => {
    render(<EmailSignup />);

    const form = screen.getByRole("button", { name: /登録ｽﾙ/ }).closest("form");
    fireEvent.submit(form!);

    expect(screen.queryByText(/registered/i)).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
  });
});
