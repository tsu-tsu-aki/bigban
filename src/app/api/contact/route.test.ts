import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSend = vi.fn();

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(function () {
    return { emails: { send: mockSend } };
  }),
}));

const VALID_BODY = {
  name: "山田太郎",
  email: "taro@example.com",
  phone: "090-1234-5678",
  category: "court",
  message: "コートの予約について問い合わせます",
};

function createRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function omit(obj: Record<string, unknown>, key: string): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([k]) => k !== key));
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.RESEND_FROM = "TEST <test@example.com>";
    process.env.CONTACT_TO_EMAIL = "test-to@example.com";
  });

  it("有効な入力で201を返し、管理者通知と自動返信の2通が送信される", async () => {
    mockSend.mockResolvedValue({ data: { id: "email_123" }, error: null });

    const { POST } = await import("./route");
    const response = await POST(createRequest(VALID_BODY));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual({ success: true });
    expect(mockSend).toHaveBeenCalledTimes(2);

    // 管理者通知メール
    const adminArg = mockSend.mock.calls[0][0];
    expect(adminArg.from).toBe("TEST <test@example.com>");
    expect(adminArg.to).toBe("test-to@example.com");
    expect(adminArg.subject).toContain("山田太郎");
    expect(adminArg.text).toContain("山田太郎");
    expect(adminArg.text).toContain("taro@example.com");
    expect(adminArg.text).toContain("090-1234-5678");
    expect(adminArg.text).toContain("コート予約");
    expect(adminArg.text).toContain("コートの予約について問い合わせます");

    // 自動返信メール
    const replyArg = mockSend.mock.calls[1][0];
    expect(replyArg.from).toBe("TEST <test@example.com>");
    expect(replyArg.to).toBe("taro@example.com");
    expect(replyArg.subject).toContain("お問い合わせありがとうございます");
    expect(replyArg.html).toContain("山田太郎");
    expect(replyArg.html).toContain("コート予約");
    expect(replyArg.text).toContain("山田太郎");
  });

  it("名前なしで400を返す", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      createRequest({ ...VALID_BODY, name: "" }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("名前フィールドが存在しない場合400を返す", async () => {
    const { POST } = await import("./route");
    const response = await POST(createRequest(omit(VALID_BODY, "name")));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("無効メールで400を返す", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      createRequest({ ...VALID_BODY, email: "not-an-email" }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("メールフィールドが存在しない場合400を返す", async () => {
    const { POST } = await import("./route");
    const response = await POST(createRequest(omit(VALID_BODY, "email")));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("カテゴリなしで400を返す", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      createRequest({ ...VALID_BODY, category: "" }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("無効なカテゴリで400を返す", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      createRequest({ ...VALID_BODY, category: "invalid" }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("カテゴリフィールドが存在しない場合400を返す", async () => {
    const { POST } = await import("./route");
    const response = await POST(createRequest(omit(VALID_BODY, "category")));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("メッセージなしで400を返す", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      createRequest({ ...VALID_BODY, message: "" }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("メッセージフィールドが存在しない場合400を返す", async () => {
    const { POST } = await import("./route");
    const response = await POST(createRequest(omit(VALID_BODY, "message")));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("管理者通知失敗で500を返す", async () => {
    mockSend.mockResolvedValue({
      data: null,
      error: { message: "API error", name: "api_error" },
    });

    const { POST } = await import("./route");
    const response = await POST(createRequest(VALID_BODY));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
  });

  it("管理者通知成功・自動返信失敗でも201を返す", async () => {
    mockSend
      .mockResolvedValueOnce({ data: { id: "email_admin" }, error: null })
      .mockResolvedValueOnce({
        data: null,
        error: { message: "API error", name: "api_error" },
      });

    const { POST } = await import("./route");
    const response = await POST(createRequest(VALID_BODY));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual({ success: true });
    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it("電話番号なし（任意項目）で201を返す", async () => {
    mockSend.mockResolvedValue({ data: { id: "email_456" }, error: null });

    const { POST } = await import("./route");
    const response = await POST(createRequest(omit(VALID_BODY, "phone")));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual({ success: true });
    expect(mockSend).toHaveBeenCalledTimes(2);

    const adminArg = mockSend.mock.calls[0][0];
    expect(adminArg.text).not.toContain("090-1234-5678");
  });
});
