import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EmailSignup } from "./EmailSignup";

describe("EmailSignup", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("メール入力フィールドと送信ボタンが表示される", () => {
    render(<EmailSignup />);

    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /notify me/i })
    ).toBeInTheDocument();
  });

  it("空メールでは送信されない", async () => {
    const user = userEvent.setup();
    render(<EmailSignup />);

    const button = screen.getByRole("button", { name: /notify me/i });
    await user.click(button);

    expect(screen.queryByText(/registered/i)).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
  });

  it("空メールでフォーム送信時に submitted にならない", () => {
    render(<EmailSignup />);

    const form = screen
      .getByRole("button", { name: /notify me/i })
      .closest("form");
    fireEvent.submit(form!);

    expect(screen.queryByText(/registered/i)).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
  });

  it("送信成功で確認メッセージが表示される", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "contact_123" }), { status: 200 })
    );
    const user = userEvent.setup();
    render(<EmailSignup />);

    await user.type(screen.getByPlaceholderText("your@email.com"), "test@example.com");
    await user.click(screen.getByRole("button", { name: /notify me/i }));

    await waitFor(() => {
      expect(screen.getByText(/registered/i)).toBeInTheDocument();
    });
    expect(screen.queryByPlaceholderText("your@email.com")).not.toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com" }),
    });
  });

  it("送信中はボタンが無効化されローディングテキストが表示される", async () => {
    let resolveFetch: (value: Response) => void;
    vi.spyOn(global, "fetch").mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );
    const user = userEvent.setup();
    render(<EmailSignup />);

    await user.type(screen.getByPlaceholderText("your@email.com"), "test@example.com");
    await user.click(screen.getByRole("button", { name: /notify me/i }));

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeDisabled();
    });
    expect(screen.getByText(/送信中/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("your@email.com")).toBeDisabled();

    resolveFetch!(new Response(JSON.stringify({ id: "contact_123" }), { status: 200 }));

    await waitFor(() => {
      expect(screen.getByText(/registered/i)).toBeInTheDocument();
    });
  });

  it("API 400 エラーでエラーメッセージが表示されフォームが維持される", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Invalid email" }), { status: 400 })
    );
    const user = userEvent.setup();
    render(<EmailSignup />);

    await user.type(screen.getByPlaceholderText("your@email.com"), "test@example.com");
    await user.click(screen.getByRole("button", { name: /notify me/i }));

    await waitFor(() => {
      expect(screen.getByText("メールアドレスを確認してください")).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /notify me/i })).toBeEnabled();
  });

  it("API 429 エラーでレート制限メッセージが表示される", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Too many" }), { status: 429 })
    );
    const user = userEvent.setup();
    render(<EmailSignup />);

    await user.type(screen.getByPlaceholderText("your@email.com"), "test@example.com");
    await user.click(screen.getByRole("button", { name: /notify me/i }));

    await waitFor(() => {
      expect(screen.getByText("しばらくしてからお試しください")).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
  });

  it("API 500 エラーで汎用エラーメッセージが表示される", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Server error" }), { status: 500 })
    );
    const user = userEvent.setup();
    render(<EmailSignup />);

    await user.type(screen.getByPlaceholderText("your@email.com"), "test@example.com");
    await user.click(screen.getByRole("button", { name: /notify me/i }));

    await waitFor(() => {
      expect(
        screen.getByText("エラーが発生しました。もう一度お試しください")
      ).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
  });

  it("ネットワークエラーで汎用エラーメッセージが表示される", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network failure"));
    const user = userEvent.setup();
    render(<EmailSignup />);

    await user.type(screen.getByPlaceholderText("your@email.com"), "test@example.com");
    await user.click(screen.getByRole("button", { name: /notify me/i }));

    await waitFor(() => {
      expect(
        screen.getByText("エラーが発生しました。もう一度お試しください")
      ).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
  });

  it("エラー後にリトライできる", async () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Server error" }), { status: 500 })
    );
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "contact_123" }), { status: 200 })
    );
    const user = userEvent.setup();
    render(<EmailSignup />);

    await user.type(screen.getByPlaceholderText("your@email.com"), "test@example.com");
    await user.click(screen.getByRole("button", { name: /notify me/i }));

    await waitFor(() => {
      expect(
        screen.getByText("エラーが発生しました。もう一度お試しください")
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /notify me/i }));

    await waitFor(() => {
      expect(screen.getByText(/registered/i)).toBeInTheDocument();
    });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
